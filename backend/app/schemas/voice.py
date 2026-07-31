from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class CommunicationFeedback(BaseModel):
    clarity: str = "Good"
    grammar: str = "Good"
    confidence: str = "Good"
    suggested_english: Optional[str] = None
    coach_suggestion: Optional[str] = None

class VoiceTranslateRequest(BaseModel):
    text: Optional[str] = None
    audio_base64: Optional[str] = None
    source_language: str = "Auto Detect"  # Auto Detect, Telugu, Hindi, Tamil, Malayalam, Kannada, English
    conversation_mode: bool = False
    context: Optional[str] = "general"

class VoiceTranslateResponse(BaseModel):
    original_transcript: str
    translated_transcript: str
    detected_language: str
    communication_feedback: CommunicationFeedback
    ai_response: Optional[str] = None
