from typing import List, Dict, Any

BOTTLENECK_TYPES = [
    "knowledge_gap",
    "missing_concept",
    "incorrect_concept",
    "incomplete_answer",
    "weak_reasoning",
    "poor_problem_solving",
    "communication_gap",
    "poor_answer_structure",
    "missing_example",
    "skill_gap",
    "question_misunderstanding"
]

class BottleneckDetector:
    def analyze_bottlenecks(self, question: str, answer: str, analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        detected = []
        raw_bottlenecks = analysis.get("bottlenecks", [])
        
        for b in raw_bottlenecks:
            b_type = b.get("type", "knowledge_gap").lower().replace(" ", "_")
            if b_type not in BOTTLENECK_TYPES:
                b_type = "knowledge_gap"
            
            detected.append({
                "type": b_type,
                "severity": b.get("severity", "medium"),
                "topic": b.get("topic", "Core Concept"),
                "evidence": b.get("evidence", "Analysis of answer text"),
                "recommendation": b.get("recommendation", "Review foundational concepts")
            })

        # Rule-based fallback checks if AI analysis returned few bottlenecks
        if not detected:
            word_count = len(answer.strip().split())
            if word_count < 15:
                detected.append({
                    "type": "incomplete_answer",
                    "severity": "high",
                    "topic": "Answer Depth",
                    "evidence": f"Candidate answer length ({word_count} words) is significantly below threshold.",
                    "recommendation": "Provide comprehensive structural explanations with examples."
                })
            
            if "example" not in answer.lower() and "for instance" not in answer.lower():
                detected.append({
                    "type": "missing_example",
                    "severity": "medium",
                    "topic": "Practical Application",
                    "evidence": "No explicit real-world implementation example was included.",
                    "recommendation": "Illustrate theoretical points with concrete project experiences."
                })

        return detected

bottleneck_service = BottleneckDetector()
