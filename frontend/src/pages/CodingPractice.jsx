import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import {
  Code,
  Play,
  CheckCircle2,
  XCircle,
  Lightbulb,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Trophy
} from 'lucide-react';

export default function CodingPractice() {
  const { levelId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [code, setCode] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [miniChallengeNotes, setMiniChallengeNotes] = useState('');
  const [miniChallengeDone, setMiniChallengeDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const res = await api.get(`/coding/${levelId}`);
        setData(res.data);
        if (res.data.challenges?.length > 0) {
          const first = res.data.challenges[0];
          setSelectedChallenge(first);
          setCode(first.starterCode || '');
        }
      } catch (err) {
        console.error('Error fetching coding challenges:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchChallenges();
  }, [levelId]);

  const handleSelectChallenge = (ch) => {
    setSelectedChallenge(ch);
    setCode(ch.starterCode || '');
    setTestResult(null);
    setShowHints(false);
  };

  const handleRunCode = async () => {
    if (!selectedChallenge) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/coding/${selectedChallenge.id}/submit`, {
        code,
        levelId
      });
      setTestResult(res.data);
    } catch (err) {
      alert('Error running validation: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteMiniChallenge = async () => {
    try {
      await api.post('/coding/mini-challenge/complete', {
        levelId,
        submissionNote: miniChallengeNotes || 'Completed interactive requirements'
      });
      setMiniChallengeDone(true);
      alert('🎉 Mini Challenge marked as completed! You are now eligible to complete this level.');
    } catch (err) {
      alert('Error saving mini challenge: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8 text-sm text-slate-500">Loading coding challenges...</div>;
  }

  const challenges = data?.challenges || [];
  const miniChallenge = data?.miniChallenge;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to={`/level/${levelId}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Level Hub
          </Link>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Safe Test-Case Evaluator
          </span>
        </div>

        {/* 2-Column Split: Challenge Description & Code Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Challenge list and problem statement (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Challenge Selector Pills */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex gap-2 overflow-x-auto">
              {challenges.map((ch, idx) => (
                <button
                  key={ch.id}
                  onClick={() => handleSelectChallenge(ch)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    selectedChallenge?.id === ch.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Task {idx + 1}
                </button>
              ))}
            </div>

            {selectedChallenge ? (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                    {selectedChallenge.difficulty} Challenge
                  </span>
                  <button
                    onClick={() => setShowHints(!showHints)}
                    className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    {showHints ? 'Hide Hints' : 'View Hints'}
                  </button>
                </div>

                <h2 className="text-lg font-bold text-slate-900 leading-snug">
                  {selectedChallenge.title}
                </h2>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {selectedChallenge.statement}
                </p>

                {showHints && selectedChallenge.hints?.length > 0 && (
                  <div className="bg-amber-50/70 border border-amber-200 p-3.5 rounded-2xl space-y-1.5 text-xs text-amber-900 animate-in fade-in duration-150">
                    <p className="font-bold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Solution Hints:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedChallenge.hints.map((hint, hIdx) => (
                        <li key={hIdx}>{hint}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Evaluation Test Targets:
                  </h4>
                  <div className="space-y-1.5">
                    {(selectedChallenge.testCases || []).map((tc, tcIdx) => (
                      <div key={tcIdx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs font-mono text-slate-700">
                        <span className="text-[10px] text-slate-400 block font-sans">Check {tcIdx + 1}:</span>
                        <span>{tc.input} → expected match: "{tc.expected}"</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-2xl text-center text-xs text-slate-500">
                No individual coding exercises for this level. Complete the mini challenge below!
              </div>
            )}

            {/* Mini Challenge Card */}
            {miniChallenge && (
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-3xl p-6 space-y-3">
                <span className="text-xs font-extrabold text-indigo-700 uppercase tracking-wider">
                  ⭐ Level Mini Challenge
                </span>
                <h3 className="font-bold text-sm text-indigo-950">{miniChallenge.title}</h3>
                <p className="text-xs text-indigo-900/90 leading-relaxed">
                  {miniChallenge.description}
                </p>

                <div className="space-y-2 pt-2">
                  <textarea
                    rows={2}
                    value={miniChallengeNotes}
                    onChange={(e) => setMiniChallengeNotes(e.target.value)}
                    placeholder="Enter submission notes or link..."
                    className="w-full p-2.5 rounded-xl border border-indigo-200 text-xs text-slate-800 bg-white"
                  />
                  <button
                    onClick={handleCompleteMiniChallenge}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                      miniChallengeDone
                        ? 'bg-emerald-600 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                    }`}
                  >
                    {miniChallengeDone ? '✓ Mini Challenge Completed' : 'Submit & Mark Mini Challenge Complete'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Code Editor & Test Output (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                  </div>
                  <span className="text-xs font-mono text-slate-400 pl-2">solution_editor.js</span>
                </div>

                <button
                  onClick={handleRunCode}
                  disabled={submitting}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  {submitting ? 'Running...' : 'Run & Validate Solution'}
                </button>
              </div>

              {/* Textarea Editor */}
              <textarea
                rows={14}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-transparent font-mono text-xs sm:text-sm text-slate-100 p-2 focus:outline-none resize-y leading-relaxed"
                placeholder="// Write your solution here..."
                spellCheck="false"
              />
            </div>

            {/* Test Results Output Box */}
            {testResult && (
              <div className={`p-5 rounded-2xl border text-xs space-y-3 animate-in fade-in duration-200 ${
                testResult.allPassed
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm flex items-center gap-1.5">
                    {testResult.allPassed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-amber-600" />
                    )}
                    Test Cases Passed: {testResult.passedCases} / {testResult.totalCases}
                  </h4>
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                    testResult.allPassed ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'
                  }`}>
                    {testResult.allPassed ? 'All Passed ✓' : 'Needs Fix'}
                  </span>
                </div>

                <p className="text-xs">{testResult.message}</p>

                <div className="space-y-1.5 pt-1">
                  {testResult.testResults.map((tr, idx) => (
                    <div key={idx} className="bg-white/80 p-2.5 rounded-xl border border-slate-200/60 font-mono text-[11px] flex items-center justify-between">
                      <span>{tr.name}</span>
                      <span className={tr.passed ? 'text-emerald-600 font-bold' : 'text-red-500 font-bold'}>
                        {tr.message}
                      </span>
                    </div>
                  ))}
                </div>

                {testResult.allPassed && (
                  <div className="pt-2 flex justify-end">
                    <Link
                      to={`/level/${levelId}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs"
                    >
                      Return to Complete Level <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
