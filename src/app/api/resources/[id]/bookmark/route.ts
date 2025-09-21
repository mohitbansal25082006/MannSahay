import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Await params to handle cases where it's a Promise
    const params = await ('then' in context.params ? context.params : Promise.resolve(context.params));
    const resourceId = params.id;

    // Validate resourceId
    if (!resourceId || typeof resourceId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid resource ID' },
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

    const userId = session.user.id;

    // Check if resource exists
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
    });

    if (!resource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    // Check if already bookmarked
    const existingBookmark = await prisma.resourceBookmark.findUnique({
      where: {
        userId_resourceId: {
          userId,
          resourceId,
        },
      },
    });

    if (existingBookmark) {
      // Remove bookmark
      await prisma.resourceBookmark.delete({
        where: {
          userId_resourceId: {
            userId,
            resourceId,
          },
        },
      });

      return NextResponse.json({ bookmarked: false });
    } else {
      // Add bookmark
      await prisma.resourceBookmark.create({
        data: {
          userId,
          resourceId,
        },
      });

      return NextResponse.json({ bookmarked: true });
    }
  } catch (error) {
    console.error('Error bookmarking resource:', error);
    return NextResponse.json(
      { error: 'Failed to bookmark resource' },
      { status: 500 }
    );
  }
}