// E:\mannsahay\src\components\booking\booking-form.tsx
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Video, MessageSquare, AlertCircle } from 'lucide-react';

interface BookingFormProps {
  counselor: any;
  slot: any;
  onComplete: () => void;
}

export default function BookingForm({ counselor, slot, onComplete }: BookingFormProps) {
  const { data: session } = useSession();
  const [notes, setNotes] = useState('');
  const [sessionType, setSessionType] = useState('ONE_ON_ONE');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringPattern, setRecurringPattern] = useState('');
  const [recurringEndDate, setRecurringEndDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          counselorId: counselor.id,
          slotTime: slot.dateTime.toISOString(),
          notes,
          sessionType,
          isRecurring,
          recurringPattern: isRecurring ? recurringPattern : null,
          recurringEndDate: isRecurring ? recurringEndDate : null,
          availabilitySlotId: slot.id // Pass the availability slot ID
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to book session');
      }

      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Confirm Your Booking
        </CardTitle>
        <CardDescription>
          Review your session details and confirm your booking
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Session Details</h3>
                <div className="mt-2 space-y-3">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <p className="font-medium">Counselor</p>
                      <p className="text-sm text-gray-500">{counselor.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <p className="font-medium">Date & Time</p>
                      <p className="text-sm text-gray-500">
                        {slot.dateTime.toLocaleDateString()} at {slot.dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <p className="font-medium">Duration</p>
                      <p className="text-sm text-gray-500">50 minutes</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Video className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <p className="font-medium">Platform</p>
                      <p className="text-sm text-gray-500">Google Meet</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Session Type</h3>
                <Select value={sessionType} onValueChange={setSessionType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ONE_ON_ONE">One-on-One Session</SelectItem>
                    <SelectItem value="GROUP">Group Session</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="recurring"
                  checked={isRecurring}
                  onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
                />
                <label htmlFor="recurring" className="text-sm font-medium">
                  Make this a recurring session
                </label>
              </div>
              
              {isRecurring && (
                <div className="space-y-3 pl-6 border-l-2 border-gray-200">
                  <div>
                    <label className="text-sm font-medium">Recurring Pattern</label>
                    <Select value={recurringPattern} onValueChange={setRecurringPattern}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select pattern" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">End Date</label>
                    <Input
                      type="date"
                      value={recurringEndDate}
                      onChange={(e) => setRecurringEndDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Additional Information</h3>
                <div className="mt-2">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Notes for Counselor (Optional)
                  </label>
                  <Textarea
                    id="notes"
                    placeholder="Share any specific concerns or topics you'd like to discuss..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Specialties</h3>
                <div className="mt-2 flex flex-wrap gap-1">
                  {counselor.specialties.map((specialty: string) => (
                    <Badge key={specialty} variant="secondary">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Languages</h3>
                <div className="mt-2 flex flex-wrap gap-1">
                  {counselor.languages.map((lang: string) => (
                    <Badge key={lang} variant="outline">
                      {lang === 'en' ? 'English' : 
                       lang === 'hi' ? 'Hindi' :
                       lang === 'ta' ? 'Tamil' :
                       lang === 'te' ? 'Telugu' :
                       lang === 'bn' ? 'Bengali' :
                       lang === 'mr' ? 'Marathi' :
                       lang === 'gu' ? 'Gujarati' :
                       lang === 'kn' ? 'Kannada' :
                       lang === 'ml' ? 'Malayalam' :
                       lang === 'pa' ? 'Punjabi' : lang}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="flex items-center p-3 text-sm text-red-700 bg-red-100 rounded-md">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}
          
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onComplete}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Booking...' : 'Confirm Booking'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}