import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Question,
  QuestionEvaluation,
  DifficultyLevel,
  IntegritySignal,
  CodeSubmissionData,
} from '../../types';
import {
  LiveInterviewRecorderManager,
  playQuestionAudioTTS,
  stopQuestionAudioTTS,
} from '../../services/liveInterviewService';
import { evaluateCompleteInterviewSession } from '../../services/aiPipelineService';
import { CodeEditorWindow } from './CodeEditorWindow';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Pause,
  Play,
  Volume2,
  VolumeX,
  Send,
  Clock,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Radio,
  Layers,
  AlertCircle,
  ShieldCheck,
  Copy,
  Check,
  Keyboard,
  Power,
  Code2,
  FileText,
} from 'lucide-react';

interface LiveInterviewRoomProps {
  currentUser: User;
  jobTitle: string;
  initialQuestions: Question[];
  initialDifficulty: DifficultyLevel;
  mediaStream: MediaStream;
  onFinishSession: (
    evaluations: QuestionEvaluation[],
    recordingData: any,
    integritySignals: IntegritySignal[],
    totalDurationSeconds: number,
    sessionScores?: any
  ) => void;
}

export const LiveInterviewRoom: React.FC<LiveInterviewRoomProps> = ({
  currentUser,
  jobTitle,
  initialQuestions,
  initialDifficulty,
  mediaStream,
  onFinishSession,
}) => {
  // Session State
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [currentDifficulty, setCurrentDifficulty] = useState<DifficultyLevel>(initialDifficulty);

  // Stored Session Answers (Assessment Mode - No Live Feedback)
  const [storedAnswers, setStoredAnswers] = useState<
    Record<
      string,
      {
        answerText: string;
        codeSubmission?: CodeSubmissionData;
        fillerCount?: number;
        wpm?: number;
      }
    >
  >({});

  // Active Code Submission for Current Question
  const [currentCodeSubmission, setCurrentCodeSubmission] = useState<CodeSubmissionData | null>(null);
  const [showCodeEditor, setShowCodeEditor] = useState<boolean>(false);

  // Time & Timers
  const [totalTimeRemaining, setTotalTimeRemaining] = useState<number>(1800); // 30 mins
  const [questionTimeRemaining, setQuestionTimeRemaining] = useState<number>(180); // 3 mins per question
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Controls State
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isCameraOff, setIsCameraOff] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showEndModal, setShowEndModal] = useState<boolean>(false);
  const [showFinalSubmitModal, setShowFinalSubmitModal] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // Voice Interview Assistant State
  const [isVoiceAssistantEnabled, setIsVoiceAssistantEnabled] = useState<boolean>(true);
  const [isAiVoiceMuted, setIsAiVoiceMuted] = useState<boolean>(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState<boolean>(false);
  const [voiceRecordingState, setVoiceRecordingState] = useState<'idle' | 'listening' | 'paused' | 'processing' | 'error'>('idle');
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Speech-To-Text & Answer Editing Fallback
  const [transcript, setTranscript] = useState<string>('');
  const [isTypeAnswerMode, setIsTypeAnswerMode] = useState<boolean>(false);
  const [typedAnswerText, setTypedAnswerText] = useState<string>('');
  const [fillerWordCount, setFillerWordCount] = useState<number>(0);
  const [copiedText, setCopiedText] = useState<boolean>(false);

  // Integrity Log
  const [integritySignals, setIntegritySignals] = useState<IntegritySignal[]>([]);

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const recorderManagerRef = useRef<LiveInterviewRecorderManager | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const isEndingInterviewRef = useRef<boolean>(false);

  const currentQuestion = questions[currentQuestionIndex] || initialQuestions[0];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  // Sync Code Editor visibility with Question Type
  useEffect(() => {
    if (currentQuestion?.isCodingQuestion) {
      setShowCodeEditor(true);
    } else {
      setShowCodeEditor(false);
    }
    setCurrentCodeSubmission(null);
  }, [currentQuestionIndex]);

  // Helper to Speak Current AI Question
  const speakQuestion = (questionText: string) => {
    if (!isVoiceAssistantEnabled || isAiVoiceMuted) {
      setIsAiSpeaking(false);
      return;
    }
    setIsAiSpeaking(true);
    playQuestionAudioTTS(
      questionText,
      () => setIsAiSpeaking(false),
      () => setIsAiSpeaking(true),
      () => setIsAiSpeaking(false)
    );
  };

  // Sync Video Element & Track Enable States
  useEffect(() => {
    if (mediaStream) {
      mediaStream.getVideoTracks().forEach((vt) => {
        vt.enabled = !isCameraOff;
      });
      mediaStream.getAudioTracks().forEach((at) => {
        at.enabled = !isMicMuted;
      });
    }

    if (videoRef.current && mediaStream && !isCameraOff) {
      if (videoRef.current.srcObject !== mediaStream) {
        videoRef.current.srcObject = mediaStream;
      }
      videoRef.current.play().catch((err) => {
        console.warn('Live room camera play warning:', err);
      });
    }
  }, [mediaStream, isCameraOff, isMicMuted]);

  // Init Video Recorder Manager & Audio Stream
  useEffect(() => {
    if (mediaStream && !recorderManagerRef.current) {
      const manager = new LiveInterviewRecorderManager((signal) => {
        setIntegritySignals((prev) => [...prev, signal]);
      });
      manager.startRecording(mediaStream);
      recorderManagerRef.current = manager;

      if (currentQuestion) {
        manager.markQuestionStart(
          currentQuestion.id,
          0,
          currentQuestion.topic,
          currentQuestion.questionText
        );
      }
    }

    // Auto Read First Question Aloud via Voice Assistant
    if (currentQuestion && isVoiceAssistantEnabled) {
      speakQuestion(currentQuestion.questionText);
    }

    return () => {
      stopQuestionAudioTTS();
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  // Timers
  useEffect(() => {
    if (isPaused || isSubmitting) return;

    const interval = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
      setTotalTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
      setQuestionTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, isSubmitting]);

  // Auto finish when total time expires
  useEffect(() => {
    if (totalTimeRemaining <= 0 && !isEndingInterviewRef.current) {
      handleFinalSubmissionConfirmed();
    }
  }, [totalTimeRemaining]);

  // Web Speech API (STT) setup
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let currentText = '';
          for (let i = 0; i < event.results.length; i++) {
            currentText += event.results[i][0].transcript;
          }
          setTranscript(currentText);
          setTypedAnswerText(currentText);

          const fillers = (currentText.match(/\b(um|uh|like|you know|so|actually)\b/gi) || []).length;
          setFillerWordCount(fillers);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition warning:', event.error);
          if (event.error === 'not-allowed') {
            setSpeechError('Microphone permission denied for Speech Recognition. You can use Type Answer mode.');
            setVoiceRecordingState('error');
          }
        };

        recognition.onend = () => {
          if (voiceRecordingState === 'listening' && !isPaused && !isSubmitting) {
            try {
              recognition.start();
            } catch (e) {}
          }
        };

        speechRecognitionRef.current = recognition;
      } catch (err) {
        setSpeechError('Speech Recognition is not available on this browser. Use Type Answer mode below.');
      }
    } else {
      setSpeechError('Browser does not support native Web Speech API. Use Type Answer mode below.');
    }

    return () => {
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleMic = () => {
    const nextMutedState = !isMicMuted;
    mediaStream.getAudioTracks().forEach((t) => (t.enabled = !nextMutedState));
    setIsMicMuted(nextMutedState);
  };

  const toggleCamera = () => {
    const nextCameraState = !isCameraOff;
    mediaStream.getVideoTracks().forEach((t) => (t.enabled = !nextCameraState));
    setIsCameraOff(nextCameraState);
  };

  const toggleAiVoiceMute = () => {
    const nextState = !isAiVoiceMuted;
    setIsAiVoiceMuted(nextState);
    if (nextState) {
      stopQuestionAudioTTS();
      setIsAiSpeaking(false);
    } else if (currentQuestion) {
      speakQuestion(currentQuestion.questionText);
    }
  };

  const toggleVoiceAssistant = () => {
    const nextState = !isVoiceAssistantEnabled;
    setIsVoiceAssistantEnabled(nextState);
    if (!nextState) {
      stopQuestionAudioTTS();
      setIsAiSpeaking(false);
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (e) {}
      }
      setVoiceRecordingState('idle');
    } else if (currentQuestion) {
      speakQuestion(currentQuestion.questionText);
    }
  };

  const replayQuestionTTS = () => {
    if (currentQuestion) {
      speakQuestion(currentQuestion.questionText);
    }
  };

  const handleStartVoiceRecording = () => {
    setSpeechError(null);
    stopQuestionAudioTTS();
    setIsAiSpeaking(false);

    if (isMicMuted) {
      toggleMic();
    }

    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.start();
      } catch (e) {}
    }
    setVoiceRecordingState('listening');
  };

  const handleStopVoiceRecording = () => {
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {}
    }
    setVoiceRecordingState('idle');
  };

  const handlePauseVoiceRecording = () => {
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {}
    }
    setVoiceRecordingState('paused');
  };

  const handleCopyTranscript = () => {
    const textToCopy = isTypeAnswerMode ? typedAnswerText : transcript;
    navigator.clipboard.writeText(textToCopy);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Next Question / Answer Action (Assessment Mode)
  const handleSaveAndNext = () => {
    stopQuestionAudioTTS();
    setIsAiSpeaking(false);

    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {}
    }

    const answerText = (isTypeAnswerMode ? typedAnswerText : transcript).trim();

    if (recorderManagerRef.current) {
      recorderManagerRef.current.markQuestionEnd(answerText || 'Answer saved internally.');
    }

    // Save answer internally without showing scores
    const updatedAnswers = {
      ...storedAnswers,
      [currentQuestion.id]: {
        answerText: answerText || (currentCodeSubmission ? `Code submitted in ${currentCodeSubmission.language}` : 'Response submitted'),
        codeSubmission: currentCodeSubmission || undefined,
        fillerCount: fillerWordCount,
        wpm: 140,
      },
    };
    setStoredAnswers(updatedAnswers);

    if (isLastQuestion) {
      // Prompt final submission
      setShowFinalSubmitModal(true);
    } else {
      // Advance to next question
      const nextIdx = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIdx);
      setTranscript('');
      setTypedAnswerText('');
      setFillerWordCount(0);
      setQuestionTimeRemaining(180);
      setVoiceRecordingState('idle');
      setCurrentCodeSubmission(null);

      const nextQuestion = questions[nextIdx];
      if (nextQuestion && recorderManagerRef.current) {
        recorderManagerRef.current.markQuestionStart(
          nextQuestion.id,
          nextIdx,
          nextQuestion.topic,
          nextQuestion.questionText
        );
        speakQuestion(nextQuestion.questionText);
      }
    }
  };

  // Final Submission Handler
  const handleFinalSubmissionConfirmed = async () => {
    if (isEndingInterviewRef.current) return;
    isEndingInterviewRef.current = true;

    setIsSubmitting(true);
    stopQuestionAudioTTS();
    setIsAiSpeaking(false);

    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {}
    }

    // Capture last answer if present
    const answerText = (isTypeAnswerMode ? typedAnswerText : transcript).trim();
    const finalStoredAnswers = {
      ...storedAnswers,
      [currentQuestion.id]: {
        answerText: answerText || (currentCodeSubmission ? `Code submitted in ${currentCodeSubmission.language}` : 'Response submitted'),
        codeSubmission: currentCodeSubmission || undefined,
        fillerCount: fillerWordCount,
        wpm: 140,
      },
    };

    let recData = null;
    if (recorderManagerRef.current) {
      try {
        recData = await recorderManagerRef.current.stopRecording();
      } catch (err) {
        console.warn('Error stopping MediaRecorder:', err);
      }
    }

    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {}
      });
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    // Run batch evaluation engine
    const sessionResults = await evaluateCompleteInterviewSession(
      questions,
      finalStoredAnswers,
      jobTitle,
      currentDifficulty
    );

    const totalSecs = recordingSeconds;
    const finalSignals = recorderManagerRef.current?.getIntegritySignals() || integritySignals;

    onFinishSession(
      sessionResults.evaluations,
      recData,
      finalSignals,
      totalSecs,
      sessionResults
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#020617] text-slate-100 flex flex-col justify-between overflow-hidden font-sans">
      {/* 1. TOP HEADER BAR */}
      <header className="h-16 px-6 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between z-10">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-tight text-white flex items-center space-x-2">
                <span>AI Voice & Coding Interview</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                  {jobTitle}
                </span>
              </h1>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-2 pl-4 border-l border-slate-800 text-xs">
            <span className="text-slate-400">Question:</span>
            <span className="font-bold font-mono text-indigo-400">
              {currentQuestionIndex + 1} / {questions.length}
            </span>
          </div>
        </div>

        {/* Center Timer & Voice Status Indicator */}
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleVoiceAssistant}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 border ${
              isVoiceAssistantEnabled
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            <Power className={`w-3.5 h-3.5 ${isVoiceAssistantEnabled ? 'text-indigo-400' : 'text-slate-500'}`} />
            <span className="hidden sm:inline">Voice Assistant: {isVoiceAssistantEnabled ? 'ON' : 'OFF'}</span>
          </button>

          <div className="px-3 py-1.5 rounded-full bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs font-mono font-bold flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span>REC {formatTime(recordingSeconds)}</span>
          </div>

          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400">Time Left:</span>
            <span className="font-bold text-white">{formatTime(totalTimeRemaining)}</span>
          </div>
        </div>

        {/* Right Action: Sidebar Toggle & End Interview */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 text-xs font-semibold flex items-center space-x-1"
          >
            <Layers className="w-4 h-4 text-indigo-400" />
            <span className="hidden lg:inline">{isSidebarOpen ? 'Hide Panel' : 'Show Panel'}</span>
          </button>

          <button
            onClick={() => setShowEndModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all"
          >
            End Early
          </button>
        </div>
      </header>

      {/* 2. MAIN CENTER CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-5 flex flex-col justify-between">
          
          {/* Question Header Banner */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3 relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded-lg bg-indigo-950 text-indigo-300 font-bold border border-indigo-800/80">
                  Topic: {currentQuestion?.topic}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-mono font-semibold uppercase border border-slate-700">
                  Category: {currentQuestion?.category}
                </span>
              </div>

              <div className="flex items-center space-x-2 text-slate-400 font-mono">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Question Timer: {formatTime(questionTimeRemaining)}</span>
              </div>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
              {currentQuestion?.questionText}
            </h2>

            {/* AI Voice Action Controls */}
            <div className="pt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 text-xs">
              <div className="flex items-center space-x-2">
                <button
                  onClick={replayQuestionTTS}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-semibold transition-all flex items-center space-x-2"
                >
                  <Volume2 className="w-4 h-4 text-indigo-400" />
                  <span>Replay Question</span>
                </button>

                <button
                  onClick={toggleAiVoiceMute}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center space-x-2 ${
                    isAiVoiceMuted
                      ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {isAiVoiceMuted ? <VolumeX className="w-4 h-4 text-amber-400" /> : <Volume2 className="w-4 h-4 text-indigo-400" />}
                  <span>{isAiVoiceMuted ? 'AI Voice Muted' : 'Mute AI Voice'}</span>
                </button>

                <button
                  onClick={() => setShowCodeEditor(!showCodeEditor)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                    showCodeEditor
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                      : 'bg-slate-900 text-slate-300 border-slate-800'
                  }`}
                >
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  <span>{showCodeEditor ? 'Hide Code Editor' : 'Open Code Editor'}</span>
                </button>
              </div>

              <div className="flex items-center space-x-2 font-mono text-[11px] text-slate-400">
                {isAiSpeaking ? (
                  <span className="inline-flex items-center space-x-1.5 text-indigo-400 font-bold animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    <span>AI Interviewer Speaking...</span>
                  </span>
                ) : (
                  <span className="text-slate-500">AI Voice Ready</span>
                )}
              </div>
            </div>
          </div>

          {/* Code Editor Window (if enabled / coding question) */}
          {showCodeEditor && (
            <div className="animate-fade-in">
              <CodeEditorWindow
                problemTitle={currentQuestion?.topic || 'Coding Challenge'}
                problemDescription={currentQuestion?.problemDescription || currentQuestion?.questionText}
                testCases={currentQuestion?.testCases}
                onCodeSubmitted={(sub) => setCurrentCodeSubmission(sub)}
              />
            </div>
          )}

          {/* Camera Feed & Live Voice Transcript Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 flex-1 min-h-[220px]">
            {/* Camera Feed */}
            <div className="md:col-span-5 relative rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center shadow-2xl min-h-[200px]">
              {!isCameraOff ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              ) : (
                <div className="flex flex-col items-center justify-center space-y-2 text-slate-500">
                  <VideoOff className="w-10 h-10" />
                  <p className="text-xs font-semibold">Video Stream Muted</p>
                </div>
              )}

              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700 text-white text-[11px] font-semibold flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Camera Stream Active</span>
              </div>

              <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700 text-white text-[11px] font-mono flex items-center space-x-1.5">
                {isMicMuted ? (
                  <>
                    <MicOff className="w-3.5 h-3.5 text-rose-400" />
                    <span className="text-rose-400 font-semibold">Mic: Muted</span>
                  </>
                ) : voiceRecordingState === 'listening' ? (
                  <>
                    <Mic className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    <span className="text-emerald-400 font-semibold">Mic: Listening</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Mic: Active</span>
                  </>
                )}
              </div>
            </div>

            {/* Live Candidate Transcript & Text Editor Panel */}
            <div className="md:col-span-7 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                    <Mic className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Verbal Response Transcript</span>
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setIsTypeAnswerMode(!isTypeAnswerMode)}
                      className="text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-750 text-indigo-300 font-semibold border border-slate-700 flex items-center space-x-1"
                    >
                      <Keyboard className="w-3 h-3" />
                      <span>{isTypeAnswerMode ? 'Use Speech' : 'Type Answer'}</span>
                    </button>

                    <button
                      onClick={handleCopyTranscript}
                      className="p-1 rounded text-slate-400 hover:text-white"
                      title="Copy Transcript"
                    >
                      {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {!isTypeAnswerMode ? (
                  <div className="min-h-[110px] max-h-[150px] overflow-y-auto text-xs text-slate-200 leading-relaxed font-sans space-y-2 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                    {transcript ? (
                      <p>{transcript}</p>
                    ) : (
                      <p className="text-slate-500 italic">
                        Click "Start Voice Answer" below to speak... Your response will be transcribed live.
                      </p>
                    )}
                  </div>
                ) : (
                  <textarea
                    value={typedAnswerText}
                    onChange={(e) => {
                      setTypedAnswerText(e.target.value);
                      setTranscript(e.target.value);
                    }}
                    rows={4}
                    placeholder="Type or refine your response here..."
                    className="w-full text-xs p-3 rounded-xl bg-slate-950 border border-indigo-500/50 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans leading-relaxed"
                  />
                )}
              </div>

              {speechError && (
                <div className="p-2 rounded-xl bg-rose-950/60 border border-rose-800/80 text-[11px] text-rose-300 flex items-center justify-between">
                  <span>{speechError}</span>
                  <button
                    onClick={() => {
                      setSpeechError(null);
                      setIsTypeAnswerMode(true);
                    }}
                    className="px-2 py-0.5 rounded bg-rose-800 text-white font-bold"
                  >
                    Type Answer
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* VOICE CONTROLS & NAVIGATION BAR */}
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-2xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-4">
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMic}
                  className={`p-2.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                    isMicMuted
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700'
                  }`}
                >
                  {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span className="hidden sm:inline">{isMicMuted ? 'Mic Off' : 'Mic On'}</span>
                </button>

                <button
                  onClick={toggleCamera}
                  className={`p-2.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                    isCameraOff
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700'
                  }`}
                >
                  {isCameraOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                  <span className="hidden sm:inline">{isCameraOff ? 'Camera On' : 'Camera Off'}</span>
                </button>

                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold transition-all flex items-center space-x-1.5"
                >
                  {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
                  <span className="hidden sm:inline">{isPaused ? 'Resume' : 'Pause'}</span>
                </button>
              </div>

              {/* Center Prominent Voice Recording Button */}
              <div className="flex items-center space-x-2">
                {voiceRecordingState !== 'listening' ? (
                  <button
                    onClick={handleStartVoiceRecording}
                    disabled={isSubmitting || isAiSpeaking}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 disabled:opacity-50 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/20 flex items-center space-x-2 transition-all"
                  >
                    <Mic className="w-4 h-4 animate-pulse" />
                    <span>Start Voice Answer</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleStopVoiceRecording}
                      className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-lg shadow-rose-600/30 flex items-center space-x-2 animate-pulse"
                    >
                      <MicOff className="w-4 h-4" />
                      <span>Stop Recording</span>
                    </button>
                    <button
                      onClick={handlePauseVoiceRecording}
                      className="px-3 py-2.5 rounded-xl bg-amber-600/30 border border-amber-500/50 text-amber-200 font-bold text-xs"
                    >
                      Pause
                    </button>
                  </div>
                )}
              </div>

              {/* Right Action: Next Question or Submit Final Interview */}
              {!isLastQuestion ? (
                <button
                  onClick={handleSaveAndNext}
                  disabled={isSubmitting}
                  className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:opacity-95 text-white font-extrabold text-xs transition-all shadow-xl shadow-indigo-600/30 flex items-center space-x-2"
                >
                  <span>Next Question</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setShowFinalSubmitModal(true)}
                  disabled={isSubmitting}
                  className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-extrabold text-xs transition-all shadow-xl shadow-emerald-600/30 flex items-center space-x-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Final Interview</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 4. COLLAPSIBLE RIGHT INTERVIEW SIDEBAR */}
        {isSidebarOpen && (
          <aside className="w-80 bg-slate-950/95 border-l border-slate-800 p-5 overflow-y-auto space-y-6 hidden lg:block">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Questions Tracker
              </span>
              <span className="text-[11px] font-mono text-indigo-400 font-bold">
                {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete
              </span>
            </div>

            <div className="space-y-2">
              {questions.map((q, idx) => {
                const isCompleted = idx < currentQuestionIndex;
                const isCurrent = idx === currentQuestionIndex;

                return (
                  <div
                    key={q.id || idx}
                    className={`p-3 rounded-xl border text-xs transition-all flex items-start space-x-2.5 ${
                      isCurrent
                        ? 'bg-indigo-950/80 border-indigo-600 text-white font-semibold'
                        : isCompleted
                        ? 'bg-slate-900/60 border-slate-800 text-slate-400'
                        : 'bg-slate-900/30 border-slate-800/50 text-slate-500'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : isCurrent ? (
                      <Radio className="w-4 h-4 text-indigo-400 animate-pulse shrink-0 mt-0.5" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0 mt-0.5 text-[10px] flex items-center justify-center">
                        {idx + 1}
                      </div>
                    )}

                    <div className="space-y-0.5 truncate">
                      <p className="truncate text-[11px] font-semibold">{q.topic}</p>
                      <p className="text-[10px] text-slate-500 truncate">{q.category}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Integrity Log */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400 uppercase flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Integrity Monitoring</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {integritySignals.length} Logged
                </span>
              </div>

              <div className="max-h-36 overflow-y-auto space-y-1.5 text-[11px]">
                {integritySignals.length === 0 ? (
                  <p className="text-slate-500 text-[11px] italic">
                    Proctoring stream normal.
                  </p>
                ) : (
                  integritySignals.map((sig) => (
                    <div
                      key={sig.id}
                      className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 space-y-0.5"
                    >
                      <div className="flex items-center justify-between font-mono text-[10px]">
                        <span className="text-amber-400">{sig.type}</span>
                        <span className="text-slate-500">{sig.timestamp}</span>
                      </div>
                      <p className="text-[10px] text-slate-400">{sig.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* 5. SUBMIT FINAL INTERVIEW MODAL */}
      {showFinalSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4 animate-fade-in text-white">
            <div className="flex items-center space-x-3 text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
              <h3 className="text-lg font-bold">Submit Final Interview?</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              You are about to finalize your interview session. All speech transcripts, answer responses, and multi-language code submissions will be evaluated by the AI engine to generate your complete performance report.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowFinalSubmitModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold"
              >
                Return to Interview
              </button>
              <button
                onClick={handleFinalSubmissionConfirmed}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30"
              >
                {isSubmitting ? 'Evaluating...' : 'Confirm & Submit Interview'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. END EARLY MODAL */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4 animate-fade-in text-white">
            <div className="flex items-center space-x-3 text-rose-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-lg font-bold">End Interview Early?</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Ending early will finalize all answered questions up to this point and generate your performance report.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowEndModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold"
              >
                Continue Interview
              </button>
              <button
                onClick={handleFinalSubmissionConfirmed}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30"
              >
                Yes, Submit Completed Questions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
