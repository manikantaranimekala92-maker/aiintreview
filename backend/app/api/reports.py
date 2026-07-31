from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.api.auth import get_current_user
from backend.app.models.user import User
from backend.app.schemas.interview import InterviewReportOut
from backend.app.services.interview_service import interview_service
from backend.app.services.report_service import report_service

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/{interview_id}", response_model=InterviewReportOut, summary="Get full report for interview")
def get_report(
    interview_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    interview = interview_service.get_interview_by_id(db, interview_id)
    return report_service.generate_or_get_report(db, interview)
