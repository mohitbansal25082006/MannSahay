import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

// Define the shape of the Notification model for Prisma queries
interface NotificationWhereInput {
  userId: string;
  isRead?: boolean;
}

// Define the shape of the Notification model for the response
interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  userId: string;
  metadata: Prisma.JsonValue; // Use Prisma.JsonValue instead of JsonValue
  isRead: boolean;
  createdAt: Date; // Changed to match Prisma's Date type
}

// Define the response shape for the GET handler
interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  totalCount: number;
  hasMore: boolean;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Define the where clause with proper typing
    const where: NotificationWhereInput = {
      userId: session.user.id,
    };

    if (unreadOnly) {
      where.isRead = false;
    }

    // Get notifications with proper ordering
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    // Get total count for pagination
    const totalCount = await prisma.notification.count({
      where,
    });

    // Get unread count for badge
    const unreadCount = await prisma.notification.count({
      where: {
        userId: session.user.id,
        isRead: false,
      },
    });

    // Return response matching the dropdown component's expected format
    return NextResponse.json<NotificationsResponse>({
      notifications,
      unreadCount,
      totalCount,
      hasMore: offset + limit < totalCount,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { notificationIds, isRead } = body;

    // Validate input
    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: 'notificationIds is required and must be an array' },
        { status: 400 }
      );
    }

    if (notificationIds.length === 0) {
      return NextResponse.json(
        { error: 'notificationIds cannot be empty' },
        { status: 400 }
      );
    }

    if (typeof isRead !== 'boolean') {
      return NextResponse.json(
        { error: 'isRead must be a boolean value' },
        { status: 400 }
      );
    }

    // Update notifications - only update those belonging to the user
    const result = await prisma.notification.updateMany({
      where: {
        id: {
          in: notificationIds,
        },
        userId: session.user.id, // Ensure user can only update their own notifications
      },
      data: {
        isRead,
      },
    });

    // Log the action for debugging
    console.log(`User ${session.user.id} updated ${result.count} notifications to isRead: ${isRead}`);

    return NextResponse.json({
      success: true,
      updatedCount: result.count,
      message: `Successfully updated ${result.count} notification(s)`,
    });
  } catch (error) {
    console.error('Update notifications error:', error);
    return NextResponse.json(
      { error: 'Failed to update notifications. Please try again.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { notificationIds, deleteAll = false } = body;

    let result;

    if (deleteAll) {
      // Delete all notifications for the user
      result = await prisma.notification.deleteMany({
        where: {
          userId: session.user.id,
        },
      });

      console.log(`User ${session.user.id} deleted all notifications (${result.count} total)`);
    } else {
      // Validate input for specific notification deletion
      if (!notificationIds || !Array.isArray(notificationIds)) {
        return NextResponse.json(
          { error: 'notificationIds is required and must be an array' },
          { status: 400 }
        );
      }

      if (notificationIds.length === 0) {
        return NextResponse.json(
          { error: 'notificationIds cannot be empty' },
          { status: 400 }
        );
      }

      // Delete specific notifications - only delete those belonging to the user
      result = await prisma.notification.deleteMany({
        where: {
          id: {
            in: notificationIds,
          },
          userId: session.user.id, // Ensure user can only delete their own notifications
        },
      });

      console.log(`User ${session.user.id} deleted ${result.count} specific notifications`);
    }

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
      message: deleteAll
        ? `Successfully deleted all ${result.count} notification(s)`
        : `Successfully deleted ${result.count} notification(s)`,
    });
  } catch (error) {
    console.error('Delete notifications error:', error);
    return NextResponse.json(
      { error: 'Failed to delete notifications. Please try again.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, message, type = 'INFO', metadata = {} } = body;

    // Validate required fields
    if (!title || !message) {
      return NextResponse.json(
        { error: 'title and message are required' },
        { status: 400 }
      );
    }

    // Create new notification
    const notification = await prisma.notification.create({
      data: {
        title: title.substring(0, 255), // Ensure title doesn't exceed database limit
        message: message.substring(0, 1000), // Ensure message doesn't exceed database limit
        type,
        userId: session.user.id,
        metadata: metadata as Prisma.InputJsonValue, // Cast to Prisma.InputJsonValue for input
        isRead: false,
      },
    });

    console.log(`Created notification for user ${session.user.id}: ${notification.id}`);

    return NextResponse.json({
      success: true,
      notification,
      message: 'Notification created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Create notification error:', error);
    return NextResponse.json(
      { error: 'Failed to create notification. Please try again.' },
      { status: 500 }
    );
  }
}