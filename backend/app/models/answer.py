import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

class InterviewAnswer(Base):
    __tablename__ = "interview_answers"

    id = Column(String, primary_key=True, default=lambda: f"ans_{uuid.uuid4().hex[:12]}")
    interview_id = Column(String, ForeignKey("interviews.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(String, ForeignKey("interview_questions.id", ondelete="CASCADE"), nullable=False)
    candidate_answer = Column(Text, nullable=False)
    audio_url = Column(String, nullable=True)
    duration_seconds = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    interview = relationship("Interview", back_populates="answers")
    question = relationship("InterviewQuestion", back_populates="answers")
    analysis = relationship("AIAnalysis", uselist=False, back_populates="answer", cascade="all, delete-orphan")
