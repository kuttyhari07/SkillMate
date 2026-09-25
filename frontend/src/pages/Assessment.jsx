import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import MilestoneModal from '../components/MilestoneModal';
import {
  Compass,
  CheckCircle2,
  XCircle,
  Trophy,
  ArrowRight,
  Sparkles,
  BookOpen
} from 'lucide-react';

export default function Assessment() {
  const [assessments, setAssessments] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const res = await api.get('/assessments');
        setAssessments(res.data.assessments || []);
        if (res.data.assessments?.length > 0) {
          loadAssessmentDetail(res.data.assessments[0].id);
        }
      } catch (err) {
        console.error('Error fetching assessments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssessments();
  }, []);

  const loadAssessmentDetail = async (id) => {
    try {
      const res = await api.get(`/assessments/${id}`);
      setSelectedAssessment(res.data.assessment);
      setAnswers({});
      setResult(null);
    } catch (err) {
      console.error('Error loading assessment details:', err);
    }
  };

  const handleSelectAnswer = (qId, optionIdx) => {
    if (result) return;
    setAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAssessment) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/assessments/${selectedAssessment.id}/submit`, { answers });
      setResult(res.data.result);
    } catch (err) {
      alert('Error submitting assessment: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <span className="text-xs font-bold text-blue-600 tracking-wider uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Skills Diagnostic & Calibration
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Skill Assessments
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Evaluate your starting baseline or test cross-level mastery across web technologies.
          </p>
        </div>

        {/* Assessment Type Selector */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex gap-2 overflow-x-auto">
          {assessments.map((asm) => (
            <button
              key={asm.id}
              onClick={() => loadAssessmentDetail(asm.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedAssessment?.id === asm.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {asm.title}
            </button>
          ))}
        </div>

        {/* Assessment Question Sheet or Results */}
        {result ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
                <Trophy className="w-8 h-8" />
              </div>

              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                Diagnostic Analysis Complete
              </span>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Score: {result.score}% ({result.correctCount} / {result.total})
              </h2>

              <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
                <p>
                  <strong>Suggested Starting Point:</strong>{' '}
                  <span className="text-blue-700 font-bold">{result.suggestedStartingPoint}</span>
                </p>
                {result.strengths?.length > 0 && (
                  <p>
                    <strong>Strengths:</strong>{' '}
                    <span className="text-emerald-700">{result.strengths.join(', ')}</span>
                  </p>
                )}
                {result.weakTopics?.length > 0 && (
                  <p>
                    <strong>Recommended Revision:</strong>{' '}
                    <span className="text-amber-700">{result.weakTopics.join(', ')}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="pt-2 text-center">
              <Link
                to="/roadmap/rd_fullstack"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                Go to Recommended Roadmap Level <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          selectedAssessment && (
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-lg text-slate-900">{selectedAssessment.title}</h3>
                <p className="text-xs text-slate-500">{selectedAssessment.description}</p>
              </div>

              <div className="space-y-6">
                {(selectedAssessment.questions || []).map((q, idx) => (
                  <div key={q.id} className="space-y-3">
                    <p className="font-bold text-sm text-slate-900">
                      {idx + 1}. {q.question}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = answers[q.id] === optIdx;
                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => handleSelectAnswer(q.id, optIdx)}
                            className={`p-3 rounded-xl border text-left font-medium transition-all ${
                              isSelected
                                ? 'bg-blue-50 border-blue-600 text-blue-900 font-semibold ring-2 ring-blue-500/10'
                                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={submitting || Object.keys(answers).length === 0}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                >
                  {submitting ? 'Evaluating...' : 'Submit Diagnostic Assessment'}
                </button>
              </div>
            </form>
          )
        )}
      </div>
    </div>
  );
}
