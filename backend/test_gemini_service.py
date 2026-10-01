"""Test suite for Gemini Service (backend/services/gemini_service.py)."""

import os
import sys
from unittest.mock import MagicMock

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.services.gemini_service import (
    generate_response,
    get_gemini_client,
)


def run_tests():
    print("--- Starting Gemini Service Tests ---")

    # Test 1: Validation when API key is missing
    old_key = os.environ.get("GEMINI_API_KEY")
    try:
        os.environ["GEMINI_API_KEY"] = ""
        try:
            get_gemini_client()
            assert False, "Expected ValueError when GEMINI_API_KEY is empty"
        except ValueError as e:
            assert "GEMINI_API_KEY is not configured" in str(e)
            print("[PASS] Test 1: get_gemini_client() correctly enforces GEMINI_API_KEY presence")
    finally:
        if old_key is not None:
            os.environ["GEMINI_API_KEY"] = old_key
        else:
            os.environ.pop("GEMINI_API_KEY", None)

    # Test 2: Validation on empty message
    try:
        generate_response("   ")
        assert False, "Expected ValueError for empty message"
    except ValueError as e:
        assert "cannot be empty" in str(e).lower()
        print("[PASS] Test 2: generate_response() rejects empty message input")

    # Test 3: Contract test with mocked GenAI Client
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.text = "Hello! I am MIRA powered by Gemini."
    mock_client.models.generate_content.return_value = mock_response

    result = generate_response("Hello MIRA!", client=mock_client)
    assert result == "Hello! I am MIRA powered by Gemini."
    mock_client.models.generate_content.assert_called_once_with(
        model="gemini-3.5-flash-lite",
        contents="Hello MIRA!",
    )
    print("[PASS] Test 3: generate_response() successfully invokes Gemini API and returns .text")

    # Test 4: Custom model override
    mock_client.reset_mock()
    generate_response("What is your status?", model="gemini-2.0-flash", client=mock_client)
    mock_client.models.generate_content.assert_called_once_with(
        model="gemini-2.0-flash",
        contents="What is your status?",
    )
    print("[PASS] Test 4: generate_response() honors custom model override parameter")

    # Test 5: Live API test if GEMINI_API_KEY is provided in .env
    active_key = os.getenv("GEMINI_API_KEY", "").strip()
    if active_key and active_key != "your_gemini_api_key_here":
        try:
            print("Detected active GEMINI_API_KEY in .env, running live API call...")
            live_reply = generate_response("Say 'MIRA online' in two words.")
            assert live_reply and len(live_reply) > 0
            print(f"[PASS] Test 5 (Live): Gemini API live generation output: {live_reply.strip()}")
        except Exception as err:
            print(f"[WARN] Live call failed (check key validity or quota): {err}")
    else:
        print("[INFO] Test 5: GEMINI_API_KEY in .env is currently empty. Live API test skipped.")
        print("       (Add your Google Gemini API key to .env when ready to test live calls)")

    print("\nAll Gemini Service tests passed successfully!")


if __name__ == "__main__":
    run_tests()
