import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  TrendingUp,
  Coins,
  Compass,
  ArrowRight,
  Award
} from 'lucide-react';

export default function MyLearning() {
  const { user } = useAuth();
  const [roadmapData, setRoadmapData] = useState(null);
  const [creditHistory, setCreditHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLearning = async () => {
      try {
        const [roadmapRes, creditsRes] = await Promise.all([
          api.get('/learning/roadmap/rd_fullstack'),
          api.get('/credits/history')
        ]);
        setRoadmapData(roadmapRes.data);
        setCreditHistory(creditsRes.data.transactions || []);
      } catch (err) {
        console.warn('Error loading learning data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLearning();
  }, []);

  const overallProgress = roadmapData?.progress?.overallProgress || 0;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <span className="text-xs font-bold text-blue-600 tracking-wider uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Student Portfolio
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            My Learning & Achievements
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Track your roadmaps, skill credit ledger, and learning hours.
          </p>
        </div>

        {/* Top 3 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Learning Hours</span>
            <p className="text-2xl sm:text-3xl font-black text-blue-600 flex items-center gap-2">
              <Clock className="w-6 h-6" /> {user?.learningHours || 18} Hours
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Skill Credits Balance</span>
            <p className="text-2xl sm:text-3xl font-black text-amber-500 flex items-center gap-2">
              <Coins className="w-6 h-6" /> {user?.skillCredits || 100}
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Path Completion</span>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 flex items-center gap-2">
              <TrendingUp className="w-6 h-6" /> {overallProgress}%
            </p>
          </div>
        </div>

        {/* Active Learning Goal */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Current Learning Goal
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                {roadmapData?.roadmap?.goalTitle || 'Full Stack Development'}
              </h3>
            </div>
            <Link
              to="/roadmap/rd_fullstack"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              Open Roadmap Tree
            </Link>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-500 font-semibold">
              <span>Path Progress</span>
              <span>{overallProgress}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Skill Credits Transaction Ledger */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Skill Credit Transaction Ledger</h3>
            <span className="text-xs text-slate-500">Transparent credit rewards</span>
          </div>

          <div className="space-y-2.5">
            {creditHistory.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No credit activity logged yet.</p>
            ) : (
              creditHistory.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs"
                >
                  <div>
                    <strong className="text-slate-900 block">{tx.description}</strong>
                    <span className="text-[10px] text-slate-400">
                      {new Date(tx.createdAt).toLocaleDateString()} at {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className={`font-black text-sm ${tx.amount > 0 ? 'text-emerald-600' : 'text-slate-700'}`}>
                      {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                    </span>
                    <span className="block text-[10px] text-slate-400">Balance: {tx.balanceAfter}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
