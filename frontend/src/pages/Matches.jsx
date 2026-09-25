import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import {
  Users,
  Search,
  Sparkles,
  ArrowRight,
  Send,
  MessageSquare,
  CheckCircle2,
  Clock,
  Check,
  X,
  Filter,
  GraduationCap
} from 'lucide-react';

export default function Matches() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('explore'); // 'explore' | 'requests' | 'connections'
  const [matches, setMatches] = useState([]);
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingInviteId, setSendingInviteId] = useState(null);
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'explore') {
        const res = await api.get('/matches');
        setMatches(res.data.matches || res.data || []);
      } else if (activeTab === 'requests') {
        const res = await api.get('/connections/requests');
        setPendingRequests(res.data || []);
      } else if (activeTab === 'connections') {
        const res = await api.get('/connections');
        setConnections(res.data || []);
      }
    } catch (err) {
      console.error('[Matches] Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvite = async (targetUserId, skillOffered, skillRequested) => {
    setSendingInviteId(targetUserId);
    setStatusMessage({ text: '', type: '' });

    try {
      await api.post('/connections/request', {
        receiverId: targetUserId,
        skillOffered: skillOffered || user?.skills?.[0] || 'General Learning',
        skillRequested: skillRequested || 'Peer Collaboration'
      });
      setStatusMessage({
        text: 'Exchange invitation sent! An email notification was dispatched to your peer.',
        type: 'success'
      });
      // Refresh list
      fetchData();
    } catch (err) {
      setStatusMessage({
        text: err.response?.data?.message || 'Failed to send invite',
        type: 'error'
      });
    } finally {
      setSendingInviteId(null);
      setTimeout(() => setStatusMessage({ text: '', type: '' }), 5000);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await api.post(`/connections/respond/${requestId}`, { status: 'accepted' });
      fetchData();
    } catch (err) {
      console.error('Error accepting:', err);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await api.post(`/connections/respond/${requestId}`, { status: 'rejected' });
      fetchData();
    } catch (err) {
      console.error('Error rejecting:', err);
    }
  };

  const filteredMatches = matches.filter((m) => {
    const targetUser = m.user || m;
    const nameMatch = targetUser.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const skillMatch = targetUser.skills?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const interestMatch = targetUser.interests?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return nameMatch || skillMatch || interestMatch;
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-indigo-400" />
            Skill Matchmaking Hub
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Discover peers who teach what you want to learn, and trade knowledge.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('explore')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'explore'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Explore Matches
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'requests'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Pending Requests
          </button>
          <button
            onClick={() => setActiveTab('connections')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'connections'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            My Connections
          </button>
        </div>
      </div>

      {/* Status banner */}
      {statusMessage.text && (
        <div
          className={`mb-6 p-4 rounded-2xl text-xs flex items-center gap-2 border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Search Input for Explore */}
      {activeTab === 'explore' && (
        <div className="mb-6 relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by skill (e.g. React, Python) or name..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      )}

      {/* CONTENT: EXPLORE MATCHES */}
      {activeTab === 'explore' && (
        <div>
          {loading ? (
            <div className="text-center py-20 text-slate-400">Loading recommended matches...</div>
          ) : filteredMatches.length === 0 ? (
            <div className="text-center py-20 glass-card rounded-3xl border border-slate-800">
              <Users className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white">No matches found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Try expanding your search query or updating your skills in your profile!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMatches.map((m) => {
                const partner = m.user || m;
                const matchScore = m.compatibility || m.matchScore || 85;
                const isSelf = partner.id === user?.id;
                if (isSelf) return null;

                return (
                  <div
                    key={partner.id}
                    className="glass-card p-6 rounded-3xl border border-slate-800 flex flex-col justify-between group hover:border-indigo-500/40"
                  >
                    <div>
                      {/* Top bar with avatar & compatibility */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          {partner.avatar ? (
                            <img
                              src={partner.avatar}
                              alt={partner.name}
                              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500/40"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 flex items-center justify-center text-indigo-300 font-bold text-base ring-2 ring-indigo-500/40">
                              {partner.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                          )}
                          <div>
                            <h3 className="text-base font-semibold text-white group-hover:text-indigo-300 transition-colors">
                              {partner.name}
                            </h3>
                            <span className="text-xs text-slate-400 block truncate max-w-[150px]">
                              {partner.university || 'SkillMate Member'}
                            </span>
                          </div>
                        </div>

                        {/* Match score badge */}
                        <div className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-emerald-400" />
                          <span>{matchScore}%</span>
                        </div>
                      </div>

                      {/* Bio */}
                      {partner.bio && (
                        <p className="text-xs text-slate-300 mb-4 line-clamp-2 italic">
                          "{partner.bio}"
                        </p>
                      )}

                      {/* Skills offered */}
                      <div className="mb-3">
                        <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider block mb-1.5">
                          Teaches (Offers):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {partner.skills?.slice(0, 4).map((s) => (
                            <span
                              key={s}
                              className="px-2.5 py-0.5 rounded-lg text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Skills wanted */}
                      <div className="mb-4">
                        <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider block mb-1.5">
                          Wants to Learn:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {partner.interests?.slice(0, 4).map((s) => (
                            <span
                              key={s}
                              className="px-2.5 py-0.5 rounded-lg text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t border-slate-800 flex items-center gap-2">
                      <button
                        onClick={() => handleSendInvite(partner.id, user?.skills?.[0], partner.skills?.[0])}
                        disabled={sendingInviteId === partner.id}
                        className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{sendingInviteId === partner.id ? 'Sending...' : 'Invite Peer'}</span>
                      </button>
                      <button
                        onClick={() => navigate(`/chat?partnerId=${partner.id}`)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                        title="Direct Message"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CONTENT: PENDING REQUESTS */}
      {activeTab === 'requests' && (
        <div>
          {loading ? (
            <div className="text-center py-20 text-slate-400">Loading requests...</div>
          ) : pendingRequests.length === 0 ? (
            <div className="text-center py-20 glass-card rounded-3xl border border-slate-800">
              <Clock className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white">No pending requests</h3>
              <p className="text-xs text-slate-400 mt-1">
                When someone invites you to exchange skills, you'll see it here!
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-w-2xl mx-auto">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600/30 flex items-center justify-center text-indigo-300 font-bold text-sm">
                      {req.senderName?.[0] || 'U'}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{req.senderName || 'Peer Member'}</h4>
                      <p className="text-xs text-slate-400">
                        Offers <strong className="text-indigo-300">{req.skillOffered}</strong> in exchange for{' '}
                        <strong className="text-purple-300">{req.skillRequested}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleAcceptRequest(req.id)}
                      className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                    >
                      <Check className="w-3.5 h-3.5" /> Accept
                    </button>
                    <button
                      onClick={() => handleRejectRequest(req.id)}
                      className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center justify-center gap-1 transition-all"
                    >
                      <X className="w-3.5 h-3.5" /> Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CONTENT: MY CONNECTIONS */}
      {activeTab === 'connections' && (
        <div>
          {loading ? (
            <div className="text-center py-20 text-slate-400">Loading your connections...</div>
          ) : connections.length === 0 ? (
            <div className="text-center py-20 glass-card rounded-3xl border border-slate-800">
              <Users className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white">No active connections yet</h3>
              <p className="text-xs text-slate-400 mt-1">
                Invite peers from the Explore tab to start learning together!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {connections.map((c) => {
                const partner = c.partner || c;
                return (
                  <div
                    key={c.id || partner.id}
                    className="glass-card p-6 rounded-3xl border border-slate-800 flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      {partner.avatar ? (
                        <img
                          src={partner.avatar}
                          alt={partner.name}
                          className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500/40"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-emerald-600/30 flex items-center justify-center text-emerald-300 font-bold text-base">
                          {partner.name?.[0] || 'U'}
                        </div>
                      )}
                      <div>
                        <h3 className="text-base font-semibold text-white">{partner.name}</h3>
                        <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                          <CheckCircle2 className="w-3 h-3" /> Active Connection
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800 flex gap-2">
                      <button
                        onClick={() => navigate(`/chat?partnerId=${partner.id}`)}
                        className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Start Chat
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
