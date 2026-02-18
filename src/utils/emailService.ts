import axios from 'axios';

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

const sendEmail = async (to: string, subject: string, html: string): Promise<void> => {
    await axios.post(
        BREVO_API_URL,
        {
            sender: { name: 'HealthPulse', email: process.env.SMTP_EMAIL },
            to: [{ email: to }],
            subject,
            htmlContent: html,
        },
        {
            headers: {
                'api-key': process.env.BREVO_API_KEY,
                'Content-Type': 'application/json',
            },
        }
    );
};

export const sendVerificationEmail = async (to: string, code: string): Promise<void> => {
    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #ffffff; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #7c3aed; font-size: 24px; margin: 0;">HealthPulse</h1>
        </div>
        <h2 style="color: #1e293b; font-size: 20px; text-align: center;">Verify Your Email</h2>
        <p style="color: #64748b; text-align: center; font-size: 14px;">Enter this 6-digit code to verify your account:</p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #7c3aed; background: #f5f3ff; padding: 12px 24px; border-radius: 12px; display: inline-block;">${code}</span>
        </div>
        <p style="color: #94a3b8; text-align: center; font-size: 12px;">This code expires in 10 minutes. If you didn't create an account, please ignore this email.</p>
      </div>
    `;
    await sendEmail(to, 'Verify Your HealthPulse Account', html);
};

export const sendPasswordResetEmail = async (to: string, code: string): Promise<void> => {
    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #ffffff; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #7c3aed; font-size: 24px; margin: 0;">HealthPulse</h1>
        </div>
        <h2 style="color: #1e293b; font-size: 20px; text-align: center;">Password Reset</h2>
        <p style="color: #64748b; text-align: center; font-size: 14px;">Enter this 6-digit code to reset your password:</p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #7c3aed; background: #f5f3ff; padding: 12px 24px; border-radius: 12px; display: inline-block;">${code}</span>
        </div>
        <p style="color: #94a3b8; text-align: center; font-size: 12px;">This code expires in 10 minutes. If you didn't request a password reset, please ignore this email.</p>
      </div>
    `;
    await sendEmail(to, 'Reset Your HealthPulse Password', html);
};
