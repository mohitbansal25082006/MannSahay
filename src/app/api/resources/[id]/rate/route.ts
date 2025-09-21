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
    const { rating, comment } = await request.json();

    // Validate rating
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be an integer between 1 and 5' },
        { status: 400 }
      );
    }

    // Validate comment (optional, but must be a string if provided)
    if (comment !== undefined && typeof comment !== 'string') {
      return NextResponse.json(
        { error: 'Comment must be a string' },
        { status: 400 }
      );
    }

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

    // Check if already rated
    const existingRating = await prisma.resourceRating.findUnique({
      where: {
        userId_resourceId: {
          userId,
          resourceId,
        },
      },
    });

    if (existingRating) {
      // Update rating
      const updatedRating = await prisma.resourceRating.update({
        where: {
          userId_resourceId: {
            userId,
            resourceId,
          },
        },
        data: {
          rating,
          comment: comment || null, // Ensure comment is null if empty
        },
      });

      return NextResponse.json(updatedRating);
    } else {
      // Create new rating
      const newRating = await prisma.resourceRating.create({
        data: {
          userId,
          resourceId,
          rating,
          comment: comment || null, // Ensure comment is null if empty
        },
      });

      return NextResponse.json(newRating, { status: 201 });
    }
  } catch (error) {
    console.error('Error rating resource:', error);
    return NextResponse.json(
      { error: 'Failed to rate resource' },
      { status: 500 }
    );
  }
}