from pydantic import BaseModel
from typing import List, Optional

class QuestionGenerateRequest(BaseModel):
    job_role: str = "Software Engineer"
    skills: List[str] = ["Python", "SQL", "DSA"]
    difficulty: str = "medium"
    previous_answer: Optional[str] = None

class QuestionResponse(BaseModel):
    id: Optional[str] = None
    question: str
    topic: str
    difficulty: str
    category: Optional[str] = "Technical"
    expected_key_concepts: Optional[List[str]] = []
    sample_model_answer: Optional[str] = None
