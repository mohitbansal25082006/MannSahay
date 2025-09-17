import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { assessRiskLevel } from '@/lib/openai';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await the params promise before accessing its properties
    const resolvedParams = await params;
    const postId = resolvedParams.id;
    
    const { title, content, category } = await request.json();

    if (!content || content.trim() === '') {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Check if post exists and user is the author or admin
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            isAdmin: true
          }
        }
      }
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Get the current user to check admin status
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true }
    });

    const isAuthor = post.author.id === session.user.id;
    const isAdmin = currentUser?.isAdmin || false;

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Assess risk level using AI
    const riskLevel = await assessRiskLevel(content);
    const flagged = riskLevel === 'MEDIUM' || riskLevel === 'HIGH';

    // Update the post
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        title,
        content,
        category,
        flagged,
        riskLevel,
        updatedAt: new Date()
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            hashedId: true,
          },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
            bookmarks: true,
          },
        },
      },
    });

    // If flagged, create notification for counselors
    if (flagged && !post.flagged) {
      const counselors = await prisma.user.findMany({
        where: { isAdmin: true },
      });

      for (const counselor of counselors) {
        await prisma.notification.create({
          data: {
            title: 'Post Flagged After Edit',
            message: `A post has been flagged for review after being edited. Risk level: ${riskLevel}`,
            type: 'flagged_content',
            userId: counselor.id,
          },
        });
      }
    }

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Edit post error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}