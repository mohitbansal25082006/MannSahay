// E:\mannsahay\src\app\dashboard\counselor\page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Users, Star, MessageSquare, Video, Plus } from 'lucide-react';
import CounselorSchedule from '@/components/counselor/counselor-schedule';
import ClientList from '@/components/counselor/client-list';
import CounselorAnalytics from '@/components/counselor/counselor-analytics';
import ResourceSharing from '@/components/counselor/resource-sharing';

export default function CounselorDashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('schedule');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Counselor Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Manage your schedule, clients, and resources
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
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

        <TabsContent value="resources" className="space-y-6">
          <ResourceSharing />
        </TabsContent>
      </Tabs>
    </div>
  );
}