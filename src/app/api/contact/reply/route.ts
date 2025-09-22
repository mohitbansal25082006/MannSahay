// E:\mannsahay\src\app\api\contact\reply\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageId, replyContent } = body;

    // Validate required fields
    if (!messageId || !replyContent) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the original message
    const originalMessage = await prisma.contactMessage.findUnique({
      where: { id: messageId },
    });

    if (!originalMessage) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    // Save the reply to database
    const reply = await prisma.contactReply.create({
      data: {
        messageId,
        content: replyContent,
        isManual: true,
        sentAt: new Date(),
      },
    });

    // Update original message status
    await prisma.contactMessage.update({
      where: { id: messageId },
      data: { status: 'replied' },
    });

    // Send email reply to user
    const emailSent = await sendEmail({
      to: originalMessage.email,
      subject: `Response to your message - ${originalMessage.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3B82F6; margin: 0;">MannSahay</h1>
            <p style="color: #6B7280; margin: 5px 0 0 0;">Your Mental Health Companion</p>
          </div>
          
          <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            <h2 style="color: #1F2937; margin-top: 0; margin-bottom: 20px;">Response to Your Message</h2>
            
            <p style="color: #4B5563; margin-bottom: 20px;">
              Dear ${originalMessage.name},<br><br>
              Thank you for reaching out to MannSahay. Here is our response to your message regarding "${originalMessage.subject}":
            </p>
            
            <div style="background-color: #F9FAFB; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3B82F6;">
              <p style="margin: 0; color: #1F2937; white-space: pre-wrap;">
                ${replyContent.replace(/\n/g, '<br>')}
              </p>
            </div>
            
            <div style="background-color: #EFF6FF; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #1E40AF;">
                <strong>Message Reference:</strong> #${messageId}
              </p>
            </div>
            
            <p style="color: #4B5563; margin-bottom: 20px;">
              If you need further assistance, please don't hesitate to reply to this email or contact us again through our website.
            </p>
            
            ${originalMessage.urgency === 'critical' || originalMessage.urgency === 'high' ? `
            <div style="background-color: #FEF3F2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #DC2626;">
              <p style="color: #DC2626; margin: 0;">
                <strong>Emergency Support:</strong> If you're experiencing a mental health emergency, please reach out to these 24/7 helplines immediately:
              </p>
              <ul style="color: #DC2626; margin: 10px 0 0 20px;">
                <li><strong>National Mental Health Helpline:</strong> 1800-599-0019</li>
                <li><strong>iCall:</strong> 9152987821</li>
                <li><strong>Snehi:</strong> 91-22-2772-6551</li>
                <li><strong>Vandrevala Foundation:</strong> 1860-2662-345 / 1800-2333-330</li>
              </ul>
            </div>
            ` : ''}
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
              <p style="color: #6B7280; margin: 0;">
                Best regards,<br>
                The MannSahay Support Team
              </p>
            </div>
          </div>
        </div>
      `,
    });

    if (!emailSent) {
      console.error('Failed to send email to user');
      return NextResponse.json(
        { error: 'Failed to send email reply' },
        { status: 500 }
      );
    }

    // Create notification for the user if they have an account
    const user = await prisma.user.findUnique({
      where: { email: originalMessage.email },
    });

    if (user) {
      await prisma.notification.create({
        data: {
          title: 'Response to your contact message',
          message: `We've sent a response to your message regarding "${originalMessage.subject}". Please check your email.`,
          type: 'contact_reply',
          userId: user.id,
          metadata: {
            messageId,
            replyId: reply.id,
            subject: originalMessage.subject,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Reply sent successfully',
      replyId: reply.id,
      emailSent: true,
    });

  } catch (error) {
    console.error('Contact reply error:', error);
    return NextResponse.json(
      { error: 'Failed to send reply' },
      { status: 500 }
    );
  }
}