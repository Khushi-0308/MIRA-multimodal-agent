"""Test suite for WebSocket + ContextCore + Gemini flow."""

import json
import os
import sys
import threading
import time
import urllib.request
from unittest.mock import patch
from websockets.sync.client import connect

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import uvicorn
from backend.main import app


def run_websocket_tests():
    port = 8011
    config = uvicorn.Config(app, host="127.0.0.1", port=port, log_level="error")
    server = uvicorn.Server(config)
    thread = threading.Thread(target=server.run, daemon=True)
    thread.start()

    time.sleep(1.5)

    print("--- Starting WebSocket + ContextCore + Gemini Flow Tests ---")

    session_id = "session-mira-full-01"
    ws_url = f"ws://127.0.0.1:{port}/ws/{session_id}"

    # Test 1: Full flow - Message -> ContextCore storage -> Gemini response -> return with updated context
    with patch(
        "backend.main.generate_response",
        return_value="I am MIRA, active and tracking your context through ContextCore.",
    ):
        with connect(ws_url) as ws:
            user_msg_1 = {
                "type": "chat",
                "message": "Hello MIRA, what is your state?",
                "sender": "user",
            }
            ws.send(json.dumps(user_msg_1))
            reply_1 = json.loads(ws.recv())

            # 1. Verify Gemini response returned
            assert reply_1["response"] == "I am MIRA, active and tracking your context through ContextCore."
            assert reply_1["message"] == "I am MIRA, active and tracking your context through ContextCore."

            # 2. Verify context attached and updated
            assert "context" in reply_1
            ctx_1 = reply_1["context"]
            assert ctx_1["session_id"] == session_id

            # 3. Verify ContextCore working memory contains user message + assistant reply
            wm_1 = ctx_1["working_memory"]
            assert len(wm_1) == 2, f"Expected 2 entries in working memory, got {len(wm_1)}"
            assert wm_1[0]["message"] == "Hello MIRA, what is your state?"
            assert wm_1[0]["sender"] == "user"
            assert wm_1[1]["message"] == "I am MIRA, active and tracking your context through ContextCore."
            assert wm_1[1]["role"] == "assistant"
            print("[PASS] Test 1: WebSocket stored user message, invoked Gemini, and returned reply with updated context")

            # Test 2: Consecutive message on same connection accumulates context
            user_msg_2 = {
                "type": "chat",
                "message": "Track this second observation",
                "sender": "user",
            }
            ws.send(json.dumps(user_msg_2))
            reply_2 = json.loads(ws.recv())

            wm_2 = reply_2["context"]["working_memory"]
            assert len(wm_2) == 4, f"Expected 4 entries in working memory, got {len(wm_2)}"
            assert wm_2[2]["message"] == "Track this second observation"
            print("[PASS] Test 2: Consecutive WebSocket message accumulated in ContextCore working memory")

    # Test 3: ContextCore REST API reflects the complete conversation in working memory
    http_url = f"http://127.0.0.1:{port}/api/context/{session_id}"
    with urllib.request.urlopen(http_url) as resp:
        assert resp.status == 200
        saved_ctx = json.loads(resp.read().decode("utf-8"))
        assert saved_ctx["session_id"] == session_id
        assert len(saved_ctx["working_memory"]) == 4
        print("[PASS] Test 3: Verified GET /api/context/{session_id} reflects conversation stored via WebSocket")

    # Test 4: Graceful handling of Gemini error over WebSocket (connection does not crash)
    err_session_id = "session-mira-err-02"
    err_ws_url = f"ws://127.0.0.1:{port}/ws/{err_session_id}"

    with patch(
        "backend.main.generate_response",
        side_effect=ValueError("GEMINI_API_KEY is not configured in .env file"),
    ):
        with connect(err_ws_url) as ws_err:
            ws_err.send(json.dumps({"message": "Trigger error test"}))
            err_reply = json.loads(ws_err.recv())

            # Verify error handled gracefully and returned with context
            assert "error" in err_reply
            assert "GEMINI_API_KEY is not configured" in err_reply["error"]
            assert "context" in err_reply
            assert err_reply["context"]["session_id"] == err_session_id
            # User message is still preserved in working memory despite Gemini error
            assert len(err_reply["context"]["working_memory"]) == 1
            print("[PASS] Test 4: Handled Gemini error gracefully over WebSocket without dropping connection")

    server.should_exit = True
    print("\nAll WebSocket + ContextCore + Gemini flow tests passed successfully!")


if __name__ == "__main__":
    run_websocket_tests()
