import React from 'react';
import { InterviewSession } from '../types';
import { TrendingUp, Zap, MessageSquare, BrainCircuit, History, Play } from 'lucide-react';
import { QuickTipsTooltip } from './interview/QuickTipsTooltip';

interface PerformanceViewProps {
  sessions: InterviewSession[];
  onStartNewInterview?: () => void;
}

export const PerformanceView: React.FC<PerformanceViewProps> = ({ sessions, onStartNewInterview }) => {
  const latestSession = sessions[0];
  const previousSession = sessions[1];

  const currentScore = latestSession?.overallScore || 78;
  const previousScore = previousSession?.overallScore || 68;
  const scoreImprovement = currentScore - previousScore;

  const technicalScore = latestSession?.technicalScore || 82;
  const communicationScore = latestSession?.communicationScore || 74;
  const problemSolvingScore = latestSession?.problemSolvingScore || 71;

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFFFF] dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2D3340] text-[#111827] dark:text-[#F9FAFB] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340] text-[#111827] dark:text-[#F9FAFB] text-xs font-semibold">
            <TrendingUp className="w-3.5 h-3.5 text-[#111827] dark:text-[#F9FAFB]" />
            <span>Performance & Progress</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] dark:text-white tracking-tight">
            Your Performance Overview
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9CA3AF] max-w-xl">
            Track your interview readiness improvement, technical performance, and skill growth over time.
          </p>
        </div>

        {onStartNewInterview && (
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={onStartNewInterview}
              className="px-5 py-3 rounded-2xl bg-[#111827] dark:bg-indigo-600 hover:bg-[#1f2937] dark:hover:bg-indigo-500 text-white font-extrabold text-xs shadow-xs flex items-center space-x-2 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Practice Session</span>
            </button>
            <QuickTipsTooltip align="right" buttonLabel="Quick Tip" />
          </div>
        )}
      </div>

      {/* Progress Improvement Hero Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFFFF] dark:bg-[#171A21] text-[#111827] dark:text-[#F9FAFB] shadow-xs border border-[#E5E7EB] dark:border-[#2D3340] space-y-4 transition-colors">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#111827] dark:text-[#F9FAFB] block">
          SKILL IMPROVEMENT
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
          <div className="p-4 rounded-2xl bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340]">
            <span className="text-[11px] font-mono text-[#6B7280] dark:text-[#9CA3AF] uppercase font-bold block">Previous Assessment</span>
            <span className="text-3xl font-extrabold font-mono text-[#111827] dark:text-white">{previousScore}%</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#111827] dark:border-indigo-500">
            <span className="text-[11px] font-mono text-[#111827] dark:text-indigo-400 uppercase font-bold block">Current Assessment</span>
            <span className="text-3xl font-extrabold font-mono text-[#111827] dark:text-white">{currentScore}%</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
            <span className="text-[11px] font-mono text-emerald-800 dark:text-emerald-400 uppercase font-bold block">Total Improvement</span>
            <span className="text-3xl font-extrabold font-mono text-emerald-700 dark:text-emerald-300">+{scoreImprovement}%</span>
          </div>
        </div>
      </div>

      {/* Performance Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Technical Performance */}
        <div className="p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2D3340] shadow-xs space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#111827] dark:text-white">Technical Performance</span>
            <div className="p-2 rounded-xl bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340] text-[#111827] dark:text-white">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-[#111827] dark:text-white font-mono">
              {technicalScore}%
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">+5% vs last round</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-[#E5E7EB] dark:bg-[#2D3340] overflow-hidden">
            <div className="h-full bg-[#111827] dark:bg-indigo-500 rounded-full" style={{ width: `${technicalScore}%` }} />
          </div>
        </div>

        {/* Communication */}
        <div className="p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2D3340] shadow-xs space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#111827] dark:text-white">Communication</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-[#111827] dark:text-white font-mono">
              {communicationScore}%
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">+7% vs last round</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-[#E5E7EB] dark:bg-[#2D3340] overflow-hidden">
            <div className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full" style={{ width: `${communicationScore}%` }} />
          </div>
        </div>

        {/* Problem Solving */}
        <div className="p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2D3340] shadow-xs space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#111827] dark:text-white">Problem Solving</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              <BrainCircuit className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-[#111827] dark:text-white font-mono">
              {problemSolvingScore}%
            </span>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">+4% vs last round</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-[#E5E7EB] dark:bg-[#2D3340] overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${problemSolvingScore}%` }} />
          </div>
        </div>
      </div>

      {/* Recent Interview History */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2D3340] shadow-xs space-y-4 transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] dark:border-[#2D3340]">
          <h3 className="text-sm font-bold text-[#111827] dark:text-white flex items-center space-x-2">
            <History className="w-4 h-4 text-[#111827] dark:text-white" />
            <span>Interview History</span>
          </h3>
          <span className="text-xs font-mono text-[#6B7280] dark:text-[#9CA3AF]">{sessions.length} sessions</span>
        </div>

        <div className="space-y-3">
          {sessions.map((s, idx) => (
            <div
              key={s.id || idx}
              className="p-4 rounded-xl border border-[#E5E7EB] dark:border-[#2D3340] bg-[#FAFAFA] dark:bg-[#1F232D] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <span className="font-bold text-[#111827] dark:text-white block">{s.jobTitle}</span>
                <span className="text-[11px] font-mono text-[#6B7280] dark:text-[#9CA3AF]">{s.date || 'July 26, 2026'}</span>
              </div>

              <div className="flex items-center space-x-4 font-mono">
                <div>
                  <span className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF] block">Overall Score</span>
                  <span className="font-bold text-[#111827] dark:text-white">{s.overallScore}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF] block">Technical</span>
                  <span className="font-bold text-[#111827] dark:text-white">{s.technicalScore}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
