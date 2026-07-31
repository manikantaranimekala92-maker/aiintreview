import React, { useState, useRef, useEffect } from 'react';
import { Lightbulb, Sparkles, ChevronRight, RefreshCw, X, CheckCircle2 } from 'lucide-react';

export interface InterviewTip {
  title: string;
  category: string;
  tip: string;
  example?: string;
}

export const INTERVIEW_BEST_PRACTICES: InterviewTip[] = [
  {
    title: 'The STAR Method',
    category: 'Behavioral & Scenario',
    tip: 'Structure your answers using Situation, Task, Action, and Result. Focus 70% of your time detailing your specific Actions and measurable Results.',
    example: 'e.g., "To reduce API latency (T), I implemented Redis caching (A), cutting response times by 40% (R)."',
  },
  {
    title: 'Think Out Loud',
    category: 'Problem Solving',
    tip: 'Verbalize your reasoning as you work through problems. Evaluators assess your thought process and logical decomposition, not just the final answer.',
    example: 'e.g., "First, I am considering a hash map approach for O(1) lookups, but let us discuss space trade-offs."',
  },
  {
    title: 'Clarify Constraints First',
    category: 'System Design & Coding',
    tip: 'Before proposing a solution, state your assumptions regarding data volume, read/write ratios, edge cases, and latency requirements.',
    example: 'e.g., "Are we optimizing for high read throughput or immediate consistency?"',
  },
  {
    title: 'Pacing & Camera Engagement',
    category: 'Live Video Presence',
    tip: 'Maintain direct camera eye contact, speak at a measured pace, and pause for 2 seconds after receiving a prompt to organize your response.',
  },
  {
    title: 'Highlight System Trade-Offs',
    category: 'Architecture & Technical',
    tip: 'When choosing a database, data structure, or framework, explicitly compare time complexity, memory overhead, or operational maintenance.',
  },
];

interface QuickTipsTooltipProps {
  /** Alignment of tooltip popover */
  align?: 'left' | 'right' | 'center';
  /** Additional custom container styling */
  className?: string;
  /** Custom button label if desired */
  buttonLabel?: string;
  /** Variant style */
  variant?: 'subtle' | 'highlight' | 'compact';
}

export const QuickTipsTooltip: React.FC<QuickTipsTooltipProps> = ({
  align = 'right',
  className = '',
  buttonLabel = 'Quick Tip',
  variant = 'highlight',
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentTipIdx, setCurrentTipIdx] = useState<number>(0);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const currentTip = INTERVIEW_BEST_PRACTICES[currentTipIdx];

  const handleNextTip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentTipIdx((prev) => (prev + 1) % INTERVIEW_BEST_PRACTICES.length);
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Position alignment classes
  const alignClasses =
    align === 'left'
      ? 'left-0'
      : align === 'center'
      ? 'left-1/2 -translate-x-1/2'
      : 'right-0';

  return (
    <div className={`relative inline-block ${className}`} ref={tooltipRef}>
      {/* Quick Tip Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer select-none ${
          variant === 'highlight'
            ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30 shadow-sm'
            : variant === 'compact'
            ? 'p-2 bg-stone-800/80 hover:bg-stone-700 text-amber-400 rounded-lg border border-stone-700'
            : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
        }`}
        title="View Professional Interview Best Practice"
      >
        <Lightbulb className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
        {buttonLabel && <span className="text-xs font-bold">{buttonLabel}</span>}
      </button>

      {/* Tooltip Popover Card */}
      {isOpen && (
        <div
          className={`absolute bottom-full mb-2.5 z-50 w-72 sm:w-80 p-4 rounded-2xl bg-stone-900 border border-amber-500/30 text-white shadow-2xl backdrop-blur-xl animate-fade-in ${alignClasses}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-800 pb-2.5 mb-2.5">
            <div className="flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400">
                Interview Best Practice ({currentTipIdx + 1}/{INTERVIEW_BEST_PRACTICES.length})
              </span>
            </div>

            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={handleNextTip}
                className="p-1 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-amber-300 transition-colors cursor-pointer"
                title="Cycle to next tip"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-white text-xs sm:text-sm">{currentTip.title}</h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 border border-stone-700">
                {currentTip.category}
              </span>
            </div>

            <p className="text-stone-300 text-xs leading-relaxed font-medium">
              {currentTip.tip}
            </p>

            {currentTip.example && (
              <div className="p-2 rounded-xl bg-stone-950/80 border border-stone-800/80 text-[11px] font-mono text-amber-300/90 leading-snug">
                {currentTip.example}
              </div>
            )}
          </div>

          {/* Footer Action */}
          <div className="mt-3 pt-2 border-t border-stone-800/80 flex items-center justify-between text-[10px] text-stone-400 font-mono">
            <span className="flex items-center space-x-1 text-emerald-400">
              <CheckCircle2 className="w-3 h-3" />
              <span>Context-Aware Best Practice</span>
            </span>
            <button
              type="button"
              onClick={handleNextTip}
              className="text-amber-400 font-bold hover:underline flex items-center space-x-0.5 cursor-pointer"
            >
              <span>Next Tip</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
