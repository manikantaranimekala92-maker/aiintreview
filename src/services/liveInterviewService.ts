import { IntegritySignal, QuestionTimestampMarker, VideoRecordingData } from '../types';

/**
 * LIVE INTERVIEW SERVICE
 * - Handles MediaRecorder video/audio capture
 * - Tracks timestamp markers for question playback
 * - Manages anti-cheating & integrity signals (tab switch, window blur, device disconnects)
 */

export class LiveInterviewRecorderManager {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private startTimeMs: number = 0;
  private integritySignals: IntegritySignal[] = [];
  private timestampMarkers: QuestionTimestampMarker[] = [];
  private currentQuestionMarker: Partial<QuestionTimestampMarker> | null = null;

  private onIntegrityEventCallback?: (signal: IntegritySignal) => void;

  constructor(onIntegrityEvent?: (signal: IntegritySignal) => void) {
    this.onIntegrityEventCallback = onIntegrityEvent;
  }

  public async startRecording(mediaStream: MediaStream): Promise<boolean> {
    this.stream = mediaStream;
    this.recordedChunks = [];
    this.startTimeMs = Date.now();
    this.integritySignals = [];
    this.timestampMarkers = [];

    try {
      const videoTracks = mediaStream.getVideoTracks();
      const audioTracks = mediaStream.getAudioTracks();

      console.log('Video tracks count:', videoTracks.length);
      console.log('Audio tracks count:', audioTracks.length);

      if (audioTracks.length > 0) {
        const at = audioTracks[0];
        console.log('Audio track state:', at.readyState);
        console.log('Audio track enabled:', at.enabled);
        console.log('Audio track muted:', at.muted);
        // Ensure audio track is enabled
        at.enabled = true;
      } else {
        console.warn('WARNING: LiveInterviewRecorderManager received stream with 0 audio tracks!');
      }

      const candidateMimeTypes = [
        'video/webm;codecs=vp8,opus',
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=h264,opus',
        'video/webm',
        'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
        'video/mp4',
      ];

      let selectedMimeType = '';
      for (const mime of candidateMimeTypes) {
        if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(mime)) {
          selectedMimeType = mime;
          break;
        }
      }

      console.log('Selected MIME type for MediaRecorder:', selectedMimeType || 'browser default');

      const options: MediaRecorderOptions = selectedMimeType ? { mimeType: selectedMimeType } : {};
      this.mediaRecorder = new MediaRecorder(mediaStream, options);

      console.log('MediaRecorder state:', this.mediaRecorder.state);

      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(1000); // collect 1s data slices

      this.setupIntegrityListeners();
      return true;
    } catch (err) {
      console.warn('MediaRecorder start failed:', err);
      return false;
    }
  }

  public markQuestionStart(questionId: string, questionIndex: number, topic: string, questionText: string) {
    const elapsedSeconds = Math.floor((Date.now() - this.startTimeMs) / 1000);
    this.currentQuestionMarker = {
      questionId,
      questionIndex,
      questionTopic: topic,
      questionText,
      timestampStartSeconds: Math.max(0, elapsedSeconds),
    };
  }

  public markQuestionEnd(candidateAnswerText: string) {
    if (!this.currentQuestionMarker) return;
    const elapsedSeconds = Math.floor((Date.now() - this.startTimeMs) / 1000);
    const completedMarker: QuestionTimestampMarker = {
      questionId: this.currentQuestionMarker.questionId || `q_${Date.now()}`,
      questionIndex: this.currentQuestionMarker.questionIndex || 0,
      questionTopic: this.currentQuestionMarker.questionTopic || 'General',
      questionText: this.currentQuestionMarker.questionText || '',
      candidateAnswerText,
      timestampStartSeconds: this.currentQuestionMarker.timestampStartSeconds || 0,
      timestampEndSeconds: elapsedSeconds,
    };
    this.timestampMarkers.push(completedMarker);
    this.currentQuestionMarker = null;
  }

  public stopRecording(): Promise<VideoRecordingData> {
    return new Promise((resolve) => {
      this.removeIntegrityListeners();

      const durationSeconds = Math.floor((Date.now() - this.startTimeMs) / 1000);

      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.onstop = () => {
          const mimeType = this.mediaRecorder?.mimeType || 'video/webm';
          const blob = new Blob(this.recordedChunks, { type: mimeType });
          const recordingUrl = URL.createObjectURL(blob);

          console.log(`MediaRecorder stopped. Final Blob size: ${blob.size} bytes, type: ${mimeType}`);
          if (blob.size === 0) {
            console.warn('WARNING: Recorded media blob is empty (0 bytes).');
          }

          resolve({
            recordingUrl,
            blob,
            durationSeconds,
            mimeType,
            timestampMarkers: [...this.timestampMarkers],
            hasAudio: true,
            hasVideo: true,
          });
        };
        this.mediaRecorder.stop();
      } else {
        resolve({
          recordingUrl: undefined,
          durationSeconds,
          mimeType: 'video/webm',
          timestampMarkers: [...this.timestampMarkers],
          hasAudio: true,
          hasVideo: true,
        });
      }
    });
  }

  public logIntegritySignal(
    type: IntegritySignal['type'],
    description: string,
    severity: IntegritySignal['severity'] = 'low'
  ) {
    const elapsedSeconds = Math.floor((Date.now() - this.startTimeMs) / 1000);
    const signal: IntegritySignal = {
      id: `sig_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString(),
      timestampSeconds: Math.max(0, elapsedSeconds),
      type,
      description,
      severity,
    };
    this.integritySignals.push(signal);
    if (this.onIntegrityEventCallback) {
      this.onIntegrityEventCallback(signal);
    }
  }

  public getIntegritySignals(): IntegritySignal[] {
    return [...this.integritySignals];
  }

  private handleVisibilityChange = () => {
    if (document.hidden) {
      this.logIntegritySignal('tab_hidden', 'Candidate switched away from interview browser tab', 'medium');
    }
  };

  private handleWindowBlur = () => {
    this.logIntegritySignal('window_blur', 'Interview window lost focus', 'low');
  };

  private setupIntegrityListeners() {
    window.addEventListener('visibilitychange', this.handleVisibilityChange);
    window.addEventListener('blur', this.handleWindowBlur);

    // Track disconnection
    if (this.stream) {
      this.stream.getVideoTracks().forEach((track) => {
        track.onended = () => {
          this.logIntegritySignal('camera_disconnected', 'Video stream track disconnected or turned off', 'high');
        };
      });
      this.stream.getAudioTracks().forEach((track) => {
        track.onended = () => {
          this.logIntegritySignal('mic_disconnected', 'Audio microphone track disconnected or muted', 'high');
        };
      });
    }
  }

  private removeIntegrityListeners() {
    window.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('blur', this.handleWindowBlur);
  }
}

/**
 * Text-to-Speech Utterance helper
 */
export function playQuestionAudioTTS(
  text: string,
  onEnd?: () => void,
  onStart?: () => void,
  onError?: () => void
) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    
    if (onStart) utterance.onstart = onStart;
    if (onEnd) utterance.onend = onEnd;
    if (onError) utterance.onerror = onError;
    
    window.speechSynthesis.speak(utterance);
  } else {
    if (onEnd) onEnd();
  }
}

export function stopQuestionAudioTTS() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
