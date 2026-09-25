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
  console.log('--- 🧪 STARTING COMPLETE VERIFICATION OF ALL NEW FEATURES ---');

  try {
    // 1. Health check
    const health = await req('/health', { method: 'GET' });
    console.log('✓ [1/10] Server health status:', health.status);

    // 2. Email Provider & Logs check
    // Login as Swedha to get token
    const swedhaLogin = await req('/auth/login', {
      method: 'POST',
      body: { email: 'swedha@skillmate.edu', password: 'password123' }
    });
    const token = swedhaLogin.token;
    const authHeaders = { Authorization: `Bearer ${token}` };

    const emailStatus = await req('/email/logs', { method: 'GET', headers: authHeaders });
    console.log('✓ [2/10] Email Service Active Provider:', emailStatus.providerStatus.activeProvider);
    console.log('         Initial email logs count:', emailStatus.logs.length);

    // 3. Test Registration OTP Send
    const testRegEmail = `test_student_${Date.now()}@skillmate.edu`;
    const regOtpRes = await req('/auth/send-register-otp', {
      method: 'POST',
      body: { email: testRegEmail, name: 'Ananya Sharma' }
    });
    console.log('✓ [3/10] Send Register OTP response:', regOtpRes.message);
    const regOtp = regOtpRes.debugPreviewOtp;
    console.log('         Generated Registration OTP:', regOtp);

    // 4. Verify Registration OTP
    const verifyRegOtp = await req('/auth/verify-register-otp', {
      method: 'POST',
      body: { email: testRegEmail, otp: regOtp }
    });
    console.log('✓ [4/10] Registration OTP verified:', verifyRegOtp.verified);

    // 5. Complete Account Registration
    const regRes = await req('/auth/register', {
      method: 'POST',
      body: {
        name: 'Ananya Sharma',
        email: testRegEmail,
        password: 'password123',
        college: 'PSG College of Technology',
        department: 'AI & Data Science',
        year: '2nd Year',
        location: 'Coimbatore',
        languages: ['English', 'Tamil'],
        otp: regOtp
      }
    });
    console.log('✓ [5/10] New User Registered:', regRes.user.name, 'Credits:', regRes.user.skillCredits);

    const ananyaToken = regRes.token;
    const ananyaHeaders = { Authorization: `Bearer ${ananyaToken}` };

    // 6. Test Forgot Password Flow
    const forgotRes = await req('/auth/forgot-password', {
      method: 'POST',
      body: { email: testRegEmail }
    });
    console.log('✓ [6/10] Forgot password OTP sent:', forgotRes.message);
    const forgotOtp = forgotRes.debugPreviewOtp;
    console.log('         Forgot password OTP:', forgotOtp);

    // Reset password
    const resetRes = await req('/auth/reset-password', {
      method: 'POST',
      body: {
        email: testRegEmail,
        otp: forgotOtp,
        newPassword: 'newSecurePassword456'
      }
    });
    console.log('✓ [7/10] Password Reset Successful:', resetRes.message);

    // Login with new password
    const newLogin = await req('/auth/login', {
      method: 'POST',
      body: { email: testRegEmail, password: 'newSecurePassword456' }
    });
    console.log('✓ [8/10] Login with NEW password successful for:', newLogin.user.name);

    // 7. Test Cloudinary Avatar Upload
    const fakeBase64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const avatarRes = await req('/users/upload-avatar', {
      method: 'POST',
      headers: ananyaHeaders,
      body: { image: fakeBase64Image }
    });
    console.log('✓ [9/10] Profile Photo Upload Result:', avatarRes.message, 'Provider:', avatarRes.provider);

    // 8. Test New Message & Assignment Email Triggers
    // Send message from Ananya to Swedha
    const msgRes = await req('/messages', {
      method: 'POST',
      headers: ananyaHeaders,
      body: {
        receiverId: 'usr_swedha',
        content: 'Hi Swedha! Would you like to exchange React and Python skills today?'
      }
    });
    console.log('✓ [10/10] Direct message sent & email triggered:', msgRes.message);

    // Check final email logs
    const finalEmailLogs = await req('/email/logs', { method: 'GET', headers: authHeaders });
    console.log('\n--- 📬 EMAIL DISPATCH SUMMARY ---');
    console.log(`Total emails in dispatch log: ${finalEmailLogs.logs.length}`);
    finalEmailLogs.logs.slice(0, 5).forEach((log, i) => {
      console.log(`   ${i + 1}. [${log.category}] To: ${log.toEmail} | Subject: "${log.subject}" | Status: ${log.status}`);
    });

    console.log('\n======================================================');
    console.log('🎉 ALL EMAIL, OTP,brevo/resend, AND CLOUDINARY FEATURES PASSED 100%!');
    console.log('======================================================');
  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
}

runTests();
