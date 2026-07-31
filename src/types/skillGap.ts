export type SkillCategory =
  | 'Technical Skills'
  | 'Programming'
  | 'Data Structures & Algorithms'
  | 'Database / SQL'
  | 'Machine Learning'
  | 'System Design'
  | 'Communication'
  | 'Problem Solving'
  | 'Behavioral Interview';

export type FocusAreaStatus = 'STRONG' | 'ALMOST READY' | 'NEEDS IMPROVEMENT' | 'CRITICAL ATTENTION';
export type SkillGapStatus = FocusAreaStatus;

export type GapPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type AIConfidence = 'High' | 'Medium' | 'Low';

export interface EvidenceItem {
  id: string;
  interviewTitle: string;
  interviewDate: string;
  sessionId?: string;
  questionText: string;
  candidateScore: number;
  detectedWeakness: string;
  bottleneckType?: string;
}

export interface LearningStep {
  week: string;
  title: string;
  description: string;
  topics: string[];
}

export interface FocusAreaItemDetail {
  id: string;
  skillName: string;
  category: SkillCategory;
  currentLevel: number; // 0 - 100
  requiredLevel: number; // 0 - 100
  gap: number; // max(0, requiredLevel - currentLevel)
  status: FocusAreaStatus;
  priority: GapPriority;
  aiConfidence: AIConfidence;
  confidencePercent: number; // 0-100, e.g. 91
  jobImportance: 'High' | 'Medium' | 'Low';
  aiExplanation: string;
  bottleneckTrace: {
    bottleneckType: string;
    topic: string;
    focusAreaName: string;
    missingConcepts: string[];
  };
  evidence: EvidenceItem[];
  contributingInterviews: string[];
  missingConcepts: string[];
  improvementAdvice: string;
  recommendedPracticeTopic: string;
  learningSteps: LearningStep[];
  history: { date: string; score: number }[];
}

export type SkillGapItemDetail = FocusAreaItemDetail;

export interface TargetRoleRequirement {
  roleId: string;
  title: string;
  department: string;
  description: string;
  skillRequirements: Record<string, { requiredLevel: number; category: SkillCategory; importance: 'High' | 'Medium' | 'Low' }>;
}

export interface OverallReadinessSummary {
  overallReadiness: number;
  technicalReadiness: number;
  problemSolvingReadiness: number;
  communicationReadiness: number;
  interviewReadiness: number;
  lastAnalysisDate: string;
  totalSkills: number;
  readyCount: number;
  needsImprovementCount: number;
  criticalCount: number;
}

export interface FocusAreaHistoryRecord {
  id: string;
  date: string;
  overallReadiness: number;
  criticalAreasCount: number;
  highAreasCount: number;
  targetRole: string;
  improvementPercentage: number;
}

export type SkillGapHistoryRecord = FocusAreaHistoryRecord;
