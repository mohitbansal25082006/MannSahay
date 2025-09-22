// E:\mannsahay\src\lib\email.ts
import nodemailer from 'nodemailer';

// Create a transporter object using the default SMTP transport - FIXED: createTransport instead of createTransporter
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
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'mannsahay@example.com',
      to: options.to,
      subject: options.subject,
      text: options.text || '',
      html: options.html,
    });
    
    console.log('Email sent successfully:', info.messageId);
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
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #3B82F6; margin: 0;">MannSahay</h1>
        <p style="color: #6B7280; margin: 5px 0 0 0;">Your Mental Health Companion</p>
      </div>
      
      <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
        <h2 style="color: #1F2937; margin-top: 0; margin-bottom: 20px;">Booking Confirmed</h2>
        
        <p style="color: #4B5563; margin-bottom: 20px;">
          Hello ${userName},<br><br>
          Your counseling session has been confirmed with the following details:
        </p>
        
        <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;"><strong>Counselor:</strong> ${counselorName}</p>
          <p style="margin: 0 0 10px 0;"><strong>Date:</strong> ${formattedDate}</p>
          <p style="margin: 0 0 10px 0;"><strong>Time:</strong> ${formattedTime}</p>
          ${meetingLink ? `<p style="margin: 0;"><strong>Meeting Link:</strong> <a href="${meetingLink}" style="color: #3B82F6; text-decoration: none;">Join Session</a></p>` : ''}
        </div>
        
        <p style="color: #4B5563; margin-bottom: 20px;">
          Please make sure to join the session on time. If you need to reschedule or cancel, please do so at least 24 hours in advance.
        </p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
          <p style="color: #6B7280; margin: 0;">
            Best regards,<br>
            The MannSahay Team
          </p>
        </div>
      </div>
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
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #3B82F6; margin: 0;">MannSahay</h1>
        <p style="color: #6B7280; margin: 5px 0 0 0;">Your Mental Health Companion</p>
      </div>
      
      <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
        <h2 style="color: #EF4444; margin-top: 0; margin-bottom: 20px;">Session Cancelled</h2>
        
        <p style="color: #4B5563; margin-bottom: 20px;">
          Hello ${userName},<br><br>
          Your counseling session has been cancelled with the following details:
        </p>
        
        <div style="background-color: #FEE2E2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;"><strong>Counselor:</strong> ${counselorName}</p>
          <p style="margin: 0 0 10px 0;"><strong>Date:</strong> ${formattedDate}</p>
          <p style="margin: 0 0 10px 0;"><strong>Time:</strong> ${formattedTime}</p>
          ${reason ? `<p style="margin: 0;"><strong>Reason:</strong> ${reason}</p>` : ''}
        </div>
        
        <p style="color: #4B5563; margin-bottom: 20px;">
          We apologize for any inconvenience. You can book a new session at your convenience through the MannSahay platform.
        </p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
          <p style="color: #6B7280; margin: 0;">
            Best regards,<br>
            The MannSahay Team
          </p>
        </div>
      </div>
    </div>
  `;
}