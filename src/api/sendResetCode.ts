// src/api/sendResetCode.ts

const RESEND_API_KEY = 're_JVb5t3Zf_LXWoY2P615EXRzpTCRnR9jxd';

export async function sendVerificationCode(email: string, code: string) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'StudySync <onboarding@resend.dev>', // Sandbox domain allowed by Resend
        to: [email],
        subject: 'Your StudySync Verification Code',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #3b82f6;">StudySync</h1>
            <h2>Verify your email</h2>
            <p>Use the code below to verify your email address:</p>
            <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; border-radius: 8px;">
              ${code}
            </div>
            <p style="color: #666; margin-top: 20px;">This code expires in 10 minutes.</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send email');
    }

    return { success: true };
  } catch (error: any) {
    console.error('Resend Error:', error);
    throw new Error('Failed to send verification email. Please try again.');
  }
}