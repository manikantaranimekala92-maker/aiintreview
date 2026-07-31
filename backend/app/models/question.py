import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Text, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id = Column(String, primary_key=True, default=lambda: f"q_{uuid.uuid4().hex[:12]}")
    interview_id = Column(String, ForeignKey("interviews.id", ondelete="CASCADE"), nullable=False)
    order_index = Column(Integer, default=1)
    topic = Column(String, nullable=False)
    question_text = Column(Text, nullable=False)
    difficulty = Column(String, default="medium")
    category = Column(String, default="Technical")
    expected_concepts = Column(JSON, default=list)
    sample_answer = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    interview = relationship("Interview", back_populates="questions")
    answers = relationship("InterviewAnswer", back_populates="question", cascade="all, delete-orphan")
