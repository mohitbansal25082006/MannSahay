// E:\mannsahay\src\app\dashboard\booking\page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, User, Search, Filter, Video, Users, Plus } from 'lucide-react';
import CounselorCard from '@/components/booking/counselor-card';
import BookingCalendar from '@/components/booking/booking-calendar';
import BookingForm from '@/components/booking/booking-form';
import GroupSessionsList from '@/components/booking/group-sessions-list';
import MyBookingsList from '@/components/booking/my-bookings-list';
import WaitlistManager from '@/components/booking/waitlist-manager';

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

export default function BookingPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('counselors');
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [specializationFilter, setSpecializationFilter] = useState<string>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchCounselors();
  }, [specializationFilter, languageFilter]);

  const fetchCounselors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (specializationFilter !== 'all') params.append('specialization', specializationFilter);
      if (languageFilter !== 'all') params.append('language', languageFilter);
      
      const response = await fetch(`/api/counselors?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
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

  const handleCounselorSelect = (counselor: Counselor) => {
    setSelectedCounselor(counselor);
    setActiveTab('calendar');
  };

  const handleSlotSelect = (slot: any) => {
    setSelectedSlot(slot);
    setActiveTab('booking');
  };

  const handleBookingComplete = () => {
    setSelectedCounselor(null);
    setSelectedSlot(null);
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
        <h1 className="text-3xl font-bold text-gray-900">Book a Session</h1>
        <p className="mt-2 text-gray-600">
          Connect with professional counselors for personalized support
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-8">Loading counselors...</div>
            ) : filteredCounselors.length > 0 ? (
              filteredCounselors.map((counselor) => (
                <CounselorCard
                  key={counselor.id}
                  id={counselor.id}
                  name={counselor.name}
                  specialties={counselor.specialties}
                  languages={counselor.languages}
                  experience={counselor.experience}
                  bio={counselor.bio}
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
                    Schedule with {selectedCounselor.name}
                  </CardTitle>
                  <CardDescription>
                    Select an available time slot for your session
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