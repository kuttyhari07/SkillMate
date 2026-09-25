import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/client';
import {
  Compass,
  CheckCircle2,
  Lock,
  Play,
  ArrowRight,
  BookOpen,
  Award,
  Sparkles,
  Zap
} from 'lucide-react';

export default function RoadmapView() {
  const { goalId } = useParams();
  const activeGoal = goalId || 'rd_fullstack';

  const [roadmap, setRoadmap] = useState(null);
  const [levels, setLevels] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const res = await api.get(`/learning/roadmap/${activeGoal}`);
        setRoadmap(res.data.roadmap);
        setLevels(res.data.levels || []);
        setProgress(res.data.progress);
      } catch (err) {
        console.error('Error fetching roadmap:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoadmap();
  }, [activeGoal]);

  const overallProgress = progress?.overallProgress || 0;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Roadmap Title & Progress Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-blue-600 tracking-wider uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                {roadmap?.category || 'Technical'} Pathway
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
                {roadmap?.goalTitle || 'Full Stack Development'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
                {roadmap?.description}
              </p>
            </div>

            <div className="sm:text-right shrink-0 bg-slate-50 sm:bg-transparent p-4 sm:p-0 rounded-2xl border sm:border-0 border-slate-100">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
                Overall Progress
              </span>
              <span className="text-3xl font-extrabold text-blue-600">
                {overallProgress}%
              </span>
              <span className="text-xs text-slate-400 block mt-0.5">
                {progress?.completedCount || 0} of {levels.length} levels completed
              </span>
            </div>
          </div>

          {/* Graphical Progress Bar */}
          <div className="space-y-2">
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Visual Level-by-Level Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
              Roadmap Progression Tree
            </h2>
            <span className="text-xs text-slate-500">
              Complete each level's MCQs & challenges to unlock the next
            </span>
          </div>

          <div className="space-y-3.5">
            {levels.map((lvl) => {
              const isCompleted = lvl.status === 'completed';
              const isInProgress = lvl.status === 'in_progress';
              const isLocked = lvl.status === 'locked';

              return (
                <div
                  key={lvl.id}
                  className={`rounded-2xl border transition-all p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    isCompleted
                      ? 'bg-white border-emerald-200 shadow-xs'
                      : isInProgress
                      ? 'bg-white border-blue-500 shadow-md ring-4 ring-blue-500/10'
                      : 'bg-slate-50/80 border-slate-200 opacity-75'
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    {/* Status Badge Icon */}
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        : isInProgress
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                        : 'bg-slate-200 text-slate-400'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : isInProgress ? (
                        <Play className="w-5 h-5 fill-white" />
                      ) : (
                        <Lock className="w-5 h-5" />
                      )}
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          LEVEL {lvl.levelNumber}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800'
                            : isInProgress
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}>
                          {isCompleted ? 'Completed ✓' : isInProgress ? 'In Progress 🔵' : 'Locked 🔒'}
                        </span>
                      </div>

                      <h3 className={`font-bold text-base sm:text-lg ${isLocked ? 'text-slate-500' : 'text-slate-900'}`}>
                        {lvl.title}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-1 max-w-xl">
                        {lvl.description}
                      </p>

                      {/* Performance indicators */}
                      {!isLocked && (
                        <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500">
                          <span>MCQ Score: <strong className="text-slate-800">{lvl.mcqScore || 0}%</strong></span>
                          <span>•</span>
                          <span>Practice: <strong className={lvl.practiceDone ? 'text-emerald-600' : 'text-amber-600'}>
                            {lvl.practiceDone ? 'Done ✓' : 'Pending'}
                          </strong></span>
                          <span>•</span>
                          <span>Challenge: <strong className={lvl.challengeDone ? 'text-emerald-600' : 'text-amber-600'}>
                            {lvl.challengeDone ? 'Done ✓' : 'Pending'}
                          </strong></span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
                    {isLocked ? (
                      <button
                        disabled
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-100 text-slate-400 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-not-allowed"
                      >
                        <Lock className="w-3.5 h-3.5" /> Locked
                      </button>
                    ) : (
                      <Link
                        to={`/level/${lvl.id}`}
                        className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                          isInProgress
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        }`}
                      >
                        {isInProgress ? 'Continue Level' : 'Review Level'}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
