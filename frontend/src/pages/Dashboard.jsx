import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import {
  Compass,
  ArrowRight,
  Sparkles,
  Users,
  Calendar,
  Award,
  Coins,
  CheckCircle2,
  BookOpen,
  MessageSquare,
  Clock,
  Video,
  Play,
  Zap,
  TrendingUp,
  BrainCircuit
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [roadmapData, setRoadmapData] = useState(null);
  const [smartMatches, setSmartMatches] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [roadmapRes, matchesRes, sessionsRes, aiRes] = await Promise.all([
          api.get('/learning/roadmap/rd_fullstack').catch(() => null),
          api.get('/matches').catch(() => ({ data: { matches: [] } })),
          api.get('/sessions').catch(() => ({ data: { sessions: [] } })),
          api.post('/ai/recommend', {}).catch(() => ({ data: { recommendation: null } }))
        ]);

        if (roadmapRes?.data) setRoadmapData(roadmapRes.data);
        if (matchesRes?.data?.matches) setSmartMatches(matchesRes.data.matches.slice(0, 3));
        if (sessionsRes?.data?.sessions) setUpcomingSessions(sessionsRes.data.sessions.slice(0, 2));
        if (aiRes?.data?.recommendation) setAiRecommendation(aiRes.data.recommendation);
      } catch (err) {
        console.warn('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const currentLevel = roadmapData?.levels?.find(l => l.status === 'in_progress') || roadmapData?.levels?.[0];
  const overallProgress = roadmapData?.progress?.overallProgress || 0;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Top Banner */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Student Learning Dashboard
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                Welcome back, {user?.name ? user.name.split(' ')[0] : 'Learner'} 👋
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                You're enrolled in <strong className="text-white">{roadmapData?.roadmap?.goalTitle || 'Full Stack Development'}</strong>.
                Continue your learning milestones and connect with peer mentors today!
              </p>
            </div>

            {/* Stats Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center">
                <p className="text-lg sm:text-xl font-black text-amber-300 flex items-center justify-center gap-1">
                  <Coins className="w-4 h-4" /> {user?.skillCredits || 100}
                </p>
                <p className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">Credits</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center">
                <p className="text-lg sm:text-xl font-black text-blue-300 flex items-center justify-center gap-1">
                  <Clock className="w-4 h-4" /> {user?.learningHours || 18}h
                </p>
                <p className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">Learning</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center col-span-2 sm:col-span-1">
                <p className="text-lg sm:text-xl font-black text-emerald-300 flex items-center justify-center gap-1">
                  <TrendingUp className="w-4 h-4" /> {overallProgress}%
                </p>
                <p className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">Completed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Learning Active Card */}
        {currentLevel && (
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  Level {currentLevel.levelNumber} • In Progress 🔵
                </span>
                <span className="text-xs text-slate-500">
                  Goal: {roadmapData?.roadmap?.goalTitle}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {currentLevel.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 line-clamp-2">
                {currentLevel.description}
              </p>

              {/* Progress Bar */}
              <div className="space-y-1.5 max-w-md">
                <div className="flex justify-between text-xs text-slate-500 font-medium">
                  <span>Overall Roadmap Progress</span>
                  <span>{overallProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
              <Link
                to={`/level/${currentLevel.id}`}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                Continue Learning
              </Link>
              <Link
                to={`/roadmap/rd_fullstack`}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm transition-colors text-center"
              >
                Full Roadmap
              </Link>
            </div>
          </div>
        )}

        {/* AI Recommendation Alert */}
        {aiRecommendation && (
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200/80 rounded-2xl p-5 flex items-start gap-4 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-indigo-950 text-sm">
                  💡 SkillMate AI Recommendation
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-200/60 text-indigo-800">
                  {aiRecommendation.badge}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-indigo-900/90 leading-relaxed">
                {aiRecommendation.message}
              </p>
            </div>
          </div>
        )}

        {/* 2-Column Grid: Smart Matches & Upcoming Sessions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Smart Student Matches */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Smart Student Matches</h3>
              </div>
              <Link to="/find-mates" className="text-xs text-blue-600 hover:underline font-semibold">
                View All Peers →
              </Link>
            </div>

            <div className="space-y-3">
              {smartMatches.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">Finding compatible skill mates...</p>
              ) : (
                smartMatches.map(({ user: peer, matchScore, reasons }) => (
                  <div
                    key={peer.id}
                    className="p-3.5 rounded-xl border border-slate-100 hover:border-blue-200 bg-slate-50/50 hover:bg-white transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={peer.avatar}
                          alt={peer.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900">{peer.name}</h4>
                          <p className="text-[11px] text-slate-500">{peer.college}</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {matchScore}% Match
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 space-y-0.5 pt-1">
                      {reasons.slice(0, 2).map((r, rIdx) => (
                        <p key={rIdx} className="flex items-center gap-1.5 text-slate-600">
                          <CheckCircle2 className="w-3 h-3 text-blue-600 shrink-0" />
                          <span>{r}</span>
                        </p>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex gap-1 text-[10px]">
                        <span className="font-semibold text-slate-500">Teaches:</span>
                        <span className="text-blue-700 font-medium truncate max-w-[140px]">
                          {(peer.skillsToTeach || []).map(s => s.skill || s).join(', ')}
                        </span>
                      </div>
                      <Link
                        to={`/messages?partner=${peer.id}`}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800"
                      >
                        Message Mate →
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Sessions */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Upcoming Sessions</h3>
              </div>
              <Link to="/sessions" className="text-xs text-blue-600 hover:underline font-semibold">
                Schedule New →
              </Link>
            </div>

            <div className="space-y-3">
              {upcomingSessions.length === 0 ? (
                <div className="text-center py-8 space-y-3">
                  <p className="text-xs text-slate-500">No scheduled sessions for today.</p>
                  <Link
                    to="/sessions"
                    className="inline-block text-xs font-semibold px-4 py-2 bg-blue-600 text-white rounded-xl shadow-xs"
                  >
                    Schedule a Peer Session
                  </Link>
                </div>
              ) : (
                upcomingSessions.map((sess) => (
                  <div
                    key={sess.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          {sess.skill}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm mt-1">{sess.topic}</h4>
                        <p className="text-xs text-slate-500">
                          With {sess.mentorId === user?.id ? sess.learnerName : sess.mentorName} ({sess.durationMinutes} min)
                        </p>
                      </div>
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                        {sess.date} @ {sess.time}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Video className="w-3.5 h-3.5 text-blue-600" />
                        {sess.isDemoMeeting ? 'SkillMate Demo Meeting Room' : 'Google Meet'}
                      </span>
                      {sess.meetingLink && (
                        <Link
                          to={sess.meetingLink.replace('http://localhost:5173', '')}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                        >
                          Join Meeting
                        </Link>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
