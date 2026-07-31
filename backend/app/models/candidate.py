import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Text, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

class CandidateProfile(Base):
    __tablename__ = "candidate_profiles"

    id = Column(String, primary_key=True, default=lambda: f"prof_{uuid.uuid4().hex[:12]}")
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    target_role = Column(String, nullable=True, default="Software Engineer")
    years_experience = Column(Integer, default=0)
    skills = Column(JSON, default=list)
    resume_summary = Column(Text, nullable=True)
    resume_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    user = relationship("User", back_populates="profile")
