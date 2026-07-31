import React, { useState, useMemo } from 'react';
import {
  User,
  InterviewSession,
  JobDescription,
  InterviewMode,
  DifficultyLevel,
  GuidedPlanState,
  GuidedPlanTask,
} from '../types';
import { calculateCandidateFocusAreas } from '../utils/skillGapCalculator';
import { JOB_ROLE_REQUIREMENTS } from '../data/jobRoleRequirements';
import {
  loadGuidedPlanState,
  saveGuidedPlanState,
  calculateCountdownStrategy,
} from '../services/guidedPlanEngine';
import {
  Sparkles,
  Play,
  PlayCircle,
  Target,
  BookOpen,
  History,
  ArrowRight,
  BrainCircuit,
  Zap,
  MessageSquare,
  Award,
  TrendingUp,
  CheckCircle2,
  Clock,
  Briefcase,
  AlertTriangle,
  Video,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  X,
  FileText,
  Calendar,
  Flame,
  Layers,
  Upload,
  Plus,
  Search,
  Bell,
  Settings,
  Sliders,
  Check,
  CheckSquare,
  BarChart3,
  TrendingDown,
  ExternalLink,
  Bot,
  AlertCircle,
  Code,
  Mic,
  Star,
  Activity,
  User as UserIcon,
} from 'lucide-react';

