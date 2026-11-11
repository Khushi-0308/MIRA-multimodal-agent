from backend.main import build_grounded_prompt, DOCUMENT_STORE, CONTEXT_STORE
from backend.services.document_service import retrieve_relevant_chunks


def test_my_day_grounded_prompt():
    my_day_data = {
        "date_str": "Wednesday, November 11, 2026",
        "stats": {
            "total": 3,
            "completed": 1,
            "pending": 2,
            "percentage": 33,
        },
        "today_tasks": [
            {"title": "Review AI Architecture PR", "completed": True, "priority": "high", "category": "work"},
            {"title": "Prepare Hackathon Demo Video", "completed": False, "priority": "high", "category": "work", "dueTime": "5:00 PM"},
            {"title": "Evening Meditation", "completed": False, "priority": "low", "category": "health"},
        ],
        "events": [
            {"time": "10:00 AM", "title": "Team Standup", "location": "Google Meet", "type": "meeting"},
            {"time": "3:00 PM", "title": "Jury Presentation Sync", "location": "Room 4B", "type": "review"},
        ],
        "reminders": [
            {"time": "4:30 PM", "title": "Submit Demo Link", "urgent": True, "repeat": "once"},
        ],
        "reflections": [
            {"dateStr": "Today", "mood": "🤩", "moodLabel": "Super Energetic", "text": "Feeling confident about the MIRA showcase!"},
        ],
    }

    prompt = build_grounded_prompt(
        user_message="What tasks do I have left today?",
        session_id="test-session-1",
        my_day_context=my_day_data,
    )

    assert "Prepare Hackathon Demo Video" in prompt
    assert "Review AI Architecture PR" in prompt
    assert "Jury Presentation Sync" in prompt
    assert "Submit Demo Link" in prompt
    assert "Task Progress: 1/3 tasks completed" in prompt
    assert "LIVE SCHEDULE, TASKS & MY DAY PLANNER" in prompt


def test_document_rag_retrieval_and_prompt():
    sample_docs = [
        {
            "document_id": "doc-ml-spec",
            "filename": "Neural_Network_Spec.txt",
            "summary": "Technical specification of multi-head self-attention transformers.",
            "chunks": [
                {
                    "chunk_id": "c1",
                    "index": 1,
                    "content": "The attention mechanism computes query-key dot products scaled by square root of head dimension.",
                },
                {
                    "chunk_id": "c2",
                    "index": 2,
                    "content": "Positional encodings are added to token embeddings using sinusoidal frequencies.",
                },
            ],
            "token_count": 250,
        }
    ]

    # Test chunk retrieval
    chunks = retrieve_relevant_chunks("How does attention compute dot products?", sample_docs)
    assert len(chunks) > 0
    assert "attention mechanism computes query-key dot products" in chunks[0]["content"]

    # Test grounded prompt with document
    prompt = build_grounded_prompt(
        user_message="Explain the transformer attention calculation",
        session_id="test-session-2",
        client_documents=sample_docs,
    )

    assert "Neural_Network_Spec.txt" in prompt
    assert "attention mechanism computes query-key dot products" in prompt
    assert "RETRIEVED DOCUMENT KNOWLEDGE (RAG & NLP)" in prompt
