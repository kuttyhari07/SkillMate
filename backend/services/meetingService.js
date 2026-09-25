import crypto from 'crypto';

export const createMeetingRoom = async ({ title, date, time, durationMinutes = 60, mentor, learner }) => {
  const isGoogleConfigured = Boolean(
    process.env.GOOGLE_CLIENT_ID && 
    process.env.GOOGLE_CLIENT_SECRET && 
    process.env.GOOGLE_REFRESH_TOKEN
  );

  if (isGoogleConfigured) {
    try {
      // In production with tokens:
      // return { meetingLink: 'https://meet.google.com/xyz-abc-def', isDemo: false };
    } catch (err) {
      console.warn('[MeetingService] Google Meet creation failed, falling back to Demo Meeting room');
    }
  }

  // SkillMate Demo Interactive Meeting Room (Hackathon/Demo Safe)
  const roomId = 'sm-' + crypto.randomBytes(4).toString('hex');
  const demoLink = `http://localhost:5173/meeting/${roomId}`;

  return {
    meetingLink: demoLink,
    roomId,
    isDemo: true,
    provider: 'SkillMate Virtual Meeting Room (Demo Mode)',
    instructions: 'Interactive peer learning room equipped with simulated HD Video, Audio, Whiteboard, and Code Sharing.'
  };
};

export default {
  createMeetingRoom
};
