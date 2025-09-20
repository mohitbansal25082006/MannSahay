// E:\mannsahay\src\components\booking\group-sessions-list.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Users, Video, Plus } from 'lucide-react';

interface GroupSession {
  id: string;
  title: string;
  description?: string;
  maxParticipants: number;
  sessionDate: string;
  duration: number;
  counselor: {
    name: string;
    profileImage?: string;
  };
  _count: {
    participants: number;
  };
  isParticipating?: boolean;
}

export default function GroupSessionsList() {
  const [upcomingSessions, setUpcomingSessions] = useState<GroupSession[]>([]);
  const [pastSessions, setPastSessions] = useState<GroupSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroupSessions();
  }, []);

  const fetchGroupSessions = async () => {
    setLoading(true);
    try {
      // Fetch upcoming sessions
      const upcomingResponse = await fetch('/api/group-sessions?upcoming=true');
      const upcomingData = await upcomingResponse.json();
      setUpcomingSessions(upcomingData);
      
      // Fetch past sessions
      const pastResponse = await fetch('/api/group-sessions?upcoming=false');
      const pastData = await pastResponse.json();
      setPastSessions(pastData);
    } catch (error) {
      console.error('Error fetching group sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/group-sessions/${sessionId}/join`, {
        method: 'POST'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to join session');
      }

      // Update the local state to reflect participation
      setUpcomingSessions(prevSessions =>
        prevSessions.map(session =>
          session.id === sessionId ? { ...session, isParticipating: true, _count: { ...session._count, participants: session._count.participants + 1 } } : session
        )
      );
    } catch (error) {
      console.error('Error joining group session:', error);
      alert(error instanceof Error ? error.message : 'Failed to join session');
    }
  };

  const handleLeaveSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/group-sessions/${sessionId}/join`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to leave session');
      }

      // Update the local state to reflect participation
      setUpcomingSessions(prevSessions =>
        prevSessions.map(session =>
          session.id === sessionId ? { ...session, isParticipating: false, _count: { ...session._count, participants: session._count.participants - 1 } } : session
        )
      );
    } catch (error) {
      console.error('Error leaving group session:', error);
      alert(error instanceof Error ? error.message : 'Failed to leave session');
    }
  };

  const renderSessionCard = (session: GroupSession, isUpcoming: boolean) => (
    <Card key={session.id} className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">{session.title}</CardTitle>
        <CardDescription>
          <div className="flex items-center mt-1 text-sm">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{new Date(session.sessionDate).toLocaleDateString()}</span>
            <Clock className="h-4 w-4 ml-3 mr-1" />
            <span>{new Date(session.sessionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">{session.description}</p>
        
        <div className="flex items-center text-sm text-gray-500">
          <Users className="h-4 w-4 mr-1" />
          <span>{session._count.participants}/{session.maxParticipants} participants</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-500">
          <Video className="h-4 w-4 mr-1" />
          <span>{session.duration} minutes</span>
        </div>
        
        <div className="text-sm text-gray-500">
          Facilitator: {session.counselor.name}
        </div>
        
        {isUpcoming && (
          <div className="pt-2">
            {session.isParticipating ? (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleLeaveSession(session.id)}
              >
                Leave Session
              </Button>
            ) : (
              <Button 
                className="w-full"
                onClick={() => handleJoinSession(session.id)}
                disabled={session._count.participants >= session.maxParticipants}
              >
                {session._count.participants >= session.maxParticipants ? 'Session Full' : 'Join Session'}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Group Sessions
          </CardTitle>
          <CardDescription>
            Join group sessions led by professional counselors on various mental health topics
          </CardDescription>
        </CardHeader>
      </Card>
      
      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Sessions</TabsTrigger>
          <TabsTrigger value="past">Past Sessions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">Loading group sessions...</div>
          ) : upcomingSessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingSessions.map(session => renderSessionCard(session, true))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-500">No upcoming group sessions</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="past" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">Loading group sessions...</div>
          ) : pastSessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastSessions.map(session => renderSessionCard(session, false))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-500">No past group sessions</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}