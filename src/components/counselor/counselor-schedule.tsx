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
        <TabsList className="grid w-full grid-cols-3 bg-white p-1 rounded-lg shadow-sm">
          <TabsTrigger value="calendar" className="text-sm font-medium data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 rounded-md transition-all">
            <Calendar className="h-4 w-4 mr-2" />
            Calendar View
          </TabsTrigger>
          <TabsTrigger value="bookings" className="text-sm font-medium data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 rounded-md transition-all">
            <Clock className="h-4 w-4 mr-2" />
            Upcoming Sessions
          </TabsTrigger>
          <TabsTrigger value="availability" className="text-sm font-medium data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 rounded-md transition-all">
            <Plus className="h-4 w-4 mr-2" />
            Manage Availability
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar" className="space-y-4">
          <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 pb-4">
              <CardTitle className="flex items-center text-lg md:text-xl font-bold text-gray-900">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                Your Schedule
              </CardTitle>
              <CardDescription className="text-gray-600 ml-11">
                View your upcoming sessions and availability
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <BookingCalendar counselorId="current-counselor" onSlotSelect={() => {}} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bookings" className="space-y-4">
          <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100 pb-4">
              <CardTitle className="flex items-center text-lg md:text-xl font-bold text-gray-900">
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                Upcoming Sessions
              </CardTitle>
              <CardDescription className="text-gray-600 ml-11">
                Manage your upcoming counseling sessions
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Loading bookings...</span>
                </div>
              ) : bookings.length > 0 ? (
                <div className="space-y-4">
                  {bookings.map(booking => (
                    <Card key={booking.id} className="border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                      <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <div className="font-medium text-gray-900">{booking.user.name}</div>
                              <Badge className={`ml-2 ${statusColors[booking.status] || ''}`}>
                                {booking.status}
                              </Badge>
                            </div>
                            
                            <div className="flex flex-wrap items-center text-sm text-gray-500 gap-3">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span>{new Date(booking.slotTime).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>{new Date(booking.slotTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </div>
                            
                            {booking.notes && (
                              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{booking.notes}</p>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            {booking.videoSession?.meetingUrl && (
                              <Button asChild size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white">
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
                                  className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white"
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Confirm
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleUpdateBookingStatus(booking.id, 'CANCELLED')}
                                  className="border-red-200 text-red-700 hover:bg-red-50"
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
                <div className="text-center py-8">
                  <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-gray-500" />
                  </div>
                  <p className="text-gray-700 font-medium mb-2">No upcoming sessions</p>
                  <p className="text-gray-500 text-sm">Your scheduled sessions will appear here</p>
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