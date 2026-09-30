import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { getStore, saveStore } from '../config/store.js';
import dotenv from 'dotenv';

dotenv.config();

// Determine configuration status
const RESEND_KEY = process.env.RESEND_API_KEY;
const BREVO_KEY = process.env.BREVO_API_KEY;
const BREVO_SMTP_USER = process.env.BREVO_SMTP_USER;
const BREVO_SMTP_PASS = process.env.BREVO_SMTP_PASS || process.env.BREVO_API_KEY;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

let resendClient = null;
if (RESEND_KEY) {
  try {
    resendClient = new Resend(RESEND_KEY);
    console.log('[EmailService] Resend API client initialized with API key.');
  } catch (err) {
    console.warn('[EmailService] Failed to init Resend client:', err.message);
  }
}

const GMAIL_USER = process.env.GMAIL_USER || (process.env.SMTP_USER?.includes('@gmail.com') ? process.env.SMTP_USER : null);
const GMAIL_PASS = process.env.GMAIL_PASS || process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;

let smtpTransporter = null;
if (GMAIL_USER && GMAIL_PASS) {
  try {
    smtpTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASS
      }
    });
    console.log('[EmailService] Gmail SMTP transporter initialized successfully.');
  } catch (err) {
    console.warn('[EmailService] Gmail SMTP init error:', err.message);
  }
} else if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
  try {
    smtpTransporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    });
    console.log('[EmailService] Custom SMTP transporter initialized successfully.');
  } catch (err) {
    console.warn('[EmailService] SMTP init error:', err.message);
  }
}

/**
 * Detect which email delivery channel to prioritize
 */
export const getActiveEmailProvider = () => {
  const explicit = (process.env.EMAIL_PROVIDER || '').toLowerCase();
  if (explicit === 'brevo') return 'brevo';
  if (explicit === 'smtp' || explicit === 'gmail') return 'smtp';
  if (explicit === 'resend' && resendClient) return 'resend';
  if (process.env.BREVO_API_KEY || BREVO_KEY) return 'brevo';
  if (smtpTransporter) return 'smtp';
  if (resendClient) return 'resend';
  return 'preview';
};

/**
 * Send email through Brevo REST API v3
 */
