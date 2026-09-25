import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import {
  User,
  Star,
  Clock,
  BookOpen,
  GraduationCap,
  Award,
  Calendar,
  MessageSquare,
  Sparkles,
  MapPin,
  Languages
} from 'lucide-react';

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const targetId = id || currentUser?.id || 'usr_swedha';

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/users/${targetId}`);
        setProfileData(res.data);
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [targetId]);

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8 text-xs text-slate-500">Loading student profile...</div>;
  }

  const user = profileData?.user;
  const ratings = profileData?.ratings || [];
  const stats = profileData?.stats;

  if (!user) {
    return <div className="min-h-screen bg-slate-50 p-8 text-center text-sm text-slate-500">User profile not found.</div>;
  }

  const isMe = user.id === currentUser?.id;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-slate-200 shadow-md"
            />
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {user.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600">
                {user.department} • {user.year}
              </p>
              <p className="text-xs text-slate-500">{user.college}</p>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500">
                {user.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {user.location}
                  </span>
                )}
                {user.languages?.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Languages className="w-3.5 h-3.5 text-slate-400" /> {user.languages.join(', ')}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto shrink-0">
            {!isMe && (
              <>
                <Link
                  to={`/messages?partner=${user.id}`}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-4 h-4" /> Message
                </Link>
                <Link
                  to={`/sessions?partner=${user.id}`}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-4 h-4" /> Schedule Session
                </Link>
              </>
            )}
            {isMe && (
              <Link
                to="/profile-setup"
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
              >
                Edit Profile
              </Link>
            )}
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 text-center space-y-1">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Teaching Hours</span>
            <span className="text-xl sm:text-2xl font-black text-blue-600">{user.teachingHours || 8}h</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 text-center space-y-1">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Learning Hours</span>
            <span className="text-xl sm:text-2xl font-black text-indigo-600">{user.learningHours || 14}h</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 text-center space-y-1">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Skill Credits</span>
            <span className="text-xl sm:text-2xl font-black text-amber-500">{user.skillCredits || 100}</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 text-center space-y-1">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Average Rating</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600">{stats?.averageRating || 5.0} ★</span>
          </div>
        </div>

        {/* About & Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-slate-900">About Student</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
              "{user.bio || 'Passionate student learning and teaching on SkillMate.'}"
            </p>

            <div className="space-y-1 text-xs text-slate-500 pt-2 border-t border-slate-100">
              <p><strong>Availability:</strong> {user.availability || 'Flexible'}</p>
              <p><strong>Preferred Mode:</strong> {user.learningMode || 'Peer'} Learning</p>
            </div>
          </div>

          {/* Skills Breakdown */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">
                Skills I Can Teach
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {(user.skillsToTeach || []).map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-800 font-bold text-xs border border-blue-100"
                  >
                    {s.skill || s} ({s.level || 'Intermediate'})
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">
                Skills I Want To Learn
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {(user.skillsToLearn || []).map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-800 font-bold text-xs border border-indigo-100"
                  >
                    {s.skill || s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Ratings & Peer Reviews */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-base text-slate-900">Verified Peer Reviews ({ratings.length})</h3>
            <span className="text-xs text-amber-500 font-bold flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400" /> {stats?.averageRating || 5.0} / 5.0
            </span>
          </div>

          <div className="space-y-3">
            {ratings.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No reviews submitted yet.</p>
            ) : (
              ratings.map((r) => (
                <div key={r.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{r.reviewerName}</span>
                    <span className="text-slate-400 text-[10px]">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-600 italic">"{r.feedback}"</p>
                  <div className="flex gap-3 text-[10px] text-slate-400">
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
