"""
Configuration — loads GROQ_API_KEY and GROQ_MODEL from .env server-side only.
The API key is NEVER exposed to frontend responses, logs, or trace records.
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load from project root .env
_root = Path(__file__).parent.parent
load_dotenv(_root / ".env")

GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL: str = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")

POLICIES_DIR: Path = _root / "policies"
MANIFEST_PATH: Path = _root / "manifest.json"
TRACES_PATH: Path = _root / "eval" / "raw_runs.jsonl"

# BM25 retrieval top-k
TOP_K: int = 5

if not GROQ_API_KEY:
    import warnings
    warnings.warn("GROQ_API_KEY is not set. Model calls will fail.", stacklevel=2)
