import React, { useState } from 'react';
import { InterviewSession } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import confetti from 'canvas-confetti';
import {
  Award,
  Brain,
  AlertTriangle,
  Download,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  Layers,
  FileText,
  Target,
  Zap,
  ShieldCheck,
  ShieldAlert,
  BookOpen,
} from 'lucide-react';

interface EvaluationViewerProps {
  session: InterviewSession;
  onBack: () => void;
}

export const EvaluationViewer: React.FC<EvaluationViewerProps> = ({ session, onBack }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'encoder' | 'bottlenecks' | 'comparison'>('summary');
  const [isExportingPDF, setIsExportingPDF] = useState<boolean>(false);

  // Trigger celebration confetti if score >= 80
  React.useEffect(() => {
    if (session.overallScore >= 80) {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    }
  }, [session]);

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    const element = document.getElementById('evaluation-report-container');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Interview_Evaluation_${session.candidateName.replace(/\s+/g, '_')}_${session.id}.pdf`);
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setIsExportingPDF(false);
    }
  };

  const getVerdictBadge = (rec: InterviewSession['hiringRecommendation']) => {
    switch (rec) {
      case 'Strong Hire':
        return <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold">Strong Hire</span>;
      case 'Hire':
        return <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-bold">Hire</span>;
      case 'Leaning Hire':
        return <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-bold">Leaning Hire</span>;
      case 'Lean No Hire':
        return <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-bold">Lean No Hire</span>;
      case 'No Hire':
        return <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 px-3 py-1 rounded-full text-xs font-bold">No Hire</span>;
    }
  };

  const firstEval = session.evaluations[0] || {
    questionId: 'q1',
    questionText: 'Standard technical prompt',
    candidateAnswer: 'Sample answer text',
    overallScore: session.overallScore,
    technicalDepthScore: session.technicalScore,
    communicationScore: session.communicationScore,
    confidenceScore: session.confidenceScore,
    bottlenecks: {
      knowledgeGapScore: session.bottleneckScore,
      communicationGapScore: 15,
      reasoningQualityScore: 88,
      confidenceScore: session.confidenceScore,
      improvementScore: 12,
      hallucinationRisk: 'Low' as const,
      biasDetected: false,
      completenessPercent: 90,
      missingKeywords: ['SRAM tiling'],
      missingExamples: ['A100 SRAM limit'],
      weakConcepts: [],
      grammarFluencyScore: 95,
      hesitationCount: 1,
      fillerWordsCount: 2,
    },
    encoderAnalysis: {
      semanticContext: 'Transformer Self Attention & Memory Tiling',
      intentMatchPercent: 92,
      embeddingVectorDistance: 0.08,
      keyConceptCoverage: 88,
    },
    decoderOutput: {
      explainableScoreReasoning: 'Strong performance on theoretical complexity and memory architecture.',
      missingConceptsExplanation: 'Omitted explicit backward pass activation recomputation.',
      expectedAnswerComparison: 'Gold standard answer includes SRAM tiling, online softmax, and HBM memory bounds.',
      suggestedImprovements: ['Mention backward pass recomputation.'],
      adaptiveNextDifficulty: 'hard' as const,
      recommendedFollowUpTopic: 'FlashAttention',
    },
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Back button & Export Action */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sessions List</span>
        </button>

        <button
          onClick={handleExportPDF}
          disabled={isExportingPDF}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>{isExportingPDF ? 'Generating PDF...' : 'Export Executive PDF Report'}</span>
        </button>
      </div>

      {/* Main printable report container */}
      <div id="evaluation-report-container" className="space-y-6 p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
        {/* Report Header Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">{session.candidateName}</h1>
              {getVerdictBadge(session.hiringRecommendation)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Role: <span className="font-semibold text-slate-700 dark:text-slate-200">{session.jobTitle}</span> | Evaluation Date: {new Date(session.date).toLocaleDateString()}
            </p>
          </div>

          <div className="flex items-center space-x-6">
            <div className="text-center">
              <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">{session.overallScore}%</span>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Overall Score</p>
            </div>
            <div className="w-px h-10 bg-slate-200 dark:bg-slate-800" />
            <div className="text-center">
              <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{session.technicalScore}%</span>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Technical</p>
            </div>
            <div className="w-px h-10 bg-slate-200 dark:bg-slate-800" />
            <div className="text-center">
              <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">{session.bottleneckScore}</span>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Bottleneck Index</p>
            </div>
          </div>
        </div>

        {/* Diagnostic Tabs */}
        <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'summary'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
            }`}
          >
            Executive Summary
          </button>
          <button
            onClick={() => setActiveTab('encoder')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'encoder'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
            }`}
          >
            Transformer Encoder Layer
          </button>
          <button
            onClick={() => setActiveTab('bottlenecks')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'bottlenecks'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
            }`}
          >
            AI Bottleneck Diagnostics
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'comparison'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
            }`}
          >
            Expected Answer Comparison
          </button>
        </div>

        {/* Tab 1: Executive Summary */}
        {activeTab === 'summary' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Executive Overview</h3>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                {session.executiveSummary}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Key Demonstrated Strengths</span>
                </h4>
                <div className="space-y-2">
                  {session.keyStrengths?.map((str, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/60 text-xs text-slate-800 dark:text-slate-200 font-medium">
                      • {str}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Critical Knowledge Gaps</span>
                </h4>
                <div className="space-y-2">
                  {session.criticalGaps?.map((gap, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/60 text-xs text-slate-800 dark:text-slate-200 font-medium">
                      • {gap}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Transformer Encoder Layer Analysis */}
        {activeTab === 'encoder' && (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Transformer Encoder Semantic Layer</h3>
                <p className="text-xs text-slate-500">Deconstructs technical context, intent match %, and embedding vector distance.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500 font-semibold">Semantic Context</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{firstEval.encoderAnalysis.semanticContext}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500 font-semibold">Intent Match %</span>
                <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-1">{firstEval.encoderAnalysis.intentMatchPercent}%</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500 font-semibold">Embedding Distance ($d$)</span>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">{firstEval.encoderAnalysis.embeddingVectorDistance}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: AI Bottleneck Diagnostics */}
        {activeTab === 'bottlenecks' && (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>AI Bottleneck Diagnostic Matrix</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500">Knowledge Gap Score</span>
                <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{firstEval.bottlenecks.knowledgeGapScore} / 100</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500">Hallucination Risk</span>
                <p className="text-xl font-bold text-emerald-600 mt-1">{firstEval.bottlenecks.hallucinationRisk}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500">Completeness %</span>
                <p className="text-xl font-bold text-indigo-600 mt-1">{firstEval.bottlenecks.completenessPercent}%</p>
              </div>
            </div>

            {/* Explainable AI Why This Score */}
            <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-2">
              <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-wider">Explainable AI Justification ("Why this score?")</h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {firstEval.decoderOutput.explainableScoreReasoning}
              </p>
            </div>
          </div>
        )}

        {/* Tab 4: Expected Answer Comparison */}
        {activeTab === 'comparison' && (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Candidate Response vs Model Gold Standard</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Candidate Response</span>
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-mono">
                  "{firstEval.candidateAnswer}"
                </p>
              </div>

              <div className="p-4 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-2">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Expected Model Gold Standard Answer</span>
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-mono">
                  "{firstEval.decoderOutput.expectedAnswerComparison}"
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
