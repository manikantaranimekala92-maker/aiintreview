import React, { useState, useMemo } from 'react';
import {
  User,
  InterviewSession,
  GuidedPlanState,
  GuidedPlanTask,
  DifficultyLevel,
  GuidedPlanConfig,
} from '../types';
import {
  loadGuidedPlanState,
  saveGuidedPlanState,
  replanGuidedPlanState,
  calculateCountdownStrategy,
} from '../services/guidedPlanEngine';
import {
  Sparkles,
  Play,
  CheckCircle2,
  Clock,
  Calendar as CalendarIcon,
  Zap,
  BookOpen,
  Award,
  TrendingUp,
  AlertTriangle,
  Sliders,
  X,
  BrainCircuit,
  Target,
  History,
  Flame,
  Layers,
  ArrowRight,
  Mic,
  Terminal,
} from 'lucide-react';

interface AdaptiveGuidedPlanViewProps {
  currentUser: User;
  sessions: InterviewSession[];
  onStartInterview: (
    jobTitle?: string,
    mode?: 'video' | 'voice' | 'text' | 'coding',
    difficulty?: DifficultyLevel,
    skills?: string[]
  ) => void;
  onOpenSkillGaps?: () => void;
  onOpenLearning: () => void;
  onOpenHistory: () => void;
}

