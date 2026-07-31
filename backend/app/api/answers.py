from fastapi import APIRouter, Depends, HTTPException
from backend.app.schemas.analysis import AnswerAnalyzeRequest, AnswerAnalysisResponse
from backend.app.services.ai_service import ai_service
from backend.app.services.bottleneck_service import bottleneck_service

router = APIRouter(prefix="/ai", tags=["AI Question & Analysis"])

@router.post("/analyze-answer", response_model=AnswerAnalysisResponse, summary="Analyze candidate answer with Gemini")
def analyze_answer(data: AnswerAnalyzeRequest):
    analysis = ai_service.analyze_answer(
        question=data.question,
        answer=data.answer,
        job_role=data.job_role,
        required_skills=data.required_skills
    )
    
    b_items = bottleneck_service.analyze_bottlenecks(data.question, data.answer, analysis)
    analysis["bottlenecks"] = b_items

    return analysis
