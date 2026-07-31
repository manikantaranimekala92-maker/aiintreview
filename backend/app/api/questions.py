from fastapi import APIRouter, Depends, HTTPException
from backend.app.schemas.question import QuestionGenerateRequest, QuestionResponse
from backend.app.services.ai_service import ai_service

router = APIRouter(prefix="/ai", tags=["AI Question & Analysis"])

@router.post("/generate-question", response_model=QuestionResponse, summary="Generate AI question")
def generate_question(data: QuestionGenerateRequest):
    q_data = ai_service.generate_question(
        job_role=data.job_role,
        skills=data.skills,
        difficulty=data.difficulty,
        previous_answer=data.previous_answer
    )
    return {
        "question": q_data.get("question", "Describe your software architecture principles."),
        "topic": q_data.get("topic", "System Architecture"),
        "difficulty": q_data.get("difficulty", data.difficulty),
        "category": q_data.get("category", "Technical"),
        "expected_key_concepts": q_data.get("expected_key_concepts", []),
        "sample_model_answer": q_data.get("sample_model_answer", "")
    }
