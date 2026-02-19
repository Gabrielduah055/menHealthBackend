import { BrevoError, BrevoTimeoutError } from '@getbrevo/brevo';
import brevo from '../config/brevo.config';

const BRAND_COLOR = '#7c3aed';
const BRAND_NAME = 'HealthPulse';

const sendEmail = async (to: string, subject: string, html: string): Promise<void> => {
    try {
        await brevo.transactionalEmails.sendTransacEmail({
            sender: { name: BRAND_NAME, email: process.env.SMTP_EMAIL },
            to: [{ email: to }],
            subject,
            htmlContent: html,
        });
    } catch (err) {
        if (err instanceof BrevoTimeoutError) {
            console.error('Brevo: Request timed out');
        } else if (err instanceof BrevoError) {
            console.error(`Brevo API error ${err.statusCode}:`, err.message);
        }
        throw err;
    }
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
          <h1 style="color: ${BRAND_COLOR}; font-size: 24px; margin: 0;">${BRAND_NAME}</h1>
        </div>
        <h2 style="color: #1e293b; font-size: 20px; text-align: center;">Password Reset</h2>
        <p style="color: #64748b; text-align: center; font-size: 14px;">Enter this 6-digit code to reset your password:</p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: ${BRAND_COLOR}; background: #f5f3ff; padding: 12px 24px; border-radius: 12px; display: inline-block;">${code}</span>
        </div>
        <p style="color: #94a3b8; text-align: center; font-size: 12px;">This code expires in 10 minutes. If you didn't request a password reset, please ignore this email.</p>
      </div>
    `;
    await sendEmail(to, 'Reset Your HealthPulse Password', html);
};

export const sendNewCommentAdminNotification = async (
    adminEmail: string,
    data: {
        commenterName: string;
        commenterEmail: string;
        contentExcerpt: string;
        postTitle: string;
        postSlug: string;
        commentId: string;
    }
): Promise<void> => {
    const frontendUrl = process.env.FRONTEND_URL || '';
    const commentLink = `${frontendUrl}/blog/${data.postSlug}#comment-${data.commentId}`;
    const adminLink = `${frontendUrl}/admin/comments`;
    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: ${BRAND_COLOR}; font-size: 24px; margin: 0;">${BRAND_NAME}</h1>
        </div>
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 8px;">New Comment Submitted</h2>
        <p style="color: #64748b; font-size: 14px; margin-bottom: 20px;">A new comment has been posted on <strong>${data.postTitle}</strong> and is awaiting your review.</p>
        <div style="background: #f8fafc; border-left: 4px solid ${BRAND_COLOR}; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <p style="margin: 0 0 8px 0; font-size: 13px; color: #475569;"><strong>From:</strong> ${data.commenterName} &lt;${data.commenterEmail}&gt;</p>
          <p style="margin: 0; font-size: 14px; color: #1e293b; font-style: italic;">"${data.contentExcerpt}"</p>
        </div>
        <div style="text-align: center; margin-bottom: 20px;">
          <a href="${commentLink}" style="display: inline-block; background: ${BRAND_COLOR}; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: 600; margin-right: 8px;">View Comment</a>
          <a href="${adminLink}" style="display: inline-block; background: #f1f5f9; color: #475569; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: 600;">Manage Comments</a>
        </div>
        <p style="color: #94a3b8; text-align: center; font-size: 12px;">You are receiving this because you are an administrator of ${BRAND_NAME}.</p>
      </div>
    `;
    await sendEmail(adminEmail, `New Comment on "${data.postTitle}" — ${BRAND_NAME}`, html);
};

export const sendAdminReplyNotification = async (
    userEmail: string,
    data: {
        userName: string;
        replyPreview: string;
        postTitle: string;
        postSlug: string;
        commentId: string;
    }
): Promise<void> => {
    const frontendUrl = process.env.FRONTEND_URL || '';
    const commentLink = `${frontendUrl}/blog/${data.postSlug}#comment-${data.commentId}`;
    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: ${BRAND_COLOR}; font-size: 24px; margin: 0;">${BRAND_NAME}</h1>
        </div>
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 8px;">The admin replied to your comment</h2>
        <p style="color: #64748b; font-size: 14px; margin-bottom: 20px;">Hi <strong>${data.userName}</strong>, the ${BRAND_NAME} team has responded to your comment on <strong>${data.postTitle}</strong>.</p>
        <div style="background: #f5f3ff; border-left: 4px solid ${BRAND_COLOR}; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <p style="margin: 0 0 6px 0; font-size: 12px; color: #7c3aed; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Admin Reply</p>
          <p style="margin: 0; font-size: 14px; color: #1e293b; font-style: italic;">"${data.replyPreview}"</p>
        </div>
        <div style="text-align: center; margin-bottom: 20px;">
          <a href="${commentLink}" style="display: inline-block; background: ${BRAND_COLOR}; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: 600;">View Full Reply</a>
        </div>
        <p style="color: #94a3b8; text-align: center; font-size: 12px;">You received this because you commented on ${BRAND_NAME}. <a href="${frontendUrl}" style="color: #94a3b8;">Visit site</a></p>
      </div>
    `;
    await sendEmail(userEmail, `Admin replied to your comment on "${data.postTitle}" — ${BRAND_NAME}`, html);
};
