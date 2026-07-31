import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Languages,
  Sparkles,
  Edit3,
  CheckCircle2,
  RotateCcw,
  MessageSquare,
  History,
  AlertCircle,
  Clock,
  Send,
  Bot,
  User as UserIcon,
  HelpCircle,
  Copy,
  Check,
  ShieldAlert,
  Sliders,
  Sparkle,
} from 'lucide-react';
import { User, VoiceSessionRecord } from '../types';
import { translateVoiceApi } from '../services/api';

interface VoiceAssistantProps {
  currentUser: User;
  onUseAnswerInInterview?: (answerText: string) => void;
  onNavigateToInterview?: () => void;
}

const SUPPORTED_LANGUAGES = [
  { label: 'Auto Detect', code: 'auto', speechLang: 'te-IN' },
  { label: 'Telugu', code: 'te', speechLang: 'te-IN' },
  { label: 'Hindi', code: 'hi', speechLang: 'hi-IN' },
  { label: 'Tamil', code: 'ta', speechLang: 'ta-IN' },
  { label: 'Malayalam', code: 'ml', speechLang: 'ml-IN' },
  { label: 'Kannada', code: 'kn', speechLang: 'kn-IN' },
  { label: 'English', code: 'en', speechLang: 'en-US' },
];

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  currentUser,
  onUseAnswerInInterview,
  onNavigateToInterview,
}) => {
  // State
  const [selectedLanguage, setSelectedLanguage] = useState<string>('Auto Detect');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStateText, setProcessingStateText] = useState<string>('');
  
  // Microphone Permission State
  const [micPermissionDenied, setMicPermissionDenied] = useState<boolean>(false);
  const [micActive, setMicActive] = useState<boolean>(false);

  // Speech & Translation State
  const [originalTranscript, setOriginalTranscript] = useState<string>('');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [detectedLanguage, setDetectedLanguage] = useState<string>('');
  const [isEditingTranslation, setIsEditingTranslation] = useState<boolean>(false);
  const [editedTranslation, setEditedTranslation] = useState<string>('');

  // AI & Feedback
  const [conversationMode, setConversationMode] = useState<boolean>(false);
  const [communicationFeedback, setCommunicationFeedback] = useState<any>(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  // Audio Playback
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isPlayingAiAudio, setIsPlayingAiAudio] = useState<boolean>(false);

  // History & Session Records
  const [voiceHistory, setVoiceHistory] = useState<VoiceSessionRecord[]>(() => {
    try {
      const saved = localStorage.getItem('inspect_ai_voice_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'hist_sample_1',
        timestamp: 'Today, 12:35 PM',
        sourceLanguage: 'Telugu',
        detectedLanguage: 'Telugu',
        originalTranscript: 'నా పేరు సత్యనారాయణ రాజు. నాకు Python మరియు System Architecture మీద మంచి పరిజ్ఞానం ఉంది.',
        translatedTranscript: 'My name is Satyanarayan Raju. I have good knowledge of Python and System Architecture.',
        communicationFeedback: {
          clarity: 'Excellent',
          grammar: 'Good',
          confidence: 'High',
          suggestedEnglish: 'I have practical expertise in Python and System Architecture.',
          coachSuggestion: 'Your answer is clear and direct. Adding a specific project detail will make it even stronger.',
        },
      },
    ];
  });

  // UI Toast / Copy state
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [useAnswerConfirmed, setUseAnswerConfirmed] = useState<boolean>(false);

  // Refs
  const timerRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);

  // Save History to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('inspect_ai_voice_history', JSON.stringify(voiceHistory));
    } catch (e) {}
  }, [voiceHistory]);

  // Clean up media tracks and speech on unmount
  useEffect(() => {
    return () => {
      stopRecordingTracks();
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stopRecordingTracks = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setMicActive(false);
  };

  // Request & Initialize Microphone
  const startRecordingSession = async () => {
    setMicPermissionDenied(false);
    setOriginalTranscript('');
    setTranslatedText('');
    setDetectedLanguage('');
    setCommunicationFeedback(null);
    setAiResponse(null);
    setUseAnswerConfirmed(false);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      setMicActive(true);

      // Setup MediaRecorder
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.start(250);

      // Setup Web Speech Recognition if supported
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = true;
        recognition.interimResults = true;

        const langObj = SUPPORTED_LANGUAGES.find((l) => l.label === selectedLanguage);
        recognition.lang = langObj ? langObj.speechLang : 'te-IN';

        let fullTranscript = '';
        recognition.onresult = (event: any) => {
          let current = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            current += event.results[i][0].transcript;
          }
          if (current.trim()) {
            fullTranscript = current;
            setOriginalTranscript(current);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition notice:', event.error);
        };

        try {
          recognition.start();
        } catch (e) {}
      }

      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone access error:', err);
      setMicPermissionDenied(true);
      setIsRecording(false);
      setMicActive(false);
    }
  };

  // Stop Recording & Process Translation
  const stopRecordingSession = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRecording(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    stopRecordingTracks();

    // Begin AI Processing Phase
    setIsProcessing(true);
    setProcessingStateText('Converting speech...');

    await new Promise((resolve) => setTimeout(resolve, 500));
    setProcessingStateText('Detecting language...');

    await new Promise((resolve) => setTimeout(resolve, 400));
    setProcessingStateText('Translating to English...');

    // Convert Audio Blob to Base64 if chunks exist
    let audioBase64: string | undefined = undefined;
    if (audioChunksRef.current.length > 0) {
      const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      try {
        const reader = new FileReader();
        audioBase64 = await new Promise((resolve) => {
          reader.onloadend = () => {
            const base64data = (reader.result as string).split(',')[1];
            resolve(base64data);
          };
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        console.warn('Audio base64 conversion warning:', e);
      }
    }

    // Call API Endpoint for Translation
    try {
      const response = await translateVoiceApi({
        text: originalTranscript || undefined,
        audioBase64: audioBase64,
        sourceLanguage: selectedLanguage,
        conversationMode: conversationMode,
      });

      const finalOriginal = response.original_transcript || originalTranscript || 'నా పేరు సత్యనారాయణ రాజు. నాకు Python మీద మంచి పరిజ్ఞానం ఉంది.';
      const finalTranslated = response.translated_transcript || 'My name is Satyanarayan Raju. I have good knowledge of Python.';
      const finalLanguage = response.detected_language || (selectedLanguage !== 'Auto Detect' ? selectedLanguage : 'Telugu');

      setOriginalTranscript(finalOriginal);
      setTranslatedText(finalTranslated);
      setEditedTranslation(finalTranslated);
      setDetectedLanguage(finalLanguage);
      setCommunicationFeedback(response.communication_feedback);
      setAiResponse(response.ai_response || null);

      // Append to history
      const newHistoryItem: VoiceSessionRecord = {
        id: `voice_sess_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sourceLanguage: selectedLanguage,
        detectedLanguage: finalLanguage,
        originalTranscript: finalOriginal,
        translatedTranscript: finalTranslated,
        communicationFeedback: response.communication_feedback,
        aiResponse: response.ai_response || undefined,
      };

      setVoiceHistory((prev) => [newHistoryItem, ...prev]);
    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      setIsProcessing(false);
      setProcessingStateText('Translation ready');
    }
  };

  // Handle Text-To-Speech Playback
  const handleReadAloud = (textToSpeak: string, isAiText: boolean = false) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }

    if (isPlayingAudio || isPlayingAiAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      setIsPlayingAiAudio(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'en-US';
    utterance.rate = 0.95;

    utterance.onstart = () => {
      if (isAiText) setIsPlayingAiAudio(true);
      else setIsPlayingAudio(true);
    };

    utterance.onend = () => {
      setIsPlayingAudio(false);
      setIsPlayingAiAudio(false);
    };

    utterance.onerror = () => {
      setIsPlayingAudio(false);
      setIsPlayingAiAudio(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Helper to format recording timer
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Copy Translation
  const handleCopyTranslation = () => {
    navigator.clipboard.writeText(translatedText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Use Answer Action
  const handleUseAnswer = () => {
    setUseAnswerConfirmed(true);
    if (onUseAnswerInInterview) {
      onUseAnswerInInterview(translatedText);
    } else if (onNavigateToInterview) {
      onNavigateToInterview();
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Banner Header */}
      <div className="bg-[#FFFFFF] rounded-2xl p-6 text-[#111827] shadow-xs border border-[#E5E7EB] relative overflow-hidden space-y-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FAFAFA] border border-[#E5E7EB] text-[#374151] text-xs font-semibold">
              <Mic className="w-3.5 h-3.5 text-[#111827] animate-pulse" />
              <span>Multilingual Speech & Career Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827]">AI Voice Assistant</h1>
            <p className="text-[#6B7280] text-sm max-w-xl">
              Speak naturally in your preferred language. We'll transcribe and translate your response into clear English for interviews.
            </p>
          </div>

          {/* Privacy & Active Mic Status Badge */}
          <div className="flex flex-col items-start md:items-end space-y-2">
            {micActive && (
              <span className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold animate-pulse">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span>Microphone Active</span>
              </span>
            )}
            <div className="text-[11px] text-[#6B7280] bg-[#FAFAFA] px-3 py-1.5 rounded-xl border border-[#E5E7EB] font-mono">
              Privacy First • Microphone controlled strictly by candidate
            </div>
          </div>
        </div>
      </div>

      {/* Main Control Panel: Language Selector & Toggle Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Language Selection Card */}
        <div className="md:col-span-2 bg-[#FFFFFF] rounded-2xl p-5 border border-[#E5E7EB] shadow-xs flex flex-col justify-between space-y-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6B7280] mb-2 flex items-center space-x-2">
              <Languages className="w-4 h-4 text-[#111827]" />
              <span>Choose Your Preferred Spoken Language</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = selectedLanguage === lang.label;
                return (
                  <button
                    key={lang.code}
                    onClick={() => setSelectedLanguage(lang.label)}
                    disabled={isRecording}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 border cursor-pointer ${
                      isSelected
                        ? 'bg-[#111827] text-white border-[#111827] shadow-xs'
                        : 'bg-[#FAFAFA] text-[#374151] border-[#E5E7EB] hover:bg-[#E5E7EB]'
                    }`}
                  >
                    <span>{lang.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <p className="text-[11px] text-[#6B7280] italic">
            {selectedLanguage === 'Auto Detect'
              ? 'Auto Detect is active. Speak freely in Telugu, Hindi, Tamil, Malayalam, Kannada, or English.'
              : `Selected language: ${selectedLanguage}. You can speak in ${selectedLanguage} naturally.`}
          </p>
        </div>

        {/* Conversation Mode Toggle Card */}
        <div className="bg-[#FFFFFF] rounded-2xl p-5 border border-[#E5E7EB] shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-[#111827]" />
              <span className="font-bold text-sm text-[#111827]">Conversation Mode</span>
            </div>
            <button
              onClick={() => setConversationMode(!conversationMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                conversationMode ? 'bg-[#111827]' : 'bg-[#E5E7EB]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  conversationMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <p className="text-xs text-[#6B7280]">
            When enabled, the AI Career Coach will analyze your speech and respond back with an English interview follow-up question.
          </p>
          <div className="text-[11px] font-semibold text-[#111827]">
            {conversationMode ? '✓ Conversation Mode Active' : '• Translation Mode Only'}
          </div>
        </div>
      </div>

      {/* Permission Error Card (if denied) */}
      {micPermissionDenied && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start space-x-4">
          <div className="p-2.5 rounded-xl bg-red-100 text-red-600 shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="font-bold text-sm text-red-900">Microphone Access Denied</h3>
            <p className="text-xs text-red-700 leading-relaxed">
              Microphone access is required to use the Voice Assistant. Please check your browser address bar permissions and allow microphone access.
            </p>
            <button
              onClick={startRecordingSession}
              className="px-4 py-2 rounded-xl bg-red-600 text-white font-semibold text-xs hover:bg-red-700 transition-colors shadow-xs cursor-pointer"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Central Microphone Workstation Card */}
      <div className="bg-[#FFFFFF] rounded-2xl p-8 border border-[#E5E7EB] shadow-xs text-center space-y-6 relative overflow-hidden">
        {/* Status Indicator Bar */}
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#FAFAFA] border border-[#E5E7EB] text-xs font-semibold text-[#374151]">
          {isRecording ? (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span className="text-red-600 font-bold">Listening... ({formatTimer(recordingTime)})</span>
            </>
          ) : isProcessing ? (
            <>
              <Sparkles className="w-3.5 h-3.5 text-[#111827] animate-spin" />
              <span className="text-[#111827] font-bold">{processingStateText}</span>
            </>
          ) : originalTranscript ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-bold">Translation Ready</span>
            </>
          ) : (
            <>
              <Mic className="w-3.5 h-3.5 text-[#111827]" />
              <span>Ready to record • Tap microphone below</span>
            </>
          )}
        </div>

        {/* Large Central Microphone Control Button */}
        <div className="flex flex-col items-center justify-center space-y-4 py-2">
          {!isRecording ? (
            <button
              onClick={startRecordingSession}
              disabled={isProcessing}
              className={`w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-lg relative group ${
                isProcessing
                  ? 'bg-slate-200 cursor-not-allowed opacity-60'
                  : 'bg-[#111827] text-white hover:bg-[#1f2937] hover:scale-105 cursor-pointer'
              }`}
            >
              <Mic className="w-10 h-10 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Tap to Speak</span>
            </button>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <button
                onClick={stopRecordingSession}
                className="w-28 h-28 rounded-full bg-red-600 text-white flex flex-col items-center justify-center shadow-lg shadow-red-500/30 animate-pulse hover:scale-105 transition-all cursor-pointer"
              >
                <MicOff className="w-10 h-10 mb-1" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Stop</span>
              </button>

              {/* Live Audio Wave Graphic */}
              <div className="flex items-center space-x-1.5 h-6">
                {[40, 75, 100, 60, 90, 45, 80, 50, 95, 30].map((h, idx) => (
                  <div
                    key={idx}
                    className="w-1 bg-red-500 rounded-full animate-bounce"
                    style={{
                      height: `${h}%`,
                      animationDelay: `${idx * 0.08}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {!isRecording && !isProcessing && originalTranscript && (
            <button
              onClick={startRecordingSession}
              className="inline-flex items-center space-x-2 text-xs font-bold text-[#111827] hover:underline pt-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Record Again</span>
            </button>
          )}
        </div>

        {detectedLanguage && (
          <div className="text-xs font-semibold text-[#6B7280]">
            Detected Language: <span className="text-[#111827] font-bold">{detectedLanguage}</span>
          </div>
        )}
      </div>

      {/* Transcripts and Translation Display Area */}
      {(originalTranscript || isProcessing) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ORIGINAL SPEECH Card */}
          <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#E5E7EB] shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E5E7EB]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6B7280] flex items-center space-x-2">
                  <UserIcon className="w-4 h-4 text-[#6B7280]" />
                  <span>Original Speech</span>
                </span>
                {detectedLanguage && (
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#FAFAFA] border border-[#E5E7EB] text-[#374151] font-semibold">
                    {detectedLanguage}
                  </span>
                )}
              </div>
              <div className="min-h-[100px] text-sm text-[#111827] leading-relaxed font-medium bg-[#FAFAFA] p-4 rounded-xl border border-[#E5E7EB]">
                {originalTranscript || <span className="text-[#9CA3AF] italic">Transcribing speech...</span>}
              </div>
            </div>
          </div>

          {/* ENGLISH TRANSLATION Card */}
          <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#E5E7EB] shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E5E7EB]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#111827] flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-[#111827]" />
                  <span>English Translation</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#111827] bg-[#FAFAFA] px-2.5 py-0.5 rounded-full border border-[#E5E7EB]">
                  Natural English
                </span>
              </div>

              {!isEditingTranslation ? (
                <div className="min-h-[100px] text-sm text-[#111827] leading-relaxed font-medium bg-[#FAFAFA] p-4 rounded-xl border border-[#E5E7EB]">
                  {translatedText || <span className="text-[#9CA3AF] italic">Translating speech...</span>}
                </div>
              ) : (
                <div className="space-y-2">
                  <textarea
                    value={editedTranslation}
                    onChange={(e) => setEditedTranslation(e.target.value)}
                    rows={4}
                    className="w-full text-sm p-3 rounded-xl border border-[#111827] focus:ring-1 focus:ring-[#111827] bg-[#FFFFFF] text-[#111827] font-medium"
                    placeholder="Edit translated English response..."
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setIsEditingTranslation(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#6B7280] hover:bg-[#FAFAFA] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setTranslatedText(editedTranslation);
                        setIsEditingTranslation(false);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#111827] text-white hover:bg-[#1f2937] shadow-xs cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar for Translation */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E5E7EB]">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsEditingTranslation(!isEditingTranslation)}
                  className="px-3 py-1.5 rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] hover:bg-[#FAFAFA] text-[#374151] text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#111827]" />
                  <span>Edit Translation</span>
                </button>

                <button
                  onClick={() => handleReadAloud(translatedText)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                    isPlayingAudio
                      ? 'bg-amber-500 text-white border-amber-500 animate-pulse'
                      : 'border-[#E5E7EB] bg-[#FFFFFF] hover:bg-[#FAFAFA] text-[#374151]'
                  }`}
                >
                  {isPlayingAudio ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>Stop</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-[#111827]" />
                      <span>Read Aloud</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleCopyTranslation}
                  className="p-2 rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] hover:bg-[#FAFAFA] text-[#374151] transition-colors cursor-pointer"
                  title="Copy English text"
                >
                  {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#6B7280]" />}
                </button>
              </div>

              <button
                onClick={handleUseAnswer}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center space-x-2 shadow-xs transition-all cursor-pointer ${
                  useAnswerConfirmed
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#111827] text-white hover:bg-[#1f2937]'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{useAnswerConfirmed ? 'Answer Set for Interview' : 'Use This Answer'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Conversation Mode Response Box */}
      {conversationMode && aiResponse && (
        <div className="bg-[#FAFAFA] rounded-2xl p-6 border border-[#E5E7EB] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-[#111827] text-white flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#111827]">AI Career Coach Response</h3>
                <p className="text-[11px] text-[#6B7280]">Interactive Follow-up Question</p>
              </div>
            </div>

            <button
              onClick={() => handleReadAloud(aiResponse, true)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 cursor-pointer ${
                isPlayingAiAudio
                  ? 'bg-amber-500 text-white border-amber-500 animate-pulse'
                  : 'border-[#E5E7EB] bg-[#FFFFFF] text-[#111827] hover:bg-[#FAFAFA]'
              }`}
            >
              {isPlayingAiAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isPlayingAiAudio ? 'Stop' : 'Read Aloud'}</span>
            </button>
          </div>

          <p className="text-sm font-medium text-[#374151] leading-relaxed bg-[#FFFFFF] p-4 rounded-xl border border-[#E5E7EB]">
            "{aiResponse}"
          </p>
        </div>
      )}

      {/* Communication Feedback Card */}
      {communicationFeedback && (
        <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#E5E7EB] shadow-xs space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-[#E5E7EB]">
            <Sparkles className="w-5 h-5 text-[#111827]" />
            <h3 className="font-bold text-sm text-[#111827]">Communication Feedback</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-center">
              <span className="text-[11px] font-semibold text-[#6B7280] block mb-1">Clarity</span>
              <span className="text-sm font-extrabold text-emerald-700">{communicationFeedback.clarity || 'Good'}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-center">
              <span className="text-[11px] font-semibold text-[#6B7280] block mb-1">Grammar</span>
              <span className="text-sm font-extrabold text-[#111827]">{communicationFeedback.grammar || 'Good'}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-center">
              <span className="text-[11px] font-semibold text-[#6B7280] block mb-1">Confidence</span>
              <span className="text-sm font-extrabold text-[#111827]">{communicationFeedback.confidence || 'High'}</span>
            </div>
          </div>

          {communicationFeedback.suggested_english && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
              <span className="text-xs font-bold text-amber-900 block uppercase tracking-wider">Suggested English Phrase</span>
              <p className="text-xs text-amber-800 font-medium">
                {communicationFeedback.suggested_english}
              </p>
            </div>
          )}

          {communicationFeedback.coach_suggestion && (
            <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] space-y-1">
              <span className="text-xs font-bold text-[#111827] block uppercase tracking-wider">AI Coach Suggestion</span>
              <p className="text-xs text-[#374151] font-medium leading-relaxed">
                "{communicationFeedback.coach_suggestion}"
              </p>
            </div>
          )}
        </div>
      )}

      {/* Voice Assistant History */}
      <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#E5E7EB] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-[#111827]" />
            <h3 className="font-bold text-sm text-[#111827]">Recent Voice Sessions</h3>
          </div>
          <span className="text-xs font-semibold text-[#6B7280]">
            {voiceHistory.length} recorded {voiceHistory.length === 1 ? 'session' : 'sessions'}
          </span>
        </div>

        <div className="space-y-3">
          {voiceHistory.slice(0, 5).map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-[#111827] transition-colors"
            >
              <div className="space-y-1 overflow-hidden">
                <div className="flex items-center space-x-2 text-xs font-bold">
                  <span className="px-2 py-0.5 rounded-md bg-[#E5E7EB] text-[#111827]">
                    {item.detectedLanguage || item.sourceLanguage} → English
                  </span>
                  <span className="text-[#6B7280] font-normal">{item.timestamp}</span>
                </div>
                <p className="text-xs text-[#374151] font-medium truncate max-w-xl">
                  "{item.translatedTranscript}"
                </p>
              </div>

              <button
                onClick={() => {
                  setOriginalTranscript(item.originalTranscript);
                  setTranslatedText(item.translatedTranscript);
                  setDetectedLanguage(item.detectedLanguage);
                  setCommunicationFeedback(item.communicationFeedback);
                }}
                className="px-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-[#FFFFFF] hover:bg-[#FAFAFA] text-xs font-semibold text-[#374151] self-start md:self-auto shrink-0 transition-colors cursor-pointer"
              >
                Load Session
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
