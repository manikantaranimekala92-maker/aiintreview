/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, InterviewSession, JobDescription, InterviewMode, DifficultyLevel } from './types';
import { MOCK_USERS, MOCK_JOBS, MOCK_SESSIONS } from './mock/initialData';
import { authService } from './services/authService';
import { firestoreService } from './services/firestoreService';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './components/LoginPage';
import { CandidateDashboard } from './components/CandidateDashboard';
import { MyInterviewsView } from './components/MyInterviewsView';
import { PerformanceView } from './components/PerformanceView';
import { CandidateLearningPortal } from './components/CandidateLearningPortal';
import { CandidateProfileView } from './components/CandidateProfileView';
import { CandidateSettingsView } from './components/CandidateSettingsView';
import { ResumeAnalyzer } from './components/ResumeAnalyzer';
import { VoiceAssistant } from './components/VoiceAssistant';
import { InterviewSessionComponent } from './components/InterviewSession';
import { CandidateInterviewReport } from './components/interview/CandidateInterviewReport';
import { LearningRoadmap } from './components/LearningRoadmap';
import { AdaptiveGuidedPlanView } from './components/AdaptiveGuidedPlanView';

export default function App() {
  const [users] = useState<User[]>(MOCK_USERS);
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('login');
  const [tabHistory, setTabHistory] = useState<string[]>([]);

  // Dark & Light Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const navigateToTab = (nextTab: string) => {
    if (nextTab === activeTab) return;
    setTabHistory((prev) => [...prev, activeTab]);
    setActiveTab(nextTab);
  };

  const handleGoBack = () => {
    if (tabHistory.length > 0) {
      const previousTab = tabHistory[tabHistory.length - 1];
      setTabHistory((prev) => prev.slice(0, prev.length - 1));
      setActiveTab(previousTab);
    } else {
      setActiveTab('dashboard');
    }
  };

  const getTabLabel = (tab: string): string => {
    switch (tab) {
      case 'dashboard':
        return 'Dashboard';
      case 'guidedplan':
      case 'guided_plan':
      case 'skillgaps':
      case 'skill_gaps':
        return 'Guided Plan';
      case 'interviews':
        return 'My Interviews';
      case 'session':
        return 'Live Session';
      case 'performance':
        return 'Analytics';
      case 'learning':
      case 'recommendations':
      case 'roadmap':
        return 'Learning Hub';
      case 'resume':
        return 'Resume Analyzer';
      case 'profile':
        return 'Profile';
      case 'settings':
        return 'Settings';
      case 'evaluation':
        return 'Interview Report';
      default:
        return 'Home';
    }
  };

  // Restore stored active session on page refresh
  useEffect(() => {
    const session = authService.getStoredSession();
    if (session && session.user) {
      setCurrentUser(session.user);
      setIsAuthenticated(true);
      setActiveTab('dashboard');
    }
  }, []);

  // Application Data States
  const [jobs, setJobs] = useState<JobDescription[]>(MOCK_JOBS);
  const [sessions, setSessions] = useState<InterviewSession[]>(MOCK_SESSIONS);
  const [selectedSession, setSelectedSession] = useState<InterviewSession | null>(null);
  const [selectedLearningSkill, setSelectedLearningSkill] = useState<string>('System Design');

  // Firestore real-time session subscription
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const unsubscribe = firestoreService.subscribeCandidateSessions(
        currentUser.id,
        currentUser.email,
        (firestoreSessions) => {
          if (firestoreSessions && firestoreSessions.length > 0) {
            setSessions((prev) => {
              const prevMap = new Map(prev.map((s) => [s.id, s]));
              firestoreSessions.forEach((fs) => prevMap.set(fs.id, fs));
              return Array.from(prevMap.values());
            });
          }
        }
      );
      return () => unsubscribe();
    }
  }, [isAuthenticated, currentUser]);

  // Live Interview Setup Configuration
  const [liveInterviewConfig, setLiveInterviewConfig] = useState<{
    jobTitle: string;
    mode: InterviewMode;
    difficulty: DifficultyLevel;
    skills?: string[];
  }>({
    jobTitle: 'Software Engineer',
    mode: 'voice',
    difficulty: 'medium',
  });

  const handleSuccessLogin = (user: User, _token: string) => {
    const candidateUser = { ...user, role: 'candidate' as const };
    setCurrentUser(candidateUser);
    setIsAuthenticated(true);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setActiveTab('login');
  };

  const handleStartInterview = (
    jobTitle: string,
    mode: InterviewMode,
    difficulty: DifficultyLevel,
    skills?: string[]
  ) => {
    setLiveInterviewConfig({ jobTitle, mode, difficulty, skills });
    navigateToTab('session');
  };

  const handleCompleteInterview = (newSession: InterviewSession) => {
    const candidateSession = {
      ...newSession,
      candidateId: currentUser.id,
      candidateEmail: currentUser.email,
      candidateName: currentUser.name,
    };
    setSessions((prev) => [candidateSession, ...prev]);
    setSelectedSession(candidateSession);
    setActiveTab('evaluation');
    // Save to Firestore
    firestoreService.saveInterviewSession(candidateSession).catch((e) => console.warn(e));
  };

  const handleViewSession = (session: InterviewSession) => {
    setSelectedSession(session);
    setActiveTab('evaluation');
  };

  // Render Login Page if not authenticated or active tab is 'login'
  if (!isAuthenticated || activeTab === 'login') {
    return (
      <LoginPage
        onSuccessLogin={handleSuccessLogin}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />
    );
  }

  // Filter sessions strictly owned by the current candidate
  const candidateSessions = sessions.filter(
    (s) =>
      s.candidateEmail?.toLowerCase() === currentUser.email.toLowerCase() ||
      s.candidateId === currentUser.id ||
      !s.candidateEmail
  );

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#090d16] text-[#111827] dark:text-[#f9fafb] selection:bg-slate-900 selection:text-white flex flex-col lg:flex-row transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={(tab) => navigateToTab(tab)}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        onLogout={handleLogout}
        onBack={handleGoBack}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto min-h-screen relative bg-[#fafafa] dark:bg-[#090d16] transition-colors duration-200">
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'dashboard' && (
            <CandidateDashboard
              currentUser={currentUser}
              sessions={candidateSessions}
              jobs={jobs}
              onStartInterview={handleStartInterview}
              onViewSession={handleViewSession}
              onOpenSkillGaps={() => navigateToTab('guidedplan')}
              onOpenLearning={() => navigateToTab('guidedplan')}
              onOpenHistory={() => navigateToTab('interviews')}
              onNavigateTab={(tab) => navigateToTab(tab)}
            />
          )}

          {(activeTab === 'guidedplan' || activeTab === 'guided_plan' || activeTab === 'skillgaps' || activeTab === 'skill_gaps') && (
            <AdaptiveGuidedPlanView
              currentUser={currentUser}
              sessions={candidateSessions}
              onStartInterview={(role, mode, diff, skills) =>
                handleStartInterview(role || 'Software Engineer', mode || 'voice', diff || 'medium', skills)
              }
              onOpenSkillGaps={() => navigateToTab('guidedplan')}
              onOpenLearning={() => navigateToTab('learning')}
              onOpenHistory={() => navigateToTab('interviews')}
            />
          )}

          {activeTab === 'interviews' && (
            <MyInterviewsView
              sessions={candidateSessions}
              onViewSession={handleViewSession}
              onStartNewInterview={(role, mode, diff) =>
                handleStartInterview(role || 'Software Engineer', mode || 'voice', diff || 'medium')
              }
              onDeleteSession={(sessionId) => {
                setSessions((prev) => prev.filter((s) => s.id !== sessionId));
                firestoreService.deleteInterviewSession(sessionId).catch((e) => console.warn(e));
              }}
              onDeleteMediaOnly={(sessionId) => {
                setSessions((prev) =>
                  prev.map((s) =>
                    s.id === sessionId
                      ? {
                          ...s,
                          recordingUrl: undefined,
                          evaluations: s.evaluations.map((e) => ({
                            ...e,
                            voiceAudioUrl: undefined,
                            userVideoFrame: undefined,
                          })),
                        }
                      : s
                  )
                );
              }}
              onClearAllSessions={() => setSessions([])}
            />
          )}

          {activeTab === 'session' && (
            <InterviewSessionComponent
              currentUser={currentUser}
              jobTitle={liveInterviewConfig.jobTitle}
              mode={liveInterviewConfig.mode}
              initialDifficulty={liveInterviewConfig.difficulty}
              initialSkills={liveInterviewConfig.skills}
              onCompleteSession={handleCompleteInterview}
              onCancel={() => setActiveTab('dashboard')}
            />
          )}

          {activeTab === 'performance' && (
            <PerformanceView
              sessions={candidateSessions}
              onStartNewInterview={() => handleStartInterview('Software Engineer', 'video', 'medium')}
            />
          )}

          {(activeTab === 'learning' || activeTab === 'recommendations' || activeTab === 'roadmap') && (
            <CandidateLearningPortal
              selectedSkillName={selectedLearningSkill}
              onStartPractice={(topic) =>
                handleStartInterview('Software Engineer', 'voice', 'hard', [topic])
              }
            />
          )}

          {activeTab === 'resume' && (
            <ResumeAnalyzer
              jobs={jobs}
              onStartCustomInterview={handleStartInterview}
            />
          )}

          {activeTab === 'profile' && (
            <CandidateProfileView
              currentUser={currentUser}
              sessions={candidateSessions}
              onUpdateUser={(updated) => {
                setCurrentUser(updated);
                authService.updateStoredUser(updated);
              }}
              onOpenResumeScanner={() => navigateToTab('resume')}
              onStartInterview={() => handleStartInterview('Software Engineer', 'voice', 'medium')}
              onLogout={handleLogout}
            />
          )}

          {activeTab === 'settings' && (
            <CandidateSettingsView
              isDarkMode={isDarkMode}
              onToggleDarkMode={toggleDarkMode}
            />
          )}

          {activeTab === 'evaluation' && selectedSession && (
            <CandidateInterviewReport
              session={selectedSession}
              onBackToDashboard={() => handleGoBack()}
              onOpenRoadmap={() => navigateToTab('learning')}
            />
          )}
        </main>

        {/* Minimal Footer */}
        <footer className="border-t border-[#e5e7eb] dark:border-[#1f2937] bg-[#ffffff] dark:bg-[#111827] text-[11px] text-[#6b7280] dark:text-[#9ca3af] py-3 px-4 sm:px-8 flex flex-wrap items-center justify-between font-mono gap-2 mt-auto transition-colors duration-200">
          <div className="flex items-center space-x-2 text-[#111827] dark:text-[#f9fafb] font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>AI CAREER COACH ENGINE: ONLINE</span>
          </div>
          <div className="text-[#9ca3af] dark:text-[#6b7280] text-[10px]">
            AI Career Coach &copy; {new Date().getFullYear()} &bull; Candidate Edition
          </div>
        </footer>
      </div>
    </div>
  );
}
