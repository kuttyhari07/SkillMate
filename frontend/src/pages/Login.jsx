import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserCheck, Shield, Sparkles, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setLoading(true);
    try {
      await login(demoEmail, demoPassword);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-8">
        <div className="text-center">
          <div className="inline-flex p-3 rounded-2xl bg-blue-50 text-blue-600 mb-3">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back 👋
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Sign in to continue your skill roadmap and connect with peers.
          </p>
        </div>

        <div className="bg-white py-8 px-6 sm:px-8 rounded-2xl border border-slate-200 shadow-md space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email / Student ID
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="swedha@skillmate.edu"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => alert('For hackathon demo accounts, the password is: password123 (or admin123 for admin).')}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo Users One-Click Sign In */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider text-center mb-3">
              ⚡ One-Click Hackathon Demo Logins
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('swedha@skillmate.edu', 'password123')}
                className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold border border-blue-200 text-left transition-colors"
              >
                👩 Swedha Jasmine
                <span className="block text-[10px] font-normal text-blue-600">Full Stack & Python</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('priya@skillmate.edu', 'password123')}
                className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-semibold border border-purple-200 text-left transition-colors"
              >
                👩 Priya
                <span className="block text-[10px] font-normal text-purple-600">Java & Spring Mentor</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('rahul@skillmate.edu', 'password123')}
                className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold border border-amber-200 text-left transition-colors"
              >
                👨 Rahul
                <span className="block text-[10px] font-normal text-amber-600">UI/UX & Figma Designer</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('meena@skillmate.edu', 'password123')}
                className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 font-semibold border border-rose-200 text-left transition-colors"
              >
                👩 Meena
                <span className="block text-[10px] font-normal text-rose-600">Dance & Music Artist</span>
              </button>
            </div>
            <div className="mt-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@skillmate.edu', 'admin123')}
                className="w-full p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border border-slate-300 text-center transition-colors flex items-center justify-center gap-1.5 text-xs"
              >
                <Shield className="w-3.5 h-3.5 text-slate-600" />
                SkillMate Administrator
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-600 pt-2">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-blue-600 font-bold hover:underline">
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
