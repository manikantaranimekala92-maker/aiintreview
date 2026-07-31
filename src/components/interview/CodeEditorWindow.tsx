import React, { useState, useEffect } from 'react';
import {
  SUPPORTED_LANGUAGES,
  DEFAULT_STARTER_CODE,
  executeCandidateCode,
} from '../../services/codeExecutionService';
import { CodeSubmissionData, TestCaseItem } from '../../types';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Code2,
  Terminal,
  Cpu,
  Clock,
  Sparkles,
  Send,
  FileCode,
  Check,
  AlertTriangle,
} from 'lucide-react';

interface CodeEditorWindowProps {
  initialLanguage?: string;
  starterCode?: Record<string, string>;
  testCases?: TestCaseItem[];
  problemTitle?: string;
  problemDescription?: string;
  onCodeSubmitted?: (submission: CodeSubmissionData) => void;
}

export const CodeEditorWindow: React.FC<CodeEditorWindowProps> = ({
  initialLanguage = 'python',
  starterCode,
  testCases,
  problemTitle = 'Two Sum Problem',
  problemDescription = 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution.',
  onCodeSubmitted,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>(initialLanguage);
  const [code, setCode] = useState<string>(
    starterCode?.[initialLanguage] || DEFAULT_STARTER_CODE[initialLanguage] || ''
  );
  const [customInput, setCustomInput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'output' | 'testcases'>('testcases');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [submission, setSubmission] = useState<CodeSubmissionData | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Handle language change
  const handleLanguageChange = (newLang: string) => {
    setSelectedLanguage(newLang);
    const defaultCode =
      starterCode?.[newLang] || DEFAULT_STARTER_CODE[newLang] || '// Write your solution here';
    setCode(defaultCode);
    setSubmission(null);
    setIsSubmitted(false);
  };

  // Reset Code
  const handleReset = () => {
    const defaultCode =
      starterCode?.[selectedLanguage] ||
      DEFAULT_STARTER_CODE[selectedLanguage] ||
      '// Write your solution here';
    setCode(defaultCode);
    setSubmission(null);
    setIsSubmitted(false);
  };

  // Run Code
  const handleRunCode = async () => {
    setIsExecuting(true);
    try {
      const result = await executeCandidateCode(
        selectedLanguage,
        code,
        customInput,
        testCases
      );
      setSubmission(result);
      setActiveTab('testcases');
    } catch (e) {
      console.error('Code execution error:', e);
    } finally {
      setIsExecuting(false);
    }
  };

  // Submit Code
  const handleSubmitCode = async () => {
    setIsExecuting(true);
    try {
      const result = await executeCandidateCode(
        selectedLanguage,
        code,
        customInput,
        testCases
      );
      setSubmission(result);
      setIsSubmitted(true);
      if (onCodeSubmitted) {
        onCodeSubmitted(result);
      }
    } catch (e) {
      console.error('Code submission error:', e);
    } finally {
      setIsExecuting(false);
    }
  };

  // Compute line numbers
  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 12) }, (_, i) => i + 1);

  return (
    <div className="rounded-2xl bg-[#020817] border border-slate-800 shadow-2xl flex flex-col overflow-hidden text-slate-100 font-sans">
      {/* 1. TOP TOOLBAR */}
      <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Code2 className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-white tracking-wide">
            Multi-Language Code Editor
          </span>

          {/* Language Dropdown Selector */}
          <select
            value={selectedLanguage}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-indigo-300 font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name} ({lang.version})
              </option>
            ))}
          </select>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-semibold flex items-center space-x-1.5 border border-slate-800"
            title="Reset code to default template"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            onClick={handleRunCode}
            disabled={isExecuting}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-sm disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
            <span>{isExecuting ? 'Compiling...' : 'Run Code'}</span>
          </button>

          <button
            onClick={handleSubmitCode}
            disabled={isExecuting}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white font-extrabold text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
          >
            {isSubmitted ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Submitted</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Submit Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. PROBLEM PROMPT */}
      <div className="p-3.5 px-4 bg-slate-900/60 border-b border-slate-800 text-xs space-y-1">
        <h4 className="font-bold text-indigo-300 flex items-center space-x-1.5">
          <FileCode className="w-3.5 h-3.5" />
          <span>{problemTitle}</span>
        </h4>
        <p className="text-slate-300 text-[11px] leading-relaxed">
          {problemDescription}
        </p>
      </div>

      {/* 3. CODE EDITOR AREA */}
      <div className="relative flex bg-[#030816] min-h-[220px] max-h-[300px] overflow-hidden font-mono text-xs">
        {/* Line Numbers */}
        <div className="w-10 select-none py-3 bg-slate-950/80 border-r border-slate-800 text-slate-600 text-right pr-2 space-y-0.5 leading-5 text-[11px]">
          {lineNumbers.map((num) => (
            <div key={num}>{num}</div>
          ))}
        </div>

        {/* Code Textarea */}
        <textarea
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setIsSubmitted(false);
          }}
          spellCheck={false}
          className="flex-1 p-3 bg-transparent text-slate-100 focus:outline-none resize-none leading-5 font-mono text-xs border-none whitespace-pre"
        />
      </div>

      {/* 4. EXECUTION RESULTS & OUTPUT PANEL */}
      <div className="bg-slate-950 border-t border-slate-800 p-3 space-y-2">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center space-x-3 text-xs">
            <button
              onClick={() => setActiveTab('testcases')}
              className={`font-bold flex items-center space-x-1.5 pb-0.5 border-b-2 transition-all ${
                activeTab === 'testcases'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Test Cases</span>
              {submission && (
                <span className="ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300">
                  {submission.testCasesPassed}/{submission.totalTestCases}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('output')}
              className={`font-bold flex items-center space-x-1.5 pb-0.5 border-b-2 transition-all ${
                activeTab === 'output'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Compiler Logs</span>
            </button>
          </div>

          {submission && (
            <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-400">
              <span className="flex items-center space-x-1">
                <Clock className="w-3 h-3 text-emerald-400" />
                <span>{submission.executionTimeMs} ms</span>
              </span>
              <span className="flex items-center space-x-1">
                <Cpu className="w-3 h-3 text-indigo-400" />
                <span>{submission.memoryUsageMb} MB</span>
              </span>
            </div>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === 'testcases' && (
          <div className="space-y-2 max-h-36 overflow-y-auto pt-1">
            {!submission ? (
              <p className="text-slate-500 text-[11px] italic py-2">
                Click "Run Code" or "Submit Code" to execute test assertions against sandboxed compiler.
              </p>
            ) : (
              submission.testCaseDetails?.map((tc) => (
                <div
                  key={tc.id}
                  className={`p-2.5 rounded-xl border text-xs space-y-1 ${
                    tc.passed
                      ? 'bg-emerald-950/20 border-emerald-800/60 text-slate-200'
                      : 'bg-rose-950/20 border-rose-800/60 text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="font-bold flex items-center space-x-1.5">
                      {tc.passed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-400" />
                      )}
                      <span>Test Case #{tc.id}</span>
                    </span>
                    <span className={tc.passed ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {tc.passed ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[10px] font-mono pt-1 text-slate-400">
                    <div>
                      <span className="text-slate-500 block">Input:</span>
                      <span className="text-slate-200">{tc.input}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Expected:</span>
                      <span className="text-emerald-400">{tc.expectedOutput}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Actual:</span>
                      <span className={tc.passed ? 'text-emerald-400' : 'text-rose-400'}>
                        {tc.actualOutput}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'output' && (
          <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed">
            {submission ? (
              submission.compilerOutput
            ) : (
              <span className="text-slate-500 italic">No output logged yet.</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
