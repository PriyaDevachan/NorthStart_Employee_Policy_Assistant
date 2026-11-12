"""
Pydantic request and response models for the Northstar Policy Knowledge Assistant API.
"""
from __future__ import annotations
from typing import Optional, List
from pydantic import BaseModel, Field


class AskRequest(BaseModel):
    question: str = Field(..., min_length=1, description="The employee policy question.")
    department: Optional[str] = Field(None, description="Employee's department (e.g. 'Support Operations').")
    as_of: Optional[str] = Field(None, description="ISO date string YYYY-MM-DD for policy date resolution.")
    release: str = Field("baseline", description="Release version: 'baseline' or 'candidate'.")


class RetrievedPassage(BaseModel):
    passage_id: str
    doc_id: str
    title: str
    text: str
    status: str           # current | archived | informational
    effective_start: Optional[str]
    effective_end: Optional[str]
    department: Optional[str]
    authority_level: Optional[str]  # None | faq | informational_only


class AskResponse(BaseModel):
    release: str
    decision: str          # answer | clarify | abstain | conflict
    answer: str
    citations: List[str]   # passage IDs that were cited and verified
    retrieved_passages: List[RetrievedPassage]
    model: str
    trace_id: str
    elapsed_ms: int
    error: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    corpus_loaded: bool
    document_count: int
    passage_count: int
    model: str
    release: str
