// E:\mannsahay\src\components\booking\my-bookings-list.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, User, Video, MessageSquare, Star, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Booking {
  id: string;
  slotTime: string;
  endTime: string;
  status: string;
  notes?: string;
  sessionType: string;
  counselor: {
    name: string;
    profileImage?: string;
  };
  sessionNotes?: Array<{
    id: string;
    content: string;
    isPrivate: boolean;
    counselor: {
      name: string;
    };
  }>;
  feedbacks?: Array<{
    id: string;
    rating: number;
    content?: string;
  }>;
  videoSession?: {
    platform: string;
    meetingUrl?: string;
  };
}

export default function MyBookingsList() {
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [pastBookings, setPastBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      // This would be an actual API call in a real implementation
      // const [upcomingResponse, pastResponse] = await Promise.all([
      //   fetch('/api/bookings?upcoming=true'),
      //   fetch('/api/bookings?upcoming=false')
      // ]);
      // const upcomingData = await upcomingResponse.json();
      // const pastData = await pastResponse.json();
      
      // Mock data for demonstration
      const mockUpcomingBookings: Booking[] = [
        {
          id: '1',
          slotTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 50 * 60 * 1000).toISOString(),
          status: 'CONFIRMED',
          notes: 'Looking forward to discussing my anxiety issues',
          sessionType: 'ONE_ON_ONE',
          counselor: { name: 'Dr. Priya Sharma' },
          videoSession: {
            platform: 'GOOGLE_MEET',
            meetingUrl: 'https://meet.google.com/abc-defg-hij'
          }
        },
        {
          id: '2',
          slotTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 50 * 60 * 1000).toISOString(),
          status: 'PENDING',
          sessionType: 'ONE_ON_ONE',
          counselor: { name: 'Dr. Rajesh Kumar' }
        }
      ];
      
      const mockPastBookings: Booking[] = [
        {
          id: '3',
          slotTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 50 * 60 * 1000).toISOString(),
          status: 'COMPLETED',
          sessionType: 'ONE_ON_ONE',
          counselor: { name: 'Dr. Ananya Reddy' },
          sessionNotes: [
            {
              id: '1',
              content: 'Client showed significant improvement in managing stress. Recommended mindfulness exercises.',
              isPrivate: false,
              counselor: { name: 'Dr. Ananya Reddy' }
            }
          ],
          feedbacks: [
            {
              id: '1',
              rating: 5,
              content: 'Excellent session. Very helpful and understanding.'
            }
          ]
        },
        {
          id: '4',
          slotTime: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000 + 50 * 60 * 1000).toISOString(),
          status: 'COMPLETED',
          sessionType: 'ONE_ON_ONE',
          counselor: { name: 'Dr. Priya Sharma' },
          feedbacks: [
            {
              id: '2',
              rating: 4,
              content: 'Good session, helped me understand my anxiety better.'
            }
          ]
        }
      ];
      
      setUpcomingBookings(mockUpcomingBookings);
      setPastBookings(mockPastBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      // This would be an actual API call in a real implementation
      // await fetch(`/api/bookings/${bookingId}`, { method: 'PATCH', body: JSON.stringify({ status: 'CANCELLED' }) });
      
      // Update the local state
      setUpcomingBookings(prevBookings =>
        prevBookings.map(booking =>
          booking.id === bookingId ? { ...booking, status: 'CANCELLED' } : booking
        )
      );
    } catch (error) {
      console.error('Error cancelling booking:', error);
    }
  };

  const renderBookingCard = (booking: Booking, isUpcoming: boolean) => {
    const statusColors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      COMPLETED: 'bg-blue-100 text-blue-800',
      NO_SHOW: 'bg-gray-100 text-gray-800'
    };

    return (
      <Card key={booking.id} className="h-full">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg flex items-center">
                <User className="h-5 w-5 mr-2" />
                {booking.counselor.name}
              </CardTitle>
              <CardDescription>
                <div className="flex items-center mt-1 text-sm">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{new Date(booking.slotTime).toLocaleDateString()}</span>
                  <Clock className="h-4 w-4 ml-3 mr-1" />
                  <span>{new Date(booking.slotTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </CardDescription>
            </div>
            <Badge className={statusColors[booking.status] || ''}>
              {booking.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {booking.notes && (
            <div>
              <p className="text-sm text-gray-600">{booking.notes}</p>
            </div>
          )}
          
          <div className="flex items-center text-sm text-gray-500">
            <Video className="h-4 w-4 mr-1" />
            <span>{booking.sessionType === 'ONE_ON_ONE' ? 'One-on-One Session' : 'Group Session'}</span>
          </div>
          
          {booking.videoSession?.meetingUrl && isUpcoming && (
            <Button asChild className="w-full">
              <a href={booking.videoSession.meetingUrl} target="_blank" rel="noopener noreferrer">
                Join Video Session
              </a>
            </Button>
          )}
          
          {booking.feedbacks && booking.feedbacks.length > 0 && (
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 mr-1" />
              <span className="text-sm">{booking.feedbacks[0].rating}/5</span>
            </div>
          )}
          
          {booking.sessionNotes && booking.sessionNotes.length > 0 && (
            <div className="text-sm">
              <div className="flex items-center mb-1">
                <MessageSquare className="h-4 w-4 mr-1" />
                <span className="font-medium">Session Notes</span>
              </div>
              <p className="text-gray-600">{booking.sessionNotes[0].content.substring(0, 100)}...</p>
            </div>
          )}
          
          {isUpcoming && booking.status !== 'CANCELLED' && (
            <div className="pt-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleCancelBooking(booking.id)}>
                    Cancel Booking
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Reschedule
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Add to Calendar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            My Bookings
          </CardTitle>
          <CardDescription>
            Manage your upcoming and past counseling sessions
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
            <div className="text-center py-8">Loading bookings...</div>
          ) : upcomingBookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingBookings.map(booking => renderBookingCard(booking, true))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-500">No upcoming bookings</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="past" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">Loading bookings...</div>
          ) : pastBookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pastBookings.map(booking => renderBookingCard(booking, false))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-500">No past bookings</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}