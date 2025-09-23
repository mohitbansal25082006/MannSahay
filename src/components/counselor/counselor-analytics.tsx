'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Calendar, Clock, Users, Star, TrendingUp, DollarSign, MessageSquare } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface AnalyticsData {
  totalSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  upcomingSessions: number;
  avgRating: number;
  totalClients: number;
  newClients: number;
  totalEarnings: number;
  sessionByMonth: { month: string; sessions: number; earnings: number }[];
  sessionByStatus: { name: string; value: number; color: string }[];
  clientSatisfaction: { rating: number; count: number }[];
  topSpecializations: { name: string; count: number }[];
  moodTrends: { date: string; avgMood: number }[];
  recentFeedback: { id: string; clientName: string; rating: number; comment: string; date: string }[];
}

export default function CounselorAnalytics() {
  const { data: session } = useSession();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/counselor/analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      } else {
        console.error('Failed to fetch analytics data');
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center bg-white rounded-xl shadow-md p-8 max-w-md">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="h-8 w-8 text-red-500" />
          </div>
          <p className="text-gray-700 font-medium mb-3">Failed to load analytics data</p>
          <button 
            onClick={fetchAnalyticsData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

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
            <div className="text-2xl md:text-3xl font-bold text-blue-700">{analyticsData.totalSessions}</div>
            <p className="text-xs text-gray-600 mt-1">
              {analyticsData.completedSessions} completed
            </p>
            <div className="mt-2 h-1 w-full bg-blue-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" 
                style={{ width: `${Math.min(analyticsData.totalSessions * 5, 100)}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Clients</CardTitle>
            <div className="bg-green-100 p-2 rounded-lg">
              <Users className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-green-700">{analyticsData.totalClients}</div>
            <p className="text-xs text-gray-600 mt-1">
              {analyticsData.newClients} new this month
            </p>
            <div className="mt-2 h-1 w-full bg-green-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full" 
                style={{ width: `${Math.min(analyticsData.newClients * 20, 100)}%` }}
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
            <div className="text-2xl md:text-3xl font-bold text-yellow-700">{analyticsData.avgRating.toFixed(1)}</div>
            <p className="text-xs text-gray-600 mt-1">
              Out of 5.0
            </p>
            <div className="mt-2 h-1 w-full bg-yellow-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-500 to-amber-600 rounded-full" 
                style={{ width: `${analyticsData.avgRating * 20}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-100 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Earnings</CardTitle>
            <div className="bg-purple-100 p-2 rounded-lg">
              <DollarSign className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-purple-700">${analyticsData.totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-gray-600 mt-1">
              This month
            </p>
            <div className="mt-2 h-1 w-full bg-purple-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-violet-600 rounded-full" 
                style={{ width: `${Math.min(analyticsData.totalEarnings / 10, 100)}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sessions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-white p-1 rounded-lg shadow-sm">
          <TabsTrigger value="sessions" className="text-sm font-medium data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 rounded-md transition-all">
            Sessions
          </TabsTrigger>
          <TabsTrigger value="satisfaction" className="text-sm font-medium data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 rounded-md transition-all">
            Satisfaction
          </TabsTrigger>
          <TabsTrigger value="mood" className="text-sm font-medium data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 rounded-md transition-all">
            Mood Trends
          </TabsTrigger>
          <TabsTrigger value="feedback" className="text-sm font-medium data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 rounded-md transition-all">
            Feedback
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="sessions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 pb-4">
                <CardTitle className="text-lg md:text-xl font-bold text-gray-900">Sessions & Earnings by Month</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.sessionByMonth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" stroke="#6b7280" />
                      <YAxis yAxisId="left" stroke="#6b7280" />
                      <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}
                      />
                      <Bar yAxisId="left" dataKey="sessions" fill="#3B82F6" name="Sessions" radius={[4, 4, 0, 0]} />
                      <Bar yAxisId="right" dataKey="earnings" fill="#10B981" name="Earnings ($)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100 pb-4">
                <CardTitle className="text-lg md:text-xl font-bold text-gray-900">Session Status</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.sessionByStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {analyticsData.sessionByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="satisfaction" className="space-y-4">
          <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50 border-b border-gray-100 pb-4">
              <CardTitle className="text-lg md:text-xl font-bold text-gray-900">Client Satisfaction Ratings</CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.clientSatisfaction}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="rating" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}
                    />
                    <Bar dataKey="count" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="mood" className="space-y-4">
          <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-gray-100 pb-4">
              <CardTitle className="text-lg md:text-xl font-bold text-gray-900">Client Mood Trends</CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.moodTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis domain={[0, 10]} stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}
                    />
                    <Line type="monotone" dataKey="avgMood" stroke="#8B5CF6" activeDot={{ r: 8 }} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="feedback" className="space-y-4">
          <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 pb-4">
              <CardTitle className="text-lg md:text-xl font-bold text-gray-900">Recent Client Feedback</CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="space-y-4">
                {analyticsData.recentFeedback.length > 0 ? (
                  analyticsData.recentFeedback.map(feedback => (
                    <div key={feedback.id} className="border border-gray-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{feedback.clientName}</h4>
                          <div className="flex items-center mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < feedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">{feedback.date}</span>
                      </div>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{feedback.comment}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="h-8 w-8 text-gray-500" />
                    </div>
                    <p className="text-gray-700 font-medium mb-1">No feedback available yet</p>
                    <p className="text-gray-500 text-sm">Client feedback will appear here</p>
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