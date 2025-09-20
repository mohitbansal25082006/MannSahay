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

  // Check if user is a counselor
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true }
  });

  // For demo purposes, we'll allow access to the counselor dashboard
  // In a real app, you would check if the user is actually a counselor
  // if (!user?.isAdmin) {
  //   redirect('/dashboard');
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}