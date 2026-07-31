import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

class Interview(Base):
    __tablename__ = "interviews"

    id = Column(String, primary_key=True, default=lambda: f"session_{uuid.uuid4().hex[:12]}")
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    job_role = Column(String, nullable=False)
    difficulty = Column(String, default="medium")
    mode = Column(String, default="voice")
    status = Column(String, default="created")  # created, in_progress, completed, cancelled
    overall_score = Column(Integer, nullable=True)
    technical_score = Column(Integer, nullable=True)
    communication_score = Column(Integer, nullable=True)
    recording_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="interviews")
    questions = relationship("InterviewQuestion", back_populates="interview", cascade="all, delete-orphan")
    answers = relationship("InterviewAnswer", back_populates="interview", cascade="all, delete-orphan")
    analyses = relationship("AIAnalysis", back_populates="interview", cascade="all, delete-orphan")
    bottlenecks = relationship("Bottleneck", back_populates="interview", cascade="all, delete-orphan")
    report = relationship("InterviewReport", uselist=False, back_populates="interview", cascade="all, delete-orphan")
