import React, { useState, useEffect } from 'react';
import {
  Question,
  QuestionEvaluation,
  InterviewSession,
  InterviewMode,
  DifficultyLevel,
  User,
  IntegritySignal,
} from '../types';
import { generateQuestionsApi, saveInterviewSessionApi, uploadInterviewRecordingApi } from '../services/api';
import { InterviewSetup } from './interview/InterviewSetup';
import { DeviceSystemCheck } from './interview/DeviceSystemCheck';
import { InterviewLobby } from './interview/InterviewLobby';
import { LiveInterviewRoom } from './interview/LiveInterviewRoom';
import { InterviewProcessing } from './interview/InterviewProcessing';
import { CandidateInterviewReport } from './interview/CandidateInterviewReport';
import { Loader2 } from 'lucide-react';

interface InterviewSessionProps {
  currentUser: User;
  jobTitle: string;
  mode: InterviewMode;
  initialDifficulty: DifficultyLevel;
  initialSkills?: string[];
  onCompleteSession: (session: InterviewSession) => void;
  onCancel: () => void;
}

export type LiveFlowStep =
  | 'setup'
  | 'system_check'
  | 'lobby'
  | 'live_room'
  | 'processing'
  | 'candidate_report';

export const InterviewSessionComponent: React.FC<InterviewSessionProps> = ({
  currentUser,
  jobTitle,
  mode,
  initialDifficulty,
  initialSkills = ['Python', 'System Architecture', 'SQL', 'Machine Learning'],
  onCompleteSession,
  onCancel,
}) => {
  const [step, setStep] = useState<LiveFlowStep>('setup');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState<boolean>(true);
  const [activeMediaStream, setActiveMediaStream] = useState<MediaStream | null>(null);

  // Completed Session Data
  const [completedSession, setCompletedSession] = useState<InterviewSession | null>(null);

  // Stop media stream tracks when component unmounts or activeMediaStream is reset
  useEffect(() => {
    return () => {
      if (activeMediaStream) {
        activeMediaStream.getTracks().forEach((track) => {
          try {
            track.stop();
          } catch (e) {}
        });
      }
    };
  }, [activeMediaStream]);

  const handleCancelSession = () => {
    if (activeMediaStream) {
      activeMediaStream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {}
      });
      setActiveMediaStream(null);
    }
    onCancel();
  };

  // Load Initial Adaptive Questions
  useEffect(() => {
    async function initQuestions() {
      setIsLoadingQuestions(true);
      try {
        const generated = await generateQuestionsApi(
          jobTitle,
          5,
          initialSkills,
          initialDifficulty
        );
        setQuestions(generated);
      } catch (e) {
        console.error('Error loading questions:', e);
      } finally {
        setIsLoadingQuestions(false);
      }
    }
    initQuestions();
  }, [jobTitle, initialDifficulty]);

  // Handle Session Completion after Live Room
  const handleLiveRoomFinish = (
    evaluations: QuestionEvaluation[],
    recordingData: any,
    integritySignals: IntegritySignal[],
    totalDurationSeconds: number,
    sessionScores?: any
  ) => {
    // Calculate aggregate scores
    const totalEvals = evaluations.length || 1;
    const avgOverall = sessionScores?.overallScore ?? Math.round(
      evaluations.reduce((acc, curr) => acc + curr.overallScore, 0) / totalEvals
    );
    const avgTech = sessionScores?.technicalScore ?? Math.round(
      evaluations.reduce((acc, curr) => acc + curr.technicalDepthScore, 0) / totalEvals
    );
    const avgComm = sessionScores?.communicationScore ?? Math.round(
      evaluations.reduce((acc, curr) => acc + curr.communicationScore, 0) / totalEvals
    );
    const avgConf = sessionScores?.confidenceScore ?? Math.round(
      evaluations.reduce((acc, curr) => acc + curr.confidenceScore, 0) / totalEvals
    );

    const bottleneckScore = Math.max(10, 100 - avgTech);

    let hiringRec = sessionScores?.hiringRecommendation || 'Hire';

    const sessionId = `sess_live_${Date.now()}`;

    if (recordingData?.blob && recordingData.blob.size > 0) {
      uploadInterviewRecordingApi(sessionId, recordingData.blob, `${sessionId}.webm`)
        .then((res) => {
          console.log('Recording upload response:', res);
        })
        .catch((err) => {
          console.warn('Recording upload exception:', err);
        });
    }

    const session: InterviewSession = {
      id: sessionId,
      candidateId: currentUser.id,
      candidateName: currentUser.name,
      candidateEmail: currentUser.email,
      jobRoleId: 'job_1',
      jobTitle,
      mode,
      status: 'completed',
      date: new Date().toISOString().split('T')[0],
      durationMinutes: Math.max(1, Math.round(totalDurationSeconds / 60)),
      questions,
      evaluations,
      overallScore: avgOverall,
      technicalScore: avgTech,
      codingScore: sessionScores?.codingScore ?? Math.min(100, avgTech + 2),
      communicationScore: avgComm,
      problemSolvingScore: sessionScores?.problemSolvingScore ?? Math.round((avgTech + avgOverall) / 2),
      behavioralScore: sessionScores?.behavioralScore ?? Math.round((avgComm + avgConf) / 2),
      confidenceScore: avgConf,
      bottleneckScore,
      hiringRecommendation: hiringRec,
      executiveSummary: sessionScores?.executiveSummary || `Candidate completed a live video AI interview for ${jobTitle}. Overall score of ${avgOverall}%.`,
      keyStrengths: sessionScores?.keyStrengths || [
        'Clear concept articulation under live recording',
        'Strong alignment with required technical keywords',
      ],
      criticalGaps: sessionScores?.criticalGaps || ['Elaborate further on hardware metrics and memory bounds'],
      aiCoachInsights: sessionScores?.aiCoachInsights,
      learningRoadmap: [
        {
          id: 'res_1',
          topic: 'System Design',
          title: 'Distributed Systems & Latency Bottlenecks',
          type: 'article',
          url: 'https://example.com',
          estimatedMinutes: 30,
        },
      ],
      recordingData,
      integritySignals,
    };

    setCompletedSession(session);
    saveInterviewSessionApi(session);
    setStep('processing');
  };

  if (isLoadingQuestions) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-400">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-xs font-semibold">Generating Adaptive Interview Questions...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Step 1: Setup Page */}
      {step === 'setup' && (
        <InterviewSetup
          jobTitle={jobTitle}
          mode={mode}
          difficulty={initialDifficulty}
          skills={initialSkills}
          onProceedToSystemCheck={() => setStep('system_check')}
          onCancel={handleCancelSession}
        />
      )}

      {/* Step 2: Device & System Check */}
      {step === 'system_check' && (
        <DeviceSystemCheck
          onProceedToLobby={(stream) => {
            setActiveMediaStream(stream);
            setStep('lobby');
          }}
          onBackToSetup={() => setStep('setup')}
        />
      )}

      {/* Step 3: Interview Lobby */}
      {step === 'lobby' && activeMediaStream && (
        <InterviewLobby
          currentUser={currentUser}
          jobTitle={jobTitle}
          mediaStream={activeMediaStream}
          onStartInterview={() => setStep('live_room')}
          onBackToSystemCheck={() => setStep('system_check')}
        />
      )}

      {/* Step 4: Active Live Video Room */}
      {step === 'live_room' && activeMediaStream && (
        <LiveInterviewRoom
          currentUser={currentUser}
          jobTitle={jobTitle}
          initialQuestions={questions}
          initialDifficulty={initialDifficulty}
          mediaStream={activeMediaStream}
          onFinishSession={handleLiveRoomFinish}
        />
      )}

      {/* Step 5: Processing Screen */}
      {step === 'processing' && (
        <InterviewProcessing
          onProcessingComplete={() => {
            if (completedSession) {
              onCompleteSession(completedSession);
              setStep('candidate_report');
            }
          }}
        />
      )}

      {/* Step 6: Candidate Report */}
      {step === 'candidate_report' && completedSession && (
        <CandidateInterviewReport
          session={completedSession}
          onBackToDashboard={handleCancelSession}
        />
      )}
    </div>
  );
};
