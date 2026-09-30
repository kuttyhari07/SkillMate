export const createMeetingRoom = async ({ title, date, time, durationMinutes = 60, mentor, learner, meetingLink: customLink }) => {
  if (customLink && customLink.trim()) {
    return {
      meetingLink: customLink.trim(),
      roomId: customLink.split('/').pop(),
      isGoogleMeet: customLink.includes('meet.google.com'),
      provider: 'Google Meet'
    };
  }

  // Generate standard 10-char Google Meet code format: abc-defg-hij
  const randChars = (len) => {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < len; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const meetCode = `${randChars(3)}-${randChars(4)}-${randChars(3)}`;
  const meetLink = `https://meet.google.com/${meetCode}`;

  return {
    meetingLink: meetLink,
    roomId: meetCode,
    isGoogleMeet: true,
    provider: 'Google Meet',
    instructions: 'Live 1-on-1 audio and video session on Google Meet. Join with camera and microphone to speak with your SkillMate.'
  };
};

export default {
  createMeetingRoom
};
