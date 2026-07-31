import React, { useState, useEffect } from 'react';
import { User } from '../types';
import {
  authService,
  validateEmail,
  validatePhone,
  validatePasswordComplexity,
  calculateAge,
  FullRegistrationPayload,
} from '../services/authService';
import { GoogleLoginButton } from './GoogleLoginButton';
import {
  X,
  User as UserIcon,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Check,
  Building,
  Globe,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: (user: User, token: string) => void;
}

const COUNTRY_CODES = [
  { code: '+1', name: 'United States / Canada', flag: '🇺🇸' },
  { code: '+91', name: 'India', flag: '🇮🇳' },
  { code: '+44', name: 'United Kingdom', flag: '🇬🇧' },
  { code: '+61', name: 'Australia', flag: '🇦🇺' },
  { code: '+49', name: 'Germany', flag: '🇩🇪' },
  { code: '+33', name: 'France', flag: '🇫🇷' },
  { code: '+81', name: 'Japan', flag: '🇯🇵' },
  { code: '+86', name: 'China', flag: '🇨🇳' },
  { code: '+971', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: '+65', name: 'Singapore', flag: '🇸🇬' },
];

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
}) => {
  // Step indicator state (1..4)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Account Information State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Step 2: Personal Information & Contact
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState('+1');
  const [primaryPhone, setPrimaryPhone] = useState('');
  const [primaryEmail, setPrimaryEmail] = useState('');
  const [backupEmail, setBackupEmail] = useState('');
  const [gender, setGender] = useState('Prefer not to say');

  // Step 3: Address & Location
  const [streetAddress, setStreetAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('United States');

  // Step 4: Verification & OTP
  const [emailOtpInput, setEmailOtpInput] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpTimer, setEmailOtpTimer] = useState(0);
  const [emailDemoCode, setEmailDemoCode] = useState('123456');

  const [phoneOtpInput, setPhoneOtpInput] = useState('');
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtpTimer, setPhoneOtpTimer] = useState(0);
  const [phoneDemoCode, setPhoneDemoCode] = useState('654321');

  // UI Error & Loader states
  const [stepError, setStepError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Auto generate username if empty when first/last name change
  useEffect(() => {
    if (firstName && lastName && (!username || username === `${firstName.toLowerCase()}_${lastName.toLowerCase()}`)) {
      const cleanFirst = firstName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanLast = lastName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      if (cleanFirst && cleanLast) {
        setUsername(`${cleanFirst}_${cleanLast}`);
      }
    }
  }, [firstName, lastName]);

  // Timers for OTP resends
  useEffect(() => {
    let interval: any = null;
    if (emailOtpTimer > 0) {
      interval = setInterval(() => setEmailOtpTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [emailOtpTimer]);

  useEffect(() => {
    let interval: any = null;
    if (phoneOtpTimer > 0) {
      interval = setInterval(() => setPhoneOtpTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [phoneOtpTimer]);

  if (!isOpen) return null;

  // Step Navigation Handler
  const handleNextStep = async () => {
    setStepError('');

    if (currentStep === 1) {
      // Step 1 Validation
      if (!firstName.trim() || firstName.trim().length < 2) {
        setStepError('Please enter a valid First Name (minimum 2 characters).');
        return;
      }
      if (!lastName.trim() || lastName.trim().length < 2) {
        setStepError('Please enter a valid Last Name (minimum 2 characters).');
        return;
      }
      if (!username.trim() || username.trim().length < 4 || !/^[a-zA-Z0-9_]+$/.test(username)) {
        setStepError('Username must be at least 4 characters and contain only letters, numbers, or underscores.');
        return;
      }
      if (!password || !password.trim()) {
        setStepError('Please enter a password.');
        return;
      }
      if (password !== confirmPassword) {
        setStepError('Passwords do not match.');
        return;
      }
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      // Step 2 Validation
      if (!dateOfBirth) {
        setStepError('Please enter your Date of Birth.');
        return;
      }
      const age = calculateAge(dateOfBirth);
      if (age < 16) {
        setStepError('You must be at least 16 years old to create an account.');
        return;
      }
      if (!primaryPhone || !validatePhone(primaryPhone)) {
        setStepError('Please enter a valid phone number.');
        return;
      }
      if (!primaryEmail || !validateEmail(primaryEmail)) {
        setStepError('Please enter a valid primary email address.');
        return;
      }
      if (backupEmail && !validateEmail(backupEmail)) {
        setStepError('Please enter a valid backup email address.');
        return;
      }

      // Check for duplicate account before proceeding to Address & Verification
      try {
        authService.checkDuplicateAccount(primaryEmail, `${phoneCountryCode} ${primaryPhone}`);
      } catch (err: any) {
        setStepError(err.message || 'An account with this email address or phone number already exists.');
        return;
      }

      setCurrentStep(3);
      return;
    }

    if (currentStep === 3) {
      // Step 3 Validation
      if (!streetAddress.trim()) {
        setStepError('Please enter your Street Address.');
        return;
      }
      if (!city.trim()) {
        setStepError('Please enter your City.');
        return;
      }
      if (!state.trim()) {
        setStepError('Please enter your State / Province.');
        return;
      }
      if (!postalCode.trim()) {
        setStepError('Please enter your Postal / Zip Code.');
        return;
      }

      // Move to Step 4 and trigger OTPs automatically
      setCurrentStep(4);
      triggerEmailOtp();
      triggerPhoneOtp();
      return;
    }
  };

  const handlePrevStep = () => {
    setStepError('');
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // OTP Actions
  const triggerEmailOtp = async () => {
    try {
      setStepError('');
      const res = await authService.sendEmailOtp(primaryEmail);
      setEmailOtpSent(true);
      setEmailOtpTimer(60);
      setEmailDemoCode(res.code);
    } catch (err: any) {
      setStepError(err.message || 'Failed to send email verification code.');
    }
  };

  const triggerPhoneOtp = async () => {
    try {
      setStepError('');
      const res = await authService.sendPhoneOtp(primaryPhone, phoneCountryCode);
      setPhoneOtpSent(true);
      setPhoneOtpTimer(60);
      setPhoneDemoCode(res.code);
    } catch (err: any) {
      setStepError(err.message || 'Failed to send SMS verification code.');
    }
  };

  const handleVerifyEmailCode = () => {
    setStepError('');
    if (!emailOtpInput) {
      setStepError('Please enter the 6-digit email verification code.');
      return;
    }
    const valid = authService.verifyOtp(primaryEmail, emailOtpInput);
    if (valid) {
      setIsEmailVerified(true);
    } else {
      setStepError('Incorrect email verification code. Please try again.');
    }
  };

  const handleVerifyPhoneCode = () => {
    setStepError('');
    if (!phoneOtpInput) {
      setStepError('Please enter the 6-digit phone verification code.');
      return;
    }
    const fullPhone = `${phoneCountryCode} ${primaryPhone}`;
    const valid = authService.verifyOtp(fullPhone, phoneOtpInput);
    if (valid) {
      setIsPhoneVerified(true);
    } else {
      setStepError('Incorrect SMS verification code. Please try again.');
    }
  };

  // Final Submit Handler
  const handleCompleteRegistration = async () => {
    setStepError('');

    if (!isEmailVerified) {
      setStepError('Please verify your email address to complete registration.');
      return;
    }

    if (!isPhoneVerified) {
      setStepError('Please verify your phone number to complete registration.');
      return;
    }

    setIsLoading(true);

    try {
      const payload: FullRegistrationPayload = {
        firstName,
        lastName,
        preferredName,
        username,
        password,
        dateOfBirth,
        primaryPhone,
        phoneCountryCode,
        primaryEmail,
        backupEmail,
        gender,
        streetAddress,
        apartment,
        city,
        state,
        postalCode,
        country,
        emailVerified: true,
        phoneVerified: true,
      };

      const res = await authService.registerFullAccount(payload);
      setIsCompleted(true);

      setTimeout(() => {
        onSuccessLogin(res.user, res.token);
      }, 1000);
    } catch (err: any) {
      setStepError(err.message || 'Registration failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleGoogleQuickRegister = async () => {
    setIsLoading(true);
    setStepError('');
    try {
      const res = await authService.loginWithGoogle();
      setIsCompleted(true);
      setTimeout(() => {
        onSuccessLogin(res.user, res.token);
      }, 800);
    } catch (err: any) {
      setStepError(err.message || 'Google registration failed.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#FFFFFF] rounded-2xl border border-[#E5E7EB] shadow-xl p-6 sm:p-8 space-y-6 text-[#111827] max-h-[92vh] overflow-y-auto my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors z-20 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#F3F4F6] border border-[#E5E7EB] text-[#111827] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CANDIDATE ACCOUNT REGISTRATION</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#111827]">Create Your Account</h2>
          <p className="text-xs text-[#6B7280]">
            Join SkillAura to practice AI interviews, track skills, and accelerate your tech career.
          </p>
        </div>

        {/* Stepper Progress Header */}
        <div className="grid grid-cols-4 gap-2 pt-2 relative z-10">
          {[
            { step: 1, label: 'Account' },
            { step: 2, label: 'Personal' },
            { step: 3, label: 'Address' },
            { step: 4, label: 'Verify' },
          ].map((s) => {
            const isActive = currentStep === s.step;
            const isDone = currentStep > s.step || isCompleted;
            return (
              <div key={s.step} className="space-y-1 text-center">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    isDone
                      ? 'bg-emerald-500'
                      : isActive
                      ? 'bg-[#111827]'
                      : 'bg-[#E5E7EB]'
                  }`}
                />
                <span
                  className={`text-[10px] font-mono font-bold block ${
                    isActive
                      ? 'text-[#111827]'
                      : isDone
                      ? 'text-emerald-600'
                      : 'text-[#9CA3AF]'
                  }`}
                >
                  Step {s.step}: {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Global Error Banner */}
        {stepError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center space-x-2.5 animate-shake relative z-10">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{stepError}</span>
          </div>
        )}

        {/* SUCCESS COMPLETION SCREEN */}
        {isCompleted ? (
          <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4 relative z-10 my-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto" />
            <h3 className="text-xl font-extrabold text-emerald-900">
              ✓ Account Created Successfully!
            </h3>
            <p className="text-xs text-emerald-700 max-w-sm mx-auto">
              Your verified profile has been initialized. Redirecting to your candidate dashboard...
            </p>
          </div>
        ) : (
          <div className="relative z-10 space-y-5">
            {/* STEP 1: ACCOUNT INFORMATION */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#374151]">
                      First Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Enter first name"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#D1D5DB] bg-[#FFFFFF] text-xs text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827]"
                      />
                      <UserIcon className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-3" />
                    </div>
                  </div>

                  {/* Last Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#374151]">
                      Last Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Enter last name"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#D1D5DB] bg-[#FFFFFF] text-xs text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827]"
                      />
                      <UserIcon className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-3" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Preferred Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#374151]">
                      Preferred Name <span className="text-[#9CA3AF] font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={preferredName}
                      onChange={(e) => setPreferredName(e.target.value)}
                      placeholder="Enter preferred name"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1D5DB] bg-[#FFFFFF] text-xs text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827]"
                    />
                  </div>

                  {/* Username */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#374151]">
                      Username <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter username"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1D5DB] bg-[#FFFFFF] text-xs text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827] font-mono"
                    />
                  </div>
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#374151]">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-[#D1D5DB] bg-[#FFFFFF] text-xs text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827]"
                      />
                      <Lock className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-3" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 p-0.5 text-[#9CA3AF] hover:text-[#111827]"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#374151]">
                      Confirm Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#D1D5DB] bg-[#FFFFFF] text-xs text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827]"
                      />
                      <Lock className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-3" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: PERSONAL INFO & CONTACT DETAILS */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-fade-in">
                {/* Date of Birth & Gender */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#374151]">
                      Date of Birth <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#D1D5DB] bg-[#FFFFFF] text-xs text-[#111827] focus:outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827] font-mono"
                      />
                      <Calendar className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-3" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#374151]">
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1D5DB] bg-[#FFFFFF] text-xs text-[#111827] focus:outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827]"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                {/* Phone Number with Country Code */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#374151]">
                    Primary Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex space-x-2">
                    <select
                      value={phoneCountryCode}
                      onChange={(e) => setPhoneCountryCode(e.target.value)}
                      className="w-32 px-3 py-2.5 rounded-xl border border-[#D1D5DB] bg-[#FFFFFF] text-xs font-mono font-bold text-[#111827] focus:outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827]"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.code}
                        </option>
                      ))}
                    </select>
                    <div className="relative flex-1">
                      <input
                        type="tel"
                        value={primaryPhone}
                        onChange={(e) => setPrimaryPhone(e.target.value)}
                        placeholder="Enter phone number"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#D1D5DB] bg-[#FFFFFF] text-xs text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827] font-mono"
                      />
                      <Phone className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-3" />
                    </div>
                  </div>
                </div>

                {/* Emails */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#374151]">
                      Primary Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={primaryEmail}
                        onChange={(e) => setPrimaryEmail(e.target.value)}
                        placeholder="Enter primary email address"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#D1D5DB] bg-[#FFFFFF] text-xs text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827]"
                      />
                      <Mail className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-3" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#374151]">
                      Backup Email Address <span className="text-[#9CA3AF] font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={backupEmail}
                        onChange={(e) => setBackupEmail(e.target.value)}
                        placeholder="Enter backup email address"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#D1D5DB] bg-[#FFFFFF] text-xs text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827]"
                      />
                      <Mail className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-3" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: ADDRESS & LOCATION */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-fade-in">
                {/* Street Address */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#374151]">
                    Street Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      placeholder="Enter street address"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#D1D5DB] bg-[#FFFFFF] text-xs text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827]"
                    />
                    <MapPin className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-3" />
                  </div>
                </div>

                {/* Apartment / Suite */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#374151]">
                    Apartment / Suite / Unit <span className="text-[#9CA3AF] font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={apartment}
                      onChange={(e) => setApartment(e.target.value)}
                      placeholder="Enter apartment, suite, unit, etc."
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#D1D5DB] bg-[#FFFFFF] text-xs text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827]"
                    />
                    <Building className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-3" />
                  </div>
                </div>

                {/* City, State, Postal Code */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#374151]">
                      City <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Enter city"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1D5DB] bg-[#FFFFFF] text-xs text-[#111827] focus:outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#374151]">
                      State / Province <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Enter state / province"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1D5DB] bg-[#FFFFFF] text-xs text-[#111827] focus:outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#374151]">
                      Postal Code <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="Enter postal code"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1D5DB] bg-[#FFFFFF] text-xs text-[#111827] focus:outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827] font-mono"
                    />
                  </div>
                </div>

                {/* Country */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#374151]">
                    Country <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#D1D5DB] bg-[#FFFFFF] text-xs text-[#111827] focus:outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827]"
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="India">India</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Australia">Australia</option>
                      <option value="Germany">Germany</option>
                      <option value="France">France</option>
                      <option value="Japan">Japan</option>
                      <option value="Singapore">Singapore</option>
                    </select>
                    <Globe className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-3" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: VERIFICATION & OTP */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-fade-in">
                <p className="text-xs text-[#6B7280]">
                  Verification required: Enter the 6-digit verification codes sent to your email and phone.
                </p>

                {/* 1. Email Verification */}
                <div className={`p-5 rounded-xl border transition-all ${isEmailVerified ? 'bg-emerald-50 border-emerald-200' : 'bg-[#FAFAFA] border-[#E5E7EB]'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-[#111827]" />
                      <span className="text-xs font-bold text-[#111827]">
                        Email Verification ({primaryEmail})
                      </span>
                    </div>
                    {isEmailVerified ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>VERIFIED</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-amber-600 font-bold">PENDING VERIFICATION</span>
                    )}
                  </div>

                  {!isEmailVerified && (
                    <div className="space-y-3">
                      <div className="p-2 rounded-lg bg-[#FFFFFF] border border-[#E5E7EB] text-[11px] flex items-center justify-between font-mono text-[#374151]">
                        <span>OTP Code Sent to Email:</span>
                        <span className="font-bold bg-[#F3F4F6] px-2 py-0.5 rounded border border-[#D1D5DB] text-[#111827]">{emailDemoCode}</span>
                      </div>

                      <div className="flex space-x-2">
                        <input
                          type="text"
                          maxLength={6}
                          value={emailOtpInput}
                          onChange={(e) => setEmailOtpInput(e.target.value)}
                          placeholder="Enter 6-digit code"
                          className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#D1D5DB] bg-[#FFFFFF] text-xs font-mono font-bold tracking-widest text-center focus:outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827]"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyEmailCode}
                          className="px-4 py-2.5 rounded-xl bg-[#111827] hover:bg-[#1f2937] text-white font-bold text-xs shadow-xs cursor-pointer"
                        >
                          Verify Email
                        </button>
                      </div>

                      <div className="flex justify-between items-center text-[11px] text-[#6B7280]">
                        <span>Didn't receive code?</span>
                        <button
                          type="button"
                          onClick={triggerEmailOtp}
                          disabled={emailOtpTimer > 0}
                          className="text-[#111827] font-bold hover:underline disabled:opacity-50 cursor-pointer"
                        >
                          {emailOtpTimer > 0 ? `Resend in ${emailOtpTimer}s` : 'Resend Code'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Phone Verification */}
                <div className={`p-5 rounded-xl border transition-all ${isPhoneVerified ? 'bg-emerald-50 border-emerald-200' : 'bg-[#FAFAFA] border-[#E5E7EB]'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-[#111827]" />
                      <span className="text-xs font-bold text-[#111827]">
                        SMS Phone Verification ({phoneCountryCode} {primaryPhone})
                      </span>
                    </div>
                    {isPhoneVerified ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>VERIFIED</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-amber-600 font-bold">PENDING VERIFICATION</span>
                    )}
                  </div>

                  {!isPhoneVerified && (
                    <div className="space-y-3">
                      <div className="p-2 rounded-lg bg-[#FFFFFF] border border-[#E5E7EB] text-[11px] flex items-center justify-between font-mono text-[#374151]">
                        <span>SMS OTP Code Sent to Phone:</span>
                        <span className="font-bold bg-[#F3F4F6] px-2 py-0.5 rounded border border-[#D1D5DB] text-[#111827]">{phoneDemoCode}</span>
                      </div>

                      <div className="flex space-x-2">
                        <input
                          type="text"
                          maxLength={6}
                          value={phoneOtpInput}
                          onChange={(e) => setPhoneOtpInput(e.target.value)}
                          placeholder="Enter 6-digit code"
                          className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#D1D5DB] bg-[#FFFFFF] text-xs font-mono font-bold tracking-widest text-center focus:outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827]"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyPhoneCode}
                          className="px-4 py-2.5 rounded-xl bg-[#111827] hover:bg-[#1f2937] text-white font-bold text-xs shadow-xs cursor-pointer"
                        >
                          Verify Phone
                        </button>
                      </div>

                      <div className="flex justify-between items-center text-[11px] text-[#6B7280]">
                        <span>Didn't receive SMS?</span>
                        <button
                          type="button"
                          onClick={triggerPhoneOtp}
                          disabled={phoneOtpTimer > 0}
                          className="text-[#111827] font-bold hover:underline disabled:opacity-50 cursor-pointer"
                        >
                          {phoneOtpTimer > 0 ? `Resend in ${phoneOtpTimer}s` : 'Resend SMS'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Modal Controls / Footer Actions */}
            <div className="pt-4 flex items-center justify-between border-t border-[#E5E7EB]">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  disabled={isLoading}
                  className="px-4 py-2.5 rounded-xl bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#374151] font-semibold text-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              ) : (
                <div />
              )}

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-2.5 rounded-xl bg-[#111827] hover:bg-[#1f2937] text-white font-bold text-xs transition-all shadow-xs flex items-center space-x-2 cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCompleteRegistration}
                  disabled={isLoading || !isEmailVerified || !isPhoneVerified}
                  className="px-6 py-2.5 rounded-xl bg-[#111827] hover:bg-[#1f2937] text-white font-bold text-xs transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Profile...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Complete Registration</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Social Registration Alternative (Step 1 only) */}
            {currentStep === 1 && (
              <div className="pt-2">
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#E5E7EB]" />
                  </div>
                  <div className="relative flex justify-center text-[10px] font-mono uppercase">
                    <span className="bg-[#FFFFFF] px-2 text-[#6B7280]">
                      OR QUICK REGISTER WITH
                    </span>
                  </div>
                </div>

                <GoogleLoginButton onClick={handleGoogleQuickRegister} isLoading={isLoading} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
