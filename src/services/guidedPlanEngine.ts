import {
  GuidedPlanState,
  GuidedPlanConfig,
  SkillPriorityItem,
  GuidedPlanTask,
  GuidedPlanMilestone,
  PlanVersion,
  WeeklyAssessment,
  GuidedPlanStreakStats,
  ReadinessProgressPoint,
  InterviewSession,
  SkillPriorityLevel,
} from '../types';

export const DEFAULT_GUIDED_PLAN_CONFIG: GuidedPlanConfig = {
  targetRole: 'Senior AI / ML Engineer',
  targetCompany: 'Google',
  jobDescription:
    'Seeking a Senior AI/ML Engineer with strong system design, distributed infrastructure (Kubernetes, Ray), deep learning frameworks (PyTorch), LLM fine-tuning, KV cache optimization, and clear verbal communication for cross-functional leadership.',
  interviewDate: '2026-08-09', // ~12 days from now
  experienceLevel: 'senior',
  dailyAvailableMinutes: 45,
  targetReadinessScore: 85,
  reminderNotificationsEnabled: true,
};

export const INITIAL_SKILL_PRIORITIES: SkillPriorityItem[] = [
  {
    skillName: 'System Design',
    category: 'Architecture',
    currentScore: 58,
    targetScore: 85,
    importanceToRole: 'Very High',
    priorityLevel: 'Priority 1 — Critical',
    reasoning: 'Crucial for Senior AI/ML role; recurring bottlenecks in recent mock interviews around KV cache & rate limiting.',
    frequencyOfMistakes: 5,
    trend: 'improving',
    historicalProgression: [45, 50, 52, 58],
  },
  {
    skillName: 'Communication',
    category: 'Soft Skills',
    currentScore: 64,
    targetScore: 80,
    importanceToRole: 'High',
    priorityLevel: 'Priority 2 — High',
    reasoning: 'STAR structure needs refinement during complex trade-off explanations under pressure.',
    frequencyOfMistakes: 3,
    trend: 'improving',
    historicalProgression: [55, 58, 60, 64],
  },
  {
    skillName: 'Data Structures & Algorithms',
    category: 'Coding',
    currentScore: 71,
    targetScore: 85,
    importanceToRole: 'High',
    priorityLevel: 'Priority 3 — Medium',
    reasoning: 'Good array/hash map speed; needs polish on Graph BFS/DFS & Dynamic Programming memoization.',
    frequencyOfMistakes: 2,
    trend: 'stable',
    historicalProgression: [68, 70, 71, 71],
  },
  {
    skillName: 'Python & Frameworks',
    category: 'Technical Knowledge',
    currentScore: 84,
    targetScore: 88,
    importanceToRole: 'Medium',
    priorityLevel: 'Priority 4 — Low',
    reasoning: 'Strong Python syntax and PyTorch understanding demonstrated in past coding submissions.',
    frequencyOfMistakes: 0,
    trend: 'improving',
    historicalProgression: [78, 80, 82, 84],
  },
];

