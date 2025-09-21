// E:\mannsahay\src\app\dashboard\counselor\layout.tsx
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export default async function CounselorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  // Get user details
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, isAdmin: true }
  });

  if (!user?.email) {
    redirect('/dashboard');
  }

  // Check if user's email is in the authorized counselor list
  const authorizedCounselors = [
    process.env.COUNSELOR1,
    process.env.COUNSELOR2,
    process.env.COUNSELOR3,
    process.env.COUNSELOR4,
    process.env.COUNSELOR5,
  ].filter(Boolean); // Remove undefined values

  const isAuthorizedCounselor = authorizedCounselors.includes(user.email);

  if (!isAuthorizedCounselor && !user.isAdmin) {
    redirect('/dashboard?error=unauthorized');
  }

  // Try to get or create counselor profile
  let counselor = await prisma.counselor.findUnique({
    where: { email: user.email }
  });

  // If counselor doesn't exist, create one
  if (!counselor && isAuthorizedCounselor) {
    const userName = await prisma.user.findUnique({
      where: { email: user.email },
      select: { name: true }
    });

    counselor = await prisma.counselor.create({
      data: {
        name: userName?.name || 'Counselor',
        email: user.email,
        specialties: ['General Counseling'],
        languages: ['en'],
        bio: 'Professional counselor helping clients with their mental health journey.',
        isActive: true
      }
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}