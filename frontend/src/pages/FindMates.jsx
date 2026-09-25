import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import MilestoneModal from '../components/MilestoneModal';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  MessageSquare,
  UserPlus,
  Calendar,
  Sparkles,
  Award,
  GraduationCap,
  Clock,
  Star
} from 'lucide-react';

export default function FindMates() {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [connections, setConnections] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedMode, setSelectedMode] = useState('');
  const [loading, setLoading] = useState(true);
  const [connectingId, setConnectingId] = useState(null);
  const [celebrationPartner, setCelebrationPartner] = useState(null);

  const fetchMatchesAndConnections = async () => {
    try {
      const [matchesRes, connRes] = await Promise.all([
        api.get('/matches'),
        api.get('/connections')
      ]);
      setMatches(matchesRes.data.matches || []);
      setConnections(connRes.data.connections || []);
    } catch (err) {
      console.warn('Error fetching peer matches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatchesAndConnections();
  }, []);

  const handleConnect = async (targetUser, offeredSkill, requestedSkill) => {
    setConnectingId(targetUser.id);
    try {
      const res = await api.post('/connections', {
        recipientId: targetUser.id,
        skillOffered: offeredSkill || (user?.skillsToTeach?.[0]?.skill || 'Python'),
        skillRequested: requestedSkill || (targetUser.skillsToTeach?.[0]?.skill || 'Java')
      });
      alert(`Connection request sent to ${targetUser.name}! An email and in-app notification were dispatched.`);
      fetchMatchesAndConnections();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not send connection request.');
    } finally {
      setConnectingId(null);
    }
  };

  const handleAcceptConnection = async (connectionId, partnerName) => {
    try {
      await api.put(`/connections/${connectionId}`, { status: 'accepted' });
      setCelebrationPartner(partnerName);
      fetchMatchesAndConnections();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating connection');
    }
  };

  // Filtration logic
  const filteredMatches = matches.filter(({ user: peer }) => {
    const sTerm = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm ||
      peer.name.toLowerCase().includes(sTerm) ||
      (peer.skillsToTeach || []).some(s => (s.skill || s).toLowerCase().includes(sTerm)) ||
      (peer.skillsToLearn || []).some(s => (s.skill || s).toLowerCase().includes(sTerm));

    const matchesDept = !selectedDept || (peer.department && peer.department.toLowerCase().includes(selectedDept.toLowerCase()));
    const matchesMode = !selectedMode || peer.learningMode === selectedMode;

    return matchesSearch && matchesDept && matchesMode;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-blue-600 tracking-wider uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Smart Matching Engine
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Find Your Skill Mates
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm max-w-2xl">
            Our algorithm pairs you with students based on mutual skill exchange (they teach what you want to learn, and learn what you teach).
          </p>
        </div>

        {/* Pending Requests Banner (if any) */}
        {connections.some(c => c.status === 'pending' && c.recipientId === user?.id) && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-amber-900 text-sm flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-amber-700" />
              Incoming Connection Requests Waiting for Your Response
            </h3>
            <div className="space-y-2">
              {connections.filter(c => c.status === 'pending' && c.recipientId === user?.id).map((c) => (
                <div key={c.id} className="bg-white p-3.5 rounded-xl border border-amber-200 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-slate-900 text-xs">{c.partner?.name || 'Fellow Student'}</p>
                    <p className="text-[11px] text-slate-600">
                      Offers to teach: <strong>{c.skillOffered}</strong> • Wants to learn: <strong>{c.skillRequested}</strong>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptConnection(c.id, c.partner?.name)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs"
                    >
                      Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search skill (e.g. Java, Python, UI/UX)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500/20 text-slate-900"
            />
          </div>

          <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700"
            >
              <option value="">All Departments</option>
              <option value="Computer">Computer Science / IT</option>
              <option value="Design">Design & Arts</option>
              <option value="Media">Media & Performing Arts</option>
            </select>

            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700"
            >
              <option value="">All Modes</option>
              <option value="Peer">Peer Learning</option>
              <option value="Live">Live Sessions</option>
              <option value="Self">Self Learning</option>
            </select>
          </div>
        </div>

        {/* Peer Match Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map(({ user: peer, matchScore, reasons }) => {
            const existingConn = connections.find(
              c => (c.requesterId === peer.id || c.recipientId === peer.id)
            );
            const isConnected = existingConn?.status === 'accepted';
            const isPending = existingConn?.status === 'pending';

            return (
              <div
                key={peer.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all p-6 flex flex-col justify-between space-y-5"
              >
                {/* Header with Avatar and Match Score */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={peer.avatar}
                        alt={peer.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-slate-200"
                      />
                      <div>
                        <h3 className="font-bold text-slate-900 text-base leading-tight">
                          {peer.name}
                        </h3>
                        <p className="text-[11px] text-slate-500">{peer.college}</p>
                        <p className="text-[10px] text-slate-400">{peer.department} • {peer.year}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                        {matchScore}% Match
                      </span>
                      <div className="flex items-center gap-1 justify-end text-[11px] font-bold text-amber-500 mt-1">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{peer.averageRating || 4.9}</span>
                        <span className="text-slate-400 font-normal">({peer.reviewsCount || 10})</span>
                      </div>
                    </div>
                  </div>

                  {/* Skills Pills */}
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Can Teach:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {(peer.skillsToTeach || []).map((st, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-800 font-semibold text-[11px] border border-blue-100"
                          >
                            {st.skill || st} ({st.level || 'Adv'})
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Wants to Learn:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {(peer.skillsToLearn || []).map((sl, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-800 font-semibold text-[11px] border border-indigo-100"
                          >
                            {sl.skill || sl}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Match Rationale Box */}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                      Why you match:
                    </span>
                    {reasons.slice(0, 3).map((r, rIdx) => (
                      <p key={rIdx} className="text-[11px] text-slate-600 flex items-start gap-1.5 leading-snug">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </p>
                    ))}
                  </div>

                  <p className="text-xs text-slate-600 italic line-clamp-2">
                    "{peer.bio}"
                  </p>
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  {isConnected ? (
                    <>
                      <Link
                        to={`/messages?partner=${peer.id}`}
                        className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold text-center transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Message
                      </Link>
                      <Link
                        to={`/sessions?partner=${peer.id}`}
                        className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold text-center transition-colors flex items-center justify-center gap-1"
                      >
                        <Calendar className="w-3.5 h-3.5" /> Session
                      </Link>
                    </>
                  ) : isPending ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-semibold"
                    >
                      Request Sent (Pending)
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConnect(peer)}
                      disabled={connectingId === peer.id}
                      className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <UserPlus className="w-4 h-4" />
                      {connectingId === peer.id ? 'Connecting...' : 'Connect Skill Mates'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Milestone Connected Modal */}
      {celebrationPartner && (
        <MilestoneModal
          isOpen={Boolean(celebrationPartner)}
          onClose={() => setCelebrationPartner(null)}
          title="🤝 You're now Skill Mates!"
          badgeText="Exchange Unlocked"
          message={`You are now connected with ${celebrationPartner}! You can start direct real-time messaging, exchange peer challenges, and schedule Google Meet sessions.`}
          actionText="Open Messages"
          onAction={() => navigate('/messages')}
        />
      )}
    </div>
  );
}
