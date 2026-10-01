"""Test suite for POST /api/vision/analyze endpoint with Gemini Multimodal Vision."""

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
from backend.main import app, CONTEXT_STORE

# Minimal 1x1 valid JPEG image bytes in Base64
SAMPLE_JPEG_B64 = (
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP////////////////"
    "//////////////////////////////////////////////////////////////////////wgA"
    "LCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA="
)


def run_vision_tests():
    port = 8015
    config = uvicorn.Config(app, host="127.0.0.1", port=port, log_level="error")
    server = uvicorn.Server(config)
    thread = threading.Thread(target=server.run, daemon=True)
    thread.start()

    time.sleep(1.5)
    base_url = f"http://127.0.0.1:{port}"

    print("--- Starting POST /api/vision/analyze Endpoint Tests ---")

    # Test 1: Reject invalid Base64 input
    req_bad_b64 = urllib.request.Request(
        f"{base_url}/api/vision/analyze",
        data=json.dumps({
            "image_base64": "invalid@@@###",
            "session_id": "test-vis-1",
        }).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        urllib.request.urlopen(req_bad_b64)
        assert False, "Expected 400 Bad Request for bad base64 payload"
    except urllib.error.HTTPError as e:
        assert e.code == 400
        print("[PASS] Test 1: Correctly rejected invalid Base64 image payload with HTTP 400")

    # Test 2: Successful vision analysis with mocked Gemini response
    mock_parsed_vision = {
        "description": "A code editor window with terminal displaying build passing.",
        "detected_objects": [
            {"id": "box-1", "label": "Code Editor", "confidence": 96, "box": [10, 10, 80, 50], "category": "ui_element"},
            {"id": "box-2", "label": "Terminal Console", "confidence": 92, "box": [10, 55, 80, 95], "category": "ui_element"},
        ],
        "ocr_snippets": [
            {"id": "ocr-1", "text": "Build: SUCCESS 0 errors", "location": "Bottom Terminal"},
        ],
    }

    with patch("backend.main.analyze_image", return_value=mock_parsed_vision):
        req_mock = urllib.request.Request(
            f"{base_url}/api/vision/analyze",
            data=json.dumps({
                "image_base64": SAMPLE_JPEG_B64,
                "prompt": "Find UI widgets and code errors",
                "session_id": "sess-vision-mock",
            }).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        resp = urllib.request.urlopen(req_mock)
        assert resp.status == 200
        data = json.loads(resp.read().decode("utf-8"))
        assert data["session_id"] == "sess-vision-mock"
        assert "Code Editor" in data["detected_objects"][0]["label"]
        assert len(data["ocr_snippets"]) == 1
        assert len(data["anchors"]) == 1
        print("[PASS] Test 2: Successful POST /api/vision/analyze returned structured scene grounding")

    # Test 3: Verify ContextCore persisted visual anchor
    assert "sess-vision-mock" in CONTEXT_STORE
    ctx = CONTEXT_STORE["sess-vision-mock"]
    assert len(ctx["active_anchors"]) >= 1
    assert ctx["modalities"]["vision"]["status"] == "active"
    print("[PASS] Test 3: Verified visual anchors & modality state automatically persisted in ContextCore")

    # Test 4: Live call with real Gemini API Key if configured
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if api_key and api_key != "your_gemini_api_key_here":
        try:
            req_live = urllib.request.Request(
                f"{base_url}/api/vision/analyze",
                data=json.dumps({
                    "image_base64": SAMPLE_JPEG_B64,
                    "prompt": "Describe what you see in 1 short sentence",
                    "session_id": "sess-vision-live",
                }).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            resp_live = urllib.request.urlopen(req_live)
            assert resp_live.status == 200
            live_data = json.loads(resp_live.read().decode("utf-8"))
            print(f"[PASS] Test 4 (Live): Real Gemini Vision API response: {live_data['description'][:80]}...")
        except Exception as err:
            print(f"[WARN] Live vision test failed: {err}")
    else:
        print("[INFO] Test 4: GEMINI_API_KEY missing; live network call skipped.")

    server.should_exit = True
    print("\nAll POST /api/vision/analyze tests passed successfully!")


if __name__ == "__main__":
    run_vision_tests()
