import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Text, DateTime, ForeignKey
from backend.app.core.database import Base

class Transcript(Base):
    __tablename__ = "transcripts"

    id = Column(String, primary_key=True, default=lambda: f"trs_{uuid.uuid4().hex[:12]}")
    interview_id = Column(String, ForeignKey("interviews.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(String, ForeignKey("interview_questions.id", ondelete="SET NULL"), nullable=True)
    speaker = Column(String, default="candidate")  # candidate, interviewer, ai
    text = Column(Text, nullable=False)
    start_time = Column(Float, default=0.0)
    end_time = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
