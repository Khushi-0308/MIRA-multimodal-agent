"""Tests for MIRA ContextCore Endpoints (GET and POST /api/context)."""

import json
import os
import sys
import threading
import time
import urllib.error
import urllib.request
import uvicorn

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.main import app



def run_tests():
    config = uvicorn.Config(app, host="127.0.0.1", port=8008, log_level="error")
    server = uvicorn.Server(config)
    thread = threading.Thread(target=server.run, daemon=True)
    thread.start()

    # Wait for uvicorn to bind
    time.sleep(1.5)

    base_url = "http://127.0.0.1:8008"

    print("--- Starting ContextCore API Endpoint Tests ---")

    # 1. Test POST /api/context with explicit session_id
    payload_1 = {
        "session_id": "session-test-42",
        "working_memory_summary": "MIRA active tracking session with user.",
        "modalities": {
            "vision": {"active": True, "health": "optimal", "fps": 30},
            "audio": {"active": True, "health": "optimal"},
        },
        "active_anchors": [
            {
                "id": "anchor-ui",
                "modality": "vision",
                "title": "Camera Overlay",
                "isPinned": True,
            }
        ],
        "token_budget": {
            "totalCapacity": 128000,
            "usedTokens": 24000,
        },
        "environment": {
            "os": "Windows",
            "browser": "Chrome",
        },
    }

    req_1 = urllib.request.Request(
        f"{base_url}/api/context",
        data=json.dumps(payload_1).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    with urllib.request.urlopen(req_1) as resp:
        assert resp.status == 200, f"Expected 200, got {resp.status}"
        body_1 = json.loads(resp.read().decode("utf-8"))
        assert body_1["session_id"] == "session-test-42"
        assert body_1["working_memory_summary"] == payload_1["working_memory_summary"]
        assert len(body_1["active_anchors"]) == 1
        assert "created_at" in body_1
        assert "updated_at" in body_1
        print("[PASS] Test 1: POST /api/context with explicit session_id")

    # 2. Test GET /api/context/{session_id}
    with urllib.request.urlopen(f"{base_url}/api/context/session-test-42") as resp:
        assert resp.status == 200
        body_2 = json.loads(resp.read().decode("utf-8"))
        assert body_2["session_id"] == "session-test-42"
        assert body_2["modalities"]["vision"]["active"] is True
        assert body_2["token_budget"]["totalCapacity"] == 128000
        assert body_2["active_anchors"][0]["title"] == "Camera Overlay"
        print("[PASS] Test 2: GET /api/context/{session_id} successfully retrieved session state")

    # 3. Test POST /api/context with auto-generated session_id (session_id omitted)
    req_3 = urllib.request.Request(
        f"{base_url}/api/context",
        data=json.dumps({"working_memory_summary": "Auto session test"}).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    with urllib.request.urlopen(req_3) as resp:
        assert resp.status == 200
        body_3 = json.loads(resp.read().decode("utf-8"))
        auto_session_id = body_3["session_id"]
        assert auto_session_id.startswith("mira-")
        print(f"[PASS] Test 3: POST /api/context auto-generated session_id '{auto_session_id}'")

    # 4. Test GET /api/context/{session_id} for auto-generated session
    with urllib.request.urlopen(f"{base_url}/api/context/{auto_session_id}") as resp:
        assert resp.status == 200
        body_4 = json.loads(resp.read().decode("utf-8"))
        assert body_4["session_id"] == auto_session_id
        assert body_4["working_memory_summary"] == "Auto session test"
        print("[PASS] Test 4: GET /api/context/{session_id} retrieved auto-generated session")

    # 5. Test GET /api/context/{session_id} with non-existent session_id -> Expect 404
    try:
        urllib.request.urlopen(f"{base_url}/api/context/nonexistent-session-000")
        assert False, "Expected 404 HTTPError, but request succeeded"
    except urllib.error.HTTPError as err:
        assert err.code == 404
        error_body = json.loads(err.read().decode("utf-8"))
        assert "not found" in error_body["detail"].lower()
        print("[PASS] Test 5: GET /api/context/{session_id} with invalid ID returns 404 Not Found")

    # 6. Test POST /api/context update/merge existing session
    req_6 = urllib.request.Request(
        f"{base_url}/api/context",
        data=json.dumps({
            "session_id": "session-test-42",
            "working_memory_summary": "Updated working memory after action execution.",
        }).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    with urllib.request.urlopen(req_6) as resp:
        assert resp.status == 200
        body_6 = json.loads(resp.read().decode("utf-8"))
        assert body_6["working_memory_summary"] == "Updated working memory after action execution."
        # Existing anchors preserved
        assert len(body_6["active_anchors"]) == 1
        print("[PASS] Test 6: POST /api/context updates session state while preserving anchors")

    server.should_exit = True
    print("\nAll ContextCore API tests passed successfully!")


if __name__ == "__main__":
    run_tests()
