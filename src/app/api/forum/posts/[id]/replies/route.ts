import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const postId = resolvedParams.id;

    // Get all replies for this post, organized in a nested structure
    const replies = await prisma.reply.findMany({
      where: { postId },
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
      orderBy: { createdAt: 'asc' },
    });

    // Organize replies in a nested structure
    const replyMap = new Map();
    const rootReplies: any[] = [];

    // First pass: create a map of all replies
    replies.forEach(reply => {
      replyMap.set(reply.id, { ...reply, replies: [] });
    });

    // Second pass: build the nested structure
    replies.forEach(reply => {
      if (reply.parentId) {
        const parent = replyMap.get(reply.parentId);
        if (parent) {
          parent.replies.push(replyMap.get(reply.id));
        }
      } else {
        rootReplies.push(replyMap.get(reply.id));
      }
    });

    return NextResponse.json({ replies: rootReplies });
  } catch (error) {
    console.error('Get replies error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const postId = resolvedParams.id;
    const { content, parentId, authorId } = await request.json();

    // Validate required fields
    if (!content || !authorId) {
      return NextResponse.json(
        { error: 'Content and author ID are required' },
        { status: 400 }
      );
    }

    // Create the reply
    const reply = await prisma.reply.create({
      data: {
        content,
        postId,
        parentId: parentId || null,
        authorId,
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

    return NextResponse.json(reply, { status: 201 });
  } catch (error) {
    console.error('Create reply error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}