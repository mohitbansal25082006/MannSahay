// E:\mannsahay\src\app\api\contact\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message, urgency } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Save contact message to database
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        subject,
        message,
        urgency: urgency || 'normal',
        status: 'pending',
      },
    });

    // Send email to admin
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      console.error('Admin email not configured');
      return NextResponse.json(
        { error: 'Email configuration error' },
        { status: 500 }
      );
    }

    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3B82F6; margin: 0;">MannSahay Contact Form</h1>
          <p style="color: #6B7280; margin: 5px 0 0 0;">New message received</p>
        </div>
        
        <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <h2 style="color: #1F2937; margin-top: 0; margin-bottom: 20px;">Message Details</h2>
          
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 0 0 10px 0;"><strong>Subject:</strong> ${subject}</p>
            <p style="margin: 0 0 10px 0;"><strong>Urgency:</strong> ${urgency || 'normal'}</p>
            <p style="margin: 0;"><strong>Message:</strong></p>
            <div style="background-color: white; padding: 15px; border-radius: 4px; margin-top: 10px; border: 1px solid #E5E7EB;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
            <p style="color: #6B7280; margin: 0;">
              <strong>Message ID:</strong> ${contactMessage.id}<br>
              <strong>Received:</strong> ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    `;

    const adminEmailSent = await sendEmail({
      to: adminEmail,
      subject: `New Contact Form: ${subject} (${urgency || 'normal'} urgency)`,
      html: adminEmailHtml,
    });

    // Send auto-reply to user
    const autoReplyHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3B82F6; margin: 0;">MannSahay</h1>
          <p style="color: #6B7280; margin: 5px 0 0 0;">Your Mental Health Companion</p>
        </div>
        
        <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <h2 style="color: #1F2937; margin-top: 0; margin-bottom: 20px;">Thank You for Reaching Out</h2>
          
          <p style="color: #4B5563; margin-bottom: 20px;">
            Dear ${name},<br><br>
            We've received your message regarding "${subject}". Our support team will review it and get back to you within:
          </p>
          
          <div style="background-color: #EFF6FF; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3B82F6;">
            <p style="margin: 0; color: #1E40AF;">
              <strong>Expected Response Time:</strong><br>
              ${urgency === 'critical' ? '1-2 hours (Emergency)' : 
                urgency === 'high' ? '4-6 hours (Urgent)' : 
                '24-48 hours (Normal)'}
            </p>
          </div>
          
          <p style="color: #4B5563; margin-bottom: 20px;">
            <strong>Message Reference:</strong> #${contactMessage.id}
          </p>
          
          <div style="background-color: #FEF3F2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #DC2626;">
            <p style="color: #DC2626; margin: 0;">
              <strong>Emergency Support:</strong> If this is a mental health emergency, please contact these 24/7 helplines immediately:
            </p>
            <ul style="color: #DC2626; margin: 10px 0 0 20px;">
              <li><strong>National Mental Health Helpline:</strong> 1800-599-0019</li>
              <li><strong>iCall:</strong> 9152987821</li>
              <li><strong>Snehi:</strong> 91-22-2772-6551</li>
              <li><strong>Vandrevala Foundation:</strong> 1860-2662-345 / 1800-2333-330</li>
            </ul>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
            <p style="color: #6B7280; margin: 0;">
              Best regards,<br>
              The MannSahay Team
            </p>
          </div>
        </div>
      </div>
    `;

    const userEmailSent = await sendEmail({
      to: email,
      subject: `We've received your message - ${subject}`,
      html: autoReplyHtml,
    });

    return NextResponse.json({
      success: true,
      message: 'Contact form submitted successfully',
      messageId: contactMessage.id,
      emailsSent: {
        admin: adminEmailSent,
        user: userEmailSent
      }
    });

  } catch (error) {
    console.error('Contact form submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit contact form' },
      { status: 500 }
    );
  }
}