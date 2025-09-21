// E:\mannsahay\src\app\api\user\counselor-status\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ isCounselor: false });
    }

    // Check if user's email is in the authorized counselor list
    const authorizedCounselors = [
      process.env.COUNSELOR1,
      process.env.COUNSELOR2,
      process.env.COUNSELOR3,
      process.env.COUNSELOR4,
      process.env.COUNSELOR5,
    ].filter(Boolean); // Remove undefined values

    const isCounselor = authorizedCounselors.includes(session.user.email);

    return NextResponse.json({ isCounselor });
  } catch (error) {
    console.error('Error checking counselor status:', error);
    return NextResponse.json({ isCounselor: false });
  }
}