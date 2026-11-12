"""
Test: GET /api/health endpoint returns expected structure and corpus counts.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_status_ok():
    response = client.get("/api/health")
    assert response.status_code == 200


def test_health_response_fields():
    response = client.get("/api/health")
    data = response.json()
    assert data["status"] == "ok"
    assert data["corpus_loaded"] is True


def test_health_document_count():
    response = client.get("/api/health")
    data = response.json()
    assert data["document_count"] == 10, (
        f"Expected 10 documents, got {data['document_count']}"
    )


def test_health_passage_count():
    response = client.get("/api/health")
    data = response.json()
    # 48 passages defined in Phase 2 corpus
    assert data["passage_count"] == 48, (
        f"Expected 48 passages, got {data['passage_count']}"
    )


def test_health_model_reported():
    response = client.get("/api/health")
    data = response.json()
    assert "model" in data
    assert len(data["model"]) > 0