export const AdaptiveGuidedPlanView: React.FC<AdaptiveGuidedPlanViewProps> = ({
  currentUser,
  sessions,
  onStartInterview,
  onOpenSkillGaps,
  onOpenLearning,
  onOpenHistory,
}) => {
  const [planState, setPlanState] = useState<GuidedPlanState>(() => loadGuidedPlanState());
  const [activePlanTab, setActivePlanTab] = useState<'today' | 'schedule' | 'priorities' | 'milestones'>('today');
  const [selectedDay, setSelectedDay] = useState<number>(1);

  // Modals
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [showPlanHistoryModal, setShowPlanHistoryModal] = useState<boolean>(false);
  const [activeTaskModal, setActiveTaskModal] = useState<GuidedPlanTask | null>(null);

  // Execution States
  const [quizSelectedOption, setQuizSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [activeCodeLanguage, setActiveCodeLanguage] = useState<string>('python');
  const [userCode, setUserCode] = useState<string>('');
  const [compilerOutput, setCompilerOutput] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);

  // Voice State
  const [isRecordingVoice, setIsRecordingVoice] = useState<boolean>(false);
  const [voiceRecordedTime, setVoiceRecordedTime] = useState<number>(0);
  const [recordedVoiceTranscript, setRecordedVoiceTranscript] = useState<string>('');
  const [voiceFollowUpInput, setVoiceFollowUpInput] = useState<string>('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [editConfig, setEditConfig] = useState<GuidedPlanConfig>({ ...planState.config });

  const latestSessionScore = sessions[0]?.overallScore || 76;
  const countdownInfo = useMemo(
    () => calculateCountdownStrategy(planState.config.interviewDate),
    [planState.config.interviewDate]
  );

  const todayTasks = useMemo(() => {
    return planState.dailyTasks.filter((t) => t.dayNumber === selectedDay);
  }, [planState.dailyTasks, selectedDay]);

  const completedTasksCount = planState.dailyTasks.filter((t) => t.status === 'completed').length;
  const totalTasksCount = planState.dailyTasks.length;
  const planCompletionPct = Math.round((completedTasksCount / Math.max(1, totalTasksCount)) * 100);

  const criticalSkill = useMemo(() => {
    return (
      planState.skillPriorities.find((s) => s.priorityLevel.includes('Critical')) ||
      planState.skillPriorities[0]
    );
  }, [planState.skillPriorities]);

  const top3FocusAreas = useMemo(() => planState.skillPriorities.slice(0, 3), [planState.skillPriorities]);
  const isFinalMockInterviewReady = latestSessionScore >= planState.config.targetReadinessScore;

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleSaveConfig = () => {
    const updatedState: GuidedPlanState = {
      ...planState,
      config: editConfig,
      lastReplannedDate: new Date().toISOString().split('T')[0],
    };
    setPlanState(updatedState);
    saveGuidedPlanState(updatedState);
    setShowConfigModal(false);
    triggerToast(`⚡ Guided Plan updated for ${editConfig.targetRole}! Goal parameters auto-adjusted.`);
  };

  const handleStartTask = (task: GuidedPlanTask) => {
    setActiveTaskModal(task);
    setQuizSelectedOption(null);
    setQuizSubmitted(false);

    if (task.codingProblem) {
      const defaultLang = 'python';
      setActiveCodeLanguage(defaultLang);
      setUserCode(task.codingProblem.starterCode[defaultLang] || '# Write Python code\n');
      setCompilerOutput(null);
    }

    if (task.voicePromptData) {
      setIsRecordingVoice(false);
      setVoiceRecordedTime(0);
      setRecordedVoiceTranscript('');
      setVoiceFollowUpInput('');
    }
  };

  const handleCompleteTaskExecution = (score: number, note?: string) => {
    if (!activeTaskModal) return;
    const { updatedState, replanMessage } = replanGuidedPlanState(
      planState,
      activeTaskModal.id,
      score,
      note
    );
    setPlanState(updatedState);
    saveGuidedPlanState(updatedState);
    setActiveTaskModal(null);
    triggerToast(replanMessage);
  };

  const handleRunCompiler = () => {
    setIsCompiling(true);
    setCompilerOutput(null);
    setTimeout(() => {
      setIsCompiling(false);
      setCompilerOutput(
        '✓ Test Case 1 Passed (Output: [2, 7])\n✓ Test Case 2 Passed (Execution Time: 12ms)\nAll test cases passed cleanly!'
      );
    }, 1200);
  };

  const handleToggleVoiceRecording = () => {
    if (!isRecordingVoice) {
      setIsRecordingVoice(true);
      setVoiceRecordedTime(0);
      const interval = setInterval(() => {
        setVoiceRecordedTime((prev) => {
          if (prev >= 30) {
            clearInterval(interval);
            setIsRecordingVoice(false);
            setRecordedVoiceTranscript(
              `"I designed a microservice using Python and Redis Cache-Aside to optimize inference latency from 450ms down to 22ms."`
            );
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      setIsRecordingVoice(false);
      setRecordedVoiceTranscript(
        `"I designed a microservice using Python and Redis Cache-Aside to optimize inference latency from 450ms down to 22ms."`
      );
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20 relative">
      {/* Toast Notice */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 max-w-md bg-[#FFFFFF] dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2D3340] text-[#111827] dark:text-white p-4 rounded-2xl shadow-xl flex items-start space-x-3">
          <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-bold text-[#111827] dark:text-white block font-mono text-[10px]">AI Adaptive Replanning Notice</span>
            <p className="text-[#6B7280] dark:text-[#9CA3AF]">{toastMessage}</p>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white p-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 sm:p-8 bg-[#FFFFFF] dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2D3340] rounded-2xl shadow-xs space-y-6 relative overflow-hidden transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340] text-[#111827] dark:text-white text-xs font-semibold flex items-center space-x-1.5">
                <BrainCircuit className="w-3.5 h-3.5 text-[#111827] dark:text-white" />
                <span>Adaptive AI Guided Plan</span>
              </span>
              {planState.config.targetCompany && (
                <span className="px-2.5 py-1 rounded-full bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340] text-[#374151] dark:text-[#F9FAFB] text-xs font-bold">
                  Target: {planState.config.targetCompany}
                </span>
              )}
              <span className="px-2.5 py-1 rounded-full bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340] text-[#111827] dark:text-white text-xs font-bold flex items-center space-x-1">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{planState.streakStats.currentStreakDays} Day Streak</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827] dark:text-white">
              {planState.config.targetRole} Preparation Plan
            </h1>
            <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9CA3AF] font-medium leading-relaxed">
              Dynamic AI plan that continuously analyzes your interview performance, prioritizes key areas for improvement, and adapts daily practice tasks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setShowConfigModal(true)}
              className="px-4 py-2.5 rounded-xl bg-[#FAFAFA] dark:bg-[#1F232D] hover:bg-[#F3F4F6] dark:hover:bg-[#2D3340] text-[#111827] dark:text-white font-bold text-xs border border-[#E5E7EB] dark:border-[#2D3340] flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Sliders className="w-4 h-4 text-[#6B7280] dark:text-[#9CA3AF]" />
              <span>Configure Plan</span>
            </button>
            <button
              onClick={() => setShowPlanHistoryModal(true)}
              className="px-4 py-2.5 rounded-xl bg-[#FAFAFA] dark:bg-[#1F232D] hover:bg-[#F3F4F6] dark:hover:bg-[#2D3340] text-[#111827] dark:text-white font-bold text-xs border border-[#E5E7EB] dark:border-[#2D3340] flex items-center space-x-2 transition-all cursor-pointer"
            >
              <History className="w-4 h-4 text-[#6B7280] dark:text-[#9CA3AF]" />
              <span>Plan History ({planState.planVersions.length})</span>
            </button>
            <button
              onClick={() => onStartInterview(planState.config.targetRole, 'voice', 'medium')}
              className="px-5 py-2.5 rounded-xl bg-[#111827] dark:bg-indigo-600 hover:bg-[#1f2937] dark:hover:bg-indigo-500 text-white font-bold text-xs shadow-xs flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Take AI Interview</span>
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#E5E7EB] dark:border-[#2D3340] text-xs relative z-10">
          <div className="p-3.5 rounded-xl bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340] space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#6B7280] dark:text-[#9CA3AF] font-bold uppercase">
              <span>Interview Date</span>
              <Clock className="w-3.5 h-3.5 text-[#111827] dark:text-white" />
            </div>
            <p className="text-lg font-extrabold text-[#111827] dark:text-white font-mono">
              {countdownInfo.daysLeft !== null ? `${countdownInfo.daysLeft} DAYS LEFT` : 'Continuous'}
            </p>
            <span className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF] block truncate">{countdownInfo.stageTitle}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340] space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#6B7280] dark:text-[#9CA3AF] font-bold uppercase">
              <span>Job Readiness</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400 font-mono">
              {latestSessionScore}% <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">/ {planState.config.targetReadinessScore}% Target</span>
            </p>
            <span className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF] block truncate">AI coaching estimate</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340] space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#6B7280] dark:text-[#9CA3AF] font-bold uppercase">
              <span>Plan Completion</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#111827] dark:text-white" />
            </div>
            <p className="text-lg font-extrabold text-[#111827] dark:text-white font-mono">
              {planCompletionPct}% <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">({completedTasksCount}/{totalTasksCount})</span>
            </p>
            <span className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF] block truncate">{planState.config.dailyAvailableMinutes} mins/day allocated</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340] space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#6B7280] dark:text-[#9CA3AF] font-bold uppercase">
              <span>Current Priority</span>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            </div>
            <p className="text-lg font-extrabold text-rose-700 dark:text-rose-400 font-mono truncate">
              {criticalSkill.skillName} ({criticalSkill.currentScore}%)
            </p>
            <span className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF] block truncate">{criticalSkill.priorityLevel}</span>
          </div>
        </div>
      </div>

      {/* Final Benchmark Trigger */}
      {isFinalMockInterviewReady && (
        <div className="p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2D3340] text-[#111827] dark:text-white shadow-xs space-y-3 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-mono font-bold text-xs uppercase inline-block">
                🎯 READY FOR FINAL MOCK INTERVIEW
              </span>
              <h2 className="text-xl font-extrabold text-[#111827] dark:text-white">You reached {latestSessionScore}% Job Readiness!</h2>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                Your performance in Python, System Design, and Communication qualifies you for a final benchmark interview.
              </p>
            </div>
            <button
              onClick={() => onStartInterview(planState.config.targetRole, 'video', 'hard')}
              className="px-6 py-3 rounded-xl bg-[#111827] dark:bg-indigo-600 hover:bg-[#1f2937] dark:hover:bg-indigo-500 text-white font-extrabold text-xs shadow-xs shrink-0 flex items-center space-x-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Benchmark Interview</span>
            </button>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-[#E5E7EB] dark:border-[#2D3340] pb-2 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActivePlanTab('today')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center space-x-2 shrink-0 cursor-pointer ${
            activePlanTab === 'today'
              ? 'bg-[#111827] dark:bg-indigo-600 text-white shadow-xs'
              : 'bg-[#FFFFFF] dark:bg-[#171A21] text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white border border-[#E5E7EB] dark:border-[#2D3340]'
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          <span>Today's Plan</span>
        </button>

        <button
          onClick={() => setActivePlanTab('schedule')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center space-x-2 shrink-0 cursor-pointer ${
            activePlanTab === 'schedule'
              ? 'bg-[#111827] dark:bg-indigo-600 text-white shadow-xs'
              : 'bg-[#FFFFFF] dark:bg-[#171A21] text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white border border-[#E5E7EB] dark:border-[#2D3340]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Multi-Day Schedule ({planState.dailyTasks.length})</span>
        </button>

        <button
          onClick={() => setActivePlanTab('priorities')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center space-x-2 shrink-0 cursor-pointer ${
            activePlanTab === 'priorities'
              ? 'bg-[#111827] dark:bg-indigo-600 text-white shadow-xs'
              : 'bg-[#FFFFFF] dark:bg-[#171A21] text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white border border-[#E5E7EB] dark:border-[#2D3340]'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Priority Matrix</span>
        </button>

        <button
          onClick={() => setActivePlanTab('milestones')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center space-x-2 shrink-0 cursor-pointer ${
            activePlanTab === 'milestones'
              ? 'bg-[#111827] dark:bg-indigo-600 text-white shadow-xs'
              : 'bg-[#FFFFFF] dark:bg-[#171A21] text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white border border-[#E5E7EB] dark:border-[#2D3340]'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Milestones & Analytics</span>
        </button>
      </div>

      {/* TAB 1: TODAY'S PLAN */}
      {activePlanTab === 'today' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2D3340] space-y-4 shadow-xs transition-colors">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB] dark:border-[#2D3340]">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-rose-700 dark:text-rose-400 block">
                  🔴 CURRENT PRIORITY 1 FOCUS
                </span>
                <h3 className="text-lg font-bold text-[#111827] dark:text-white">
                  {criticalSkill.skillName} — {criticalSkill.currentScore}% Score
                </h3>
                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] leading-relaxed max-w-2xl">
                  <strong>Why prioritized:</strong> {criticalSkill.reasoning}
                </p>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <button onClick={onOpenLearning} className="px-3.5 py-2 rounded-xl bg-[#111827] dark:bg-indigo-600 hover:bg-[#1f2937] dark:hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer">
                  Learn Concepts
                </button>
              </div>
            </div>

            {/* Today's Tasks */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono font-bold uppercase text-[#6B7280] dark:text-[#9CA3AF]">Today's Tasks ({todayTasks.length})</h4>
                <span className="text-xs font-mono text-[#111827] dark:text-white font-bold">
                  Time Budget: {planState.config.dailyAvailableMinutes} mins / day
                </span>
              </div>

              {todayTasks.map((task) => {
                const isCompleted = task.status === 'completed';
                return (
                  <div
                    key={task.id}
                    className={`p-5 rounded-xl border transition-all space-y-3 ${
                      isCompleted
                        ? 'bg-[#FAFAFA] dark:bg-[#1F232D]/60 border-[#E5E7EB] dark:border-[#2D3340]'
                        : 'bg-[#FFFFFF] dark:bg-[#171A21] border-[#E5E7EB] dark:border-[#2D3340] hover:border-[#111827] dark:hover:border-indigo-500'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            task.priority === 'Critical' ? 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800' : 'bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          }`}>
                            {task.priority} Priority
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FAFAFA] dark:bg-[#1F232D] text-[#374151] dark:text-[#F9FAFB] border border-[#E5E7EB] dark:border-[#2D3340]">
                            {task.skill}
                          </span>
                          <span className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF] font-mono flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{task.estimatedMinutes} mins</span>
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-[#111827] dark:text-white flex items-center space-x-2">
                          <span>{task.title}</span>
                          {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                        </h4>
                        <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{task.description}</p>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        {isCompleted ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-mono font-bold text-xs">
                            Score: {task.score}%
                          </span>
                        ) : (
                          <button
                            onClick={() => handleStartTask(task)}
                            className="px-4 py-2 rounded-xl bg-[#111827] dark:bg-indigo-600 hover:bg-[#1f2937] dark:hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 cursor-pointer"
                          >
                            <span>Start Task</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Priority Focus Areas */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase text-[#6B7280] dark:text-[#9CA3AF]">Top Priority Focus Areas</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {top3FocusAreas.map((sg, idx) => (
                <div key={sg.skillName} className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2D3340] space-y-3 shadow-xs transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase text-[#9CA3AF]">Rank #{idx + 1}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                      {sg.priorityLevel.split('—')[1]?.trim() || 'High'}
                    </span>
                  </div>
                  <h5 className="text-sm font-bold text-[#111827] dark:text-white">{sg.skillName}</h5>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono text-[#6B7280] dark:text-[#9CA3AF]">
                      <span>Score: {sg.currentScore}%</span>
                      <span>Target: {sg.targetScore}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#FAFAFA] dark:bg-[#1F232D] overflow-hidden">
                      <div className="h-full bg-[#111827] dark:bg-indigo-500 rounded-full" style={{ width: `${sg.currentScore}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MULTI-DAY SCHEDULE */}
      {activePlanTab === 'schedule' && (
        <div className="p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2D3340] space-y-6 shadow-xs transition-colors">
          <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB] dark:border-[#2D3340]">
            <h3 className="text-base font-extrabold text-[#111827] dark:text-white">Adaptive Tasks Schedule</h3>
            <div className="flex space-x-2">
              {[1, 2, 3].map((dayNum) => (
                <button
                  key={dayNum}
                  onClick={() => setSelectedDay(dayNum)}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold cursor-pointer ${
                    selectedDay === dayNum ? 'bg-[#111827] dark:bg-indigo-600 text-white' : 'bg-[#FAFAFA] dark:bg-[#1F232D] text-[#374151] dark:text-[#F9FAFB] border border-[#E5E7EB] dark:border-[#2D3340]'
                  }`}
                >
                  Day {dayNum}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {planState.dailyTasks.filter((t) => t.dayNumber === selectedDay).map((task) => (
              <div key={task.id} className="p-4 rounded-xl bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340] flex items-center justify-between text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-[#111827] dark:text-white">{task.title}</span>
                  <p className="text-[#6B7280] dark:text-[#9CA3AF]">{task.description}</p>
                </div>
                <button onClick={() => handleStartTask(task)} className="px-3.5 py-1.5 rounded-xl bg-[#111827] dark:bg-indigo-600 text-white font-bold text-xs cursor-pointer">
                  {task.status === 'completed' ? 'Review' : 'Start'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PRIORITY MATRIX */}
      {activePlanTab === 'priorities' && (
        <div className="p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2D3340] space-y-4 shadow-xs transition-colors">
          <h3 className="text-base font-extrabold text-[#111827] dark:text-white">AI Skill Priority Matrix</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#E5E7EB] dark:border-[#2D3340] text-[#6B7280] dark:text-[#9CA3AF] uppercase font-mono text-[10px]">
                  <th className="p-3">Skill Name</th>
                  <th className="p-3">Importance</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">Priority Level</th>
                  <th className="p-3">Reasoning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#2D3340]">
                {planState.skillPriorities.map((item) => (
                  <tr key={item.skillName}>
                    <td className="p-3 font-bold text-[#111827] dark:text-white">{item.skillName}</td>
                    <td className="p-3 font-mono font-bold text-[#111827] dark:text-white">{item.importanceToRole}</td>
                    <td className="p-3 font-mono font-bold text-[#111827] dark:text-white">{item.currentScore}%</td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                        {item.priorityLevel}
                      </span>
                    </td>
                    <td className="p-3 text-[#6B7280] dark:text-[#9CA3AF]">{item.reasoning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: MILESTONES & ANALYTICS */}
      {activePlanTab === 'milestones' && (
        <div className="p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2D3340] space-y-4 shadow-xs transition-colors">
          <h3 className="text-base font-extrabold text-[#111827] dark:text-white">Milestones Progress</h3>
          <div className="space-y-3">
            {planState.milestones.map((m) => (
              <div key={m.id} className="p-4 rounded-xl bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340] space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-[#111827] dark:text-white">
                  <span>{m.iconName} {m.title}</span>
                  <span>{m.progressPercent}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#E5E7EB] dark:bg-[#2D3340] overflow-hidden">
                  <div className="h-full bg-[#111827] dark:bg-indigo-500 rounded-full" style={{ width: `${m.progressPercent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EXECUTION MODAL */}
      {activeTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-[#FFFFFF] dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2D3340] rounded-2xl p-6 text-[#111827] dark:text-white space-y-5 shadow-xl relative">
            <button onClick={() => setActiveTaskModal(null)} className="absolute top-5 right-5 text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-extrabold text-[#111827] dark:text-white">{activeTaskModal.title}</h3>

            {/* Micro Lesson */}
            {activeTaskModal.type === 'micro_lesson' && activeTaskModal.lessonData && (
              <div className="space-y-4 text-xs">
                <p className="text-[#374151] dark:text-[#F9FAFB]">{activeTaskModal.lessonData.overview}</p>
                <div className="p-4 rounded-xl bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340] space-y-3">
                  <p className="font-bold text-[#111827] dark:text-white">{activeTaskModal.lessonData.quiz.question}</p>
                  {activeTaskModal.lessonData.quiz.options.map((opt, oIdx) => (
                    <button
                      key={oIdx}
                      onClick={() => setQuizSelectedOption(oIdx)}
                      className={`w-full text-left p-3 rounded-xl border text-xs cursor-pointer ${
                        quizSelectedOption === oIdx ? 'bg-[#111827] dark:bg-indigo-600 border-[#111827] dark:border-indigo-500 text-white font-bold' : 'bg-[#FFFFFF] dark:bg-[#171A21] border-[#E5E7EB] dark:border-[#2D3340] text-[#374151] dark:text-[#F9FAFB]'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                  <button
                    onClick={() => handleCompleteTaskExecution(92, 'Passed lesson concept quiz.')}
                    className="px-4 py-2 rounded-xl bg-[#111827] dark:bg-indigo-600 text-white font-bold text-xs cursor-pointer"
                  >
                    Submit Quiz & Replan Plan
                  </button>
                </div>
              </div>
            )}

            {/* Coding Practice Compiler */}
            {activeTaskModal.type === 'coding' && activeTaskModal.codingProblem && (
              <div className="space-y-4 text-xs">
                <p className="text-[#374151] dark:text-[#F9FAFB]">{activeTaskModal.codingProblem.problemDescription}</p>
                <textarea
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  className="w-full h-40 bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340] rounded-xl p-3 font-mono text-xs text-[#111827] dark:text-white"
                />
                <div className="flex justify-between">
                  <button onClick={handleRunCompiler} className="px-4 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340] text-[#111827] dark:text-white font-mono font-bold text-xs cursor-pointer">
                    {isCompiling ? 'Running...' : 'Run Code'}
                  </button>
                  <button onClick={() => handleCompleteTaskExecution(90, 'Submitted code execution solution.')} className="px-4 py-2 rounded-xl bg-[#111827] dark:bg-indigo-600 text-white font-bold text-xs cursor-pointer">
                    Submit Solution & Replan
                  </button>
                </div>
                {compilerOutput && <pre className="p-3 bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340] text-[#111827] dark:text-white rounded-xl font-mono text-[11px]">{compilerOutput}</pre>}
              </div>
            )}

            {/* Voice Practice */}
            {activeTaskModal.type === 'voice_practice' && activeTaskModal.voicePromptData && (
              <div className="space-y-4 text-xs">
                <p className="text-[#111827] dark:text-white font-bold">"{activeTaskModal.voicePromptData.promptText}"</p>
                <div className="p-6 bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340] rounded-xl text-center space-y-3">
                  <div className="text-2xl font-mono font-bold text-[#111827] dark:text-white">00:{voiceRecordedTime.toString().padStart(2, '0')}s</div>
                  <button onClick={handleToggleVoiceRecording} className="px-5 py-2.5 rounded-full bg-[#111827] dark:bg-indigo-600 text-white font-bold text-xs cursor-pointer">
                    {isRecordingVoice ? 'Recording... Stop' : 'Start Voice Recording'}
                  </button>
                  {recordedVoiceTranscript && <p className="italic text-[#374151] dark:text-[#F9FAFB] text-left bg-white dark:bg-[#171A21] p-3 border border-[#E5E7EB] dark:border-[#2D3340] rounded-xl">"{recordedVoiceTranscript}"</p>}
                </div>
                {recordedVoiceTranscript && (
                  <button onClick={() => handleCompleteTaskExecution(88, 'Voice exercise completed with high clarity.')} className="px-4 py-2 rounded-xl bg-[#111827] dark:bg-indigo-600 text-white font-bold text-xs cursor-pointer">
                    Complete Voice Practice & Replan
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONFIG MODAL */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#FFFFFF] dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2D3340] rounded-2xl p-6 text-[#111827] dark:text-white space-y-4 relative shadow-xl">
            <button onClick={() => setShowConfigModal(false)} className="absolute top-5 right-5 text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-extrabold text-[#111827] dark:text-white">Guided Plan Setup</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#6B7280] dark:text-[#9CA3AF] font-mono text-[10px] uppercase font-bold mb-1">Target Role</label>
                <input
                  type="text"
                  value={editConfig.targetRole}
                  onChange={(e) => setEditConfig({ ...editConfig, targetRole: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340] text-[#111827] dark:text-white font-bold"
                />
              </div>
              <div>
                <label className="block text-[#6B7280] dark:text-[#9CA3AF] font-mono text-[10px] uppercase font-bold mb-1">Target Company</label>
                <input
                  type="text"
                  value={editConfig.targetCompany || ''}
                  onChange={(e) => setEditConfig({ ...editConfig, targetCompany: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340] text-[#111827] dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[#6B7280] dark:text-[#9CA3AF] font-mono text-[10px] uppercase font-bold mb-1">Daily Available Minutes</label>
                <select
                  value={editConfig.dailyAvailableMinutes}
                  onChange={(e) => setEditConfig({ ...editConfig, dailyAvailableMinutes: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340] text-[#111827] dark:text-white font-bold"
                >
                  <option value={15}>15 mins / day</option>
                  <option value={30}>30 mins / day</option>
                  <option value={45}>45 mins / day</option>
                  <option value={60}>1 hour / day</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button onClick={() => setShowConfigModal(false)} className="px-3 py-2 bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340] text-[#374151] dark:text-white rounded-xl text-xs cursor-pointer">Cancel</button>
              <button onClick={handleSaveConfig} className="px-4 py-2 bg-[#111827] dark:bg-indigo-600 text-white rounded-xl font-bold text-xs cursor-pointer">Save & Replan</button>
            </div>
          </div>
        </div>
      )}

      {/* PLAN VERSION HISTORY MODAL */}
      {showPlanHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#FFFFFF] dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2D3340] rounded-2xl p-6 text-[#111827] dark:text-white space-y-4 relative shadow-xl">
            <button onClick={() => setShowPlanHistoryModal(false)} className="absolute top-5 right-5 text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-extrabold text-[#111827] dark:text-white">Plan Version History Log</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto text-xs">
              {planState.planVersions.map((v) => (
                <div key={v.versionId} className="p-3 bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340] rounded-xl space-y-1">
                  <span className="font-bold text-[#111827] dark:text-white">{v.versionName}</span>
                  <p className="text-[#6B7280] dark:text-[#9CA3AF]">{v.changesSummary}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
