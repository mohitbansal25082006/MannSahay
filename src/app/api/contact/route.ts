// E:\mannsahay\src\app\api\contact\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { prisma } from '@/lib/db';
import { openai } from '@/lib/openai';

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

    const emailHtml = `
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
            <p style="margin: 0 0 10px 0;"><strong>Urgency:</strong> ${urgency}</p>
            <p style="margin: 0;"><strong>Message:</strong></p>
            <div style="background-color: white; padding: 15px; border-radius: 4px; margin-top: 10px; border: 1px solid #E5E7EB;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
            <p style="color: #6B7280; margin: 0;">
              This message was sent through the MannSahay contact form.
            </p>
          </div>
        </div>
      </div>
    `;

    await sendEmail({
      to: adminEmail,
      subject: `New Contact Form Submission: ${subject}`,
      html: emailHtml,
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
            We've received your message regarding "${subject}". Our support team will get back to you within ${urgency === 'critical' ? '1 hour' : urgency === 'high' ? '4 hours' : '24 hours'}.
          </p>
          
          <div style="background-color: #EFF6FF; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3B82F6;">
            <p style="margin: 0; color: #1E40AF;">
              <strong>Message Reference:</strong> #${contactMessage.id}
            </p>
          </div>
          
          <p style="color: #4B5563; margin-bottom: 20px;">
            If this is an emergency, please call one of the 24/7 helplines:
          </p>
          
          <ul style="color: #4B5563; margin-bottom: 20px; padding-left: 20px;">
            <li>National Mental Health Helpline: 1800-599-0019</li>
            <li>iCall: 9152987821</li>
            <li>Snehi: 91-22-2772-6551</li>
          </ul>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
            <p style="color: #6B7280; margin: 0;">
              Best regards,<br>
              The MannSahay Team
            </p>
          </div>
        </div>
      </div>
    `;

    await sendEmail({
      to: email,
      subject: `We've received your message - ${subject}`,
      html: autoReplyHtml,
    });

    return NextResponse.json({
      success: true,
      message: 'Contact form submitted successfully',
      messageId: contactMessage.id,
    });
  } catch (error) {
    console.error('Contact form submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit contact form' },
      { status: 500 }
    );
  }
}