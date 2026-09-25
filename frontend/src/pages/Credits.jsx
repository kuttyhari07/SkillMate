import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import {
  Coins,
  Gift,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';

export default function Credits() {
  const { user, refreshUser } = useAuth();
  const [claimed, setClaimed] = useState(false);
  const [message, setMessage] = useState('');

  const handleClaimDaily = async () => {
    try {
      await api.post('/credits/claim-daily');
      setClaimed(true);
      setMessage('+25 Daily Skill Credits added to your wallet!');
      refreshUser?.();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      // Mock local fallback
      setClaimed(true);
      setMessage('Daily reward already claimed today! Check back tomorrow.');
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const sampleTransactions = [
    { id: 1, title: 'Welcome Bonus', amount: '+100', type: 'in', date: 'Account Creation' },
    { id: 2, title: 'MCQ Practice Drill Completed', amount: '+10', type: 'in', date: 'Today' },
    { id: 3, title: 'Peer Collaboration Session', amount: '+25', type: 'in', date: 'Yesterday' }
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-8 max-w-4xl mx-auto">
      {/* Wallet Card */}
      <div className="glass-card p-8 rounded-3xl border border-slate-800 mb-8 relative overflow-hidden bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <span className="text-xs uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1.5 mb-2">
              <Coins className="w-4 h-4 text-amber-400" />
              SkillMate Wallet Balance
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-white tracking-tight">
                {user?.credits ?? 100}
              </span>
              <span className="text-sm font-semibold text-slate-400">Credits</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Use credits to unlock 1-on-1 mentorship sessions and premium practice tracks.
            </p>
          </div>

          <div>
            <button
              onClick={handleClaimDaily}
              disabled={claimed}
              className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            >
              <Gift className="w-4 h-4" />
              <span>{claimed ? 'Claimed Today' : 'Claim Daily +25 Bonus'}</span>
            </button>
          </div>
        </div>

        {message && (
          <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{message}</span>
          </div>
        )}
      </div>

      {/* Ways to Earn Credits */}
      <div className="mb-8">
        <h3 className="text-base font-bold text-white mb-4">How to Earn Skill Credits</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card p-5 rounded-2xl border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Mentor a Peer</h4>
            <p className="text-xs text-slate-400">
              Host a 1-on-1 skill exchange session and earn up to 50 credits per verified lesson.
            </p>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Practice Lab Quizzes</h4>
            <p className="text-xs text-slate-400">
              Score high in MCQ quizzes and coding challenges to unlock bonus credit streaks.
            </p>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Daily Check-ins</h4>
            <p className="text-xs text-slate-400">
              Log in daily to claim free credits and keep your learning streak going strong.
            </p>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800">
        <h3 className="text-base font-bold text-white mb-4">Recent Wallet Activity</h3>
        <div className="space-y-3">
          {sampleTransactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <ArrowDownLeft className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">{tx.title}</h4>
                  <span className="text-[10px] text-slate-400">{tx.date}</span>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-400">{tx.amount} Credits</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
