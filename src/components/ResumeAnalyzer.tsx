import React, { useState } from 'react';
import { ResumeData, JobDescription, InterviewMode, DifficultyLevel } from '../types';
import { parseResumeApi } from '../services/api';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Brain,
  Award,
  BookOpen,
  Loader2,
} from 'lucide-react';

interface ResumeAnalyzerProps {
  jobs: JobDescription[];
  onStartCustomInterview: (jobTitle: string, mode: InterviewMode, difficulty: DifficultyLevel, skills: string[]) => void;
}

export const ResumeAnalyzer: React.FC<ResumeAnalyzerProps> = ({ jobs, onStartCustomInterview }) => {
  const [resumeText, setResumeText] = useState<string>(
    `Alex Rivera
Senior Full Stack & Machine Learning Engineer
Email: alex.rivera@example.com | Phone: +1 (555) 234-5678

PROFESSIONAL SUMMARY:
Accomplished Full Stack AI Engineer with 5+ years of experience building production web applications, high-throughput microservices, and LLM pipelines. Proficient in Python, TypeScript, PyTorch, React, Node.js, and PostgreSQL. Experienced with Transformer models, self-attention optimization, and distributed systems.

TECHNICAL SKILLS:
Languages: Python, TypeScript, JavaScript, SQL, C++
AI/ML: PyTorch, Hugging Face Transformers, LoRA, Sentence Transformers, Scikit-Learn, OpenCV
Backend & DB: FastAPI, Express, Node.js, PostgreSQL, Redis, Docker, Kubernetes, Vector DBs (Milvus, Pinecone)
Frontend: React, Next.js, Tailwind CSS, Redux Toolkit

WORK EXPERIENCE:
Senior Software Engineer - AI Platforms (2023 - Present)
- Optimized Transformer encoder inference latency by 35% through custom KV caching and tensor parallelization.
- Built real-time WebSocket communication pipelines handling 10k+ concurrent user sessions.

Software Engineer - Full Stack (2021 - 2023)
- Built enterprise web portals using React, TypeScript, and FastAPI with 99.9% uptime.
- Implemented PostgreSQL database sharding and optimized slow SQL queries, reducing p99 response time by 40%.`
  );

  const [selectedJob, setSelectedJob] = useState<string>(jobs[0]?.title || 'Senior AI / ML Engineer');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [parsedData, setParsedData] = useState<ResumeData | null>({
    fileName: 'Alex_Rivera_Resume.pdf',
    candidateName: 'Alex Rivera',
    email: 'alex.rivera@example.com',
    yearsExperience: 5,
    extractedSkills: ['Python', 'PyTorch', 'Transformers', 'TypeScript', 'React', 'FastAPI', 'PostgreSQL', 'Docker'],
    summary: 'Senior Full Stack & AI Engineer with 5+ years building production ML pipelines and web microservices.',
    matchedRole: jobs[0]?.title || 'Senior AI / ML Engineer',
    fitScore: 88,
    recommendedPreparation: ['TRT-LLM Quantization', 'Vector DB HNSW Indexing', 'FlashAttention-2 Memory Tiling', 'System Design Scale'],
    recommendedTopics: ['TRT-LLM Quantization', 'Vector DB HNSW Indexing', 'FlashAttention-2 Memory Tiling'],
  });

  const handleParseResume = async () => {
    if (!resumeText.trim()) return;
    setIsAnalyzing(true);
    try {
      const result = await parseResumeApi(resumeText, selectedJob);
      setParsedData(result);
    } catch (err) {
      console.error('Error parsing resume:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12 transition-colors">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2D3340] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340] text-[#111827] dark:text-white text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Resume Parsing & Candidate Match Analysis</span>
          </div>
          <h1 className="text-xl font-bold text-[#111827] dark:text-white">Resume & Job Description Matcher</h1>
          <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">
            Extract skills, calculate job fit scores, and identify key focus areas before starting your interview.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (5 cols): Resume Upload & Paste Input */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2D3340] shadow-xs space-y-4 transition-colors">
            <h2 className="text-sm font-bold text-[#111827] dark:text-white flex items-center space-x-2">
              <FileText className="w-4 h-4 text-[#111827] dark:text-white" />
              <span>Paste Resume or Document Content</span>
            </h2>

            {/* Target Job Selector */}
            <div>
              <label className="block text-xs font-semibold text-[#374151] dark:text-[#F9FAFB] mb-1.5">
                Target Position to Benchmark Against
              </label>
              <select
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340] text-xs font-medium text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {jobs.map((j) => (
                  <option key={j.id} value={j.title}>
                    {j.title} ({j.department})
                  </option>
                ))}
              </select>
            </div>

            {/* Resume Text Area */}
            <div>
              <label className="block text-xs font-semibold text-[#374151] dark:text-[#F9FAFB] mb-1.5">
                Resume Content / CV Text
              </label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                rows={12}
                placeholder="Paste plain text from your resume here..."
                className="w-full p-3.5 rounded-xl bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340] text-xs text-[#111827] dark:text-white font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              onClick={handleParseResume}
              disabled={isAnalyzing || !resumeText.trim()}
              className="w-full py-3 rounded-xl bg-[#111827] dark:bg-indigo-600 hover:bg-[#1f2937] dark:hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Extracting Skills & Gap Vector...</span>
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  <span>Run AI Resume Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column (7 cols): Parsed Analysis & Tailored Interview Launcher */}
        <div className="lg:col-span-7 space-y-6">
          {parsedData ? (
            <div className="p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2D3340] shadow-xs space-y-6 transition-colors">
              {/* Top Summary Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340]">
                <div>
                  <h3 className="text-base font-bold text-[#111827] dark:text-white">{parsedData.candidateName}</h3>
                  <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                    Experience: <span className="font-semibold text-[#111827] dark:text-white">{parsedData.yearsExperience} Years</span> | Target: {parsedData.matchedRole}
                  </p>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-sm font-extrabold">
                    <Award className="w-4 h-4" />
                    <span>{parsedData.fitScore}% Fit Score</span>
                  </div>
                </div>
              </div>

              {/* Executive Summary */}
              <div>
                <h4 className="text-xs font-bold text-[#374151] dark:text-[#F9FAFB] uppercase tracking-wider mb-2">
                  AI Profile Summary
                </h4>
                <p className="text-xs text-[#374151] dark:text-[#F9FAFB] leading-relaxed p-3.5 rounded-xl bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340]">
                  {parsedData.summary}
                </p>
              </div>

              {/* Extracted Skills Badges */}
              <div>
                <h4 className="text-xs font-bold text-[#374151] dark:text-[#F9FAFB] uppercase tracking-wider mb-2">
                  Extracted Technical Skills ({parsedData.extractedSkills.length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {parsedData.extractedSkills.map((sk, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-[#FAFAFA] dark:bg-[#1F232D] text-[#111827] dark:text-white border border-[#E5E7EB] dark:border-[#2D3340] text-xs font-medium"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recommended Focus Topics */}
              <div>
                <h4 className="text-xs font-bold text-[#374151] dark:text-[#F9FAFB] uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#111827] dark:text-white" />
                  <span>Recommended Focus Topics</span>
                </h4>
                <div className="space-y-2">
                  {(parsedData.recommendedPreparation || parsedData.recommendedTopics).map((top, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-xs text-[#374151] dark:text-[#F9FAFB] p-2.5 rounded-xl bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#111827] dark:text-white shrink-0" />
                      <span>{top}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action: Launch Custom Interview button */}
              <div className="pt-4 border-t border-[#E5E7EB] dark:border-[#2D3340]">
                <button
                  onClick={() =>
                    onStartCustomInterview(
                      parsedData.matchedRole || selectedJob,
                      'voice',
                      'medium',
                      parsedData.extractedSkills
                    )
                  }
                  className="w-full py-3.5 rounded-xl bg-[#111827] dark:bg-indigo-600 hover:bg-[#1f2937] dark:hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Launch Tailored AI Interview Based on Resume Analysis</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-[#FFFFFF] dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2D3340] text-center space-y-3 transition-colors">
              <UploadCloud className="w-12 h-12 text-[#9CA3AF] mx-auto" />
              <p className="text-sm font-semibold text-[#111827] dark:text-white">No Resume Parsed Yet</p>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                Paste your resume on the left and click "Run AI Resume Analysis" to benchmark your skills.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
