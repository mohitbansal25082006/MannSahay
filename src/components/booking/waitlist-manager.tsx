// E:\mannsahay\src\components\booking\waitlist-manager.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, User, Plus, Trash2 } from 'lucide-react';

interface WaitlistEntry {
  id: string;
  counselor: {
    name: string;
    specialties: string[];
    languages: string[];
  };
  preferredDay?: number;
  preferredTime?: string;
  notes?: string;
  createdAt: string;
  contacted: boolean;
}

export default function WaitlistManager() {
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
  const [counselors, setCounselors] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCounselor, setSelectedCounselor] = useState('');
  const [preferredDay, setPreferredDay] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);

  const daysOfWeek = [
    { value: '0', label: 'Sunday' },
    { value: '1', label: 'Monday' },
    { value: '2', label: 'Tuesday' },
    { value: '3', label: 'Wednesday' },
    { value: '4', label: 'Thursday' },
    { value: '5', label: 'Friday' },
    { value: '6', label: 'Saturday' }
  ];

  useEffect(() => {
    fetchWaitlistEntries();
    fetchCounselors();
  }, []);

  const fetchWaitlistEntries = async () => {
    setLoading(true);
    try {
      // This would be an actual API call in a real implementation
      // const response = await fetch('/api/waitlist');
      // const data = await response.json();
      
      // Mock data for demonstration
      const mockWaitlistEntries: WaitlistEntry[] = [
        {
          id: '1',
          counselor: {
            name: 'Dr. Priya Sharma',
            specialties: ['Anxiety', 'Depression'],
            languages: ['en', 'hi']
          },
          preferredDay: 1,
          preferredTime: '10:00',
          notes: 'Looking for morning sessions',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          contacted: false
        }
      ];
      
      setWaitlistEntries(mockWaitlistEntries);
    } catch (error) {
      console.error('Error fetching waitlist entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCounselors = async () => {
    try {
      // This would be an actual API call in a real implementation
      // const response = await fetch('/api/counselors');
      // const data = await response.json();
      
      // Mock data for demonstration
      const mockCounselors = [
        { id: '1', name: 'Dr. Priya Sharma', specialties: ['Anxiety', 'Depression'], languages: ['en', 'hi'] },
        { id: '2', name: 'Dr. Rajesh Kumar', specialties: ['Relationship Issues', 'Career Guidance'], languages: ['en', 'ta'] },
        { id: '3', name: 'Dr. Ananya Reddy', specialties: ['Trauma', 'Family Issues'], languages: ['en', 'te', 'hi'] }
      ];
      
      setCounselors(mockCounselors);
    } catch (error) {
      console.error('Error fetching counselors:', error);
    }
  };

  const handleJoinWaitlist = async () => {
    if (!selectedCounselor) return;
    
    try {
      // This would be an actual API call in a real implementation
      // await fetch('/api/waitlist', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     counselorId: selectedCounselor,
      //     preferredDay: preferredDay ? parseInt(preferredDay) : undefined,
      //     preferredTime,
      //     notes
      //   })
      // });
      
      // Reset form
      setSelectedCounselor('');
      setPreferredDay('');
      setPreferredTime('');
      setNotes('');
      setShowAddForm(false);
      
      // Refresh waitlist entries
      fetchWaitlistEntries();
    } catch (error) {
      console.error('Error joining waitlist:', error);
    }
  };

  const handleLeaveWaitlist = async (entryId: string) => {
    try {
      // This would be an actual API call in a real implementation
      // await fetch(`/api/waitlist/${entryId}`, { method: 'DELETE' });
      
      // Update local state
      setWaitlistEntries(prevEntries => prevEntries.filter(entry => entry.id !== entryId));
    } catch (error) {
      console.error('Error leaving waitlist:', error);
    }
  };

  const getDayName = (day: number) => {
    return daysOfWeek.find(d => d.value === day.toString())?.label || 'Unknown';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Counselor Waitlist
            </CardTitle>
            <CardDescription>
              Join waitlists for fully booked counselors
            </CardDescription>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Join Waitlist
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Join Waitlist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Counselor
                </label>
                <Select value={selectedCounselor} onValueChange={setSelectedCounselor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a counselor" />
                  </SelectTrigger>
                  <SelectContent>
                    {counselors.map(counselor => (
                      <SelectItem key={counselor.id} value={counselor.id}>
                        {counselor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Day (Optional)
                  </label>
                  <Select value={preferredDay} onValueChange={setPreferredDay}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {daysOfWeek.map(day => (
                        <SelectItem key={day.value} value={day.value}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Time (Optional)
                  </label>
                  <Input
                    type="time"
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <Textarea
                  placeholder="Any specific requirements or preferences..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleJoinWaitlist} disabled={!selectedCounselor}>
                  Join Waitlist
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {loading ? (
          <div className="text-center py-8">Loading waitlist entries...</div>
        ) : waitlistEntries.length > 0 ? (
          <div className="space-y-4">
            {waitlistEntries.map(entry => (
              <Card key={entry.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="font-medium">{entry.counselor.name}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {entry.counselor.specialties.map(specialty => (
                          <Badge key={specialty} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                      
                      {entry.preferredDay !== undefined && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Preferred: {getDayName(entry.preferredDay)}{entry.preferredTime ? ` at ${entry.preferredTime}` : ''}</span>
                        </div>
                      )}
                      
                      {entry.notes && (
                        <p className="text-sm text-gray-600">{entry.notes}</p>
                      )}
                      
                      <div className="text-xs text-gray-500">
                        Added on {new Date(entry.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleLeaveWaitlist(entry.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">You are not on any waitlists</p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}