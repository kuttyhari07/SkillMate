import dotenv from 'dotenv';
dotenv.config();

// Fallback contextual intelligence engine for when OpenAI API key is not provided
const generateFallbackResponse = (message, context = {}) => {
  const lower = message.toLowerCase();
  const skill = context.skill || 'Full Stack Development';
  const level = context.level || 'HTML Basics';

  // 1. Weak topics & MCQ score analysis
  if (lower.includes('score') || lower.includes('mcq') || lower.includes('revise') || lower.includes('weak')) {
    return {
      reply: `Based on your recent practice in **${level}**, here is your personalized revision focus:
1. **Forms & Input Validations**: Re-read input type attributes (\`type="email"\`, \`required\`, \`placeholder\`).
2. **Semantic Elements**: Make sure you distinguish between \`<section>\`, \`<article>\`, and generic \`<div>\` containers.
3. **Accessibility**: Always include \`alt\` tags on \`<img>\` and pair \`<label for="...">\` with input IDs.

💡 *Tip:* Retake the MCQ test once you review these 3 points—it only takes 3 minutes!`,
      type: 'revision_advice'
    };
  }

  // 2. Explanations (forms, flexbox, async, hooks, etc.)
  if (lower.includes('form') || lower.includes('html form')) {
    return {
      reply: `### Understanding HTML Forms Simply 📝
An HTML \`<form>\` collects data from users and submits it to a server.

**Key Anatomy:**
- \`<form action="/submit" method="POST">\`: The container defining destination and HTTP method.
- \`<input type="text" name="username" required>\`: The field where users enter text.
- \`<label for="id">\`: Describes the field and improves usability & screen readers.
- \`<button type="submit">\`: Triggers submission.

**Quick Example:**
\`\`\`html
<form action="/login" method="POST">
  <label for="email">Email:</label>
  <input type="email" id="email" name="email" required />
  <button type="submit">Sign In</button>
</form>
\`\`\`
Would you like a mini-challenge to test your understanding?`,
      type: 'explanation'
    };
  }

  // 3. Question generation request
  if (lower.includes('question') || lower.includes('practice question') || lower.includes('quiz me')) {
    return {
      reply: `Here is a quick practice question for **${level}**:

**Question:** Which HTML5 element should you use for self-contained content that could theoretically be distributed independently (e.g., a blog post, news story, or forum post)?
- A) \`<section>\`
- B) \`<article>\`
- C) \`<aside>\`
- D) \`<main>\`

*(Reply with your choice A, B, C, or D to check your answer!)*`,
      type: 'practice_question'
    };
  }

  // 4. Study plan / timeline
  if (lower.includes('month') || lower.includes('plan') || lower.includes('schedule') || lower.includes('roadmap')) {
    return {
      reply: `### 🗓️ 12-Week Fast-Track Plan for ${skill}
- **Weeks 1-2 (Fundamentals):** HTML5 Semantic Markup, Modern CSS3 Flexbox & Grid, Responsive Design.
- **Weeks 3-4 (JavaScript Mastery):** ES6+ Syntax, DOM Manipulation, Async/Await, Fetch API.
- **Weeks 5-7 (Frontend Framework):** React Components, Hooks (\`useState\`, \`useEffect\`), React Router, Tailwind CSS.
- **Weeks 8-9 (Backend & APIs):** Node.js & Express.js RESTful API architecture, Middleware, JWT Auth.
- **Weeks 10-11 (Database & Integration):** MongoDB / Mongoose schema design, CRUD operations, Data validation.
- **Week 12 (Capstone & Deployment):** End-to-end SkillMate project, testing, deployment on Vercel/Render.

*Recommendation:* Dedicate 5-7 hours per week with peer review sessions on SkillMate to stay accountable!`,
      type: 'study_plan'
    };
  }

  // Generic helpful tutor response
  return {
    reply: `Hello! I'm your **SkillMate AI Learning Assistant** 🤖.
I'm tracking your progress in **${skill}** (${level}).

You can ask me to:
- Explain any confusing concept or code snippet with interactive examples
- Generate targeted practice questions to test your knowledge
- Analyze your test scores and tell you exactly what weak points to revise
- Create a personalized weekly study timetable
- Prepare an agenda for your upcoming peer session!

What would you like help with right now?`,
    type: 'general'
  };
};

