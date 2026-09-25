import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import MilestoneModal from '../components/MilestoneModal';
import {
  Calendar,
  Clock,
  Video,
  Plus,
  CheckCircle2,
  Sparkles,
  Star,
  Users,
  BrainCircuit,
  ArrowRight,
  X
} from 'lucide-react';

export default function Sessions() {
  const { user, refreshUser } = useAuth();
  const [searchParams] = useSearchParams();
  const partnerFromQuery = searchParams.get('partner');

  const [sessions, setSessions] = useState([]);
  const [connections, setConnections] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedSessionForRating, setSelectedSessionForRating] = useState(null);
  const [loading, setLoading] = useState(true);

  // New session form state
  const [newSession, setNewSession] = useState({
    partnerId: partnerFromQuery || '',
    skill: 'Full Stack Development',
    topic: 'HTML & CSS Layout Pairing',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '19:00',
    durationMinutes: 60,
    mode: 'online',
    role: 'mentor'
  });

  // Rating form state
  const [ratingData, setRatingData] = useState({
    teachingRating: 5,
    communicationRating: 5,
    knowledgeRating: 5,
    reliabilityRating: 5,
    feedback: 'Fantastic session, explained concepts with great practical walkthroughs!'
  });

  const fetchSessionsAndPartners = async () => {
    try {
      const [sessRes, connRes] = await Promise.all([
        api.get('/sessions'),
        api.get('/connections')
      ]);
      setSessions(sessRes.data.sessions || []);
      const accepted = (connRes.data.connections || []).filter(c => c.status === 'accepted');
      setConnections(accepted);
      if (accepted.length > 0 && !newSession.partnerId) {
        setNewSession(prev => ({ ...prev, partnerId: accepted[0].partner?.id || '' }));
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionsAndPartners();
  }, [partnerFromQuery]);

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/sessions', newSession);
      alert('🎉 Session scheduled successfully! Meeting room and AI agenda generated.');
      setShowScheduleModal(false);
      fetchSessionsAndPartners();
    } catch (err) {
      alert('Error scheduling session: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCompleteSession = async (session) => {
    try {
      await api.put(`/sessions/${session.id}`, { status: 'completed' });
      await refreshUser();
      setSelectedSessionForRating(session);
      setShowRatingModal(true);
      fetchSessionsAndPartners();
    } catch (err) {
      alert('Error completing session: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSessionForRating) return;
    try {
      const targetUserId = selectedSessionForRating.mentorId === user.id
        ? selectedSessionForRating.learnerId
        : selectedSessionForRating.mentorId;

      await api.post('/ratings', {
        sessionId: selectedSessionForRating.id,
        targetUserId,
        ...ratingData
      });
      alert('⭐ Rating and review submitted! Thank you for fostering a supportive community.');
      setShowRatingModal(false);
      fetchSessionsAndPartners();
    } catch (err) {
      alert('Error submitting rating: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-blue-600 tracking-wider uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Peer Learning Sessions
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Live Learning Sessions
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              1-on-1 scheduled sessions with automated AI agendas and online meeting rooms.
            </p>
          </div>

          <button
            onClick={() => setShowScheduleModal(true)}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-colors flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" /> Schedule New Session
          </button>
        </div>

        {/* Sessions List */}
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-700 text-base">No Sessions Scheduled</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Connect with a peer mate and schedule a session to start exchanging live skills!
              </p>
              <button
                onClick={() => setShowScheduleModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
              >
                Schedule First Session
              </button>
            </div>
          ) : (
            sessions.map((sess) => {
              const isMentor = sess.mentorId === user?.id;
              const partnerName = isMentor ? sess.learnerName : sess.mentorName;
              const isCompleted = sess.status === 'completed';

              return (
                <div
                  key={sess.id}
                  className={`bg-white rounded-3xl p-6 sm:p-7 border shadow-xs transition-all space-y-5 ${
                    isCompleted ? 'border-emerald-200 bg-slate-50/40' : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          {sess.skill}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isCompleted ? 'Completed ✓' : 'Scheduled'}
                        </span>
                        <span className="text-xs text-slate-500">
                          {isMentor ? 'You are Teaching' : 'You are Learning'}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900">{sess.topic}</h3>
                      <p className="text-xs text-slate-600">
                        Session Partner: <strong>{partnerName}</strong> • Duration: {sess.durationMinutes} minutes
                      </p>
                    </div>

                    <div className="sm:text-right shrink-0">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl text-xs font-bold text-slate-800">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>{sess.date} at {sess.time}</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Generated Agenda Box */}
                  {sess.agenda?.length > 0 && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                      <p className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <BrainCircuit className="w-3.5 h-3.5 text-indigo-600" />
                        AI-Generated Session Plan:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                        {sess.agenda.map((ag, idx) => (
                          <div key={idx} className="bg-white p-2.5 rounded-xl border border-slate-200/80 space-y-0.5">
                            <span className="text-[10px] font-bold text-blue-600 block">{ag.time}</span>
                            <strong className="text-slate-800 block">{ag.topic}</strong>
                            <p className="text-[11px] text-slate-500 line-clamp-2">{ag.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                    <span className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-blue-600" />
                      {sess.isDemoMeeting ? 'SkillMate Demo Online Room' : 'Google Meet'}
                    </span>

                    <div className="flex items-center gap-2">
                      {!isCompleted && sess.meetingLink && (
                        <Link
                          to={sess.meetingLink.replace('http://localhost:5173', '')}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                        >
                          Join Online Room
                        </Link>
                      )}

                      {!isCompleted && (
                        <button
                          onClick={() => handleCompleteSession(sess)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                        >
                          Mark Completed
                        </button>
                      )}

                      {isCompleted && (
                        <button
                          onClick={() => {
                            setSelectedSessionForRating(sess);
                            setShowRatingModal(true);
                          }}
                          className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-semibold border border-amber-200 transition-colors flex items-center gap-1"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-400" /> Give Feedback
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Schedule Session Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative animate-in zoom-in-95">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold text-slate-900 mb-1">Schedule Learning Session</h3>
              <p className="text-xs text-slate-500 mb-6">Connect via interactive video with AI agenda support.</p>

              <form onSubmit={handleScheduleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Partner *</label>
                  <select
                    value={newSession.partnerId}
                    onChange={(e) => setNewSession({ ...newSession, partnerId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-900"
                    required
                  >
                    {connections.map((c) => (
                      <option key={c.partner?.id} value={c.partner?.id}>
                        {c.partner?.name} ({c.partner?.college})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Skill</label>
                    <input
                      type="text"
                      value={newSession.skill}
                      onChange={(e) => setNewSession({ ...newSession, skill: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Topic</label>
                    <input
                      type="text"
                      value={newSession.topic}
                      onChange={(e) => setNewSession({ ...newSession, topic: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Date</label>
                    <input
                      type="date"
                      value={newSession.date}
                      onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Time</label>
                    <input
                      type="time"
                      value={newSession.time}
                      onChange={(e) => setNewSession({ ...newSession, time: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Duration</label>
                    <select
                      value={newSession.durationMinutes}
                      onChange={(e) => setNewSession({ ...newSession, durationMinutes: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-900"
                    >
                      <option value="30">30 min</option>
                      <option value="60">60 min</option>
                      <option value="90">90 min</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
                >
                  Confirm & Generate Meeting Link
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Rating & Feedback Modal */}
        {showRatingModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative animate-in zoom-in-95">
              <button
                onClick={() => setShowRatingModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold text-slate-900 mb-1">Session Feedback</h3>
              <p className="text-xs text-slate-500 mb-6">Rate your peer mate across 4 key criteria.</p>

              <form onSubmit={handleRatingSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Teaching (1-5)</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={ratingData.teachingRating}
                      onChange={(e) => setRatingData({ ...ratingData, teachingRating: e.target.value })}
                      className="w-full p-2 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Communication (1-5)</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={ratingData.communicationRating}
                      onChange={(e) => setRatingData({ ...ratingData, communicationRating: e.target.value })}
                      className="w-full p-2 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Knowledge (1-5)</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={ratingData.knowledgeRating}
                      onChange={(e) => setRatingData({ ...ratingData, knowledgeRating: e.target.value })}
                      className="w-full p-2 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Reliability (1-5)</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={ratingData.reliabilityRating}
                      onChange={(e) => setRatingData({ ...ratingData, reliabilityRating: e.target.value })}
                      className="w-full p-2 rounded-xl border border-slate-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Review & Comments</label>
                  <textarea
                    rows={3}
                    value={ratingData.feedback}
                    onChange={(e) => setRatingData({ ...ratingData, feedback: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
                >
                  Submit Review & Reward Skill Credits
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
