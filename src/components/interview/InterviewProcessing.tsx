import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, Sparkles, BrainCircuit, ShieldCheck, FileCheck } from 'lucide-react';

interface InterviewProcessingProps {
  onProcessingComplete: () => void;
}

export const InterviewProcessing: React.FC<InterviewProcessingProps> = ({
  onProcessingComplete,
}) => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    const steps = [1, 2, 3, 4, 5, 6];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setCompletedSteps((prev) => [...prev, step]);
      }, (index + 1) * 700);
    });

    const finalTimer = setTimeout(() => {
      onProcessingComplete();
    }, 4800);

    return () => clearTimeout(finalTimer);
  }, [onProcessingComplete]);

  const processList = [
    { id: 1, title: 'Finalizing MediaRecorder Stream & Video Encoding', subtitle: 'Saving WebM/MP4 recording blob & timestamp markers' },
    { id: 2, title: 'Compiling Speech-to-Text Transcripts', subtitle: 'Generating candidate response audio alignment' },
    { id: 3, title: 'Executing Transformer Encoder Embeddings', subtitle: 'Decomposing technical semantics and concept coverage' },
    { id: 4, title: 'Running AI Bottleneck Detection Module', subtitle: 'Analyzing 13 knowledge gap & communication dimensions' },
    { id: 5, title: 'Transformer Decoder Feedback Generation', subtitle: 'Formulating explainable scoring and adaptive learning roadmap' },
    { id: 6, title: 'Generating Candidate & Recruiter Reports', subtitle: 'Syncing interactive video review timeline' },
  ];

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 space-y-8 text-center animate-fade-in">
      <div className="relative inline-flex items-center justify-center p-4 rounded-3xl bg-indigo-950/80 border border-indigo-800 text-indigo-400 shadow-2xl">
        <BrainCircuit className="w-12 h-12 animate-pulse" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Processing AI Interview Evaluation
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          The Transformer Encoder-Decoder pipeline and Bottleneck Detection Engine are evaluating candidate performance metrics...
        </p>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-[#030816] border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 text-left">
        {processList.map((item) => {
          const isDone = completedSteps.includes(item.id);

          return (
            <div
              key={item.id}
              className={`p-3.5 rounded-2xl border transition-all flex items-start space-x-3 ${
                isDone
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/80 text-emerald-950 dark:text-emerald-200'
                  : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <Loader2 className="w-5 h-5 text-indigo-500 animate-spin shrink-0 mt-0.5" />
              )}

              <div className="space-y-0.5">
                <p className="text-xs font-bold">{item.title}</p>
                <p className="text-[11px] opacity-80">{item.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
