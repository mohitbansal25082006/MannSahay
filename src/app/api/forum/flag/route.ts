import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { reviewFlaggedContent } from '@/lib/ai-moderation';

// Import the enums from Prisma
import { ModerationStatus, AiReviewStatus } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    console.log('Session data:', session);

    if (!session?.user?.id) {
      console.error('Unauthorized access attempt - no user ID in session');
      return NextResponse.json({ error: 'Unauthorized: Please sign in to flag content' }, { status: 401 });
    }

    console.log('User ID from session:', session.user.id);

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { postId, replyId, reason } = body;

    // Debug: Log the received data
    console.log('Flag request received:', { postId, replyId, reason, userId: session.user.id });

    // Validate input
    if (!postId && !replyId) {
      console.error('Missing postId and replyId');
      return NextResponse.json({ error: 'postId or replyId is required' }, { status: 400 });
    }

    if (!reason || reason.trim() === '') {
      console.error('Missing or empty reason');
      return NextResponse.json({ error: 'A reason is required to flag content' }, { status: 400 });
    }

    // Check if already flagged
    console.log('Checking for existing flag:', { userId: session.user.id, postId, replyId });
    const existingFlag = await prisma.flag.findFirst({
      where: {
        userId: session.user.id,
        postId,
        replyId,
      },
    });

    if (existingFlag) {
      console.log('Existing flag found:', existingFlag);
      return NextResponse.json({ 
        error: 'You have already flagged this content. Our AI has reviewed this content and found no policy violations.',
        alreadyFlagged: true,
        userMessage: 'You have already flagged this content'
      }, { status: 400 });
    } else {
      console.log('No existing flag found, proceeding to create new flag');
    }

    // Get the content being flagged
    let content = '';
    let contentType = '';
    let authorId = '';
    
    if (postId) {
      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { content: true, authorId: true }
      });
      if (!post) {
        console.error('Post not found:', postId);
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      }
      content = post.content;
      contentType = 'post';
      authorId = post.authorId;
    } else if (replyId) {
      const reply = await prisma.reply.findUnique({
        where: { id: replyId },
        select: { content: true, author: { select: { id: true } } }
      });
      if (!reply) {
        console.error('Reply not found:', replyId);
        return NextResponse.json({ error: 'Reply not found' }, { status: 404 });
      }
      content = reply.content;
      contentType = 'reply';
      authorId = reply.author.id;
    }

    // Create flag with PENDING AI review status
    const flag = await prisma.flag.create({
      data: {
        reason: reason.trim(),
        userId: session.user.id,
        postId,
        replyId,
        aiReviewStatus: AiReviewStatus.REVIEWING,
      },
    });

    // Review the flagged content using AI
    const moderationResult = await reviewFlaggedContent(content, reason);
    
    // Update the flag with AI review results
    await prisma.flag.update({
      where: { id: flag.id },
      data: {
        aiReviewStatus: AiReviewStatus.COMPLETED,
        aiReviewResult: JSON.stringify(moderationResult),
        aiReviewedAt: new Date(),
        aiConfidence: moderationResult.confidence,
      },
    });

    // Take action based on AI review
    let actionTaken = false;
    let notificationMessage = '';
    
    if (moderationResult.violatesPolicy) {
      actionTaken = true;
      
      if (postId) {
        await prisma.post.update({
          where: { id: postId },
          data: {
            flagged: true,
            moderationStatus: moderationResult.recommendedAction === 'remove' 
              ? ModerationStatus.REJECTED 
              : ModerationStatus.UNDER_REVIEW,
            moderationReason: moderationResult.violationTypes.join(', '),
            moderationNote: `Removed by AI after user flag: ${moderationResult.explanation}`,
            moderatedAt: new Date(),
            isHidden: moderationResult.recommendedAction === 'remove' || moderationResult.recommendedAction === 'hide',
          },
        });
      } else if (replyId) {
        await prisma.reply.update({
          where: { id: replyId },
          data: {
            flagged: true,
            moderationStatus: moderationResult.recommendedAction === 'remove' 
              ? ModerationStatus.REJECTED 
              : ModerationStatus.UNDER_REVIEW,
            moderationReason: moderationResult.violationTypes.join(', '),
            moderationNote: `Removed by AI after user flag: ${moderationResult.explanation}`,
            moderatedAt: new Date(),
            isHidden: moderationResult.recommendedAction === 'remove' || moderationResult.recommendedAction === 'hide',
          },
        });
      }
      
      notificationMessage = `A ${contentType} has been flagged by a user and found to violate policies. Reason: ${reason}. AI Action: ${moderationResult.recommendedAction}`;
    } else {
      notificationMessage = `A ${contentType} has been flagged by a user and reviewed by AI. No policy violations found. Reason: ${reason}.`;
    }

    // Notify counselors
    const counselors = await prisma.user.findMany({
      where: { isAdmin: true },
    });

    for (const counselor of counselors) {
      await prisma.notification.create({
        data: {
          title: moderationResult.violatesPolicy ? 'Policy Violation Confirmed' : 'Content Flagged',
          message: notificationMessage,
          type: 'flagged_content',
          userId: counselor.id,
        },
      });
    }

    // Notify the content author if action was taken
    if (actionTaken && authorId && authorId !== session.user.id) {
      console.log(`Creating notification for author ${authorId} about ${contentType} moderation`);
      
      try {
        await prisma.notification.create({
          data: {
            title: 'Content Moderation',
            message: `Your ${contentType} has been ${moderationResult.recommendedAction === 'remove' ? 'removed' : 'flagged'} for violating community policies. Reason: ${moderationResult.explanation}`,
            type: 'content_moderated',
            userId: authorId,
          },
        });
        console.log('Notification created successfully');
      } catch (error) {
        console.error('Error creating notification:', error);
      }
    }

    // Also create a notification for the user who flagged the content
    try {
      await prisma.notification.create({
        data: {
          title: moderationResult.violatesPolicy ? 'Report Reviewed' : 'Report Received',
          message: moderationResult.violatesPolicy 
            ? `Thank you for your report. The content you flagged has been found to violate community policies and has been ${moderationResult.recommendedAction}.`
            : 'Thank you for your report. Our AI has reviewed the content and found no policy violations.',
          type: 'flagged_content',
          userId: session.user.id,
        },
      });
      console.log('Flag notification created successfully');
    } catch (error) {
      console.error('Error creating flag notification:', error);
    }

    // Return appropriate response based on AI review
    if (moderationResult.violatesPolicy) {
      return NextResponse.json({ 
        flag, 
        moderationResult,
        message: `This content has been ${moderationResult.recommendedAction === 'remove' ? 'removed' : 'flagged'} for violating community policies.`,
        actionTaken: true
      }, { status: 201 });
    } else {
      return NextResponse.json({ 
        flag, 
        moderationResult,
        message: 'Thank you for your report. Our AI has reviewed this content and found no policy violations.',
        actionTaken: false
      }, { status: 201 });
    }
  } catch (error) {
    console.error('Flag error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}