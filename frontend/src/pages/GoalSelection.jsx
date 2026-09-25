import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import MilestoneModal from '../components/MilestoneModal';
import {
  Compass,
  Code,
  Terminal,
  Layout,
  Music,
  Activity,
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export default function GoalSelection() {
  const [goals, setGoals] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState('rd_fullstack');
  const [currentLevel, setCurrentLevel] = useState('Beginner');
  const [loading, setLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const res = await api.get('/learning/goals');
        setGoals(res.data.goals || []);
      } catch (err) {
        console.warn('Error fetching goals:', err);
      }
    };
    fetchGoals();
  }, []);

  const handleGenerateRoadmap = async () => {
    setLoading(true);
    try {
      await api.post('/learning/goals', {
        goalId: selectedGoal,
        startingLevel: currentLevel
      });
      setShowCelebration(true);
    } catch (err) {
      alert('Error creating learning goal: ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  const goalIcons = {
    'Full Stack Development': Code,
    'Python Development': Terminal,
    'UI/UX Design': Layout,
    'Dance': Activity,
    'Music': Music
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-blue-600 tracking-wider uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Step 3 of 3
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            WHAT DO YOU WANT TO LEARN?
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Choose your target mastery area. SkillMate will automatically structure a 
            level-by-level progressive roadmap with interactive MCQs and peer pairing.
          </p>
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((g) => {
            const Icon = goalIcons[g.goalTitle] || Compass;
            const isSelected = selectedGoal === g.id;

            return (
              <div
                key={g.id}
                onClick={() => setSelectedGoal(g.id)}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative bg-white ${
                  isSelected
                    ? 'border-blue-600 shadow-md ring-4 ring-blue-500/10'
                    : 'border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-4 right-4 text-blue-600">
                    <CheckCircle2 className="w-5 h-5 fill-blue-600 text-white" />
                  </div>
                )}

                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                  isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>

                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {g.category} • {g.totalLevels} Levels
                </span>

                <h3 className="font-bold text-slate-900 text-base mt-2 mb-1">
                  {g.goalTitle}
                </h3>

                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                  {g.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Current Level Selector */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              What is your current level in this skill?
            </h3>
            <p className="text-xs text-slate-500">
              We calibrate beginner fundamentals or unlock appropriate starting checkpoints.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setCurrentLevel(lvl)}
                className={`py-3 px-4 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                  currentLevel === lvl
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={handleGenerateRoadmap}
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Building Roadmap...' : 'Generate My Learning Roadmap'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Milestone Celebration */}
      <MilestoneModal
        isOpen={showCelebration}
        onClose={() => navigate(`/roadmap/${selectedGoal}`)}
        title="🎯 Learning Goal Created!"
        badgeText="Level 1 Unlocked"
        message="Your personalized level-by-level roadmap is ready! Level 1 (HTML Basics & Semantic Web) is now unlocked for you to explore."
        actionText="View My Roadmap"
        onAction={() => navigate(`/roadmap/${selectedGoal}`)}
      />
    </div>
  );
}
