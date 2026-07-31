from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class InterviewCreate(BaseModel):
    job_role: str = "Senior Software Engineer"
    difficulty: str = "medium"
    mode: str = "voice"
    skills: Optional[List[str]] = []

class AnswerSubmit(BaseModel):
    question_id: str
    candidate_answer: str
    audio_url: Optional[str] = None

class TranscriptCreate(BaseModel):
    speaker: str = "candidate"
    text: str
    start_time: float = 0.0
    end_time: float = 0.0
    question_id: Optional[str] = None

class InterviewOut(BaseModel):
    id: str
    user_id: str
    job_role: str
    difficulty: str
    mode: str
    status: str
    overall_score: Optional[int] = None
    technical_score: Optional[int] = None
    communication_score: Optional[int] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class InterviewReportOut(BaseModel):
    interview_id: str
    overall_score: int
    technical_score: int
    communication_score: int
    problem_solving_score: int
    strengths: List[str]
    weaknesses: List[str]
    bottlenecks: List[Dict[str, Any]]
    skill_gaps: List[Dict[str, Any]]
    recommendations: List[str]
    learning_roadmap: List[Dict[str, Any]]
    interview_summary: str
