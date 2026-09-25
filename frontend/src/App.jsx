import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import AIAssistantModal from './components/AIAssistantModal';

// Pages
import Home from './pages/Home';
import HowItWorks from './pages/HowItWorks';
import Login from './pages/Login';
import Register from './pages/Register';
import ProfileSetup from './pages/ProfileSetup';
import GoalSelection from './pages/GoalSelection';
import Dashboard from './pages/Dashboard';
import RoadmapView from './pages/RoadmapView';
import LevelDetail from './pages/LevelDetail';
import MCQPractice from './pages/MCQPractice';
import CodingPractice from './pages/CodingPractice';
import FindMates from './pages/FindMates';
import Messages from './pages/Messages';
import Sessions from './pages/Sessions';
import DemoMeetingRoom from './pages/DemoMeetingRoom';
import PeerPractice from './pages/PeerPractice';
import MyLearning from './pages/MyLearning';
import MyTeaching from './pages/MyTeaching';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import EmailLogs from './pages/EmailLogs';
import Assessment from './pages/Assessment';
import AdminDashboard from './pages/AdminDashboard';

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8 text-xs text-slate-500">
        Authenticating session...
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Pages */}
                <Route path="/" element={<Home />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/profile/:id" element={<Profile />} />

                {/* Protected Student Pages */}
                <Route path="/profile-setup" element={<ProtectedRoute><ProfileSetup /></ProtectedRoute>} />
                <Route path="/goal-selection" element={<ProtectedRoute><GoalSelection /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/roadmap/:goalId" element={<ProtectedRoute><RoadmapView /></ProtectedRoute>} />
                <Route path="/level/:levelId" element={<ProtectedRoute><LevelDetail /></ProtectedRoute>} />
                <Route path="/mcq/:levelId" element={<ProtectedRoute><MCQPractice /></ProtectedRoute>} />
                <Route path="/coding/:levelId" element={<ProtectedRoute><CodingPractice /></ProtectedRoute>} />
                <Route path="/find-mates" element={<ProtectedRoute><FindMates /></ProtectedRoute>} />
                <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
                <Route path="/sessions" element={<ProtectedRoute><Sessions /></ProtectedRoute>} />
                <Route path="/meeting/:roomId" element={<ProtectedRoute><DemoMeetingRoom /></ProtectedRoute>} />
                <Route path="/practice" element={<ProtectedRoute><PeerPractice /></ProtectedRoute>} />
                <Route path="/my-learning" element={<ProtectedRoute><MyLearning /></ProtectedRoute>} />
                <Route path="/my-teaching" element={<ProtectedRoute><MyTeaching /></ProtectedRoute>} />
                <Route path="/email-logs" element={<ProtectedRoute><EmailLogs /></ProtectedRoute>} />
                <Route path="/assessment" element={<ProtectedRoute><Assessment /></ProtectedRoute>} />

                {/* Admin Analytics Protected Page */}
                <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminDashboard /></ProtectedRoute>} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Floating Global AI Learning Assistant */}
            <AIAssistantModal />
          </div>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
