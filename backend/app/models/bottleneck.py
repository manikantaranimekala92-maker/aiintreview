import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

class Bottleneck(Base):
    __tablename__ = "bottlenecks"

    id = Column(String, primary_key=True, default=lambda: f"bot_{uuid.uuid4().hex[:12]}")
    interview_id = Column(String, ForeignKey("interviews.id", ondelete="CASCADE"), nullable=False)
    type = Column(String, nullable=False)  # knowledge_gap, missing_concept, etc.
    severity = Column(String, default="medium")  # low, medium, high, critical
    topic = Column(String, nullable=False)
    evidence = Column(Text, nullable=False)
    recommendation = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    interview = relationship("Interview", back_populates="bottlenecks")
