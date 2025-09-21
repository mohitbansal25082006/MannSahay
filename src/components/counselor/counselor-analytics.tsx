// E:\mannsahay\src\components\counselor\counselor-analytics.tsx
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
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading analytics data...</p>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-8 text-gray-500">
        Failed to load analytics data
      </div>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.completedSessions} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.newClients} new this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.avgRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Out of 5.0
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analyticsData.totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sessions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="satisfaction">Client Satisfaction</TabsTrigger>
          <TabsTrigger value="mood">Mood Trends</TabsTrigger>
          <TabsTrigger value="feedback">Recent Feedback</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sessions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sessions & Earnings by Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.sessionByMonth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Bar yAxisId="left" dataKey="sessions" fill="#3B82F6" name="Sessions" />
                      <Bar yAxisId="right" dataKey="earnings" fill="#10B981" name="Earnings ($)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Session Status</CardTitle>
              </CardHeader>
              <CardContent>
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
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="satisfaction" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Client Satisfaction Ratings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.clientSatisfaction}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="rating" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#F59E0B" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="mood" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Client Mood Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.moodTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="avgMood" stroke="#8B5CF6" activeDot={{ r: 8 }} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Client Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.recentFeedback.length > 0 ? (
                  analyticsData.recentFeedback.map(feedback => (
                    <div key={feedback.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{feedback.clientName}</h4>
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
                        <span className="text-sm text-gray-500">{feedback.date}</span>
                      </div>
                      <p className="text-gray-600">{feedback.comment}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No feedback available yet
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