'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, User, Video, MessageSquare, Star, MoreHorizontal, CalendarPlus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

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
    id: string;
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

interface Counselor {
  id: string;
  name: string;
  email: string;
  bio?: string;
  specialties: string[];
  languages: string[];
  experience?: number;
  isActive: boolean;
  profileImage?: string;
}

interface AvailabilitySlot {
  id: string;
  counselorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export default function MyBookingsList() {
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [pastBookings, setPastBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [rescheduleNotes, setRescheduleNotes] = useState('');
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);

  useEffect(() => {
    fetchBookings();
    fetchCounselors();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      // Fetch upcoming bookings
      const upcomingResponse = await fetch('/api/bookings?upcoming=true');
      const upcomingData = await upcomingResponse.json();
      setUpcomingBookings(upcomingData);
      
      // Fetch past bookings
      const pastResponse = await fetch('/api/bookings?upcoming=false');
      const pastData = await pastResponse.json();
      setPastBookings(pastData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCounselors = async () => {
    try {
      const response = await fetch('/api/counselors');
      if (response.ok) {
        const data = await response.json();
        setCounselors(data);
      }
    } catch (error) {
      console.error('Error fetching counselors:', error);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'CANCELLED' })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to cancel booking');
      }

      // Update the local state
      setUpcomingBookings(prevBookings =>
        prevBookings.map(booking =>
          booking.id === bookingId ? { ...booking, status: 'CANCELLED' } : booking
        )
      );
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert(error instanceof Error ? error.message : 'Failed to cancel booking');
    }
  };

  const handleRescheduleClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setRescheduleNotes('');
    setIsRescheduleDialogOpen(true);
    
    // Fetch availability slots for this counselor
    fetchCounselorAvailability(booking.counselor.id);
  };

  const fetchCounselorAvailability = async (counselorId: string) => {
    try {
      const response = await fetch(`/api/counselors/${counselorId}/availability`);
      if (response.ok) {
        const data = await response.json();
        setAvailabilitySlots(data);
      }
    } catch (error) {
      console.error('Error fetching counselor availability:', error);
    }
  };

  const handleSlotSelect = (slot: AvailabilitySlot) => {
    setSelectedSlot(slot);
  };

  const handleConfirmReschedule = async () => {
    if (!selectedBooking || !selectedSlot) return;
    
    setIsProcessing(true);
    
    try {
      const response = await fetch(`/api/bookings/${selectedBooking.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slotTime: new Date(selectedBooking.slotTime).toISOString().split('T')[0] + 'T' + selectedSlot.startTime,
          notes: rescheduleNotes || selectedBooking.notes
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to reschedule booking');
      }

      // Update the local state
      setUpcomingBookings(prevBookings =>
        prevBookings.map(booking =>
          booking.id === selectedBooking.id 
            ? { 
                ...booking, 
                slotTime: new Date(selectedBooking.slotTime).toISOString().split('T')[0] + 'T' + selectedSlot.startTime,
                notes: rescheduleNotes || selectedBooking.notes
              } 
            : booking
        )
      );

      // Close dialog and reset state
      setIsRescheduleDialogOpen(false);
      setSelectedBooking(null);
      setSelectedSlot(null);
      setRescheduleNotes('');
      
      alert('Booking rescheduled successfully!');
    } catch (error) {
      console.error('Error rescheduling booking:', error);
      alert(error instanceof Error ? error.message : 'Failed to reschedule booking');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddToCalendar = (booking: Booking) => {
    const { slotTime, endTime, counselor } = booking;
    const title = `Counseling Session with ${counselor.name}`;
    const description = `Counseling session booked through MannSahay`;
    const location = 'Online (Video Session)';
    
    // Create Google Calendar URL
    const startTime = new Date(slotTime).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const formattedEndTime = new Date(endTime).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startTime}/${formattedEndTime}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;
    
    // Open in new window
    window.open(googleCalendarUrl, '_blank');
  };

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    COMPLETED: 'bg-blue-100 text-blue-800',
    NO_SHOW: 'bg-gray-100 text-gray-800'
  };

  const renderBookingCard = (booking: Booking, isUpcoming: boolean) => (
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
                <DropdownMenuItem onClick={() => handleRescheduleClick(booking)}>
                  Reschedule
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddToCalendar(booking)}>
                  <CalendarPlus className="h-4 w-4 mr-2" />
                  Add to Calendar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleCancelBooking(booking.id)}>
                  Cancel Booking
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
      
      {/* Reschedule Dialog */}
      <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Reschedule Your Session</DialogTitle>
            <DialogDescription>
              Select a new time slot for your session with {selectedBooking?.counselor.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Current Appointment</Label>
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="font-medium">
                  {selectedBooking && new Date(selectedBooking.slotTime).toLocaleDateString()} at {selectedBooking && new Date(selectedBooking.slotTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Select New Time Slot</Label>
              <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto p-2 border rounded-md">
                {availabilitySlots
                  .filter(slot => !slot.isBooked)
                  .map((slot) => (
                    <Button
                      key={slot.id}
                      variant={selectedSlot?.id === slot.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSlotSelect(slot)}
                      className="justify-start"
                    >
                      {slot.startTime}
                    </Button>
                  ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any specific requirements or preferences for the new time slot..."
                value={rescheduleNotes}
                onChange={(e) => setRescheduleNotes(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => setIsRescheduleDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmReschedule} 
                disabled={!selectedSlot || isProcessing}
              >
                {isProcessing ? 'Rescheduling...' : 'Confirm Reschedule'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}