export const INITIAL_TASKS: GuidedPlanTask[] = [
  {
    id: 'task-1',
    dayNumber: 1,
    skill: 'System Design',
    title: 'Micro-Lesson: Distributed Caching & KV Cache Strategies',
    description: 'Learn Cache-Aside vs Write-Through strategies and how KV cache works in LLM inference servers.',
    type: 'micro_lesson',
    priority: 'Critical',
    difficulty: 'hard',
    estimatedMinutes: 15,
    status: 'completed',
    createdDate: '2026-07-27',
    dueDate: '2026-07-28',
    completionDate: '2026-07-28',
    score: 85,
    aiFeedback: {
      overallScore: 85,
      strengths: ['Accurate choice on Cache-Aside pattern', 'Clear comprehension of latency impact'],
      improvements: ['Review Redis eviction policies under memory pressure'],
      recommendedAction: 'Proceed to system design API rate limiting exercise.',
    },
    lessonData: {
      overview:
        'Caching stores frequently accessed data in high-speed RAM (e.g. Redis/Memcached) to minimize expensive database queries or LLM KV cache re-computations.',
      keyConcepts: [
        'Cache-Aside / Read-Through vs Write-Through',
        'Redis Eviction Policies (LRU, LFU, TTL)',
        'KV Cache state reuse in Transformer inference',
        'Cache stampede prevention via distributed locks',
      ],
      realWorldExample:
        'In an AI API serving 50k requests/sec, caching user prompt embeddings and KV states reduces latency from 450ms to 18ms.',
      codeSnippet: `// Example Cache-Aside pattern in TypeScript
async function getCachedUserData(userId: string) {
  const cached = await redis.get(\`user:\${userId}\`);
  if (cached) return JSON.parse(cached);

  const dbData = await db.user.findUnique({ where: { id: userId } });
  if (dbData) {
    await redis.set(\`user:\${userId}\`, JSON.stringify(dbData), 'EX', 3600);
  }
  return dbData;
}`,
      quiz: {
        question: 'Which caching strategy provides fast reads while keeping underlying storage as the source of truth asynchronously?',
        options: [
          'Cache-Aside Pattern',
          'Write-Through Pattern',
          'Synchronous Disk Flushing',
          'Zero-Copy Memory Mapping',
        ],
        correctIdx: 0,
        explanation: 'Cache-Aside loads data on demand into cache and allows the application to manage fallback gracefully.',
      },
    },
  },
  {
    id: 'task-2',
    dayNumber: 1,
    skill: 'Data Structures & Algorithms',
    title: 'Coding Task: Two-Pointer & Sliding Window Array Optimization',
    description: 'Solve two algorithmic problems in Python or C++ focused on maximum subarray sum and string anagram search.',
    type: 'coding',
    priority: 'High',
    difficulty: 'medium',
    estimatedMinutes: 20,
    status: 'completed',
    createdDate: '2026-07-28',
    dueDate: '2026-07-28',
    completionDate: '2026-07-28',
    score: 90,
    aiFeedback: {
      overallScore: 90,
      strengths: ['Optimal O(N) time complexity', 'Clean variable naming and edge case checks'],
      improvements: ['Annotate space complexity explicitly in docstrings'],
      recommendedAction: 'Move to voice explanation practice.',
    },
    codingProblem: {
      problemTitle: 'Sliding Window Maximum Subarray Sum',
      problemDescription: 'Given an array of integers `nums` and an integer `k`, find the contiguous subarray with length `k` that has the maximum sum and return its sum value.',
      supportedLanguages: ['python', 'javascript', 'cpp', 'java', 'go', 'rust', 'sql'],
      starterCode: {
        python: `def max_sub_array(nums: list[int], k: int) -> int:
    # Write your O(N) sliding window implementation here
    if not nums or k > len(nums):
        return 0
    window_sum = sum(nums[:k])
    max_sum = window_sum
    for i in range(k, len(nums)):
        window_sum += nums[i] - nums[i - k]
        max_sum = max(max_sum, window_sum)
    return max_sum

# Test
print(max_sub_array([2, 1, 5, 1, 3, 2], 3)) # Expected: 9
`,
        javascript: `function maxSubArray(nums, k) {
  if (!nums || k > nums.length) return 0;
  let windowSum = 0;
  for (let i = 0; i < k; i++) windowSum += nums[i];
  let maxSum = windowSum;
  for (let i = k; i < nums.length; i++) {
    windowSum += nums[i] - nums[i - k];
    maxSum = Math.max(maxSum, windowSum);
  }
  return maxSum;
}
console.log(maxSubArray([2, 1, 5, 1, 3, 2], 3)); // Expected: 9
`,
      },
      sampleTestCases: [
        { input: 'nums = [2, 1, 5, 1, 3, 2], k = 3', expectedOutput: '9' },
        { input: 'nums = [2, 3, 4, 1, 5], k = 2', expectedOutput: '7' },
      ],
    },
  },
  {
    id: 'task-3',
    dayNumber: 1,
    skill: 'Communication',
    title: 'Voice Practice: Explain a High-Concurrency Trade-off in 60s',
    description: 'Use the STAR method to describe a time you had to make a trade-off between consistency and availability.',
    type: 'voice_practice',
    priority: 'High',
    difficulty: 'medium',
    estimatedMinutes: 10,
    status: 'pending',
    createdDate: '2026-07-28',
    dueDate: '2026-07-28',
    voicePromptData: {
      promptText: 'In 60 seconds, describe a scenario where you chose eventual consistency over strong consistency. Explain why and how you measured the business impact.',
      followUpQuestionText: 'How did you handle potential stale reads for users during peak traffic bursts?',
      targetSeconds: 60,
    },
  },
  {
    id: 'task-4',
    dayNumber: 2,
    skill: 'System Design',
    title: 'Follow-Up Q&A: Rate Limiting Algorithms & Token Bucket',
    description: 'Answer AI interviewer follow-up questions comparing Leaky Bucket vs Token Bucket vs Sliding Window Logs.',
    type: 'followup_qa',
    priority: 'Critical',
    difficulty: 'hard',
    estimatedMinutes: 15,
    status: 'pending',
    createdDate: '2026-07-28',
    dueDate: '2026-07-29',
  },
  {
    id: 'task-5',
    dayNumber: 2,
    skill: 'Weekly Assessment',
    title: 'Weekly Readiness Assessment #1',
    description: 'Comprehensive 15-minute multi-module assessment evaluating System Design, DSA, and STAR verbal delivery.',
    type: 'weekly_assessment',
    priority: 'Critical',
    difficulty: 'hard',
    estimatedMinutes: 20,
    status: 'pending',
    createdDate: '2026-07-28',
    dueDate: '2026-07-30',
  },
];

