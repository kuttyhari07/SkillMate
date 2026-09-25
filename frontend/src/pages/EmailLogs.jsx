import React, { useState, useEffect } from 'react';
import api from '../api/client';
import {
  Mail,
  Eye,
  CheckCircle2,
  Clock,
  Send,
  X
} from 'lucide-react';

export default function EmailLogs() {
  const [logs, setLogs] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchEmailLogs = async () => {
    try {
      const res = await api.get('/email/logs');
      setLogs(res.data.logs || []);
    } catch (err) {
      console.warn('Error fetching email logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmailLogs();
    const interval = setInterval(fetchEmailLogs, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <span className="text-xs font-bold text-blue-600 tracking-wider uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Automated Notifications
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Email Delivery & Dev Preview Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time inspection log of all automated emails dispatched for registrations, connections, sessions, and milestones.
          </p>
        </div>

        {/* Logs Table Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Dispatched Email History ({logs.length})</h3>
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Dev Preview Mode Active
            </span>
          </div>

          <div className="space-y-3">
            {logs.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No emails logged yet.</p>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        {log.category || 'General'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(log.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">{log.subject}</h4>
                    <p className="text-slate-500 text-[11px]">To: <strong>{log.toEmail}</strong></p>
                  </div>

                  <button
                    onClick={() => setSelectedEmail(log)}
                    className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5" /> Preview HTML
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Email HTML Preview Modal */}
        {selectedEmail && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 space-y-4 max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 truncate">{selectedEmail.subject}</h3>
                  <p className="text-[11px] text-slate-500">Recipient: {selectedEmail.toEmail}</p>
                </div>
                <button
                  onClick={() => setSelectedEmail(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Rendered HTML inside an isolated box */}
              <div
                className="flex-1 overflow-y-auto p-4 bg-slate-50 rounded-2xl border border-slate-200"
                dangerouslySetInnerHTML={{ __html: selectedEmail.htmlBody }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
