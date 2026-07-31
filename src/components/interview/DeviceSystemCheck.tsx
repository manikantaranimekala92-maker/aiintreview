import React, { useState, useEffect, useRef } from 'react';
import { DeviceCheckStatus } from '../../types';
import {
  Camera,
  Mic,
  Volume2,
  Wifi,
  Globe,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface DeviceSystemCheckProps {
  onProceedToLobby: (stream: MediaStream) => void;
  onBackToSetup: () => void;
}

export const DeviceSystemCheck: React.FC<DeviceSystemCheckProps> = ({
  onProceedToLobby,
  onBackToSetup,
}) => {
  const [deviceStatus, setDeviceStatus] = useState<DeviceCheckStatus>({
    camera: 'checking',
    microphone: 'checking',
    speaker: 'checking',
    internet: 'checking',
    browser: 'checking',
  });

  const [activeStream, setActiveStream] = useState<MediaStream | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [isPlayingTestSound, setIsPlayingTestSound] = useState<boolean>(false);
  const [permissionError, setPermissionError] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const activeStreamRef = useRef<MediaStream | null>(null);
  const hasProceededRef = useRef<boolean>(false);

  // Run System Diagnostics
  const runDiagnostics = async () => {
    setPermissionError('');

    // Stop existing stream and AudioContext if re-running
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((t) => t.stop());
      activeStreamRef.current = null;
    }

    setDeviceStatus({
      camera: 'checking',
      microphone: 'checking',
      speaker: 'checking',
      internet: 'checking',
      browser: 'checking',
    });

    // 1. Browser Check
    const isBrowserSupported =
      'mediaDevices' in navigator &&
      'getUserMedia' in navigator.mediaDevices &&
      'MediaRecorder' in window;

    setDeviceStatus((prev) => ({
      ...prev,
      browser: isBrowserSupported ? 'passed' : 'failed',
    }));

    // 2. Internet Check
    try {
      const isOnline = navigator.onLine;
      setDeviceStatus((prev) => ({
        ...prev,
        internet: isOnline ? 'passed' : 'failed',
      }));
    } catch (e) {
      setDeviceStatus((prev) => ({ ...prev, internet: 'failed' }));
    }

    // 3. Camera & Microphone Check via getUserMedia
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('MediaDevices API not supported in this browser environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });

      const videoTracks = stream.getVideoTracks();
      const audioTracks = stream.getAudioTracks();

      console.log('Video tracks count:', videoTracks.length);
      console.log('Audio tracks count:', audioTracks.length);

      if (audioTracks.length === 0) {
        throw new Error('Microphone access is required for the interview. Please allow microphone access in your browser settings and try again.');
      }

      const audioTrack = audioTracks[0];
      console.log('Audio track state:', audioTrack.readyState);
      console.log('Audio track enabled:', audioTrack.enabled);
      console.log('Audio track muted:', audioTrack.muted);

      if (audioTrack.readyState !== 'live') {
        throw new Error('Microphone stream is not in live state.');
      }

      // Ensure track is enabled
      audioTrack.enabled = true;

      activeStreamRef.current = stream;
      setActiveStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((e) => console.warn('Preview play warning:', e));
      }

      // Check audio track meter
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          audioContextRef.current = ctx;
          const source = ctx.createMediaStreamSource(stream);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);

          const updateVolume = () => {
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const average = sum / dataArray.length;
            setAudioLevel(Math.min(100, Math.round((average / 128) * 100)));
            animFrameRef.current = requestAnimationFrame(updateVolume);
          };
          updateVolume();
        }
      } catch (err) {
        console.warn('Audio analyzer issue:', err);
      }

      setDeviceStatus((prev) => ({
        ...prev,
        camera: videoTracks.length > 0 ? 'passed' : 'failed',
        microphone: audioTracks.length > 0 ? 'passed' : 'failed',
        speaker: 'passed',
      }));
    } catch (err: any) {
      console.error('Media devices access error:', err);
      let msg = 'Microphone access is required for the interview. Please allow microphone access in your browser settings and try again.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Microphone access is required for the interview. Please allow microphone access in your browser settings and try again.';
      } else if (err.name === 'NotFoundError') {
        msg = 'No camera or microphone hardware found attached to this device.';
      } else if (err.message) {
        msg = err.message;
      }
      setPermissionError(msg);
      setDeviceStatus((prev) => ({
        ...prev,
        camera: 'failed',
        microphone: 'failed',
        speaker: 'failed',
        errorMessage: msg,
      }));
    }
  };

  useEffect(() => {
    runDiagnostics();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      if (!hasProceededRef.current && activeStreamRef.current) {
        activeStreamRef.current.getTracks().forEach((track) => {
          try {
            track.stop();
          } catch (e) {}
        });
      }
    };
  }, []);

  const playTestSpeakerSound = () => {
    setIsPlayingTestSound(true);
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime); // A4 tone
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
        setTimeout(() => {
          setIsPlayingTestSound(false);
          if (ctx.state !== 'closed') {
            ctx.close().catch(() => {});
          }
        }, 700);
      } else {
        setIsPlayingTestSound(false);
      }
    } catch (e) {
      setIsPlayingTestSound(false);
    }
  };

  const allPassed =
    deviceStatus.camera === 'passed' &&
    deviceStatus.microphone === 'passed' &&
    deviceStatus.internet === 'passed' &&
    deviceStatus.browser === 'passed';

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#030816] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Camera className="w-5 h-5 text-indigo-500" />
            <span>Hardware & Environment System Check</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Verifying your camera, microphone, speakers, and connection stability before entering the lobby.
          </p>
        </div>

        <button
          onClick={runDiagnostics}
          className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center space-x-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Re-run Check</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Live Camera Preview & Audio Meter */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#030816] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                <Camera className="w-4 h-4 text-indigo-500" />
                <span>Live Camera Feed</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                1280 x 720 High Definition
              </span>
            </div>

            <div className="relative aspect-video rounded-xl bg-slate-950 overflow-hidden border border-slate-800 flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />

              {deviceStatus.camera === 'checking' && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-2 text-white">
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                  <p className="text-xs font-semibold">Requesting Camera Permissions...</p>
                </div>
              )}

              {deviceStatus.camera === 'failed' && (
                <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md p-6 flex flex-col items-center justify-center text-center space-y-3 text-white">
                  <ShieldAlert className="w-10 h-10 text-rose-500 animate-bounce" />
                  <h4 className="text-sm font-bold text-rose-400">Camera Access Blocked</h4>
                  <p className="text-xs text-slate-300 max-w-sm leading-relaxed">
                    {permissionError || 'Camera permissions are required for live video evaluation.'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Click the camera/lock icon in your browser address bar to allow permissions.
                  </p>
                </div>
              )}
            </div>

            {/* Microphone Volume Meter */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                  <Mic className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Microphone Sensitivity Level</span>
                </span>
                <span className="text-indigo-600 dark:text-indigo-400 font-mono text-[11px]">
                  {audioLevel > 5 ? `${audioLevel}% Audio Detected` : 'Speak to test mic...'}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-100 rounded-full"
                  style={{ width: `${Math.max(4, audioLevel)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Diagnostic Status Checklist & Action Buttons */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#030816] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Diagnostic Status Matrix
            </h3>

            <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800">
              {/* Camera Status */}
              <div className="pt-2 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <Camera className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-200">Camera Device</span>
                </div>
                {deviceStatus.camera === 'checking' ? (
                  <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                ) : deviceStatus.camera === 'passed' ? (
                  <span className="flex items-center space-x-1 text-xs font-bold text-emerald-500">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Working</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1 text-xs font-bold text-rose-500">
                    <XCircle className="w-4 h-4" />
                    <span>Failed</span>
                  </span>
                )}
              </div>

              {/* Microphone Status */}
              <div className="pt-2 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <Mic className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-200">Microphone Input</span>
                </div>
                {deviceStatus.microphone === 'checking' ? (
                  <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                ) : deviceStatus.microphone === 'passed' ? (
                  <span className="flex items-center space-x-1 text-xs font-bold text-emerald-500">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Working</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1 text-xs font-bold text-rose-500">
                    <XCircle className="w-4 h-4" />
                    <span>Failed</span>
                  </span>
                )}
              </div>

              {/* Speaker Test */}
              <div className="pt-2 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <Volume2 className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-200">Speaker Audio Output</span>
                </div>
                <button
                  type="button"
                  onClick={playTestSpeakerSound}
                  disabled={isPlayingTestSound}
                  className="px-2 py-1 rounded bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-[11px] font-semibold hover:bg-indigo-100"
                >
                  {isPlayingTestSound ? 'Playing Tone...' : '🔊 Test Sound'}
                </button>
              </div>

              {/* Network Connection */}
              <div className="pt-2 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <Wifi className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-200">Network Latency</span>
                </div>
                {deviceStatus.internet === 'passed' ? (
                  <span className="flex items-center space-x-1 text-xs font-bold text-emerald-500">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Stable</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1 text-xs font-bold text-rose-500">
                    <XCircle className="w-4 h-4" />
                    <span>Offline</span>
                  </span>
                )}
              </div>

              {/* Browser Compatibility */}
              <div className="pt-2 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <Globe className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-200">Browser Engines</span>
                </div>
                {deviceStatus.browser === 'passed' ? (
                  <span className="flex items-center space-x-1 text-xs font-bold text-emerald-500">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Supported</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1 text-xs font-bold text-rose-500">
                    <XCircle className="w-4 h-4" />
                    <span>Unsupported</span>
                  </span>
                )}
              </div>
            </div>

            {/* Error Banner if permission failed */}
            {permissionError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 text-xs space-y-2">
                <div className="flex items-start space-x-1.5 font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                  <span>Permission Resolution Instructions:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-[11px]">
                  <li>Click the camera icon next to the URL address bar.</li>
                  <li>Select "Allow" for Camera and Microphone.</li>
                  <li>Click "Re-run Check" above.</li>
                </ol>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  if (activeStreamRef.current) {
                    activeStreamRef.current.getTracks().forEach((t) => {
                      try {
                        t.stop();
                      } catch (e) {}
                    });
                    activeStreamRef.current = null;
                  }
                  onBackToSetup();
                }}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Back
              </button>

              <button
                onClick={() => {
                  if (activeStream) {
                    hasProceededRef.current = true;
                    onProceedToLobby(activeStream);
                  }
                }}
                disabled={!allPassed || !activeStream}
                className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center space-x-2"
              >
                <span>Proceed to Interview Lobby</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
