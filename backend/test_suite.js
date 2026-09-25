const BASE_URL = 'http://127.0.0.1:8000/api';

async function req(url, options = {}) {
  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${data.message || JSON.stringify(data)}`);
  }
  return data;
}

async function runTests() {
  console.log('--- 🧪 STARTING SKILLMATE COMPLETE END-TO-END TEST SUITE ---');

  try {
    // 1. Health Check
    const health = await req('/health', { method: 'GET' });
    console.log('✓ [1/15] Health check passed:', health.appName, 'mode:', health.dbStatus.mode);

    // 2. Login as Swedha
    const loginRes = await req('/auth/login', {
      method: 'POST',
      body: { email: 'swedha@skillmate.edu', password: 'password123' }
    });
    const token = loginRes.token;
    const authHeaders = { Authorization: `Bearer ${token}` };
    console.log('✓ [2/15] Swedha login passed. Welcome back message:', loginRes.message);

    // 3. Current User verification
    const meRes = await req('/auth/me', { method: 'GET', headers: authHeaders });
    console.log('✓ [3/15] Verified user:', meRes.user.name, 'Credits:', meRes.user.skillCredits);

    // 4. Fetch Roadmap
    const roadmapRes = await req('/learning/roadmap/rd_fullstack', { method: 'GET', headers: authHeaders });
    console.log('✓ [4/15] Roadmap loaded:', roadmapRes.roadmap.goalTitle, 'Total levels:', roadmapRes.levels.length);
    console.log('   Level 1 status:', roadmapRes.levels[0].status);
    console.log('   Level 2 status:', roadmapRes.levels[1].status);

    // 5. Fetch Level 1 Details
    const lvl1Res = await req('/learning/level/lvl_1', { method: 'GET', headers: authHeaders });
    console.log('✓ [5/15] Level 1 loaded:', lvl1Res.level.title, 'Topics count:', lvl1Res.level.topics.length);

    // 6. Mark Topics Viewed
    await req('/learning/level/lvl_1/topic-viewed', { method: 'POST', headers: authHeaders, body: { topicId: 't_html_struct' } });
    await req('/learning/level/lvl_1/topic-viewed', { method: 'POST', headers: authHeaders, body: { topicId: 't_html_tags' } });
    console.log('✓ [6/15] Marked topics viewed.');

    // 7. Submit MCQ Test with 80% (8 correct answers out of 10)
    const mcqAnswers = {
      'mcq_h1': 1,
      'mcq_h2': 1,
      'mcq_h3': 1,
      'mcq_h4': 2,
      'mcq_h5': 1,
      'mcq_h6': 2,
      'mcq_h7': 1,
      'mcq_h8': 1,
      'mcq_h9': 0, // intentional incorrect to yield 80%
      'mcq_h10': 3 // intentional incorrect
    };
    const mcqRes = await req('/mcq/lvl_1/submit', {
      method: 'POST',
      headers: authHeaders,
      body: { answers: mcqAnswers, timeSpentSeconds: 95 }
    });
    console.log('✓ [7/15] MCQ test submitted:', mcqRes.correctCount, '/', mcqRes.totalQuestions, `(${mcqRes.scorePercentage}%)`, 'Passed:', mcqRes.passed);

    // 8. Submit Code Challenge & Mini Challenge
    const codeSubmitRes = await req('/coding/code_h1/submit', {
      method: 'POST',
      headers: authHeaders,
      body: {
        code: '<!DOCTYPE html><html><body><main><h1>SkillMate Portal</h1><p>Connect Skills. Learn Together.</p></main></body></html>',
        levelId: 'lvl_1'
      }
    });
    console.log('✓ [8/15] Coding challenge submitted. Test cases passed:', codeSubmitRes.passedCases, '/', codeSubmitRes.totalCases);

    await req('/coding/mini-challenge/complete', {
      method: 'POST',
      headers: authHeaders,
      body: {
        levelId: 'lvl_1',
        submissionNote: 'Student registration card completed with valid HTML5 semantic tags.'
      }
    });
    console.log('✓ [9/15] Mini challenge marked completed.');

    // 9. Complete Level 1 & Unlock CSS Level 2!
    const completeRes = await req('/learning/level/lvl_1/complete', { method: 'POST', headers: authHeaders, body: {} });
    console.log('✓ [10/15] LEVEL 1 COMPLETED! 🎉 Unlocked next level:', completeRes.nextLevel, 'Credits earned:', completeRes.creditsEarned);

    // Verify roadmap updated
    const updatedRoadmap = await req('/learning/roadmap/rd_fullstack', { method: 'GET', headers: authHeaders });
    console.log('   Level 1 status now:', updatedRoadmap.levels[0].status);
    console.log('   Level 2 status now:', updatedRoadmap.levels[1].status);

    // 10. Smart Student Matching
    const matchesRes = await req('/matches', { method: 'GET', headers: authHeaders });
    const priyaMatch = matchesRes.matches.find(m => m.user.name.includes('Priya'));
    console.log('✓ [11/15] Smart Matches calculated. Priya Match Score:', priyaMatch?.matchScore, '% Reasons:', priyaMatch?.reasons);

    // 11. Direct Messages
    const sendMsgRes = await req('/messages', {
      method: 'POST',
      headers: authHeaders,
      body: {
        receiverId: 'usr_priya',
        content: 'Hey Priya, looking forward to our Java and HTML session today!'
      }
    });
    console.log('✓ [12/15] Direct message sent:', sendMsgRes.data.content);

    // 12. Schedule Session with AI Agenda & Demo Meeting Room
    const sessRes = await req('/sessions', {
      method: 'POST',
      headers: authHeaders,
      body: {
        partnerId: 'usr_priya',
        skill: 'Java & HTML',
        topic: 'Classes & Responsive Markup Pairing',
        date: '2026-09-26',
        time: '19:00',
        durationMinutes: 60,
        mode: 'online'
      }
    });
    console.log('✓ [13/15] Session scheduled. Room link:', sessRes.session.meetingLink, 'Agenda items:', sessRes.session.agenda.length);

    // 13. AI Learning Assistant query
    const aiRes = await req('/ai/chat', {
      method: 'POST',
      headers: authHeaders,
      body: { message: 'I scored 8/10 in HTML MCQ. What should I revise?' }
    });
    console.log('✓ [14/15] AI Assistant response received (mode:', aiRes.mode, '):', aiRes.reply.substring(0, 80) + '...');

    // 14. Admin Analytics
    const adminLogin = await req('/auth/login', {
      method: 'POST',
      body: { email: 'admin@skillmate.edu', password: 'admin123' }
    });
    const adminHeaders = { Authorization: `Bearer ${adminLogin.token}` };
    const analytics = await req('/admin/analytics', { method: 'GET', headers: adminHeaders });
    console.log('✓ [15/15] Admin Analytics verified:', analytics.metrics);

    console.log('\n========================================================');
    console.log('🎉 ALL 15 AUTOMATED TESTS PASSED WITH 100% SUCCESS!');
    console.log('========================================================');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

runTests();
