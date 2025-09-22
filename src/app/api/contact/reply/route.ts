// E:\mannsahay\src\app\api\contact\reply\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageId, replyContent, isManual = true } = body;

    console.log('Received reply request:', { messageId, isManual });

    // Validate required fields
    if (!messageId || !replyContent) {
      return NextResponse.json(
        { error: 'Missing required fields: messageId and replyContent are required' },
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

    console.log('Found original message:', originalMessage.email);

    // Save the reply to database
    const reply = await prisma.contactReply.create({
      data: {
        messageId,
        content: replyContent,
        isManual,
        sentAt: new Date(),
      },
    });

    console.log('Reply saved to database');

    // Update original message status
    await prisma.contactMessage.update({
      where: { id: messageId },
      data: { status: 'replied' },
    });

    // Send email reply to user
    const replyHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3B82F6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .message { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #3B82F6; margin: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
          .urgent { background: #fef2f2; color: #dc2626; padding: 10px; border-radius: 4px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>MannSahay</h1>
            <p>Your Mental Health Companion</p>
          </div>
          <div class="content">
            <h2>Response to Your Message</h2>
            
            <p>Dear ${originalMessage.name},</p>
            
            <p>Thank you for reaching out to MannSahay. We've carefully reviewed your message regarding <strong>"${originalMessage.subject}"</strong> and wanted to provide you with a detailed response.</p>
            
            <div class="message">
              ${replyContent.replace(/\n/g, '<br>')}
            </div>
            
            <div style="background: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #1e40af;">
                <strong>Message Reference:</strong> #${messageId}
              </p>
            </div>
            
            <p>If you need further assistance, please don't hesitate to reply to this email or contact us again through our website.</p>
            
            ${originalMessage.urgency === 'critical' || originalMessage.urgency === 'high' ? `
            <div class="urgent">
              <strong>Emergency Support:</strong> If you're experiencing a mental health emergency, please reach out to these 24/7 helplines immediately:
              <ul>
                <li>National Mental Health Helpline: 1800-599-0019</li>
                <li>iCall: 9152987821</li>
                <li>Snehi: 91-22-2772-6551</li>
              </ul>
            </div>
            ` : ''}
            
            <div class="footer">
              <p>Best regards,<br>The MannSahay Team</p>
              <p>${isManual ? 'Human Support Team' : 'AI Assistant + Human Review'}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailSent = await sendEmail({
      to: originalMessage.email,
      subject: `Response to your message - ${originalMessage.subject}`,
      html: replyHtml,
    });

    if (!emailSent) {
      console.error('Failed to send email to:', originalMessage.email);
      return NextResponse.json(
        { error: 'Failed to send email reply' },
        { status: 500 }
      );
    }

    console.log('Email sent successfully to:', originalMessage.email);

    // Create notification for the user if they have an account
    try {
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
        console.log('Notification created for user:', user.id);
      }
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Don't fail the entire request if notification fails
    }

    return NextResponse.json({
      success: true,
      message: 'Reply sent successfully',
      replyId: reply.id,
      emailSent: true,
    });

  } catch (error) {
    console.error('Contact reply error:', error);
    
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        error: 'Failed to send reply',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}

// Add GET endpoint to check message status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('messageId');

    if (!messageId) {
      return NextResponse.json(
        { error: 'messageId is required' },
        { status: 400 }
      );
    }

    const message = await prisma.contactMessage.findUnique({
      where: { id: messageId },
      include: {
        replies: {
          orderBy: { sentAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: {
        id: message.id,
        subject: message.subject,
        status: message.status,
        hasReplies: message.replies.length > 0,
        lastReply: message.replies[0] || null,
      },
    });
  } catch (error) {
    console.error('Error fetching message status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch message status' },
      { status: 500 }
    );
  }
}