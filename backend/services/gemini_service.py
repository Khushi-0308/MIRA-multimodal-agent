"""Gemini LLM Service for MIRA Multimodal Agent."""

import os
from pathlib import Path
from dotenv import load_dotenv
from google import genai

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
        model: Model name (defaults to GEMINI_MODEL env var or 'gemini-2.5-flash').
        client: Optional pre-configured genai.Client (useful for testing and dependency injection).

    Returns:
        str: The generated text response from Gemini.

    Raises:
        ValueError: If message is empty or API key is missing.
        RuntimeError: If the API returns an empty response.
    """
    if not message or not message.strip():
        raise ValueError("Message prompt cannot be empty.")

    selected_model = model or os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    ai_client = client or get_gemini_client()

    response = ai_client.models.generate_content(
        model=selected_model,
        contents=message.strip(),
    )

    if not response or not hasattr(response, "text") or response.text is None:
        raise RuntimeError("Gemini API returned an empty or invalid response.")

    return response.text
