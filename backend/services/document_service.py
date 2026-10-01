"""Document Ingestion and Parsing Service for MIRA Multimodal Agent."""

import io
import math
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
