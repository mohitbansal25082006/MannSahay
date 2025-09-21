import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
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
    const userId = session?.user?.id;

    const resource = await prisma.resource.findUnique({
      where: {
        id: resourceId,
        isPublished: true,
      },
      include: {
        _count: {
          select: {
            ratings: true,
            bookmarks: true,
            downloads: true,
            views: true,
          },
        },
        ratings: {
          select: {
            rating: true,
            comment: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!resource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    // Record view
    await prisma.resourceView.create({
      data: {
        userId: userId ?? undefined,
        resourceId,
      },
    });

    // Update view count
    await prisma.resource.update({
      where: { id: resourceId },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    // Calculate average rating and check user interactions
    const avgRating = resource.ratings.length > 0
      ? resource.ratings.reduce((sum, rating) => sum + rating.rating, 0) / resource.ratings.length
      : 0;

    let isBookmarked = false;
    let userRating = null;

    if (userId) {
      const [bookmark, rating] = await Promise.all([
        prisma.resourceBookmark.findUnique({
          where: {
            userId_resourceId: {
              userId,
              resourceId,
            },
          },
        }),
        prisma.resourceRating.findUnique({
          where: {
            userId_resourceId: {
              userId,
              resourceId,
            },
          },
        }),
      ]);

      isBookmarked = !!bookmark;
      userRating = rating?.rating || null;
    }

    return NextResponse.json({
      ...resource,
      averageRating: parseFloat(avgRating.toFixed(1)),
      isBookmarked,
      userRating,
    });
  } catch (error) {
    console.error('Error fetching resource:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resource' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    // Fetch the full user to check if they're an admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true }
    });

    if (!user?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const {
      title,
      description,
      content,
      type,
      language,
      fileUrl,
      fileKey,
      fileSize,
      duration,
      author,
      tags,
      categories,
      isPublished,
      isFeatured,
    } = data;

    const resource = await prisma.resource.update({
      where: { id: resourceId },
      data: {
        title,
        description,
        content,
        type,
        language,
        fileUrl,
        fileKey,
        fileSize,
        duration,
        author,
        tags,
        categories,
        isPublished,
        isFeatured,
      },
    });

    return NextResponse.json(resource);
  } catch (error) {
    console.error('Error updating resource:', error);
    return NextResponse.json(
      { error: 'Failed to update resource' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Fetch the full user to check if they're an admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true }
    });

    if (!user?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await prisma.resource.delete({
      where: { id: resourceId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting resource:', error);
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    );
  }
}