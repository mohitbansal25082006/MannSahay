// E:\mannsahay\src\app\api\resources\[id]\download\route.ts
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
    
    // Record download
    await prisma.resourceDownload.create({
      data: {
        userId,
        resourceId,
      },
    });
    
    // Update download count
    await prisma.resource.update({
      where: { id: resourceId },
      data: {
        downloadCount: {
          increment: 1,
        },
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error downloading resource:', error);
    return NextResponse.json(
      { error: 'Failed to download resource' },
      { status: 500 }
    );
  }
}