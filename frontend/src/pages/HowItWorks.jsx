import React from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Users,
  CheckCircle2,
  BrainCircuit,
  MessageSquare,
  Video,
  Coins,
  Award,
  ArrowRight,
  BookOpen
} from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Register & Build Learning Profile',
      desc: 'Set up your profile, list skills you can teach and skills you want to learn, your college, and availability.',
      icon: Users,
      badge: 'Welcome +100 Credits'
    },
    {
      step: '02',
      title: 'Pick a Learning Goal & Roadmap',
      desc: 'Select "Full Stack Development", "Python", "UI/UX", "Music", or "Dance". SkillMate creates a structured 5-10 level path.',
      icon: Compass,
      badge: 'Personalized Pathway'
    },
    {
      step: '03',
      title: 'Learn Concepts & Complete MCQs',
      desc: 'Review concise concept cards. Take 10-question MCQ quizzes and score at least 70% to prove mastery.',
      icon: BookOpen,
      badge: 'Interactive Quizzes'
    },
    {
      step: '04',
      title: 'Safe Coding & Mini Challenges',
      desc: 'Write code in the browser with automated test cases. Complete the mini challenge to unlock the next level!',
      icon: CheckCircle2,
      badge: 'Level Unlocker'
    },
    {
      step: '05',
      title: 'Smart Matching & Direct Messaging',
      desc: 'Our reciprocal matching engine pairs you with peers who teach what you want and want what you teach with a 95% match score.',
      icon: MessageSquare,
      badge: 'Real-Time Chat'
    },
    {
      step: '06',
      title: 'Live Online Sessions & AI Agendas',
      desc: 'Schedule video sessions with Google Meet or the built-in SkillMate Demo Online Room. AI automatically generates the session plan.',
      icon: Video,
      badge: 'AI Session Planner'
    },
    {
      step: '07',
      title: 'Earn Credits, Ratings & Badges',
      desc: 'Get +20 credits for teaching, +10 for reviewing peer tasks. Rate each other across 4 criteria and climb the leaderboard.',
      icon: Coins,
      badge: 'Gamified Growth'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center space-y-4 mb-14">
          <span className="text-xs font-bold text-blue-600 tracking-wider uppercase bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-100">
            The SkillMate Journey
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            How SkillMate Works
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">
            From your very first lesson to teaching others and earning credits, here is how SkillMate powers your continuous learning loop.
          </p>
        </div>

        <div className="space-y-6">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex flex-col sm:flex-row items-start sm:items-center gap-6"
              >
                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-2xl sm:text-3xl font-black text-slate-300">
                    {s.step}
                  </span>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">{s.title}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                      {s.badge}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-14 text-center bg-gradient-to-r from-blue-900 to-indigo-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to begin your journey?</h2>
          <p className="text-blue-100 text-sm max-w-xl mx-auto mb-6">
            Join thousands of university students exchanging skills, building portfolios, and learning collaboratively.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-blue-900 font-bold text-sm hover:bg-blue-50 transition-colors shadow-md"
          >
            Create Free Account <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
