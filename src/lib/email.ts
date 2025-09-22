import nodemailer from 'nodemailer';

// Create a transporter object using the default SMTP transport
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
    // Validate email configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Email configuration missing');
      return false;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"MannSahay" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text || options.html.replace(/<[^>]*>/g, ''), // Fallback to plain text
      html: options.html,
    };

    // Verify connection configuration
    await transporter.verify();
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    
    // Log specific error details
    if (error instanceof Error) {
      console.error('Email error details:', {
        message: error.message,
        stack: error.stack
      });
    }
    
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

export function generateGroupSessionJoinEmail(
  userName: string,
  sessionTitle: string,
  sessionDate: Date
): string {
  const formattedDate = sessionDate.toLocaleDateString();
  const formattedTime = sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #3B82F6; margin: 0;">MannSahay</h1>
        <p style="color: #6B7280; margin: 5px 0 0 0;">Your Mental Health Companion</p>
      </div>
      
      <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
        <h2 style="color: #10B981; margin-top: 0; margin-bottom: 20px;">Group Session Joined</h2>
        
        <p style="color: #4B5563; margin-bottom: 20px;">
          Hello ${userName},<br><br>
          You have successfully joined the group session:
        </p>
        
        <div style="background-color: #D1FAE5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;"><strong>Session:</strong> ${sessionTitle}</p>
          <p style="margin: 0 0 10px 0;"><strong>Date:</strong> ${formattedDate}</p>
          <p style="margin: 0;"><strong>Time:</strong> ${formattedTime}</p>
        </div>
        
        <p style="color: #4B5563; margin-bottom: 20px;">
          We look forward to seeing you at the session. Please make sure to join on time.
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

export function generateGroupSessionLeaveEmail(
  userName: string,
  sessionTitle: string,
  sessionDate: Date
): string {
  const formattedDate = sessionDate.toLocaleDateString();
  const formattedTime = sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #3B82F6; margin: 0;">MannSahay</h1>
        <p style="color: #6B7280; margin: 5px 0 0 0;">Your Mental Health Companion</p>
      </div>
      
      <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
        <h2 style="color: #EF4444; margin-top: 0; margin-bottom: 20px;">Group Session Left</h2>
        
        <p style="color: #4B5563; margin-bottom: 20px;">
          Hello ${userName},<br><br>
          You have successfully left the group session:
        </p>
        
        <div style="background-color: #FEE2E2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;"><strong>Session:</strong> ${sessionTitle}</p>
          <p style="margin: 0 0 10px 0;"><strong>Date:</strong> ${formattedDate}</p>
          <p style="margin: 0;"><strong>Time:</strong> ${formattedTime}</p>
        </div>
        
        <p style="color: #4B5563; margin-bottom: 20px;">
          If you change your mind, you can rejoin the session at any time, provided there are still spots available.
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