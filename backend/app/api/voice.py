from fastapi import APIRouter, HTTPException
from backend.app.schemas.voice import VoiceTranslateRequest, VoiceTranslateResponse
from backend.app.services.ai_service import ai_service

router = APIRouter(prefix="/voice", tags=["Voice Assistant"])

@router.post("/translate", response_model=VoiceTranslateResponse, summary="Process & translate voice/speech with Gemini")
def translate_voice(data: VoiceTranslateRequest):
    if not data.text and not data.audio_base64:
        raise HTTPException(status_code=400, detail="Either text or audio_base64 must be provided.")
    
    result = ai_service.process_voice_translation(
        text=data.text,
        audio_base64=data.audio_base64,
        source_language=data.source_language,
        conversation_mode=data.conversation_mode
    )
    return result
