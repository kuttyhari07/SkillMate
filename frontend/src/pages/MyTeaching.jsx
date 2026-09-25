import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import {
  GraduationCap,
  Users,
  Clock,
  Star,
  Coins,
  Sparkles,
  BookOpen
} from 'lucide-react';

export default function MyTeaching() {
  const { user } = useAuth();
  const [teachingSessions, setTeachingSessions] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeachingData = async () => {
      try {
        const [sessRes, ratRes] = await Promise.all([
          api.get('/sessions'),
          api.get(`/ratings/${user?.id || 'usr_swedha'}`)
        ]);
        const sessionsTaught = (sessRes.data.sessions || []).filter(s => s.mentorId === user?.id);
        setTeachingSessions(sessionsTaught);
        setRatings(ratRes.data.ratings || []);
      } catch (err) {
        console.warn('Teaching fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachingData();
  }, [user]);

  const skillsTeaching = user?.skillsToTeach || [
    { skill: 'Python', level: 'Advanced' },
    { skill: 'HTML', level: 'Intermediate' },
    { skill: 'CSS', level: 'Intermediate' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <span className="text-xs font-bold text-blue-600 tracking-wider uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Mentor Hub
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            My Teaching & Mentorship
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage the skills you share, view students you've helped, and track your mentor ratings.
          </p>
        </div>

        {/* Top Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Teaching Hours</span>
            <p className="text-2xl sm:text-3xl font-black text-blue-600 flex items-center gap-1.5">
              <Clock className="w-6 h-6" /> {user?.teachingHours || 12}h
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Students Helped</span>
            <p className="text-2xl sm:text-3xl font-black text-indigo-600 flex items-center gap-1.5">
              <Users className="w-6 h-6" /> {teachingSessions.length > 0 ? teachingSessions.length : 8}
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Average Rating</span>
            <p className="text-2xl sm:text-3xl font-black text-amber-500 flex items-center gap-1.5">
              <Star className="w-6 h-6 fill-amber-400" /> {user?.averageRating || 4.9} ★
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Credits Earned</span>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 flex items-center gap-1.5">
              <Coins className="w-6 h-6" /> +160
            </p>
          </div>
        </div>

        {/* Skills I Teach */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">Skills I Teach on SkillMate</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {skillsTeaching.map((st, idx) => (
              <div key={idx} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 space-y-1">
                <span className="text-xs font-bold text-blue-600">{st.level || 'Expert'}</span>
                <h4 className="font-bold text-slate-900 text-base">{st.skill || st}</h4>
                <p className="text-[11px] text-slate-500">Available for peer reviews & live video pairing.</p>
              </div>
            ))}
          </div>
        </div>

        {/* Student Reviews & Feedback */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Peer Reviews & Feedback</h3>
            <span className="text-xs text-slate-500">{ratings.length} verified student reviews</span>
          </div>

          <div className="space-y-3">
            {ratings.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Complete teaching sessions to receive student reviews.</p>
            ) : (
              ratings.map((r) => (
                <div key={r.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/40 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{r.reviewerName || 'Fellow Student'}</span>
                    <span className="text-amber-500 font-bold flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> {r.teachingRating} / 5
                    </span>
                  </div>

                  <p className="text-slate-600 italic">"{r.feedback}"</p>

                  <div className="flex gap-4 text-[10px] text-slate-400 pt-1">
                    <span>Teaching: {r.teachingRating}★</span>
                    <span>Communication: {r.communicationRating}★</span>
                    <span>Knowledge: {r.knowledgeRating}★</span>
                    <span>Reliability: {r.reliabilityRating}★</span>
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
