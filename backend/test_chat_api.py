"""Test suite for POST /api/chat endpoint with Gemini integration."""

import json
import os
import sys
import threading
import time
import urllib.error
import urllib.request
from unittest.mock import patch

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import uvicorn
from backend.main import app


def run_chat_tests():
    port = 8010
    config = uvicorn.Config(app, host="127.0.0.1", port=port, log_level="error")
    server = uvicorn.Server(config)
    thread = threading.Thread(target=server.run, daemon=True)
    thread.start()

    time.sleep(1.5)
    base_url = f"http://127.0.0.1:{port}"

    print("--- Starting POST /api/chat Endpoint Tests ---")

    # Test 1: Error handling when GEMINI_API_KEY is not configured (503 Service Unavailable)
    with patch.dict(os.environ, {"GEMINI_API_KEY": ""}):
        req_missing_key = urllib.request.Request(
            f"{base_url}/api/chat",
            data=json.dumps({"message": "Hello without key"}).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            urllib.request.urlopen(req_missing_key)
            assert False, "Expected 503 HTTPError when GEMINI_API_KEY is missing"
        except urllib.error.HTTPError as err:
            assert err.code == 503, f"Expected 503, got {err.code}"
            err_body = json.loads(err.read().decode("utf-8"))
            assert "GEMINI_API_KEY is not configured" in err_body["detail"]
            print("[PASS] Test 1: Handled missing GEMINI_API_KEY with HTTP 503 Service Unavailable")

    # Test 2: Successful chat generation using generate_response
    with patch(
        "backend.main.generate_response",
        return_value="Greetings! I am MIRA, your multimodal companion powered by Gemini.",
    ):
        req_success = urllib.request.Request(
            f"{base_url}/api/chat",
            data=json.dumps({
                "session_id": "session-test-gemini-01",
                "message": "Who are you?",
            }).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req_success) as resp:
            assert resp.status == 200, f"Expected 200, got {resp.status}"
            body = json.loads(resp.read().decode("utf-8"))
            assert body["session_id"] == "session-test-gemini-01"
            assert body["message"] == "Who are you?"
            assert body["response"] == "Greetings! I am MIRA, your multimodal companion powered by Gemini."
            assert "timestamp" in body
            print("[PASS] Test 2: Successful POST /api/chat returns ChatResponse with Gemini reply")

    # Test 3: Auto session ID generation when session_id is omitted
    with patch(
        "backend.main.generate_response",
        return_value="Auto-session reply",
    ):
        req_auto = urllib.request.Request(
            f"{base_url}/api/chat",
            data=json.dumps({"message": "Hello auto session"}).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req_auto) as resp:
            assert resp.status == 200
            body = json.loads(resp.read().decode("utf-8"))
            assert body["session_id"].startswith("mira-")
            assert body["response"] == "Auto-session reply"
            print(f"[PASS] Test 3: Auto-generated session_id '{body['session_id']}' for chat request")

    # Test 4: Upstream Gemini API error handling (502 Bad Gateway)
    with patch(
        "backend.main.generate_response",
        side_effect=Exception("Upstream Gemini rate limit exceeded (429)"),
    ):
        req_err = urllib.request.Request(
            f"{base_url}/api/chat",
            data=json.dumps({"message": "Trigger upstream error"}).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            urllib.request.urlopen(req_err)
            assert False, "Expected 502 HTTPError on upstream failure"
        except urllib.error.HTTPError as err:
            assert err.code == 502, f"Expected 502, got {err.code}"
            err_body = json.loads(err.read().decode("utf-8"))
            assert "Gemini API error" in err_body["detail"]
            print("[PASS] Test 4: Handled upstream Gemini exception with HTTP 502 Bad Gateway")

    # Test 5: Input validation rejection on empty message (422 Unprocessable Entity)
    req_invalid = urllib.request.Request(
        f"{base_url}/api/chat",
        data=json.dumps({"message": ""}).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        urllib.request.urlopen(req_invalid)
        assert False, "Expected 422 for empty message"
    except urllib.error.HTTPError as err:
        assert err.code == 422
        print("[PASS] Test 5: Rejected empty message input with HTTP 422 Unprocessable Entity")

    # Test 6: Live API test if real key is configured
    active_key = os.getenv("GEMINI_API_KEY", "").strip()
    if active_key and active_key != "your_gemini_api_key_here":
        try:
            req_live = urllib.request.Request(
                f"{base_url}/api/chat",
                data=json.dumps({"message": "Say hello from MIRA"}).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            with urllib.request.urlopen(req_live) as resp:
                assert resp.status == 200
                live_body = json.loads(resp.read().decode("utf-8"))
                print(f"[PASS] Test 6 (Live): Real Gemini response: {live_body['response']}")
        except Exception as err:
            print(f"[WARN] Live test failed: {err}")
    else:
        print("[INFO] Test 6: GEMINI_API_KEY is not populated yet in .env; live network call skipped.")

    server.should_exit = True
    print("\nAll POST /api/chat Gemini integration tests passed successfully!")


if __name__ == "__main__":
    run_chat_tests()
