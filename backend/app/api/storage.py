import io
import uuid
import logging
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, status
from fastapi.responses import StreamingResponse, JSONResponse

from backend.app.services.gcs_service import gcs_service
from backend.app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/storage", tags=["Storage"])

@router.post("/upload")
async def upload_file_to_gcs(
    file: UploadFile = File(...),
    folder: str = Form("resumes")
):
    """
    Uploads a file securely to the private Google Cloud Storage bucket (ai-interview-503607).
    No access keys or secret keys are exposed. Handled entirely by FastAPI using GCP ADC/IAM.
    """
    try:
        content = await file.read()
        file_ext = file.filename.split(".")[-1] if "." in file.filename else "bin"
        unique_filename = f"{folder}/{uuid.uuid4().hex}_{file.filename}"
        
        result = gcs_service.upload_file(
            blob_name=unique_filename,
            file_data=content,
            content_type=file.content_type or "application/octet-stream"
        )
        
        return {
            "message": "File uploaded successfully to Google Cloud Storage",
            "filename": file.filename,
            "blob_name": result.get("blob_name"),
            "bucket": result.get("bucket"),
            "file_url": result.get("backend_url"),
            "content_type": file.content_type
        }
    except Exception as e:
        logger.error(f"Error uploading file to GCS: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file to Google Cloud Storage: {str(e)}"
        )

@router.get("/files/{file_path:path}")
async def get_file_from_gcs(file_path: str):
    """
    Streams file securely from Google Cloud Storage through FastAPI backend.
    Enforces privacy by keeping bucket private and withholding raw GCS credentials from browser.
    """
    file_bytes = gcs_service.download_file(file_path)
    if not file_bytes:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requested file not found in Google Cloud Storage bucket."
        )
    
    # Infer basic content type
    content_type = "application/pdf" if file_path.endswith(".pdf") else "audio/wav" if file_path.endswith(".wav") else "application/octet-stream"
    
    return StreamingResponse(
        io.BytesIO(file_bytes),
        media_type=content_type,
        headers={"Content-Disposition": f"inline; filename={file_path.split('/')[-1]}"}
    )

@router.get("/signed-url/{file_path:path}")
async def get_signed_url(file_path: str, expires_in_minutes: int = 60):
    """
    Generates a temporary signed URL using Google Application Default Credentials.
    """
    signed_url = gcs_service.generate_signed_url(file_path, expiration_minutes=expires_in_minutes)
    if not signed_url:
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "success": False,
                "message": "Signed URL generation requires GCP IAM ADC authentication in Cloud environment.",
                "fallback_url": f"/api/storage/files/{file_path}"
            }
        )
    return {
        "success": True,
        "signed_url": signed_url,
        "expires_in_minutes": expires_in_minutes
    }
