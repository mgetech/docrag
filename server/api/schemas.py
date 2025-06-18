from ninja import Schema
from typing import List, Optional
import uuid
from datetime import datetime

# --- Input Schemas ---

class UploadDocumentIn(Schema):
    filename: str
    content: str

class AskQuestionIn(Schema):
    question: str
    num_chunks: int = 5

# --- Output Schemas ---

class DocumentChunkOut(Schema):
    id: uuid.UUID
    text: str
    chunk_index: int

class DocumentOut(Schema):
    """Schema for a single document output."""
    id: uuid.UUID
    filename: str
    uploaded_at: datetime

class PaginationOut(Schema):
    count: int
    next: Optional[str]
    previous: Optional[str]
    page_size: int
    page_number: int

class DocumentListOut(Schema):
    pagination: PaginationOut
    results: List[DocumentOut]

# NEW: Schema for the immediate response of the /ask endpoint
class TaskStatusOut(Schema):
    status: str
    message: str
    task_id: uuid.UUID # Using UUID for task_id, ensure it's imported if not

# this is the *actual* RAG result
class RAGAnswerOut(Schema):
    question: str
    answer: str
    retrieved_chunks: List[str]