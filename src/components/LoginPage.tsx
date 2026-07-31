import React, { useState } from 'react';
import { User } from '../types';
import { LoginForm } from './LoginForm';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { RegisterModal } from './RegisterModal';
import { SkillAuraLogo } from './SkillAuraLogo';
import { Sun, Moon } from 'lucide-react';

interface LoginPageProps {
  onSuccessLogin: (user: User, token: string) => void;
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSuccessLogin,
  isDarkMode = false,
  toggleDarkMode,
}) => {
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState<boolean>(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#090d16] text-[#111827] dark:text-[#f9fafb] flex flex-col justify-between selection:bg-[#111827] selection:text-white transition-colors duration-200">
      {/* Top Header / Branding Bar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between z-20">
        <SkillAuraLogo size="md" />

        {toggleDarkMode && (
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl border border-[#E5E7EB] dark:border-slate-800 bg-[#FAFAFA] dark:bg-slate-900 text-[#111827] dark:text-amber-400 hover:bg-[#F3F4F6] dark:hover:bg-slate-800 transition-all cursor-pointer flex items-center space-x-2 text-xs font-semibold"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-[#374151]" />
                <span className="hidden sm:inline text-slate-600">Dark Mode</span>
              </>
            )}
          </button>
        )}
      </header>

      {/* Main Single Centered Column Layout */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 my-auto flex items-center justify-center">
        <div className="w-full max-w-md">
          <LoginForm
            onSuccessLogin={onSuccessLogin}
            onOpenForgotPassword={() => setIsForgotPasswordOpen(true)}
            onOpenRegister={() => setIsRegisterOpen(true)}
          />
        </div>
      </main>

      {/* Footer System Specs */}
      <footer className="w-full border-t border-[#E5E7EB] dark:border-slate-800/80 bg-[#FFFFFF] dark:bg-[#0B0F17] text-[11px] text-[#6B7280] dark:text-slate-400 py-3 px-4 sm:px-8 flex flex-wrap items-center justify-between font-mono gap-2 transition-colors">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1.5 text-[#111827] dark:text-slate-200 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>SKILLAURA CAREER INTELLIGENCE SYSTEM</span>
          </span>
        </div>
        <div className="text-[10px] text-[#9CA3AF] dark:text-slate-500">
          © 2026 SkillAura Enterprise Systems. All rights reserved.
        </div>
      </footer>

      {/* Modals */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSuccessLogin={(user, token) => {
          setIsRegisterOpen(false);
          onSuccessLogin(user, token);
        }}
      />
    </div>
  );
};
