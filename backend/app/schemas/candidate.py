from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any

class CandidateProfileBase(BaseModel):
    target_role: Optional[str] = "Senior Software Engineer"
    years_experience: Optional[int] = 3
    skills: Optional[List[str]] = []
    resume_summary: Optional[str] = None
    resume_url: Optional[str] = None

class CandidateProfileUpdate(CandidateProfileBase):
    pass

class CandidateProfileOut(CandidateProfileBase):
    id: str
    user_id: str
    email: Optional[EmailStr] = None
    name: Optional[str] = None

    class Config:
        from_attributes = True

class ResumeParseRequest(BaseModel):
    resumeText: str
    jobRole: Optional[str] = "Senior Software Engineer"

class CandidateProgressOut(BaseModel):
    total_interviews: int
    completed_interviews: int
    average_overall_score: float
    average_technical_score: float
    average_communication_score: float
    recent_trend: List[Dict[str, Any]]

class SkillGapItem(BaseModel):
    skill: str
    requiredLevel: int
    candidateLevel: int
    gapPercent: int
    status: str  # matched, partial, critical

class RecommendationItem(BaseModel):
    id: str
    title: str
    category: str
    difficulty: str
    estimatedHours: int
    description: str
