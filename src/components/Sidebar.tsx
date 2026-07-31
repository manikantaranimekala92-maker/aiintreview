import React, { useState } from 'react';
import { User } from '../types';
import { SkillAuraLogo } from './SkillAuraLogo';
import {
  LayoutDashboard,
  Compass,
  PlayCircle,
  TrendingUp,
  BookOpen,
  User as UserIcon,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ArrowLeft,
  Sun,
  Moon,
} from 'lucide-react';

interface SidebarProps {
  currentUser: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
  onLogout: () => void;
  onBack?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  isDarkMode,
  toggleDarkMode,
  onLogout,
  onBack,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'guidedplan', label: 'Guided Plan', icon: Compass },
    { id: 'interviews', label: 'My Interviews', icon: PlayCircle },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'learning', label: 'Learning', icon: BookOpen },
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Top Header */}
      <header className="lg:hidden sticky top-0 z-40 w-full bg-white dark:bg-slate-900 border-b border-[#E5E7EB] dark:border-slate-800 px-4 py-3 flex items-center justify-between transition-colors">
        <div className="flex items-center space-x-2">
          {activeTab !== 'dashboard' && onBack && (
            <button
              onClick={onBack}
              className="w-8 h-8 rounded-full bg-[#111827] dark:bg-slate-800 text-white flex items-center justify-center hover:bg-[#1f2937] dark:hover:bg-slate-700 transition-all shrink-0 mr-1"
              title="Go Back"
              aria-label="Go Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center cursor-pointer"
          >
            <SkillAuraLogo size="sm" />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {toggleDarkMode && (
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-[#374151] dark:text-amber-400 hover:bg-[#F3F4F6] dark:hover:bg-slate-800 transition-colors"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-[#374151] dark:text-slate-200 hover:bg-[#F3F4F6] dark:hover:bg-slate-800 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-xs z-50"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-72 max-w-[80vw] h-full bg-white dark:bg-slate-900 border-r border-[#E5E7EB] dark:border-slate-800 p-5 flex flex-col justify-between shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB] dark:border-slate-800">
                <SkillAuraLogo size="sm" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-[#6B7280] dark:text-slate-400 hover:text-[#111827] dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="mt-6 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-[#F3F4F6] dark:bg-slate-800 text-[#111827] dark:text-white font-bold'
                          : 'text-[#374151] dark:text-slate-300 hover:bg-[#F9FAFB] dark:hover:bg-slate-800/60 hover:text-[#111827] dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-4 h-4 text-[#4B5563] dark:text-slate-400" />
                        <span>{item.label}</span>
                      </div>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#111827] dark:text-white" />}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-[#E5E7EB] dark:border-slate-800 space-y-3">
              {toggleDarkMode && (
                <button
                  onClick={toggleDarkMode}
                  className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl border border-[#E5E7EB] dark:border-slate-800 bg-[#FAFAFA] dark:bg-slate-800 text-xs font-semibold text-[#111827] dark:text-slate-200 hover:bg-[#F3F4F6] dark:hover:bg-slate-700/60 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
                    <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono text-[#6B7280] dark:text-slate-400">{isDarkMode ? 'Active' : 'Inactive'}</span>
                </button>
              )}

              <div className="flex items-center space-x-3 px-2">
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-9 h-9 rounded-xl object-cover ring-1 ring-[#E5E7EB] dark:ring-slate-700"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-[#111827] dark:bg-slate-800 text-white font-bold text-xs flex items-center justify-center font-mono shrink-0">
                    {currentUser.name ? currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'C'}
                  </div>
                )}
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-[#111827] dark:text-white truncate">{currentUser.name}</p>
                  <p className="text-[11px] text-[#6B7280] dark:text-slate-400 truncate">{currentUser.email}</p>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-rose-400 hover:bg-red-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar Navigation */}
      <aside className="hidden lg:flex flex-col justify-between w-64 shrink-0 bg-[#FFFFFF] dark:bg-[#0B0F17] border-r border-[#E5E7EB] dark:border-[#1F2937] min-h-screen p-5 sticky top-0 h-screen overflow-y-auto transition-colors duration-200">
        <div className="space-y-6">
          {/* Brand Identity */}
          <div className="flex items-center space-x-2.5 px-1 py-1">
            {activeTab !== 'dashboard' && onBack && (
              <button
                onClick={onBack}
                className="w-8 h-8 rounded-full bg-[#111827] dark:bg-slate-800 text-white flex items-center justify-center hover:bg-[#1f2937] dark:hover:bg-slate-700 transition-all shrink-0 cursor-pointer"
                title="Go Back"
                aria-label="Go Back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center cursor-pointer group"
            >
              <SkillAuraLogo size="md" />
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#F3F4F6] dark:bg-slate-800 text-[#111827] dark:text-white font-bold'
                      : 'text-[#374151] dark:text-slate-300 hover:bg-[#F9FAFB] dark:hover:bg-slate-800/60 hover:text-[#111827] dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4 text-[#4B5563] dark:text-slate-400" />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#111827] dark:text-white" />}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-[#E5E7EB] dark:border-[#1F2937] space-y-3">
          {/* Dark / Light Mode Desktop Toggle */}
          {toggleDarkMode && (
            <button
              onClick={toggleDarkMode}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#FAFAFA] dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 text-xs font-semibold text-[#111827] dark:text-slate-200 hover:bg-[#F3F4F6] dark:hover:bg-slate-800/80 transition-all cursor-pointer"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <div className="flex items-center space-x-2.5">
                {isDarkMode ? (
                  <Sun className="w-4 h-4 text-amber-400 animate-pulse" />
                ) : (
                  <Moon className="w-4 h-4 text-[#374151]" />
                )}
                <span>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
              </div>
              <div className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-200 flex items-center ${isDarkMode ? 'bg-amber-500 justify-end' : 'bg-slate-300 justify-start'}`}>
                <div className="w-3 h-3 rounded-full bg-white shadow-xs"></div>
              </div>
            </button>
          )}

          {/* User Profile Info Card */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FFFFFF] dark:bg-slate-900/60 border border-[#E5E7EB] dark:border-slate-800">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-lg object-cover ring-1 ring-[#E5E7EB] dark:ring-slate-700"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-[#111827] dark:bg-slate-800 text-white font-bold text-xs flex items-center justify-center font-mono shrink-0">
                  {currentUser.name ? currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'C'}
                </div>
              )}
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-[#111827] dark:text-white truncate">{currentUser.name}</p>
                <p className="text-[10px] text-[#6B7280] dark:text-slate-400 font-medium truncate">Candidate</p>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-[#6B7280] dark:text-slate-400 hover:text-red-600 dark:hover:text-rose-400 hover:bg-red-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
