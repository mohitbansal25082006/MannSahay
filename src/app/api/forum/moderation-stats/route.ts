// E:\mannsahay\src\app\api\forum\moderation-stats\route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Get total posts count
    const totalPosts = await prisma.post.count();
    
    // Get moderated posts count
    const moderatedPosts = await prisma.post.count({
      where: {
        OR: [
          { moderationStatus: 'REJECTED' },
          { moderationStatus: 'UNDER_REVIEW' },
          { flagged: true }
        ]
      }
    });
    
    // Get auto-removed posts count
    const autoRemovedPosts = await prisma.post.count({
      where: {
        moderationStatus: 'REJECTED',
        isHidden: true
      }
    });
    
    // Get pending review posts count
    const pendingReviewPosts = await prisma.post.count({
      where: {
        moderationStatus: 'UNDER_REVIEW'
      }
    });
    
    // Get total replies count
    const totalReplies = await prisma.reply.count();
    
    // Get moderated replies count
    const moderatedReplies = await prisma.reply.count({
      where: {
        OR: [
          { moderationStatus: 'REJECTED' },
          { moderationStatus: 'UNDER_REVIEW' },
          { flagged: true }
        ]
      }
    });
    
    // Get auto-removed replies count
    const autoRemovedReplies = await prisma.reply.count({
      where: {
        moderationStatus: 'REJECTED',
        isHidden: true
      }
    });
    
    // Get pending review replies count
    const pendingReviewReplies = await prisma.reply.count({
      where: {
        moderationStatus: 'UNDER_REVIEW'
      }
    });

    return NextResponse.json({
      totalPosts,
      moderatedPosts,
      autoRemovedPosts,
      pendingReviewPosts,
      totalReplies,
      moderatedReplies,
      autoRemovedReplies,
      pendingReviewReplies
    });
  } catch (error) {
    console.error('Moderation stats error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}