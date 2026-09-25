import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { io } from 'socket.io-client';
import {
  MessageSquare,
  Send,
  User,
  Sparkles,
  CheckCircle,
  Paperclip,
  Smile,
  Shield,
  Clock
} from 'lucide-react';

export default function Chat() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const partnerIdFromUrl = searchParams.get('partnerId');

  const [partners, setPartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [loadingPartners, setLoadingPartners] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  // Auto-scroll chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Connect to Socket.io
  useEffect(() => {
    const socketInstance = io(window.location.origin, {
      transports: ['websocket', 'polling']
    });

    socketInstance.on('connect', () => {
      if (user?.id) {
        socketInstance.emit('user_online', user.id);
      }
    });

    socketInstance.on('receive_message', (msg) => {
      if (
        (msg.senderId === selectedPartner?.id && msg.receiverId === user?.id) ||
        (msg.senderId === user?.id && msg.receiverId === selectedPartner?.id)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user?.id, selectedPartner?.id]);

  // Fetch partners / connections
  useEffect(() => {
    const fetchPartners = async () => {
      setLoadingPartners(true);
      try {
        const res = await api.get('/connections');
        const list = res.data || [];
        setPartners(list);

        // Auto-select partner from URL query or first in list
        if (partnerIdFromUrl) {
          const match = list.find((p) => (p.partner?.id || p.id) === partnerIdFromUrl);
          if (match) {
            setSelectedPartner(match.partner || match);
          } else {
            // Fetch partner profile directly if not in connection list yet
            try {
              const uRes = await api.get(`/users/${partnerIdFromUrl}`);
              setSelectedPartner(uRes.data);
            } catch (e) {
              console.error(e);
            }
          }
        } else if (list.length > 0) {
          setSelectedPartner(list[0].partner || list[0]);
        }
      } catch (err) {
        console.error('Failed to fetch chat partners:', err);
      } finally {
        setLoadingPartners(false);
      }
    };

    fetchPartners();
  }, [partnerIdFromUrl]);

  // Fetch message history when selected partner changes
  useEffect(() => {
    if (!selectedPartner?.id || !user?.id) return;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/${selectedPartner.id}`);
        setMessages(res.data || []);
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      }
    };

    fetchMessages();
  }, [selectedPartner?.id, user?.id]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedPartner?.id) return;

    const textToSend = inputMessage;
    setInputMessage('');
    setSending(true);

    try {
      // Backend automatically dispatches email notification to recipient if offline/new message!
      const res = await api.post('/messages', {
        receiverId: selectedPartner.id,
        content: textToSend
      });

      const newMsg = res.data.data || {
        id: 'msg_' + Date.now(),
        senderId: user.id,
        receiverId: selectedPartner.id,
        content: textToSend,
        createdAt: new Date().toISOString()
      };

      setMessages((prev) => [...prev, newMsg]);

      // Emit via socket
      if (socket) {
        socket.emit('send_message', {
          senderId: user.id,
          receiverId: selectedPartner.id,
          content: textToSend
        });
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] p-2 sm:p-6 max-w-7xl mx-auto flex gap-4">
      {/* Sidebar: Partners List */}
      <div className="w-full sm:w-80 glass-card rounded-3xl border border-slate-800 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-bold text-white tracking-wide">Conversations</h2>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold">
            {partners.length}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingPartners ? (
            <div className="p-4 text-center text-xs text-slate-400">Loading chats...</div>
          ) : partners.length === 0 && !selectedPartner ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No conversations yet. Go to Find Matches to connect!
            </div>
          ) : (
            <>
              {selectedPartner && !partners.some(p => (p.partner?.id || p.id) === selectedPartner.id) && (
                <button
                  onClick={() => setSelectedPartner(selectedPartner)}
                  className="w-full p-3 rounded-2xl flex items-center gap-3 text-left transition-all bg-indigo-600/20 border border-indigo-500/40 text-white"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/30 flex items-center justify-center font-bold text-sm text-indigo-300">
                    {selectedPartner.name?.[0] || 'U'}
                  </div>
                  <div className="flex-1 truncate">
                    <h4 className="text-xs font-semibold">{selectedPartner.name}</h4>
                    <p className="text-[11px] text-indigo-300 truncate">New chat</p>
                  </div>
                </button>
              )}

              {partners.map((p) => {
                const partnerObj = p.partner || p;
                const isSelected = selectedPartner?.id === partnerObj.id;
                return (
                  <button
                    key={partnerObj.id}
                    onClick={() => setSelectedPartner(partnerObj)}
                    className={`w-full p-3 rounded-2xl flex items-center gap-3 text-left transition-all ${
                      isSelected
                        ? 'bg-indigo-600/20 border border-indigo-500/40 text-white'
                        : 'hover:bg-slate-800/60 text-slate-300 hover:text-white'
                    }`}
                  >
                    {partnerObj.avatar ? (
                      <img
                        src={partnerObj.avatar}
                        alt={partnerObj.name}
                        className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-700"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-indigo-600/30 flex items-center justify-center font-bold text-sm text-indigo-300">
                        {partnerObj.name?.[0] || 'U'}
                      </div>
                    )}
                    <div className="flex-1 truncate">
                      <h4 className="text-xs font-semibold">{partnerObj.name}</h4>
                      <p className="text-[11px] text-slate-400 truncate">
                        {partnerObj.skills?.[0] ? `Teaches ${partnerObj.skills[0]}` : 'Ready to learn'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* Main Chat Panel */}
      <div className="flex-1 glass-card rounded-3xl border border-slate-800 flex flex-col overflow-hidden">
        {selectedPartner ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
              <div className="flex items-center gap-3">
                {selectedPartner.avatar ? (
                  <img
                    src={selectedPartner.avatar}
                    alt={selectedPartner.name}
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500/40"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/30 flex items-center justify-center font-bold text-sm text-indigo-300">
                    {selectedPartner.name?.[0] || 'U'}
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedPartner.name}</h3>
                  <div className="flex items-center gap-2 text-[11px] text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Active Now • Email Alerts Active</span>
                  </div>
                </div>
              </div>

              {selectedPartner.skills && (
                <div className="hidden md:flex gap-1">
                  {selectedPartner.skills.slice(0, 2).map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-indigo-300 border border-slate-700"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-20 text-slate-500 text-xs">
                  <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-2 opacity-50" />
                  No messages yet. Say hello to start collaborating!
                </div>
              ) : (
                messages.map((m, idx) => {
                  const isMe = m.senderId === user?.id;
                  return (
                    <div
                      key={m.id || idx}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] sm:max-w-md px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          isMe
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-none shadow-md'
                            : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700/60'
                        }`}
                      >
                        <p>{m.content}</p>
                        <span
                          className={`text-[9px] block text-right mt-1 ${
                            isMe ? 'text-indigo-200' : 'text-slate-400'
                          }`}
                        >
                          {m.createdAt
                            ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : 'Just now'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-900/60 flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Message ${selectedPartner.name}...`}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button
                type="submit"
                disabled={sending || !inputMessage.trim()}
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
            <MessageSquare className="w-12 h-12 text-slate-600 mb-3" />
            <h3 className="text-base font-semibold text-slate-300">Select a partner to chat</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Choose from your active conversations on the left, or visit the Matchmaking Hub to find new learning partners.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
