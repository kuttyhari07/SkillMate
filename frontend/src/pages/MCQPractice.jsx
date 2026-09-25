import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import {
  HelpCircle,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Trophy
} from 'lucide-react';

export default function MCQPractice() {
  const { levelId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(true);
  const [submittedResult, setSubmittedResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMCQs = async () => {
      try {
        const res = await api.get(`/mcq/${levelId}`);
        setData(res.data);
      } catch (err) {
        console.error('Error fetching MCQs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMCQs();
  }, [levelId]);

  // Timer interval
  useEffect(() => {
    let interval = null;
    if (timerActive && !submittedResult) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, submittedResult]);

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (questionId, optionIndex) => {
    if (submittedResult) return;
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = async () => {
    setTimerActive(false);
    try {
      const res = await api.post(`/mcq/${levelId}/submit`, {
        answers,
        timeSpentSeconds: timerSeconds
      });
      setSubmittedResult(res.data);
    } catch (err) {
      alert('Error submitting test: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRetry = () => {
    setSubmittedResult(null);
    setAnswers({});
    setCurrentIndex(0);
    setTimerSeconds(0);
    setTimerActive(true);
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8 text-sm text-slate-500">Loading quiz questions...</div>;
  }

  const questions = data?.questions || [];
  const currentQ = questions[currentIndex];
  const totalQuestions = questions.length;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex items-center justify-between">
          <Link
            to={`/level/${levelId}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Level Overview
          </Link>

          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-700 shadow-xs">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Time: {formatTimer(timerSeconds)}</span>
          </div>
        </div>

        {/* Quiz Submission Results Screen */}
        {submittedResult ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
            <div className="text-center space-y-3">
              <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center ${
                submittedResult.passed ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
              }`}>
                <Trophy className="w-8 h-8" />
              </div>

              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                submittedResult.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {submittedResult.passed ? 'Requirement Met (≥ 70%) ✓' : 'Revision Recommended (< 70%)'}
              </span>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Score: {submittedResult.correctCount} / {submittedResult.totalQuestions} ({submittedResult.scorePercentage}%)
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                {submittedResult.message}
              </p>
            </div>

            {/* Answer Breakdown with Explanations */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wide">
                Detailed Explanations & Review
              </h3>

              <div className="space-y-3">
                {submittedResult.results.map((res, rIdx) => (
                  <div
                    key={res.id}
                    className={`p-4 rounded-2xl border text-xs space-y-2 ${
                      res.isCorrect ? 'bg-emerald-50/40 border-emerald-200' : 'bg-red-50/40 border-red-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-bold text-slate-900 flex-1">
                        {rIdx + 1}. {res.question}
                      </p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        res.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {res.isCorrect ? 'Correct ✓' : 'Incorrect ✗'}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 space-y-1">
                      <p>Your choice: <strong className="text-slate-800">{res.options[res.selectedAnswerIndex] || 'Not answered'}</strong></p>
                      {!res.isCorrect && (
                        <p>Correct answer: <strong className="text-emerald-700">{res.options[res.correctIndex]}</strong></p>
                      )}
                    </div>

                    <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200/60 text-slate-700 leading-relaxed text-[11px]">
                      <strong>Explanation:</strong> {res.explanation}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={handleRetry}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" /> Retake Test
              </button>
              <Link
                to={`/level/${levelId}`}
                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-sm text-center flex items-center justify-center gap-1.5"
              >
                Return to Level Hub <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* Active Question Screen */
          currentQ && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
              {/* Question progress counter */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Question {currentIndex + 1} of {totalQuestions}
                </span>
                <span className="text-xs text-slate-400">
                  {Object.keys(answers).length} answered
                </span>
              </div>

              {/* Question title */}
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                {currentQ.question}
              </h2>

              {/* Options list */}
              <div className="space-y-3">
                {currentQ.options.map((option, optIdx) => {
                  const isSelected = answers[currentQ.id] === optIdx;
                  const letter = String.fromCharCode(65 + optIdx); // A, B, C, D

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(currentQ.id, optIdx)}
                      className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center gap-3.5 ${
                        isSelected
                          ? 'bg-blue-50 border-blue-600 text-blue-900 font-semibold ring-2 ring-blue-500/20 shadow-xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-800'
                      }`}
                    >
                      <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {letter}
                      </span>
                      <span className="flex-1">{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex(c => c - 1)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {currentIndex < totalQuestions - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIndex(c => c + 1)}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    Next Question <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-colors flex items-center gap-1.5"
                  >
                    Submit Test <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  </button>
                )}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
