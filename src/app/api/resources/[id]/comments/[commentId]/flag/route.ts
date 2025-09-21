// E:\mannsahay\src\app\api\resources\[id]\comments\[commentId]\flag\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { moderateContent } from '@/lib/ai-moderation';

export async function POST(
  request: NextRequest,
  context: { 
    params: Promise<{ 
      id: string; 
      commentId: string 
    }> | { 
      id: string; 
      commentId: string 
    } 
  }
) {
  try {
    // Await params to handle cases where it's a Promise
    const params = await ('then' in context.params ? context.params : Promise.resolve(context.params));
    const resourceId = params.id;
    const commentId = params.commentId;

    // Validate resourceId and commentId
    if (!resourceId || typeof resourceId !== 'string' || 
        !commentId || typeof commentId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid resource ID or comment ID' },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { reason } = await request.json();

    // Check if user already flagged this comment
    const existingFlag = await prisma.resourceCommentFlag.findUnique({
      where: {
        userId_commentId: {
          userId: session.user.id,
          commentId,
        },
      },
    });

    if (existingFlag) {
      return NextResponse.json(
        { error: 'You have already flagged this comment' },
        { status: 400 }
      );
    }

    // Get the comment for moderation
    const comment = await prisma.resourceComment.findUnique({
      where: { id: commentId },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    // Perform AI moderation
    const moderationResult = await moderateContent(comment.content);

    // Create the flag
    const flag = await prisma.resourceCommentFlag.create({
      data: {
        userId: session.user.id,
        commentId,
        reason: reason || 'Inappropriate content',
      },
    });

    // Convert moderation result to a plain object for JSON serialization
    const moderationResultPlain = {
      violatesPolicy: moderationResult.violatesPolicy,
      violationTypes: moderationResult.violationTypes,
      severity: moderationResult.severity,
      confidence: moderationResult.confidence,
      explanation: moderationResult.explanation,
      recommendedAction: moderationResult.recommendedAction,
    };

    // Create notification for the user who flagged
    await prisma.notification.create({
      data: {
        title: 'Comment Flagged',
        message: `You flagged a comment by ${comment.user.name || 'Anonymous User'}. Our AI moderator is reviewing it.`,
        type: 'content_flagged',
        userId: session.user.id,
        metadata: {
          commentId,
          moderationResult: moderationResultPlain,
        },
      },
    });

    // If the comment violates policies, take action
    if (moderationResult.violatesPolicy) {
      let actionTaken = '';
      
      if (moderationResult.recommendedAction === 'remove') {
        // You might want to hide or delete the comment
        actionTaken = 'removed';
      } else if (moderationResult.recommendedAction === 'hide') {
        // Hide the comment from public view
        actionTaken = 'hidden';
      }

      // Create notification for the comment author if action was taken
      if (actionTaken) {
        await prisma.notification.create({
          data: {
            title: 'Comment Moderated',
            message: `Your comment was ${actionTaken} for violating our community guidelines. Reason: ${moderationResult.explanation}`,
            type: 'content_moderated',
            userId: comment.userId,
            metadata: {
              commentId,
              action: moderationResult.recommendedAction,
              explanation: moderationResult.explanation,
            },
          },
        });
      }

      return NextResponse.json({ 
        success: true,
        flagId: flag.id,
        moderationResult: moderationResultPlain,
        actionTaken,
      });
    }

    // If no violation, notify the flagger
    await prisma.notification.create({
      data: {
        title: 'Flag Reviewed',
        message: `The comment you flagged has been reviewed and found to comply with our community guidelines.`,
        type: 'flag_reviewed',
        userId: session.user.id,
        metadata: {
          commentId,
          moderationResult: moderationResultPlain,
        },
      },
    });

    return NextResponse.json({ 
      success: true,
      flagId: flag.id,
      moderationResult: moderationResultPlain,
    });
  } catch (error) {
    console.error('Error flagging comment:', error);
    return NextResponse.json(
      { error: 'Failed to flag comment' },
      { status: 500 }
    );
  }
}