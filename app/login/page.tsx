'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RiskRadarLogo } from '@/components/RiskRadarLogo';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const registered = searchParams.get('registered');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState<{ message?: string; error?: string } | null>(null);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await signIn('credentials', {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
        callbackUrl,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError('An unexpected error occurred during sign in.');
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    signIn('google', { callbackUrl });
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setForgotStatus({ message: data.message });
      } else {
        setForgotStatus({ error: data.error || 'Failed to process request.' });
      }
    } catch {
      setForgotStatus({ error: 'Network error. Please try again.' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8" style={{ background: '#ECE6E2' }}>
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* LEFT COLUMN: Risk Radar Identity & Value */}
        <div className="lg:col-span-6 space-y-6 lg:pr-8">
          <div className="flex items-center gap-3">
            <RiskRadarLogo size={44} />
            <div>
              <span className="font-extrabold text-2xl tracking-tight" style={{ color: '#111111' }}>
                Risk_Radar
              </span>
              <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#990011' }}>
                AI Security Operations
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-[1.05] tracking-tight" style={{ color: '#111111' }}>
              Your digital security command center.
            </h1>
            <p className="text-base font-medium leading-relaxed" style={{ color: '#554B49' }}>
              Investigate before you interact. Autonomous heuristic extraction, contextual reasoning, and Threat DNA memory protecting you against modern digital threats.
            </p>
          </div>

          <div className="hidden sm:grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl border" style={{ background: '#E0D8D4', borderColor: '#C4B5B0' }}>
              <div className="text-xs font-extrabold font-mono" style={{ color: '#990011' }}>01 / SCAN</div>
              <div className="text-xs font-medium mt-1" style={{ color: '#111111' }}>Analyze URLs, messages, and files safely.</div>
            </div>
            <div className="p-3.5 rounded-xl border" style={{ background: '#E0D8D4', borderColor: '#C4B5B0' }}>
              <div className="text-xs font-extrabold font-mono" style={{ color: '#176B52' }}>02 / MEMORY</div>
              <div className="text-xs font-medium mt-1" style={{ color: '#111111' }}>Threat DNA remembers attack patterns.</div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Authentication Card */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <div
            className="rounded-2xl border p-6 sm:p-8 shadow-xl"
            style={{ background: '#E0D8D4', borderColor: '#C4B5B0' }}
          >
            <div className="mb-6">
              <div className="text-[11px] font-extrabold uppercase tracking-widest mb-1" style={{ color: '#990011' }}>
                Authentication
              </div>
              <h2 className="text-2xl font-extrabold" style={{ color: '#111111' }}>
                Sign In to Risk_Radar
              </h2>
              <p className="text-xs font-medium mt-1" style={{ color: '#554B49' }}>
                Enter your credentials to access your security console.
              </p>
            </div>

            {registered && (
              <div className="mb-4 p-3 rounded-xl border text-xs font-bold" style={{ background: 'rgba(23,107,82,0.1)', borderColor: '#176B52', color: '#176B52' }}>
                ✓ Account created successfully! Please sign in.
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 rounded-xl border text-xs font-bold" style={{ background: 'rgba(153,0,17,0.1)', borderColor: '#990011', color: '#990011' }}>
                ⚠ {error}
              </div>
            )}

            <form onSubmit={handleCredentialsLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider mb-1.5" style={{ color: '#111111' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium transition focus:outline-none focus:ring-2"
                  style={{ background: '#ECE6E2', borderColor: '#C4B5B0', color: '#111111' }}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider" style={{ color: '#111111' }}>
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotStatus(null);
                      setForgotEmail(email);
                      setShowForgotModal(true);
                    }}
                    className="text-[11px] font-bold hover:underline"
                    style={{ color: '#990011' }}
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium transition focus:outline-none focus:ring-2"
                  style={{ background: '#ECE6E2', borderColor: '#C4B5B0', color: '#111111' }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-extrabold text-white tracking-wide transition hover:opacity-90 shadow-md flex items-center justify-center gap-2"
                style={{ background: '#990011' }}
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: '#C4B5B0' }} />
              </div>
              <span className="relative px-3 text-[10px] font-extrabold uppercase tracking-wider" style={{ background: '#E0D8D4', color: '#554B49' }}>
                Or
              </span>
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full py-2.5 px-4 rounded-xl border text-xs font-bold transition hover:bg-white/40 shadow-xs flex items-center justify-center gap-2.5"
              style={{ background: '#ECE6E2', borderColor: '#C4B5B0', color: '#111111' }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{googleLoading ? 'Connecting...' : 'Continue with Google'}</span>
            </button>

            <div className="mt-6 pt-5 border-t text-center text-xs font-medium" style={{ borderColor: '#C4B5B0', color: '#554B49' }}>
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-extrabold hover:underline" style={{ color: '#990011' }}>
                Create account
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(17,17,17,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-md rounded-2xl border p-6 shadow-2xl space-y-4" style={{ background: '#E0D8D4', borderColor: '#C4B5B0' }}>
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: '#C4B5B0' }}>
              <h3 className="font-extrabold text-lg" style={{ color: '#111111' }}>Reset Password</h3>
              <button
                onClick={() => setShowForgotModal(false)}
                className="p-1 rounded-lg text-xs font-bold"
                style={{ color: '#554B49' }}
              >
                ✕
              </button>
            </div>

            {forgotStatus?.message && (
              <div className="p-3 rounded-xl border text-xs font-semibold" style={{ background: 'rgba(23,107,82,0.1)', borderColor: '#176B52', color: '#176B52' }}>
                {forgotStatus.message}
              </div>
            )}
            {forgotStatus?.error && (
              <div className="p-3 rounded-xl border text-xs font-semibold" style={{ background: 'rgba(153,0,17,0.1)', borderColor: '#990011', color: '#990011' }}>
                {forgotStatus.error}
              </div>
            )}

            {!forgotStatus && (
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <p className="text-xs font-medium" style={{ color: '#554B49' }}>
                  Enter your registered email address to check password reset availability.
                </p>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full px-3 py-2 rounded-xl border text-xs"
                  style={{ background: '#ECE6E2', borderColor: '#C4B5B0', color: '#111111' }}
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl text-xs font-extrabold text-white"
                  style={{ background: '#990011' }}
                >
                  Send Reset Link
                </button>
              </form>
            )}

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowForgotModal(false)}
                className="px-3.5 py-1.5 rounded-xl border text-xs font-bold"
                style={{ background: '#ECE6E2', borderColor: '#C4B5B0', color: '#111111' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold" style={{ background: '#ECE6E2', color: '#111111' }}>Loading Risk_Radar...</div>}>
      <LoginForm />
    </Suspense>
  );
}
