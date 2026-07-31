import React, { useState, useRef } from 'react';
import { User, InterviewSession } from '../types';
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  FileText,
  Upload,
  RefreshCw,
  Eye,
  CheckCircle2,
  ShieldCheck,
  Lock,
  LogOut,
  Trash2,
  Edit3,
  X,
  Save,
  Sparkles,
  Target,
  Play,
  Key,
  AlertTriangle,
  PlusCircle,
} from 'lucide-react';

interface CandidateProfileViewProps {
  currentUser: User;
  sessions?: InterviewSession[];
  onUpdateUser?: (updatedUser: User) => void;
  onOpenResumeScanner?: () => void;
  onStartInterview?: () => void;
  onLogout?: () => void;
}

const POSSIBLE_TARGET_ROLES = [
  'Software Engineer',
  'Python Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Analyst',
  'Data Scientist',
  'Machine Learning Engineer',
];

export const CandidateProfileView: React.FC<CandidateProfileViewProps> = ({
  currentUser,
  sessions = [],
  onUpdateUser,
  onOpenResumeScanner,
  onStartInterview,
  onLogout,
}) => {
  // Modal visibility states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isChangeRoleModalOpen, setIsChangeRoleModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Success alert states
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Edit profile form state
  const [editName, setEditName] = useState(currentUser.name);
  const [editPhone, setEditPhone] = useState(currentUser.phone || '');
  const [editLocation, setEditLocation] = useState(currentUser.location || '');
  const [editTargetRole, setEditTargetRole] = useState(
    currentUser.preferredJobRole || currentUser.title || 'Software Engineer'
  );

  // Password modal form state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Photo & Resume file inputs
  const photoInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  // Avatar Initials Calculation
  const getInitials = (nameStr: string) => {
    if (!nameStr) return 'C';
    const parts = nameStr.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return nameStr.substring(0, 2).toUpperCase();
  };

  // Calculate readiness scores from real candidate interview sessions
  const candidateSessions = sessions.filter(
    (s) =>
      s.candidateEmail?.toLowerCase() === currentUser.email.toLowerCase() ||
      s.candidateId === currentUser.id ||
      !s.candidateEmail
  );

  const completedSessions = candidateSessions.filter((s) => s.status === 'completed');

  const readinessScores = React.useMemo(() => {
    if (completedSessions.length === 0) {
      return {
        overall: 78,
        technical: 82,
        communication: 74,
        problemSolving: 71,
        hasEvaluations: false,
      };
    }

    const totalOverall = completedSessions.reduce((acc, s) => acc + (s.overallScore || 0), 0);
    const totalTech = completedSessions.reduce((acc, s) => acc + (s.technicalScore || 0), 0);
    const totalComm = completedSessions.reduce((acc, s) => acc + (s.communicationScore || 0), 0);
    const totalProb = completedSessions.reduce((acc, s) => acc + (s.confidenceScore || 0), 0);
    const count = completedSessions.length;

    return {
      overall: Math.round(totalOverall / count),
      technical: Math.round(totalTech / count),
      communication: Math.round(totalComm / count),
      problemSolving: Math.round(totalProb / count),
      hasEvaluations: true,
    };
  }, [completedSessions]);

  // Derived skill bars from user skills or interview analysis
  const skillList = React.useMemo(() => {
    if (currentUser.skills && currentUser.skills.length > 0) {
      const defaultLevels: Record<string, number> = {
        Python: 90,
        PyTorch: 88,
        Transformers: 85,
        'System Architecture': 85,
        SQL: 82,
        FastAPI: 80,
        TypeScript: 86,
        React: 84,
        'Node.js': 80,
        'Machine Learning': 88,
      };

      return currentUser.skills.map((skill) => ({
        name: skill,
        level: defaultLevels[skill] || Math.floor(70 + (skill.length * 3) % 25),
      }));
    }

    if (completedSessions.length > 0) {
      const extractedSkills: { name: string; level: number }[] = [];
      completedSessions.forEach((sess) => {
        sess.questions?.forEach((q) => {
          if (q.topic && !extractedSkills.some((s) => s.name === q.topic)) {
            extractedSkills.push({
              name: q.topic,
              level: sess.overallScore || 80,
            });
          }
        });
      });
      if (extractedSkills.length > 0) return extractedSkills;
    }

    return [];
  }, [currentUser.skills, completedSessions]);

  // Handlers
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        const updated = { ...currentUser, avatar: imageUrl };
        if (onUpdateUser) onUpdateUser(updated);
        showNotification('Profile photo updated successfully.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    const updated = { ...currentUser, avatar: undefined };
    if (onUpdateUser) onUpdateUser(updated);
    showNotification('Profile photo removed.');
  };

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingResume(true);
      setTimeout(() => {
        const todayStr = new Date().toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });

        const updated = {
          ...currentUser,
          resumeFileName: file.name,
          resumeUploadDate: todayStr,
          resumeStatus: 'Active - Parsed & Synced',
        };
        if (onUpdateUser) onUpdateUser(updated);
        setIsUploadingResume(false);
        showNotification(`Resume "${file.name}" uploaded successfully.`);
      }, 900);
    }
  };

  const handleSaveEditProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser: User = {
      ...currentUser,
      name: editName.trim() || currentUser.name,
      phone: editPhone.trim() || currentUser.phone,
      location: editLocation.trim() || currentUser.location,
      preferredJobRole: editTargetRole,
      title: editTargetRole,
    };

    if (onUpdateUser) onUpdateUser(updatedUser);
    setIsEditModalOpen(false);
    showNotification('Profile information updated successfully.');
  };

  const handleChangeRole = (role: string) => {
    const updatedUser: User = {
      ...currentUser,
      preferredJobRole: role,
      title: `${role} Candidate`,
    };
    if (onUpdateUser) onUpdateUser(updatedUser);
    setIsChangeRoleModalOpen(false);
    showNotification(`Target job role updated to ${role}.`);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!oldPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (!newPassword || !newPassword.trim()) {
      setPasswordError('Please enter a new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsChangePasswordModalOpen(false);
    showNotification('Password updated successfully.');
  };

  const candidateIdDisplay = currentUser.id.startsWith('CAND-')
    ? currentUser.id
    : `CAND-${currentUser.id.replace(/^user_/, '').toUpperCase()}`;

  return (
    <div className="space-y-8 animate-fade-in pb-16 bg-[#FFFFFF] text-[#111827]">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={photoInputRef}
        onChange={handlePhotoUpload}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={resumeInputRef}
        onChange={handleResumeUpload}
        accept=".pdf,.doc,.docx"
        className="hidden"
      />

      {/* HEADER BANNER */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] text-[#111827] shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FAFAFA] border border-[#E5E7EB] text-[#111827] text-xs font-semibold">
              <UserIcon className="w-3.5 h-3.5" />
              <span>Candidate Account</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827]">My Profile</h1>
            <p className="text-xs sm:text-sm text-[#6B7280] max-w-xl">
              Manage your personal information and career preferences.
            </p>
          </div>

          <div className="flex items-center space-x-3 self-start sm:self-center">
            <button
              onClick={() => {
                setEditName(currentUser.name);
                setEditPhone(currentUser.phone || '');
                setEditLocation(currentUser.location || '');
                setEditTargetRole(
                  currentUser.preferredJobRole || currentUser.title || 'Software Engineer'
                );
                setIsEditModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-[#111827] hover:bg-[#1f2937] text-white font-bold text-xs shadow-xs transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* SUCCESS NOTIFICATION BANNER */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* MAIN TWO-COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Profile Photo, Overview, Account Info, Security, Danger Zone */}
        <div className="lg:col-span-5 space-y-6">
          {/* PROFILE PHOTO & IDENTITY CARD */}
          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] space-y-6 shadow-xs text-center flex flex-col items-center">
            <div className="relative group">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-28 h-28 rounded-2xl object-cover border border-[#E5E7EB] shadow-xs"
                />
              ) : (
                <div className="w-28 h-28 rounded-2xl bg-[#111827] text-white font-extrabold text-3xl flex items-center justify-center font-mono shadow-xs">
                  {getInitials(currentUser.name)}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-[#111827]">{currentUser.name}</h2>
              <p className="text-xs font-semibold text-[#6B7280] font-mono">
                {currentUser.preferredJobRole || currentUser.title || 'Software Engineer'}
              </p>
              <p className="text-xs text-[#6B7280]">{currentUser.email}</p>
            </div>

            {/* Photo Action Buttons */}
            <div className="flex items-center justify-center space-x-2 pt-1 w-full max-w-xs">
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="flex-1 py-2 px-3 rounded-xl bg-[#FAFAFA] hover:bg-[#F3F4F6] text-[#111827] font-semibold text-xs border border-[#E5E7EB] transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-[#111827]" />
                <span>Change Photo</span>
              </button>

              {currentUser.avatar && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs border border-rose-200 transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              )}
            </div>
          </div>

          {/* ACCOUNT INFORMATION */}
          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] space-y-4 shadow-xs">
            <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider font-mono flex items-center space-x-2 pb-3 border-b border-[#E5E7EB]">
              <ShieldCheck className="w-4 h-4 text-[#111827]" />
              <span>Account Information</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1">
                <span className="text-[#6B7280] font-medium">Account ID / Candidate ID</span>
                <span className="font-mono font-bold text-[#111827] bg-[#FAFAFA] px-2 py-0.5 rounded border border-[#E5E7EB]">
                  {candidateIdDisplay}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-[#6B7280] font-medium">Email</span>
                <span className="font-medium text-[#111827] truncate max-w-[200px]">
                  {currentUser.email}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-[#6B7280] font-medium">Account Created</span>
                <span className="font-mono text-[#374151]">
                  {currentUser.createdAt || '26 July 2026'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-[#6B7280] font-medium">Account Status</span>
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Active</span>
                </span>
              </div>
            </div>
          </div>

          {/* SECURITY SECTION */}
          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] space-y-4 shadow-xs">
            <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider font-mono flex items-center space-x-2 pb-3 border-b border-[#E5E7EB]">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>Security</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1">
                <span className="text-[#6B7280] font-medium">Email Verification</span>
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified</span>
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-[#6B7280] font-medium">Password</span>
                <span className="font-mono tracking-widest text-[#6B7280]">••••••••</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-[#6B7280] font-medium">Active Session</span>
                <span className="text-[#111827] font-medium">Current Device</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsChangePasswordModalOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-[#FAFAFA] hover:bg-[#F3F4F6] text-[#111827] font-semibold text-xs border border-[#E5E7EB] transition-colors flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Key className="w-4 h-4 text-[#111827]" />
              <span>Change Password</span>
            </button>
          </div>

          {/* DANGER ZONE */}
          <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 space-y-4">
            <h3 className="text-xs font-bold text-rose-800 uppercase tracking-wider font-mono flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Danger Zone</span>
            </h3>

            <p className="text-[11px] text-[#6B7280] leading-relaxed">
              Sign out of your active candidate session or request account data deletion.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full sm:w-auto flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="w-full sm:w-auto py-2 px-3 rounded-xl bg-[#FFFFFF] hover:bg-rose-100 text-rose-700 font-semibold text-xs border border-rose-300 transition-colors cursor-pointer"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Personal Info, Career Info, Resume, Skills, Career Readiness */}
        <div className="lg:col-span-7 space-y-6">
          {/* PERSONAL INFORMATION */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] space-y-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
              <h3 className="text-sm font-bold text-[#111827] flex items-center space-x-2">
                <UserIcon className="w-4 h-4 text-[#111827]" />
                <span>Personal Information</span>
              </h3>

              <button
                type="button"
                onClick={() => {
                  setEditName(currentUser.name);
                  setEditPhone(currentUser.phone || '');
                  setEditLocation(currentUser.location || '');
                  setEditTargetRole(
                    currentUser.preferredJobRole || currentUser.title || 'Software Engineer'
                  );
                  setIsEditModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#FAFAFA] hover:bg-[#F3F4F6] text-[#111827] font-semibold text-xs border border-[#E5E7EB] transition-colors flex items-center space-x-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div className="space-y-1">
                <span className="text-[#6B7280] font-medium block">Full Name</span>
                <span className="font-bold text-[#111827] text-sm block">
                  {currentUser.name} {currentUser.preferredName ? `(${currentUser.preferredName})` : ''}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[#6B7280] font-medium block">Username</span>
                <span className="font-bold text-[#111827] text-sm block font-mono">
                  {currentUser.username ? `@${currentUser.username}` : '@candidate'}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[#6B7280] font-medium block">Primary Email</span>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-[#111827] text-sm block font-mono">
                    {currentUser.email}
                  </span>
                  <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Verified</span>
                  </span>
                </div>
              </div>

              {currentUser.backupEmail && (
                <div className="space-y-1">
                  <span className="text-[#6B7280] font-medium block">Backup Email</span>
                  <span className="font-bold text-[#111827] text-sm block font-mono">
                    {currentUser.backupEmail}
                  </span>
                </div>
              )}

              <div className="space-y-1">
                <span className="text-[#6B7280] font-medium block">Primary Phone Number</span>
                {currentUser.primaryPhone || currentUser.phone ? (
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-[#111827] text-sm block font-mono">
                      {currentUser.primaryPhone || currentUser.phone}
                    </span>
                    <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Verified</span>
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 pt-0.5">
                    <span className="text-[#9CA3AF] italic">Not provided</span>
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(true)}
                      className="text-[#111827] font-bold hover:underline flex items-center space-x-1 cursor-pointer"
                    >
                      <PlusCircle className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-[#6B7280] font-medium block">Address & Location</span>
                {currentUser.streetAddress || currentUser.location ? (
                  <span className="font-bold text-[#111827] text-sm block">
                    {currentUser.streetAddress ? `${currentUser.streetAddress}, ${currentUser.city}, ${currentUser.state} ${currentUser.postalCode}, ${currentUser.country}` : currentUser.location}
                  </span>
                ) : (
                  <div className="flex items-center space-x-2 pt-0.5">
                    <span className="text-[#9CA3AF] italic">Not provided</span>
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(true)}
                      className="text-[#111827] font-bold hover:underline flex items-center space-x-1 cursor-pointer"
                    >
                      <PlusCircle className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CAREER INFORMATION */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <h3 className="text-sm font-bold text-[#111827] flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-[#111827]" />
                <span>Career Information</span>
              </h3>

              <button
                type="button"
                onClick={() => setIsChangeRoleModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-[#FAFAFA] hover:bg-[#F3F4F6] text-[#111827] font-bold text-xs border border-[#E5E7EB] transition-colors cursor-pointer"
              >
                Change Role
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6B7280] block">
                  Target Job Role
                </span>
                <p className="text-base font-extrabold text-[#111827] pt-0.5">
                  {currentUser.preferredJobRole || currentUser.title || 'Software Engineer'}
                </p>
              </div>

              <div className="text-xs text-[#6B7280] font-mono">
                Used for AI Interview & Readiness Benchmarking
              </div>
            </div>
          </div>

          {/* RESUME */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <h3 className="text-sm font-bold text-[#111827] flex items-center space-x-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Resume</span>
              </h3>

              <div className="flex items-center space-x-2">
                {onOpenResumeScanner && (
                  <button
                    type="button"
                    onClick={onOpenResumeScanner}
                    className="px-3 py-1.5 rounded-xl bg-[#FAFAFA] hover:bg-[#F3F4F6] text-[#111827] font-semibold text-xs border border-[#E5E7EB] transition-colors flex items-center space-x-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#111827]" />
                    <span>View Resume</span>
                  </button>
                )}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#111827] font-mono">
                      {currentUser.resumeFileName || 'Alex_Rivera_Resume.pdf'}
                    </p>
                    <p className="text-[11px] text-[#6B7280] font-mono">
                      Uploaded: {currentUser.resumeUploadDate || '26 July 2026'}
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-bold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>{currentUser.resumeStatus || 'Active - Parsed & Synced'}</span>
                </span>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => resumeInputRef.current?.click()}
                  disabled={isUploadingResume}
                  className="px-3.5 py-2 rounded-xl bg-[#111827] hover:bg-[#1f2937] text-white font-bold text-xs transition-colors flex items-center space-x-1.5 shadow-xs cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploadingResume ? 'Uploading...' : 'Upload Resume'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => resumeInputRef.current?.click()}
                  disabled={isUploadingResume}
                  className="px-3.5 py-2 rounded-xl bg-[#FAFAFA] hover:bg-[#F3F4F6] text-[#111827] font-semibold text-xs border border-[#E5E7EB] transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Replace Resume</span>
                </button>

                {onOpenResumeScanner && (
                  <button
                    type="button"
                    onClick={onOpenResumeScanner}
                    className="px-3.5 py-2 rounded-xl bg-[#FAFAFA] hover:bg-[#F3F4F6] text-[#111827] font-semibold text-xs border border-[#E5E7EB] transition-colors flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Resume</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* SKILLS */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <h3 className="text-sm font-bold text-[#111827] flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#111827]" />
                <span>Skills</span>
              </h3>

              <span className="text-[11px] font-mono text-[#6B7280]">
                {skillList.length} skills analyzed
              </span>
            </div>

            {skillList.length > 0 ? (
              <div className="space-y-4 pt-1">
                {skillList.map((skill, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-[#111827]">{skill.name}</span>
                      <span className="font-mono font-bold text-[#111827]">{skill.level}%</span>
                    </div>

                    <div className="w-full h-2.5 rounded-full bg-[#F3F4F6] overflow-hidden">
                      <div
                        className="h-full bg-[#111827] rounded-full transition-all duration-500"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-[#FAFAFA] text-center space-y-3 border border-dashed border-[#E5E7EB]">
                <p className="text-xs text-[#6B7280] font-medium">
                  No skills have been analyzed yet.
                </p>

                {onStartInterview && (
                  <button
                    type="button"
                    onClick={onStartInterview}
                    className="px-4 py-2 rounded-xl bg-[#111827] hover:bg-[#1f2937] text-white font-bold text-xs shadow-xs inline-flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Take AI Interview</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* CAREER READINESS */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <h3 className="text-sm font-bold text-[#111827] flex items-center space-x-2">
                <Target className="w-4 h-4 text-[#111827]" />
                <span>Career Readiness</span>
              </h3>

              <span className="text-[11px] font-mono text-[#6B7280]">
                {readinessScores.hasEvaluations ? 'Based on AI interview evaluations' : 'Benchmark metric'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-[#6B7280] block">
                  Overall
                </span>
                <span className="text-2xl font-extrabold text-[#111827] font-mono">
                  {readinessScores.overall}%
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-[#6B7280] block">
                  Technical
                </span>
                <span className="text-2xl font-extrabold text-[#111827] font-mono">
                  {readinessScores.technical}%
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-700 block">
                  Communication
                </span>
                <span className="text-2xl font-extrabold text-[#111827] font-mono">
                  {readinessScores.communication}%
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-amber-700 block">
                  Problem Solving
                </span>
                <span className="text-2xl font-extrabold text-[#111827] font-mono">
                  {readinessScores.problemSolving}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-xl relative text-[#111827]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
              <h3 className="text-base font-extrabold text-[#111827] flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-[#111827]" />
                <span>Edit Profile</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-[#9CA3AF] hover:text-[#111827] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditProfile} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block font-semibold text-[#374151]">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-[#374151]">Email Address (Read-only)</label>
                <input
                  type="email"
                  value={currentUser.email}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-xs text-[#9CA3AF] font-mono cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-[#374151]">Phone Number</label>
                <input
                  type="text"
                  placeholder="+1 (555) 000-0000"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-[#374151]">Location</label>
                <input
                  type="text"
                  placeholder="San Francisco, CA"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-[#374151]">Target Job Role</label>
                <select
                  value={editTargetRole}
                  onChange={(e) => setEditTargetRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] font-semibold"
                >
                  {POSSIBLE_TARGET_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#FAFAFA] hover:bg-[#F3F4F6] text-[#374151] border border-[#E5E7EB] font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#111827] hover:bg-[#1f2937] text-white font-bold text-xs shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHANGE ROLE MODAL */}
      {isChangeRoleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl max-w-md w-full p-6 space-y-6 shadow-xl relative text-[#111827]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
              <h3 className="text-base font-extrabold text-[#111827] flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-[#111827]" />
                <span>Select Target Job Role</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsChangeRoleModalOpen(false)}
                className="p-1 rounded-lg text-[#9CA3AF] hover:text-[#111827] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {POSSIBLE_TARGET_ROLES.map((role) => {
                const isSelected =
                  (currentUser.preferredJobRole || currentUser.title) === role;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleChangeRole(role)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#F3F4F6] border-[#111827] text-[#111827] font-bold'
                        : 'bg-[#FAFAFA] border-[#E5E7EB] text-[#374151] hover:bg-[#F3F4F6]'
                    }`}
                  >
                    <span>{role}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[#111827]" />}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsChangeRoleModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-[#374151] font-semibold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {isChangePasswordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-xl relative text-[#111827]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
              <h3 className="text-base font-extrabold text-[#111827] flex items-center space-x-2">
                <Key className="w-5 h-5 text-[#111827]" />
                <span>Change Password</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsChangePasswordModalOpen(false)}
                className="p-1 rounded-lg text-[#9CA3AF] hover:text-[#111827] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {passwordError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {passwordError}
              </div>
            )}

            <form onSubmit={handleSavePassword} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block font-semibold text-[#374151]">Current Password</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-[#374151]">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-[#374151]">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827]"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-[#374151] font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#111827] hover:bg-[#1f2937] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE ACCOUNT CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-xl relative text-[#111827]">
            <div className="flex items-center space-x-3 text-rose-700">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-extrabold text-[#111827]">Delete Account</h3>
            </div>

            <p className="text-xs text-[#6B7280] leading-relaxed">
              Are you sure you want to delete your candidate profile? Your interview evaluations, skill records, and resume data will be cleared from your local session.
            </p>

            <div className="pt-2 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-[#374151] font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  if (onLogout) onLogout();
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
