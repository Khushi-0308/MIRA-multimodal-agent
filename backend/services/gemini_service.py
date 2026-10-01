import json
import os
import re
from pathlib import Path
from dotenv import load_dotenv
from google import genai
from google.genai import types

# Load .env file from project root or backend directory
_root_dir = Path(__file__).resolve().parent.parent.parent
_env_paths = [
    _root_dir / ".env",
    _root_dir / "backend" / ".env",
]

for _env_path in _env_paths:
    if _env_path.exists():
        load_dotenv(dotenv_path=_env_path, override=True)
        break
else:
    load_dotenv(override=True)


def get_gemini_client(api_key: str | None = None) -> genai.Client:
    """Initialize and return a Google GenAI client instance.

    Args:
        api_key: Optional API key. If omitted, reads GEMINI_API_KEY from environment/.env.

    Returns:
        genai.Client: An initialized Google GenAI client.

    Raises:
        ValueError: If GEMINI_API_KEY is not configured.
    """
    key = api_key or os.getenv("GEMINI_API_KEY")
    if not key or not key.strip():
        raise ValueError(
            "GEMINI_API_KEY is not configured. "
            "Please set GEMINI_API_KEY in your .env file or environment variables."
        )
    return genai.Client(api_key=key.strip())


def generate_response(
    message: str,
    model: str | None = None,
    client: genai.Client | None = None,
) -> str:
    """Generate a response using the Gemini model.

    Args:
        message: The user prompt or text message.
        model: Model name (defaults to GEMINI_MODEL env var or 'gemini-3.5-flash-lite').
        client: Optional pre-configured genai.Client (useful for testing and dependency injection).

    Returns:
        str: The generated text response from Gemini.

    Raises:
        ValueError: If message is empty or API key is missing.
        RuntimeError: If the API returns an empty response.
    """
    if not message or not message.strip():
        raise ValueError("Message prompt cannot be empty.")

    selected_model = model or os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite")
    ai_client = client or get_gemini_client()

    response = ai_client.models.generate_content(
        model=selected_model,
        contents=message.strip(),
    )

    if not response or not hasattr(response, "text") or response.text is None:
        raise RuntimeError("Gemini API returned an empty or invalid response.")

    return response.text


def analyze_image(
    image_bytes: bytes,
    mime_type: str = "image/jpeg",
    prompt: str | None = None,
    model: str | None = None,
    client: genai.Client | None = None,
) -> dict:
    """Analyze an image using Gemini Multimodal Vision API.

    Args:
        image_bytes: Raw binary image payload.
        mime_type: Image MIME type (e.g. image/jpeg, image/png).
        prompt: Optional user query or instruction.
        model: Model name override.
        client: Optional pre-configured genai.Client.

    Returns:
        dict: Parsed dictionary with description, detected_objects, and ocr_snippets.
    """
    if not image_bytes:
        raise ValueError("Image data cannot be empty.")

    selected_model = model or os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite")
    ai_client = client or get_gemini_client()

    system_instruction = (
        "You are MIRA's high-precision multimodal vision intelligence system. "
        "Analyze the provided image/screen/camera frame thoroughly. "
        "Respond in strict valid JSON format with the following keys:\n"
        '{\n'
        '  "description": "A clear, concise paragraph describing what is in the scene/screen, including key activities, UI components, code editor content, or physical objects.",\n'
        '  "detected_objects": [\n'
        '    {\n'
        '      "id": "box-1",\n'
        '      "label": "Short label of object or UI element",\n'
        '      "confidence": 95,\n'
        '      "box": [10, 10, 50, 50],\n'
        '      "category": "ui_element"\n'
        '    }\n'
        '  ],\n'
        '  "ocr_snippets": [\n'
        '    {\n'
        '      "id": "ocr-1",\n'
        '      "text": "Exact text visible",\n'
        '      "location": "Center Screen"\n'
        '    }\n'
        '  ]\n'
        '}\n'
        "Note: box coordinates must be normalized integers from 0 to 100 [ymin, xmin, ymax, xmax]. "
        "Provide between 2 to 6 key detected objects and 1 to 5 prominent OCR text snippets. "
        "Do NOT output markdown backticks or explanations outside the JSON."
    )

    user_query = prompt or "Analyze this visual frame and extract objects, text, and scene understanding."

    image_part = types.Part.from_bytes(
        data=image_bytes,
        mime_type=mime_type or "image/jpeg",
    )

    response = ai_client.models.generate_content(
        model=selected_model,
        contents=[
            image_part,
            f"{system_instruction}\n\nTask: {user_query}",
        ],
    )

    if not response or not hasattr(response, "text") or response.text is None:
        raise RuntimeError("Gemini Vision API returned an empty response.")

    raw_text = response.text.strip()
    cleaned = re.sub(r"^```json\s*", "", raw_text, flags=re.IGNORECASE)
    cleaned = re.sub(r"```$", "", cleaned).strip()

    try:
        parsed = json.loads(cleaned)
        if isinstance(parsed, dict) and "description" in parsed:
            if "detected_objects" not in parsed:
                parsed["detected_objects"] = []
            if "ocr_snippets" not in parsed:
                parsed["ocr_snippets"] = []
            return parsed
    except Exception:
        pass

    return {
        "description": raw_text,
        "detected_objects": [
            {
                "id": "box-1",
                "label": "Visual Focus Region",
                "confidence": 90,
                "box": [10, 10, 90, 90],
                "category": "ui_element",
            }
        ],
        "ocr_snippets": [
            {
                "id": "ocr-1",
                "text": raw_text[:80],
                "location": "Canvas Viewport",
            }
        ],
    }

