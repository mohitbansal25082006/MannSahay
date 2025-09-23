'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Calendar, Clock, Users, Star, MessageSquare, Video, Plus, Brain } from 'lucide-react';
import CounselorSchedule from '@/components/counselor/counselor-schedule';
import ClientList from '@/components/counselor/client-list';
import CounselorAnalytics from '@/components/counselor/counselor-analytics';
import ClientInsights from '@/components/counselor/client-insights';

export default function CounselorDashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('schedule');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="mb-8 md:mb-12">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Counselor <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700">Dashboard</span>
            </h1>
            <p className="text-gray-600 max-w-2xl">
              Welcome back, <span className="font-medium">{session?.user?.name || 'Counselor'}</span>! Here's your overview.
            </p>
            <div className="mt-6 h-1 w-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white p-1 rounded-lg shadow-sm">
            <TabsTrigger value="schedule" className="text-sm font-medium data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 rounded-md transition-all">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="clients" className="text-sm font-medium data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 rounded-md transition-all">
              <Users className="h-4 w-4 mr-2" />
              Clients
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-sm font-medium data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 rounded-md transition-all">
              <Star className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="insights" className="text-sm font-medium data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 rounded-md transition-all">
              <Brain className="h-4 w-4 mr-2" />
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-6">
            <CounselorSchedule />
          </TabsContent>

          <TabsContent value="clients" className="space-y-6">
            <ClientList />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <CounselorAnalytics />
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <ClientInsights />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}