// E:\mannsahay\src\app\dashboard\page.tsx
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Calendar, Users, BookOpen, Clock, TrendingUp, UserCheck } from 'lucide-react';
import Link from 'next/link';

async function getUserStats(userId: string) {
  const [chatCount, bookingCount, postCount] = await Promise.all([
    prisma.chat.count({
      where: { userId }
    }),
    prisma.booking.count({
      where: { userId }
    }),
    prisma.post.count({
      where: { authorId: userId }
    })
  ]);

  const recentChats = await prisma.chat.findMany({
    where: { userId },
    orderBy: { timestamp: 'desc' },
    take: 3
  });

  const upcomingBookings = await prisma.booking.findMany({
    where: {
      userId,
      slotTime: {
        gte: new Date()
      }
    },
    include: {
      counselor: true
    },
    orderBy: { slotTime: 'asc' },
    take: 3
  });

  return {
    chatCount,
    bookingCount,
    postCount,
    recentChats,
    upcomingBookings
  };
}

async function checkCounselorStatus(email: string) {
  const authorizedCounselors = [
    process.env.COUNSELOR1,
    process.env.COUNSELOR2,
    process.env.COUNSELOR3,
    process.env.COUNSELOR4,
    process.env.COUNSELOR5,
  ].filter(Boolean);

  return authorizedCounselors.includes(email);
}

export default async function DashboardPage() {
  // Get the session
  const session = await getServerSession(authOptions);

  // If there's no session at all, show a sign-in CTA
  if (!session?.user) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <h2 className="text-2xl font-semibold mb-2">You're not signed in</h2>
        <p className="text-gray-600 mb-4">Sign in to view your dashboard and recent activity.</p>
        <Link href="/api/auth/signin">
          <Button>Sign in</Button>
        </Link>
      </div>
    );
  }

  // session.user may not include the DB id by default — try to resolve it from the DB using email
  let userId: string | undefined = (session.user as any).id;

  if (!userId && session.user.email) {
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });
    userId = dbUser?.id ?? undefined;
  }

  // If we still don't have a user id, render an error message
  if (!userId) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <h2 className="text-2xl font-semibold mb-2">Account not found</h2>
        <p className="text-gray-600 mb-4">We couldn't find your account in the database. Try signing out and signing back in.</p>
        <Link href="/api/auth/signout">
          <Button>Sign out</Button>
        </Link>
      </div>
    );
  }

  // Check if user is a counselor
  const isCounselor = session.user.email ? await checkCounselorStatus(session.user.email) : false;

  // Now fetch stats
  const stats = await getUserStats(userId);

  const quickActions = [
    {
      title: 'Start AI Chat',
      description: 'Talk to our AI companion',
      href: '/dashboard/chat',
      icon: MessageCircle,
      color: 'bg-blue-500'
    },
    {
      title: 'Book Session',
      description: 'Schedule with a counselor',
      href: '/dashboard/booking',
      icon: Calendar,
      color: 'bg-green-500'
    },
    {
      title: 'Browse Forum',
      description: 'Connect with peers',
      href: '/dashboard/forum',
      icon: Users,
      color: 'bg-purple-500'
    },
    {
      title: 'Explore Resources',
      description: 'Learn and grow',
      href: '/dashboard/resources',
      icon: BookOpen,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Welcome Section */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {session.user.name?.split(' ')[0] || 'Friend'}!
          </h1>
          <p className="mt-2 text-gray-600">
            How are you feeling today? Your mental wellness journey continues here.
          </p>
        </div>
        
        {/* Counselor Dashboard Button */}
        {isCounselor && (
          <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
            <Link href="/dashboard/counselor" className="flex items-center">
              <UserCheck className="h-4 w-4 mr-2" />
              Counselor Dashboard
            </Link>
          </Button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chat Sessions</CardTitle>
            <MessageCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.chatCount}</div>
            <p className="text-xs text-muted-foreground">
              Conversations with AI
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bookingCount}</div>
            <p className="text-xs text-muted-foreground">
              Counselor sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Forum Posts</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.postCount}</div>
            <p className="text-xs text-muted-foreground">
              Community contributions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.chatCount > 0 ? Math.round((stats.chatCount / 10) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Journey completion
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Start your wellness activities with one click
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} href={action.href}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${action.color}`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-sm">{action.title}</h3>
                          <p className="text-xs text-gray-500">{action.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentChats.length > 0 ? (
              <div className="space-y-3">
                {stats.recentChats.map((chat) => (
                  <div key={chat.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                    <MessageCircle className="h-4 w-4 text-blue-500 mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">
                        {chat.content.substring(0, 60)}...
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(chat.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                <Link href="/dashboard/chat">
                  <Button variant="outline" size="sm" className="w-full">
                    View All Chats
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-6">
                <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-3">No chat history yet</p>
                <Link href="/dashboard/chat">
                  <Button>Start Your First Chat</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Upcoming Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.upcomingBookings.length > 0 ? (
              <div className="space-y-3">
                {stats.upcomingBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center space-x-3 p-3 rounded-lg bg-green-50">
                    <Calendar className="h-4 w-4 text-green-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {booking.counselor.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(booking.slotTime).toLocaleString()}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      booking.status === 'CONFIRMED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                ))}
                <Link href="/dashboard/booking">
                  <Button variant="outline" size="sm" className="w-full">
                    Manage Bookings
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-6">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-3">No upcoming sessions</p>
                <Link href="/dashboard/booking">
                  <Button>Book Your First Session</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}