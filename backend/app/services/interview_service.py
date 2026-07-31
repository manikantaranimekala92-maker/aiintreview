import uuid
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from backend.app.models.interview import Interview
from backend.app.models.question import InterviewQuestion
from backend.app.models.answer import InterviewAnswer
from backend.app.models.analysis import AIAnalysis
from backend.app.models.bottleneck import Bottleneck
from backend.app.services.ai_service import ai_service
from backend.app.services.bottleneck_service import bottleneck_service

class InterviewService:
    def create_interview(
        self,
        db: Session,
        user_id: str,
        job_role: str,
        difficulty: str = "medium",
        mode: str = "voice",
        skills: Optional[List[str]] = None
    ) -> Interview:
        interview = Interview(
            id=f"session_{int(uuid.uuid4().hex[:8], 16)}",
            user_id=user_id,
            job_role=job_role,
            difficulty=difficulty,
            mode=mode,
            status="created"
        )
        db.add(interview)
        db.commit()
        db.refresh(interview)

        # Generate initial question
        q_data = ai_service.generate_question(
            job_role=job_role,
            skills=skills or ["System Design", "Python"],
            difficulty=difficulty
        )
        
        q_obj = InterviewQuestion(
            id=f"q_{int(uuid.uuid4().hex[:8], 16)}",
            interview_id=interview.id,
            order_index=1,
            topic=q_data.get("topic", "Technical Architecture"),
            question_text=q_data.get("question", f"Explain core concepts for {job_role}."),
            difficulty=difficulty,
            category=q_data.get("category", "System Design"),
            expected_concepts=q_data.get("expected_key_concepts", []),
            sample_answer=q_data.get("sample_model_answer", "")
        )
        db.add(q_obj)
        db.commit()

        return interview

    def get_user_interviews(self, db: Session, user_id: str) -> List[Interview]:
        return db.query(Interview).filter(Interview.user_id == user_id).order_by(Interview.created_at.desc()).all()

    def get_interview_by_id(self, db: Session, interview_id: str) -> Interview:
        interview = db.query(Interview).filter(Interview.id == interview_id).first()
        if not interview:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview session not found")
        return interview

    def process_answer(
        self,
        db: Session,
        interview_id: str,
        question_id: str,
        candidate_answer: str,
        audio_url: Optional[str] = None
    ) -> Dict[str, Any]:
        interview = self.get_interview_by_id(db, interview_id)
        question = db.query(InterviewQuestion).filter(InterviewQuestion.id == question_id).first()
        if not question:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")

        # Save answer
        ans_obj = InterviewAnswer(
            interview_id=interview_id,
            question_id=question_id,
            candidate_answer=candidate_answer,
            audio_url=audio_url
        )
        db.add(ans_obj)
        db.commit()
        db.refresh(ans_obj)

        # Run AI Analysis
        analysis_data = ai_service.analyze_answer(
            question=question.question_text,
            answer=candidate_answer,
            job_role=interview.job_role,
            required_skills=question.expected_concepts or []
        )

        analysis_obj = AIAnalysis(
            interview_id=interview_id,
            answer_id=ans_obj.id,
            technical_score=analysis_data.get("technical_score", 80),
            relevance_score=analysis_data.get("relevance_score", 80),
            completeness_score=analysis_data.get("completeness_score", 80),
            reasoning_score=analysis_data.get("reasoning_score", 80),
            communication_score=analysis_data.get("communication_score", 80),
            overall_score=analysis_data.get("overall_score", 80),
            strengths=analysis_data.get("strengths", []),
            weaknesses=analysis_data.get("weaknesses", []),
            recommendations=analysis_data.get("recommendations", []),
            raw_response=analysis_data
        )
        db.add(analysis_obj)
        db.commit()

        # Bottleneck detection
        b_items = bottleneck_service.analyze_bottlenecks(question.question_text, candidate_answer, analysis_data)
        for bi in b_items:
            b_obj = Bottleneck(
                interview_id=interview_id,
                type=bi["type"],
                severity=bi["severity"],
                topic=bi["topic"],
                evidence=bi["evidence"],
                recommendation=bi["recommendation"]
            )
            db.add(b_obj)
        db.commit()

        # Determine adaptive difficulty for next question
        current_score = analysis_data.get("overall_score", 70)
        next_difficulty = interview.difficulty
        if current_score >= 85:
            next_difficulty = "hard"
        elif current_score <= 60:
            next_difficulty = "easy"

        # Generate next question adaptively
        next_q_data = ai_service.generate_question(
            job_role=interview.job_role,
            skills=[question.topic],
            difficulty=next_difficulty,
            previous_answer=candidate_answer
        )

        existing_q_count = db.query(InterviewQuestion).filter(InterviewQuestion.interview_id == interview_id).count()
        next_q_obj = InterviewQuestion(
            id=f"q_{int(uuid.uuid4().hex[:8], 16)}",
            interview_id=interview.id,
            order_index=existing_q_count + 1,
            topic=next_q_data.get("topic", "Follow-up Topic"),
            question_text=next_q_data.get("question", "Describe your approach to resolving performance bottlenecks."),
            difficulty=next_difficulty,
            category=next_q_data.get("category", "Problem Solving"),
            expected_concepts=next_q_data.get("expected_key_concepts", []),
            sample_answer=next_q_data.get("sample_model_answer", "")
        )
        db.add(next_q_obj)
        db.commit()

        return {
            "answer_id": ans_obj.id,
            "analysis": analysis_data,
            "bottlenecks": b_items,
            "next_question": {
                "id": next_q_obj.id,
                "question": next_q_obj.question_text,
                "topic": next_q_obj.topic,
                "difficulty": next_q_obj.difficulty,
                "category": next_q_obj.category
            }
        }

interview_service = InterviewService()
