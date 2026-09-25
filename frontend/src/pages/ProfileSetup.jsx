import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import {
  Sparkles,
  Plus,
  Trash2,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Clock,
  Laptop
} from 'lucide-react';

export default function ProfileSetup() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [skillsToTeach, setSkillsToTeach] = useState(
    user?.skillsToTeach?.length > 0 ? user.skillsToTeach : [{ skill: 'Python', level: 'Intermediate' }]
  );
  const [skillsToLearn, setSkillsToLearn] = useState(
    user?.skillsToLearn?.length > 0 ? user.skillsToLearn : [{ skill: 'Java', level: 'Beginner' }]
  );
  const [bio, setBio] = useState(user?.bio || 'Passionate student excited to learn and teach skills on SkillMate.');
  const [availability, setAvailability] = useState(user?.availability || 'Weekdays 6:00 PM - 9:00 PM, Weekends');
  const [learningMode, setLearningMode] = useState(user?.learningMode || 'Peer');
  const [loading, setLoading] = useState(false);

  const availableCatalog = [
    'HTML', 'CSS', 'JavaScript', 'React', 'Python', 'Java', 'SQL / Database',
    'Spring Boot', 'Node.js', 'UI/UX Design', 'Figma', 'Dance', 'Music', 'Photography', 'Public Speaking'
  ];

  const addTeachSkill = () => {
    setSkillsToTeach([...skillsToTeach, { skill: 'HTML', level: 'Intermediate' }]);
  };

  const removeTeachSkill = (index) => {
    setSkillsToTeach(skillsToTeach.filter((_, i) => i !== index));
  };

  const addLearnSkill = () => {
    setSkillsToLearn([...skillsToLearn, { skill: 'React', level: 'Beginner' }]);
  };

  const removeLearnSkill = (index) => {
    setSkillsToLearn(skillsToLearn.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/users/me', {
        skillsToTeach,
        skillsToLearn,
        bio,
        availability,
        learningMode
      });
      await refreshUser();
      navigate('/goal-selection');
    } catch (err) {
      alert('Error updating profile: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-blue-600 tracking-wider uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Step 2 of 3
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Build Your Learning Profile
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Tell the community what skills you can share and what you'd like to master.
            This activates our Smart Student Matching engine!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-md space-y-8">
          {/* Section: Skills I Can Teach */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
                  Skills I Can Teach
                </h3>
              </div>
              <button
                type="button"
                onClick={addTeachSkill}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Skill
              </button>
            </div>

            <div className="space-y-3">
              {skillsToTeach.map((st, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <select
                    value={st.skill}
                    onChange={(e) => {
                      const updated = [...skillsToTeach];
                      updated[idx].skill = e.target.value;
                      setSkillsToTeach(updated);
                    }}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm bg-white"
                  >
                    {availableCatalog.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>

                  <select
                    value={st.level}
                    onChange={(e) => {
                      const updated = [...skillsToTeach];
                      updated[idx].level = e.target.value;
                      setSkillsToTeach(updated);
                    }}
                    className="w-32 px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm bg-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>

                  {skillsToTeach.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTeachSkill(idx)}
                      className="p-2 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section: Skills I Want to Learn */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
                  Skills I Want To Learn
                </h3>
              </div>
              <button
                type="button"
                onClick={addLearnSkill}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Skill
              </button>
            </div>

            <div className="space-y-3">
              {skillsToLearn.map((sl, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <select
                    value={sl.skill}
                    onChange={(e) => {
                      const updated = [...skillsToLearn];
                      updated[idx].skill = e.target.value;
                      setSkillsToLearn(updated);
                    }}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm bg-white"
                  >
                    {availableCatalog.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>

                  <select
                    value={sl.level}
                    onChange={(e) => {
                      const updated = [...skillsToLearn];
                      updated[idx].level = e.target.value;
                      setSkillsToLearn(updated);
                    }}
                    className="w-32 px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm bg-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>

                  {skillsToLearn.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLearnSkill(idx)}
                      className="p-2 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section: Learning Preferences */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Preferred Learning Mode
              </label>
              <select
                value={learningMode}
                onChange={(e) => setLearningMode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white text-slate-900"
              >
                <option value="Peer">Peer Learning (Collaborate with mates)</option>
                <option value="Self">Self Learning (Roadmaps & MCQs)</option>
                <option value="AI">AI Learning (Interactive AI tutor)</option>
                <option value="Live">Live Sessions (1-on-1 scheduled)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Your Availability
              </label>
              <input
                type="text"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                placeholder="e.g. Weekdays 6-8 PM, Weekends"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Short Student Bio
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others what you are building or studying..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Saving...' : 'Save & Select Learning Goal'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
