'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Plus, Video, MessageSquare, Check, X, User, MapPin } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('calendar');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
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
        },
        {
          id: '3',
          slotTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 50 * 60 * 1000).toISOString(),
          status: 'COMPLETED',
          user: { name: 'Taylor Brown', email: 'taylor@example.com' },
          notes: 'Follow-up session'
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
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    CONFIRMED: 'bg-green-100 text-green-800 border-green-200',
    CANCELLED: 'bg-red-100 text-red-800 border-red-200',
    COMPLETED: 'bg-blue-100 text-blue-800 border-blue-200',
    NO_SHOW: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return <Check className="h-3 w-3" />;
      case 'PENDING': return <Clock className="h-3 w-3" />;
      case 'COMPLETED': return <Check className="h-3 w-3" />;
      case 'CANCELLED': return <X className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Counseling Schedule
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Manage your appointments and availability
          </p>
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 sm:p-2">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-2 bg-transparent p-0 h-auto">
              <TabsTrigger 
                value="calendar" 
                className="
                  relative flex items-center justify-center sm:justify-start 
                  text-xs sm:text-sm font-medium 
                  data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 
                  data-[state=active]:text-white data-[state=active]:shadow-sm
                  data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900
                  rounded-lg sm:rounded-xl 
                  p-2 sm:p-3 
                  transition-all duration-200 
                  group
                  min-h-[48px] sm:min-h-[56px]
                "
              >
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <div className="
                    p-1 sm:p-2 rounded-lg 
                    bg-blue-100 group-data-[state=active]:bg-white/20 
                    transition-colors duration-200
                  ">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                  </div>
                  <span className="whitespace-nowrap">Calendar View</span>
                </div>
              </TabsTrigger>
              
              <TabsTrigger 
                value="bookings" 
                className="
                  relative flex items-center justify-center sm:justify-start 
                  text-xs sm:text-sm font-medium 
                  data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 
                  data-[state=active]:text-white data-[state=active]:shadow-sm
                  data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900
                  rounded-lg sm:rounded-xl 
                  p-2 sm:p-3 
                  transition-all duration-200 
                  group
                  min-h-[48px] sm:min-h-[56px]
                "
              >
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <div className="
                    p-1 sm:p-2 rounded-lg 
                    bg-green-100 group-data-[state=active]:bg-white/20 
                    transition-colors duration-200
                  ">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                  </div>
                  <span className="whitespace-nowrap">Upcoming Sessions</span>
                </div>
              </TabsTrigger>
              
              <TabsTrigger 
                value="availability" 
                className="
                  relative flex items-center justify-center sm:justify-start 
                  text-xs sm:text-sm font-medium 
                  data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 
                  data-[state=active]:text-white data-[state=active]:shadow-sm
                  data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900
                  rounded-lg sm:rounded-xl 
                  p-2 sm:p-3 
                  transition-all duration-200 
                  group
                  min-h-[48px] sm:min-h-[56px]
                "
              >
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <div className="
                    p-1 sm:p-2 rounded-lg 
                    bg-purple-100 group-data-[state=active]:bg-white/20 
                    transition-colors duration-200
                  ">
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                  </div>
                  <span className="whitespace-nowrap">Manage Availability</span>
                </div>
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Calendar Tab Content */}
          <TabsContent value="calendar" className="mt-4 sm:mt-6 space-y-4">
            <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-0 overflow-hidden rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 pb-4 sm:pb-6">
                <CardTitle className="flex items-center text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                  <div className="bg-blue-100 p-2 sm:p-3 rounded-xl mr-3 sm:mr-4">
                    <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  </div>
                  Your Schedule Calendar
                </CardTitle>
                <CardDescription className="text-gray-600 ml-11 sm:ml-14 text-sm sm:text-base">
                  View and manage your upcoming sessions and availability in calendar format
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6">
                <div className="rounded-xl overflow-hidden border border-gray-200">
                  <BookingCalendar counselorId="current-counselor" onSlotSelect={() => {}} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Bookings Tab Content */}
          <TabsContent value="bookings" className="mt-4 sm:mt-6 space-y-4">
            <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-0 overflow-hidden rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100 pb-4 sm:pb-6">
                <CardTitle className="flex items-center text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                  <div className="bg-green-100 p-2 sm:p-3 rounded-xl mr-3 sm:mr-4">
                    <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                  </div>
                  Upcoming Sessions
                </CardTitle>
                <CardDescription className="text-gray-600 ml-11 sm:ml-14 text-sm sm:text-base">
                  Manage your upcoming counseling sessions and client appointments
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-8 sm:py-12 space-y-3">
                    <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
                    <span className="text-gray-600 text-sm sm:text-base">Loading bookings...</span>
                  </div>
                ) : bookings.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {bookings.map(booking => (
                      <Card key={booking.id} className="border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden rounded-xl">
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex flex-col lg:flex-row justify-between items-start gap-4 sm:gap-6">
                            <div className="flex-1 space-y-3 sm:space-y-4">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                <div className="flex items-center space-x-2">
                                  <div className="bg-blue-50 p-1 rounded-lg">
                                    <User className="h-4 w-4 text-blue-600" />
                                  </div>
                                  <div className="font-semibold text-gray-900 text-base sm:text-lg">
                                    {booking.user.name}
                                  </div>
                                </div>
                                <Badge className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${statusColors[booking.status]}`}>
                                  {getStatusIcon(booking.status)}
                                  <span>{booking.status}</span>
                                </Badge>
                              </div>
                              
                              <div className="flex flex-wrap items-center text-xs sm:text-sm text-gray-500 gap-2 sm:gap-4">
                                <div className="flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded-lg">
                                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                                  <span>{new Date(booking.slotTime).toLocaleDateString('en-US', { 
                                    weekday: 'short', 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}</span>
                                </div>
                                <div className="flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded-lg">
                                  <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                                  <span>
                                    {new Date(booking.slotTime).toLocaleTimeString([], { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })} - {new Date(booking.endTime).toLocaleTimeString([], { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </span>
                                </div>
                              </div>
                              
                              {booking.notes && (
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                  <p className="text-gray-700 text-sm sm:text-base">{booking.notes}</p>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex flex-wrap gap-2 w-full lg:w-auto justify-start lg:justify-end">
                              {booking.videoSession?.meetingUrl && (
                                <Button 
                                  asChild 
                                  size="sm" 
                                  className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-3 sm:px-4 py-2 text-xs sm:text-sm"
                                >
                                  <a href={booking.videoSession.meetingUrl} target="_blank" rel="noopener noreferrer">
                                    <Video className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                    Join Session
                                  </a>
                                </Button>
                              )}
                              
                              {booking.status === 'PENDING' && (
                                <div className="flex space-x-2">
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleUpdateBookingStatus(booking.id, 'CONFIRMED')}
                                    className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white px-3 sm:px-4 py-2 text-xs sm:text-sm"
                                  >
                                    <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                    Confirm
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleUpdateBookingStatus(booking.id, 'CANCELLED')}
                                    className="border-red-200 text-red-700 hover:bg-red-50 px-3 sm:px-4 py-2 text-xs sm:text-sm"
                                  >
                                    <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                    Cancel
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <div className="bg-gray-100 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="h-8 w-8 sm:h-10 sm:w-10 text-gray-500" />
                    </div>
                    <p className="text-gray-700 font-medium mb-2 text-base sm:text-lg">No upcoming sessions</p>
                    <p className="text-gray-500 text-sm sm:text-base">Your scheduled sessions will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Availability Tab Content */}
          <TabsContent value="availability" className="mt-4 sm:mt-6">
            <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-0 overflow-hidden rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-gray-100 pb-4 sm:pb-6">
                <CardTitle className="flex items-center text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                  <div className="bg-purple-100 p-2 sm:p-3 rounded-xl mr-3 sm:mr-4">
                    <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                  </div>
                  Manage Your Availability
                </CardTitle>
                <CardDescription className="text-gray-600 ml-11 sm:ml-14 text-sm sm:text-base">
                  Set your available time slots for client bookings
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6">
                <AvailabilityForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}