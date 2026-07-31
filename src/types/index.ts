export type UserRole = 'candidate';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'candidate';
  avatar?: string;
  title?: string;
  company?: string;
  education?: string;
  experienceLevel?: string;
  skills?: string[];
  preferredJobRole?: string;
  careerGoals?: string;
  languages?: string[];
  phone?: string;
  location?: string;
  dateOfBirth?: string;
  resumeFileName?: string;
  resumeUploadDate?: string;
  resumeStatus?: string;
  createdAt?: string;
  emailVerified?: boolean;
  username?: string;
  firstName?: string;
  lastName?: string;
  preferredName?: string;
  primaryPhone?: string;
  phoneCountryCode?: string;
  primaryEmail?: string;
  backupEmail?: string;
  gender?: string;
  streetAddress?: string;
  apartment?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phoneVerified?: boolean;
}

export interface VoiceSessionRecord {
  id: string;
  timestamp: string;
  sourceLanguage: string;
  detectedLanguage: string;
  originalTranscript: string;
  translatedTranscript: string;
  communicationFeedback?: {
    clarity: string;
    grammar: string;
    confidence: string;
    suggestedEnglish?: string;
    coachSuggestion?: string;
  };
  aiResponse?: string;
}

export type InterviewMode = 'text' | 'voice' | 'video' | 'coding';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface ResumeData {
  fileName?: string;
  candidateName: string;
  email: string;
  yearsExperience: number;
  extractedSkills: string[];
  summary: string;
  matchedRole?: string;
  recommendedPreparation: string[];
  fitScore: number; // 0-100
  recommendedTopics: string[];
}

export interface JobDescription {
  id: string;
  title: string;
  department: string;
  location: string;
  experienceYears: number;
  requiredSkills: string[];
  preferredSkills: string[];
  description: string;
  activeCandidatesCount: number;
  createdDate: string;
}

export interface TestCaseItem {
  id: number;
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
}

export interface Question {
  id: string;
  topic: string;
  questionText: string;
  difficulty: DifficultyLevel;
  expectedKeyConcepts: string[];
  sampleModelAnswer?: string;
  category: 'Technical' | 'System Design' | 'Problem Solving' | 'Behavioral';
  timeAllowedSeconds?: number;
  isCodingQuestion?: boolean;
  problemDescription?: string;
  starterCode?: Record<string, string>;
  testCases?: TestCaseItem[];
}

export type BottleneckCategory =
  | 'Knowledge Gap'
  | 'Missing Concept'
  | 'Incorrect Concept'
  | 'Incomplete Answer'
  | 'Weak Reasoning'
  | 'Poor Problem Solving'
  | 'Communication Gap'
  | 'Excessive Filler Words'
  | 'Poor Answer Structure'
  | 'Lack of Examples'
  | 'Improvement Area'
  | 'Question Misunderstanding'
  | 'Contradictory Answer';

export interface DetailedBottleneckItem {
  id: string;
  category: BottleneckCategory;
  severity: 'High' | 'Medium' | 'Low';
  evidence: string;
  impact: string;
  explanation: string;
  recommendation: string;
  questionTopic?: string;
}

export interface BottleneckAnalysis {
  knowledgeGapScore: number; // 0-100 (higher = worse/more gap)
  communicationGapScore: number;
  reasoningQualityScore: number; // 0-100
  confidenceScore: number; // 0-100
  improvementScore?: number;
  hallucinationRisk: 'Low' | 'Medium' | 'High';
  biasDetected: boolean;
  completenessPercent: number;
  missingKeywords: string[];
  missingExamples: string[];
  weakConcepts: string[];
  grammarFluencyScore: number;
  hesitationCount: number;
  fillerWordsCount: number;
  speakingPaceWpm?: number;
  detectedBottlenecks?: DetailedBottleneckItem[];
}

export interface CodeSubmissionData {
  language: string;
  code: string;
  compilerOutput: string;
  testCasesPassed: number;
  totalTestCases: number;
  executionTimeMs: number;
  memoryUsageMb?: number;
  compilationStatus: 'Success' | 'Compilation Error' | 'Runtime Error' | 'Time Limit Exceeded';
  errorMessages?: string;
  codeQualityFeedback?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  testCaseDetails?: Array<{
    id: number;
    input: string;
    expectedOutput: string;
    actualOutput: string;
    passed: boolean;
  }>;
}

