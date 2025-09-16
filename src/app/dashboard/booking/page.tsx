'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Counselor {
  id: string;
  name: string;
  specialties: string[];
  isActive: boolean;
}

interface Booking {
  id: string;
  slotTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  notes?: string;
  counselor: {
    name: string;
    specialties: string[];
  };
}

const timeSlots = [
  '09:00', '10:00', '11:00', '12:00',
  '14:00', '15:00', '16:00', '17:00'
];

export default function BookingPage() {
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedCounselor, setSelectedCounselor] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - In real app, fetch from API
  useEffect(() => {
    setCounselors([
      {
        id: '1',
        name: 'Dr. Priya Sharma',
        specialties: ['Anxiety', 'Depression', 'Academic Stress'],
        isActive: true
      },
      {
        id: '2',
        name: 'Dr. Rajesh Kumar',
        specialties: ['Relationships', 'Family Issues', 'Self-Esteem'],
        isActive: true
      },
      {
        id: '3',
        name: 'Dr. Meera Patel',
        specialties: ['Sleep Disorders', 'Trauma', 'Grief Counseling'],
        isActive: true
      }
    ]);

    setBookings([
      {
        id: '1',
        slotTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        status: 'CONFIRMED',
        counselor: {
          name: 'Dr. Priya Sharma',
          specialties: ['Anxiety', 'Depression']
        }
      }
    ]);

    // Set tomorrow as default date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !selectedCounselor) {
      toast.error('Please select date, time, and counselor');
      return;
    }

    setIsLoading(true);

    try {
      const slotDateTime = new Date(`${selectedDate}T${selectedTime}:00`);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newBooking = {
        id: Date.now().toString(),
        slotTime: slotDateTime.toISOString(),
        status: 'PENDING' as const,
        counselor: {
          name: counselors.find(c => c.id === selectedCounselor)?.name || '',
          specialties: counselors.find(c => c.id === selectedCounselor)?.specialties || []
        }
      };

      setBookings(prev => [...prev, newBooking]);
      
      // Reset form
      setSelectedTime('');
      setSelectedCounselor('');
      
      toast.success('Booking request submitted successfully! You will receive confirmation shortly.');
    } catch (error) {
      toast.error('Failed to book session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'PENDING':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Book Counseling Session
        </h1>
        <p className="text-gray-600">
          Schedule a one-on-one session with our professional counselors
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Booking Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Select Counselor */}
          <Card>
            <CardHeader>
              <CardTitle>Choose a Counselor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {counselors.map((counselor) => (
                  <div
                    key={counselor.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedCounselor === counselor.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedCounselor(counselor.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {counselor.name}
                          </h3>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {counselor.specialties.map((specialty) => (
                              <Badge key={specialty} variant="secondary">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      {selectedCounselor === counselor.id && (
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Date and Time Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Date & Time</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? 'default' : 'outline'}
                      onClick={() => setSelectedTime(time)}
                      className="text-sm"
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleBooking}
                disabled={isLoading || !selectedDate || !selectedTime || !selectedCounselor}
                className="w-full"
              >
                {isLoading ? 'Booking...' : 'Book Session'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* My Bookings */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                My Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bookings.length > 0 ? (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="p-3 border rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-sm">
                            {booking.counselor.name}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {new Date(booking.slotTime).toLocaleDateString()} at{' '}
                            {new Date(booking.slotTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        {getStatusIcon(booking.status)}
                      </div>
                      
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                      
                      {booking.notes && (
                        <p className="text-xs text-gray-600 mt-2">
                          {booking.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No bookings yet</p>
                  <p className="text-xs text-gray-400">
                    Book your first session to get started
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}