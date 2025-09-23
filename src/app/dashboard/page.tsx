import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Calendar, Users, BookOpen, Clock, TrendingUp, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { Session } from 'next-auth';

// Extend the Session type to include id
interface ExtendedSession extends Session {
  user: {
    id: string; // Changed to string to match Session's user.id
    name?: string | null;
    email?: string | null;
  };
}

async function getUserStats(userId: string) {
  const [chatCount, bookingCount, postCount] = await Promise.all([
    prisma.chat.count({
      where: { userId },
    }),
    prisma.booking.count({
      where: { userId },
    }),
    prisma.post.count({
      where: { authorId: userId },
    }),
  ]);

  const recentChats = await prisma.chat.findMany({
    where: { userId },
    orderBy: { timestamp: 'desc' },
    take: 3,
  });

  const upcomingBookings = await prisma.booking.findMany({
    where: {
      userId,
      slotTime: {
        gte: new Date(),
      },
    },
    include: {
      counselor: true,
    },
    orderBy: { slotTime: 'asc' },
    take: 3,
  });

  return {
    chatCount,
    bookingCount,
    postCount,
    recentChats,
    upcomingBookings,
  };
}

async function checkCounselorStatus(email: string) {
  const authorizedCounselors = [
    process.env.COUNSELOR1,
    process.env.COUNSELOR2,
    process.env.COUNSELOR3,
    process.env.COUNSELOR4,
    process.env.COUNSELOR5,
  ].filter(Boolean) as string[];

  return authorizedCounselors.includes(email);
}

