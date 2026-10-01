"""Automated End-to-End Tests for MIRA Document Ingestion, RAG, and Action Execution Engine."""

import io
import sys
import unittest
from fastapi.testclient import TestClient
from backend.main import app, CONTEXT_STORE, DOCUMENT_STORE


class TestMiraDocumentAndActionApi(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.session_id = "test-doc-action-session"
        CONTEXT_STORE.clear()
        DOCUMENT_STORE.clear()

    def test_document_upload_and_chunking(self):
        """Test plain text document upload, extraction, and chunking into ContextCore."""
        doc_content = (
            "Project MIRA Architecture Overview.\n\n"
            "MIRA is a Multimodal Intelligent Real-time Assistant featuring a continuous sensory loop: "
            "HEARS, SEES, UNDERSTANDS, REASONS, ACTS, and VERIFIES.\n\n"
            "Security Protocol Alpha: All cluster administrative actions require Human-In-The-Loop approval "
            "with a safety verification score threshold of 95%."
        )
        file_bytes = io.BytesIO(doc_content.encode("utf-8"))

        response = self.client.post(
            "/api/documents/upload",
            data={"session_id": self.session_id},
            files={"file": ("project_mira_spec.txt", file_bytes, "text/plain")},
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["filename"], "project_mira_spec.txt")
        self.assertGreater(data["token_count"], 0)
        self.assertGreater(data["chunks_count"], 0)
        self.assertIn("MIRA", data["content_snippet"])

        # Verify stored in DOCUMENT_STORE and CONTEXT_STORE
        self.assertIn(self.session_id, DOCUMENT_STORE)
        self.assertEqual(len(DOCUMENT_STORE[self.session_id]), 1)

        ctx_res = self.client.get(f"/api/context/{self.session_id}")
        self.assertEqual(ctx_res.status_code, 200)
        ctx_data = ctx_res.json()
        self.assertTrue(any(a.get("modality") == "documents" for a in ctx_data.get("active_anchors", [])))

    def test_document_retrieval_and_deletion(self):
        """Test listing and deleting documents."""
        file_bytes = io.BytesIO(b"Sample document text content.")
        up_res = self.client.post(
            "/api/documents/upload",
            data={"session_id": self.session_id},
            files={"file": ("test.txt", file_bytes, "text/plain")},
        )
        doc_id = up_res.json()["document_id"]

        # List
        list_res = self.client.get(f"/api/documents/{self.session_id}")
        self.assertEqual(list_res.status_code, 200)
        self.assertEqual(list_res.json()["count"], 1)

        # Delete
        del_res = self.client.delete(f"/api/documents/{self.session_id}/{doc_id}")
        self.assertEqual(del_res.status_code, 200)
        self.assertEqual(del_res.json()["status"], "deleted")

        # Verify empty
        list_res2 = self.client.get(f"/api/documents/{self.session_id}")
        self.assertEqual(list_res2.json()["count"], 0)

    def test_action_execution_python_sandbox(self):
        """Test executing Python code in safe sandbox with output and verification score."""
        payload = {
            "action_id": "act-test-01",
            "tool_name": "python_sandbox",
            "parameters": {
                "code": "a = 25\nb = 4\nprint(f'Computed value: {a * b}')"
            },
            "session_id": self.session_id,
        }
        res = self.client.post("/api/actions/execute", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "success")
        self.assertIn("Computed value: 100", data["output"])
        self.assertGreaterEqual(data["verification_score"], 90.0)

    def test_action_execution_system_diagnostics(self):
        """Test system telemetry tool execution."""
        payload = {
            "action_id": "act-test-02",
            "tool_name": "system_diagnostic",
            "parameters": {},
            "session_id": self.session_id,
        }
        res = self.client.post("/api/actions/execute", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "success")
        self.assertIn("CPU Utilization", data["output"])
        self.assertGreaterEqual(data["verification_score"], 90.0)


if __name__ == "__main__":
    unittest.main()