export interface CandidateDashboardProps {
  currentUser: User;
  sessions: InterviewSession[];
  jobs: JobDescription[];
  onStartInterview: (
    jobTitle?: string,
    mode?: InterviewMode,
    difficulty?: DifficultyLevel,
    skills?: string[]
  ) => void;
  onViewSession: (session: InterviewSession) => void;
  onOpenSkillGaps?: () => void;
  onOpenLearning: () => void;
  onOpenHistory: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const CandidateDashboard: React.FC<CandidateDashboardProps> = ({
  currentUser,
  sessions,
  jobs,
  onStartInterview,
  onViewSession,
  onOpenSkillGaps,
  onOpenLearning,
  onOpenHistory,
  onNavigateTab,
}) => {
  // State for Target Role
  const [targetRole, setTargetRole] = useState<string>(
    currentUser.preferredJobRole || currentUser.title || 'Senior AI / ML Engineer'
  );
  const [isChangingRole, setIsChangingRole] = useState<boolean>(false);

  // Guided Plan State
  const [planState, setPlanState] = useState<GuidedPlanState>(() => loadGuidedPlanState());

  // Interactive Modals State
  const [showNotificationPopup, setShowNotificationPopup] = useState<boolean>(false);
  const [showReadinessModal, setShowReadinessModal] = useState<boolean>(false);
  const [showSkillDetailModal, setShowSkillDetailModal] = useState<any | null>(null);
  const [showJobMatchModal, setShowJobMatchModal] = useState<boolean>(false);
  const [showCountdownModal, setShowCountdownModal] = useState<boolean>(false);
  const [showCompareModal, setShowCompareModal] = useState<boolean>(false);

  // Skill Progress Selected Tab
  const [selectedSkillTrend, setSelectedSkillTrend] = useState<string>('System Design');

  // Job Description Input in Job Match Modal
  const [jobDescInput, setJobDescInput] = useState<string>('');
  const [jobDescToast, setJobDescToast] = useState<string | null>(null);

  // New Interview Date Input for Countdown
  const [newInterviewDate, setNewInterviewDate] = useState<string>(planState.config.interviewDate || '2026-08-09');

  // Candidate sessions filtering
  const candidateSessions = useMemo(() => {
    return sessions.filter(
      (s) =>
        s.candidateEmail?.toLowerCase() === currentUser.email.toLowerCase() ||
        s.candidateId === currentUser.id ||
        !s.candidateEmail
    );
  }, [sessions, currentUser]);

  const hasSessions = candidateSessions.length > 0;
  const latestSession = candidateSessions[0];
  const previousSession = candidateSessions[1];

  // Unfinished interview session check
  const unfinishedSession = useMemo(() => {
    return candidateSessions.find((s) => s.status === 'in_progress' || (s.answers && s.answers.length < (s.totalQuestions || 10)));
  }, [candidateSessions]);

  // Target Role configuration
  const activeRoleConfig = useMemo(() => {
    return (
      JOB_ROLE_REQUIREMENTS.find(
        (r) =>
          r.title.toLowerCase().includes(targetRole.toLowerCase()) ||
          targetRole.toLowerCase().includes(r.title.toLowerCase())
      ) || JOB_ROLE_REQUIREMENTS[0]
    );
  }, [targetRole]);

  // Dynamic Focus Areas calculation
  const { skills: gapSkills, summary: gapSummary } = useMemo(() => {
    return calculateCandidateFocusAreas(candidateSessions, activeRoleConfig);
  }, [candidateSessions, activeRoleConfig]);

  // Job Readiness Score
  const readinessScore = useMemo(() => {
    if (hasSessions && latestSession?.overallScore) {
      return Math.round(latestSession.overallScore * 0.9);
    }
    return 76;
  }, [hasSessions, latestSession]);

  const targetReadinessScore = planState.config.targetReadinessScore || 85;

  // Countdown info
  const countdownInfo = useMemo(() => {
    return calculateCountdownStrategy(planState.config.interviewDate);
  }, [planState.config.interviewDate]);

  // Priority Focus Areas
  const focusAreas = useMemo(() => {
    if (hasSessions && gapSkills.length > 0) {
      return gapSkills.slice(0, 3).map((s) => ({
        skillName: s.skillName,
        currentScore: s.currentLevel,
        targetScore: s.requiredLevel,
        severity: s.priority === 'CRITICAL' ? 'CRITICAL' : s.priority === 'HIGH' ? 'HIGH' : 'MEDIUM',
        missing: s.missingConcepts || ['Need more STAR structure details', 'Trade-off analysis under pressure'],
      }));
    }
    return [
      {
        skillName: 'System Design',
        currentScore: 58,
        targetScore: 80,
        severity: 'CRITICAL',
        missing: ['Weak scalability explanations', 'Limited architecture knowledge', 'Difficulty explaining trade-offs'],
      },
      {
        skillName: 'Communication',
        currentScore: 64,
        targetScore: 80,
        severity: 'HIGH',
        missing: ['Conciseness in answers', 'Structured STAR framework', 'Confidence under pressure'],
      },
      {
        skillName: 'Behavioral',
        currentScore: 72,
        targetScore: 85,
        severity: 'MEDIUM',
        missing: ['Highlighting cross-functional impact', 'Quantifying project results'],
      },
    ];
  }, [hasSessions, gapSkills]);

  // Strongest skills list
  const strongestSkills = useMemo(() => {
    if (hasSessions && gapSkills.length > 0) {
      return gapSkills
        .filter((s) => s.currentLevel >= 75)
        .sort((a, b) => b.currentLevel - a.currentLevel)
        .slice(0, 3)
        .map((s) => ({ name: s.skillName, score: s.currentLevel }));
    }
    return [
      { name: 'Python', score: 89 },
      { name: 'Problem Solving', score: 91 },
      { name: 'Coding', score: 86 },
    ];
  }, [hasSessions, gapSkills]);

  // Today's Guided Plan Tasks
  const todayTasks = useMemo(() => {
    return planState.dailyTasks.filter((t) => t.dayNumber === 1);
  }, [planState.dailyTasks]);

  // Nav helpers
  const navTo = (tabName: string) => {
    if (onNavigateTab) {
      onNavigateTab(tabName);
    } else if (tabName === 'skillgaps') {
      if (onOpenSkillGaps) onOpenSkillGaps();
      else onOpenLearning();
    } else if (tabName === 'guidedplan' || tabName === 'learning') {
      onOpenLearning();
    } else if (tabName === 'interviews') {
      onOpenHistory();
    }
  };

  const handleLaunchPractice = (skillName?: string) => {
    onStartInterview(targetRole, 'voice', 'medium', skillName ? [skillName] : undefined);
  };

  const handleUpdateInterviewDate = () => {
    const updatedState: GuidedPlanState = {
      ...planState,
      config: {
        ...planState.config,
        interviewDate: newInterviewDate,
      },
    };
    setPlanState(updatedState);
    saveGuidedPlanState(updatedState);
    setShowCountdownModal(false);
  };

  const handleSaveJobDescription = () => {
    if (!jobDescInput.trim()) return;
    const updatedState: GuidedPlanState = {
      ...planState,
      config: {
        ...planState.config,
        jobDescription: jobDescInput,
      },
    };
    setPlanState(updatedState);
    saveGuidedPlanState(updatedState);
    setJobDescToast('Job description updated! Job Match & Guided Plan re-calculated.');
    setTimeout(() => setJobDescToast(null), 4000);
    setShowJobMatchModal(false);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20 relative">
      {/* Toast Notice */}
      {jobDescToast && (
        <div className="fixed top-20 right-6 z-50 max-w-md bg-[#111827] dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2D3340] text-white p-4 rounded-2xl shadow-2xl flex items-start space-x-3">
          <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 fill-current" />
          <div className="text-xs space-y-1">
            <span className="font-bold text-amber-300 block font-mono text-[10px]">AI Job Match Update</span>
            <p className="text-gray-200">{jobDescToast}</p>
          </div>
          <button onClick={() => setJobDescToast(null)} className="text-gray-400 hover:text-white p-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. DASHBOARD HEADER PORTAL */}
      <div className="p-6 sm:p-7 rounded-2xl bg-[#FFFFFF] dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2D3340] shadow-xs transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center space-x-4 relative z-10">
          <div className="relative shrink-0">
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-[#E5E7EB] dark:ring-[#2D3340] shadow-xs"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-[#111827] dark:bg-indigo-600 text-white flex items-center justify-center font-extrabold text-xl shadow-xs">
                {currentUser.name.charAt(0)}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-[#171A21] rounded-full" />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#111827] dark:text-white tracking-tight">
                Good morning, {currentUser.name.split(' ')[0]} 👋
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340] text-[#111827] dark:text-[#F9FAFB] text-xs font-semibold">
                <Sparkles className="w-3 h-3 text-[#111827] dark:text-white" />
                {targetRole} Portal
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9CA3AF] font-medium italic">
              "You're making strong progress. Your primary focus area is System Design."
            </p>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex flex-wrap items-center gap-3 self-start md:self-center relative z-10">
          {/* Target Role Selector */}
          <div className="flex items-center space-x-2 bg-[#FAFAFA] dark:bg-[#1F232D] p-2 rounded-xl border border-[#E5E7EB] dark:border-[#2D3340]">
            <Briefcase className="w-4 h-4 text-[#111827] dark:text-white ml-1" />
            <div className="text-left">
              <span className="text-[9px] uppercase font-mono text-[#6B7280] dark:text-[#9CA3AF] font-bold block">Target Role</span>
              {isChangingRole ? (
                <select
                  value={targetRole}
                  onChange={(e) => {
                    setTargetRole(e.target.value);
                    setIsChangingRole(false);
                  }}
                  className="bg-white dark:bg-[#171A21] text-xs font-bold text-[#111827] dark:text-white border border-[#D1D5DB] dark:border-[#2D3340] rounded px-1.5 py-0.5 focus:outline-none"
                  autoFocus
                >
                  <option value="Senior AI / ML Engineer">Senior AI / ML Engineer</option>
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="Full-Stack Developer">Full-Stack Developer</option>
                  <option value="Backend Systems Engineer">Backend Systems Engineer</option>
                  <option value="Frontend Engineer">Frontend Engineer</option>
                </select>
              ) : (
                <span className="text-xs font-bold text-[#111827] dark:text-white block truncate max-w-[140px]">
                  {targetRole}
                </span>
              )}
            </div>
            <button
              onClick={() => setIsChangingRole(!isChangingRole)}
              className="px-2 py-1 rounded-lg bg-white dark:bg-[#171A21] hover:bg-[#F3F4F6] dark:hover:bg-[#2D3340] text-[#111827] dark:text-white text-[10px] font-semibold border border-[#E5E7EB] dark:border-[#2D3340] transition-all cursor-pointer"
            >
              {isChangingRole ? 'Save' : 'Change'}
            </button>
          </div>

          {/* Notification Icon */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationPopup(!showNotificationPopup)}
              className="p-2.5 rounded-xl bg-[#FAFAFA] dark:bg-[#1F232D] hover:bg-[#F3F4F6] dark:hover:bg-[#2D3340] text-[#111827] dark:text-white transition-colors relative border border-[#E5E7EB] dark:border-[#2D3340] cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" />
            </button>

            {showNotificationPopup && (
              <div className="absolute right-0 mt-2 w-80 bg-[#FFFFFF] dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2D3340] rounded-2xl shadow-xl p-4 z-50 space-y-3 text-xs text-[#111827] dark:text-white">
                <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB] dark:border-[#2D3340] font-bold">
                  <span className="text-[#111827] dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#111827] dark:text-white" />
                    AI Portal Notifications
                  </span>
                  <button onClick={() => setShowNotificationPopup(false)} className="text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340] text-[#374151] dark:text-[#F9FAFB] space-y-1">
                    <div className="flex items-center space-x-1 font-bold text-[#111827] dark:text-white">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Guided Plan Re-calibrated</span>
                    </div>
                    <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">System Design micro-lesson added based on recent assessment.</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340] text-[#374151] dark:text-[#F9FAFB] space-y-1">
                    <div className="flex items-center space-x-1 font-bold text-[#111827] dark:text-white">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Interview Countdown: {countdownInfo.daysLeft !== null ? `${countdownInfo.daysLeft} Days` : 'Active'}</span>
                    </div>
                    <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Keep momentum! 25 minutes remaining for today's practice tasks.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Profile Menu Shortcut */}
          <button
            onClick={() => navTo('profile')}
            className="p-2.5 rounded-xl bg-[#FAFAFA] dark:bg-[#1F232D] hover:bg-[#F3F4F6] dark:hover:bg-[#2D3340] text-[#111827] dark:text-white border border-[#E5E7EB] dark:border-[#2D3340] transition-colors cursor-pointer"
            title="User Profile"
          >
            <UserIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. PRIMARY ACTION HERO CARD PORTAL */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#FFFFFF] dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2D3340] shadow-xs relative overflow-hidden transition-colors">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            {unfinishedSession ? (
              <>
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-semibold">
                  <Play className="w-3 h-3 text-amber-600 fill-current animate-pulse" />
                  <span>INTERVIEW IN PROGRESS</span>
                </span>
                <h2 className="text-2xl font-extrabold tracking-tight text-[#111827] dark:text-white">Resume Interview Session</h2>
                <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] font-medium">
                  Interview in progress — Question {(unfinishedSession.answers?.length || 0) + 1} of {unfinishedSession.totalQuestions || 10}
                </p>
              </>
            ) : (
              <>
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#FAFAFA] dark:bg-[#1F232D] text-[#111827] dark:text-white border border-[#E5E7EB] dark:border-[#2D3340] text-xs font-semibold">
                  <Sparkles className="w-3 h-3 text-[#111827] dark:text-white" />
                  <span>CAREER INTELLIGENCE PORTAL</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827] dark:text-white">AI Career & Performance Center</h2>
                <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] font-medium">
                  Track your interview progress and career development in one clean workspace.
                </p>
              </>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {unfinishedSession ? (
              <button
                onClick={() => onViewSession(unfinishedSession)}
                className="px-6 py-3 rounded-xl bg-[#111827] dark:bg-indigo-600 text-white hover:bg-[#1f2937] dark:hover:bg-indigo-500 font-extrabold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-xs"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Continue Session</span>
              </button>
            ) : (
              <button
                onClick={() => navTo('interviews')}
                className="px-6 py-3 rounded-xl bg-[#FFFFFF] dark:bg-[#1F232D] hover:bg-[#F3F4F6] dark:hover:bg-[#2D3340] text-[#111827] dark:text-white font-bold text-xs border border-[#E5E7EB] dark:border-[#2D3340] flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <PlayCircle className="w-4 h-4 text-[#111827] dark:text-white" />
                <span>My Interviews</span>
              </button>
            )}

            <button
              onClick={() => navTo('guidedplan')}
              className="px-6 py-3 rounded-xl bg-[#111827] dark:bg-indigo-600 text-white hover:bg-[#1f2937] dark:hover:bg-indigo-500 font-extrabold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-xs"
            >
              <CompassIcon className="w-4 h-4 text-white" />
              <span>Launch Guided Plan</span>
            </button>
          </div>
        </div>
      </div>

      {/* STRENGTHS PORTAL ROW */}
      <div className="grid grid-cols-1 gap-6">
        <div className="p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2D3340] shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-[#111827] dark:text-white flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Your Strengths</span>
            </h3>
            <span className="text-[10px] font-mono font-bold uppercase text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              High Competency
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {strongestSkills.map((sk) => (
              <div key={sk.name} className="p-4 rounded-xl bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340] space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[#111827] dark:text-white">{sk.name}</span>
                  <span className="font-mono text-[#111827] dark:text-white">{sk.score}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#E5E7EB] dark:bg-[#2D3340] overflow-hidden">
                  <div className="h-full bg-[#111827] dark:bg-indigo-500 rounded-full" style={{ width: `${sk.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RECENT INTERVIEWS & TARGET JOB MATCH ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RECENT INTERVIEWS PORTAL */}
        <div className="p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2D3340] shadow-xs space-y-4 flex flex-col justify-between transition-colors">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB] dark:border-[#2D3340]">
              <h3 className="text-base font-extrabold text-[#111827] dark:text-white flex items-center space-x-2">
                <History className="w-5 h-5 text-[#111827] dark:text-white" />
                <span>Recent Interviews</span>
              </h3>
              <span className="text-xs font-mono text-[#6B7280] dark:text-[#9CA3AF] bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340] px-2.5 py-1 rounded-full">{candidateSessions.length} sessions</span>
            </div>

            {candidateSessions.length > 0 ? (
              <div className="space-y-3">
                {candidateSessions.slice(0, 2).map((s) => (
                  <div key={s.id} className="p-4 rounded-xl bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340] flex items-center justify-between text-xs transition-all">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 font-bold text-[#111827] dark:text-white">
                        <span>{s.jobTitle}</span>
                        <span className="text-[10px] font-mono text-[#6B7280] dark:text-[#9CA3AF]">{s.date || 'July 28, 2026'}</span>
                      </div>
                      <div className="flex space-x-3 text-[11px] font-mono text-[#6B7280] dark:text-[#9CA3AF]">
                        <span>Score: <strong className="text-[#111827] dark:text-white">{s.overallScore}%</strong></span>
                        <span>Readiness: <strong className="text-emerald-700 dark:text-emerald-400">{s.overallScore ? Math.round(s.overallScore * 0.9) : 76}%</strong></span>
                      </div>
                    </div>

                    <button onClick={() => onViewSession(s)} className="px-3.5 py-1.5 rounded-xl bg-[#111827] dark:bg-indigo-600 hover:bg-[#1f2937] dark:hover:bg-indigo-500 text-white font-bold text-xs transition-all cursor-pointer">
                      View Report
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center space-y-2 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                <p>"View performance insights and historical interview evaluations."</p>
                <button onClick={() => navTo('interviews')} className="px-4 py-2 rounded-xl bg-[#111827] dark:bg-indigo-600 text-white font-bold cursor-pointer">
                  View All Interviews
                </button>
              </div>
            )}
          </div>

          <button onClick={onOpenHistory} className="px-4 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#1F232D] hover:bg-[#F3F4F6] dark:hover:bg-[#2D3340] text-[#111827] dark:text-white font-bold text-xs border border-[#E5E7EB] dark:border-[#2D3340] self-start transition-all cursor-pointer">
            View All Interviews
          </button>
        </div>

        {/* TARGET JOB MATCH PORTAL */}
        <div className="p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2D3340] shadow-xs space-y-4 flex flex-col justify-between transition-colors">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB] dark:border-[#2D3340]">
              <h3 className="text-base font-extrabold text-[#111827] dark:text-white flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-[#111827] dark:text-white" />
                <span>Target Job Match</span>
              </h3>
              <span className="text-2xl font-extrabold text-[#111827] dark:text-white font-mono">76%</span>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-bold text-[#111827] dark:text-white">Target: {targetRole}</p>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340] space-y-1">
                  <span className="font-mono font-bold text-emerald-800 dark:text-emerald-400 text-[10px] uppercase">Strong Matches</span>
                  <div className="text-[#374151] dark:text-[#F9FAFB] font-semibold space-y-0.5">
                    <p>✓ Python</p>
                    <p>✓ Machine Learning</p>
                    <p>✓ SQL</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340] space-y-1">
                  <span className="font-mono font-bold text-amber-800 dark:text-amber-400 text-[10px] uppercase">Focus Areas</span>
                  <div className="text-[#374151] dark:text-[#F9FAFB] font-semibold space-y-0.5">
                    <p>⚠ MLOps</p>
                    <p>⚠ System Design</p>
                    <p>⚠ Cloud Architecture</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <button onClick={() => setShowJobMatchModal(true)} className="px-4 py-2.5 rounded-xl bg-[#111827] dark:bg-indigo-600 hover:bg-[#1f2937] dark:hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-all cursor-pointer">
              View Job Match
            </button>
            <button onClick={() => setShowJobMatchModal(true)} className="px-4 py-2.5 rounded-xl bg-[#FAFAFA] dark:bg-[#1F232D] hover:bg-[#F3F4F6] dark:hover:bg-[#2D3340] text-[#111827] dark:text-white font-bold text-xs border border-[#E5E7EB] dark:border-[#2D3340] transition-all cursor-pointer">
              Upload Job Description
            </button>
          </div>
        </div>
      </div>

      {/* DAILY PRACTICE & PRACTICE STREAK ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DAILY PRACTICE PORTAL */}
        <div className="p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2D3340] shadow-xs space-y-4 flex flex-col justify-between transition-colors">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[#111827] dark:text-white flex items-center space-x-2">
                <Zap className="w-5 h-5 text-[#111827] dark:text-white fill-current" />
                <span>Today's Challenge</span>
              </h3>
              <span className="text-xs font-mono font-bold text-[#111827] dark:text-white bg-[#FAFAFA] dark:bg-[#1F232D] px-2.5 py-1 rounded-full border border-[#E5E7EB] dark:border-[#2D3340]">Est. 20 Mins</span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="p-2.5 rounded-xl bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340] font-medium text-[#374151] dark:text-[#F9FAFB]">1 HR Question</div>
              <div className="p-2.5 rounded-xl bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340] font-medium text-[#374151] dark:text-[#F9FAFB]">2 Technical Questions</div>
              <div className="p-2.5 rounded-xl bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340] font-medium text-[#374151] dark:text-[#F9FAFB]">1 Coding Problem</div>
              <div className="p-2.5 rounded-xl bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340] font-medium text-[#374151] dark:text-[#F9FAFB]">1 Voice Exercise</div>
            </div>
          </div>

          <button onClick={() => handleLaunchPractice('Daily Challenge')} className="px-4 py-2.5 rounded-xl bg-[#111827] dark:bg-indigo-600 hover:bg-[#1f2937] dark:hover:bg-indigo-500 text-white font-extrabold text-xs shadow-xs transition-all cursor-pointer">
            Start Challenge
          </button>
        </div>

        {/* PRACTICE STREAK PORTAL */}
        <div className="p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2D3340] shadow-xs space-y-4 flex flex-col justify-between transition-colors">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[#111827] dark:text-white flex items-center space-x-2">
                <Flame className="w-5 h-5 text-amber-500 fill-current" />
                <span>Practice Streak</span>
              </h3>
              <span className="text-xl font-extrabold text-[#111827] dark:text-white font-mono">7 Days</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340]">
                <span className="text-[#6B7280] dark:text-[#9CA3AF] text-[10px] uppercase block">Total Practice</span>
                <span className="font-bold text-[#111827] dark:text-white">4h 35m</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340]">
                <span className="text-[#6B7280] dark:text-[#9CA3AF] text-[10px] uppercase block">Tasks Done</span>
                <span className="font-bold text-[#111827] dark:text-white">32 Tasks</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340]">
                <span className="text-[#6B7280] dark:text-[#9CA3AF] text-[10px] uppercase block">Coding Solved</span>
                <span className="font-bold text-[#111827] dark:text-white">18 Problems</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340]">
                <span className="text-[#6B7280] dark:text-[#9CA3AF] text-[10px] uppercase block">Mock Interviews</span>
                <span className="font-bold text-[#111827] dark:text-white">3 Mock</span>
              </div>
            </div>
          </div>

          <div className="w-full h-2 rounded-full bg-[#E5E7EB] dark:bg-[#2D3340] overflow-hidden">
            <div className="h-full bg-[#111827] dark:bg-indigo-500 rounded-full" style={{ width: '70%' }} />
          </div>
        </div>
      </div>

      {/* FINAL MOCK INTERVIEW BENCHMARK CARD */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2D3340] text-[#111827] dark:text-white shadow-xs space-y-3 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full bg-[#FAFAFA] dark:bg-[#1F232D] text-[#111827] dark:text-white border border-[#E5E7EB] dark:border-[#2D3340] font-mono font-bold text-xs uppercase inline-block">
              🎯 CLEARANCE BENCHMARK UNLOCKED
            </span>
            <h3 className="text-xl font-extrabold text-[#111827] dark:text-white">You're Ready for a Full Mock Interview</h3>
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
              Your preparation has reached 85%. Test yourself with a complete adaptive interview to get your final clearance score.
            </p>
          </div>
          <button
            onClick={() => navTo('guidedplan')}
            className="px-6 py-3 rounded-xl bg-[#111827] dark:bg-indigo-600 text-white hover:bg-[#1f2937] dark:hover:bg-indigo-500 font-extrabold text-xs shadow-xs shrink-0 flex items-center space-x-2 cursor-pointer"
          >
            <CompassIcon className="w-4 h-4 text-white" />
            <span>Explore Guided Plan</span>
          </button>
        </div>
      </div>

      {/* QUICK ACTIONS GRID */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono font-bold uppercase text-[#6B7280] dark:text-[#9CA3AF] tracking-wider">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
          <button
            onClick={() => navTo('interviews')}
            className="p-3.5 rounded-xl bg-[#FFFFFF] dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2D3340] hover:bg-[#FAFAFA] dark:hover:bg-[#1F232D] shadow-xs transition-all font-bold text-[#111827] dark:text-white text-center space-y-1 cursor-pointer"
          >
            <PlayCircle className="w-4 h-4 text-[#111827] dark:text-white mx-auto" />
            <span className="block text-[11px]">My Interviews</span>
          </button>

          <button
            onClick={() => navTo('guidedplan')}
            className="p-3.5 rounded-xl bg-[#FFFFFF] dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2D3340] hover:bg-[#FAFAFA] dark:hover:bg-[#1F232D] shadow-xs transition-all font-bold text-[#111827] dark:text-white text-center space-y-1 cursor-pointer"
          >
            <CompassIcon className="w-4 h-4 text-[#111827] dark:text-white mx-auto" />
            <span className="block text-[11px]">Guided Plan</span>
          </button>

          <button
            onClick={onOpenHistory}
            className="p-3.5 rounded-xl bg-[#FFFFFF] dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2D3340] hover:bg-[#FAFAFA] dark:hover:bg-[#1F232D] shadow-xs transition-all font-bold text-[#111827] dark:text-white text-center space-y-1 cursor-pointer"
          >
            <History className="w-4 h-4 text-[#111827] dark:text-white mx-auto" />
            <span className="block text-[11px]">Interview History</span>
          </button>

          <button
            onClick={() => navTo('performance')}
            className="p-3.5 rounded-xl bg-[#FFFFFF] dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2D3340] hover:bg-[#FAFAFA] dark:hover:bg-[#1F232D] shadow-xs transition-all font-bold text-[#111827] dark:text-white text-center space-y-1 cursor-pointer"
          >
            <TrendingUp className="w-4 h-4 text-[#111827] dark:text-white mx-auto" />
            <span className="block text-[11px]">Skill Progress</span>
          </button>

          <button
            onClick={() => setShowJobMatchModal(true)}
            className="p-3.5 rounded-xl bg-[#FFFFFF] dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2D3340] hover:bg-[#FAFAFA] dark:hover:bg-[#1F232D] shadow-xs transition-all font-bold text-[#111827] dark:text-white text-center space-y-1 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-[#111827] dark:text-white mx-auto" />
            <span className="block text-[11px]">Job Description</span>
          </button>

          {unfinishedSession && (
            <button
              onClick={() => onViewSession(unfinishedSession)}
              className="p-3.5 rounded-xl bg-[#111827] dark:bg-indigo-600 text-white shadow-xs transition-all font-extrabold text-center space-y-1 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current mx-auto" />
              <span className="block text-[11px]">Resume Session</span>
            </button>
          )}
        </div>
      </div>

      {/* JOB READINESS BREAKDOWN MODAL */}
      {showReadinessModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-[#FFFFFF] dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2D3340] rounded-2xl p-6 text-[#111827] dark:text-white space-y-5 relative shadow-xl">
            <button onClick={() => setShowReadinessModal(false)} className="absolute top-5 right-5 text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-extrabold flex items-center space-x-2 text-[#111827] dark:text-white">
              <Target className="w-5 h-5 text-[#111827] dark:text-white" />
              <span>Job Readiness Assessment Details</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340] space-y-2">
                <div className="flex justify-between font-bold text-[#374151] dark:text-[#F9FAFB]">
                  <span>Current Readiness Score:</span>
                  <span className="font-mono text-[#111827] dark:text-white text-base">{readinessScore}%</span>
                </div>
                <div className="flex justify-between font-bold text-[#374151] dark:text-[#F9FAFB]">
                  <span>Target Benchmark Clearance:</span>
                  <span className="font-mono text-emerald-700 dark:text-emerald-400 text-base">{targetReadinessScore}%</span>
                </div>
              </div>

              <p className="text-[#6B7280] dark:text-[#9CA3AF] leading-relaxed">
                Calculated dynamically using weighted evaluation scores across Technical Syntax (30%), System Architecture (30%), Communication & STAR delivery (20%), and Problem Solving (20%).
              </p>

              <span className="text-[10px] text-[#9CA3AF] block italic">
                * Note: Job Readiness is an AI coaching estimate, not a guaranteed hiring prediction.
              </span>
            </div>

            <div className="flex justify-end">
              <button onClick={() => setShowReadinessModal(false)} className="px-5 py-2.5 rounded-xl bg-[#111827] dark:bg-indigo-600 text-white font-bold text-xs cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SKILL DETAIL MODAL */}
      {showSkillDetailModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#FFFFFF] dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2D3340] rounded-2xl p-6 text-[#111827] dark:text-white space-y-4 relative shadow-xl">
            <button onClick={() => setShowSkillDetailModal(null)} className="absolute top-5 right-5 text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-extrabold text-[#111827] dark:text-white">{showSkillDetailModal.skillName} Analysis</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between font-mono p-3 bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340] rounded-xl text-[#111827] dark:text-white">
                <span>Current Score: {showSkillDetailModal.currentScore}%</span>
                <span>Target Score: {showSkillDetailModal.targetScore}%</span>
              </div>
              <p className="text-[#374151] dark:text-[#F9FAFB]">Identified Areas to Refine:</p>
              <ul className="space-y-1 text-[#6B7280] dark:text-[#9CA3AF]">
                {showSkillDetailModal.missing?.map((m: string, idx: number) => (
                  <li key={idx}>• {m}</li>
                ))}
              </ul>
            </div>
            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowSkillDetailModal(null)} className="px-3 py-2 bg-[#FAFAFA] dark:bg-[#1F232D] text-[#374151] dark:text-white rounded-xl text-xs border border-[#E5E7EB] dark:border-[#2D3340] cursor-pointer">Close</button>
              <button
                onClick={() => {
                  setShowSkillDetailModal(null);
                  handleLaunchPractice(showSkillDetailModal.skillName);
                }}
                className="px-4 py-2 bg-[#111827] dark:bg-indigo-600 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Practice This Skill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* JOB MATCH & JOB DESCRIPTION MODAL */}
      {showJobMatchModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-[#FFFFFF] dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2D3340] rounded-2xl p-6 text-[#111827] dark:text-white space-y-4 relative shadow-xl">
            <button onClick={() => setShowJobMatchModal(false)} className="absolute top-5 right-5 text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-extrabold flex items-center space-x-2 text-[#111827] dark:text-white">
              <FileText className="w-5 h-5 text-[#111827] dark:text-white" />
              <span>Target Job Match & Description Analyzer</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#6B7280] dark:text-[#9CA3AF] font-mono uppercase text-[10px] font-bold mb-1">
                  Paste or Edit Target Job Description
                </label>
                <textarea
                  value={jobDescInput || planState.config.jobDescription || ''}
                  onChange={(e) => setJobDescInput(e.target.value)}
                  placeholder="Paste job posting text here..."
                  className="w-full h-36 bg-[#FFFFFF] dark:bg-[#1F232D] border border-[#D1D5DB] dark:border-[#2D3340] rounded-xl p-3 text-xs text-[#111827] dark:text-white focus:outline-none focus:border-[#111827]"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowJobMatchModal(false)} className="px-3 py-2 bg-[#FAFAFA] dark:bg-[#1F232D] text-[#374151] dark:text-white border border-[#E5E7EB] dark:border-[#2D3340] rounded-xl text-xs cursor-pointer">Cancel</button>
              <button onClick={handleSaveJobDescription} className="px-4 py-2 bg-[#111827] dark:bg-indigo-600 text-white font-bold rounded-xl text-xs cursor-pointer">
                Analyze & Re-Match
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SET INTERVIEW DATE MODAL */}
      {showCountdownModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#FFFFFF] dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2D3340] rounded-2xl p-6 text-[#111827] dark:text-white space-y-4 relative shadow-xl">
            <button onClick={() => setShowCountdownModal(false)} className="absolute top-5 right-5 text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-extrabold flex items-center space-x-2 text-[#111827] dark:text-white">
              <Calendar className="w-5 h-5 text-[#111827] dark:text-white" />
              <span>Set Interview Date for Countdown</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#6B7280] dark:text-[#9CA3AF] font-mono uppercase text-[10px] font-bold mb-1">Upcoming Interview Date</label>
                <input
                  type="date"
                  value={newInterviewDate}
                  onChange={(e) => setNewInterviewDate(e.target.value)}
                  className="w-full bg-[#FFFFFF] dark:bg-[#1F232D] border border-[#D1D5DB] dark:border-[#2D3340] rounded-xl p-3 text-[#111827] dark:text-white font-bold focus:outline-none focus:border-[#111827]"
                />
              </div>
              <p className="text-[#6B7280] dark:text-[#9CA3AF]">
                Setting your interview date automatically adapts your daily practice task intensity and countdown strategy.
              </p>
            </div>

            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowCountdownModal(false)} className="px-3 py-2 bg-[#FAFAFA] dark:bg-[#1F232D] text-[#374151] dark:text-white border border-[#E5E7EB] dark:border-[#2D3340] rounded-xl text-xs cursor-pointer">Cancel</button>
              <button onClick={handleUpdateInterviewDate} className="px-4 py-2 bg-[#111827] dark:bg-indigo-600 text-white font-bold rounded-xl text-xs cursor-pointer">
                Save & Activate Countdown
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPARE INTERVIEWS MODAL */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#FFFFFF] dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2D3340] rounded-2xl p-6 text-[#111827] dark:text-white space-y-4 relative shadow-xl">
            <button onClick={() => setShowCompareModal(false)} className="absolute top-5 right-5 text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-extrabold text-[#111827] dark:text-white">Interview Assessment Comparison</h3>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340] rounded-xl flex justify-between font-mono text-[#111827] dark:text-white">
                <span>Interview 1 Score: 62%</span>
                <span>Latest Score: 82%</span>
              </div>
              <div className="p-3 bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340] rounded-xl text-[#374151] dark:text-[#F9FAFB] space-y-1">
                <p className="font-bold text-emerald-700 dark:text-emerald-400">+20% Total Improvement</p>
                <p>Technical fluency increased significantly. Communication clarity remains primary focus.</p>
              </div>
            </div>
            <div className="flex justify-end">
              <button onClick={() => setShowCompareModal(false)} className="px-4 py-2 bg-[#111827] dark:bg-indigo-600 text-white font-bold rounded-xl text-xs cursor-pointer">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function CompassIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}
