from typing import Dict, Any
from sqlalchemy.orm import Session
from backend.app.models.interview import Interview
from backend.app.models.analysis import AIAnalysis
from backend.app.models.bottleneck import Bottleneck
from backend.app.models.report import InterviewReport
from backend.app.services.ai_service import ai_service

class ReportService:
    def generate_or_get_report(self, db: Session, interview: Interview) -> Dict[str, Any]:
        existing = db.query(InterviewReport).filter(InterviewReport.interview_id == interview.id).first()
        if existing:
            return {
                "interview_id": existing.interview_id,
                "overall_score": existing.overall_score,
                "technical_score": existing.technical_score,
                "communication_score": existing.communication_score,
                "problem_solving_score": existing.problem_solving_score,
                "strengths": existing.strengths,
                "weaknesses": existing.weaknesses,
                "bottlenecks": existing.bottlenecks,
                "skill_gaps": existing.skill_gaps,
                "recommendations": existing.recommendations,
                "learning_roadmap": existing.learning_roadmap,
                "interview_summary": existing.interview_summary
            }

        analyses = db.query(AIAnalysis).filter(AIAnalysis.interview_id == interview.id).all()
        bottlenecks = db.query(Bottleneck).filter(Bottleneck.interview_id == interview.id).all()

        if analyses:
            avg_overall = int(sum(a.overall_score for a in analyses) / len(analyses))
            avg_tech = int(sum(a.technical_score for a in analyses) / len(analyses))
            avg_comm = int(sum(a.communication_score for a in analyses) / len(analyses))
            avg_prob = int(sum(a.reasoning_score for a in analyses) / len(analyses))
            all_strengths = list(set([s for a in analyses for s in a.strengths]))
            all_weaknesses = list(set([w for a in analyses for w in a.weaknesses]))
            all_recs = list(set([r for a in analyses for r in a.recommendations]))
        else:
            avg_overall, avg_tech, avg_comm, avg_prob = 82, 85, 80, 81
            all_strengths = ["Strong core knowledge", "Clear structured answers"]
            all_weaknesses = ["Could include quantitative metrics"]
            all_recs = ["Practice detailing trade-offs"]

        b_list = [
            {
                "type": b.type,
                "severity": b.severity,
                "topic": b.topic,
                "evidence": b.evidence,
                "recommendation": b.recommendation
            }
            for b in bottlenecks
        ]

        skill_gaps = [
            {"skill": "Core Architecture", "gapPercent": 10, "status": "matched"},
            {"skill": "System Design", "gapPercent": 15, "status": "partial"}
        ]

        roadmap = ai_service.generate_learning_recommendations(skill_gaps, interview.job_role)
        summary = ai_service.generate_feedback(avg_overall, all_strengths, all_weaknesses)

        report_obj = InterviewReport(
            interview_id=interview.id,
            overall_score=avg_overall,
            technical_score=avg_tech,
            communication_score=avg_comm,
            problem_solving_score=avg_prob,
            strengths=all_strengths,
            weaknesses=all_weaknesses,
            bottlenecks=b_list,
            skill_gaps=skill_gaps,
            recommendations=all_recs,
            learning_roadmap=roadmap,
            interview_summary=summary
        )
        db.add(report_obj)
        interview.status = "completed"
        interview.overall_score = avg_overall
        interview.technical_score = avg_tech
        interview.communication_score = avg_comm
        db.commit()

        return {
            "interview_id": interview.id,
            "overall_score": avg_overall,
            "technical_score": avg_tech,
            "communication_score": avg_comm,
            "problem_solving_score": avg_prob,
            "strengths": all_strengths,
            "weaknesses": all_weaknesses,
            "bottlenecks": b_list,
            "skill_gaps": skill_gaps,
            "recommendations": all_recs,
            "learning_roadmap": roadmap,
            "interview_summary": summary
        }

report_service = ReportService()
