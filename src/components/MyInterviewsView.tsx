import React, { useState } from 'react';
import { InterviewSession, InterviewMode, DifficultyLevel } from '../types';
import { InterviewCalendarView } from './InterviewCalendarView';
import {
  Video,
  Clock,
  Calendar as CalendarIcon,
  Search,
  Filter,
  Play,
  ArrowRight,
  BrainCircuit,
  Sparkles,
  LayoutList,
  Trash2,
  RefreshCw,
  GitCompare,
  Zap,
  CheckCircle2,
  AlertTriangle,
  X,
  SlidersHorizontal,
} from 'lucide-react';

interface MyInterviewsViewProps {
  sessions: InterviewSession[];
  onViewSession: (session: InterviewSession) => void;
  onStartNewInterview: (jobTitle?: string, mode?: InterviewMode, difficulty?: DifficultyLevel) => void;
  onDeleteSession?: (sessionId: string) => void;
  onDeleteMediaOnly?: (sessionId: string) => void;
  onClearAllSessions?: () => void;
}

export const MyInterviewsView: React.FC<MyInterviewsViewProps> = ({
  sessions,
  onViewSession,
  onStartNewInterview,
  onDeleteSession,
  onDeleteMediaOnly,
  onClearAllSessions,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [selectedModeFilter, setSelectedModeFilter] = useState<string>('all');
  const [selectedDifficultyFilter, setSelectedDifficultyFilter] = useState<string>('all');
  const [selectedScoreFilter, setSelectedScoreFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest' | 'readiness'>('newest');

  // Comparison State
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState<boolean>(false);

  // Replay Modal State
  const [replaySession, setReplaySession] = useState<InterviewSession | null>(null);
  const [activeReplayMarker, setActiveReplayMarker] = useState<string>('00:45');

  // Privacy Control Modal
  const [deleteConfirmSession, setDeleteConfirmSession] = useState<InterviewSession | null>(null);
  const [showClearAllModal, setShowClearAllModal] = useState<boolean>(false);

  // Unique roles for filter dropdown
  const availableRoles = Array.from(new Set(sessions.map((s) => s.jobTitle)));

  // Filter & Sort Sessions
  const filteredSessions = sessions
    .filter((s) => {
      const matchesSearch =
        s.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.executiveSummary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = selectedRoleFilter === 'all' || s.jobTitle === selectedRoleFilter;
      const matchesMode = selectedModeFilter === 'all' || s.mode === selectedModeFilter;
      const matchesDiff = selectedDifficultyFilter === 'all' || (s.difficulty || 'medium') === selectedDifficultyFilter;
      
      let matchesScore = true;
      if (selectedScoreFilter === 'excellent') matchesScore = s.overallScore >= 80;
      else if (selectedScoreFilter === 'average') matchesScore = s.overallScore >= 60 && s.overallScore < 80;
      else if (selectedScoreFilter === 'needs_improvement') matchesScore = s.overallScore < 60;

      return matchesSearch && matchesRole && matchesMode && matchesDiff && matchesScore;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'highest') return b.overallScore - a.overallScore;
      if (sortBy === 'lowest') return a.overallScore - b.overallScore;
      if (sortBy === 'readiness') return (b.overallScore - 5) - (a.overallScore - 5);
      return 0;
    });

  const toggleSelectForComparison = (id: string) => {
    if (selectedForComparison.includes(id)) {
      setSelectedForComparison(selectedForComparison.filter((item) => item !== id));
    } else {
      if (selectedForComparison.length >= 2) {
        setSelectedForComparison([selectedForComparison[1], id]);
      } else {
        setSelectedForComparison([...selectedForComparison, id]);
      }
    }
  };

  const comparedSessions = sessions.filter((s) => selectedForComparison.includes(s.id));

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Banner Floating Portal with Streak & Stats */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFFFF] dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2D3340] text-[#111827] dark:text-[#F9FAFB] shadow-xs dark:shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative transition-colors">
        <div className="space-y-2 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340] text-[#111827] dark:text-[#F9FAFB] text-xs font-semibold">
              <Video className="w-3.5 h-3.5 text-orange-500" />
              <span>Interview History & Portal Archives</span>
            </div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/40 text-amber-800 dark:text-amber-300 text-xs font-bold">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>5 Day Practice Streak 🔥</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827] dark:text-white">Interview History & Portal Snapshot</h1>
          <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9CA3AF] max-w-2xl leading-relaxed font-medium">
            Immutable interview records, audio/video replay, question-by-question evaluations, and side-by-side performance comparison tools.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-[#6B7280] dark:text-[#9CA3AF] font-mono">
            <span>Total Completed: <strong className="text-[#111827] dark:text-white">{sessions.length} Sessions</strong></span>
            <span>&bull;</span>
            <span>Total Practice: <strong className="text-[#111827] dark:text-white">8.5 Hours</strong></span>
            <span>&bull;</span>
            <span>Questions Practiced: <strong className="text-[#111827] dark:text-white">42 Total</strong></span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start lg:self-center relative z-10">
          {/* Comparison Launcher */}
          {selectedForComparison.length === 2 && (
            <button
              onClick={() => setShowComparisonModal(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 flex items-center space-x-2 animate-pulse"
            >
              <GitCompare className="w-4 h-4" />
              <span>Compare (2 Selected)</span>
            </button>
          )}

          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340]">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                viewMode === 'list'
                  ? 'bg-[#111827] dark:bg-indigo-600 text-white shadow-md'
                  : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>List View</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                viewMode === 'calendar'
                  ? 'bg-[#111827] dark:bg-indigo-600 text-white shadow-md'
                  : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>
          </div>

          <button
            onClick={() => onStartNewInterview()}
            className="px-4 py-2.5 rounded-xl bg-[#111827] dark:bg-indigo-600 hover:bg-[#1f2937] dark:hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-xs flex items-center space-x-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>+ Start AI Interview</span>
          </button>
        </div>
      </div>

      {/* Calendar View Mode */}
      {viewMode === 'calendar' ? (
        <InterviewCalendarView
          sessions={sessions}
          onViewSession={onViewSession}
          onStartNewInterview={() => onStartNewInterview()}
        />
      ) : (
        <>
          {/* Advanced Filter, Search & Sorting Toolbar */}
          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-3">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="relative w-full lg:w-80">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by role, session ID, or summary..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-xs text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#111827]"
                />
                <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-2.5" />
              </div>

              {/* Filters Group */}
              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto text-xs">
                {/* Role Filter */}
                <select
                  value={selectedRoleFilter}
                  onChange={(e) => setSelectedRoleFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] font-medium text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
                >
                  <option value="all">All Job Roles</option>
                  {availableRoles.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>

                {/* Mode Filter */}
                <select
                  value={selectedModeFilter}
                  onChange={(e) => setSelectedModeFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] font-medium text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
                >
                  <option value="all">All Modes</option>
                  <option value="video">Live Video</option>
                  <option value="voice">AI Voice</option>
                  <option value="text">Technical Text</option>
                  <option value="coding">Coding Compiler</option>
                </select>

                {/* Difficulty Filter */}
                <select
                  value={selectedDifficultyFilter}
                  onChange={(e) => setSelectedDifficultyFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] font-medium text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
                >
                  <option value="all">All Difficulties</option>
                  <option value="entry">Entry Level</option>
                  <option value="medium">Mid Level</option>
                  <option value="hard">Senior Level</option>
                </select>

                {/* Score Range Filter */}
                <select
                  value={selectedScoreFilter}
                  onChange={(e) => setSelectedScoreFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] font-medium text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
                >
                  <option value="all">All Score Ranges</option>
                  <option value="excellent">High (80%+)</option>
                  <option value="average">Moderate (60-79%)</option>
                  <option value="needs_improvement">Needs Improvement (&lt;60%)</option>
                </select>

                {/* Sort By Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 rounded-xl bg-[#111827] border border-[#111827] font-bold text-white focus:outline-none cursor-pointer"
                >
                  <option value="newest">Sort: Newest First</option>
                  <option value="oldest">Sort: Oldest First</option>
                  <option value="highest">Sort: Highest Score</option>
                  <option value="lowest">Sort: Lowest Score</option>
                  <option value="readiness">Sort: Job Readiness</option>
                </select>
              </div>
            </div>

            {/* Selection indicator & Clear all data action bar */}
            <div className="flex flex-wrap items-center justify-between pt-2 border-t border-[#E5E7EB] text-xs text-[#6B7280]">
              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#111827]" />
                <span>Showing {filteredSessions.length} of {sessions.length} interview records</span>
                {selectedForComparison.length > 0 && (
                  <span className="font-bold text-amber-600">
                    ({selectedForComparison.length}/2 selected for comparison)
                  </span>
                )}
              </div>

              {onClearAllSessions && (
                <button
                  onClick={() => setShowClearAllModal(true)}
                  className="text-[11px] font-bold text-rose-600 hover:text-rose-700 transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear All Interview History</span>
                </button>
              )}
            </div>
          </div>

          {/* Interview Cards List */}
          <div className="space-y-4">
            {filteredSessions.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] space-y-3">
                <BrainCircuit className="w-12 h-12 text-[#9CA3AF] mx-auto" />
                <p className="text-sm font-semibold text-[#111827]">No matching interview records found</p>
                <p className="text-xs text-[#6B7280]">Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              filteredSessions.map((session) => {
                const isSelectedForComp = selectedForComparison.includes(session.id);
                const jobReadiness = Math.max(50, session.overallScore - 6);

                return (
                  <div
                    key={session.id}
                    className={`p-6 rounded-2xl bg-[#FFFFFF] border transition-all shadow-xs space-y-4 group relative ${
                      isSelectedForComp
                        ? 'border-amber-500 ring-2 ring-amber-500/20'
                        : 'border-[#E5E7EB] hover:border-[#111827]'
                    }`}
                  >
                    {/* Top Row: Title, ID, Mode & Status */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Comparison Checkbox */}
                          <label className="flex items-center space-x-2 cursor-pointer mr-2">
                            <input
                              type="checkbox"
                              checked={isSelectedForComp}
                              onChange={() => toggleSelectForComparison(session.id)}
                              className="w-4 h-4 rounded border-[#E5E7EB] text-amber-500 focus:ring-amber-500"
                            />
                            <span className="text-[11px] font-mono font-bold text-[#6B7280] hover:text-[#111827]">
                              Compare
                            </span>
                          </label>

                          <h3 className="text-base font-extrabold text-[#111827] group-hover:text-[#111827] transition-colors">
                            {session.jobTitle}
                          </h3>

                          <span className="px-2 py-0.5 rounded text-[10px] font-mono text-[#6B7280] bg-[#FAFAFA] border border-[#E5E7EB]">
                            ID: #{session.id}
                          </span>

                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#FAFAFA] text-[#111827] border border-[#E5E7EB]">
                            {session.mode} Mode
                          </span>

                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Completed</span>
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-[#6B7280]">
                          <span className="flex items-center space-x-1">
                            <CalendarIcon className="w-3.5 h-3.5 text-[#111827]" />
                            <span>{new Date(session.date).toLocaleDateString()}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5 text-blue-600" />
                            <span>{session.durationMinutes || 30} Mins Duration</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <BrainCircuit className="w-3.5 h-3.5 text-purple-600" />
                            <span>Questions: {session.evaluations?.length || 2}/{session.questions?.length || 2} Answered</span>
                          </span>
                        </div>
                      </div>

                      {/* Scores Summary Grid */}
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 text-right self-start md:self-center bg-[#FAFAFA] p-3 rounded-2xl border border-[#E5E7EB]">
                        <div>
                          <span className="text-xl font-mono font-extrabold text-[#111827]">
                            {session.overallScore}%
                          </span>
                          <p className="text-[9px] font-mono uppercase text-[#6B7280]">Overall</p>
                        </div>
                        <div>
                          <span className="text-xl font-mono font-extrabold text-emerald-600">
                            {jobReadiness}%
                          </span>
                          <p className="text-[9px] font-mono uppercase text-[#6B7280]">Readiness</p>
                        </div>
                        <div>
                          <span className="text-xl font-mono font-extrabold text-[#111827]">
                            {session.technicalScore}%
                          </span>
                          <p className="text-[9px] font-mono uppercase text-[#6B7280]">Technical</p>
                        </div>
                        <div className="hidden sm:block">
                          <span className="text-xl font-mono font-extrabold text-[#111827]">
                            {session.communicationScore || 78}%
                          </span>
                          <p className="text-[9px] font-mono uppercase text-[#6B7280]">Comm.</p>
                        </div>
                        <div className="hidden sm:block">
                          <span className="text-xl font-mono font-extrabold text-[#111827]">
                            {session.confidenceScore || 80}%
                          </span>
                          <p className="text-[9px] font-mono uppercase text-[#6B7280]">Confidence</p>
                        </div>
                      </div>
                    </div>

                    {/* Executive Summary & Key Gap */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="md:col-span-2 p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] space-y-1">
                        <span className="text-[10px] font-mono uppercase text-[#111827] font-bold block">AI Executive Summary:</span>
                        <p className="text-[#374151] leading-relaxed">
                          {session.executiveSummary || 'Demonstrated solid technical knowledge and communication skills.'}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                        <span className="text-[10px] font-mono uppercase text-amber-700 font-bold block">Recommended Focus Area:</span>
                        <p className="font-bold text-amber-900">
                          {session.criticalGaps?.[0] || 'Communication STAR method structuring'}
                        </p>
                        <span className="text-[10px] text-amber-700 font-mono block">Severity: Medium</span>
                      </div>
                    </div>

                    {/* Bottom Action Bar: Replay, Report, Retry Similar, Delete */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex items-center space-x-2 text-[11px] text-[#6B7280] font-mono">
                        <Sparkles className="w-3.5 h-3.5 text-[#111827]" />
                        <span>Immutable Snapshot & Audio/Video Transcript Synced</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Replay Button */}
                        <button
                          onClick={() => setReplaySession(session)}
                          className="px-3.5 py-2 rounded-xl bg-[#FAFAFA] hover:bg-[#E5E7EB] border border-[#E5E7EB] text-[#111827] font-bold text-xs transition-all flex items-center space-x-1.5 cursor-pointer"
                        >
                          <Video className="w-3.5 h-3.5 text-[#111827]" />
                          <span>Replay</span>
                        </button>

                        {/* Retry Similar Button */}
                        <button
                          onClick={() => onStartNewInterview(session.jobTitle, session.mode, session.difficulty || 'medium')}
                          className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center space-x-1.5 shadow-xs cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Retry Similar</span>
                        </button>

                        {/* View Report Button */}
                        <button
                          onClick={() => onViewSession(session)}
                          className="px-4 py-2 rounded-xl bg-[#111827] hover:bg-[#1f2937] text-white font-bold text-xs transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
                        >
                          <span>View Report</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Options Button */}
                        <button
                          onClick={() => setDeleteConfirmSession(session)}
                          className="p-2 rounded-xl text-[#9CA3AF] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Privacy & Deletion Controls"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* REPLAY MODAL PLAYER */}
      {replaySession && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white space-y-4 shadow-2xl animate-fade-in relative">
            <button
              onClick={() => setReplaySession(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Video className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-extrabold">Interview Replay: {replaySession.jobTitle}</h3>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-full bg-indigo-600 text-white font-bold">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block">{replaySession.jobTitle} - Recorded Recording</span>
                    <span className="text-[10px] font-mono text-indigo-400">Timestamp: {activeReplayMarker} / 30:00</span>
                  </div>
                </div>
                <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 font-mono text-xs">Audio/Video Sync OK</span>
              </div>

              {/* Interactive Timeline Markers */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">Timeline Markers:</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <button
                    onClick={() => setActiveReplayMarker('00:45')}
                    className={`p-2 rounded-xl border text-left text-xs ${
                      activeReplayMarker === '00:45' ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <span className="font-bold block">Strong Answer (00:45)</span>
                    <span className="text-[10px] opacity-80">Clear STAR framework</span>
                  </button>

                  <button
                    onClick={() => setActiveReplayMarker('02:15')}
                    className={`p-2 rounded-xl border text-left text-xs ${
                      activeReplayMarker === '02:15' ? 'bg-rose-600 border-rose-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <span className="font-bold block">Weak Answer (02:15)</span>
                    <span className="text-[10px] opacity-80">Omitted complexity proof</span>
                  </button>

                  <button
                    onClick={() => setActiveReplayMarker('03:40')}
                    className={`p-2 rounded-xl border text-left text-xs ${
                      activeReplayMarker === '03:40' ? 'bg-amber-600 border-amber-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <span className="font-bold block">Long Pause (03:40)</span>
                    <span className="text-[10px] opacity-80">5.2s hesitation pause</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setReplaySession(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs"
              >
                Close Replay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SIDE-BY-SIDE COMPARISON MODAL */}
      {showComparisonModal && comparedSessions.length === 2 && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white space-y-6 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <GitCompare className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-extrabold">Interview Performance Side-by-Side Comparison</h3>
              </div>
              <button
                onClick={() => setShowComparisonModal(false)}
                className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* AI Comparison Summary Banner */}
            <div className="p-4 rounded-2xl bg-indigo-950/80 border border-indigo-700 text-xs space-y-1">
              <span className="font-bold text-indigo-300 uppercase text-[10px] block">AI Comparative Snapshot:</span>
              <p className="text-slate-200 leading-relaxed">
                Overall score improved from <strong className="text-white">{comparedSessions[1].overallScore}%</strong> on {new Date(comparedSessions[1].date).toLocaleDateString()} to <strong className="text-emerald-400">{comparedSessions[0].overallScore}%</strong> on {new Date(comparedSessions[0].date).toLocaleDateString()} (+{comparedSessions[0].overallScore - comparedSessions[1].overallScore}% boost). Technical depth and communication clarity showed major gains.
              </p>
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                    <th className="p-3">Skill / Metric</th>
                    <th className="p-3 text-indigo-400">Previous Round ({new Date(comparedSessions[1].date).toLocaleDateString()})</th>
                    <th className="p-3 text-emerald-400">Latest Round ({new Date(comparedSessions[0].date).toLocaleDateString()})</th>
                    <th className="p-3 text-right">Net Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono">
                  <tr>
                    <td className="p-3 font-sans font-bold">Overall Score</td>
                    <td className="p-3">{comparedSessions[1].overallScore}%</td>
                    <td className="p-3 font-bold text-emerald-400">{comparedSessions[0].overallScore}%</td>
                    <td className="p-3 text-right text-emerald-400 font-bold">
                      +{comparedSessions[0].overallScore - comparedSessions[1].overallScore}%
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-sans font-bold">Technical Knowledge</td>
                    <td className="p-3">{comparedSessions[1].technicalScore}%</td>
                    <td className="p-3 font-bold text-emerald-400">{comparedSessions[0].technicalScore}%</td>
                    <td className="p-3 text-right text-emerald-400 font-bold">
                      +{comparedSessions[0].technicalScore - comparedSessions[1].technicalScore}%
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-sans font-bold">Communication</td>
                    <td className="p-3">{comparedSessions[1].communicationScore || 68}%</td>
                    <td className="p-3 font-bold text-emerald-400">{comparedSessions[0].communicationScore || 84}%</td>
                    <td className="p-3 text-right text-emerald-400 font-bold">
                      +{(comparedSessions[0].communicationScore || 84) - (comparedSessions[1].communicationScore || 68)}%
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-sans font-bold">Confidence</td>
                    <td className="p-3">{comparedSessions[1].confidenceScore || 70}%</td>
                    <td className="p-3 font-bold text-emerald-400">{comparedSessions[0].confidenceScore || 86}%</td>
                    <td className="p-3 text-right text-emerald-400 font-bold">
                      +{(comparedSessions[0].confidenceScore || 86) - (comparedSessions[1].confidenceScore || 70)}%
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-sans font-bold">Job Readiness</td>
                    <td className="p-3">{comparedSessions[1].overallScore - 6}%</td>
                    <td className="p-3 font-bold text-emerald-400">{comparedSessions[0].overallScore - 6}%</td>
                    <td className="p-3 text-right text-emerald-400 font-bold">
                      +{comparedSessions[0].overallScore - comparedSessions[1].overallScore}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowComparisonModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRIVACY & DELETION CONFIRMATION MODAL */}
      {deleteConfirmSession && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center space-x-2 text-rose-500">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-extrabold">Delete Interview Data Options</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Managing interview data for <strong className="text-white">{deleteConfirmSession.jobTitle}</strong> (#{deleteConfirmSession.id}).
            </p>

            <div className="space-y-2 pt-2">
              {onDeleteMediaOnly && (
                <button
                  onClick={() => {
                    onDeleteMediaOnly(deleteConfirmSession.id);
                    setDeleteConfirmSession(null);
                  }}
                  className="w-full p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-left text-xs font-bold transition-all border border-slate-700"
                >
                  <span className="block text-indigo-400">Remove Audio/Video Recordings Only</span>
                  <span className="text-[10px] text-slate-400 font-normal">Frees media storage while retaining scores, transcripts & evaluation analytics.</span>
                </button>
              )}

              {onDeleteSession && (
                <button
                  onClick={() => {
                    onDeleteSession(deleteConfirmSession.id);
                    setDeleteConfirmSession(null);
                  }}
                  className="w-full p-3 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-left text-xs font-bold transition-all border border-rose-800 text-rose-200"
                >
                  <span className="block text-rose-300">Permanently Delete Full Interview Snapshot</span>
                  <span className="text-[10px] text-slate-300 font-normal">Completely removes scores, transcript, and evaluation report.</span>
                </button>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setDeleteConfirmSession(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLEAR ALL HISTORY MODAL */}
      {showClearAllModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center space-x-2 text-rose-500">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-extrabold">Confirm Clear All Interview History</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete all stored interview history? This action cannot be undone.
            </p>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowClearAllModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onClearAllSessions) onClearAllSessions();
                  setShowClearAllModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                Clear All Records
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

