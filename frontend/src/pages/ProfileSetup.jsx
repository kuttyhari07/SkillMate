import React, { useState, useRef } from 'react';
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
  Laptop,
  Camera,
  Upload,
  Check,
  RefreshCw
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
  const [photoPreview, setPhotoPreview] = useState(user?.avatar || '');
  const [photoChanged, setPhotoChanged] = useState(false);
  const fileInputRef = useRef(null);

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Photo is too large! Please choose an image smaller than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result);
      setPhotoChanged(true);
    };
    reader.readAsDataURL(file);
  };

  const handleResetPhoto = () => {
    const defaultAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user?.name || 'student')}`;
    setPhotoPreview(defaultAvatar);
    setPhotoChanged(true);
  };

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
      if (photoChanged && photoPreview) {
        await api.post('/users/upload-avatar', { image: photoPreview });
      }
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
          {/* Section: Profile Picture Upload */}
          <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-blue-50/60 to-indigo-50/40 border border-blue-100 flex flex-col sm:flex-row items-center gap-5">
            <div className="relative group shrink-0">
              <img
                src={photoPreview || user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user?.name || 'student')}`}
                alt="Profile Preview"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-white shadow-md transition-all group-hover:brightness-90"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-2xl bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs cursor-pointer"
                title="Change Photo"
              >
                <Camera className="w-5 h-5 drop-shadow" />
                <span className="text-[9px] font-bold mt-1 uppercase drop-shadow">Change</span>
              </button>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center justify-center sm:justify-start gap-1.5">
                  <Camera className="w-4 h-4 text-blue-600" /> Profile Photo
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload your own photo so other students and study partners can easily recognize you.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{photoChanged ? 'Select Different Photo' : 'Upload Your Photo'}</span>
                </button>

                {photoChanged && (
                  <button
                    type="button"
                    onClick={handleResetPhoto}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Reset to Default
                  </button>
                )}

                {photoChanged && (
                  <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Photo selected (will save on submit)
                  </span>
                )}
              </div>
            </div>
          </div>
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
