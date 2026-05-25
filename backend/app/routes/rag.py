import os
import uuid
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.admin import Workspace, Document
from app.services.rag.rag_service import ingest_document, answer_with_rag
from app.services.rag.vector_service import delete_document_chunks
from app.utils.model_registry import is_model_enabled

router = APIRouter(prefix="/rag", tags=["RAG"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "uploads", "documents")
os.makedirs(UPLOAD_DIR, exist_ok=True)

class RagChatRequest(BaseModel):
    question: str
    selectedModel: str
    workspaceId: int

@router.post("/upload")
async def rag_upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    workspace_name: str = Form(...),
    uploader_user_id: Optional[int] = Form(None),
    db: Session = Depends(get_db),
):
    """
    Direct endpoint to upload document and queue it for background RAG ingestion.
    """
    ws = db.query(Workspace).filter(Workspace.name == workspace_name).first()
    if not ws:
        raise HTTPException(status_code=404, detail=f"Workspace '{workspace_name}' not found")

    # Build safe filename
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in (".pdf", ".docx", ".txt"):
        raise HTTPException(status_code=400, detail=f"Unsupported file extension '{ext}'. Only .pdf, .docx, and .txt are allowed.")

    safe_name = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_DIR, safe_name)

    # Save file
    try:
        with open(file_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    size = os.path.getsize(file_path)

    # Store in PostgreSQL DB
    doc = Document(
        workspace_id=ws.id,
        uploaded_by=uploader_user_id,
        file_name=safe_name,
        original_file_name=file.filename,
        file_path=file_path,
        file_size=size,
        file_type=file.content_type or ext.lstrip("."),
        processing_status="pending",
        embedding_status="pending",
        chunk_count=0,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Enqueue background task to parse, chunk, embed, and index document
    background_tasks.add_task(ingest_document, doc.id, db)

    return {
        "id": doc.id,
        "file_name": doc.original_file_name,
        "workspace": workspace_name,
        "processing_status": "pending"
    }

@router.post("/chat")
def rag_chat(payload: RagChatRequest, db: Session = Depends(get_db)):
    """
    Direct endpoint to retrieve similar document chunks and generate grounded AI answer.
    """
    # 1. Validation: ensure requested model is enabled by admin
    if not is_model_enabled(payload.selectedModel, db):
        raise HTTPException(status_code=400, detail=f"Requested model '{payload.selectedModel}' is not enabled or registered.")

    # 2. Ensure workspace exists
    ws = db.query(Workspace).filter(Workspace.id == payload.workspaceId).first()
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found.")

    try:
        response = answer_with_rag(
            question=payload.question,
            selected_model=payload.selectedModel,
            workspace_id=payload.workspaceId,
            db=db
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG processing failed: {str(e)}")

@router.delete("/documents/{document_id}")
def rag_delete_document(document_id: int, db: Session = Depends(get_db)):
    """
    Deletes vectors from Qdrant and updates PostgreSQL document status.
    """
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    # 1. Delete chunks in Qdrant
    delete_document_chunks(doc.id)

    # 2. Update PostgreSQL status to deleted
    doc.processing_status = "deleted"
    db.commit()

    return {"message": f"Document #{document_id} and its associated vectors successfully removed."}
