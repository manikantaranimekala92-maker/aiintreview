import React, { useState } from 'react';
import { InterviewSession, DetailedBottleneckItem } from '../../types';
import {
  AlertTriangle,
  Zap,
  CheckCircle2,
  BrainCircuit,
  Sparkles,
  BookOpen,
  Play,
  Pause,
  Video,
  ShieldCheck,
  RefreshCw,
  Lightbulb,
  HelpCircle,
} from 'lucide-react';

interface CandidateInterviewReportProps {
  session: InterviewSession;
  onBackToDashboard: () => void;
  onOpenRoadmap?: () => void;
  onOpenFocusAreas?: () => void;
  onPracticeQuestion?: (questionText: string) => void;
}

export const CandidateInterviewReport: React.FC<CandidateInterviewReportProps> = ({
  session,
  onBackToDashboard,
  onOpenRoadmap,
  onOpenFocusAreas,
  onPracticeQuestion,
}) => {
  // Replay Player State
  const [isPlayingReplay, setIsPlayingReplay] = useState<boolean>(false);
  const [currentReplayTime, setCurrentReplayTime] = useState<number>(45); // in seconds
  const [activeMarker, setActiveMarker] = useState<string>('00:45');

  // Expanded Answer Rewriter toggle per evaluation
  const [expandedRewriterId, setExpandedRewriterId] = useState<string | null>(null);

  // Extract all detected bottleneck items across all question evaluations
  const allDetectedBottlenecks: DetailedBottleneckItem[] = [];
  session.evaluations?.forEach((ev) => {
    if (ev.bottlenecks?.detectedBottlenecks) {
      allDetectedBottlenecks.push(...ev.bottlenecks.detectedBottlenecks);
    }
  });

  // Identify Weakest Answer
  const weakestEvaluation = session.evaluations && session.evaluations.length > 0
    ? [...session.evaluations].sort((a, b) => a.overallScore - b.overallScore)[0]
    : null;

  // AI Replay Markers Definition
  const replayMarkers = [
    { time: 45, label: '00:45', type: 'Strong Answer', color: 'bg-emerald-500', note: 'Clear STAR structure and confident delivery.' },
    { time: 135, label: '02:15', type: 'Weak Answer', color: 'bg-rose-500', note: 'Lacked technical depth on KV cache scaling.' },
    { time: 220, label: '03:40', type: 'Long Pause', color: 'bg-amber-500', note: '5.2-second pause detected before algorithm response.' },
    { time: 250, label: '04:10', type: 'Filler Words', color: 'bg-indigo-500', note: 'Cluster of 7 filler words ("um", "like").' },
    { time: 320, label: '05:20', type: 'Technical Mistake', color: 'bg-rose-600', note: 'Mishandled O(N) vs O(1) hash map lookup.' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-16 bg-[#FFFFFF] text-[#111827]">
      {/* Top Banner Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] text-[#111827] shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FAFAFA] border border-[#E5E7EB] text-[#111827] text-xs font-semibold">
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>AI Evaluation Report • Complete Session Lock</span>
          </div>

          <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
            Recommendation: {session.hiringRecommendation || 'Hire'}
          </span>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827]">
            Interview Feedback & AI Coach Report
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-1 max-w-2xl leading-relaxed">
            Position: <span className="font-bold text-[#111827]">{session.jobTitle}</span> • Candidate: <span className="font-bold text-[#111827]">{session.candidateName}</span>
          </p>
        </div>
      </div>

      {/* Key Metric Score Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#6B7280] font-bold">Overall Score</span>
          <div className="mt-2 flex items-baseline space-x-1 sm:space-x-2">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-[#111827]">{session.overallScore}%</span>
          </div>
          <p className="mt-1 text-[10px] text-emerald-600 font-mono">Passing Grade</p>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#6B7280] font-bold">Technical</span>
          <div className="mt-2 flex items-baseline space-x-1 sm:space-x-2">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-[#111827]">{session.technicalScore}%</span>
          </div>
          <p className="mt-1 text-[10px] text-[#6B7280] font-mono">Domain Depth</p>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#6B7280] font-bold">Coding</span>
          <div className="mt-2 flex items-baseline space-x-1 sm:space-x-2">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-emerald-700">{session.codingScore || 85}%</span>
          </div>
          <p className="mt-1 text-[10px] text-emerald-600 font-mono">Compiler Execution</p>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#6B7280] font-bold">Problem Solving</span>
          <div className="mt-2 flex items-baseline space-x-1 sm:space-x-2">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-amber-700">{session.problemSolvingScore || 82}%</span>
          </div>
          <p className="mt-1 text-[10px] text-amber-600 font-mono">Algorithmic Logic</p>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#6B7280] font-bold">Communication</span>
          <div className="mt-2 flex items-baseline space-x-1 sm:space-x-2">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-[#111827]">{session.communicationScore || 80}%</span>
          </div>
          <p className="mt-1 text-[10px] text-[#6B7280] font-mono">Fluency & Clarity</p>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#6B7280] font-bold">Behavioral</span>
          <div className="mt-2 flex items-baseline space-x-1 sm:space-x-2">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-[#111827]">{session.behavioralScore || 84}%</span>
          </div>
          <p className="mt-1 text-[10px] text-[#6B7280] font-mono">STAR Approach</p>
        </div>
      </div>

      {/* SECTION 11: INTERVIEW REPLAY WITH TIMELINE MARKERS */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
          <div className="flex items-center space-x-2">
            <Video className="w-5 h-5 text-[#111827]" />
            <h3 className="text-base font-extrabold text-[#111827]">AI Interview Replay & Timestamp Markers</h3>
          </div>
          <span className="text-xs font-mono text-[#6B7280]">Recording Length: 06:15</span>
        </div>

        {/* Video Player Box Mockup */}
        <div className="p-6 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-[#111827] space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsPlayingReplay(!isPlayingReplay)}
                className="p-3 rounded-full bg-[#111827] hover:bg-[#1f2937] text-white font-bold transition-transform hover:scale-105 cursor-pointer"
              >
                {isPlayingReplay ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>
              <div>
                <span className="text-xs font-bold block text-[#111827]">Interview Session Video Recording</span>
                <span className="text-[10px] font-mono text-[#6B7280]">Timestamp: 00:{currentReplayTime < 10 ? `0${currentReplayTime}` : currentReplayTime} / 06:15</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs font-mono">
              <span className="px-2 py-1 rounded bg-[#FFFFFF] border border-[#E5E7EB] text-[#111827]">1.0x Speed</span>
              <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">Audio Sync OK</span>
            </div>
          </div>

          {/* Timeline Bar with Markers */}
          <div className="space-y-2 pt-2">
            <div className="relative w-full h-3 rounded-full bg-[#E5E7EB] cursor-pointer overflow-hidden">
              <div className="h-full bg-[#111827] rounded-full" style={{ width: `${(currentReplayTime / 375) * 100}%` }} />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono pt-1">
              {replayMarkers.map((m) => (
                <button
                  key={m.label}
                  onClick={() => {
                    setCurrentReplayTime(m.time);
                    setActiveMarker(m.label);
                  }}
                  className={`flex items-center space-x-1 px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                    activeMarker === m.label
                      ? 'bg-[#111827] border-[#111827] text-white font-bold scale-105 shadow-xs'
                      : 'bg-[#FFFFFF] border-[#E5E7EB] text-[#6B7280] hover:text-[#111827]'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${m.color}`} />
                  <span>{m.type} ({m.label})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Marker Note Box */}
          {activeMarker && (
            <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] text-xs space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#111827] font-bold block">AI Marker Analysis ({activeMarker}):</span>
              <p className="text-[#374151] font-medium">
                {replayMarkers.find((m) => m.label === activeMarker)?.note}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 12: WEAKEST ANSWER DETECTION & PRACTICE THIS QUESTION */}
      {weakestEvaluation && (
        <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-rose-300 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <h3 className="text-base font-extrabold text-[#111827]">Weakest Answer Detected</h3>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-mono text-xs font-bold border border-rose-200">
              Score: {weakestEvaluation.overallScore}%
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] font-mono uppercase text-[#6B7280] font-bold block">Question:</span>
              <p className="font-bold text-[#111827] text-sm mt-0.5">{weakestEvaluation.questionText}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB]">
              <span className="text-[10px] font-mono uppercase text-[#6B7280] font-bold block">Candidate Answer:</span>
              <p className="text-[#374151] italic mt-1 leading-relaxed">
                "{weakestEvaluation.candidateAnswer || 'Answer lacked structure and technical depth.'}"
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
              <span className="text-[10px] font-mono uppercase text-rose-800 font-bold block">What Was Missing:</span>
              <p className="text-rose-900 font-medium">
                {weakestEvaluation.whatCouldBeImproved || 'Failed to quantify latency tradeoffs, omitted error boundary validation, and lacked clear STAR framework.'}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[#6B7280] font-mono text-[11px]">Recommended: Practice answering this question again with STAR structure.</span>
              <button
                onClick={() => onPracticeQuestion && onPracticeQuestion(weakestEvaluation.questionText)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Practice This Question</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 6: RESUME ↔ INTERVIEW CONSISTENCY CHECKER */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-[#111827]" />
            <h3 className="text-base font-extrabold text-[#111827]">Resume ↔ Interview Consistency Checker</h3>
          </div>
          <span className="text-xs font-mono text-emerald-700 font-bold">85% Consistency Match</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
            <div className="flex items-center justify-between font-mono">
              <span className="font-bold text-emerald-900">Python</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900 text-[10px] font-bold">Verified</span>
            </div>
            <p className="text-[11px] text-[#374151]">Demonstrated O(1) algorithms & clean coding.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
            <div className="flex items-center justify-between font-mono">
              <span className="font-bold text-emerald-900">Machine Learning</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900 text-[10px] font-bold">Strong</span>
            </div>
            <p className="text-[11px] text-[#374151]">Accurately described loss functions & optimization.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
            <div className="flex items-center justify-between font-mono">
              <span className="font-bold text-amber-900">TensorFlow</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 text-[10px] font-bold">Needs Improvement</span>
            </div>
            <p className="text-[11px] text-[#374151]">Claimed on resume but answers lacked depth.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] space-y-1">
            <div className="flex items-center justify-between font-mono">
              <span className="font-bold text-[#111827]">Flask / FastAPI</span>
              <span className="px-1.5 py-0.5 rounded bg-[#E5E7EB] text-[#374151] text-[10px] font-bold">Not Demonstrated</span>
            </div>
            <p className="text-[11px] text-[#6B7280]">Not tested during this interview session.</p>
          </div>
        </div>
      </div>

      {/* AI Executive Summary & Recommendations */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-4 flex flex-col justify-between">
        <div className="space-y-3">
          <h3 className="text-base font-bold text-[#111827] flex items-center space-x-2">
            <BrainCircuit className="w-5 h-5 text-[#111827]" />
            <span>AI Executive Summary & Recommendations</span>
          </h3>

          <p className="text-xs sm:text-sm text-[#374151] leading-relaxed p-4 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB]">
            {session.executiveSummary ||
              'Candidate displayed robust technical understanding of core system architecture, microservices, and distributed data structures with low knowledge bottlenecks.'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
              <span className="text-xs font-bold text-emerald-900 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Key Strengths</span>
              </span>
              <ul className="text-xs text-[#374151] list-disc list-inside space-y-1 leading-relaxed">
                {(session.keyStrengths || ['System design clarity', 'Precise algorithm articulation']).map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
              <span className="text-xs font-bold text-amber-900 flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Identified Focus Areas</span>
              </span>
              <ul className="text-xs text-[#374151] list-disc list-inside space-y-1 leading-relaxed">
                {(session.criticalGaps || ['Quantified latency benchmarks', 'Edge case error handling']).map((g, idx) => (
                  <li key={idx}>{g}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-4 flex flex-wrap items-center justify-between border-t border-[#E5E7EB] gap-3">
          <button
            onClick={onBackToDashboard}
            className="px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] hover:bg-[#F3F4F6] text-[#374151] font-semibold text-xs cursor-pointer"
          >
            Back to Dashboard
          </button>

          <div className="flex items-center space-x-3">
            {onOpenFocusAreas && (
              <button
                onClick={onOpenFocusAreas}
                className="py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs flex items-center space-x-2 cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>Practice Weak Areas</span>
              </button>
            )}

            {onOpenRoadmap && (
              <button
                onClick={onOpenRoadmap}
                className="py-2.5 px-4 rounded-xl bg-[#111827] hover:bg-[#1f2937] text-white font-bold text-xs shadow-xs flex items-center space-x-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>View Learning Roadmap</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* QUESTION BY QUESTION EVALUATION LIST WITH AI ANSWER REWRITER (SECTION 5) */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-4">
        <h3 className="text-base font-bold text-[#111827] flex items-center space-x-2 pb-3 border-b border-[#E5E7EB]">
          <HelpCircle className="w-5 h-5 text-[#111827]" />
          <span>Question-by-Question Evaluation & AI Answer Rewriter</span>
        </h3>

        <div className="space-y-6 divide-y divide-[#E5E7EB]">
          {session.evaluations?.map((ev, idx) => {
            const isRewriterExpanded = expandedRewriterId === (ev.questionId || String(idx));

            return (
              <div key={ev.questionId || idx} className="pt-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-[#111827]">
                      Question #{idx + 1}: {ev.questionText}
                    </span>
                    {ev.codeSubmission && (
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-mono text-[10px] border border-emerald-200">
                        Coding Challenge ({ev.codeSubmission.language})
                      </span>
                    )}
                  </div>
                  <span className="font-mono font-bold text-emerald-700 text-sm">
                    Score: {ev.overallScore}%
                  </span>
                </div>

                {/* Candidate Verbal Answer */}
                <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-[#6B7280] font-bold">
                      Original Candidate Answer:
                    </span>
                    <button
                      onClick={() => setExpandedRewriterId(isRewriterExpanded ? null : (ev.questionId || String(idx)))}
                      className="text-[10px] font-bold text-[#111827] hover:underline flex items-center space-x-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{isRewriterExpanded ? 'Hide AI Improved Answer' : 'Improve This Answer (STAR)'}</span>
                    </button>
                  </div>
                  <p className="text-[#374151] italic leading-relaxed">
                    "{ev.candidateAnswer || 'No verbal response recorded.'}"
                  </p>
                </div>

                {/* AI ANSWER REWRITER BOX (SECTION 5) */}
                {isRewriterExpanded && (
                  <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-[#111827] space-y-3 text-xs animate-fade-in">
                    <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
                      <span className="font-bold text-[#111827] flex items-center space-x-1.5 font-mono text-[11px]">
                        <Lightbulb className="w-4 h-4 text-[#111827]" />
                        <span>AI Improved Answer (STAR Method Format)</span>
                      </span>
                      <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                        Estimated Score: 95%
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="p-2.5 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB]">
                        <span className="font-bold text-rose-700 block text-[10px] uppercase">Problems Detected in Original Answer:</span>
                        <p className="text-[#374151] mt-0.5 text-[11px]">
                          Lacked quantitative metrics, contained 4 filler pauses, and missed key architectural trade-offs.
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] space-y-1.5 font-sans">
                        <span className="font-bold text-emerald-800 block text-[11px]">Sample High-Impact STAR Answer:</span>
                        <p className="text-[#374151] leading-relaxed italic">
                          "<strong>Situation:</strong> In my previous role leading our ML pipeline, we faced a 40% memory spike during peak inference.<br />
                          <strong>Task:</strong> I was tasked with optimizing memory throughput without increasing GPU hardware costs.<br />
                          <strong>Action:</strong> I implemented KV cache quantization and structured vector lookups using Python and PyTorch.<br />
                          <strong>Result:</strong> We reduced latency by 35% and saved $12k/month in infrastructure overhead."
                        </p>
                      </div>

                      <p className="text-[10px] text-[#6B7280] italic">
                        * Note: This AI-generated sample demonstrates proper STAR structure and quantitative clarity.
                      </p>
                    </div>
                  </div>
                )}

                {/* Candidate Code Submission (if applicable) */}
                {ev.codeSubmission && (
                  <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-xs space-y-3 font-mono">
                    <div className="flex items-center justify-between text-[#6B7280] border-b border-[#E5E7EB] pb-2 text-[11px]">
                      <span className="text-emerald-700 font-bold flex items-center space-x-1">
                        <span>Language: {ev.codeSubmission.language.toUpperCase()}</span>
                      </span>
                      <div className="flex items-center space-x-3 text-[10px]">
                        <span>Tests Passed: {ev.codeSubmission.testCasesPassed}/{ev.codeSubmission.totalTestCases}</span>
                        <span>Time: {ev.codeSubmission.executionTimeMs}ms</span>
                        <span>Memory: {ev.codeSubmission.memoryUsageMb}MB</span>
                      </div>
                    </div>

                    <pre className="p-3 bg-[#FFFFFF] rounded-xl border border-[#E5E7EB] text-[#111827] overflow-x-auto text-[11px] leading-relaxed">
                      {ev.codeSubmission.code}
                    </pre>

                    {ev.codeSubmission.compilerOutput && (
                      <div className="p-2.5 bg-[#FFFFFF] rounded-lg border border-[#E5E7EB] text-[#374151] text-[10px]">
                        <span className="text-[#6B7280] font-bold block mb-0.5">Compiler Output Log:</span>
                        <span>{ev.codeSubmission.compilerOutput}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* AI Coach Feedback Block */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1">
                    <span className="text-[10px] font-mono uppercase text-emerald-800 font-bold">
                      What Went Well:
                    </span>
                    <p className="text-[#374151] leading-relaxed">
                      {ev.whatWasGood || ev.decoderOutput?.explainableScoreReasoning}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-xs space-y-1">
                    <span className="text-[10px] font-mono uppercase text-[#111827] font-bold">
                      AI Recommendation:
                    </span>
                    <p className="text-[#374151] leading-relaxed">
                      {ev.aiCoachRecommendation || 'Review algorithm time complexity and edge case validations.'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
