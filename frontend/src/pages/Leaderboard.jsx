import React, { useState, useEffect } from 'react';
import api from '../api/client';
import {
  Trophy,
  Award,
  Star,
  Users,
  Clock,
  Sparkles,
  Flame,
  Code,
  Target,
  HeartHandshake,
  BookOpen
} from 'lucide-react';

export default function Leaderboard() {
  const [data, setData] = useState({ topMentors: [], topLearners: [], highestRated: [] });
  const [activeTab, setActiveTab] = useState('mentors');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get('/credits/leaderboard');
        setData(res.data);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const badgesList = [
    { title: 'First Skill Exchange', icon: Trophy, color: 'text-amber-500 bg-amber-50', desc: 'Completed your very first peer skill session.' },
    { title: '7 Day Learning Streak', icon: Flame, color: 'text-orange-500 bg-orange-50', desc: 'Maintained active daily practice for a full week.' },
    { title: 'Top Mentor', icon: Star, color: 'text-blue-500 bg-blue-50', desc: 'Taught over 10 hours with 4.8+ peer feedback.' },
    { title: 'Coding Explorer', icon: Code, color: 'text-indigo-500 bg-indigo-50', desc: 'Solved 10+ browser-based coding challenges.' },
    { title: 'Practice Master', icon: Target, color: 'text-purple-500 bg-purple-50', desc: 'Completed all level practice tasks & mini challenges.' },
    { title: 'Community Helper', icon: HeartHandshake, color: 'text-emerald-500 bg-emerald-50', desc: 'Reviewed 5 peer code submissions.' },
    { title: 'Fast Learner', icon: BookOpen, color: 'text-sky-500 bg-sky-50', desc: 'Passed level MCQ with 80%+ on the first try.' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <span className="text-xs font-bold text-blue-600 tracking-wider uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Community Honors
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Community Leaderboard & Badges
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Celebrating collaborative peer mentors and dedicated student learners.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 gap-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('mentors')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'mentors' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500'
            }`}
          >
            Top Mentors 🏆
          </button>
          <button
            onClick={() => setActiveTab('learners')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'learners' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500'
            }`}
          >
            Top Learners 🚀
          </button>
          <button
            onClick={() => setActiveTab('highestRated')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'highestRated' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500'
            }`}
          >
            Highest Rated ⭐
          </button>
        </div>

        {/* Leaderboard Table Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
          {activeTab === 'mentors' && (
            <div className="space-y-3">
              {(data.topMentors || []).map((m, idx) => (
                <div key={m.id} className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center font-black ${
                      idx === 0 ? 'bg-amber-100 text-amber-800' :
                      idx === 1 ? 'bg-slate-200 text-slate-700' :
                      idx === 2 ? 'bg-orange-100 text-orange-800' : 'text-slate-400'
                    }`}>
                      #{idx + 1}
                    </span>
                    <img src={m.avatar} alt={m.name} className="w-10 h-10 rounded-full object-cover border" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{m.name}</h4>
                      <p className="text-[11px] text-slate-500">{m.college}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-extrabold text-blue-600 text-sm block">{m.teachingHours} Hours Taught</span>
                    <span className="text-[10px] text-amber-500 font-bold">{m.averageRating} ★</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'learners' && (
            <div className="space-y-3">
              {(data.topLearners || []).map((l, idx) => (
                <div key={l.id} className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center font-black ${
                      idx === 0 ? 'bg-amber-100 text-amber-800' :
                      idx === 1 ? 'bg-slate-200 text-slate-700' :
                      idx === 2 ? 'bg-orange-100 text-orange-800' : 'text-slate-400'
                    }`}>
                      #{idx + 1}
                    </span>
                    <img src={l.avatar} alt={l.name} className="w-10 h-10 rounded-full object-cover border" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{l.name}</h4>
                      <p className="text-[11px] text-slate-500">{l.college}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-extrabold text-emerald-600 text-sm block">{l.learningHours} Hours Studied</span>
                    <span className="text-[10px] text-slate-400">{l.skillCredits} Credits</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'highestRated' && (
            <div className="space-y-3">
              {(data.highestRated || []).map((h, idx) => (
                <div key={h.id} className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full flex items-center justify-center font-black text-slate-400">
                      #{idx + 1}
                    </span>
                    <img src={h.avatar} alt={h.name} className="w-10 h-10 rounded-full object-cover border" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{h.name}</h4>
                      <p className="text-[11px] text-slate-500">{h.college}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-black text-amber-500 text-sm flex items-center gap-1 justify-end">
                      <Star className="w-4 h-4 fill-amber-400" /> {h.averageRating} ★
                    </span>
                    <span className="text-[10px] text-slate-400">({h.reviewsCount || 0} reviews)</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Badges Showcase Gallery */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">SkillMate Achievement Badges</h3>
              <p className="text-xs text-slate-500">Milestones awarded for peer mentorship, consistency, and challenge mastery.</p>
            </div>
            <Award className="w-6 h-6 text-amber-500" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {badgesList.map((badge, idx) => {
              const Icon = badge.icon;
              return (
                <div key={idx} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${badge.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-xs text-slate-900">{badge.title}</h4>
                    <p className="text-[11px] text-slate-500 leading-snug">{badge.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
