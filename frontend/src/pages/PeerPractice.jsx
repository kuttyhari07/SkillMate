import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import {
  BookOpen,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  Send,
  Star,
  Award,
  Users,
  X
} from 'lucide-react';

export default function PeerPractice() {
  const { user, refreshUser } = useAuth();
  const [assignedToMe, setAssignedToMe] = useState([]);
  const [createdByMe, setCreatedByMe] = useState([]);
  const [connections, setConnections] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTaskForSubmit, setActiveTaskForSubmit] = useState(null);
  const [activeTaskForReview, setActiveTaskForReview] = useState(null);
  const [loading, setLoading] = useState(true);

  // New task form state
  const [newTask, setNewTask] = useState({
    assignedToId: '',
    skill: 'Java',
    title: 'Java OOP Classes & Encapsulation',
    description: 'Solve these 2 fundamental class design challenges.',
    difficulty: 'Medium',
    timeMinutes: 20,
    questions: [
      { id: 'q1', question: 'What keyword restricts direct member access in Java?', type: 'text', sampleAnswer: 'private' }
    ]
  });

  // Submission answers state
  const [answers, setAnswers] = useState({});

  // Review feedback state
  const [reviewScore, setReviewScore] = useState(5);
  const [reviewFeedback, setReviewFeedback] = useState('Great work, clean structure!');

  const fetchTasks = async () => {
    try {
      const [tasksRes, connRes] = await Promise.all([
        api.get('/practice'),
        api.get('/connections')
      ]);
      setAssignedToMe(tasksRes.data.assignedToMe || []);
      setCreatedByMe(tasksRes.data.createdByMe || []);
      const accepted = (connRes.data.connections || []).filter(c => c.status === 'accepted');
      setConnections(accepted);
      if (accepted.length > 0 && !newTask.assignedToId) {
        setNewTask(prev => ({ ...prev, assignedToId: accepted[0].partner?.id || '' }));
      }
    } catch (err) {
      console.error('Error fetching practice tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/practice', newTask);
      alert('🎉 Practice challenge assigned! Your peer received a notification.');
      setShowCreateModal(false);
      fetchTasks();
    } catch (err) {
      alert('Error creating challenge: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSubmitAnswers = async (e) => {
    e.preventDefault();
    if (!activeTaskForSubmit) return;
    try {
      await api.post(`/practice/${activeTaskForSubmit.id}/submit`, { answers });
      await refreshUser();
      alert('✅ Answers submitted successfully! +5 Skill Credits earned.');
      setActiveTaskForSubmit(null);
      fetchTasks();
    } catch (err) {
      alert('Error submitting answers: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleReviewSubmission = async (e) => {
    e.preventDefault();
    if (!activeTaskForReview) return;
    try {
      await api.post(`/practice/${activeTaskForReview.id}/review`, {
        score: reviewScore,
        totalQuestions: 5,
        feedback: reviewFeedback
      });
      await refreshUser();
      alert('⭐ Review submitted! +10 Skill Credits awarded.');
      setActiveTaskForReview(null);
      fetchTasks();
    } catch (err) {
      alert('Error reviewing task: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-blue-600 tracking-wider uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Peer Challenges
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Peer Practice Exchange
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Create and solve customized challenges with your connected skill mates.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-colors flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" /> Create Peer Challenge
          </button>
        </div>

        {/* 2 Tabs/Sections: Assigned to Me & Created by Me */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Section: Challenges Assigned to Me */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Assigned to Me ({assignedToMe.length})</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                +5 Credits on Submit
              </span>
            </div>

            <div className="space-y-3">
              {assignedToMe.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No challenges currently assigned to you.</p>
              ) : (
                assignedToMe.map((task) => (
                  <div key={task.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          {task.skill}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm mt-1">{task.title}</h4>
                        <p className="text-xs text-slate-500">From {task.creatorName} ({task.timeMinutes} mins)</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        task.status === 'reviewed' ? 'bg-emerald-100 text-emerald-800' :
                        task.status === 'submitted' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {task.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600">{task.description}</p>

                    {task.status === 'reviewed' && task.submission && (
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-1">
                        <p className="font-bold text-emerald-900">Score: {task.submission.score} / {task.submission.totalQuestions || 5}</p>
                        <p className="text-emerald-800 italic">"{task.submission.feedback}"</p>
                      </div>
                    )}

                    {task.status === 'assigned' && (
                      <button
                        onClick={() => setActiveTaskForSubmit(task)}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                      >
                        Solve & Submit Answers
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section: Challenges Created by Me */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Created by Me ({createdByMe.length})</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                +10 Credits on Review
              </span>
            </div>

            <div className="space-y-3">
              {createdByMe.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">You haven't assigned any peer tasks yet.</p>
              ) : (
                createdByMe.map((task) => (
                  <div key={task.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                          {task.skill}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm mt-1">{task.title}</h4>
                        <p className="text-xs text-slate-500">Assigned to: {task.assignedToName}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        task.status === 'reviewed' ? 'bg-emerald-100 text-emerald-800' :
                        task.status === 'submitted' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {task.status}
                      </span>
                    </div>

                    {task.status === 'submitted' && (
                      <button
                        onClick={() => setActiveTaskForReview(task)}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Star className="w-3.5 h-3.5 fill-white" /> Review Submission (+10 Credits)
                      </button>
                    )}

                    {task.status === 'reviewed' && task.submission && (
                      <div className="p-2.5 bg-slate-100 rounded-xl text-xs text-slate-600">
                        Score awarded: <strong>{task.submission.score}</strong> • Feedback: "{task.submission.feedback}"
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Modal: Create Peer Challenge */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative animate-in zoom-in-95">
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold text-slate-900 mb-1">Create Peer Practice Task</h3>
              <p className="text-xs text-slate-500 mb-6">Assign a challenge to your connected peer mate.</p>

              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Student *</label>
                  <select
                    value={newTask.assignedToId}
                    onChange={(e) => setNewTask({ ...newTask, assignedToId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-900"
                    required
                  >
                    {connections.map((c) => (
                      <option key={c.partner?.id} value={c.partner?.id}>
                        {c.partner?.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Skill</label>
                    <input
                      type="text"
                      value={newTask.skill}
                      onChange={(e) => setNewTask({ ...newTask, skill: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Difficulty</label>
                    <select
                      value={newTask.difficulty}
                      onChange={(e) => setNewTask({ ...newTask, difficulty: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-900"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Challenge Title</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Problem Statement / Questions</label>
                  <textarea
                    rows={3}
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
                >
                  Assign Peer Challenge
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Solve & Submit Answers */}
        {activeTaskForSubmit && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 space-y-4">
              <button
                onClick={() => setActiveTaskForSubmit(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold text-slate-900">Attempt Challenge: {activeTaskForSubmit.title}</h3>
              <p className="text-xs text-slate-600">{activeTaskForSubmit.description}</p>

              <form onSubmit={handleSubmitAnswers} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Your Solution / Code</label>
                  <textarea
                    rows={6}
                    placeholder="Write your explanation or code here..."
                    onChange={(e) => setAnswers({ solution: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300 font-mono text-xs text-slate-900"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
                >
                  Submit for Peer Review (+5 Credits)
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Review Peer Task */}
        {activeTaskForReview && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 space-y-4">
              <button
                onClick={() => setActiveTaskForReview(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold text-slate-900">Review Student Submission</h3>
              <p className="text-xs text-slate-600">Provide constructive feedback and award score.</p>

              <div className="p-3 bg-slate-100 rounded-xl text-xs font-mono text-slate-800">
                {activeTaskForReview.submission?.answers?.solution || 'No code text provided'}
              </div>

              <form onSubmit={handleReviewSubmission} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Score (out of 5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={reviewScore}
                    onChange={(e) => setReviewScore(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Feedback & Tips</label>
                  <textarea
                    rows={3}
                    value={reviewFeedback}
                    onChange={(e) => setReviewFeedback(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
                >
                  Submit Review & Collect +10 Credits
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
