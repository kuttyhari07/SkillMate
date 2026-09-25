import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  ScreenShare,
  MessageSquare,
  Sparkles,
  Users,
  Send,
  Edit3,
  Clock,
  CheckCircle2,
  BrainCircuit
} from 'lucide-react';

export default function DemoMeetingRoom() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [activeTab, setActiveTab] = useState('agenda'); // 'agenda' | 'chat' | 'notes'
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [notes, setNotes] = useState('// SkillMate Collaborative Session Notes\n- Discussed semantic HTML architecture\n- Reviewed flexbox alignment rules\n- Next practice: Form validation challenge');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'Priya Sharma', text: 'Hey Swedha! Can you see the starter code on my screen?' },
    { sender: 'Swedha Jasmine', text: 'Yes! The Flexbox layout looks super clean.' }
  ]);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { sender: user?.name || 'Me', text: chatInput.trim() }]);
    setChatInput('');
  };

  const handleEndSession = () => {
    alert('Session finished! Taking you to feedback & rating...');
    navigate('/sessions');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Top Meeting Header */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <h2 className="font-bold text-xs sm:text-sm tracking-wide flex items-center gap-2">
            SkillMate Demo Online Session
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-blue-400 border border-slate-700">
              {roomId}
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-xs font-mono text-slate-300">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>{formatTimer(sessionSeconds)}</span>
          </div>

          <button
            onClick={handleEndSession}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <PhoneOff className="w-3.5 h-3.5" /> End Call
          </button>
        </div>
      </div>

      {/* Main View Area: Video Feeds + Collaborative Sidebar */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: Video Stage (8 Cols) */}
        <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between space-y-4 overflow-y-auto">
          {/* Simulated Peer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 items-center justify-center">
            {/* Participant 1: Remote Partner */}
            <div className="relative aspect-video bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden flex items-center justify-center shadow-lg group">
              <img
                src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80"
                alt="Partner Video"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Priya Sharma (Peer Mentor)</span>
              </div>
            </div>

            {/* Participant 2: Self User */}
            <div className="relative aspect-video bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden flex items-center justify-center shadow-lg">
              {videoOn ? (
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"
                  alt="My Video"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 rounded-full bg-slate-800 mx-auto flex items-center justify-center text-slate-400 font-bold text-lg">
                    {user?.name ? user.name.charAt(0) : 'U'}
                  </div>
                  <p className="text-xs text-slate-500">Camera Off</p>
                </div>
              )}
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${micOn ? 'bg-emerald-400' : 'bg-red-400'}`} />
                <span>You ({user?.name || 'Swedha Jasmine'})</span>
              </div>
            </div>
          </div>

          {/* Bottom Floating Control Bar */}
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-3 mx-auto flex items-center gap-3 shadow-2xl">
            <button
              onClick={() => setMicOn(!micOn)}
              className={`p-3 rounded-xl transition-colors ${
                micOn ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-red-600 text-white'
              }`}
              title={micOn ? 'Mute Mic' : 'Unmute Mic'}
            >
              {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setVideoOn(!videoOn)}
              className={`p-3 rounded-xl transition-colors ${
                videoOn ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-red-600 text-white'
              }`}
              title={videoOn ? 'Turn Video Off' : 'Turn Video On'}
            >
              {videoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setScreenSharing(!screenSharing)}
              className={`p-3 rounded-xl transition-colors ${
                screenSharing ? 'bg-blue-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white'
              }`}
              title="Share Screen"
            >
              <ScreenShare className="w-5 h-5" />
            </button>

            <div className="w-px h-6 bg-slate-700 mx-1" />

            <button
              onClick={() => setActiveTab('agenda')}
              className={`p-3 rounded-xl transition-colors ${
                activeTab === 'agenda' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
              title="AI Agenda"
            >
              <BrainCircuit className="w-5 h-5" />
            </button>

            <button
              onClick={() => setActiveTab('notes')}
              className={`p-3 rounded-xl transition-colors ${
                activeTab === 'notes' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
              title="Shared Notes"
            >
              <Edit3 className="w-5 h-5" />
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`p-3 rounded-xl transition-colors ${
                activeTab === 'chat' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
              title="In-Call Chat"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right: Collaborative Sidebar (4 Cols) */}
        <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900 flex flex-col h-72 lg:h-auto">
          {/* Sidebar Tabs */}
          <div className="flex border-b border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('agenda')}
              className={`flex-1 py-3 text-center border-b-2 transition-colors ${
                activeTab === 'agenda' ? 'border-blue-500 text-white' : 'border-transparent text-slate-400'
              }`}
            >
              AI Agenda
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex-1 py-3 text-center border-b-2 transition-colors ${
                activeTab === 'notes' ? 'border-blue-500 text-white' : 'border-transparent text-slate-400'
              }`}
            >
              Live Notes
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-3 text-center border-b-2 transition-colors ${
                activeTab === 'chat' ? 'border-blue-500 text-white' : 'border-transparent text-slate-400'
              }`}
            >
              Chat
            </button>
          </div>

          {/* Tab 1: AI Agenda Checklist */}
          {activeTab === 'agenda' && (
            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Structured Session Agenda
              </p>
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                  <div className="flex items-center justify-between text-blue-400 font-bold">
                    <span>10 min</span>
                    <span className="text-[10px] text-emerald-400">Completed ✓</span>
                  </div>
                  <h4 className="font-semibold text-white">Concept Refresher & Setup</h4>
                  <p className="text-slate-400 text-[11px]">Verify dev environment and clarify questions.</p>
                </div>

                <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-800 space-y-1">
                  <div className="flex items-center justify-between text-blue-300 font-bold">
                    <span>20 min</span>
                    <span className="text-[10px] text-amber-400 animate-pulse">In Progress</span>
                  </div>
                  <h4 className="font-semibold text-white">Live Code Walkthrough</h4>
                  <p className="text-slate-300 text-[11px]">Demonstrating layout design and syntax patterns.</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1 opacity-70">
                  <div className="flex items-center justify-between text-slate-400 font-bold">
                    <span>20 min</span>
                    <span className="text-[10px] text-slate-500">Upcoming</span>
                  </div>
                  <h4 className="font-semibold text-white">Hands-on Peer Practice</h4>
                  <p className="text-slate-400 text-[11px]">Learner writes code with mentor pairing.</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1 opacity-70">
                  <div className="flex items-center justify-between text-slate-400 font-bold">
                    <span>10 min</span>
                    <span className="text-[10px] text-slate-500">Upcoming</span>
                  </div>
                  <h4 className="font-semibold text-white">Q&A & Rating Exchange</h4>
                  <p className="text-slate-400 text-[11px]">Exchange SkillMate ratings and award credits.</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Shared Whiteboard/Notes */}
          {activeTab === 'notes' && (
            <div className="flex-1 p-4 flex flex-col">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Collaborative Notepad
              </p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-200 resize-none focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {/* Tab 3: In-Call Chat */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col">
              <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
                {chatMessages.map((cm, idx) => (
                  <div key={idx} className="bg-slate-800 p-2.5 rounded-xl border border-slate-700/60">
                    <span className="font-bold text-blue-400 block text-[11px]">{cm.sender}</span>
                    <p className="text-slate-200 mt-0.5">{cm.text}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendChat} className="p-2.5 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Chat with partner..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                />
                <button
                  type="submit"
                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
