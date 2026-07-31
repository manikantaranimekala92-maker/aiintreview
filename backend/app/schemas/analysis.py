from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class AnswerAnalyzeRequest(BaseModel):
    question: str
    answer: str
    job_role: str = "Software Engineer"
    required_skills: List[str] = []

class BottleneckItem(BaseModel):
    type: str  # knowledge_gap, missing_concept, incorrect_concept, incomplete_answer, etc.
    severity: str  # low, medium, high, critical
    topic: str
    evidence: str
    recommendation: str

class AnswerAnalysisResponse(BaseModel):
    technical_score: int
    relevance_score: int
    completeness_score: int
    reasoning_score: int
    communication_score: int
    overall_score: int
    strengths: List[str]
    weaknesses: List[str]
    bottlenecks: List[BottleneckItem]
    recommendations: List[str]
