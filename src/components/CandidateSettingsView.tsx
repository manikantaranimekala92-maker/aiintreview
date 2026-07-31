import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Camera,
  Mic,
  CheckCircle2,
  Lock,
  Sun,
  Moon,
  Palette,
} from 'lucide-react';

interface CandidateSettingsViewProps {
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const CandidateSettingsView: React.FC<CandidateSettingsViewProps> = ({
  isDarkMode = false,
  onToggleDarkMode,
}) => {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [practiceReminders, setPracticeReminders] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16 bg-transparent text-[#111827] dark:text-[#f9fafb] transition-colors">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#FFFFFF] dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#1F2937] text-[#111827] dark:text-[#f9fafb] shadow-xs space-y-2 transition-colors">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FAFAFA] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 text-[#111827] dark:text-slate-200 text-xs font-semibold">
          <Settings className="w-3.5 h-3.5" />
          <span>Preferences & Privacy</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Settings</h1>
        <p className="text-xs sm:text-sm text-[#6B7280] dark:text-slate-400 max-w-xl">
          Configure interface theme, device preferences, reminders, and data privacy boundaries.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Settings saved successfully.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#1F2937] space-y-6 shadow-xs transition-colors">
          <h3 className="text-sm font-bold text-[#111827] dark:text-white pb-3 border-b border-[#E5E7EB] dark:border-slate-800 flex items-center space-x-2">
            <Palette className="w-4 h-4 text-[#111827] dark:text-white" />
            <span>Appearance & Theme</span>
          </h3>

          {/* Dark / Light Theme Selection */}
          <div className="p-4 rounded-xl bg-[#FAFAFA] dark:bg-slate-900/80 border border-[#E5E7EB] dark:border-slate-800 space-y-3">
            <span className="text-xs font-bold text-[#111827] dark:text-white block">Theme Mode</span>
            <p className="text-[11px] text-[#6B7280] dark:text-slate-400">
              Select your preferred visual style. Choose Dark mode for reduced eye strain or Light mode for crisp high contrast.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  if (isDarkMode && onToggleDarkMode) onToggleDarkMode();
                }}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                  !isDarkMode
                    ? 'bg-white border-indigo-600 ring-2 ring-indigo-500/20 text-[#111827]'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-200/60">
                    <Sun className="w-4 h-4" />
                  </div>
                  {!isDarkMode && (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600">Active</span>
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold">Light Mode</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Clean canvas & dark text</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!isDarkMode && onToggleDarkMode) onToggleDarkMode();
                }}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                  isDarkMode
                    ? 'bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/20 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="p-2 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800/80">
                    <Moon className="w-4 h-4" />
                  </div>
                  {isDarkMode && (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-400 border border-indigo-800">Active</span>
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold">Dark Mode</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Sleek midnight dark theme</p>
                </div>
              </button>
            </div>
          </div>

          <h3 className="text-sm font-bold text-[#111827] dark:text-white pb-3 border-b border-[#E5E7EB] dark:border-slate-800 flex items-center space-x-2 pt-2">
            <Settings className="w-4 h-4 text-[#111827] dark:text-white" />
            <span>Hardware & Notifications</span>
          </h3>

          {/* Camera & Microphone Checks */}
          <div className="p-4 rounded-xl bg-[#FAFAFA] dark:bg-slate-900/80 border border-[#E5E7EB] dark:border-slate-800 space-y-3">
            <span className="text-xs font-bold text-[#111827] dark:text-white block">Interview Hardware Status</span>
            <p className="text-[11px] text-[#6B7280] dark:text-slate-400">
              Verify your camera and microphone readiness before joining live AI interviews.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-lg bg-[#FFFFFF] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 flex items-center space-x-2 text-xs font-semibold text-[#111827] dark:text-white">
                <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Camera Ready</span>
              </div>
              <div className="p-3 rounded-lg bg-[#FFFFFF] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 flex items-center space-x-2 text-xs font-semibold text-[#111827] dark:text-white">
                <Mic className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Microphone Ready</span>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="p-4 rounded-xl bg-[#FAFAFA] dark:bg-slate-900/80 border border-[#E5E7EB] dark:border-slate-800 space-y-3">
            <span className="text-xs font-bold text-[#111827] dark:text-white block">Notifications</span>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-[#374151] dark:text-slate-300 font-medium">Email evaluation reports</span>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-[#111827] focus:ring-[#111827] bg-[#FFFFFF] dark:bg-slate-800 border-[#E5E7EB] dark:border-slate-700 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-[#374151] dark:text-slate-300 font-medium">Daily practice reminders</span>
              <input
                type="checkbox"
                checked={practiceReminders}
                onChange={(e) => setPracticeReminders(e.target.checked)}
                className="w-4 h-4 rounded text-[#111827] focus:ring-[#111827] bg-[#FFFFFF] dark:bg-slate-800 border-[#E5E7EB] dark:border-slate-700 cursor-pointer"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-[#111827] dark:bg-indigo-600 hover:bg-[#1f2937] dark:hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
          >
            Save Settings
          </button>
        </div>

        {/* Right Column: Privacy */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#1F2937] space-y-4 shadow-xs transition-colors">
            <div className="flex items-center space-x-2 pb-3 border-b border-[#E5E7EB] dark:border-slate-800">
              <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-[#111827] dark:text-white">Candidate Privacy & Security</h3>
            </div>

            <p className="text-xs text-[#6B7280] dark:text-slate-400 leading-relaxed font-medium">
              Your interview recordings, transcripts, scores, and skill evaluations are private to your candidate account.
            </p>

            <div className="space-y-2 pt-2">
              <div className="p-3 rounded-xl bg-[#FAFAFA] dark:bg-slate-900/80 border border-[#E5E7EB] dark:border-slate-800 flex items-start space-x-2.5 text-xs text-[#374151] dark:text-slate-300 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Encrypted candidate session storage</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FAFAFA] dark:bg-slate-900/80 border border-[#E5E7EB] dark:border-slate-800 flex items-start space-x-2.5 text-xs text-[#374151] dark:text-slate-300 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Isolated evaluation environment</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