// Generates suggested agenda for learning sessions
export const generateSessionPlan = async ({ skill, topic, level = 'Beginner', durationMinutes = 60 }) => {
  const duration = parseInt(durationMinutes) || 60;
  
  if (skill.toLowerCase().includes('dance')) {
    return [
      { time: '10 min', topic: 'Warm-up & Rhythm Check', description: 'Body conditioning and matching beat pulses' },
      { time: '20 min', topic: 'Core Routine & Footwork', description: 'Step-by-step breakdown of fundamental sequence' },
      { time: '20 min', topic: 'Synchronized Practice', description: 'Dancing together to tempo with live corrections' },
      { time: '10 min', topic: 'Cool Down & Peer Feedback', description: 'Highlighting strengths and areas to practice before next session' }
    ];
  }

  if (skill.toLowerCase().includes('music') || skill.toLowerCase().includes('singing')) {
    return [
      { time: '10 min', topic: 'Vocal/Instrument Warm-up', description: 'Scales, breathing exercises, and pitch calibration' },
      { time: '20 min', topic: 'Technique & Chords/Rhythm', description: 'Focus on clean finger transitions or voice modulation' },
      { time: '20 min', topic: 'Song Phrase Practice', description: 'Applying technique to a target musical segment' },
      { time: '10 min', topic: 'Review & Action Items', description: 'Notes on timing, posture, and homework drills' }
    ];
  }

  // Default Coding / Technical format
  const t1 = Math.round(duration * 0.15);
  const t2 = Math.round(duration * 0.35);
  const t3 = Math.round(duration * 0.35);
  const t4 = duration - (t1 + t2 + t3);

  return [
    { time: `${t1} min`, topic: 'Concept Review & Goal Setting', description: `Quick refresher on ${topic} core principles and setting session targets.` },
    { time: `${t2} min`, topic: 'Live Walkthrough & Guided Coding', description: `Mentor demonstrates implementation patterns and best practices for ${topic}.` },
    { time: `${t3} min`, topic: 'Hands-on Peer Practice Challenge', description: 'Learner writes code with real-time pairing and instant hints from mentor.' },
    { time: `${t4} min`, topic: 'Q&A, Doubt Clearance & Feedback', description: 'Review code written, discuss edge cases, and award SkillMate feedback ratings.' }
  ];
};

export const chatWithAI = async ({ message, context = {} }) => {
  // If OpenAI key is present, try OpenAI
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-')) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are SkillMate AI, an encouraging, concise EdTech tutor and peer-learning mentor. The student is currently studying ${context.skill || 'Full Stack'} at level: ${context.level || 'Beginner'}. Use concise formatting with markdown, bullet points, and code blocks where helpful.`
            },
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (response.ok) {
        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content;
        if (reply) {
          return { reply, mode: 'openai' };
        }
      }
    } catch (err) {
      console.warn('[AIService] OpenAI request failed, falling back to local engine:', err.message);
    }
  }

  // Zero-fail intelligent fallback mode
  const fallback = generateFallbackResponse(message, context);
  return { ...fallback, mode: 'smart_fallback' };
};

export const getPersonalizedRecommendation = ({ user, progress, recentScores = [] }) => {
  if (!progress || !progress.currentLevel) {
    return {
      badge: 'Welcome Starter',
      title: 'Begin Your Learning Roadmap',
      message: 'Choose a skill goal like "Full Stack Development" to unlock Level 1 (HTML Basics). You will earn 20 Skill Credits on completion!',
      action: 'start_goal'
    };
  }

  const avgScore = recentScores.length > 0
    ? Math.round(recentScores.reduce((a, b) => a + b, 0) / recentScores.length)
    : 80;

  if (avgScore < 70) {
    return {
      badge: 'Targeted Revision',
      title: `Reinforce ${progress.currentLevelTitle || 'Current Level'} Concepts`,
      message: `Your average practice score is ${avgScore}%. We recommend reviewing key topics or booking a quick 30-minute peer session with a Skill Mate before advancing!`,
      action: 'peer_review'
    };
  }

  return {
    badge: 'Momentum Builder 🚀',
    title: `Great Mastery in ${progress.currentLevelTitle || 'Current Level'}!`,
    message: `Your quiz and challenge performance is strong (${avgScore}%). You are ready to complete your mini-challenge and unlock the next level!`,
    action: 'continue_level'
  };
};

export default {
  chatWithAI,
  generateSessionPlan,
  getPersonalizedRecommendation
};
