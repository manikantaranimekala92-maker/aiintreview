import React, { useState } from 'react';
import { JobDescription, DifficultyLevel, InterviewMode } from '../../types';
import { QuickTipsTooltip } from './QuickTipsTooltip';
import {
  Briefcase,
  Clock,
  HelpCircle,
  Zap,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Layers,
  ArrowRight,
  Video,
  Mic,
  BrainCircuit,
  Lock,
} from 'lucide-react';

interface InterviewSetupProps {
  jobTitle: string;
  jobDescription?: JobDescription;
  mode: InterviewMode;
  difficulty: DifficultyLevel;
  skills?: string[];
  onProceedToSystemCheck: () => void;
  onCancel: () => void;
}

export const InterviewSetup: React.FC<InterviewSetupProps> = ({
  jobTitle,
  jobDescription,
  mode,
  difficulty,
  skills = ['Python', 'System Architecture', 'SQL', 'Machine Learning'],
  onProceedToSystemCheck,
  onCancel,
}) => {
  const [hasAcceptedPrivacy, setHasAcceptedPrivacy] = useState<boolean>(true);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white shadow-2xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>AI Live Video Interview Module v2.4</span>
          </div>
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-800/80 flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>TRANSFORMER ENCODER ACTIVE</span>
          </span>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Live Interview Setup: {jobTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            You are about to enter a live AI-conducted video evaluation. The system will ask adaptive questions, record video & audio, and generate real-time Transformer bottleneck diagnostics.
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Interview Overview Specs */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#030816] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Briefcase className="w-4 h-4 text-indigo-500" />
            <span>Interview Parameters & Job Specs</span>
          </h3>

          <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            <div className="pt-2 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Job Role:</span>
              <span className="font-bold text-slate-900 dark:text-slate-200">{jobTitle}</span>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Interview Type:</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400 capitalize">
                {mode === 'video' ? 'Live Video + Speech AI' : `${mode} Interview`}
              </span>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Estimated Duration:</span>
              <span className="font-bold text-slate-900 dark:text-slate-200 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>30 Minutes</span>
              </span>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Questions Count:</span>
              <span className="font-bold text-slate-900 dark:text-slate-200 flex items-center space-x-1">
                <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                <span>5 - 10 Adaptive Questions</span>
              </span>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Adaptive Difficulty:</span>
              <span className="font-bold uppercase text-amber-600 dark:text-amber-400 flex items-center space-x-1">
                <Zap className="w-3.5 h-3.5" />
                <span>{difficulty}</span>
              </span>
            </div>
          </div>

          {/* Required Skills Badges */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Required Skills Evaluated:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 text-xs font-semibold"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Card 2: Privacy, Consent & Guidelines */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#030816] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Privacy Disclosure & Candidate Consent</span>
            </h3>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <div className="flex items-start space-x-2">
                <Lock className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <p>
                  This interview will be recorded (video & audio) and analyzed using AI for evaluation purposes.
                </p>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Evaluation is strictly based on response text, technical accuracy, reasoning, and completeness. Video recordings are encrypted and visible only to authorized recruiters.
              </p>
            </div>

            <label className="flex items-start space-x-3 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={hasAcceptedPrivacy}
                onChange={(e) => setHasAcceptedPrivacy(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-[#E5E7EB] text-[#111827] focus:ring-[#111827]"
              />
              <span className="text-xs text-[#374151] font-medium">
                I agree to video/audio recording and AI analysis for evaluation purposes.
              </span>
            </label>
          </div>

          <div className="flex items-center space-x-3 pt-4 border-t border-[#E5E7EB]">
            <button
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] hover:bg-[#FAFAFA] text-[#374151] font-semibold text-xs transition-all cursor-pointer"
            >
              Cancel
            </button>
            <div className="flex-1 flex items-center space-x-2">
              <button
                onClick={onProceedToSystemCheck}
                disabled={!hasAcceptedPrivacy}
                className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center space-x-2"
              >
                <span>Start System Check</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <QuickTipsTooltip align="right" buttonLabel="Quick Tip" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
