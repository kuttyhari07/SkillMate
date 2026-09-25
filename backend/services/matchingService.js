export const calculateMatchScore = (currentUser, candidate) => {
  if (currentUser.id === candidate.id) return { score: 0, reasons: [] };

  let score = 0;
  const reasons = [];

  const myTeachSkills = (currentUser.skillsToTeach || []).map(s => (s.skill || s).toLowerCase());
  const myLearnSkills = (currentUser.skillsToLearn || []).map(s => (s.skill || s).toLowerCase());
  const candidateTeachSkills = (candidate.skillsToTeach || []).map(s => (s.skill || s).toLowerCase());
  const candidateLearnSkills = (candidate.skillsToLearn || []).map(s => (s.skill || s).toLowerCase());

  // 1. Can candidate teach what I want to learn?
  const matchedCandidateTeaches = candidateTeachSkills.filter(s => myLearnSkills.some(ml => ml.includes(s) || s.includes(ml)));
  if (matchedCandidateTeaches.length > 0) {
    score += 45;
    reasons.push(`${candidate.name} teaches ${matchedCandidateTeaches.join(', ')}`);
  }

  // 2. Can I teach what candidate wants to learn? (Reciprocal exchange)
  const matchedCandidateLearns = myTeachSkills.filter(s => candidateLearnSkills.some(cl => cl.includes(s) || s.includes(cl)));
  if (matchedCandidateLearns.length > 0) {
    score += 40;
    reasons.push(`You can teach ${matchedCandidateLearns.join(', ')} to ${candidate.name}`);
  }

  // 3. Department or College affinity
  if (currentUser.college && candidate.college && currentUser.college.toLowerCase() === candidate.college.toLowerCase()) {
    score += 5;
    reasons.push(`Same institution (${candidate.college})`);
  } else if (currentUser.department && candidate.department && currentUser.department.toLowerCase() === candidate.department.toLowerCase()) {
    score += 5;
    reasons.push(`Same field of study (${candidate.department})`);
  }

  // 4. Learning mode / Availability compatibility
  if (currentUser.learningMode && candidate.learningMode && (currentUser.learningMode === candidate.learningMode || candidate.learningMode === 'Peer' || currentUser.learningMode === 'Peer')) {
    score += 5;
    reasons.push(`Compatible learning mode (${candidate.learningMode})`);
  }

  // 5. Rating or Activity bonus
  const candidateRating = candidate.averageRating || 4.8;
  if (candidateRating >= 4.5) {
    score += 5;
    reasons.push(`Highly rated mentor (${candidateRating} ★)`);
  }

  // Cap at 98% (unless perfect)
  const finalScore = Math.min(98, Math.max(score, 15));

  return {
    score: finalScore,
    reasons: reasons.length > 0 ? reasons : ['Potential peer learning buddy']
  };
};

export const findSmartMatches = (currentUser, allUsers = []) => {
  const candidates = allUsers.filter(u => u.id !== currentUser.id && u.role !== 'admin');
  
  const matches = candidates.map(candidate => {
    const { score, reasons } = calculateMatchScore(currentUser, candidate);
    return {
      user: {
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        college: candidate.college,
        department: candidate.department,
        year: candidate.year,
        bio: candidate.bio,
        avatar: candidate.avatar,
        location: candidate.location,
        languages: candidate.languages,
        learningMode: candidate.learningMode,
        availability: candidate.availability,
        skillsToTeach: candidate.skillsToTeach,
        skillsToLearn: candidate.skillsToLearn,
        skillCredits: candidate.skillCredits || 100,
        averageRating: candidate.averageRating || 4.9,
        reviewsCount: candidate.reviewsCount || 12,
        teachingHours: candidate.teachingHours || 8,
        learningHours: candidate.learningHours || 14
      },
      matchScore: score,
      reasons
    };
  });

  // Sort descending by match score
  return matches.sort((a, b) => b.matchScore - a.matchScore);
};

export default {
  calculateMatchScore,
  findSmartMatches
};