export const INITIAL_MILESTONES: GuidedPlanMilestone[] = [
  {
    id: 'm1',
    title: 'Complete First Mock Interview',
    description: 'Finish a full 30-minute AI voice & video practice session.',
    iconName: '🏁',
    targetReadinessScore: 65,
    completed: true,
    progressPercent: 100,
  },
  {
    id: 'm2',
    title: 'Reach 70% Job Readiness',
    description: 'Raise technical and communication baseline scores above 70%.',
    iconName: '🎯',
    targetReadinessScore: 70,
    completed: true,
    progressPercent: 100,
  },
  {
    id: 'm3',
    title: 'Solve 10 Coding Problems',
    description: 'Complete 10 sandboxed code executions across Python, C++, or Java.',
    iconName: '💻',
    targetReadinessScore: 75,
    completed: false,
    progressPercent: 70, // 7/10
  },
  {
    id: 'm4',
    title: 'Complete 10 Voice Practices',
    description: 'Record 10 STAR verbal explanations with AI fluency scoring.',
    iconName: '🎤',
    targetReadinessScore: 78,
    completed: false,
    progressPercent: 60, // 6/10
  },
  {
    id: 'm5',
    title: 'Master System Design Architecture',
    description: 'Raise System Design score from 58% to above 75%.',
    iconName: '🧠',
    targetReadinessScore: 80,
    completed: false,
    progressPercent: 55,
  },
  {
    id: 'm6',
    title: 'Reach 85% Target Readiness',
    description: 'Qualify for final mock interview clearance.',
    iconName: '🎯',
    targetReadinessScore: 85,
    completed: false,
    progressPercent: 72,
  },
  {
    id: 'm7',
    title: 'Complete Final Mock Interview',
    description: 'Pass the final high-stakes benchmark interview.',
    iconName: '🏆',
    targetReadinessScore: 90,
    completed: false,
    progressPercent: 0,
  },
];

export const INITIAL_STREAK_STATS: GuidedPlanStreakStats = {
  currentStreakDays: 7,
  longestStreakDays: 12,
  tasksCompleted: 24,
  tasksSkipped: 2,
  totalPracticeMinutes: 285, // ~4h 45m
  codingProblemsSolved: 14,
  voiceExercisesCompleted: 9,
  mockInterviewsCompleted: 3,
};

