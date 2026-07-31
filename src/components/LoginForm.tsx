import React, { useState } from 'react';
import { User } from '../types';
import { authService, validateEmail, validatePhone } from '../services/authService';
import { GoogleLoginButton } from './GoogleLoginButton';
import { SkillAuraLogo } from './SkillAuraLogo';
import {
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogIn,
} from 'lucide-react';

interface LoginFormProps {
  onSuccessLogin: (user: User, token: string) => void;
  onOpenForgotPassword: () => void;
  onOpenRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccessLogin,
  onOpenForgotPassword,
  onOpenRegister,
}) => {
  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // Validation & Submission States
  const [identifierError, setIdentifierError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [generalError, setGeneralError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIdentifierError('');
    setPasswordError('');
    setGeneralError('');

    let hasError = false;
    const cleanInput = identifier.trim();

    if (!cleanInput) {
      setIdentifierError('Please enter your email address or phone number.');
      hasError = true;
    } else {
      const isEmail = cleanInput.includes('@');
      if (isEmail) {
        if (!validateEmail(cleanInput)) {
          setIdentifierError('Please enter a valid email address.');
          hasError = true;
        }
      } else {
        if (!validatePhone(cleanInput)) {
          setIdentifierError('Please enter a valid phone number.');
          hasError = true;
        }
      }
    }

    if (!password) {
      setPasswordError('Please enter your password.');
      hasError = true;
    }

    if (hasError) return;

    setIsLoading(true);

    try {
      const res = await authService.login(cleanInput, password, rememberMe);
      setIsSuccess(true);
      setTimeout(() => {
        onSuccessLogin(res.user, res.token);
      }, 600);
    } catch (err: any) {
      setGeneralError(err.message || 'Incorrect email/phone or password.');
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setGeneralError('');
    try {
      const res = await authService.loginWithGoogle();
      setIsSuccess(true);
      setTimeout(() => {
        onSuccessLogin(res.user, res.token);
      }, 600);
    } catch (err: any) {
      setGeneralError(err.message || 'Google authentication failed.');
      setIsLoading(false);
    }
  };

  const isEmailInput = identifier.includes('@');

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-sm relative z-10">
      {/* Brand Icon Header */}
      <div className="flex flex-col items-center text-center space-y-3 mb-6 relative z-10">
        <SkillAuraLogo size="lg" showText={false} />
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#111827]">
            Candidate Portal Login
          </h2>
          <p className="text-xs text-[#6B7280] mt-1">
            Access your AI career agent & interview intelligence dashboard
          </p>
        </div>
      </div>

      {/* Main Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
        {/* General Error Banner */}
        {generalError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-medium">{generalError}</span>
          </div>
        )}

        {/* Success Banner */}
        {isSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center justify-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>✓ Login successful. Redirecting...</span>
          </div>
        )}

        {/* Field 1: Email Address or Phone Number */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#374151]">
            Email / Phone Number
          </label>
          <div className="relative">
            <input
              type="text"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                if (identifierError) setIdentifierError('');
              }}
              placeholder="Enter your email address or phone number"
              disabled={isLoading || isSuccess}
              className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border bg-[#FFFFFF] text-xs text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827] transition-all ${
                identifierError ? 'border-red-500' : 'border-[#D1D5DB]'
              }`}
            />
            {isEmailInput || !identifier ? (
              <Mail className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-3" />
            ) : (
              <Phone className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-3" />
            )}
          </div>
          {identifierError && (
            <p className="text-[11px] font-medium text-red-600 mt-1 flex items-center space-x-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{identifierError}</span>
            </p>
          )}
        </div>

        {/* Field 2: Password */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#374151]">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError('');
              }}
              placeholder="Enter your password"
              disabled={isLoading || isSuccess}
              className={`w-full pl-9 pr-9 py-2.5 rounded-xl border bg-[#FFFFFF] text-xs text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827] transition-all ${
                passwordError ? 'border-red-500' : 'border-[#D1D5DB]'
              }`}
            />
            <Lock className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-3" />

            {/* Show/Hide Password Toggle */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 p-0.5 text-[#9CA3AF] hover:text-[#111827] transition-colors"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {passwordError && (
            <p className="text-[11px] font-medium text-red-600 mt-1 flex items-center space-x-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{passwordError}</span>
            </p>
          )}
        </div>

        {/* Below Password Options: Remember Me & Forgot Password */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center space-x-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading || isSuccess}
              className="w-4 h-4 rounded border-[#D1D5DB] text-[#111827] focus:ring-[#111827]"
            />
            <span className="text-xs font-medium text-[#374151]">
              Remember me
            </span>
          </label>

          <button
            type="button"
            onClick={onOpenForgotPassword}
            className="text-xs font-semibold text-[#111827] hover:underline focus:outline-none"
          >
            Forgot Password?
          </button>
        </div>

        {/* Primary Sign In Button */}
        <button
          type="submit"
          disabled={isLoading || isSuccess}
          className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-[#111827] hover:bg-[#1f2937] text-white transition-all duration-200 flex items-center justify-center space-x-2 shadow-xs disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Verifying credentials...</span>
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>✓ Signed in successfully</span>
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </>
          )}
        </button>

        {/* Social Login Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E5E7EB]" />
          </div>
          <div className="relative flex justify-center text-[10px] font-mono uppercase">
            <span className="bg-[#FFFFFF] px-2 text-[#6B7280] font-semibold">
              OR CONTINUE WITH
            </span>
          </div>
        </div>

        {/* Google OAuth Login Button */}
        <GoogleLoginButton onClick={handleGoogleAuth} isLoading={isLoading || isSuccess} />

        {/* Registration Link */}
        <div className="text-center pt-3 text-xs text-[#6B7280]">
          <span>Don't have an account? </span>
          <button
            type="button"
            onClick={onOpenRegister}
            className="font-bold text-[#111827] hover:underline focus:outline-none ml-1 cursor-pointer"
          >
            Create Account
          </button>
        </div>
      </form>
    </div>
  );
};