export default async function DashboardPage() {
  // Get the session
  const session = await getServerSession(authOptions) as ExtendedSession | null;

  // If there's no session at all, show a sign-in CTA
  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center transform transition-all duration-300 hover:scale-105">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <UserCheck className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Welcome to MannSahay</h2>
          <p className="text-gray-600 mb-6">Sign in to access your personalized wellness dashboard and mental health resources.</p>
          <Link href="/api/auth/signin">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-medium py-3 px-6 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 w-full">
              Sign In to Continue
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // session.user may not include the DB id by default — try to resolve it from the DB using email
  let userId: string | undefined = session.user.id;

  if (!userId && session.user.email) {
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    userId = dbUser?.id;
  }

  // If we still don't have a user id, render an error message
  if (!userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <UserCheck className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Account Not Found</h2>
          <p className="text-gray-600 mb-6">We couldn&apos;t find your account in our database. Please try signing out and signing back in.</p>
          <Link href="/api/auth/signout">
            <Button className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-medium py-3 px-6 rounded-full shadow-lg transition-all duration-300 w-full">
              Sign Out
            </Button>
          </Link>
        </div>
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
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100',
    },
    {
      title: 'Book Session',
      description: 'Schedule with a counselor',
      href: '/dashboard/booking',
      icon: Calendar,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      hoverColor: 'hover:bg-green-100',
    },
    {
      title: 'Browse Forum',
      description: 'Connect with peers',
      href: '/dashboard/forum',
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      hoverColor: 'hover:bg-purple-100',
    },
    {
      title: 'Explore Resources',
      description: 'Learn and grow',
      href: '/dashboard/resources',
      icon: BookOpen,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      hoverColor: 'hover:bg-orange-100',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Welcome Section */}
        <div className="mb-8 md:mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg w-full md:w-auto">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700">{session.user.name?.split(' ')[0] || 'Friend'}</span>!
              </h1>
              <p className="text-gray-600 max-w-2xl">
                How are you feeling today? Your mental wellness journey continues here.
              </p>
            </div>

            {/* Counselor Dashboard Button */}
            {isCounselor && (
              <Button asChild className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-medium py-3 px-6 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105">
                <Link href="/dashboard/counselor" className="flex items-center">
                  <UserCheck className="h-5 w-5 mr-2" />
                  Counselor Dashboard
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Chat Sessions</CardTitle>
              <div className="bg-blue-100 p-2 rounded-lg">
                <MessageCircle className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl md:text-3xl font-bold text-blue-700">{stats.chatCount}</div>
              <p className="text-xs text-gray-600 mt-1">Conversations with AI</p>
              <div className="mt-2 h-1 w-full bg-blue-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" 
                  style={{ width: `${Math.min(stats.chatCount * 10, 100)}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Bookings</CardTitle>
              <div className="bg-green-100 p-2 rounded-lg">
                <Calendar className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl md:text-3xl font-bold text-green-700">{stats.bookingCount}</div>
              <p className="text-xs text-gray-600 mt-1">Counselor sessions</p>
              <div className="mt-2 h-1 w-full bg-green-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full" 
                  style={{ width: `${Math.min(stats.bookingCount * 20, 100)}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-100 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Forum Posts</CardTitle>
              <div className="bg-purple-100 p-2 rounded-lg">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl md:text-3xl font-bold text-purple-700">{stats.postCount}</div>
              <p className="text-xs text-gray-600 mt-1">Community contributions</p>
              <div className="mt-2 h-1 w-full bg-purple-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-violet-600 rounded-full" 
                  style={{ width: `${Math.min(stats.postCount * 15, 100)}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-100 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Progress</CardTitle>
              <div className="bg-indigo-100 p-2 rounded-lg">
                <TrendingUp className="h-4 w-4 text-indigo-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl md:text-3xl font-bold text-indigo-700">
                {stats.chatCount > 0 ? Math.round((stats.chatCount / 10) * 100) : 0}%
              </div>
              <p className="text-xs text-gray-600 mt-1">Journey completion</p>
              <div className="mt-2 h-1 w-full bg-indigo-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full" 
                  style={{ width: `${stats.chatCount > 0 ? Math.round((stats.chatCount / 10) * 100) : 0}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8 md:mb-12 bg-white shadow-md hover:shadow-lg transition-all duration-300 border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white pb-6">
            <CardTitle className="text-xl md:text-2xl font-bold">Quick Actions</CardTitle>
            <CardDescription className="text-blue-100">Start your wellness activities with one click</CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.href} href={action.href}>
                    <Card className={`h-full ${action.bgColor} ${action.hoverColor} border-0 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 cursor-pointer overflow-hidden`}>
                      <CardContent className="p-5">
                        <div className="flex flex-col items-center text-center">
                          <div className={`bg-gradient-to-r ${action.color} w-14 h-14 rounded-full flex items-center justify-center mb-4 shadow-md`}>
                            <Icon className="h-7 w-7 text-white" />
                          </div>
                          <h3 className="font-bold text-lg text-gray-900 mb-1">{action.title}</h3>
                          <p className="text-sm text-gray-600">{action.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Recent Activity */}
          <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 pb-4">
              <CardTitle className="flex items-center text-lg md:text-xl font-bold text-gray-900">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              {stats.recentChats.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentChats.map((chat, index) => (
                    <div key={chat.id} className="flex items-start space-x-3 p-4 rounded-lg bg-blue-50 border border-blue-100 transition-all duration-300 hover:bg-blue-100">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <MessageCircle className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 truncate">
                          {chat.content.substring(0, 60)}...
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(chat.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                        {index === 0 ? 'Latest' : index === 1 ? 'Recent' : 'Earlier'}
                      </div>
                    </div>
                  ))}
                  <Link href="/dashboard/chat">
                    <Button variant="outline" className="w-full mt-4 border-blue-200 text-blue-700 hover:bg-blue-50 font-medium">
                      View All Chats
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-gray-500 mb-4">No chat history yet</p>
                  <Link href="/dashboard/chat">
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-medium">
                      Start Your First Chat
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Sessions */}
          <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100 pb-4">
              <CardTitle className="flex items-center text-lg md:text-xl font-bold text-gray-900">
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                Upcoming Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              {stats.upcomingBookings.length > 0 ? (
                <div className="space-y-4">
                  {stats.upcomingBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center space-x-3 p-4 rounded-lg bg-green-50 border border-green-100 transition-all duration-300 hover:bg-green-100">
                      <div className="bg-green-100 p-2 rounded-full">
                        <Calendar className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {booking.counselor.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(booking.slotTime).toLocaleString()}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-medium ${
                          booking.status === 'CONFIRMED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                  ))}
                  <Link href="/dashboard/booking">
                    <Button variant="outline" className="w-full mt-4 border-green-200 text-green-700 hover:bg-green-50 font-medium">
                      Manage Bookings
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-gray-500 mb-4">No upcoming sessions</p>
                  <Link href="/dashboard/booking">
                    <Button className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-medium">
                      Book Your First Session
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}