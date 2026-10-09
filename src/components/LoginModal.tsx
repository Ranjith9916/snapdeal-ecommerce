import { useState } from 'react';
import { CloseIcon } from './Icons';
import { supabase } from '../lib/supabase';

interface Props {
  open: boolean;
  onClose: () => void;
}

type Mode = 'login' | 'signup' | 'forgot';

interface LoginForm {
  email: string;
  password: string;
  remember: boolean;
}

interface SignupForm {
  name: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

interface ForgotForm {
  email: string;
}

const defaultLogin: LoginForm = { email: '', password: '', remember: false };
const defaultSignup: SignupForm = { name: '', email: '', mobile: '', password: '', confirmPassword: '', acceptTerms: false };
const defaultForgot: ForgotForm = { email: '' };

export default function LoginModal({ open, onClose }: Props) {
  const [mode, setMode] = useState<Mode>('login');
  const [loginForm, setLoginForm] = useState<LoginForm>(defaultLogin);
  const [signupForm, setSignupForm] = useState<SignupForm>(defaultSignup);
  const [forgotForm, setForgotForm] = useState<ForgotForm>(defaultForgot);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [forgotSent, setForgotSent] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  function handleClose() {
    setMode('login');
    setLoginForm(defaultLogin);
    setSignupForm(defaultSignup);
    setForgotForm(defaultForgot);
    setErrors({});
    setForgotSent(false);
    onClose();
  }

  function switchMode(m: Mode) {
    setMode(m);
    setErrors({});
    setForgotSent(false);
  }

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function sanitizeAuthError(msg: string): string {
    const m = msg.toLowerCase();
    if (m.includes('invalid login credentials') || m.includes('invalid email or password')) {
      return 'Incorrect email or password. Please check your credentials and try again.';
    }
    if (m.includes('user already registered') || m.includes('already registered') || m.includes('unique constraint')) {
      return 'An account with this email already exists. Please log in instead.';
    }
    if (m.includes('rate limit') || m.includes('too many requests')) {
      return 'Too many login attempts. Please wait a moment and try again.';
    }
    if (m.includes('failed to fetch') || m.includes('network')) {
      return 'Network connection error. Please check your internet connection.';
    }
    return msg;
  }

  // ── Validation ──────────────────────────────────────────────────────────────

  function validateLogin(): boolean {
    const e: Record<string, string> = {};
    const email = loginForm.email.trim();
    if (!email) {
      e.email = 'Email address is required.';
    } else if (!EMAIL_REGEX.test(email)) {
      e.email = 'Please enter a valid email address.';
    }

    if (!loginForm.password) {
      e.password = 'Password is required.';
    } else if (loginForm.password.length < 6) {
      e.password = 'Password must be at least 6 characters.';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateSignup(): boolean {
    const e: Record<string, string> = {};
    const name = signupForm.name.trim();
    const email = signupForm.email.trim();
    const mobile = signupForm.mobile.trim();

    if (!name) {
      e.name = 'Full name is required.';
    } else if (name.length < 2) {
      e.name = 'Please enter a valid full name.';
    }

    if (!email) {
      e.email = 'Email address is required.';
    } else if (!EMAIL_REGEX.test(email)) {
      e.email = 'Please enter a valid email address.';
    }

    if (!mobile) {
      e.mobile = 'Mobile number is required.';
    } else if (!/^[6-9]\d{9}$/.test(mobile)) {
      e.mobile = 'Enter a valid 10-digit mobile number (starting with 6-9).';
    }

    if (!signupForm.password) {
      e.password = 'Password is required.';
    } else if (signupForm.password.length < 8 || !/(?=.*[A-Za-z])(?=.*\d)/.test(signupForm.password)) {
      e.password = 'Password must be at least 8 characters and include letters & numbers.';
    }

    if (!signupForm.confirmPassword) {
      e.confirmPassword = 'Please confirm your password.';
    } else if (signupForm.confirmPassword !== signupForm.password) {
      e.confirmPassword = 'Passwords do not match.';
    }

    if (!signupForm.acceptTerms) {
      e.acceptTerms = 'You must accept the Terms & Conditions.';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateForgot(): boolean {
    const e: Record<string, string> = {};
    const email = forgotForm.email.trim();
    if (!email) {
      e.email = 'Email address is required.';
    } else if (!EMAIL_REGEX.test(email)) {
      e.email = 'Please enter a valid email address.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Submit handlers ─────────────────────────────────────────────────────────

  async function handleLoginSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (loading) return;
    if (validateLogin()) {
      setLoading(true);
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: loginForm.email.trim(),
          password: loginForm.password,
        });
        setLoading(false);
        
        if (error) {
          setErrors({ submit: sanitizeAuthError(error.message) });
        } else {
          handleClose();
        }
      } catch (err: any) {
        setLoading(false);
        setErrors({ submit: sanitizeAuthError(err?.message || 'Failed to login') });
      }
    }
  }

  async function handleSignupSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (loading) return;
    if (validateSignup()) {
      setLoading(true);
      try {
        const { error } = await supabase.auth.signUp({
          email: signupForm.email.trim(),
          password: signupForm.password,
          options: {
            data: {
              first_name: signupForm.name.trim().split(' ')[0],
              last_name: signupForm.name.trim().split(' ').slice(1).join(' ') || '',
              phone: signupForm.mobile.trim(),
            }
          }
        });
        setLoading(false);

        if (error) {
          setErrors({ submit: sanitizeAuthError(error.message) });
        } else {
          switchMode('login');
          setErrors({ submit: 'Account created successfully! Please log in.' });
        }
      } catch (err: any) {
        setLoading(false);
        setErrors({ submit: sanitizeAuthError(err?.message || 'Failed to create account') });
      }
    }
  }

  async function handleForgotSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (validateForgot()) {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(forgotForm.email);
      setLoading(false);

      if (error) {
        setErrors({ submit: error.message });
      } else {
        setForgotSent(true);
      }
    }
  }

  // ── Shared input style ──────────────────────────────────────────────────────

  const inputCls = (field: string) =>
    `w-full border rounded-xl px-4 py-3 text-[14px] focus:outline-none transition-all ${
      errors[field] ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-[#E40046]'
    }`;

  const errorEl = (field: string) =>
    errors[field] ? <p className="text-[12px] text-red-500 mt-1">{errors[field]}</p> : null;

  // ── Logo ────────────────────────────────────────────────────────────────────

  const Logo = () => (
    <div className="text-2xl font-extrabold tracking-tight select-none">
      <span style={{ color: '#E40046' }}>snap</span>
      <span className="text-gray-900">deal</span>
    </div>
  );

  // ── Social buttons ──────────────────────────────────────────────────────────

  const SocialRow = () => (
    <div className="mt-5 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-[12px] text-gray-400 whitespace-nowrap">or continue with</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          className="flex-1 flex items-center justify-center gap-2 border border-gray-200 rounded-2xl py-2.5 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
            <path d="M44.5 20H24v8.5h11.8C34.7 33.9 29.9 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6-6C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.6 20-21 0-1.3-.2-2.7-.5-4z" fill="#FFC107"/>
            <path d="M6.3 14.7l7 5.1C15.1 16.1 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6-6C34.6 5.1 29.6 3 24 3c-7.7 0-14.3 4.4-17.7 11.7z" fill="#FF3D00"/>
            <path d="M24 45c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.6C29.7 35.8 27 37 24 37c-5.8 0-10.7-3.9-12.4-9.3l-6.9 5.4C8.1 41 15.5 45 24 45z" fill="#4CAF50"/>
            <path d="M44.5 20H24v8.5h11.8c-.9 2.7-2.6 4.9-4.9 6.4l6.6 5.6C41.7 37.2 45 31.1 45 24c0-1.3-.2-2.7-.5-4z" fill="#1976D2"/>
          </svg>
          Google
        </button>
        <button
          type="button"
          className="flex-1 flex items-center justify-center gap-2 border border-gray-200 rounded-2xl py-2.5 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
            <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.971h-1.514c-1.491 0-1.956.93-1.956 1.886v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
          </svg>
          Facebook
        </button>
      </div>
    </div>
  );

  // ── Login form ──────────────────────────────────────────────────────────────

  const LoginView = () => (
    <form onSubmit={handleLoginSubmit} noValidate className="flex flex-col gap-4">
      <div>
        <input
          type="email"
          placeholder="Email address"
          value={loginForm.email}
          onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
          className={inputCls('email')}
        />
        {errorEl('email')}
      </div>
      <div>
        <input
          type="password"
          placeholder="Password"
          value={loginForm.password}
          onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
          className={inputCls('password')}
        />
        {errorEl('password')}
      </div>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-[13px] text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={loginForm.remember}
            onChange={e => setLoginForm(f => ({ ...f, remember: e.target.checked }))}
            className="accent-[#E40046] w-4 h-4"
          />
          Remember me
        </label>
        <button
          type="button"
          onClick={() => switchMode('forgot')}
          className="text-[13px] text-[#E40046] font-semibold hover:underline"
        >
          Forgot password?
        </button>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#E40046] text-white rounded-2xl py-3 font-bold text-[15px] hover:opacity-90 transition-opacity mt-1 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Signing in...</span>
          </>
        ) : (
          'Login to Snapdeal'
        )}
      </button>
      <p className="text-center text-[13px] text-gray-500">
        New to Snapdeal?{' '}
        <button
          type="button"
          onClick={() => switchMode('signup')}
          className="text-[#E40046] font-semibold hover:underline"
        >
          Create Account
        </button>
      </p>
      {SocialRow()}
    </form>
  );

  // ── Signup form ─────────────────────────────────────────────────────────────

  const SignupView = () => (
    <form onSubmit={handleSignupSubmit} noValidate className="flex flex-col gap-4">
      <div>
        <input
          type="text"
          placeholder="Full name"
          value={signupForm.name}
          onChange={e => setSignupForm(f => ({ ...f, name: e.target.value }))}
          className={inputCls('name')}
        />
        {errorEl('name')}
      </div>
      <div>
        <input
          type="email"
          placeholder="Email address"
          value={signupForm.email}
          onChange={e => setSignupForm(f => ({ ...f, email: e.target.value }))}
          className={inputCls('email')}
        />
        {errorEl('email')}
      </div>
      <div>
        <input
          type="tel"
          placeholder="Mobile number (10 digits)"
          value={signupForm.mobile}
          onChange={e => setSignupForm(f => ({ ...f, mobile: e.target.value }))}
          className={inputCls('mobile')}
          maxLength={10}
        />
        {errorEl('mobile')}
      </div>
      <div>
        <input
          type="password"
          placeholder="Password"
          value={signupForm.password}
          onChange={e => setSignupForm(f => ({ ...f, password: e.target.value }))}
          className={inputCls('password')}
        />
        {errorEl('password')}
      </div>
      <div>
        <input
          type="password"
          placeholder="Confirm password"
          value={signupForm.confirmPassword}
          onChange={e => setSignupForm(f => ({ ...f, confirmPassword: e.target.value }))}
          className={inputCls('confirmPassword')}
        />
        {errorEl('confirmPassword')}
      </div>
      <div>
        <label className="flex items-start gap-2 text-[13px] text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={signupForm.acceptTerms}
            onChange={e => setSignupForm(f => ({ ...f, acceptTerms: e.target.checked }))}
            className="accent-[#E40046] w-4 h-4 mt-0.5 shrink-0"
          />
          I agree to the{' '}
          <span className="text-[#E40046] font-semibold hover:underline cursor-pointer">
            Terms &amp; Conditions
          </span>
        </label>
        {errorEl('acceptTerms')}
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#E40046] text-white rounded-2xl py-3 font-bold text-[15px] hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Creating Account...</span>
          </>
        ) : (
          'Create Account'
        )}
      </button>
      <p className="text-center text-[13px] text-gray-500">
        Already have an account?{' '}
        <button
          type="button"
          onClick={() => switchMode('login')}
          className="text-[#E40046] font-semibold hover:underline"
        >
          Login
        </button>
      </p>
      {SocialRow()}
    </form>
  );

  // ── Forgot password form ────────────────────────────────────────────────────

  const ForgotView = () => (
    <div className="flex flex-col gap-4">
      {forgotSent ? (
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p className="text-[15px] font-semibold text-gray-800 text-center">Reset link sent!</p>
          <p className="text-[13px] text-gray-500 text-center">
            We've sent a password reset link to{' '}
            <span className="font-semibold text-gray-700">{forgotForm.email}</span>.
            Check your inbox.
          </p>
          <button
            type="button"
            onClick={() => switchMode('login')}
            className="text-[13px] text-[#E40046] font-semibold hover:underline mt-2"
          >
            ← Back to Login
          </button>
        </div>
      ) : (
        <form onSubmit={handleForgotSubmit} noValidate className="flex flex-col gap-4">
          <p className="text-[13px] text-gray-500">
            Enter your registered email and we'll send you a link to reset your password.
          </p>
          <div>
            <input
              type="email"
              placeholder="Email address"
              value={forgotForm.email}
              onChange={e => setForgotForm({ email: e.target.value })}
              className={inputCls('email')}
            />
            {errorEl('email')}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-white font-bold text-[15px] hover:opacity-90 transition-all mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#E40046' }}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
          <p className="text-center text-[13px] text-gray-500">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="text-[#E40046] font-semibold hover:underline"
            >
              ← Back to Login
            </button>
          </p>
        </form>
      )}
    </div>
  );

  // ── Mode title ──────────────────────────────────────────────────────────────

  const titles: Record<Mode, string> = {
    login: 'Welcome back',
    signup: 'Create your account',
    forgot: 'Forgot password?',
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 9999, backdropFilter: 'blur(6px)', backgroundColor: 'rgba(0,0,0,0.45)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700"
          aria-label="Close"
        >
          <CloseIcon />
        </button>

        {/* Card body */}
        <div className="px-8 py-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            {Logo()}
          </div>

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[24px] font-extrabold text-gray-900 leading-tight">
              {titles[mode]}
            </h2>
          </div>

          {errors.submit && (
            <div className="mb-4 p-3 rounded-xl text-[14px] bg-red-50 text-red-600 font-medium">
              {errors.submit}
            </div>
          )}

          {/* Form area with smooth transition */}
          <div key={mode} style={{ animation: 'fadeIn 0.2s ease' }}>
            {mode === 'login' && LoginView()}
            {mode === 'signup' && SignupView()}
            {mode === 'forgot' && ForgotView()}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
