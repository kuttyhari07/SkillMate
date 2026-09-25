import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, KeyRound, ArrowRight, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

export default function ForgotPassword() {
  const { forgotPassword, resetPassword, resendOtp } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = Enter Email, 2 = Enter OTP + New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [debugOtp, setDebugOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await forgotPassword(email);
      if (res.debugPreviewOtp) setDebugOtp(res.debugPreviewOtp);
      setSuccess(`Password reset OTP has been sent to ${email}`);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send password reset OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await resetPassword(email, otp, newPassword);
      setSuccess('Password updated successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await resendOtp(email, 'password-reset');
      if (res.debugPreviewOtp) setDebugOtp(res.debugPreviewOtp);
      setSuccess('A fresh reset code has been emailed to you!');
    } catch (err) {
      setError('Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-slate-950">
      <div className="w-full max-w-md">
        <div className="glass-card p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {step === 1 ? 'Reset Your Password' : 'Enter Reset Code'}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {step === 1
                ? 'We will send a 6-digit OTP code to your registered email'
                : `Enter the code sent to ${email} and choose a new password`}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Registered Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all mt-6 disabled:opacity-50"
              >
                {loading ? 'Sending Code...' : (
                  <>
                    <span>Send Reset Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">6-Digit OTP</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-indigo-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full bg-slate-900 border border-indigo-500/50 rounded-xl pl-10 pr-4 py-2.5 font-mono text-center tracking-[0.5em] text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {debugOtp && (
                <div className="p-2.5 rounded-lg bg-indigo-950/60 border border-indigo-500/40 text-[11px] text-indigo-300 flex items-center justify-between">
                  <span>📬 Resend Email OTP: <strong className="font-mono text-white text-xs">{debugOtp}</strong></span>
                  <button
                    type="button"
                    onClick={() => setOtp(debugOtp)}
                    className="underline text-indigo-400 hover:text-white"
                  >
                    Auto-Fill
                  </button>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span>Didn't get the code?</span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading}
                  className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Resend
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6 || newPassword.length < 6}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all mt-4 disabled:opacity-50"
              >
                {loading ? 'Updating Password...' : 'Verify OTP & Change Password'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-xs text-slate-400">
            Remember your credentials?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold ml-1">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
