import React, { useState, useRef, useEffect } from 'react';
import {
  GraduationCap,
  BookOpen,
  Search,
  ExternalLink,
  Play,
  CheckCircle2,
  Clock,
  Send,
  X,
  Sparkles,
  Bot,
  Maximize2,
  Minimize2,
  Tv,
  ArrowLeft,
} from 'lucide-react';

interface CandidateLearningPortalProps {
  selectedSkillName?: string;
  onStartPractice: (topicName: string) => void;
}

interface YouTubeVideo {
  id: string;
  title: string;
  channel: string;
  duration: string;
  views: string;
  embedId: string;
  youtubeUrl: string;
  thumbnailUrl: string;
  summary: string[];
}

interface StudyTopic {
  id: string;
  title: string;
  category: 'System Design' | 'Data Structures & Algorithms' | 'AI & Machine Learning' | 'Web Architecture' | 'Behavioral';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedMinutes: number;
  completed: boolean;
  referenceUrl: string;
  youtubeQuery: string;
  description: string;
  conceptsToMaster: string[];
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  codeSnippet?: string;
  youtubeLinks?: { title: string; url: string }[];
}

const YouTubeIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

export const CandidateLearningPortal: React.FC<CandidateLearningPortalProps> = ({
  onStartPractice,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [ytAgentQuery, setYtAgentQuery] = useState('');
  const [activeVideoModal, setActiveVideoModal] = useState<YouTubeVideo | null>(null);

  // Floating AI Learning Assistant Bot
  const [isBotOpen, setIsBotOpen] = useState(false);
  const [isBotExpanded, setIsBotExpanded] = useState(false);
  const [botInput, setBotInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: "👋 Hi! I'm your SkillAura AI Learning Assistant. Ask me to explain system design concepts, algorithm complexity, code implementations, or find video tutorials!",
      timestamp: 'Just now',
      codeSnippet: `// Example: Quick binary search algorithm
function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
    },
  ]);

  const [topics, setTopics] = useState<StudyTopic[]>([
    {
      id: '1',
      title: 'Distributed Rate Limiting Algorithms (Token Bucket & Leaky Bucket)',
      category: 'System Design',
      difficulty: 'Hard',
      estimatedMinutes: 30,
      completed: true,
      referenceUrl: 'https://en.wikipedia.org/wiki/Token_bucket',
      youtubeQuery: 'Rate Limiter System Design ByteByteGo',
      description: 'Design a scalable rate-limiting tier using Redis sliding window counters and distributed token buckets.',
      conceptsToMaster: ['Redis Lua Scripts', 'Sliding Window Log', 'Concurrency & Race Conditions'],
    },
    {
      id: '2',
      title: 'Attention Mechanism & Transformer Architecture Deep Dive',
      category: 'AI & Machine Learning',
      difficulty: 'Hard',
      estimatedMinutes: 45,
      completed: false,
      referenceUrl: 'https://arxiv.org/abs/1706.03762',
      youtubeQuery: 'Attention is all you need 3Blue1Brown Transformers',
      description: 'Understand Query, Key, Value vectors, scaled dot-product attention, multi-head attention, and positional encodings.',
      conceptsToMaster: ['Q/K/V Matrices', 'Self-Attention Scaling', 'Softmax Masking'],
    },
    {
      id: '3',
      title: 'LRU Cache Design & Doubly Linked List + Hash Map Integration',
      category: 'Data Structures & Algorithms',
      difficulty: 'Medium',
      estimatedMinutes: 25,
      completed: true,
      referenceUrl: 'https://leetcode.com/problems/lru-cache/',
      youtubeQuery: 'LRU Cache NeetCode',
      description: 'Implement O(1) get and put operations using a doubly linked list combined with a hash map table.',
      conceptsToMaster: ['O(1) HashMap Lookup', 'Doubly Linked List Pointer Eviction', 'Thread Safety'],
    },
    {
      id: '4',
      title: 'Database Sharding, Partitioning & Consistent Hashing',
      category: 'System Design',
      difficulty: 'Hard',
      estimatedMinutes: 40,
      completed: false,
      referenceUrl: 'https://en.wikipedia.org/wiki/Consistent_hashing',
      youtubeQuery: 'Consistent Hashing System Design ByteByteGo',
      description: 'Avoid hotspots in distributed databases using virtual hash ring nodes, replication factors, and rebalancing keys.',
      conceptsToMaster: ['Virtual Nodes', 'MD5/MurmurHash Ring', 'Database Rebalancing'],
    },
    {
      id: '5',
      title: 'React 19 Server Components, Actions & Fiber Reconciliation',
      category: 'Web Architecture',
      difficulty: 'Medium',
      estimatedMinutes: 35,
      completed: false,
      referenceUrl: 'https://react.dev/blog/2024/02/15/react-19',
      youtubeQuery: 'React 19 Fireship Server Components',
      description: 'Master React Server Components (RSC), async actions, streaming SSR, and useActionState hooks.',
      conceptsToMaster: ['Server Actions', 'RSC Payload Streaming', 'Optimistic UI Updates'],
    },
  ]);

  const youtubeVideos: YouTubeVideo[] = [
    {
      id: 'yt-1',
      title: 'System Design Interview – Rate Limiting Algorithms (ByteByteGo)',
      channel: 'ByteByteGo',
      duration: '11:42',
      views: '840K views',
      embedId: 'FU4WlwfS3G0',
      youtubeUrl: 'https://www.youtube.com/watch?v=FU4WlwfS3G0',
      thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
      summary: [
        'Explains Token Bucket vs Leaky Bucket algorithms.',
        'Demonstrates Redis sliding window counter for API rate limits.',
        'Covers distributed race condition mitigation with Redis Lua scripts.',
      ],
    },
    {
      id: 'yt-2',
      title: 'Transformers, explained visually | Deep Learning Chapter 5',
      channel: '3Blue1Brown',
      duration: '27:10',
      views: '1.8M views',
      embedId: 'wjZofJX0v4E',
      youtubeUrl: 'https://www.youtube.com/watch?v=wjZofJX0v4E',
      thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      summary: [
        'Geometric intuition of high-dimensional attention embeddings.',
        'How dot product measures word vector context similarity.',
        'Multi-head attention projections breakdown step-by-step.',
      ],
    },
    {
      id: 'yt-3',
      title: 'LRU Cache - LeetCode 146 - Python / JavaScript',
      channel: 'NeetCode',
      duration: '18:15',
      views: '450K views',
      embedId: '7ABFKPK2hD4',
      youtubeUrl: 'https://www.youtube.com/watch?v=7ABFKPK2hD4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
      summary: [
        'Why Hash Map alone is insufficient for eviction order.',
        'Doubly linked list pointer mechanics for O(1) removal.',
        'Full coding implementation walk-through.',
      ],
    },
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isBotTyping]);

  const completedCount = topics.filter((t) => t.completed).length;
  const progressPercent = Math.round((completedCount / Math.max(1, topics.length)) * 100);

  const toggleTopicCompletion = (id: string) => {
    setTopics((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const filteredTopics = topics.filter((t) => {
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.conceptsToMaster.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const filteredYoutubeVideos = youtubeVideos.filter((v) => {
    if (!ytAgentQuery) return true;
    const q = ytAgentQuery.toLowerCase();
    return (
      v.title.toLowerCase().includes(q) ||
      v.channel.toLowerCase().includes(q) ||
      v.summary.some((s) => s.toLowerCase().includes(q))
    );
  });

  const handleSendBotMessage = (textToSend?: string) => {
    const input = textToSend || botInput;
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setBotInput('');
    setIsBotTyping(true);

    setTimeout(() => {
      let botText = `Here is what you need to know about "${input}":\n\nIt is a fundamental technical concept tested frequently in senior engineering interviews.`;
      let codeSnippet: string | undefined;
      let youtubeLinks: { title: string; url: string }[] | undefined;

      if (input.toLowerCase().includes('transformer') || input.toLowerCase().includes('attention')) {
        botText = 'Transformers use Self-Attention to calculate similarity scores between tokens using Query (Q), Key (K), and Value (V) matrices.';
        codeSnippet = `// Scaled Dot-Product Attention Formula
Attention(Q, K, V) = softmax( (Q * K^T) / sqrt(d_k) ) * V`;
        youtubeLinks = [
          { title: '3Blue1Brown - Transformers Explained Visually', url: 'https://www.youtube.com/watch?v=wjZofJX0v4E' },
        ];
      } else if (input.toLowerCase().includes('rate') || input.toLowerCase().includes('limit')) {
        botText = 'Rate limiters prevent system overload. The Token Bucket algorithm allows bursty traffic up to bucket capacity, while Leaky Bucket smoothens outbound traffic at a constant rate.';
        codeSnippet = `// Redis Sliding Window Lua Pseudocode
local current_time = redis.call('TIME')[1]
local clear_before = current_time - window_size
redis.call('ZREMRANGEBYSCORE', key, 0, clear_before)
local request_count = redis.call('ZCARD', key)`;
        youtubeLinks = [
          { title: 'ByteByteGo - Rate Limiting Algorithms', url: 'https://www.youtube.com/watch?v=FU4WlwfS3G0' },
        ];
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        codeSnippet,
        youtubeLinks,
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsBotTyping(false);
    }, 900);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20 relative min-h-screen">
      {/* HEADER BANNER PORTAL */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFFFF] dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2D3340] text-[#111827] dark:text-[#F9FAFB] shadow-xs space-y-6 relative transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340] text-[#111827] dark:text-[#F9FAFB] text-xs font-semibold">
              <GraduationCap className="w-3.5 h-3.5 text-amber-500" />
              <span>SkillAura Knowledge Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827] dark:text-white">
              Technical Knowledge & Reference Portal
            </h1>
            <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9CA3AF] leading-relaxed font-medium">
              Curated study materials, algorithm blueprints, system design architecture guides, and an AI-powered YouTube video reference search agent.
            </p>
          </div>

          {/* Progress Badge */}
          <div className="p-4 rounded-2xl bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340] shrink-0 min-w-[210px] space-y-2">
            <div className="flex justify-between items-center text-xs font-mono font-bold">
              <span className="text-[#6B7280] dark:text-[#9CA3AF]">Mastery Progress</span>
              <span className="text-orange-500 dark:text-orange-400">{progressPercent}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-[#E5E7EB] dark:bg-[#2D3340] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF] font-mono">
              {completedCount} of {topics.length} topics completed
            </p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="relative max-w-2xl relative z-10">
          <Search className="w-4 h-4 text-[#9CA3AF] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search study topics, concepts (e.g., Attention, DP, Rate Limiter)..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340] text-[#111827] dark:text-white placeholder-[#9CA3AF] text-xs focus:outline-none focus:ring-1 focus:ring-[#111827] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white text-xs font-mono"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* CATEGORY SELECTOR FILTERS */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none text-xs font-bold">
        {['All', 'System Design', 'Data Structures & Algorithms', 'AI & Machine Learning', 'Web Architecture', 'Behavioral'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2.5 rounded-xl border transition-all shrink-0 flex items-center space-x-1.5 ${
              selectedCategory === cat
                ? 'bg-[#111827] dark:bg-amber-500 text-white border-[#111827] dark:border-amber-400 shadow-md'
                : 'bg-[#FFFFFF] dark:bg-[#171A21] text-[#6B7280] dark:text-[#9CA3AF] border-[#E5E7EB] dark:border-[#2D3340] hover:text-[#111827] dark:hover:text-white'
            }`}
          >
            <span>{cat}</span>
          </button>
        ))}
      </div>

      {/* YOUTUBE REFERENCE SEARCH AGENT SECTION */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFFFF] dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2D3340] shadow-xs space-y-6 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] dark:border-[#2D3340] pb-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340] flex items-center justify-center text-red-600 shrink-0">
              <YouTubeIcon className="w-6 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-extrabold text-[#111827] dark:text-white">YouTube Reference & Video Agent</h2>
                <span className="px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 text-[10px] font-mono font-bold uppercase">
                  AI Agent
                </span>
              </div>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                Search or filter expert video explanations, visual algorithm breakdowns, and system design masterclasses.
              </p>
            </div>
          </div>

          {/* Search box for YouTube Agent */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={ytAgentQuery}
              onChange={(e) => setYtAgentQuery(e.target.value)}
              placeholder="Search YouTube tutorials..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340] text-[#111827] dark:text-white placeholder-[#9CA3AF] text-xs focus:outline-none focus:ring-1 focus:ring-[#111827]"
            />
          </div>
        </div>

        {/* Quick Youtube Agent Prompt Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[#6B7280] dark:text-[#9CA3AF] font-mono text-[11px] flex items-center space-x-1 mr-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Agent Topics:</span>
          </span>
          {[
            'System Design ByteByteGo',
            '3Blue1Brown Transformers',
            'NeetCode Dynamic Programming',
            'Andrej Karpathy LLM',
            'React 19 Fireship',
          ].map((pill) => (
            <button
              key={pill}
              onClick={() => setYtAgentQuery(pill === ytAgentQuery ? '' : pill)}
              className={`px-3 py-1 rounded-lg border transition-all text-[11px] font-mono cursor-pointer ${
                ytAgentQuery === pill
                  ? 'bg-red-600 text-white border-red-500'
                  : 'bg-[#FAFAFA] dark:bg-[#1F232D] text-[#6B7280] dark:text-[#9CA3AF] border-[#E5E7EB] dark:border-[#2D3340] hover:text-[#111827] dark:hover:text-white'
              }`}
            >
              {pill}
            </button>
          ))}
        </div>

        {/* YouTube Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredYoutubeVideos.map((video) => (
            <div
              key={video.id}
              className="rounded-2xl bg-[#FFFFFF] dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2D3340] overflow-hidden hover:border-red-500/50 transition-all group flex flex-col justify-between shadow-xs"
            >
              <div>
                {/* Thumbnail Header */}
                <div className="relative aspect-video bg-[#FAFAFA] dark:bg-[#1F232D] overflow-hidden cursor-pointer" onClick={() => setActiveVideoModal(video)}>
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  {/* Play Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                    <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl scale-90 group-hover:scale-100 transition-transform">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Duration Badge */}
                  <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/80 text-white text-[10px] font-mono font-bold">
                    {video.duration}
                  </span>

                  {/* Channel Tag */}
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/80 text-amber-400 text-[10px] font-mono font-bold flex items-center space-x-1">
                    <Tv className="w-3 h-3 text-red-500" />
                    <span>{video.channel}</span>
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <h3
                    onClick={() => setActiveVideoModal(video)}
                    className="text-xs sm:text-sm font-extrabold text-[#111827] dark:text-white group-hover:text-amber-500 transition-colors line-clamp-2 cursor-pointer leading-snug"
                  >
                    {video.title}
                  </h3>

                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-mono font-bold text-[#6B7280] dark:text-[#9CA3AF] uppercase block">Key Agent Takeaways</span>
                    <ul className="space-y-1 text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">
                      {video.summary.slice(0, 3).map((item, idx) => (
                        <li key={idx} className="flex items-start space-x-1.5">
                          <span className="text-orange-500 shrink-0 font-bold">•</span>
                          <span className="line-clamp-1">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-4 pt-0 flex items-center justify-between border-t border-[#E5E7EB] dark:border-[#2D3340] mt-2 pt-3">
                <span className="text-[10px] font-mono text-[#6B7280] dark:text-[#9CA3AF]">{video.views}</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setActiveVideoModal(video)}
                    className="px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-600/20 hover:bg-red-600 text-red-600 dark:text-red-400 hover:text-white border border-red-200 dark:border-red-500/30 text-[11px] font-bold transition-all flex items-center space-x-1 cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Watch</span>
                  </button>
                  <a
                    href={video.youtubeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-xl bg-[#FAFAFA] dark:bg-[#1F232D] text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white border border-[#E5E7EB] dark:border-[#2D3340] transition-colors"
                    title="Open on YouTube"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* STUDY TOPICS LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#111827] dark:text-white flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-orange-500" />
            <span>Curated Study Modules ({filteredTopics.length})</span>
          </h2>
        </div>

        {filteredTopics.map((topic) => (
          <div
            key={topic.id}
            className={`p-5 sm:p-6 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              topic.completed
                ? 'bg-[#FAFAFA] dark:bg-[#171A21]/60 border-[#E5E7EB] dark:border-[#2D3340]/60 opacity-85'
                : 'bg-[#FFFFFF] dark:bg-[#171A21] border-[#E5E7EB] dark:border-[#2D3340] shadow-xs'
            }`}
          >
            <div className="flex items-start space-x-4">
              <button
                onClick={() => toggleTopicCompletion(topic.id)}
                className={`p-2 rounded-xl border transition-all shrink-0 mt-0.5 cursor-pointer ${
                  topic.completed
                    ? 'bg-emerald-500 border-emerald-400 text-white shadow-md'
                    : 'bg-[#FAFAFA] dark:bg-[#1F232D] border-[#E5E7EB] dark:border-[#2D3340] text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827]'
                }`}
                title={topic.completed ? 'Mark incomplete' : 'Mark completed'}
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              </button>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340] text-amber-600 dark:text-amber-400 font-mono text-[10px] font-bold">
                    {topic.category}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                      topic.difficulty === 'Hard'
                        ? 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                        : topic.difficulty === 'Medium'
                        ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                        : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                    }`}
                  >
                    {topic.difficulty}
                  </span>
                  <span className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF] font-mono flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-[#9CA3AF]" />
                    <span>Est. {topic.estimatedMinutes} mins</span>
                  </span>
                </div>

                <h3 className={`text-base font-extrabold ${topic.completed ? 'line-through text-[#6B7280] dark:text-[#9CA3AF]' : 'text-[#111827] dark:text-white'}`}>
                  {topic.title}
                </h3>

                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] max-w-3xl leading-relaxed">
                  {topic.description}
                </p>

                {/* Concepts Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {topic.conceptsToMaster.map((concept, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340] text-[#111827] dark:text-[#F9FAFB] text-[10px] font-mono"
                    >
                      #{concept}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap md:flex-col items-end gap-2 shrink-0 border-t md:border-t-0 border-[#E5E7EB] dark:border-[#2D3340] pt-3 md:pt-0">
              <a
                href={topic.referenceUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#1F232D] hover:bg-[#E5E7EB] dark:hover:bg-[#2D3340] text-[#111827] dark:text-white font-bold text-xs border border-[#E5E7EB] dark:border-[#2D3340] flex items-center space-x-1.5 transition-colors"
              >
                <span>Read Reference</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#6B7280] dark:text-[#9CA3AF]" />
              </a>

              <button
                onClick={() => setYtAgentQuery(topic.youtubeQuery)}
                className="px-4 py-2 rounded-xl bg-red-50 dark:bg-red-600/20 hover:bg-red-600 text-red-600 dark:text-red-400 hover:text-white border border-red-200 dark:border-red-500/30 font-bold text-xs flex items-center space-x-1.5 transition-all group cursor-pointer"
              >
                <YouTubeIcon className="w-4 h-3 group-hover:scale-105 transition-transform" />
                <span>Find Videos</span>
              </button>

              <button
                onClick={() => onStartPractice(topic.title)}
                className="px-4 py-2 rounded-xl bg-[#111827] dark:bg-indigo-600 hover:bg-[#1f2937] dark:hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Practice Topic</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* VIDEO PLAYER MODAL */}
      {activeVideoModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveVideoModal(null);
          }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl bg-[#FFFFFF] dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2D3340] rounded-3xl overflow-hidden shadow-2xl space-y-4 p-4 sm:p-6 animate-scale-up cursor-default my-auto text-[#111827] dark:text-[#F9FAFB]"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-[#2D3340] pb-3 gap-3">
              <button
                onClick={() => setActiveVideoModal(null)}
                className="px-3.5 py-2 rounded-xl bg-[#111827] dark:bg-indigo-600 text-white font-bold text-xs shadow-xs hover:bg-[#1f2937] dark:hover:bg-indigo-500 transition-all flex items-center space-x-2 shrink-0 cursor-pointer"
                title="Return to Learning Portal"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                <span>Back to Learning Portal</span>
              </button>

              <div className="flex items-center space-x-2 min-w-0 flex-1 justify-center sm:justify-start">
                <YouTubeIcon className="w-6 h-4 text-red-600 shrink-0" />
                <h3 className="text-xs sm:text-sm font-extrabold text-[#111827] dark:text-white truncate">{activeVideoModal.title}</h3>
              </div>

              <button
                onClick={() => setActiveVideoModal(null)}
                className="px-3 py-1.5 rounded-xl bg-[#FAFAFA] dark:bg-[#1F232D] text-[#111827] dark:text-white transition-colors flex items-center space-x-1.5 text-xs font-bold shrink-0 cursor-pointer"
                title="Close Player"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Close</span>
              </button>
            </div>

            {/* Embed Video */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-[#E5E7EB] dark:border-[#2D3340] shadow-inner">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideoModal.embedId}?autoplay=1`}
                title={activeVideoModal.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Video Summary */}
            <div className="p-4 rounded-2xl bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340] space-y-3">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-[#2D3340] pb-2">
                <span className="text-xs font-mono font-bold text-orange-500 uppercase block">Key Reference Takeaways</span>
                <span className="text-[10px] font-mono text-[#6B7280] dark:text-[#9CA3AF]">{activeVideoModal.channel} • {activeVideoModal.duration}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#111827] dark:text-[#F9FAFB] font-medium">
                {activeVideoModal.summary.map((point, idx) => (
                  <div key={idx} className="flex items-start space-x-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{point}</span>
                  </div>
                ))}
              </div>

              {/* Bottom Return Button */}
              <div className="pt-2 flex justify-end border-t border-[#E5E7EB] dark:border-[#2D3340]">
                <button
                  onClick={() => setActiveVideoModal(null)}
                  className="px-4 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#1F232D] hover:bg-[#E5E7EB] dark:hover:bg-[#2D3340] text-[#111827] dark:text-white font-bold text-xs border border-[#E5E7EB] dark:border-[#2D3340] flex items-center space-x-2 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Done Watching • Return to Portal</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING AI TUTOR CHAT WINDOW */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {isBotOpen && (
          <div
            className={`mb-4 bg-[#FFFFFF] dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2D3340] rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 animate-scale-up ${
              isBotExpanded
                ? 'w-[90vw] max-w-3xl h-[80vh]'
                : 'w-[calc(100vw-2rem)] sm:w-[400px] h-[520px]'
            }`}
          >
            {/* Header */}
            <div className="p-4 bg-[#FAFAFA] dark:bg-[#1F232D] border-b border-[#E5E7EB] dark:border-[#2D3340] flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-2xl bg-[#111827] dark:bg-indigo-600 flex items-center justify-center text-white shadow-md">
                    <Bot className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#FFFFFF] dark:border-[#171A21]" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#111827] dark:text-white flex items-center space-x-1.5">
                    <span>SkillAura AI Tutor</span>
                    <span className="px-1.5 py-0.5 rounded bg-orange-50 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 text-[9px] font-mono font-bold">
                      24/7 AI
                    </span>
                  </h3>
                  <p className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF] font-mono">Ask anything • Algorithms • Design • Code</p>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setIsBotExpanded(!isBotExpanded)}
                  className="p-1.5 rounded-xl hover:bg-[#E5E7EB] dark:hover:bg-[#2D3340] text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white transition-colors"
                  title={isBotExpanded ? 'Minimize' : 'Expand'}
                >
                  {isBotExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsBotOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-[#E5E7EB] dark:hover:bg-[#2D3340] text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white transition-colors"
                  title="Close Bot"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Suggestions */}
            <div className="p-2.5 bg-[#FAFAFA] dark:bg-[#1F232D] border-b border-[#E5E7EB] dark:border-[#2D3340] overflow-x-auto flex items-center space-x-2 text-[11px] font-mono shrink-0 scrollbar-none">
              <span className="text-[#6B7280] dark:text-[#9CA3AF] shrink-0 font-bold">Suggestions:</span>
              {[
                'Explain Transformers',
                'System Design Rate Limiter',
                'Top 5 DP Patterns',
                'STAR Method Examples',
              ].map((pill, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendBotMessage(pill)}
                  className="px-2.5 py-1 rounded-lg bg-[#FFFFFF] dark:bg-[#171A21] text-[#111827] dark:text-white border border-[#E5E7EB] dark:border-[#2D3340] whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                >
                  {pill}
                </button>
              ))}
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs font-sans">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <div className="flex items-center space-x-1 px-1">
                    <span className="text-[10px] font-mono text-[#6B7280] dark:text-[#9CA3AF]">
                      {msg.sender === 'user' ? 'You' : 'SkillAura Tutor'}
                    </span>
                    <span className="text-[9px] font-mono text-[#9CA3AF]">• {msg.timestamp}</span>
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl max-w-[88%] space-y-2 leading-relaxed shadow-xs ${
                      msg.sender === 'user'
                        ? 'bg-[#111827] dark:bg-indigo-600 text-white font-medium rounded-tr-none'
                        : 'bg-[#FAFAFA] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2D3340] text-[#111827] dark:text-[#F9FAFB] rounded-tl-none'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>

                    {msg.codeSnippet && (
                      <div className="mt-2 rounded-xl bg-[#0F1115] p-3 border border-[#2D3340] font-mono text-[11px] text-amber-300 overflow-x-auto">
                        <pre>{msg.codeSnippet}</pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isBotTyping && (
                <div className="flex items-center space-x-2 text-[#6B7280] dark:text-[#9CA3AF] text-xs font-mono p-2 bg-[#FAFAFA] dark:bg-[#1F232D] rounded-xl max-w-[150px] border border-[#E5E7EB] dark:border-[#2D3340]">
                  <Sparkles className="w-3.5 h-3.5 text-orange-500 animate-spin" />
                  <span>AI Thinking...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-[#FAFAFA] dark:bg-[#1F232D] border-t border-[#E5E7EB] dark:border-[#2D3340] shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendBotMessage();
                }}
                className="flex items-center space-x-2"
              >
                <input
                  type="text"
                  value={botInput}
                  onChange={(e) => setBotInput(e.target.value)}
                  placeholder="Ask any technical concept or search videos..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#FFFFFF] dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2D3340] text-[#111827] dark:text-white placeholder-[#9CA3AF] text-xs focus:outline-none focus:ring-1 focus:ring-[#111827]"
                />
                <button
                  type="submit"
                  disabled={!botInput.trim() || isBotTyping}
                  className="p-2.5 rounded-xl bg-[#111827] dark:bg-indigo-600 hover:bg-[#1f2937] dark:hover:bg-indigo-500 disabled:opacity-50 text-white font-bold shadow-xs shrink-0 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Floating Action Button */}
        <button
          onClick={() => setIsBotOpen(!isBotOpen)}
          className="relative group p-3.5 rounded-full bg-[#111827] dark:bg-indigo-600 text-white shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center space-x-2 cursor-pointer"
          aria-label="Open AI Learning Bot"
          title="Open AI Learning Tutor"
        >
          <div className="relative flex items-center space-x-2">
            {isBotOpen ? (
              <X className="w-6 h-6 stroke-[2.5]" />
            ) : (
              <>
                <Bot className="w-6 h-6 stroke-[2.2]" />
                <span className="hidden sm:inline text-xs font-black uppercase font-mono tracking-wider pr-1">
                  Ask AI
                </span>
              </>
            )}
          </div>
        </button>
      </div>
    </div>
  );
};