const sendViaBrevoApi = async ({ to, subject, html, text }) => {
  const apiKey = process.env.BREVO_API_KEY || BREVO_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_FROM_ADDRESS || 'hariharangmhk0429@gmail.com';
  const senderName = process.env.EMAIL_FROM_NAME || 'SkillMate';

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: [{ email: to }],
      subject: subject,
      htmlContent: html,
      textContent: text || subject
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Brevo API Error (${response.status}): ${errorData.message || response.statusText}`);
  }

  const result = await response.json().catch(() => ({}));
  return { messageId: result.messageId || 'brevo_' + Date.now() };
};

/**
 * Universal email sender supporting Brevo, SMTP, Resend, and Dev Preview
 */
export const sendEmail = async ({ to, subject, html, text, category = 'General' }) => {
  const store = getStore();
  const provider = getActiveEmailProvider();

  const logEntry = {
    id: 'email_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    toEmail: to,
    subject,
    htmlBody: html,
    category,
    provider,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  store.emailLogs.unshift(logEntry);
  saveStore();

  // 1. Try Brevo API if prioritized or configured
  const brevoKey = process.env.BREVO_API_KEY || BREVO_KEY;
  if ((provider === 'brevo' || provider === 'brevo_api' || (process.env.EMAIL_PROVIDER || '').toLowerCase() === 'brevo') && brevoKey) {
    try {
      const res = await sendViaBrevoApi({ to, subject, html, text });
      logEntry.status = 'sent';
      logEntry.provider = 'brevo';
      logEntry.providerMessageId = res.messageId;
      saveStore();
      console.log(`[EmailService - Brevo API] Email dispatched successfully to ${to} (${subject}) [ID: ${res.messageId}]`);
      return { success: true, mode: 'brevo', id: res.messageId, logEntry };
    } catch (err) {
      console.error(`[EmailService - Brevo API Error] Failed to send to ${to}:`, err.message);
      logEntry.error = err.message;
    }
  }

  // 1. If explicit SMTP is configured as primary, dispatch via SMTP first
  if (provider === 'smtp' && smtpTransporter) {
    try {
      const from = process.env.EMAIL_FROM || process.env.GMAIL_USER || process.env.SMTP_USER || '"SkillMate" <no-reply@skillmate.edu>';
      const info = await smtpTransporter.sendMail({
        from,
        to,
        subject,
        html,
        text: text || subject
      });
      logEntry.status = 'sent';
      logEntry.provider = 'smtp';
      logEntry.providerMessageId = info.messageId;
      saveStore();
      console.log(`[EmailService - SMTP] Email dispatched successfully to ${to} (${subject}) [ID: ${info.messageId}]`);
      return { success: true, mode: 'smtp', id: info.messageId, logEntry };
    } catch (err) {
      console.error(`[EmailService - SMTP Error] Failed to send to ${to}:`, err.message);
      logEntry.error = err.message;
    }
  }

  // 2. Try Resend
  if (resendClient && (process.env.EMAIL_PROVIDER || '').toLowerCase() !== 'smtp') {
    try {
      const from = process.env.RESEND_FROM || process.env.EMAIL_FROM || 'SkillMate <onboarding@resend.dev>';
      const res = await resendClient.emails.send({
        from,
        to: [to],
        subject,
        html,
        text: text || subject
      });

      if (!res.error) {
        logEntry.status = 'sent';
        logEntry.provider = 'resend';
        logEntry.providerMessageId = res.data?.id;
        saveStore();
        console.log(`[EmailService - Resend] Email dispatched successfully to ${to} (${subject}) [ID: ${res.data?.id}]`);
        return { success: true, mode: 'resend', id: res.data?.id, logEntry };
      }

      console.warn(`[EmailService - Resend Warning] Could not deliver to ${to}: ${res.error.message}`);
      logEntry.error = res.error.message;

      // If Resend failed (e.g. testing domain restriction), try SMTP fallback if available
      if (smtpTransporter) {
        console.log(`[EmailService] Resend restricted recipient, falling back to SMTP for ${to}...`);
        try {
          const from = process.env.EMAIL_FROM || process.env.GMAIL_USER || process.env.SMTP_USER || '"SkillMate" <no-reply@skillmate.edu>';
          const info = await smtpTransporter.sendMail({
            from,
            to,
            subject,
            html,
            text: text || subject
          });
          logEntry.status = 'sent';
          logEntry.provider = 'smtp';
          logEntry.providerMessageId = info.messageId;
          saveStore();
          console.log(`[EmailService - SMTP Fallback] Email dispatched successfully to ${to} (${subject})`);
          return { success: true, mode: 'smtp', id: info.messageId, logEntry };
        } catch (smtpErr) {
          console.error(`[EmailService - SMTP Fallback Error] Failed to send to ${to}:`, smtpErr.message);
          logEntry.error = smtpErr.message;
        }
      }
    } catch (err) {
      console.error(`[EmailService - Resend Error] Failed to send to ${to}:`, err.message);
      logEntry.error = err.message;
    }
  }

  // 3. Fallback SMTP if not already attempted
  if (smtpTransporter && logEntry.status !== 'sent') {
    try {
      const from = process.env.EMAIL_FROM || process.env.GMAIL_USER || process.env.SMTP_USER || '"SkillMate" <no-reply@skillmate.edu>';
      const info = await smtpTransporter.sendMail({
        from,
        to,
        subject,
        html,
        text: text || subject
      });
      logEntry.status = 'sent';
      logEntry.provider = 'smtp';
      logEntry.providerMessageId = info.messageId;
      saveStore();
      console.log(`[EmailService - SMTP Fallback] Email dispatched successfully to ${to} (${subject})`);
      return { success: true, mode: 'smtp', id: info.messageId, logEntry };
    } catch (err) {
      console.error(`[EmailService - SMTP Fallback Error] Failed to send to ${to}:`, err.message);
      logEntry.error = err.message;
    }
  }

  // 4. Try Brevo API if configured
  if (BREVO_KEY && logEntry.status !== 'sent') {
    try {
      const res = await sendViaBrevoApi({ to, subject, html, text });
      logEntry.status = 'sent';
      logEntry.provider = 'brevo_api';
      logEntry.providerMessageId = res.messageId;
      saveStore();
      console.log(`[EmailService - Brevo API] Email dispatched successfully to ${to} (${subject})`);
      return { success: true, mode: 'brevo_api', id: res.messageId, logEntry };
    } catch (err) {
      console.error(`[EmailService - Brevo API Error] Failed to send to ${to}:`, err.message);
      logEntry.error = err.message;
    }
  }

  // 5. Development Preview Mode fallback
  logEntry.status = 'preview_logged';
  saveStore();
  console.log(`[EmailService - Dev Preview Logged] To: ${to} | Subject: "${subject}" | Category: ${category}`);
  return { success: true, mode: 'preview', logEntry };
};

// ==========================================
// Modern, Responsive Email Templates
// ==========================================
const baseTemplate = (title, content, actionButton = null) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #2563eb 100%); padding: 32px 24px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">SKILLMATE</h1>
              <p style="margin: 6px 0 0; color: #93c5fd; font-size: 13px; font-weight: 500; letter-spacing: 0.5px; text-transform: uppercase;">Connect Skills • Learn Together</p>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 32px 28px 24px;">
              ${content}

              ${actionButton ? `
              <div style="margin: 28px 0 10px; text-align: center;">
                <a href="${actionButton.url}" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 2px 8px rgba(37, 99, 235, 0.35);">
                  ${actionButton.text}
                </a>
              </div>
              ` : ''}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center;">
              <p style="margin: 0; color: #64748b; font-size: 12px; line-height: 1.5;">
                SkillMate EdTech Student Network • Peer Skill Sharing Platform<br>
                This email was triggered automatically. If you did not request this, please ignore.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const emailTemplates = {
  // 1. Email OTP Verification (Register or Password Reset)
  otpVerification: (name, otp, purpose = 'registration') => {
    const isRegister = purpose === 'registration';
    const title = isRegister ? 'Verify Your Email Address' : 'Reset Your SkillMate Password';
    const actionDesc = isRegister
      ? 'Thank you for registering on SkillMate! Use the 6-digit One-Time Password (OTP) below to verify your email address and activate your account.'
      : 'We received a request to reset your SkillMate password. Use the 6-digit OTP below to proceed with changing your password.';

    const content = `
      <h2 style="margin: 0 0 12px; color: #0f172a; font-size: 20px; font-weight: 700;">${title}</h2>
      <p style="margin: 0 0 16px; color: #475569; font-size: 14px; line-height: 1.6;">Hello <strong>${name || 'Student'}</strong>,</p>
      <p style="margin: 0 0 20px; color: #475569; font-size: 14px; line-height: 1.6;">${actionDesc}</p>
      
      <div style="background: #eff6ff; border: 2px dashed #3b82f6; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 12px; font-weight: 700; color: #1e40af; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 6px;">Your 6-Digit Verification Code</span>
        <div style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #1d4ed8; font-family: monospace;">${otp}</div>
        <span style="font-size: 12px; color: #64748b; display: block; margin-top: 8px;">Valid for 10 minutes. Do not share this code with anyone.</span>
      </div>

      <p style="margin: 0; color: #64748b; font-size: 13px; line-height: 1.5;">If you did not request this OTP, you can safely disregard this email.</p>
    `;

    return {
      subject: isRegister ? `🔐 Your SkillMate Registration OTP: ${otp}` : `🔐 Your SkillMate Password Reset OTP: ${otp}`,
      category: isRegister ? 'Registration OTP' : 'Password Reset OTP',
      html: baseTemplate(title, content)
    };
  },

  // 2. Password Reset Success Confirmation
  passwordResetSuccess: (name) => {
    const title = 'SkillMate Password Changed Successfully';
    const content = `
      <h2 style="margin: 0 0 12px; color: #0f172a; font-size: 20px; font-weight: 700;">Password Updated! 🔒</h2>
      <p style="margin: 0 0 16px; color: #475569; font-size: 14px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
      <p style="margin: 0 0 16px; color: #475569; font-size: 14px; line-height: 1.6;">
        Your SkillMate account password was just changed successfully. You can now use your new password to sign in.
      </p>
      <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 12px 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
        <p style="margin: 0; color: #166534; font-size: 13px; font-weight: 600;">Security Notice</p>
        <p style="margin: 4px 0 0; color: #15803d; font-size: 12px;">If you did not make this change, please contact support or immediately reset your password.</p>
      </div>
    `;

    return {
      subject: '🔒 Your SkillMate Password Has Been Reset',
      category: 'Security',
      html: baseTemplate(title, content, { url: 'http://localhost:5173/login', text: 'Sign In to SkillMate' })
    };
  },

  // 3. Welcome Email
  welcome: (name) => {
    const title = 'Welcome to SkillMate!';
    const content = `
      <h2 style="margin: 0 0 12px; color: #0f172a; font-size: 22px; font-weight: 800;">Congratulations, ${name}! 🎉</h2>
      <p style="margin: 0 0 16px; color: #475569; font-size: 14px; line-height: 1.6;">
        Your SkillMate account is verified and ready. You have received <strong style="color: #2563eb;">100 Skill Credits</strong> as a welcome bonus!
      </p>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 20px 0;">
        <h3 style="margin: 0 0 8px; color: #0f172a; font-size: 15px; font-weight: 700;">What's next?</h3>
        <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 13px; line-height: 1.8;">
          <li>Explore roadmaps for Web Dev, Python, React, and Data Science.</li>
          <li>Find student Skill Mates for 1-on-1 peer teaching & learning.</li>
          <li>Complete coding challenges & MCQ quizzes to unlock levels.</li>
        </ul>
      </div>
    `;

    return {
      subject: '🎉 Welcome to SkillMate! Your learning journey begins now',
      category: 'Registration',
      html: baseTemplate(title, content, { url: 'http://localhost:5173/dashboard', text: 'Go to Your Dashboard' })
    };
  },

  // 4. Connection Request (Invite)
  connectionRequest: (senderName, skillOffered, skillRequested) => {
    const title = 'New SkillMate Connection Request';
    const content = `
      <h2 style="margin: 0 0 12px; color: #0f172a; font-size: 20px; font-weight: 700;">New Skill Mate Request 🤝</h2>
      <p style="margin: 0 0 16px; color: #475569; font-size: 14px; line-height: 1.6;">
        <strong>${senderName}</strong> wants to connect with you on SkillMate!
      </p>

      <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px; margin: 20px 0;">
        <p style="margin: 0; color: #1e40af; font-size: 14px;"><strong>They can teach:</strong> ${skillOffered}</p>
        <p style="margin: 8px 0 0; color: #1e40af; font-size: 14px;"><strong>They want to learn:</strong> ${skillRequested}</p>
      </div>

      <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.6;">
        Accept this invitation to start real-time chat, schedule sessions, and exchange knowledge.
      </p>
    `;

    return {
      subject: `🤝 New SkillMate Connection Request from ${senderName}`,
      category: 'Connection',
      html: baseTemplate(title, content, { url: 'http://localhost:5173/find-mates', text: 'View & Accept Connection' })
    };
  },

  // 5. Connection Accepted
  connectionAccepted: (partnerName) => {
    const title = "You're now Connected!";
    const content = `
      <h2 style="margin: 0 0 12px; color: #0f172a; font-size: 20px; font-weight: 700;">You're now Skill Mates! 🤝</h2>
      <p style="margin: 0 0 16px; color: #475569; font-size: 14px; line-height: 1.6;">
        <strong>${partnerName}</strong> accepted your connection request!
      </p>
      <p style="margin: 0 0 16px; color: #475569; font-size: 14px; line-height: 1.6;">
        You can now message each other, share practice assignments, and schedule peer sessions.
      </p>
    `;

    return {
      subject: `🎉 You are now connected with ${partnerName}!`,
      category: 'Connection',
      html: baseTemplate(title, content, { url: 'http://localhost:5173/messages', text: 'Open SkillMate Chat' })
    };
  },

  // 6. Assignment / Practice Assigned
  assignmentAssigned: (assignerName, titleText, skill, difficulty, timeMinutes) => {
    const title = 'New Practice Assignment Assigned';
    const content = `
      <h2 style="margin: 0 0 12px; color: #0f172a; font-size: 20px; font-weight: 700;">New Assignment from ${assignerName} 📝</h2>
      <p style="margin: 0 0 16px; color: #475569; font-size: 14px; line-height: 1.6;">
        Your peer <strong>${assignerName}</strong> has assigned you a new peer practice challenge:
      </p>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 20px 0;">
        <h3 style="margin: 0 0 6px; color: #0f172a; font-size: 16px; font-weight: 800;">${titleText}</h3>
        <p style="margin: 4px 0 0; color: #64748b; font-size: 13px;"><strong>Skill:</strong> ${skill} • <strong>Difficulty:</strong> ${difficulty} • <strong>Est. Time:</strong> ${timeMinutes} mins</p>
      </div>

      <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.6;">
        Solving this assignment will earn you <strong>+5 Skill Credits</strong> and strengthen your portfolio!
      </p>
    `;

    return {
      subject: `📝 New SkillMate Practice Assignment: "${titleText}"`,
      category: 'Assignment',
      html: baseTemplate(title, content, { url: 'http://localhost:5173/practice', text: 'Start Assignment Now' })
    };
  },

  // 7. Assignment Submitted
  assignmentSubmitted: (studentName, titleText) => {
    const title = 'Practice Assignment Submitted';
    const content = `
      <h2 style="margin: 0 0 12px; color: #0f172a; font-size: 20px; font-weight: 700;">Assignment Completed! ✅</h2>
      <p style="margin: 0 0 16px; color: #475569; font-size: 14px; line-height: 1.6;">
        <strong>${studentName}</strong> has submitted their answers for the challenge: <strong>"${titleText}"</strong>.
      </p>
      <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.6;">
        Head over to Peer Practice to review their answers and provide feedback.
      </p>
    `;

    return {
      subject: `✅ Practice Assignment Submitted by ${studentName}`,
      category: 'Assignment',
      html: baseTemplate(title, content, { url: 'http://localhost:5173/practice', text: 'Review Submission' })
    };
  },

  // 8. New Direct Message
  // 8. New Direct Message
  newMessage: (senderName, contentSnippet, replyLink = 'http://localhost:5173/messages') => {
    const title = 'New Message on SkillMate';
    const content = `
      <h2 style="margin: 0 0 12px; color: #0f172a; font-size: 20px; font-weight: 700;">New Message from ${senderName} 💬</h2>
      <p style="margin: 0 0 16px; color: #475569; font-size: 14px; line-height: 1.6;">
        You have received a new message from <strong>${senderName}</strong>:
      </p>

      <div style="background: #f1f5f9; border-left: 4px solid #2563eb; border-radius: 0 10px 10px 0; padding: 16px 20px; margin: 20px 0;">
        <p style="margin: 0; color: #1e293b; font-size: 15px; font-style: italic; line-height: 1.6;">
          "${contentSnippet.length > 200 ? contentSnippet.substring(0, 200) + '...' : contentSnippet}"
        </p>
      </div>

      <div style="margin: 24px 0 10px; text-align: center;">
        <a href="${replyLink}" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 700; font-size: 14px; display: inline-block;">
          💬 Reply in SkillMate Chat
        </a>
      </div>

      <p style="margin: 16px 0 0; color: #64748b; font-size: 12px; text-align: center;">
        Reply promptly to maintain an active learning partnership.
      </p>
    `;

    return {
      subject: `💬 New Message from ${senderName} on SkillMate`,
      category: 'Message',
      html: baseTemplate(title, content)
    };
  },

  // 9. Session Scheduled
  sessionScheduled: (topic, date, time, meetingLink, isDemo) => {
    const isGoogle = meetingLink && meetingLink.includes('meet.google.com');
    const title = isGoogle ? 'SkillMate Google Meet Session Confirmed' : 'SkillMate Session Confirmed';
    const content = `
      <h2 style="margin: 0 0 12px; color: #0f172a; font-size: 22px; font-weight: 800;">${isGoogle ? 'Google Meet Call Confirmed 🎥' : 'Session Confirmed 📅'}</h2>
      <p style="margin: 0 0 16px; color: #475569; font-size: 15px; line-height: 1.6;">
        Your 1-on-1 peer session on <strong>${topic}</strong> has been scheduled and confirmed on SkillMate!
      </p>

      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 14px; padding: 18px; margin: 20px 0;">
        <p style="margin: 0 0 8px; color: #166534; font-size: 14px;"><strong>📅 Date & Time:</strong> ${date} at ${time}</p>
        <p style="margin: 0 0 8px; color: #166534; font-size: 14px;"><strong>🌐 Meeting Platform:</strong> ${isGoogle ? 'Google Meet (Live Video & Audio)' : 'SkillMate Live Room'}</p>
        <p style="margin: 0; color: #15803d; font-size: 13px;">Join with your microphone and camera to talk, exchange skills, and code together.</p>
      </div>

      <div style="margin: 28px 0 16px; text-align: center;">
        <a href="${meetingLink}" target="_blank" rel="noopener noreferrer" style="background: linear-gradient(135deg, #059669, #0d9488); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 800; font-size: 15px; display: inline-block; box-shadow: 0 4px 14px rgba(5, 150, 105, 0.4);">
          🎥 Join Google Meet Session
        </a>
      </div>

      <p style="margin: 16px 0 0; color: #64748b; font-size: 12px; text-align: center; word-break: break-all;">
        Direct Meeting URL:<br>
        <a href="${meetingLink}" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline;">${meetingLink}</a>
      </p>
    `;

    return {
      subject: `🎥 SkillMate Google Meet Session: ${topic}`,
      category: 'Session',
      html: baseTemplate(title, content)
    };
  },

  // 10. Instant Room Invitation
  instantRoomInvite: (senderName, topic, meetingLink) => {
    const isGoogle = meetingLink && meetingLink.includes('meet.google.com');
    const title = 'Live Google Meet Call Invitation';
    const content = `
      <h2 style="margin: 0 0 12px; color: #0f172a; font-size: 22px; font-weight: 800;">${senderName} is waiting for you in Google Meet! 🎥</h2>
      <p style="margin: 0 0 16px; color: #475569; font-size: 15px; line-height: 1.6;">
        Hello! <strong>${senderName}</strong> has just started a live 1-on-1 Google Meet session and invited you to talk and practice right now.
      </p>

      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 14px; padding: 18px; margin: 20px 0;">
        <p style="margin: 0 0 8px; color: #166534; font-size: 14px;"><strong>Topic:</strong> ${topic || 'Live Peer Study Session'}</p>
        <p style="margin: 0 0 8px; color: #166534; font-size: 14px;"><strong>Host:</strong> ${senderName}</p>
        <p style="margin: 0; color: #15803d; font-size: 13px;">Click below to join the call immediately with your microphone and camera.</p>
      </div>

      <div style="margin: 28px 0 16px; text-align: center;">
        <a href="${meetingLink}" target="_blank" rel="noopener noreferrer" style="background: linear-gradient(135deg, #059669, #0d9488); color: #ffffff; text-decoration: none; padding: 14px 34px; border-radius: 12px; font-weight: 800; font-size: 15px; display: inline-block; box-shadow: 0 4px 14px rgba(5, 150, 105, 0.4);">
          🎥 Join Google Meet Now
        </a>
      </div>

      <p style="margin: 16px 0 0; color: #64748b; font-size: 12px; text-align: center; word-break: break-all;">
        Direct Link:<br>
        <a href="${meetingLink}" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline;">${meetingLink}</a>
      </p>
    `;

    return {
      subject: `🎥 ${senderName} invited you to join Google Meet right now!`,
      category: 'Room Invite',
      html: baseTemplate(title, content)
    };
  },

  // 10. Level Unlocked
  levelUnlocked: (completedLevel, nextLevel) => {
    const title = 'Level Completed!';
    const content = `
      <h2 style="margin: 0 0 12px; color: #0f172a; font-size: 20px; font-weight: 700;">Awesome progress! 🚀</h2>
      <p style="margin: 0 0 16px; color: #475569; font-size: 14px; line-height: 1.6;">
        You have successfully completed <strong>${completedLevel}</strong>!
      </p>
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin: 18px 0;">
        <p style="margin: 0; color: #166534; font-weight: 700;">Unlocked Next Level: ${nextLevel}</p>
      </div>
      <p style="margin: 0; color: #64748b; font-size: 13px;">Keep up your learning streak!</p>
    `;

    return {
      subject: `🏆 Level Completed! ${nextLevel} is now Unlocked`,
      category: 'Learning',
      html: baseTemplate(title, content, { url: 'http://localhost:5173/my-learning', text: 'Continue Roadmap' })
    };
  },

  // 11. Platform Notification Alert (In-App Notification & Test Dispatch)
  notificationAlert: (userName, titleText, messageText, actionLink = '/notifications', category = 'Notification') => {
    const heading = titleText || 'SkillMate Notification Alert';
    const content = `
      <h2 style="margin: 0 0 12px; color: #0f172a; font-size: 20px; font-weight: 700;">${heading} 🔔</h2>
      <p style="margin: 0 0 14px; color: #475569; font-size: 14px; line-height: 1.6;">Hello <strong>${userName || 'SkillMate Student'}</strong>,</p>
      
      <div style="background: #f0f7ff; border-left: 4px solid #2563eb; border-radius: 0 10px 10px 0; padding: 16px 20px; margin: 20px 0;">
        <p style="margin: 0; color: #1e293b; font-size: 14px; line-height: 1.6; font-weight: 500;">
          ${messageText}
        </p>
      </div>

      <p style="margin: 0; color: #64748b; font-size: 13px; line-height: 1.5;">
        You received this notification based on your SkillMate activity and email preferences.
      </p>
    `;

    const buttonUrl = actionLink && actionLink.startsWith('http')
      ? actionLink
      : `http://localhost:5173${actionLink || '/notifications'}`;

    return {
      subject: `🔔 SkillMate Alert: ${heading}`,
      category: category || 'Notification',
      html: baseTemplate(heading, content, { url: buttonUrl, text: 'Open SkillMate' })
    };
  }
};

export const getEmailLogs = () => {
  const store = getStore();
  return store.emailLogs || [];
};

export default {
  sendEmail,
  emailTemplates,
  getEmailLogs,
  getActiveEmailProvider
};
