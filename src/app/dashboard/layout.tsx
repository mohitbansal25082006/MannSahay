// E:\mannsahay\src\app\dashboard\layout.tsx
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import DashboardNav from '@/components/dashboard/dashboard-nav';
import UnauthorizedDialog from '@/components/ui/unauthorized-dialog';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  // Get user details
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true }
  });

  if (!user?.email) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      <main className="py-6">
        {children}
        <UnauthorizedDialog />
      </main>
    </div>
  );
}