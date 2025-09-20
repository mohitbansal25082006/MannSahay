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
      // This would be an actual API call in a real implementation
      // const [upcomingResponse, pastResponse] = await Promise.all([
      //   fetch('/api/group-sessions?upcoming=true'),
      //   fetch('/api/group-sessions?upcoming=false')
      // ]);
      // const upcomingData = await upcomingResponse.json();
      // const pastData = await pastResponse.json();
      
      // Mock data for demonstration
      const mockUpcomingSessions: GroupSession[] = [
        {
          id: '1',
          title: 'Managing Academic Stress',
          description: 'Learn effective strategies to cope with academic pressure and exam stress.',
          maxParticipants: 15,
          sessionDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          duration: 60,
          counselor: { name: 'Dr. Priya Sharma' },
          _count: { participants: 8 },
          isParticipating: false
        },
        {
          id: '2',
          title: 'Building Healthy Relationships',
          description: 'Explore the foundations of healthy relationships and communication skills.',
          maxParticipants: 12,
          sessionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          duration: 90,
          counselor: { name: 'Dr. Rajesh Kumar' },
          _count: { participants: 5 },
          isParticipating: true
        },
        {
          id: '3',
          title: 'Mindfulness and Meditation',
          description: 'Introduction to mindfulness practices for stress reduction and mental wellness.',
          maxParticipants: 20,
          sessionDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          duration: 45,
          counselor: { name: 'Dr. Ananya Reddy' },
          _count: { participants: 12 },
          isParticipating: false
        }
      ];
      
      const mockPastSessions: GroupSession[] = [
        {
          id: '4',
          title: 'Overcoming Social Anxiety',
          description: 'Techniques to manage social anxiety in academic and social settings.',
          maxParticipants: 10,
          sessionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          duration: 60,
          counselor: { name: 'Dr. Priya Sharma' },
          _count: { participants: 10 },
          isParticipating: true
        },
        {
          id: '5',
          title: 'Career Planning for Students',
          description: 'Guidance on making informed career decisions and planning for the future.',
          maxParticipants: 15,
          sessionDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
          duration: 75,
          counselor: { name: 'Dr. Rajesh Kumar' },
          _count: { participants: 13 },
          isParticipating: false
        }
      ];
      
      setUpcomingSessions(mockUpcomingSessions);
      setPastSessions(mockPastSessions);
    } catch (error) {
      console.error('Error fetching group sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSession = async (sessionId: string) => {
    try {
      // This would be an actual API call in a real implementation
      // await fetch(`/api/group-sessions/${sessionId}/join`, { method: 'POST' });
      
      // Update the local state to reflect participation
      setUpcomingSessions(prevSessions =>
        prevSessions.map(session =>
          session.id === sessionId ? { ...session, isParticipating: true, _count: { ...session._count, participants: session._count.participants + 1 } } : session
        )
      );
    } catch (error) {
      console.error('Error joining group session:', error);
    }
  };

  const handleLeaveSession = async (sessionId: string) => {
    try {
      // This would be an actual API call in a real implementation
      // await fetch(`/api/group-sessions/${sessionId}/join`, { method: 'DELETE' });
      
      // Update the local state to reflect participation
      setUpcomingSessions(prevSessions =>
        prevSessions.map(session =>
          session.id === sessionId ? { ...session, isParticipating: false, _count: { ...session._count, participants: session._count.participants - 1 } } : session
        )
      );
    } catch (error) {
      console.error('Error leaving group session:', error);
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