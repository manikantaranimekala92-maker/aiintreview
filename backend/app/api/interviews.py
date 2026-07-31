import os
import shutil
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.core.database import get_db
from backend.app.api.auth import get_current_user
from backend.app.models.user import User
from backend.app.models.interview import Interview
from backend.app.models.question import InterviewQuestion
from backend.app.schemas.interview import (
    InterviewCreate,
    AnswerSubmit,
    TranscriptCreate,
    InterviewOut,
    InterviewReportOut
)
from backend.app.services.interview_service import interview_service
from backend.app.services.transcription_service import transcription_service
from backend.app.services.report_service import report_service

router = APIRouter(prefix="/interviews", tags=["Interview Session"])

UPLOAD_DIR = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("", response_model=InterviewOut, summary="Create new interview session")
def create_interview(
    data: InterviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    interview = interview_service.create_interview(
        db=db,
        user_id=current_user.id,
        job_role=data.job_role,
        difficulty=data.difficulty,
        mode=data.mode,
        skills=data.skills
    )
    return interview

@router.get("", response_model=List[InterviewOut], summary="List candidate's interview sessions")
def list_interviews(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return interview_service.get_user_interviews(db, current_user.id)

@router.get("/{interview_id}", summary="Get detailed interview session")
def get_interview(
    interview_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    interview = interview_service.get_interview_by_id(db, interview_id)
    questions = db.query(InterviewQuestion).filter(InterviewQuestion.interview_id == interview_id).all()
    return {
        "interview": interview,
        "questions": [
            {
                "id": q.id,
                "topic": q.topic,
                "questionText": q.question_text,
                "difficulty": q.difficulty,
                "category": q.category,
                "expectedKeyConcepts": q.expected_concepts,
                "sampleModelAnswer": q.sample_answer
            }
            for q in questions
        ]
    }

@router.post("/{interview_id}/start", summary="Start interview session")
def start_interview(
    interview_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    interview = interview_service.get_interview_by_id(db, interview_id)
    interview.status = "in_progress"
    db.commit()
    first_q = db.query(InterviewQuestion).filter(InterviewQuestion.interview_id == interview_id).first()
    return {
        "status": "in_progress",
        "first_question": {
            "id": first_q.id if first_q else None,
            "topic": first_q.topic if first_q else "General Architecture",
            "questionText": first_q.question_text if first_q else "Describe your software engineering experience.",
            "difficulty": first_q.difficulty if first_q else "medium"
        }
    }

@router.post("/{interview_id}/answer", summary="Submit candidate answer for evaluation")
def submit_answer(
    interview_id: str,
    data: AnswerSubmit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    res = interview_service.process_answer(
        db=db,
        interview_id=interview_id,
        question_id=data.question_id,
        candidate_answer=data.candidate_answer,
        audio_url=data.audio_url
    )
    return res

@router.post("/{interview_id}/recording", summary="Upload media recording (multipart)")
async def upload_recording(
    interview_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    interview = interview_service.get_interview_by_id(db, interview_id)
    filename = f"{interview_id}_{uuid.uuid4().hex[:6]}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    recording_url = f"/uploads/{filename}"
    interview.recording_url = recording_url
    db.commit()

    return {"status": "uploaded", "recording_url": recording_url}

@router.post("/{interview_id}/transcript", summary="Post real-time speech transcript segment")
def post_transcript(
    interview_id: str,
    data: TranscriptCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    entry = transcription_service.record_transcript(
        db=db,
        interview_id=interview_id,
        speaker=data.speaker,
        text=data.text,
        start_time=data.start_time,
        end_time=data.end_time,
        question_id=data.question_id
    )
    return {"status": "saved", "transcript_id": entry.id}

@router.post("/{interview_id}/end", summary="End interview session and generate report")
def end_interview(
    interview_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    interview = interview_service.get_interview_by_id(db, interview_id)
    report = report_service.generate_or_get_report(db, interview)
    return {"status": "completed", "report": report}

@router.get("/{interview_id}/report", response_model=InterviewReportOut, summary="Get final interview evaluation report")
def get_report(
    interview_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    interview = interview_service.get_interview_by_id(db, interview_id)
    report = report_service.generate_or_get_report(db, interview)
    return report
