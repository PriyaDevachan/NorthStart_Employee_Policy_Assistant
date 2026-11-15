"""
FastAPI application — Northstar Policy Knowledge Assistant (Baseline).

Endpoints:
  GET  /api/health   — corpus and model status
  POST /api/ask      — policy question answering

The Groq API key is NEVER returned in any response, trace, or log.
The app serves the React frontend from frontend/dist when built.
"""
from __future__ import annotations
import time
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.config import GROQ_MODEL, TOP_K
from app.models import AskRequest, AskResponse, HealthResponse, RetrievedPassage
from app.corpus import get_corpus
from app.retriever import get_retriever
from app.groq_client import call_groq
from app.validator import extract_cited_ids, verify_citations
from app.logger import log_trace, new_trace_id

app = FastAPI(
    title="Northstar Policy Knowledge Assistant",
    description="RAG-based policy assistant for Northstar Services employees.",
    version="1.0.0-baseline",
)

# Allow React dev server to call the API during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event() -> None:
    """Pre-load corpus and retriever at startup."""
    get_corpus()
    get_retriever()


@app.get("/api/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    """Health probe — confirms corpus is loaded and reports document/passage counts."""
    corpus = get_corpus()
    return HealthResponse(
        status="ok",
        corpus_loaded=True,
        document_count=len(corpus.documents),
        passage_count=len(corpus.passages),
        model=GROQ_MODEL,
        release="baseline",
    )


@app.post("/api/ask", response_model=AskResponse)
async def ask(req: AskRequest) -> AskResponse:
    """
    Policy question answering endpoint.

    1. Retrieve top-k passages using BM25.
    2. Apply authority filtering (candidate release only).
    3. Call Groq LLM with retrieved passages + question.
    4. Verify citations server-side.
    5. Log trace to JSONL.
    6. Return structured response.
    """
    start_ms = time.time()
    trace_id = new_trace_id()

    retriever = get_retriever()
    corpus = get_corpus()

    # Step 1: BM25 retrieval (+ authority filtering in candidate)
    retrieved = retriever.retrieve(
        query=req.question,
        top_k=TOP_K,
        as_of=req.as_of,
        department=req.department,
        release=req.release,
    )

    # Step 2: LLM call
    decision, answer, model_citations, error = call_groq(
        question=req.question,
        retrieved_passages=retrieved,
        department=req.department,
        as_of=req.as_of,
    )

    # Step 3: Extract inline [ID] citations from answer text
    inline_ids = extract_cited_ids(answer)
    all_cited = list(dict.fromkeys(model_citations + inline_ids))  # deduplicated, ordered

    # Step 4: Verify citations against retrieved passages
    valid_citations, invalid_citations = verify_citations(all_cited, retrieved)

    elapsed_ms = int((time.time() - start_ms) * 1000)

    # Step 5: Log trace (never log API key)
    log_trace(
        trace_id=trace_id,
        question=req.question,
        department=req.department,
        as_of=req.as_of,
        release=req.release,
        retrieved_passages=retrieved,
        decision=decision,
        answer=answer,
        citations=valid_citations,
        invalid_citations=invalid_citations,
        model=GROQ_MODEL,
        elapsed_ms=elapsed_ms,
        error=error or None,
    )

    # Step 6: Build response passages (never include API key)
    response_passages = [
        RetrievedPassage(
            rank=p.rank,
            score=p.score,
            passage_id=p.passage_id,
            doc_id=p.doc_id,
            title=p.title,
            text=p.text,
            status=p.status,
            effective_start=p.effective_start,
            effective_end=p.effective_end,
            department=p.department,
            authority_level=p.authority_level,
        )
        for p in retrieved
    ]

    return AskResponse(
        release=req.release,
        decision=decision,
        answer=answer,
        citations=valid_citations,
        retrieved_passages=response_passages,
        model=GROQ_MODEL,
        trace_id=trace_id,
        elapsed_ms=elapsed_ms,
        error=error or None,
    )


# Serve React frontend from frontend/dist (production build)
_frontend_dist = Path(__file__).parent.parent / "frontend" / "dist"
if _frontend_dist.exists():
    app.mount("/", StaticFiles(directory=str(_frontend_dist), html=True), name="frontend")
