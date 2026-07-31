import logging
from sqlalchemy.orm import Session
from backend.app.models.transcript import Transcript

logger = logging.getLogger(__name__)

class TranscriptionService:
    def record_transcript(
        self,
        db: Session,
        interview_id: str,
        speaker: str,
        text: str,
        start_time: float = 0.0,
        end_time: float = 0.0,
        question_id: str = None
    ) -> Transcript:
        entry = Transcript(
            interview_id=interview_id,
            question_id=question_id,
            speaker=speaker,
            text=text,
            start_time=start_time,
            end_time=end_time
        )
        db.add(entry)
        db.commit()
        db.refresh(entry)
        return entry

    def get_interview_transcripts(self, db: Session, interview_id: str):
        return db.query(Transcript).filter(Transcript.interview_id == interview_id).order_by(Transcript.created_at.asc()).all()

transcription_service = TranscriptionService()