export const INITIAL_PLAN_VERSIONS: PlanVersion[] = [
  {
    versionId: 'v1.0',
    versionName: 'Plan v1.0 (Initial Diagnostic)',
    createdDate: '2026-07-20',
    triggerReason: 'First interview session completed with AI Coach diagnostic',
    previousPriorities: {
      'System Design': 'Priority 1 — Critical',
      'Communication': 'Priority 2 — High',
      'Data Structures': 'Priority 2 — High',
    },
    newPriorities: {
      'System Design': 'Priority 1 — Critical',
      'Communication': 'Priority 2 — High',
      'Data Structures': 'Priority 3 — Medium',
    },
    changesSummary: 'Initial priority matrix generated based on target role requirements and mock interview diagnostic results.',
  },
  {
    versionId: 'v1.1',
    versionName: 'Plan v1.1 (Adaptive Replanned)',
    createdDate: '2026-07-26',
    triggerReason: 'Completed 3 System Design micro-lessons and Two Sum coding practice',
    previousPriorities: {
      'System Design': 'Priority 1 — Critical',
      'Communication': 'Priority 2 — High',
    },
    newPriorities: {
      'System Design': 'Priority 1 — Critical',
      'Communication': 'Priority 2 — High',
    },
    changesSummary: 'System Design remains Critical (-27% gap). Rebalanced daily duration to 45 mins per user time constraint.',
  },
];

export const INITIAL_WEEKLY_ASSESSMENTS: WeeklyAssessment[] = [
  {
    weekNumber: 1,
    title: 'Week 1 Foundation Check',
    topicsCovered: ['System Design Caching', 'Array Two Pointers', 'Behavioral STAR Intro'],
    status: 'completed',
    score: 78,
    completedDate: '2026-07-25',
    summaryFeedback: 'Great progress on algorithmic speed. System Design trade-offs need deeper verbal articulation.',
  },
  {
    weekNumber: 2,
    title: 'Week 2 System Design & Verbal Deep-Dive',
    topicsCovered: ['KV Cache Optimization', 'Rate Limiting Algorithms', 'High-Pressure Communication'],
    status: 'available',
  },
  {
    weekNumber: 3,
    title: 'Week 3 High-Stakes Final Readiness Check',
    topicsCovered: ['Full Architectural Defense', 'Hard Dynamic Programming', 'Executive Pitch'],
    status: 'upcoming',
  },
];

export const INITIAL_READINESS_HISTORY: ReadinessProgressPoint[] = [
  { label: 'Initial Baseline', date: '2026-07-15', score: 62, eventNote: 'Initial Diagnostic' },
  { label: 'Week 1 Assessment', date: '2026-07-22', score: 68, eventNote: 'Completed DSA practice' },
  { label: 'Week 2 Assessment', date: '2026-07-26', score: 72, eventNote: 'Completed System Design micro-lesson' },
  { label: 'Current Level', date: '2026-07-28', score: 76, eventNote: 'Completed Caching & Two-Pointer tasks' },
];

// LocalStorage key for client persistence
const GUIDED_PLAN_STORAGE_KEY = 'ai_career_coach_guided_plan_state';

export function loadGuidedPlanState(): GuidedPlanState {
  try {
    const raw = localStorage.getItem(GUIDED_PLAN_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.config && parsed.dailyTasks) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load Guided Plan state from localStorage:', err);
  }

  return {
    config: DEFAULT_GUIDED_PLAN_CONFIG,
    skillPriorities: INITIAL_SKILL_PRIORITIES,
    dailyTasks: INITIAL_TASKS,
    milestones: INITIAL_MILESTONES,
    streakStats: INITIAL_STREAK_STATS,
    planVersions: INITIAL_PLAN_VERSIONS,
    weeklyAssessments: INITIAL_WEEKLY_ASSESSMENTS,
    readinessHistory: INITIAL_READINESS_HISTORY,
    lastReplannedDate: '2026-07-28',
  };
}

