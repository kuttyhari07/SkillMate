import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import MilestoneModal from '../components/MilestoneModal';
import {
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Code,
  Users,
  BrainCircuit,
  Award,
  ArrowRight,
  Sparkles,
  Lock,
  Play,
  RotateCcw,
  Check
} from 'lucide-react';

export default function LevelDetail() {
  const { levelId } = useParams();
  const navigate = useNavigate();

  const [level, setLevel] = useState(null);
  const [parentRoadmap, setParentRoadmap] = useState(null);
  const [userProgress, setUserProgress] = useState(null);
  const [activeTab, setActiveTab] = useState('learn');
  const [loading, setLoading] = useState(true);

  // Completion modal state
  const [celebrationData, setCelebrationData] = useState(null);

  const fetchLevelData = async () => {
    try {
      const res = await api.get(`/learning/level/${levelId}`);
      setLevel(res.data.level);
      setParentRoadmap(res.data.parentRoadmap);
      setUserProgress(res.data.userProgress);
    } catch (err) {
      console.error('Error fetching level:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLevelData();
  }, [levelId]);

  const handleMarkTopicViewed = async (topicId) => {
    try {
      await api.post(`/learning/level/${levelId}/topic-viewed`, { topicId });
      setUserProgress(prev => ({
        ...prev,
        topicsViewed: [...(prev?.topicsViewed || []), topicId]
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompleteLevel = async () => {
    try {
      const res = await api.post(`/learning/level/${levelId}/complete`);
      setCelebrationData({
        title: '🎉 Level Completed!',
        badgeText: '+20 Skill Credits',
        message: `Congratulations! You mastered ${res.data.completedLevel}. ${res.data.nextLevel ? `${res.data.nextLevel} is now unlocked on your roadmap!` : 'All roadmap stages completed!'}`,
        nextLevelId: res.data.nextLevelId
      });
      fetchLevelData();
    } catch (err) {
      alert(err.response?.data?.message || 'Requirements not yet met to unlock the next level.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8 text-slate-500 text-sm">
        Loading level curriculum...
      </div>
    );
  }

  if (!level) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 text-center">
        <h2 className="text-xl font-bold text-slate-800">Level not found</h2>
        <Link to="/roadmap/rd_fullstack" className="text-blue-600 text-sm font-semibold mt-2 inline-block">
          Return to Roadmap
        </Link>
      </div>
    );
  }

  const isCompleted = userProgress?.status === 'completed';
  const mcqPassed = (userProgress?.mcqScore || 0) >= 70;
  const practiceDone = Boolean(userProgress?.practiceDone);
  const challengeDone = Boolean(userProgress?.challengeDone);
  const canUnlockNext = mcqPassed && practiceDone && challengeDone;

  const tabs = [
    { id: 'learn', label: '1. Learn', icon: BookOpen },
    { id: 'practice', label: '2. Practice & Code', icon: Code },
    { id: 'mcq', label: '3. MCQ Assessment', icon: HelpCircle },
    { id: 'peer', label: '4. Peer Session', icon: Users },
    { id: 'ai', label: '5. AI Help', icon: BrainCircuit },
    { id: 'complete', label: '6. Level Progress', icon: Award }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link to={`/roadmap/${parentRoadmap?.id || 'rd_fullstack'}`} className="hover:text-blue-600 font-medium">
            {parentRoadmap?.goalTitle || 'Roadmap'}
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-bold">Level {level.levelNumber}: {level.shortName || level.title}</span>
        </div>

        {/* Level Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  LEVEL {level.levelNumber}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {isCompleted ? 'Completed ✓' : 'In Progress 🔵'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
                {level.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                {level.description}
              </p>
            </div>

            {/* Quick Completion Badge */}
            <div className="sm:text-right shrink-0">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block">MCQ Best</span>
              <span className={`text-2xl font-black ${mcqPassed ? 'text-emerald-600' : 'text-slate-700'}`}>
                {userProgress?.mcqScore || 0}%
              </span>
              <span className="text-[10px] text-slate-400 block">Required: ≥ 70%</span>
            </div>
          </div>

          {/* Learning Objectives Box */}
          {level.learningObjectives?.length > 0 && (
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Learning Objectives
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                {level.learningObjectives.map((obj, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Level Interactive Tabs Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-1.5 flex gap-1 overflow-x-auto shadow-xs scrollbar-none">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isTabActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                  isTabActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Learn Content Cards */}
        {activeTab === 'learn' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Structured Concept Modules ({(level.topics || []).length})
              </h2>
              <span className="text-xs text-slate-500">
                {(userProgress?.topicsViewed || []).length} / {(level.topics || []).length} Viewed
              </span>
            </div>

            {(level.topics || []).map((topic, idx) => {
              const isViewed = (userProgress?.topicsViewed || []).includes(topic.id);
              return (
                <div
                  key={topic.id || idx}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">
                        Topic {idx + 1}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                        {topic.title}
                      </h3>
                    </div>

                    <button
                      onClick={() => handleMarkTopicViewed(topic.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        isViewed
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isViewed ? <><Check className="w-3.5 h-3.5" /> Viewed</> : 'Mark Viewed'}
                    </button>
                  </div>

                  <div className="text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed">
                    <p><strong>Concept:</strong> {topic.concept}</p>
                    {topic.explanation && <p>{topic.explanation}</p>}

                    {topic.keyPoints?.length > 0 && (
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <strong className="text-slate-800 block mb-1">Key Points:</strong>
                        <ul className="list-disc list-inside space-y-1 text-slate-600 text-xs">
                          {topic.keyPoints.map((pt, pIdx) => (
                            <li key={pIdx}>{pt}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {topic.miniExample && (
                      <div className="bg-slate-900 text-slate-100 p-3.5 rounded-xl font-mono text-xs overflow-x-auto">
                        <span className="text-slate-400 block text-[10px] uppercase font-sans mb-1 font-bold">Mini Example</span>
                        <pre>{topic.miniExample}</pre>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Practice & Code Challenges */}
        {activeTab === 'practice' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Hands-on Programming Challenges</h3>
                  <p className="text-xs text-slate-500">Test your code against automated predefined test validation.</p>
                </div>
                <Link
                  to={`/coding/${level.id}`}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Code className="w-4 h-4" /> Open Full Coding Workspace
                </Link>
              </div>

              {(level.codingChallenges || []).map((ch, idx) => (
                <div key={ch.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-900">{ch.title}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {ch.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{ch.statement}</p>
                  <p className="text-[11px] text-slate-500">Test Cases: {ch.testCases?.length || 1} evaluation tests</p>
                </div>
              ))}
            </div>

            {/* Mini Challenge Section */}
            {level.miniChallenge && (
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-indigo-700 uppercase tracking-wider">
                    ⭐ Level Mini Challenge
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    challengeDone ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {challengeDone ? 'Completed ✓' : 'Required for Level Unlock'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-indigo-950">{level.miniChallenge.title}</h3>
                <p className="text-xs sm:text-sm text-indigo-900/90 leading-relaxed">
                  {level.miniChallenge.description}
                </p>

                {level.miniChallenge.requirements?.length > 0 && (
                  <ul className="text-xs text-indigo-900/80 space-y-1 list-disc list-inside">
                    {level.miniChallenge.requirements.map((req, rIdx) => (
                      <li key={rIdx}>{req}</li>
                    ))}
                  </ul>
                )}

                <div className="pt-2">
                  <Link
                    to={`/coding/${level.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                  >
                    Attempt Mini Challenge Now <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: MCQ Assessment */}
        {activeTab === 'mcq' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
              <HelpCircle className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-bold text-slate-900">
              Level {level.levelNumber} Multiple Choice Assessment
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Answer 10 conceptual multiple-choice questions with instant explanations.
              A minimum score of <strong>70%</strong> is required to unlock the next level stage.
            </p>

            <div className="inline-block p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center my-2">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Your Best Score</span>
              <span className={`text-3xl font-extrabold ${mcqPassed ? 'text-emerald-600' : 'text-slate-800'}`}>
                {userProgress?.mcqScore || 0}%
              </span>
              <span className="text-xs text-slate-500 block mt-1">
                {mcqPassed ? 'Requirement Met ✓' : 'Pass Threshold: 70%'}
              </span>
            </div>

            <div>
              <Link
                to={`/mcq/${level.id}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors"
              >
                <Play className="w-4 h-4 fill-white" />
                {userProgress?.mcqAttempts > 0 ? 'Retake MCQ Test' : 'Start MCQ Assessment'}
              </Link>
            </div>
          </div>
        )}

        {/* Tab 4: Peer Practice Session */}
        {activeTab === 'peer' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Collaborative Learning
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  Practice {level.shortName || level.title} With a Skill Mate
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
                  {level.peerPracticePrompt?.description || 'Connect with a peer mentor to review each other\'s code and talk through difficult topics.'}
                </p>
              </div>

              <Link
                to="/find-mates"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs shrink-0"
              >
                Find Mates
              </Link>
            </div>

            {level.peerPracticePrompt?.suggestedQuestions?.length > 0 && (
              <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-4 space-y-2">
                <p className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                  Suggested Peer Discussion Prompts:
                </p>
                <ul className="text-xs text-blue-950 space-y-1.5 list-disc list-inside">
                  {level.peerPracticePrompt.suggestedQuestions.map((q, qIdx) => (
                    <li key={qIdx}>{q}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                to="/sessions"
                className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold text-center transition-colors"
              >
                Schedule Video Session
              </Link>
              <Link
                to="/practice"
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold text-center transition-colors"
              >
                Assign Peer Practice Task
              </Link>
            </div>
          </div>
        )}

        {/* Tab 5: AI Help */}
        {activeTab === 'ai' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
              <BrainCircuit className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-bold text-slate-900">
              Need Instant Help with {level.shortName || level.title}?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              SkillMate AI is actively calibrated to this level. You can ask for simplified explanations, code walkthroughs, or custom study breakdowns.
            </p>

            <div className="pt-2">
              <button
                onClick={() => {
                  const aiBtn = document.querySelector('button[title="SkillMate AI Tutor"]');
                  if (aiBtn) aiBtn.click();
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white font-bold text-sm rounded-xl shadow-md transition-all"
              >
                <BrainCircuit className="w-4 h-4" />
                Open AI Learning Assistant
              </button>
            </div>
          </div>
        )}

        {/* Tab 6: Progress & Complete Level */}
        {activeTab === 'complete' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Level Completion Criteria</h3>
              <p className="text-xs text-slate-500">All 4 prerequisites must be satisfied to unlock the next level.</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-xs font-semibold text-slate-800">1. Learning Topics Viewed</span>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Done ✓
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-xs font-semibold text-slate-800">2. MCQ Assessment Score ≥ 70%</span>
                <span className={`text-xs font-bold flex items-center gap-1 ${
                  mcqPassed ? 'text-emerald-600' : 'text-amber-600'
                }`}>
                  {mcqPassed ? <CheckCircle2 className="w-4 h-4" /> : null}
                  {userProgress?.mcqScore || 0}% {mcqPassed ? '✓ Passed' : '(Needs ≥ 70%)'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-xs font-semibold text-slate-800">3. Practice Task Completed</span>
                <span className={`text-xs font-bold flex items-center gap-1 ${
                  practiceDone ? 'text-emerald-600' : 'text-amber-600'
                }`}>
                  {practiceDone ? <CheckCircle2 className="w-4 h-4" /> : null}
                  {practiceDone ? 'Completed ✓' : 'Pending submission'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-xs font-semibold text-slate-800">4. Mini Challenge Completed</span>
                <span className={`text-xs font-bold flex items-center gap-1 ${
                  challengeDone ? 'text-emerald-600' : 'text-amber-600'
                }`}>
                  {challengeDone ? <CheckCircle2 className="w-4 h-4" /> : null}
                  {challengeDone ? 'Completed ✓' : 'Pending submission'}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleCompleteLevel}
                disabled={!canUnlockNext || isCompleted}
                className="w-full py-4 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isCompleted ? (
                  <>Level Completed ✓ (Next Level Unlocked)</>
                ) : canUnlockNext ? (
                  <>🎉 Complete Level & Unlock Next Stage (+20 Credits)</>
                ) : (
                  <>Complete All Requirements Above to Unlock Next Level</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Milestone Modal */}
      {celebrationData && (
        <MilestoneModal
          isOpen={Boolean(celebrationData)}
          onClose={() => setCelebrationData(null)}
          title={celebrationData.title}
          badgeText={celebrationData.badgeText}
          message={celebrationData.message}
          actionText={celebrationData.nextLevelId ? "Go to Next Level" : "Return to Roadmap"}
          onAction={() => {
            if (celebrationData.nextLevelId) {
              navigate(`/level/${celebrationData.nextLevelId}`);
            } else {
              navigate('/roadmap/rd_fullstack');
            }
          }}
        />
      )}
    </div>
  );
}
