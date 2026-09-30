import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../api/client';
import {
  MessageSquare,
  Send,
  Calendar,
  Smile,
  Check,
  CheckCheck,
  Circle,
  Video,
  User,
  ArrowLeft
} from 'lucide-react';

export default function Messages() {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [searchParams] = useSearchParams();
  const targetPartnerFromQuery = searchParams.get('partner');

  const [connections, setConnections] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [startingRoom, setStartingRoom] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Fetch connected partners
  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const res = await api.get('/connections');
        const accepted = (res.data.connections || []).filter(c => c.status === 'accepted');
        setConnections(accepted);

        if (accepted.length > 0) {
          const matched = targetPartnerFromQuery
            ? accepted.find(c => c.partner?.id === targetPartnerFromQuery)
            : accepted[0];
          setActivePartner(matched ? matched.partner : accepted[0].partner);
        }
      } catch (err) {
        console.error('Error loading connections:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConnections();
  }, [targetPartnerFromQuery]);

  // 2. Fetch conversation history for active partner
  useEffect(() => {
    if (!activePartner) return;

    const fetchConversation = async () => {
      try {
        const res = await api.get(`/messages/${activePartner.id}`);
        setMessages(res.data.messages || []);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };
    fetchConversation();

    // Join socket room
    if (socket && user?.id) {
      socket.emit('join_chat', { userId: user.id, partnerId: activePartner.id });
    }
  }, [activePartner, socket, user]);

  // 3. Listen to incoming real-time socket messages
  useEffect(() => {
    if (!socket) return;

    const handleReceive = (msg) => {
      if (
        (msg.senderId === activePartner?.id && msg.receiverId === user?.id) ||
        (msg.senderId === user?.id && msg.receiverId === activePartner?.id)
      ) {
        setMessages(prev => [...prev, msg]);
      }
    };

    const handleTyping = ({ senderId, isTyping: partnerIsTyping }) => {
      if (senderId === activePartner?.id) {
        setPartnerTyping(partnerIsTyping);
      }
    };

    socket.on('receive_message', handleReceive);
    socket.on('partner_typing', handleTyping);

    return () => {
      socket.off('receive_message', handleReceive);
      socket.off('partner_typing', handleTyping);
    };
  }, [socket, activePartner, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, partnerTyping]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!text.trim() || !activePartner) return;

    const content = text.trim();
    setText('');

    // Emit via socket
    if (socket) {
      socket.emit('send_message', {
        senderId: user.id,
        receiverId: activePartner.id,
        content
      });
      socket.emit('typing', { senderId: user.id, receiverId: activePartner.id, isTyping: false });
    } else {
      // Fallback REST
      try {
        const res = await api.post('/messages', {
          receiverId: activePartner.id,
          content
        });
        setMessages(prev => [...prev, res.data.data]);
      } catch (err) {
        console.error('Error sending message:', err);
      }
    }
  };

  const handleInputChange = (val) => {
    setText(val);
    if (socket && activePartner) {
      socket.emit('typing', { senderId: user.id, receiverId: activePartner.id, isTyping: val.length > 0 });
    }
  };

  const handleStartInstantRoom = async () => {
    if (!activePartner?.id) return;
    setStartingRoom(true);
    try {
      const randChars = (len) => {
        const chars = 'abcdefghijklmnopqrstuvwxyz';
        let result = '';
        for (let i = 0; i < len; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
        return result;
      };
      const meetCode = `${randChars(3)}-${randChars(4)}-${randChars(3)}`;
      const meetLink = `https://meet.google.com/${meetCode}`;

      const res = await api.post('/sessions/instant-room', {
        partnerId: activePartner.id,
        topic: `Google Meet Session with ${activePartner.name}`,
        meetingLink: meetLink
      });

      const { roomMessage } = res.data;
      if (roomMessage) {
        setMessages((prev) => [...prev, roomMessage]);
        if (socket) {
          socket.emit('send_message', roomMessage);
        }
      }

      alert(`🎥 Google Meet session created!\n\nLink: ${meetLink}\n\nEmail invitation has been sent to ${activePartner.name} via Brevo. Opening Google Meet now!`);
      window.open(meetLink, '_blank', 'noopener,noreferrer');
    } catch (err) {
      alert('Error creating instant room: ' + (err.response?.data?.message || err.message));
    } finally {
      setStartingRoom(false);
    }
  };

  const quickEmojis = ['👋', '👍', '🔥', '💡', '🚀', '💻', '🤝'];

  const isPartnerOnline = activePartner && onlineUsers.includes(activePartner.id);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-3 sm:py-6 px-2 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto h-[82vh] sm:h-[80vh] bg-white rounded-3xl border border-slate-200 shadow-md flex overflow-hidden">
        {/* Left Side: Partners list (4 Cols) */}
        <div className={`w-full sm:w-80 md:w-96 border-r border-slate-200 flex flex-col bg-slate-50/50 ${activePartner ? 'hidden sm:flex' : 'flex'}`}>
          <div className="p-4 border-b border-slate-200 bg-white">
            <h2 className="font-extrabold text-slate-900 text-base">Direct Messages</h2>
            <p className="text-[11px] text-slate-500">Connected Skill Mates</p>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {connections.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 space-y-3">
                <p>No active connections yet.</p>
                <Link
                  to="/find-mates"
                  className="inline-block px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold text-xs"
                >
                  Find Skill Mates
                </Link>
              </div>
            ) : (
              connections.map((c) => {
                const partner = c.partner;
                if (!partner) return null;
                const isSelected = activePartner?.id === partner.id;
                const isOnline = onlineUsers.includes(partner.id);

                return (
                  <button
                    key={partner.id}
                    onClick={() => setActivePartner(partner)}
                    className={`w-full p-4 text-left transition-colors flex items-center gap-3 ${
                      isSelected ? 'bg-blue-50/80 border-r-4 border-blue-600' : 'hover:bg-slate-100'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={partner.avatar}
                        alt={partner.name}
                        className="w-11 h-11 rounded-full object-cover border border-slate-300"
                      />
                      <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                      }`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {partner.name}
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          {isOnline ? 'Active' : 'Offline'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        Teaches: {(partner.skillsToTeach || []).map(s => s.skill || s).join(', ')}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Active Chat Stream (8 Cols) */}
        {activePartner ? (
          <div className={`flex-1 flex flex-col bg-white ${!activePartner ? 'hidden sm:flex' : 'flex'}`}>
            {/* Chat Header */}
            <div className="p-3 sm:p-4 border-b border-slate-200 flex items-center justify-between bg-white z-10">
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setActivePartner(null)}
                  className="sm:hidden p-1.5 -ml-1 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Back to conversations"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="relative">
                  <img
                    src={activePartner.avatar}
                    alt={activePartner.name}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-slate-200"
                  />
                  <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                    isPartnerOnline ? 'bg-emerald-500' : 'bg-slate-300'
                  }`} />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 leading-tight">
                    {activePartner.name}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 truncate max-w-[140px] sm:max-w-none">
                    {isPartnerOnline ? 'Online now' : 'Last seen recently'} • {activePartner.college}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleStartInstantRoom}
                  disabled={startingRoom}
                  className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
                  title="Create instant Google Meet room and send email"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>{startingRoom ? 'Starting...' : 'Google Meet'}</span>
                </button>

                <Link
                  to={`/sessions?partner=${activePartner.id}`}
                  className="hidden sm:flex px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold transition-colors items-center gap-1.5 border border-blue-200"
                >
                  <Calendar className="w-3.5 h-3.5" /> Schedule
                </Link>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 bg-slate-50/50">
              {messages.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400">
                  Wave hello! This is the beginning of your direct conversation with {activePartner.name}.
                </div>
              ) : (
                messages.map((m) => {
                  const isMine = m.senderId === user?.id;
                  const hasMeetLink = m.content?.includes('meet.google.com') || m.content?.includes('http');
                  const meetUrlMatch = m.content?.match(/https?:\/\/[^\s]+/i);
                  const meetUrl = meetUrlMatch ? meetUrlMatch[0] : null;

                  return (
                    <div
                      key={m.id}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                          isMine
                            ? 'bg-blue-600 text-white rounded-br-none shadow-xs'
                            : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none shadow-xs'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{m.content}</p>

                        {hasMeetLink && meetUrl && (
                          <div className="mt-2.5 pt-2 border-t border-white/20">
                            <a
                              href={meetUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                            >
                              <Video className="w-3.5 h-3.5" />
                              Join Google Meet Call
                            </a>
                          </div>
                        )}

                        <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                          isMine ? 'text-blue-200' : 'text-slate-400'
                        }`}>
                          <span>
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMine && <CheckCheck className="w-3 h-3 text-blue-200" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {partnerTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl px-3 py-1.5 text-xs text-slate-500 animate-pulse">
                    {activePartner.name} is typing...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Emoji Bar */}
            <div className="px-4 py-1.5 bg-white border-t border-slate-100 flex gap-2 overflow-x-auto">
              {quickEmojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setText(prev => prev + emoji)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-sm transition-transform hover:scale-125"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3.5 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                value={text}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={`Message ${activePartner.name}...`}
                className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
              />
              <button
                type="submit"
                disabled={!text.trim()}
                className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl shadow-xs transition-colors shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-400 text-sm">
            Select a connected skill mate on the left to start direct chatting.
          </div>
        )}
      </div>
    </div>
  );
}
