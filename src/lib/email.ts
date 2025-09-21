// E:\mannsahay\src\lib\email.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'mannsahay@example.com',
      to: options.to,
      subject: options.subject,
      text: options.text || '',
      html: options.html,
    });
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export function generateBookingConfirmationEmail(
  userName: string,
  counselorName: string,
  sessionTime: Date,
  meetingLink?: string
): string {
  const formattedDate = sessionTime.toLocaleDateString();
  const formattedTime = sessionTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3B82F6;">Booking Confirmed</h2>
      <p>Hello ${userName},</p>
      <p>Your counseling session has been confirmed with the following details:</p>
      
      <div style="background-color: #F3F4F6; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p><strong>Counselor:</strong> ${counselorName}</p>
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p><strong>Time:</strong> ${formattedTime}</p>
        ${meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${meetingLink}" style="color: #3B82F6;">Join Session</a></p>` : ''}
      </div>
      
      <p>Please make sure to join the session on time. If you need to reschedule or cancel, please do so at least 24 hours in advance.</p>
      
      <p>Best regards,<br>The MannSahay Team</p>
    </div>
  `;
}

export function generateSessionReminderEmail(
  userName: string,
  counselorName: string,
  sessionTime: Date,
  meetingLink?: string
): string {
  const formattedDate = sessionTime.toLocaleDateString();
  const formattedTime = sessionTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3B82F6;">Session Reminder</h2>
      <p>Hello ${userName},</p>
      <p>This is a reminder for your upcoming counseling session:</p>
      
      <div style="background-color: #F3F4F6; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p><strong>Counselor:</strong> ${counselorName}</p>
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p><strong>Time:</strong> ${formattedTime}</p>
        ${meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${meetingLink}" style="color: #3B82F6;">Join Session</a></p>` : ''}
      </div>
      
      <p>Please make sure to join the session on time. We look forward to seeing you!</p>
      
      <p>Best regards,<br>The MannSahay Team</p>
    </div>
  `;
}

export function generateSessionCancellationEmail(
  userName: string,
  counselorName: string,
  sessionTime: Date,
  reason?: string
): string {
  const formattedDate = sessionTime.toLocaleDateString();
  const formattedTime = sessionTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #EF4444;">Session Cancelled</h2>
      <p>Hello ${userName},</p>
      <p>Your counseling session has been cancelled with the following details:</p>
      
      <div style="background-color: #FEE2E2; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p><strong>Counselor:</strong> ${counselorName}</p>
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p><strong>Time:</strong> ${formattedTime}</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      </div>
      
      <p>We apologize for any inconvenience. You can book a new session at your convenience.</p>
      
      <p>Best regards,<br>The MannSahay Team</p>
    </div>
  `;
}