// E:\mannsahay\src\app\api\forum\flag\route.ts

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
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { postId, replyId, reason } = await request.json();

    if (!postId && !replyId) {
      return NextResponse.json({ error: 'postId or replyId is required' }, { status: 400 });
    }

    // Check if already flagged
    const existingFlag = await prisma.flag.findFirst({
      where: {
        userId: session.user.id,
        postId,
        replyId,
      },
    });

    if (existingFlag) {
      return NextResponse.json({ error: 'You have already flagged this content' }, { status: 400 });
    }

    // Get the content being flagged
    let content = '';
    let contentType = '';
    
    if (postId) {
      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { content: true }
      });
      if (!post) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      }
      content = post.content;
      contentType = 'post';
    } else if (replyId) {
      const reply = await prisma.reply.findUnique({
        where: { id: replyId },
        select: { content: true }
      });
      if (!reply) {
        return NextResponse.json({ error: 'Reply not found' }, { status: 404 });
      }
      content = reply.content;
      contentType = 'reply';
    }

    // Create flag with PENDING AI review status
    const flag = await prisma.flag.create({
      data: {
        reason,
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
    if (moderationResult.violatesPolicy) {
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
    }

    // Notify counselors
    const counselors = await prisma.user.findMany({
      where: { isAdmin: true },
    });

    for (const counselor of counselors) {
      await prisma.notification.create({
        data: {
          title: moderationResult.violatesPolicy ? 'Policy Violation Confirmed' : 'Content Flagged',
          message: `A ${contentType} has been flagged by a user and ${moderationResult.violatesPolicy ? 'found to violate policies' : 'reviewed by AI'}. Reason: ${reason}. AI Action: ${moderationResult.recommendedAction}`,
          type: 'flagged_content',
          userId: counselor.id,
        },
      });
    }

    return NextResponse.json({ 
      flag, 
      moderationResult,
      message: moderationResult.violatesPolicy 
        ? `This content has been ${moderationResult.recommendedAction === 'remove' ? 'removed' : 'flagged'} for violating community policies.` 
        : 'Thank you for your report. Our AI has reviewed this content and found no policy violations.'
    }, { status: 201 });
  } catch (error) {
    console.error('Flag error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}