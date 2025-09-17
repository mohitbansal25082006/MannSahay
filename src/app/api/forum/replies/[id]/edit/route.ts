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
    const replyId = resolvedParams.id;
    
    const { content } = await request.json();

    if (!content || content.trim() === '') {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Check if reply exists and user is the author or admin
    const reply = await prisma.reply.findUnique({
      where: { id: replyId },
      include: {
        author: {
          select: {
            id: true,
            isAdmin: true
          }
        }
      }
    });

    if (!reply) {
      return NextResponse.json({ error: 'Reply not found' }, { status: 404 });
    }

    // Get the current user to check admin status
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true }
    });

    const isAuthor = reply.author.id === session.user.id;
    const isAdmin = currentUser?.isAdmin || false;

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Assess risk level using AI
    const riskLevel = await assessRiskLevel(content);
    const flagged = riskLevel === 'MEDIUM' || riskLevel === 'HIGH';

    // Update the reply
    const updatedReply = await prisma.reply.update({
      where: { id: replyId },
      data: {
        content,
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
          },
        },
      },
    });

    // If flagged, create notification for counselors
    if (flagged && !reply.flagged) {
      const counselors = await prisma.user.findMany({
        where: { isAdmin: true },
      });

      for (const counselor of counselors) {
        await prisma.notification.create({
          data: {
            title: 'Reply Flagged After Edit',
            message: `A reply has been flagged for review after being edited. Risk level: ${riskLevel}`,
            type: 'flagged_content',
            userId: counselor.id,
          },
        });
      }
    }

    return NextResponse.json(updatedReply);
  } catch (error) {
    console.error('Edit reply error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}