"""Document Ingestion, Parsing and Semantic RAG Service for MIRA Multimodal Agent."""

import io
import math
import re
from typing import Any, Dict, List
import docx
import pypdf


def extract_text_from_file(filename: str, file_bytes: bytes) -> str:
    """Extract raw plain text from supported document types."""
    ext = filename.lower().split('.')[-1] if '.' in filename else ''

    if ext == 'pdf':
        try:
            reader = pypdf.PdfReader(io.BytesIO(file_bytes))
            text_pages = [page.extract_text() or '' for page in reader.pages]
            full_text = '\n\n'.join(t.strip() for t in text_pages if t.strip())
            return full_text if full_text else 'PDF contained no selectable text.'
        except Exception as err:
            return f'Error extracting PDF: {str(err)}'

    elif ext in ('docx', 'doc'):
        try:
            doc = docx.Document(io.BytesIO(file_bytes))
            paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
            for table in doc.tables:
                for row in table.rows:
                    row_text = ' | '.join(c.text.strip() for c in row.cells if c.text.strip())
                    if row_text:
                        paragraphs.append(row_text)
            return '\n\n'.join(paragraphs) if paragraphs else 'DOCX document is empty.'
        except Exception as err:
            return f'Error extracting DOCX: {str(err)}'

    else:
        for encoding in ('utf-8', 'latin-1', 'cp1252'):
            try:
                return file_bytes.decode(encoding).strip()
            except UnicodeDecodeError:
                continue
        return file_bytes.decode('utf-8', errors='ignore').strip()


def chunk_document_text(text: str, chunk_size: int = 400, overlap: int = 50) -> List[Dict[str, Any]]:
    """Split document text into semantic chunks with token weights and overlap."""
    if not text or not text.strip():
        return []

    words = text.split()
    if not words:
        return []

    chunks = []
    chunk_index = 1
    step = max(1, chunk_size - overlap)

    for i in range(0, len(words), step):
        chunk_words = words[i : i + chunk_size]
        chunk_content = ' '.join(chunk_words)
        est_tokens = max(1, math.ceil(len(chunk_content) / 4))

        chunks.append({
            'chunk_id': f'chunk-{chunk_index}',
            'index': chunk_index,
            'word_count': len(chunk_words),
            'token_weight': est_tokens,
            'content': chunk_content,
        })
        chunk_index += 1

    return chunks


def estimate_token_count(text: str) -> int:
    """Estimate token count for context budgeting (approx 4 chars per token)."""
    if not text:
        return 0
    return max(1, math.ceil(len(text.strip()) / 4))


def clean_query_tokens(query: str) -> List[str]:
    """Extract normalized search keywords from a user query for NLP matching."""
    if not query:
        return []
    cleaned = re.sub(r"[^\w\s]", " ", query.lower())
    stopwords = {
        "a", "an", "the", "in", "on", "at", "to", "for", "of", "and", "or", "is",
        "are", "was", "were", "be", "been", "this", "that", "it", "with", "as",
        "by", "from", "about", "what", "which", "who", "whom", "how", "why",
        "can", "could", "would", "should", "do", "does", "did", "have", "has",
        "had", "i", "you", "my", "your", "me", "tell", "show", "give", "please",
    }
    tokens = [t.strip() for t in cleaned.split() if t.strip() and t.strip() not in stopwords]
    return tokens


def retrieve_relevant_chunks(
    query: str,
    documents: List[Dict[str, Any]],
    top_k: int = 6,
    max_chars: int = 2500,
) -> List[Dict[str, Any]]:
    """Retrieve the most semantically relevant document chunks using NLP keyword relevance and phrase matching.

    Scores chunks based on:
    - Keyword term frequency overlap.
    - Exact multi-word phrase matching.
    - Document title and filename matching.
    - Chunk position / key overview bonuses.
    """
    if not documents:
        return []

    tokens = clean_query_tokens(query)
    q_lower = query.lower().strip()
    is_general_query = not tokens or any(
        term in q_lower for term in (
            "all documents", "summarize documents", "what files", "what documents",
            "list files", "overview of doc", "my documents", "uploaded documents"
        )
    )

    scored_chunks: List[Dict[str, Any]] = []

    for doc in documents:
        filename = doc.get("filename", "Untitled Document")
        doc_summary = doc.get("summary", "")
        chunks = doc.get("chunks", [])

        # If document has no explicit chunks, generate fallback chunk from full_text or snippet
        if not chunks:
            text = doc.get("full_text") or doc.get("content_snippet") or doc_summary
            if text:
                chunks = [{
                    "chunk_id": f"{doc.get('document_id', 'doc')}-fallback",
                    "index": 1,
                    "word_count": len(text.split()),
                    "token_weight": estimate_token_count(text),
                    "content": text[:2000],
                }]

        # Check if query specifically mentions this filename
        doc_name_clean = filename.lower()
        doc_boost = 5.0 if any(t in doc_name_clean for t in tokens if len(t) > 2) else 1.0

        for chunk in chunks:
            content = chunk.get("content", "")
            if not content:
                continue

            content_lower = content.lower()
            score = 0.0

            if is_general_query:
                # In a general query, prioritize the first chunks and document overview
                score = 10.0 / (chunk.get("index", 1))
            else:
                # 1. Exact phrase match bonus
                if len(q_lower) > 5 and q_lower in content_lower:
                    score += 25.0

                # 2. Token overlap and frequency
                for t in tokens:
                    if t in content_lower:
                        count = content_lower.count(t)
                        score += (2.0 + math.log(1 + count))

                # 3. Apply document title boost
                score *= doc_boost

            if score > 0 or is_general_query:
                scored_chunks.append({
                    "filename": filename,
                    "document_id": doc.get("document_id"),
                    "chunk_id": chunk.get("chunk_id", ""),
                    "index": chunk.get("index", 1),
                    "score": round(score, 2),
                    "token_weight": chunk.get("token_weight", 0),
                    "content": content[:max_chars],
                })

    # Sort descending by score
    scored_chunks.sort(key=lambda x: x["score"], reverse=True)
    return scored_chunks[:top_k]
