// E:\mannsahay\src\app\api\resources\[id]\rate\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const resourceId = params.id;
    const { rating, comment } = await request.json();
    
    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
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
          comment,
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
          comment,
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