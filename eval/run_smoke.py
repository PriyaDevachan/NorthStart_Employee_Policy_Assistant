"""
Smoke test runner for Day 2 baseline evaluation.
Executes the remaining smoke cases (S2, S4, S6) against the local API.
"""
import json
import httpx
import sys

URL = "http://127.0.0.1:8001/api/ask"

smoke_cases = [
    {
        "id": "S2",
        "question": "What was the learning-leave allowance in 2025?",
        "department": None,
        "as_of": "2025-06-01",
        "release": "baseline"
    },
    {
        "id": "S4",
        "question": "How many remote days can I work?",
        "department": None,
        "as_of": "2026-04-15",
        "release": "baseline"
    },
    {
        "id": "S6",
        "question": "How many days of parental leave do I get?",
        "department": None,
        "as_of": "2026-04-15",
        "release": "baseline"
    }
]

print("--- Running Remaining Smoke Cases (S2, S4, S6) ---")
for case in smoke_cases:
    cid = case["id"]
    q = case["question"]
    print(f"\n[{cid}] Asking: '{q}'...")
    try:
        resp = httpx.post(URL, json=case, timeout=30.0)
        if resp.status_code == 200:
            data = resp.json()
            print(f"  Decision: {data['decision']}")
            print(f"  Answer:   {data['answer']}")
            print(f"  Citations: {data['citations']}")
            print(f"  Elapsed:  {data['elapsed_ms']} ms")
        else:
            print(f"  ERROR: HTTP {resp.status_code}")
    except Exception as e:
        print(f"  Failed: {e}")

print("\n--- Smoke Run Completed ---")
