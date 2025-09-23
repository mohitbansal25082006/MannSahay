'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, User, Search, Filter, Video, Users, Plus, Award, X } from 'lucide-react';
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

  const clearFilters = () => {
    setSpecializationFilter('all');
    setLanguageFilter('all');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 md:mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                {rescheduleBookingId ? 'Reschedule Session' : 'Book a Session'}
              </h1>
              <p className="mt-2 text-gray-600 max-w-2xl">
                {rescheduleBookingId 
                  ? 'Select a new time slot for your session' 
                  : 'Connect with professional counselors for personalized support'
                }
              </p>
            </div>
            {session && (
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-indigo-600" />
                </div>
                <span className="font-medium text-gray-700">{session.user?.name}</span>
              </div>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-1">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto">
              <TabsTrigger 
                value="counselors" 
                className="py-3 px-2 md:px-4 text-xs md:text-sm flex flex-col md:flex-row items-center gap-1 md:gap-2"
              >
                <User className="h-4 w-4" />
                <span>Find Counselors</span>
              </TabsTrigger>
              <TabsTrigger 
                value="calendar" 
                disabled={!selectedCounselor}
                className="py-3 px-2 md:px-4 text-xs md:text-sm flex flex-col md:flex-row items-center gap-1 md:gap-2"
              >
                <Calendar className="h-4 w-4" />
                <span>Schedule</span>
              </TabsTrigger>
              <TabsTrigger 
                value="booking" 
                disabled={!selectedSlot}
                className="py-3 px-2 md:px-4 text-xs md:text-sm flex flex-col md:flex-row items-center gap-1 md:gap-2"
              >
                <Clock className="h-4 w-4" />
                <span>Confirm</span>
              </TabsTrigger>
              <TabsTrigger 
                value="group-sessions"
                className="py-3 px-2 md:px-4 text-xs md:text-sm flex flex-col md:flex-row items-center gap-1 md:gap-2"
              >
                <Users className="h-4 w-4" />
                <span>Group Sessions</span>
              </TabsTrigger>
              <TabsTrigger 
                value="my-bookings"
                className="py-3 px-2 md:px-4 text-xs md:text-sm flex flex-col md:flex-row items-center gap-1 md:gap-2"
              >
                <Video className="h-4 w-4" />
                <span>My Bookings</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="counselors" className="space-y-6">
            <Card className="border-0 shadow-md rounded-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 pb-4">
                <CardTitle className="flex items-center text-indigo-800">
                  <Filter className="h-5 w-5 mr-2" />
                  Find Your Perfect Counselor
                </CardTitle>
                <CardDescription className="text-indigo-600">
                  Filter by specialization, language, or search by name
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search counselors..."
                      className="pl-10 h-12 rounded-lg border-gray-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
                    <SelectTrigger className="h-12 rounded-lg border-gray-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
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
                    <SelectTrigger className="h-12 rounded-lg border-gray-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
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
                
                {(specializationFilter !== 'all' || languageFilter !== 'all' || searchQuery) && (
                  <div className="mt-4 flex items-center">
                    <span className="text-sm text-gray-500 mr-2">Active filters:</span>
                    <div className="flex flex-wrap gap-2">
                      {specializationFilter !== 'all' && (
                        <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                          {specializationFilter}
                          <button 
                            onClick={() => setSpecializationFilter('all')}
                            className="ml-1 hover:text-indigo-900"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      )}
                      {languageFilter !== 'all' && (
                        <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                          {languages.find(l => l.code === languageFilter)?.name}
                          <button 
                            onClick={() => setLanguageFilter('all')}
                            className="ml-1 hover:text-indigo-900"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      )}
                      {searchQuery && (
                        <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                          Search: {searchQuery}
                          <button 
                            onClick={() => setSearchQuery('')}
                            className="ml-1 hover:text-indigo-900"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={clearFilters}
                        className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
                      >
                        Clear all
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {showRecommendations && recommendations.length > 0 && (
              <Card className="border-0 shadow-md rounded-xl overflow-hidden border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader className="pb-4">
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
                <div className="col-span-full flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                  <p className="mt-4 text-gray-600">Finding the best counselors for you...</p>
                </div>
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
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center bg-white rounded-xl shadow-sm p-8">
                  <div className="bg-indigo-100 p-4 rounded-full mb-4">
                    <Search className="h-8 w-8 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No counselors found</h3>
                  <p className="text-gray-600 max-w-md">
                    We couldn't find any counselors matching your criteria. Try adjusting your filters or search terms.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={clearFilters}
                    className="mt-4 border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            {selectedCounselor ? (
              <div className="space-y-6">
                <Card className="border-0 shadow-md rounded-xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 pb-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <CardTitle className="flex items-center text-indigo-800">
                          <Calendar className="h-5 w-5 mr-2" />
                          {rescheduleBookingId 
                            ? `Reschedule with ${selectedCounselor.name}`
                            : `Schedule with ${selectedCounselor.name}`
                          }
                        </CardTitle>
                        <CardDescription className="text-indigo-600 mt-1">
                          {rescheduleBookingId && rescheduleData
                            ? `Current appointment: ${new Date(rescheduleData.originalSlotTime).toLocaleString()}`
                            : 'Select an available time slot for your session'
                          }
                        </CardDescription>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={() => setActiveTab('counselors')}
                        className="mt-4 md:mt-0 self-start"
                      >
                        Change Counselor
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6">
                    <BookingCalendar
                      counselorId={selectedCounselor.id}
                      onSlotSelect={handleSlotSelect}
                    />
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="border-0 shadow-md rounded-xl overflow-hidden">
                <CardContent className="pt-12 pb-12 flex flex-col items-center justify-center">
                  <div className="bg-indigo-100 p-4 rounded-full mb-4">
                    <User className="h-8 w-8 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No counselor selected</h3>
                  <p className="text-gray-600 text-center max-w-md mb-4">
                    Please select a counselor from the list to view their availability
                  </p>
                  <Button 
                    onClick={() => setActiveTab('counselors')}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    Browse Counselors
                  </Button>
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
              <Card className="border-0 shadow-md rounded-xl overflow-hidden">
                <CardContent className="pt-12 pb-12 flex flex-col items-center justify-center">
                  <div className="bg-indigo-100 p-4 rounded-full mb-4">
                    <Clock className="h-8 w-8 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No time slot selected</h3>
                  <p className="text-gray-600 text-center max-w-md mb-4">
                    Please select a time slot from the calendar to book your session
                  </p>
                  <Button 
                    onClick={() => setActiveTab('calendar')}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    Select Time Slot
                  </Button>
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
    </div>
  );
}