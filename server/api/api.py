from ninja import Router
from django.shortcuts import get_object_or_404
from django.http import HttpRequest
# Update import:
from api.schemas import UploadDocumentIn, DocumentOut, AskQuestionIn, TaskStatusOut, RAGAnswerOut # Make sure TaskStatusOut and RAGAnswerOut are imported
from api.models import Document
from api.tasks import process_document_task, answer_question_task
from ninja.pagination import paginate, PageNumberPagination
from celery.result import AsyncResult
from typing import List, Union
import uuid # Ensure uuid is imported if task_id is uuid.UUID

router = Router()

@router.get("/healthcheck", tags=["Health"])
def healthcheck(request: HttpRequest):
    """
    Basic health check endpoint.
    """
    return {"status": "ok", "message": "API is running"}

@router.post("/upload", response={201: DocumentOut}, tags=["Documents"])
def upload_document(request: HttpRequest, payload: UploadDocumentIn):
    document = Document.objects.create(
        filename=payload.filename,
        content=""
    )
    process_document_task.delay(str(document.id), document.filename, payload.content)
    return document

@router.get("/documents", response=List[DocumentOut], tags=["Documents"])
@paginate(PageNumberPagination)
def list_documents(request: HttpRequest):
    """
    Lists all uploaded documents with pagination.
    """
    return Document.objects.all().order_by('-uploaded_at')

@router.post("/ask", response=TaskStatusOut, tags=["RAG"])
def ask_question(request: HttpRequest, payload: AskQuestionIn):
    """
    Submits a question to the RAG system asynchronously.
    Returns a task ID to check the answer later.
    """
    # Pass payload.question and payload.num_chunks directly to the task
    task = answer_question_task.delay(payload.question, payload.num_chunks)
    # The return value must now match the TaskStatusOut schema
    return {"status": "processing", "message": "Your question is being processed.", "task_id": task.id}

@router.get("/task_status/{task_id}", response=Union[TaskStatusOut, RAGAnswerOut], tags=["RAG"])
def get_task_status(request: HttpRequest, task_id: uuid.UUID):
    result = AsyncResult(str(task_id))
    if result.ready(): # Task is done
        return RAGAnswerOut(**result.get()) # Return the actual answer
    else:
        return {"status": "pending", "message": "Task is still processing.", "task_id": task_id}