export interface QuestionEvaluation {
  questionId: string;
  questionText: string;
  candidateAnswer: string;
  overallScore: number; // 0-100
  technicalDepthScore: number;
  communicationScore: number;
  confidenceScore: number;
  codeSubmission?: CodeSubmissionData;
  whatWasGood?: string;
  whatCouldBeImproved?: string;
  aiCoachRecommendation?: string;
  bottlenecks: BottleneckAnalysis;
  encoderAnalysis: {
    semanticContext: string;
    intentMatchPercent: number;
    embeddingVectorDistance: number;
    keyConceptCoverage: number;
  };
  decoderOutput: {
    explainableScoreReasoning: string;
    missingConceptsExplanation: string;
    expectedAnswerComparison: string;
    suggestedImprovements: string[];
    adaptiveNextDifficulty: DifficultyLevel;
    recommendedFollowUpTopic: string;
  };
  timestampStartSeconds?: number;
  timestampEndSeconds?: number;
}

export interface IntegritySignal {
  id: string;
  timestamp: string;
  timestampSeconds: number;
  type:
    | 'tab_hidden'
    | 'window_blur'
    | 'camera_disconnected'
    | 'mic_disconnected'
    | 'multiple_faces'
    | 'interruption';
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface QuestionTimestampMarker {
  questionId: string;
  questionIndex: number;
  questionTopic: string;
  questionText: string;
  candidateAnswerText: string;
  timestampStartSeconds: number;
  timestampEndSeconds: number;
}

export interface VideoRecordingData {
  recordingUrl?: string; // Blob or Object URL or S3 URL
  blob?: Blob;
  durationSeconds: number;
  mimeType: string;
  timestampMarkers: QuestionTimestampMarker[];
  hasAudio: boolean;
  hasVideo: boolean;
}

export interface LearningResource {
  id: string;
  topic: string;
  title: string;
  type: 'article' | 'video' | 'practice_problem' | 'course';
  url: string;
  estimatedMinutes: number;
  completed?: boolean;
}

export interface DeviceCheckStatus {
  camera: 'checking' | 'passed' | 'failed';
  microphone: 'checking' | 'passed' | 'failed';
  speaker: 'checking' | 'passed' | 'failed';
  internet: 'checking' | 'passed' | 'failed';
  browser: 'checking' | 'passed' | 'failed';
  errorMessage?: string;
}

export interface AiCoachInsights {
  overallScore: number;
  technicalScore: number;
  codingScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  behavioralScore: number;
  strengths: string[];
  weaknesses: string[];
  commonMistakes: string[];
  communicationPatterns: string[];
  personalizedRecommendations: string[];
  recommendedPracticeTopics: string[];
  nextInterviewDifficulty: DifficultyLevel;
  improvementPlan: string[];
}

export interface InterviewSession {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  jobRoleId: string;
  jobTitle: string;
  companyName?: string;
  mode: InterviewMode;
  difficulty?: DifficultyLevel;
  status: 'scheduled' | 'in_progress' | 'completed';
  date: string;
  durationMinutes: number;
  questions: Question[];
  evaluations: QuestionEvaluation[];
  overallScore: number;
  technicalScore: number;
  codingScore?: number;
  communicationScore: number;
  problemSolvingScore?: number;
  behavioralScore?: number;
  confidenceScore: number;
  bottleneckScore: number; // overall bottleneck index (lower is better)
  hiringRecommendation: 'Strong Hire' | 'Hire' | 'Leaning Hire' | 'Lean No Hire' | 'No Hire';
  executiveSummary: string;
  keyStrengths: string[];
  criticalGaps: string[];
  aiCoachInsights?: AiCoachInsights;
  learningRoadmap: LearningResource[];
  recordingData?: VideoRecordingData;
  integritySignals?: IntegritySignal[];
  bottlenecksList?: DetailedBottleneckItem[];
  answers?: any;
  totalQuestions?: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  status: 'Success' | 'Warning' | 'Error';
}

export interface ModelMetrics {
  totalInterviewsProcessed: number;
  avgEncoderLatencyMs: number;
  avgBottleneckDetectionLatencyMs: number;
  avgDecoderLatencyMs: number;
  accuracyRate: number;
  activeModelName: string;
  temperature: number;
  bottleneckSensitivity: number;
}

// ==========================================
// ADAPTIVE AI GUIDED PLAN INTERFACES
// ==========================================

export interface GuidedPlanConfig {
  targetRole: string;
  targetCompany?: string;
  jobDescription?: string;
  interviewDate?: string; // YYYY-MM-DD
  experienceLevel: 'entry' | 'mid' | 'senior';
  dailyAvailableMinutes: number; // 15, 30, 60, 120
  targetReadinessScore: number; // e.g. 85
  reminderNotificationsEnabled: boolean;
}

export type SkillPriorityLevel = 'Priority 1 — Critical' | 'Priority 2 — High' | 'Priority 3 — Medium' | 'Priority 4 — Low';

export interface SkillPriorityItem {
  skillName: string;
  category: string;
  currentScore: number;
  targetScore: number;
  importanceToRole: 'Very High' | 'High' | 'Medium' | 'Low';
  priorityLevel: SkillPriorityLevel;
  reasoning: string;
  frequencyOfMistakes: number;
  trend: 'improving' | 'declining' | 'stable';
  historicalProgression: number[];
}

export type GuidedPlanTaskType = 'micro_lesson' | 'coding' | 'voice_practice' | 'followup_qa' | 'weekly_assessment';

export interface GuidedPlanTask {
  id: string;
  dayNumber: number;
  skill: string;
  title: string;
  description: string;
  type: GuidedPlanTaskType;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  difficulty: DifficultyLevel;
  estimatedMinutes: number;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'replanned';
  createdDate: string;
  dueDate: string;
  completionDate?: string;
  score?: number;
  aiFeedback?: {
    overallScore: number;
    strengths: string[];
    improvements: string[];
    recommendedAction: string;
  };
  lessonData?: {
    overview: string;
    keyConcepts: string[];
    realWorldExample: string;
    codeSnippet?: string;
    quiz: {
      question: string;
      options: string[];
      correctIdx: number;
      explanation: string;
    };
  };
  codingProblem?: {
    problemTitle: string;
    problemDescription: string;
    supportedLanguages: string[];
    starterCode: Record<string, string>;
    sampleTestCases: Array<{ input: string; expectedOutput: string }>;
  };
  voicePromptData?: {
    promptText: string;
    followUpQuestionText: string;
    targetSeconds: number;
  };
}

export interface GuidedPlanMilestone {
  id: string;
  title: string;
  description: string;
  iconName: string;
  targetReadinessScore: number;
  completed: boolean;
  progressPercent: number;
}

export interface PlanVersion {
  versionId: string;
  versionName: string; // e.g. "Plan v1.0", "Plan v2.1 (Auto-Replanned)"
  createdDate: string;
  triggerReason: string;
  previousPriorities: Record<string, SkillPriorityLevel>;
  newPriorities: Record<string, SkillPriorityLevel>;
  changesSummary: string;
}

export interface WeeklyAssessment {
  weekNumber: number;
  title: string;
  topicsCovered: string[];
  status: 'upcoming' | 'available' | 'completed';
  score?: number;
  completedDate?: string;
  summaryFeedback?: string;
}

export interface GuidedPlanStreakStats {
  currentStreakDays: number;
  longestStreakDays: number;
  tasksCompleted: number;
  tasksSkipped: number;
  totalPracticeMinutes: number;
  codingProblemsSolved: number;
  voiceExercisesCompleted: number;
  mockInterviewsCompleted: number;
}

export interface ReadinessProgressPoint {
  label: string;
  date: string;
  score: number;
  eventNote?: string;
}

export interface GuidedPlanState {
  config: GuidedPlanConfig;
  skillPriorities: SkillPriorityItem[];
  dailyTasks: GuidedPlanTask[];
  milestones: GuidedPlanMilestone[];
  streakStats: GuidedPlanStreakStats;
  planVersions: PlanVersion[];
  weeklyAssessments: WeeklyAssessment[];
  readinessHistory: ReadinessProgressPoint[];
  lastReplannedDate: string;
  lastCompletedTaskId?: string;
}


