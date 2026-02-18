import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
    },
});

export const sendVerificationEmail = async (to: string, code: string): Promise<void> => {
    const mailOptions = {
        from: `"HealthPulse" <${process.env.SMTP_EMAIL}>`,
        to,
        subject: 'Verify Your HealthPulse Account',
        html: `
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
    `,
    };

    await transporter.sendMail(mailOptions);
};

export const sendPasswordResetEmail = async (to: string, code: string): Promise<void> => {
    const mailOptions = {
        from: `"HealthPulse" <${process.env.SMTP_EMAIL}>`,
        to,
        subject: 'Reset Your HealthPulse Password',
        html: `
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
    `,
    };

    await transporter.sendMail(mailOptions);
};
