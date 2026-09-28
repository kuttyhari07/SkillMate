import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Bell,
  CheckCircle2,
  MessageSquare,
  Users,
  Award,
  Sparkles,
  Clock,
  CheckCheck,
  Trash2,
  Mail,
  Send,
  Settings,
  ShieldCheck,
  Check,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Calendar,
  BookOpen,
  Eye,
  X
} from 'lucide-react';

export default function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State
  const [activeTab, setActiveTab] = useState('inapp'); // 'inapp' | 'email_settings' | 'email_logs'
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'connection' | 'session' | 'practice'
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Email Notification Settings State
  const [emailPrefs, setEmailPrefs] = useState({
    emailOnConnection: true,
    emailOnSession: true,
    emailOnPractice: true,
    emailOnMessage: true,
    emailWeeklyDigest: false
  });
  const [activeProvider, setActiveProvider] = useState('auto');
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefSuccess, setPrefSuccess] = useState('');

  // Test Email State
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Email Logs State
  const [emailLogs, setEmailLogs] = useState([]);
  const [selectedEmailPreview, setSelectedEmailPreview] = useState(null);

  useEffect(() => {
    fetchNotifications();
    fetchEmailPreferences();
    fetchEmailLogs();
    if (user?.email) {
      setTestEmailAddress(user.email);
    }
  }, [user]);

  // Fetch in-app notifications
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      const list = res.data?.notifications || (Array.isArray(res.data) ? res.data : []);
      setNotifications(list);
      setUnreadCount(res.data?.unreadCount || list.filter(n => !n.read).length);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch email notification preferences
  const fetchEmailPreferences = async () => {
    try {
      const res = await api.get('/notifications/preferences');
      if (res.data?.preferences) {
        setEmailPrefs(res.data.preferences);
      }
      if (res.data?.activeProvider) {
        setActiveProvider(res.data.activeProvider);
      }
    } catch (err) {
      console.warn('Error fetching email preferences:', err);
    }
  };

  // Fetch email logs
  const fetchEmailLogs = async () => {
    try {
      const res = await api.get('/email/logs');
      setEmailLogs(res.data?.logs || []);
    } catch (err) {
      console.warn('Error fetching email logs:', err);
    }
  };

  // Mark single notification read
  const markAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  // Mark all read
  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  // Delete notification
  const deleteNotification = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    if (!window.confirm('Are you sure you want to clear all notifications?')) return;
    try {
      await api.delete('/notifications/clear-all');
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  // Save email preferences
  const handleSavePreferences = async () => {
    setSavingPrefs(true);
    setPrefSuccess('');
    try {
      await api.put('/notifications/preferences', emailPrefs);
      setPrefSuccess('Email notification preferences saved successfully!');
      setTimeout(() => setPrefSuccess(''), 4000);
    } catch (err) {
      alert('Failed to save preferences: ' + (err.response?.data?.message || err.message));
    } finally {
      setSavingPrefs(false);
    }
  };

  // Send Test Email
  const handleSendTestEmail = async (e) => {
    e.preventDefault();
    if (!testEmailAddress) return;

    setSendingTest(true);
    setTestResult(null);

    try {
      const res = await api.post('/notifications/send-test-email', {
        email: testEmailAddress
      });
      setTestResult({
        success: true,
        message: res.data.message || `Test email dispatched to ${testEmailAddress}!`,
        mode: res.data.mode
      });
      fetchNotifications();
      fetchEmailLogs();
    } catch (err) {
      setTestResult({
        success: false,
        message: err.response?.data?.message || 'Failed to dispatch test email.'
      });
    } finally {
      setSendingTest(false);
    }
  };

  // Get icon for notification type
  const getIcon = (type) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case 'connection_request':
      case 'connection_accepted':
      case 'connection':
      case 'invite':
        return <Users className="w-4 h-4 text-emerald-600" />;
      case 'session_scheduled':
      case 'session':
        return <Calendar className="w-4 h-4 text-purple-600" />;
      case 'practice_assigned':
      case 'practice_completed':
      case 'practice':
        return <BookOpen className="w-4 h-4 text-amber-600" />;
      case 'reward':
      case 'credit':
        return <Award className="w-4 h-4 text-amber-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-blue-600" />;
    }
  };

  // Filtered notifications
  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'connection') return n.type?.includes('connection') || n.type === 'invite';
    if (filter === 'session') return n.type?.includes('session');
    if (filter === 'practice') return n.type?.includes('practice');
    return true;
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Page Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    Notification & Email Center
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 text-xs font-bold bg-blue-600 text-white rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Manage in-app notifications, peer exchange alerts, and real-time email deliveries.
                  </p>
                </div>
              </div>
            </div>

            {/* Provider Status Pill */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Email Provider: </span>
                <strong className="text-slate-900 uppercase font-bold">{activeProvider}</strong>
              </div>
              <button
                onClick={() => { fetchNotifications(); fetchEmailLogs(); }}
                title="Refresh"
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 border-b border-slate-100 pb-1">
            <button
              onClick={() => setActiveTab('inapp')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'inapp'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>In-App Alerts ({notifications.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('email_settings')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'email_settings'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Delivery & Preferences</span>
            </button>

            <button
              onClick={() => setActiveTab('email_logs')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'email_logs'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Dispatched Emails ({emailLogs.length})</span>
            </button>
          </div>
        </div>

        {/* TAB 1: IN-APP ALERTS */}
        {activeTab === 'inapp' && (
          <div className="space-y-4">
            {/* Filter & Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {['all', 'unread', 'connection', 'session', 'practice'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                      filter === f
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <>
                    <button
                      onClick={markAllRead}
                      className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Mark all read</span>
                    </button>
                    <button
                      onClick={clearAllNotifications}
                      className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear all</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Notification List */}
            {loading ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-500">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">All caught up!</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  You have no pending notifications matching this filter. New exchange requests, messages, and session invites will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => !notif.read && markAsRead(notif.id)}
                    className={`p-4 rounded-xl border transition-all flex items-start gap-3.5 cursor-pointer ${
                      notif.read
                        ? 'bg-white border-slate-200 opacity-80 hover:opacity-100'
                        : 'bg-blue-50/40 border-blue-200 shadow-xs'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center shrink-0 mt-0.5">
                      {getIcon(notif.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900">{notif.title}</h4>
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3" />
                          {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>

                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100/80">
                        {notif.actionLink ? (
                          <Link
                            to={notif.actionLink}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            <span>Open details</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        ) : (
                          <span></span>
                        )}

                        <div className="flex items-center gap-2">
                          {!notif.read && (
                            <button
                              onClick={(e) => markAsRead(notif.id, e)}
                              className="text-[11px] text-slate-500 hover:text-blue-600 flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              <span>Mark read</span>
                            </button>
                          )}
                          <button
                            onClick={(e) => deleteNotification(notif.id, e)}
                            title="Delete notification"
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: EMAIL DELIVERY & PREFERENCES */}
        {activeTab === 'email_settings' && (
          <div className="space-y-6">

            {/* Test Email Dispatch Card */}
            <div className="bg-white rounded-2xl border border-blue-200 p-6 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                  <Send className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-slate-900">Send Test Email Notification</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Test that your SkillMate email delivery pipeline is configured and delivering to your inbox.
                  </p>

                  <form onSubmit={handleSendTestEmail} className="mt-4 flex flex-col sm:flex-row gap-2 max-w-lg">
                    <input
                      type="email"
                      required
                      value={testEmailAddress}
                      onChange={(e) => setTestEmailAddress(e.target.value)}
                      placeholder="Enter target email address"
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={sendingTest}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 transition-colors"
                    >
                      {sendingTest ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Dispatching...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Dispatch Test Alert</span>
                        </>
                      )}
                    </button>
                  </form>

                  {testResult && (
                    <div className={`mt-3 p-3 rounded-xl border text-xs flex items-start gap-2 ${
                      testResult.success
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}>
                      {testResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="font-semibold">{testResult.message}</p>
                        {testResult.mode && (
                          <p className="text-[11px] mt-0.5 opacity-90">
                            Dispatched channel: <strong>{testResult.mode.toUpperCase()}</strong>. Check your inbox (or spam) and the Dispatched Emails tab below.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Email Notification Toggles */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">Email Notification Triggers</h3>
                </div>
                <span className="text-xs text-slate-400">Recipient: <strong>{user?.email || 'Logged-in Student'}</strong></span>
              </div>

              {prefSuccess && (
                <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{prefSuccess}</span>
                </div>
              )}

              <div className="divide-y divide-slate-100 mt-2">
                {/* 1. Connections */}
                <div className="py-3.5 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Peer Connection Requests</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Receive an email when another student invites you to exchange skills or accepts your request.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailPrefs.emailOnConnection}
                      onChange={(e) => setEmailPrefs({ ...emailPrefs, emailOnConnection: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* 2. Sessions */}
                <div className="py-3.5 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Learning Sessions & Calendar</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Receive confirmed calendar links, Google Meet URLs, and session reminders directly via email.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailPrefs.emailOnSession}
                      onChange={(e) => setEmailPrefs({ ...emailPrefs, emailOnSession: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* 3. Practice */}
                <div className="py-3.5 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Peer Practice & Assignments</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Receive an alert when a partner assigns a coding challenge or submits their solutions.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailPrefs.emailOnPractice}
                      onChange={(e) => setEmailPrefs({ ...emailPrefs, emailOnPractice: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* 4. Chat Messages */}
                <div className="py-3.5 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Direct Chat Alerts</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Receive email copy of urgent peer messages when you are away from the application.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailPrefs.emailOnMessage}
                      onChange={(e) => setEmailPrefs({ ...emailPrefs, emailOnMessage: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* 5. Weekly Digest */}
                <div className="py-3.5 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Weekly Skill Credits & Progress Digest</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Weekly summary of your credit earnings, unlocked badges, and recommended new skill partners.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailPrefs.emailWeeklyDigest}
                      onChange={(e) => setEmailPrefs({ ...emailPrefs, emailWeeklyDigest: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={handleSavePreferences}
                  disabled={savingPrefs}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {savingPrefs ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  <span>Save Notification Preferences</span>
                </button>
              </div>
            </div>

            {/* Email Provider Details Guide */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Resend API Status & Integration</span>
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                SkillMate uses the <strong>Resend Cloud API</strong> for fast, modern email delivery directly from your backend.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs">
                <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-200">
                  <span className="font-bold text-blue-900 block mb-0.5">Resend REST API (Active)</span>
                  <span className="text-blue-700 text-[11px]">Dispatches notifications via Resend API key (`re_...`) with instant delivery tracking.</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-900 block mb-0.5">Automated Inspection Logs</span>
                  <span className="text-slate-500 text-[11px]">Every sent email is logged with message IDs and interactive HTML previews.</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: DISPATCHED EMAIL HISTORY */}
        {activeTab === 'email_logs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-600 font-medium">
                Showing all automated emails triggered by platform actions.
              </span>
              <button
                onClick={fetchEmailLogs}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-blue-50"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Log</span>
              </button>
            </div>

            {emailLogs.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
                <Mail className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-800">No emails logged yet</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Trigger an action or click "Dispatch Test Alert" in the preferences tab to see logs here.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {emailLogs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900">{log.subject}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            log.status === 'sent'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {log.status === 'sent' ? '✓ SENT' : 'PREVIEW LOG'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          To: <strong className="text-slate-700">{log.toEmail}</strong> &bull; Category: <span className="font-medium text-slate-600">{log.category}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button
                        onClick={() => setSelectedEmailPreview(log)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Preview HTML</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal: Email HTML Preview */}
        {selectedEmailPreview && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-100">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 truncate max-w-md">{selectedEmailPreview.subject}</h3>
                  <p className="text-[11px] text-slate-500">Recipient: {selectedEmailPreview.toEmail}</p>
                </div>
                <button
                  onClick={() => setSelectedEmailPreview(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 bg-slate-100">
                <div
                  className="bg-white rounded-xl shadow-xs p-4"
                  dangerouslySetInnerHTML={{ __html: selectedEmailPreview.htmlBody }}
                />
              </div>

              <div className="p-3 border-t border-slate-100 bg-white flex justify-end">
                <button
                  onClick={() => setSelectedEmailPreview(null)}
                  className="px-4 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
