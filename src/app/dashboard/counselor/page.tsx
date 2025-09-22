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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Counselor Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back, {session?.user?.name || 'Counselor'}! Here&apos;s your overview.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="insights">Client Insights</TabsTrigger>
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
  );
}