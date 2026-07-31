import React, { useState } from 'react';
import { User } from '../types';
import { SkillAuraLogo } from './SkillAuraLogo';
import {
  BrainCircuit,
  FileCode2,
  Moon,
  Sun,
  ChevronDown,
  LogOut,
  User as UserIcon,
  Settings as SettingsIcon,
  LayoutDashboard,
  Video,
  PlayCircle,
  TrendingUp,
  Target,
  BookOpen,
  Mic,
  ArrowLeft,
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onLogout?: () => void;
  onBack?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  isDarkMode,
  toggleDarkMode,
  onLogout,
  onBack,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'guidedplan', label: 'Guided Plan', icon: Target },
    { id: 'interviews', label: 'My Interviews', icon: Video },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'learning', label: 'Learning', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E5E7EB] dark:border-[#1F2937] bg-[#FFFFFF] dark:bg-[#111827] transition-colors shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & System Title with Left Back Arrow */}
        <div className="flex items-center space-x-3 shrink-0">
          {activeTab !== 'dashboard' && onBack && (
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-full bg-[#FAFAFA] dark:bg-slate-800 text-[#111827] dark:text-white border border-[#E5E7EB] dark:border-slate-700 hover:bg-[#F3F4F6] dark:hover:bg-slate-700 flex items-center justify-center transition-all shrink-0 cursor-pointer"
              title="Go Back"
              aria-label="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center cursor-pointer shrink-0" onClick={() => setActiveTab('dashboard')}>
            <SkillAuraLogo size="md" />
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center space-x-1 bg-[#FAFAFA] dark:bg-slate-800/60 p-1 rounded-xl border border-[#E5E7EB] dark:border-slate-700">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#F3F4F6] dark:bg-slate-700 text-[#111827] dark:text-white font-bold border border-[#E5E7EB] dark:border-slate-600'
                    : 'text-[#6B7280] dark:text-slate-400 hover:text-[#111827] dark:hover:text-white hover:bg-[#F3F4F6] dark:hover:bg-slate-700/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Action Controls & Candidate Profile Menu */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Theme Mode Toggle Button */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-[#FAFAFA] dark:bg-slate-800 text-[#111827] dark:text-amber-400 hover:bg-[#F3F4F6] dark:hover:bg-slate-700 transition-all cursor-pointer flex items-center justify-center"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#374151]" />}
          </button>

          {/* User Profile Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center space-x-2 p-1.5 rounded-xl border border-[#E5E7EB] dark:border-slate-700 hover:bg-[#FAFAFA] dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-lg object-cover ring-1 ring-[#E5E7EB] dark:ring-slate-700"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-[#111827] dark:bg-slate-700 text-white font-bold text-xs flex items-center justify-center font-mono">
                  {currentUser.name ? currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'C'}
                </div>
              )}
              <div className="text-left hidden md:block">
                <p className="text-xs font-semibold text-[#111827] dark:text-white leading-tight">
                  {currentUser.name}
                </p>
                <span className="text-[10px] text-[#6B7280] dark:text-slate-400 font-medium">Candidate</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#6B7280] dark:text-slate-400" />
            </button>

            {/* User Dropdown Menu */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-[#FFFFFF] dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-xl shadow-lg py-2 z-50 animate-fade-in">
                <div className="px-3 py-2 border-b border-[#E5E7EB] dark:border-slate-800">
                  <p className="text-xs font-semibold text-[#111827] dark:text-white">{currentUser.name}</p>
                  <p className="text-[11px] text-[#6B7280] dark:text-slate-400 truncate">{currentUser.email}</p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setShowUserDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center space-x-2 text-xs font-medium text-[#374151] dark:text-slate-200 hover:bg-[#FAFAFA] dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                      activeTab === 'profile' ? 'bg-[#F3F4F6] dark:bg-slate-800 text-[#111827] dark:text-white font-semibold' : ''
                    }`}
                  >
                    <UserIcon className="w-4 h-4 text-[#6B7280] dark:text-slate-400" />
                    <span>Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setShowUserDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center space-x-2 text-xs font-medium text-[#374151] dark:text-slate-200 hover:bg-[#FAFAFA] dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                      activeTab === 'settings' ? 'bg-[#F3F4F6] dark:bg-slate-800 text-[#111827] dark:text-white font-semibold' : ''
                    }`}
                  >
                    <SettingsIcon className="w-4 h-4 text-[#6B7280] dark:text-slate-400" />
                    <span>Settings</span>
                  </button>
                </div>

                {onLogout && (
                  <div className="pt-1 border-t border-[#E5E7EB] dark:border-slate-800 mt-1">
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-2 flex items-center space-x-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden flex items-center overflow-x-auto px-4 py-2 border-t border-[#E5E7EB] dark:border-slate-800 bg-[#FFFFFF] dark:bg-slate-900 space-x-2 text-xs scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#F3F4F6] text-[#111827] font-bold border border-[#E5E7EB]'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
