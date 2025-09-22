'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, User, Search, Filter, Video, Users, Plus, Award } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Counselor, Booking } from '@/types';
import CounselorCard from '@/components/booking/counselor-card';
import BookingCalendar from '@/components/booking/booking-calendar';
import BookingForm from '@/components/booking/booking-form';
import GroupSessionsList from '@/components/booking/group-sessions-list';
import MyBookingsList from '@/components/booking/my-bookings-list';
import WaitlistManager from '@/components/booking/waitlist-manager';

// Type that matches BookingCalendar's SelectedSlot interface
interface SelectedSlot {
  id: string;
  dayOfWeek: number;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isBooked: boolean;
  dateTime: Date; // Combined date and time
}

// Type that matches BookingForm's Slot interface
interface BookingSlot {
  id: string;
  dateTime: Date;
}

// Type for reschedule data, using undefined instead of null to match BookingForm
interface RescheduleData {
  bookingId: string;
  counselorId: string;
  originalSlotTime: string;
}

// Type for AI recommendations
interface Recommendation {
  counselorId: string;
  score: number;
  reason: string;
}

export default function BookingPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const rescheduleBookingId = searchParams.get('reschedule');
  const counselorNameParam = searchParams.get('counselorId');
  
  const [activeTab, setActiveTab] = useState(rescheduleBookingId ? 'calendar' : 'counselors');
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null);
  const [specializationFilter, setSpecializationFilter] = useState<string>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [loading, setLoading] = useState(true);
  const [rescheduleData, setRescheduleData] = useState<RescheduleData | undefined>(undefined);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const specializations = [
    'Anxiety',
    'Depression',
    'Academic Stress',
    'Relationship Issues',
    'Career Guidance',
    'Self-Esteem',
    'Trauma',
    'Addiction',
    'Family Issues',
    'LGBTQ+ Issues'
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ta', name: 'Tamil' },
    { code: 'te', name: 'Telugu' },
    { code: 'bn', name: 'Bengali' },
    { code: 'mr', name: 'Marathi' },
    { code: 'gu', name: 'Gujarati' },
    { code: 'kn', name: 'Kannada' },
    { code: 'ml', name: 'Malayalam' },
    { code: 'pa', name: 'Punjabi' }
  ];

  const fetchCounselors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (specializationFilter !== 'all') params.append('specialization', specializationFilter);
      if (languageFilter !== 'all') params.append('language', languageFilter);
      
      const response = await fetch(`/api/counselors?${params.toString()}`);
      if (response.ok) {
        const data: Counselor[] = await response.json();
        setCounselors(data);
      } else {
        console.error('Failed to fetch counselors');
      }
    } catch (error) {
      console.error('Error fetching counselors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await fetch('/api/counselors/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          needs: "I'm looking for help with anxiety and stress management",
          preferences: {
            language: languageFilter !== 'all' ? languageFilter : 'en',
            specializations: specializationFilter !== 'all' ? [specializationFilter] : []
          }
        })
      });

      if (response.ok) {
        const data: Recommendation[] = await response.json();
        setRecommendations(data);
        setShowRecommendations(true);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  useEffect(() => {
    fetchCounselors();
  }, [specializationFilter, languageFilter]);

  useEffect(() => {
    if (specializationFilter !== 'all' || languageFilter !== 'all') {
      fetchRecommendations();
    } else {
      setShowRecommendations(false);
    }
  }, [specializationFilter, languageFilter]);

  useEffect(() => {
    if (rescheduleBookingId) {
      fetchBookingDetails(rescheduleBookingId);
    }
  }, [rescheduleBookingId]);

  useEffect(() => {
    if (counselorNameParam && counselors.length > 0) {
      const counselor = counselors.find(c => 
        c.name.replace(/\s+/g, '-').toLowerCase() === counselorNameParam
      );
      if (counselor) {
        setSelectedCounselor(counselor);
      }
    }
  }, [counselorNameParam, counselors]);

  const fetchBookingDetails = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`);
      if (response.ok) {
        const booking: Booking = await response.json();
        setRescheduleData({
          bookingId: booking.id,
          counselorId: booking.counselorId,
          originalSlotTime: booking.slotTime.toString()
        });
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
    }
  };

  const handleCounselorSelect = (counselor: Counselor) => {
    setSelectedCounselor(counselor);
    setActiveTab('calendar');
  };

  // Updated handler to convert SelectedSlot to BookingSlot
  const handleSlotSelect = (slot: SelectedSlot) => {
    // Convert SelectedSlot to the BookingSlot format expected by BookingForm
    const bookingSlot: BookingSlot = {
      id: slot.id,
      dateTime: slot.dateTime
    };
    setSelectedSlot(bookingSlot);
    setActiveTab('booking');
  };

  const handleBookingComplete = () => {
    setSelectedCounselor(null);
    setSelectedSlot(null);
    setRescheduleData(undefined);
    setActiveTab('my-bookings');
  };

  const filteredCounselors = counselors.filter(counselor => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        counselor.name.toLowerCase().includes(query) ||
        counselor.bio?.toLowerCase().includes(query) ||
        counselor.specialties.some(specialty => 
          specialty.toLowerCase().includes(query)
        )
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {rescheduleBookingId ? 'Reschedule Session' : 'Book a Session'}
        </h1>
        <p className="mt-2 text-gray-600">
          {rescheduleBookingId 
            ? 'Select a new time slot for your session' 
            : 'Connect with professional counselors for personalized support'
          }
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="counselors">Find Counselors</TabsTrigger>
          <TabsTrigger value="calendar" disabled={!selectedCounselor}>Schedule</TabsTrigger>
          <TabsTrigger value="booking" disabled={!selectedSlot}>Confirm</TabsTrigger>
          <TabsTrigger value="group-sessions">Group Sessions</TabsTrigger>
          <TabsTrigger value="my-bookings">My Bookings</TabsTrigger>
        </TabsList>

        <TabsContent value="counselors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search counselors..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specializations</SelectItem>
                    {specializations.map((spec) => (
                      <SelectItem key={spec} value={spec}>
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={languageFilter} onValueChange={setLanguageFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Languages</SelectItem>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {showRecommendations && recommendations.length > 0 && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-800 flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  AI-Powered Recommendations
                </CardTitle>
                <CardDescription className="text-blue-700">
                  Based on your preferences and needs, we recommend these counselors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendations.map((rec) => {
                    const counselor = counselors.find(c => c.id === rec.counselorId);
                    if (!counselor) return null;
                    
                    return (
                      <CounselorCard
                        key={rec.counselorId}
                        id={counselor.id}
                        name={counselor.name}
                        email={counselor.email}
                        specialties={counselor.specialties}
                        languages={counselor.languages}
                        experience={counselor.experience}
                        bio={counselor.bio}
                        isActive={counselor.isActive}
                        profileImage={counselor.profileImage}
                        onSelect={handleCounselorSelect}
                        isRecommended={true}
                        matchScore={rec.score}
                        matchReason={rec.reason}
                      />
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-8">Loading counselors...</div>
            ) : filteredCounselors.length > 0 ? (
              filteredCounselors.map((counselor) => (
                <CounselorCard
                  key={counselor.id}
                  id={counselor.id}
                  name={counselor.name}
                  email={counselor.email}
                  specialties={counselor.specialties}
                  languages={counselor.languages}
                  experience={counselor.experience}
                  bio={counselor.bio}
                  isActive={counselor.isActive}
                  profileImage={counselor.profileImage}
                  onSelect={handleCounselorSelect}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                No counselors found matching your criteria
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          {selectedCounselor ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    {rescheduleBookingId 
                      ? `Reschedule with ${selectedCounselor.name}`
                      : `Schedule with ${selectedCounselor.name}`
                    }
                  </CardTitle>
                  <CardDescription>
                    {rescheduleBookingId && rescheduleData
                      ? `Current appointment: ${new Date(rescheduleData.originalSlotTime).toLocaleString()}`
                      : 'Select an available time slot for your session'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BookingCalendar
                    counselorId={selectedCounselor.id}
                    onSlotSelect={handleSlotSelect}
                  />
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-500">Please select a counselor first</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="booking" className="space-y-6">
          {selectedCounselor && selectedSlot ? (
            <BookingForm
              counselor={selectedCounselor}
              slot={selectedSlot}
              rescheduleData={rescheduleData}
              onComplete={handleBookingComplete}
            />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-500">Please select a time slot first</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="group-sessions" className="space-y-6">
          <GroupSessionsList />
        </TabsContent>

        <TabsContent value="my-bookings" className="space-y-6">
          <MyBookingsList />
          <WaitlistManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}