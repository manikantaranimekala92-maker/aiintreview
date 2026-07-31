import React, { useState, useEffect, useRef } from 'react';
import { User, JobDescription } from '../../types';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Play,
  User as UserIcon,
  Briefcase,
  Clock,
  HelpCircle,
  ShieldCheck,
  Radio,
  Lock,
} from 'lucide-react';
import { QuickTipsTooltip } from './QuickTipsTooltip';

interface InterviewLobbyProps {
  currentUser: User;
  jobTitle: string;
  mediaStream: MediaStream;
  onStartInterview: (stream: MediaStream, isMicMuted: boolean, isCameraOff: boolean) => void;
  onBackToSystemCheck: () => void;
}

export const InterviewLobby: React.FC<InterviewLobbyProps> = ({
  currentUser,
  jobTitle,
  mediaStream,
  onStartInterview,
  onBackToSystemCheck,
}) => {
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isCameraOff, setIsCameraOff] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

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
      videoRef.current.play().catch((err) => console.warn('Lobby video play warning:', err));
    }
  }, [mediaStream, isCameraOff, isMicMuted]);

  const toggleMic = () => {
    mediaStream.getAudioTracks().forEach((track) => {
      track.enabled = isMicMuted; // Toggle track enable state
    });
    setIsMicMuted(!isMicMuted);
  };

  const toggleCamera = () => {
    mediaStream.getVideoTracks().forEach((track) => {
      track.enabled = isCameraOff; // Toggle track enable state
    });
    setIsCameraOff(!isCameraOff);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Lobby Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
          <Radio className="w-3.5 h-3.5 animate-pulse text-indigo-500" />
          <span>LIVE INTERVIEW LOBBY</span>
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Ready to Begin Your AI Video Evaluation?
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          Adjust your camera position and microphone before launching. Recording will begin immediately when you press <span className="font-bold text-indigo-600 dark:text-indigo-400">Start Interview</span>.
        </p>
      </div>

      {/* Main Video Preview Box */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#030816] border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
        <div className="relative aspect-video rounded-2xl bg-slate-950 overflow-hidden border border-slate-800 flex items-center justify-center shadow-inner">
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
              <VideoOff className="w-12 h-12" />
              <p className="text-xs font-semibold">Camera Stream Paused</p>
            </div>
          )}

          {/* Overlay Status Badge */}
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-semibold flex items-center space-x-2 border border-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Camera Active • {currentUser.name}</span>
          </div>

          {/* Quick Mic / Camera Floating Controls */}
          <div className="absolute bottom-4 flex items-center space-x-3 bg-slate-900/90 backdrop-blur-md p-2 rounded-2xl border border-slate-700/80 shadow-lg">
            <button
              type="button"
              onClick={toggleMic}
              className={`p-3 rounded-xl transition-all ${
                isMicMuted
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
              title={isMicMuted ? 'Unmute Microphone' : 'Mute Microphone'}
            >
              {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <button
              type="button"
              onClick={toggleCamera}
              className={`p-3 rounded-xl transition-all ${
                isCameraOff
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
              title={isCameraOff ? 'Turn On Camera' : 'Turn Off Camera'}
            >
              {isCameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Candidate & Interview Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs">
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 font-mono uppercase">Candidate</span>
            <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{currentUser.name}</p>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 font-mono uppercase">Role</span>
            <p className="font-bold text-indigo-600 dark:text-indigo-400 truncate">{jobTitle}</p>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 font-mono uppercase">Duration</span>
            <p className="font-bold text-slate-900 dark:text-slate-100">30 Minutes</p>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 font-mono uppercase">Questions</span>
            <p className="font-bold text-slate-900 dark:text-slate-100">10 Adaptive</p>
          </div>
        </div>

        {/* Recording Disclosure Notice */}
        <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 text-xs text-indigo-900 dark:text-indigo-300 flex items-center space-x-2.5">
          <Lock className="w-4 h-4 text-indigo-500 shrink-0" />
          <p className="text-[11px] leading-relaxed">
            <span className="font-bold">🔴 Recording Notice:</span> Audio & video recording will begin immediately upon pressing Start Interview. Media is stored securely for recruiter evaluation.
          </p>
        </div>

        {/* Start Button & Quick Tips */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
          <button
            onClick={onBackToSystemCheck}
            className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            System Check
          </button>

          <div className="flex-1 flex items-center space-x-2">
            <button
              onClick={() => onStartInterview(mediaStream, isMicMuted, isCameraOff)}
              className="flex-1 py-4 px-6 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 hover:opacity-95 text-white font-extrabold text-sm transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center space-x-2 active:scale-[0.99]"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>START LIVE INTERVIEW</span>
            </button>

            <QuickTipsTooltip align="right" buttonLabel="Quick Tip" />
          </div>
        </div>
      </div>
    </div>
  );
};
