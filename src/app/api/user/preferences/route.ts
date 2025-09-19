import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        preferredLanguage: true,
        interests: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Ensure interests is an array
    return NextResponse.json({
      preferredLanguage: user.preferredLanguage || 'en',
      interests: Array.isArray(user.interests) ? user.interests : []
    });
  } catch (error) {
    console.error('Get user preferences error:', error);
    return NextResponse.json({ error: 'Failed to get user preferences' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { preferredLanguage, interests } = await request.json();

    // Validate that interests is an array
    if (interests && !Array.isArray(interests)) {
      return NextResponse.json({ error: 'Interests must be an array' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        preferredLanguage,
        interests: interests || [] // Ensure it's an array
      }
    });

    return NextResponse.json({
      preferredLanguage: user.preferredLanguage || 'en',
      interests: Array.isArray(user.interests) ? user.interests : []
    });
  } catch (error) {
    console.error('Update user preferences error:', error);
    return NextResponse.json({ error: 'Failed to update user preferences' }, { status: 500 });
  }
}