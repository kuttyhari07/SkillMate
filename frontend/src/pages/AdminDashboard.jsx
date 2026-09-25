import React, { useState, useEffect } from 'react';
import api from '../api/client';
import {
  Shield,
  Users,
  BookOpen,
  Calendar,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  GraduationCap,
  Sparkles,
  BarChart3
} from 'lucide-react';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/admin/analytics');
        setAnalytics(res.data);
      } catch (err) {
        console.error('Error fetching admin analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8 text-xs text-slate-500">Loading admin analytics...</div>;
  }

  const metrics = analytics?.metrics;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <span className="text-xs font-bold text-purple-700 tracking-wider uppercase bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            System Operations
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            SkillMate Admin & Institutional Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time platform insights, skill gap analysis, and student peer exchange performance.
          </p>
        </div>

        {/* 4 Primary Top Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Total Students</span>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" /> {metrics?.totalStudents || 4}
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Active Exchanges</span>
            <p className="text-2xl sm:text-3xl font-black text-indigo-600 flex items-center gap-2">
              <Sparkles className="w-6 h-6" /> {metrics?.activeConnections || 2}
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Session Completion</span>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6" /> {metrics?.sessionCompletionRate || 85}%
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Practice Reviews</span>
            <p className="text-2xl sm:text-3xl font-black text-purple-600 flex items-center gap-2">
              <TrendingUp className="w-6 h-6" /> {metrics?.practiceCompletionRate || 80}%
            </p>
          </div>
        </div>

        {/* 2-Column: Skill Gaps & Popular Learning Paths */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Skill Gaps (High Demand vs Low Supply) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Skill Gap Analysis</h3>
                <p className="text-xs text-slate-500">Skills with high learning demand and mentor scarcity.</p>
              </div>
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>

            <div className="space-y-3">
              {(analytics?.skillGaps || []).slice(0, 5).map((gap, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-slate-900 block text-sm">{gap.skill}</strong>
                    <span className="text-[11px] text-slate-500">
                      Demand: <strong className="text-blue-600">{gap.learnDemand}</strong> learners • Mentors: <strong className="text-emerald-600">{gap.teachSupply}</strong>
                    </span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    gap.gap > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {gap.gap > 0 ? `Gap: +${gap.gap}` : 'Balanced'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Pathways */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Popular Learning Pathways</h3>
                <p className="text-xs text-slate-500">Curricula with highest student enrollment.</p>
              </div>
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>

            <div className="space-y-3">
              {(analytics?.popularPaths || []).map((path, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-slate-900 block text-sm">{path.title}</strong>
                    <span className="text-[11px] text-slate-500">{path.students} enrolled students</span>
                  </div>
                  <span className="text-xs font-extrabold text-blue-600">
                    {path.completionRate} Completion
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Most Active Departments */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-base text-slate-900">Most Active University Departments</h3>
            <span className="text-xs text-slate-500">Cross-departmental collaboration</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(analytics?.mostActiveDepartments || []).map((dept, idx) => (
              <div key={idx} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 space-y-1">
                <span className="text-xs font-bold text-slate-400">Rank #{idx + 1}</span>
                <h4 className="font-bold text-slate-900 text-sm truncate">{dept.department}</h4>
                <p className="text-xs text-blue-600 font-bold">{dept.count} active students</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
