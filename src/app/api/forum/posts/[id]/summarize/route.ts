// E:\mannsahay\src\app\api\forum\posts\[id]\summarize\route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { summarizeContent } from '@/lib/ai-moderation';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const postId = resolvedParams.id;

    // Get the post with its replies
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        replies: {
          where: { isHidden: false },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if we already have a recent summary (less than 24 hours old)
    if (post.summary && post.summaryGeneratedAt) {
      const summaryAge = new Date().getTime() - new Date(post.summaryGeneratedAt).getTime();
      const hoursOld = summaryAge / (1000 * 60 * 60);
      
      if (hoursOld < 24) {
        return NextResponse.json({
          summary: post.summary,
          generatedAt: post.summaryGeneratedAt,
          isCached: true,
        });
      }
    }

    // Combine post content and replies for thread summarization
    let contentToSummarize = post.content;
    
    if (post.replies.length > 0) {
      contentToSummarize += '\n\nReplies:\n';
      post.replies.forEach(reply => {
        contentToSummarize += `\n- ${reply.content}`;
      });
    }

    // Generate a new summary
    const summaryResult = await summarizeContent(contentToSummarize, post.replies.length > 0);

    // Update the post with the new summary
    await prisma.post.update({
      where: { id: postId },
      data: {
        summary: summaryResult.summary,
        summaryGeneratedAt: new Date(),
      },
    });

    return NextResponse.json({
      summary: summaryResult.summary,
      keyPoints: summaryResult.keyPoints,
      sentiment: summaryResult.sentiment,
      topics: summaryResult.topics,
      generatedAt: new Date(),
      isCached: false,
    });
  } catch (error) {
    console.error('Summarize post error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}