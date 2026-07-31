import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Text, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

class InterviewReport(Base):
    __tablename__ = "interview_reports"

    id = Column(String, primary_key=True, default=lambda: f"rep_{uuid.uuid4().hex[:12]}")
    interview_id = Column(String, ForeignKey("interviews.id", ondelete="CASCADE"), nullable=False, unique=True)
    overall_score = Column(Integer, default=0)
    technical_score = Column(Integer, default=0)
    communication_score = Column(Integer, default=0)
    problem_solving_score = Column(Integer, default=0)
    strengths = Column(JSON, default=list)
    weaknesses = Column(JSON, default=list)
    bottlenecks = Column(JSON, default=list)
    skill_gaps = Column(JSON, default=list)
    recommendations = Column(JSON, default=list)
    learning_roadmap = Column(JSON, default=list)
    interview_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    interview = relationship("Interview", back_populates="report")
