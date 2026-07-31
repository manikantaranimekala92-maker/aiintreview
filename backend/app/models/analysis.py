import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

class AIAnalysis(Base):
    __tablename__ = "ai_analyses"

    id = Column(String, primary_key=True, default=lambda: f"ana_{uuid.uuid4().hex[:12]}")
    interview_id = Column(String, ForeignKey("interviews.id", ondelete="CASCADE"), nullable=False)
    answer_id = Column(String, ForeignKey("interview_answers.id", ondelete="CASCADE"), nullable=False, unique=True)
    technical_score = Column(Integer, default=0)
    relevance_score = Column(Integer, default=0)
    completeness_score = Column(Integer, default=0)
    reasoning_score = Column(Integer, default=0)
    communication_score = Column(Integer, default=0)
    overall_score = Column(Integer, default=0)
    strengths = Column(JSON, default=list)
    weaknesses = Column(JSON, default=list)
    recommendations = Column(JSON, default=list)
    raw_response = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    interview = relationship("Interview", back_populates="analyses")
    answer = relationship("InterviewAnswer", back_populates="analysis")
