import React, { useState } from 'react';
import { LearningResource } from '../types';
import {
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Clock,
  Award,
  Sparkles,
  Video,
  FileCode,
  GraduationCap,
} from 'lucide-react';

interface LearningRoadmapProps {
  initialResources?: LearningResource[];
}

export const LearningRoadmap: React.FC<LearningRoadmapProps> = ({ initialResources }) => {
  const [resources, setResources] = useState<LearningResource[]>(
    initialResources && initialResources.length > 0
      ? initialResources
      : [
          {
            id: 'lr_1',
            topic: 'Transformer Multi-Head Attention Math',
            title: 'FlashAttention-2: Faster Attention with Better Parallelism & Work Partitioning',
            type: 'article',
            url: 'https://arxiv.org/abs/2307.08691',
            estimatedMinutes: 25,
            completed: true,
          },
          {
            id: 'lr_2',
            topic: 'PEFT Hyperparameters & LoRA',
            title: 'Mastering Low-Rank Adaptation (LoRA) & QLoRA Quantization',
            type: 'video',
            url: 'https://huggingface.co/blog/lora',
            estimatedMinutes: 20,
            completed: false,
          },
          {
            id: 'lr_3',
            topic: 'KV Cache & Distributed Memory',
            title: 'PagedAttention & vLLM Memory Management Deep-Dive',
            type: 'practice_problem',
            url: 'https://vllm.ai',
            estimatedMinutes: 45,
            completed: false,
          },
          {
            id: 'lr_4',
            topic: 'Vector DB Indexing',
            title: 'HNSW Graph Traversal & IVF-PQ Quantization Trade-Offs',
            type: 'course',
            url: 'https://pinecone.io/learn',
            estimatedMinutes: 30,
            completed: false,
          },
        ]
  );

  const toggleResource = (id: string) => {
    setResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
    );
  };

  const completedCount = resources.filter((r) => r.completed).length;
  const progressPercent = Math.round((completedCount / resources.length) * 100);

  const getTypeIcon = (type: LearningResource['type']) => {
    switch (type) {
      case 'article':
        return <BookOpen className="w-4 h-4 text-indigo-500" />;
      case 'video':
        return <Video className="w-4 h-4 text-rose-500" />;
      case 'practice_problem':
        return <FileCode className="w-4 h-4 text-emerald-500" />;
      case 'course':
        return <GraduationCap className="w-4 h-4 text-purple-500" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FAFAFA] border border-[#E5E7EB] text-[#111827] text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Bottleneck Guided Learning Plan</span>
            </div>
            <h1 className="text-xl font-bold text-[#111827]">Personalized Skill Growth Roadmap</h1>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Targeted reading material, paper summaries, and coding drills to resolve knowledge gaps identified in recent interviews.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] min-w-[200px]">
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-[#374151]">Roadmap Completion</span>
              <span className="text-[#111827]">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#E5E7EB] overflow-hidden">
              <div className="h-full bg-[#111827] rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
            </div>
            <p className="text-[10px] text-[#9CA3AF] mt-1">{completedCount} of {resources.length} topics mastered</p>
          </div>
        </div>
      </div>

      {/* Resource Cards */}
      <div className="space-y-4">
        {resources.map((res) => (
          <div
            key={res.id}
            className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              res.completed
                ? 'bg-[#FAFAFA] border-[#E5E7EB] opacity-80'
                : 'bg-[#FFFFFF] border-[#E5E7EB] shadow-xs'
            }`}
          >
            <div className="flex items-start space-x-4">
              <button
                onClick={() => toggleResource(res.id)}
                className={`p-1.5 rounded-lg border transition-all shrink-0 mt-0.5 cursor-pointer ${
                  res.completed
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'bg-[#FFFFFF] border-[#E5E7EB] text-transparent'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>

              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="p-1 rounded bg-[#FAFAFA] border border-[#E5E7EB]">{getTypeIcon(res.type)}</span>
                  <span className="text-xs font-bold text-[#111827]">{res.topic}</span>
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-[#FAFAFA] border border-[#E5E7EB] text-[#6B7280]">
                    {res.type.replace('_', ' ')}
                  </span>
                </div>

                <h3 className={`text-sm font-semibold ${res.completed ? 'line-through text-[#9CA3AF]' : 'text-[#111827]'}`}>
                  {res.title}
                </h3>

                <p className="text-xs text-[#6B7280] flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>Est. {res.estimatedMinutes} mins</span>
                </p>
              </div>
            </div>

            <a
              href={res.url}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl bg-[#FAFAFA] hover:bg-[#E5E7EB] border border-[#E5E7EB] text-[#111827] font-semibold text-xs transition-colors flex items-center space-x-1.5 self-end sm:self-center shrink-0 cursor-pointer"
            >
              <span>Study Module</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