export function saveGuidedPlanState(state: GuidedPlanState): void {
  try {
    localStorage.setItem(GUIDED_PLAN_STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Failed to save Guided Plan state to localStorage:', err);
  }
}

/**
 * Calculates interview countdown days and strategy stage
 */
export function calculateCountdownStrategy(interviewDateStr?: string) {
  if (!interviewDateStr) {
    return {
      daysLeft: null,
      stageTitle: 'Ongoing Continuous Readiness Plan',
      strategyDescription: 'Balanced long-term skill progression focused on fundamentals, problem-solving, and mock interviews.',
      focusRecommendation: 'Focus on key improvement areas at a steady pace of 30-45 minutes per day.',
    };
  }

  const targetDate = new Date(interviewDateStr);
  const now = new Date();
  const diffTime = targetDate.getTime() - now.getTime();
  const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  if (daysLeft > 30) {
    return {
      daysLeft,
      stageTitle: 'Phase 1: Deep Fundamentals & Concept Building',
      strategyDescription: 'Build deep foundational mastery in system design, data structures, and framework architecture.',
      focusRecommendation: 'Take daily micro-lessons and solve 1-2 medium coding problems daily.',
    };
  } else if (daysLeft >= 15) {
    return {
      daysLeft,
      stageTitle: 'Phase 2: Target Focus Areas & Applied Mock Practice',
      strategyDescription: 'Target key focus areas identified in mock interviews; practice coding speed and STAR verbal delivery.',
      focusRecommendation: 'Combine 1 system design task + 1 coding task + 1 voice practice exercise daily.',
    };
  } else if (daysLeft >= 7) {
    return {
      daysLeft,
      stageTitle: 'Phase 3: High-Priority Job-Specific Weaknesses',
      strategyDescription: 'Intense focus on top 2 critical gaps and role-specific requirements in job description.',
      focusRecommendation: 'Daily voice practice + 1 high-priority system design follow-up + full mock interview.',
    };
  } else if (daysLeft >= 1) {
    return {
      daysLeft,
      stageTitle: 'Phase 4: Targeted Polish & Mock Refinement',
      strategyDescription: 'Refine communication flow, eliminate filler words, review previous mistakes and key formulas.',
      focusRecommendation: 'Light revision + confidence building + 1 quick mock interview warm-up.',
    };
  } else {
    return {
      daysLeft: 0,
      stageTitle: 'Final Day: Mindset & Light Review',
      strategyDescription: 'Rest, review executive summaries of key projects, and maintain high confidence.',
      focusRecommendation: 'Light 10-minute voice warm-up and review your top strengths.',
    };
  }
}

/**
 * Automatically replans guided plan state after task completion or skill update
 */
export function replanGuidedPlanState(
  currentState: GuidedPlanState,
  completedTaskId: string,
  taskScore: number,
  aiFeedbackSummary?: string
): { updatedState: GuidedPlanState; replanMessage: string } {
  const taskIndex = currentState.dailyTasks.findIndex((t) => t.id === completedTaskId);
  if (taskIndex === -1) {
    return { updatedState: currentState, replanMessage: 'Task not found.' };
  }

  const completedTask = currentState.dailyTasks[taskIndex];
  const skillName = completedTask.skill;

  // 1. Mark task as completed with score
  const updatedTasks = [...currentState.dailyTasks];
  updatedTasks[taskIndex] = {
    ...completedTask,
    status: 'completed',
    score: taskScore,
    completionDate: new Date().toISOString().split('T')[0],
    aiFeedback: {
      overallScore: taskScore,
      strengths: [
        'Demonstrated clear understanding during execution',
        'Followed structured problem-solving approach',
      ],
      improvements: taskScore < 80 ? ['Practice explaining trade-offs under tighter time limits'] : ['Excellent performance! Keep building on this momentum.'],
      recommendedAction: taskScore >= 80 ? 'Skill score boosted! Moving to next focus area.' : 'Repeat similar task in 2 days to lock in learning.',
    },
  };

  // 2. Update streak stats
  const isCoding = completedTask.type === 'coding';
  const isVoice = completedTask.type === 'voice_practice';
  const updatedStreak: GuidedPlanStreakStats = {
    ...currentState.streakStats,
    tasksCompleted: currentState.streakStats.tasksCompleted + 1,
    totalPracticeMinutes: currentState.streakStats.totalPracticeMinutes + completedTask.estimatedMinutes,
    codingProblemsSolved: isCoding ? currentState.streakStats.codingProblemsSolved + 1 : currentState.streakStats.codingProblemsSolved,
    voiceExercisesCompleted: isVoice ? currentState.streakStats.voiceExercisesCompleted + 1 : currentState.streakStats.voiceExercisesCompleted,
  };

  // 3. Dynamically update skill priorities and scores
  const scoreBoost = Math.round((taskScore / 100) * 5); // 0-5 point boost
  let replanMessage = `Task "${completedTask.title}" completed (${taskScore}% score)!`;

  const updatedPriorities = currentState.skillPriorities.map((item) => {
    if (item.skillName === skillName || (skillName === 'Weekly Assessment' && item.priorityLevel.includes('Critical'))) {
      const newScore = Math.min(98, item.currentScore + scoreBoost);
      const newProgression = [...item.historicalProgression, newScore];
      
      // Determine new priority level
      let newPriority: SkillPriorityLevel = item.priorityLevel;
      if (newScore >= 80) newPriority = 'Priority 3 — Medium';
      else if (newScore >= 70) newPriority = 'Priority 2 — High';

      if (newPriority !== item.priorityLevel) {
        replanMessage += ` ⚡ ${skillName} score improved from ${item.currentScore}% to ${newScore}%! Priority updated to ${newPriority}.`;
      }

      return {
        ...item,
        currentScore: newScore,
        priorityLevel: newPriority,
        historicalProgression: newProgression,
        trend: 'improving' as const,
      };
    }
    return item;
  });

  // 4. Calculate overall readiness adjustment
  const avgSkillScore = Math.round(
    updatedPriorities.reduce((acc, curr) => acc + curr.currentScore, 0) / updatedPriorities.length
  );
  const currentReadiness = Math.min(95, Math.max(currentState.readinessHistory[currentState.readinessHistory.length - 1].score, avgSkillScore));

  const updatedReadinessHistory = [...currentState.readinessHistory];
  if (currentReadiness > currentState.readinessHistory[currentState.readinessHistory.length - 1].score) {
    updatedReadinessHistory.push({
      label: `Task Completed`,
      date: new Date().toISOString().split('T')[0],
      score: currentReadiness,
      eventNote: `Completed: ${completedTask.title}`,
    });
  }

  // 5. Update Milestones progress
  const updatedMilestones = currentState.milestones.map((m) => {
    if (m.id === 'm3' && isCoding) {
      const newPct = Math.min(100, m.progressPercent + 10);
      return { ...m, progressPercent: newPct, completed: newPct >= 100 };
    }
    if (m.id === 'm4' && isVoice) {
      const newPct = Math.min(100, m.progressPercent + 10);
      return { ...m, progressPercent: newPct, completed: newPct >= 100 };
    }
    if (m.id === 'm5' && skillName === 'System Design') {
      const sysScore = updatedPriorities.find((p) => p.skillName === 'System Design')?.currentScore || 58;
      const newPct = Math.min(100, Math.round(((sysScore - 58) / (75 - 58)) * 100));
      return { ...m, progressPercent: Math.max(0, newPct), completed: sysScore >= 75 };
    }
    if (m.id === 'm6') {
      const newPct = Math.min(100, Math.round((currentReadiness / currentState.config.targetReadinessScore) * 100));
      return { ...m, progressPercent: newPct, completed: currentReadiness >= currentState.config.targetReadinessScore };
    }
    return m;
  });

  // 6. Append new Plan Version record
  const newVersion: PlanVersion = {
    versionId: `v${(currentState.planVersions.length + 1).toFixed(1)}`,
    versionName: `Plan v${(currentState.planVersions.length + 1).toFixed(1)} (Auto-Replanned)`,
    createdDate: new Date().toISOString().split('T')[0],
    triggerReason: `Completed task: ${completedTask.title}`,
    previousPriorities: currentState.skillPriorities.reduce((acc, curr) => {
      acc[curr.skillName] = curr.priorityLevel;
      return acc;
    }, {} as Record<string, SkillPriorityLevel>),
    newPriorities: updatedPriorities.reduce((acc, curr) => {
      acc[curr.skillName] = curr.priorityLevel;
      return acc;
    }, {} as Record<string, SkillPriorityLevel>),
    changesSummary: `Evaluated performance score ${taskScore}%. Updated ${skillName} skill trajectory. Future tasks auto-reweighted.`,
  };

  const updatedVersions = [newVersion, ...currentState.planVersions];

  const newState: GuidedPlanState = {
    ...currentState,
    dailyTasks: updatedTasks,
    skillPriorities: updatedPriorities,
    streakStats: updatedStreak,
    milestones: updatedMilestones,
    readinessHistory: updatedReadinessHistory,
    planVersions: updatedVersions,
    lastReplannedDate: new Date().toISOString().split('T')[0],
    lastCompletedTaskId: completedTaskId,
  };

  saveGuidedPlanState(newState);

  return { updatedState: newState, replanMessage };
}
