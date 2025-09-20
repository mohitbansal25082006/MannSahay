// E:\mannsahay\src\components\counselor\counselor-schedule.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Plus, Video, MessageSquare, Check, X } from 'lucide-react';
import BookingCalendar from '@/components/booking/booking-calendar';
import AvailabilityForm from '@/components/counselor/availability-form';

interface Booking {
  id: string;
  slotTime: string;
  endTime: string;
  status: string;
  user: {
    name: string;
    email?: string;
  };
  notes?: string;
  videoSession?: {
    platform: string;
    meetingUrl?: string;
  };
}

export default function CounselorSchedule() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      // This would be an actual API call in a real implementation
      // const response = await fetch('/api/bookings?counselor=true');
      // const data = await response.json();
      
      // Mock data for demonstration
      const mockBookings: Booking[] = [
        {
          id: '1',
          slotTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 50 * 60 * 1000).toISOString(),
          status: 'CONFIRMED',
          user: { name: 'Alex Johnson', email: 'alex@example.com' },
          notes: 'Looking forward to discussing my anxiety issues',
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
          user: { name: 'Sam Smith', email: 'sam@example.com' }
        }
      ];
      
      setBookings(mockBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: string) => {
    try {
      // This would be an actual API call in a real implementation
      // await fetch(`/api/bookings/${bookingId}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ status })
      // });
      
      // Update local state
      setBookings(prevBookings =>
        prevBookings.map(booking =>
          booking.id === bookingId ? { ...booking, status } : booking
        )
      );
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    COMPLETED: 'bg-blue-100 text-blue-800',
    NO_SHOW: 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="bookings">Upcoming Sessions</TabsTrigger>
          <TabsTrigger value="availability">Manage Availability</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Your Schedule
              </CardTitle>
              <CardDescription>
                View your upcoming sessions and availability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BookingCalendar counselorId="current-counselor" onSlotSelect={() => {}} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Upcoming Sessions
              </CardTitle>
              <CardDescription>
                Manage your upcoming counseling sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading bookings...</div>
              ) : bookings.length > 0 ? (
                <div className="space-y-4">
                  {bookings.map(booking => (
                    <Card key={booking.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <div className="font-medium">{booking.user.name}</div>
                              <Badge className={`ml-2 ${statusColors[booking.status] || ''}`}>
                                {booking.status}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>{new Date(booking.slotTime).toLocaleDateString()}</span>
                              <Clock className="h-4 w-4 ml-3 mr-1" />
                              <span>{new Date(booking.slotTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            
                            {booking.notes && (
                              <p className="text-sm text-gray-600">{booking.notes}</p>
                            )}
                          </div>
                          
                          <div className="flex space-x-2">
                            {booking.videoSession?.meetingUrl && (
                              <Button asChild size="sm">
                                <a href={booking.videoSession.meetingUrl} target="_blank" rel="noopener noreferrer">
                                  <Video className="h-4 w-4 mr-1" />
                                  Join
                                </a>
                              </Button>
                            )}
                            
                            {booking.status === 'PENDING' && (
                              <>
                                <Button 
                                  size="sm" 
                                  onClick={() => handleUpdateBookingStatus(booking.id, 'CONFIRMED')}
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Confirm
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleUpdateBookingStatus(booking.id, 'CANCELLED')}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Cancel
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No upcoming sessions
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="availability" className="space-y-4">
          <AvailabilityForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}