import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  Users,
  Award,
  BookOpen,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Video,
  Coins,
  ShieldCheck,
  Zap,
  MessageSquare,
  Cpu,
  BrainCircuit
} from 'lucide-react';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-950 via-slate-900 to-slate-900 text-white pt-20 pb-28 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(#2563eb_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
        
        <div className="relative max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs sm:text-sm font-medium">
            <Sparkles className="w-4 h-4 text-blue-400 animate-spin-slow" />
            SkillMate • Connect Skills. Learn Together.
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-white">
            Learn skills step by step.<br />
            <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
              Practice with peers. Grow together.
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-xl text-slate-300 leading-relaxed font-normal">
            SkillMate is the all-in-one EdTech & Peer Skill Exchange SaaS platform.
            Choose a learning roadmap, master levels through structured topics & MCQs, 
            pair with smart-matched student mentors, and exchange skills through live interactive sessions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to={user ? "/roadmap/rd_fullstack" : "/register"}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 group"
            >
              Start Learning
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/find-mates"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-base transition-all flex items-center justify-center gap-2"
            >
              <Users className="w-5 h-5 text-blue-400" />
              Find Skill Mates
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-center border-t border-slate-800/80">
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">100%</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Structured Levels</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-blue-400">95%</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Smart Match Accuracy</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">24/7</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">AI Learning Assistant</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-400">Zero-Fail</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Demo & Online Rooms</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillar Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold text-blue-600 tracking-wider uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Complete Ecosystem
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Everything you need to master any skill with peers
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            SkillMate seamlessly bridges structured EdTech learning pathways with authentic student-to-student peer exchange.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Structured Level-by-Level Roadmaps</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Step through Level 1 to Level 10 sequentially. Unlock CSS only after mastering HTML with verified MCQ scores and challenges.
            </p>
            <ul className="text-xs text-slate-500 space-y-1.5 pt-2">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Concise concept explanations</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Configurable unlocking rules</li>
            </ul>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Smart Student Matching</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Connect with students who want what you teach, and teach what you want to learn, based on a calculated match percentage.
            </p>
            <ul className="text-xs text-slate-500 space-y-1.5 pt-2">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Dynamic reciprocal match scoring</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Explicit rationale & compatibility factors</li>
            </ul>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Contextual AI Learning Assistant</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Floating 🤖 SkillMate AI understands your current level, analyzes low MCQ scores, and prepares customized study agendas.
            </p>
            <ul className="text-xs text-slate-500 space-y-1.5 pt-2">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> OpenAI API integration</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Intelligent zero-fail local fallback</li>
            </ul>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">MCQ Engine & Safe Code Practice</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every level features timed multiple-choice assessments with immediate feedback, plus safe test-case validated coding tasks.
            </p>
            <ul className="text-xs text-slate-500 space-y-1.5 pt-2">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> 10-Question grading & explanations</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Safe predefined test verification</li>
            </ul>
          </div>

          {/* Card 5 */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Google Meet & Demo Online Rooms</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Schedule sessions with automated calendar links or jump straight into the built-in SkillMate Demo Online Meeting Room!
            </p>
            <ul className="text-xs text-slate-500 space-y-1.5 pt-2">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> AI-generated structured session agendas</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Collaborative notes & simulated video</li>
            </ul>
          </div>

          {/* Card 6 */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Coins className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Skill Credits, Badges & Rewards</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Earn +20 credits for teaching, +10 for reviewing peer code, and unlock badges to showcase on the community leaderboard.
            </p>
            <ul className="text-xs text-slate-500 space-y-1.5 pt-2">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Transparent credit ledger</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Verified 4-category peer ratings</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Interactive Demonstration Banner */}
      <section className="bg-slate-900 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold">Ready to explore the Full Stack Pathway?</h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            Experience the complete user journey: Register as Swedha, unlock HTML Level 1, score 80% on the quiz, connect with Priya for Java, and schedule your online session!
          </p>
          <div className="pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-sm shadow-md transition-all"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              Launch Interactive Demo Flow
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-950 text-slate-400 py-10 px-4 border-t border-slate-800 text-center text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm">SKILLMATE</span>
            <span>— Connect Skills. Learn Together.</span>
          </div>
          <p>© {new Date().getFullYear()} SkillMate SaaS Platform. Hackathon Edition.</p>
        </div>
      </footer>
    </div>
  );
}
