'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Star, Users, Smile, Activity, TrendingUp } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface Session {
  id: string;
  date: string;
  counselor: string;
  rating: number;
  status: 'completed' | 'upcoming' | 'cancelled';
}

interface Note {
  id: string;
  date: string;
  content: string;
  counselor: string;
}

interface ProgressData {
  moodTrends: { date: string; mood: number }[];
  sessionStats: {
    totalSessions: number;
    completedSessions: number;
    upcomingSessions: number;
    cancelledSessions: number;
    averageRating: number;
  };
  counselorDistribution: Record<string, number>;
  recentSessions: Session[];
  recentNotes: Note[];
}

export default function ProgressVisualization() {
  const { data: session } = useSession();
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/progress');
      if (response.ok) {
        const data = await response.json();
        setProgressData(data);
      } else {
        console.error('Failed to fetch progress data');
      }
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading progress data...</p>
        </div>
      </div>
    );
  }

  if (!progressData) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="text-center py-8 bg-white rounded-xl shadow-md p-6 max-w-md">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="h-8 w-8 text-red-500" />
          </div>
          <p className="text-gray-700 font-medium">Failed to load progress data</p>
          <button 
            onClick={fetchProgressData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const counselorDistributionData = Object.entries(progressData.counselorDistribution).map(([name, count]) => ({
    name,
    count
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Format mood trends data for better display
  const formattedMoodTrends = progressData.moodTrends.map(trend => ({
    ...trend,
    date: new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  // Session status data for bar chart
  const sessionStatusData = [
    { name: 'Completed', value: progressData.sessionStats.completedSessions, color: '#10B981' },
    { name: 'Upcoming', value: progressData.sessionStats.upcomingSessions, color: '#3B82F6' },
    { name: 'Cancelled', value: progressData.sessionStats.cancelledSessions, color: '#EF4444' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Sessions</CardTitle>
            <div className="bg-blue-100 p-2 rounded-lg">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-blue-700">{progressData.sessionStats.totalSessions}</div>
            <p className="text-xs text-gray-600 mt-1">
              {progressData.sessionStats.completedSessions} completed
            </p>
            <div className="mt-2 h-1 w-full bg-blue-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" 
                style={{ width: `${Math.min(progressData.sessionStats.totalSessions * 10, 100)}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Avg. Mood</CardTitle>
            <div className="bg-green-100 p-2 rounded-lg">
              <Smile className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-green-700">
              {formattedMoodTrends.length > 0 
                ? (formattedMoodTrends.reduce((sum, entry) => sum + entry.mood, 0) / formattedMoodTrends.length).toFixed(1)
                : '0.0'
              }
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Out of 10.0
            </p>
            <div className="mt-2 h-1 w-full bg-green-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full" 
                style={{ width: `${formattedMoodTrends.length > 0 ? (formattedMoodTrends.reduce((sum, entry) => sum + entry.mood, 0) / formattedMoodTrends.length) * 10 : 0}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-100 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Avg. Rating</CardTitle>
            <div className="bg-yellow-100 p-2 rounded-lg">
              <Star className="h-4 w-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-yellow-700">{progressData.sessionStats.averageRating.toFixed(1)}</div>
            <p className="text-xs text-gray-600 mt-1">
              Out of 5.0
            </p>
            <div className="mt-2 h-1 w-full bg-yellow-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-500 to-amber-600 rounded-full" 
                style={{ width: `${progressData.sessionStats.averageRating * 20}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-100 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Counselors</CardTitle>
            <div className="bg-purple-100 p-2 rounded-lg">
              <Users className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-purple-700">{Object.keys(progressData.counselorDistribution).length}</div>
            <p className="text-xs text-gray-600 mt-1">
              Different counselors
            </p>
            <div className="mt-2 h-1 w-full bg-purple-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-violet-600 rounded-full" 
                style={{ width: `${Math.min(Object.keys(progressData.counselorDistribution).length * 20, 100)}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="mood" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-white p-1 rounded-lg shadow-sm">
          <TabsTrigger 
            value="mood" 
            className="text-xs sm:text-sm font-medium data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 rounded-md transition-all px-2 sm:px-3 py-2 min-h-[44px] flex items-center justify-center text-center leading-tight"
          >
            <span className="block sm:hidden">Mood</span>
            <span className="hidden sm:block">Mood Trends</span>
          </TabsTrigger>
          <TabsTrigger 
            value="sessions" 
            className="text-xs sm:text-sm font-medium data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 rounded-md transition-all px-2 sm:px-3 py-2 min-h-[44px] flex items-center justify-center text-center leading-tight"
          >
            <span className="block sm:hidden">Sessions</span>
            <span className="hidden sm:block">Session History</span>
          </TabsTrigger>
          <TabsTrigger 
            value="counselors" 
            className="text-xs sm:text-sm font-medium data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 rounded-md transition-all px-2 sm:px-3 py-2 min-h-[44px] flex items-center justify-center text-center leading-tight"
          >
            <span className="block sm:hidden">Counselors</span>
            <span className="hidden sm:block">Counselor Distribution</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="mood" className="space-y-4">
          <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 pb-4">
              <CardTitle className="flex items-center text-lg md:text-xl font-bold text-gray-900">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                Mood Trends Over Time
              </CardTitle>
              <CardDescription className="text-gray-600 ml-11">
                Track how your mood has changed over time
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="h-80">
                {formattedMoodTrends.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={formattedMoodTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" stroke="#6b7280" />
                      <YAxis domain={[0, 10]} stroke="#6b7280" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}
                        formatter={(value: number) => [`${value}`, 'Mood']}
                        labelFormatter={(label: string) => `Date: ${label}`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="mood" 
                        stroke="#8884d8" 
                        activeDot={{ r: 8 }} 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center p-6 bg-blue-50 rounded-xl max-w-md">
                      <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Activity className="h-8 w-8 text-blue-600" />
                      </div>
                      <p className="text-gray-700 font-medium mb-2">No mood data available</p>
                      <p className="text-sm text-gray-600">Start tracking your mood to see trends</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sessions" className="space-y-4">
          <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100 pb-4">
              <CardTitle className="flex items-center text-lg md:text-xl font-bold text-gray-900">
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                Session Statistics
              </CardTitle>
              <CardDescription className="text-gray-600 ml-11">
                Overview of your counseling sessions
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sessionStatusData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}
                      formatter={(value: number) => [`${value}`, 'Sessions']}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {sessionStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="counselors" className="space-y-4">
          <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-gray-100 pb-4">
              <CardTitle className="flex items-center text-lg md:text-xl font-bold text-gray-900">
                <div className="bg-purple-100 p-2 rounded-lg mr-3">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                Session Distribution by Counselor
              </CardTitle>
              <CardDescription className="text-gray-600 ml-11">
                How your sessions are distributed among counselors
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="h-80">
                {counselorDistributionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={counselorDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {counselorDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}
                        formatter={(value: number) => [`${value}`, 'Sessions']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center p-6 bg-purple-50 rounded-xl max-w-md">
                      <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="h-8 w-8 text-purple-600" />
                      </div>
                      <p className="text-gray-700 font-medium mb-2">No counselor data available</p>
                      <p className="text-sm text-gray-600">Book sessions with counselors to see distribution</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}