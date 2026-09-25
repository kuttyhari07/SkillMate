import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import {
  Bell,
  CheckCircle,
  MessageSquare,
  Users,
  Award,
  Sparkles,
  Clock,
  CheckCheck
} from 'lucide-react';

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      // Fallback notifications for pleasant UX
      setNotifications([
        {
          id: 1,
          title: 'Welcome to SkillMate!',
          message: 'Your account is ready. Discover complementary skills and start exchanging knowledge.',
          type: 'system',
          read: false,
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="w-4 h-4 text-pink-400" />;
      case 'connection':
      case 'invite':
        return <Users className="w-4 h-4 text-indigo-400" />;
      case 'reward':
        return <Award className="w-4 h-4 text-amber-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-indigo-400" />
            Notifications
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Stay updated with your exchange invites, messages, and platform activity.
          </p>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 text-xs">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20 glass-card rounded-3xl border border-slate-800">
          <Bell className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">All caught up!</h3>
          <p className="text-xs text-slate-400 mt-1">No new alerts right now.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                n.read
                  ? 'bg-slate-900/40 border-slate-800/80 text-slate-400'
                  : 'glass-card border-indigo-500/30 text-slate-200'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                {getIcon(n.type)}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-semibold text-white">{n.title}</h4>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Recent'}
                  </span>
                </div>
                <p className="text-xs mt-1 leading-relaxed text-slate-300">{n.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
