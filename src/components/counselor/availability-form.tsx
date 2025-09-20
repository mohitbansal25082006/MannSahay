// E:\mannsahay\src\components\counselor\availability-form.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Clock } from 'lucide-react';

interface AvailabilitySlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export default function AvailabilityForm() {
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [newSlot, setNewSlot] = useState({
    dayOfWeek: '',
    startTime: '',
    endTime: ''
  });
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
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      // This would be an actual API call in a real implementation
      // const response = await fetch('/api/counselors/current-counselor/availability');
      // const data = await response.json();
      
      // Mock data for demonstration
      const mockAvailabilitySlots: AvailabilitySlot[] = [
        { id: '1', dayOfWeek: 1, startTime: '09:00', endTime: '09:50' },
        { id: '2', dayOfWeek: 1, startTime: '10:00', endTime: '10:50' },
        { id: '3', dayOfWeek: 2, startTime: '14:00', endTime: '14:50' },
        { id: '4', dayOfWeek: 3, startTime: '09:00', endTime: '09:50' }
      ];
      
      setAvailabilitySlots(mockAvailabilitySlots);
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async () => {
    if (!newSlot.dayOfWeek || !newSlot.startTime || !newSlot.endTime) return;
    
    try {
      // This would be an actual API call in a real implementation
      // await fetch('/api/counselors/current-counselor/availability', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     dayOfWeek: parseInt(newSlot.dayOfWeek),
      //     startTime: newSlot.startTime,
      //     endTime: newSlot.endTime
      //   })
      // });
      
      // Add to local state
      setAvailabilitySlots([
        ...availabilitySlots,
        {
          id: Date.now().toString(),
          dayOfWeek: parseInt(newSlot.dayOfWeek),
          startTime: newSlot.startTime,
          endTime: newSlot.endTime
        }
      ]);
      
      // Reset form
      setNewSlot({ dayOfWeek: '', startTime: '', endTime: '' });
    } catch (error) {
      console.error('Error adding availability slot:', error);
    }
  };

  const handleRemoveSlot = async (slotId: string) => {
    try {
      // This would be an actual API call in a real implementation
      // await fetch(`/api/counselors/current-counselor/availability/${slotId}`, {
      //   method: 'DELETE'
      // });
      
      // Remove from local state
      setAvailabilitySlots(availabilitySlots.filter(slot => slot.id !== slotId));
    } catch (error) {
      console.error('Error removing availability slot:', error);
    }
  };

  const getDayName = (day: number) => {
    return daysOfWeek.find(d => d.value === day.toString())?.label || 'Unknown';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Manage Availability
        </CardTitle>
        <CardDescription>
          Set your available time slots for client bookings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Day
            </label>
            <Select value={newSlot.dayOfWeek} onValueChange={(value) => setNewSlot({...newSlot, dayOfWeek: value})}>
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
              Start Time
            </label>
            <Input
              type="time"
              value={newSlot.startTime}
              onChange={(e) => setNewSlot({...newSlot, startTime: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Time
            </label>
            <Input
              type="time"
              value={newSlot.endTime}
              onChange={(e) => setNewSlot({...newSlot, endTime: e.target.value})}
            />
          </div>
          
          <div className="flex items-end">
            <Button onClick={handleAddSlot} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Slot
            </Button>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4">Current Availability</h3>
          
          {loading ? (
            <div className="text-center py-4">Loading availability...</div>
          ) : availabilitySlots.length > 0 ? (
            <div className="space-y-3">
              {availabilitySlots
                .sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime))
                .map(slot => (
                  <div key={slot.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                    <div className="flex items-center">
                      <Badge variant="outline" className="mr-3">
                        {getDayName(slot.dayOfWeek)}
                      </Badge>
                      <span>{slot.startTime} - {slot.endTime}</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRemoveSlot(slot.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              }
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No availability slots set
            </div>
          )}
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-lg font-medium mb-2">Settings</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox id="buffer-time" defaultChecked />
              <label htmlFor="buffer-time" className="text-sm">
                Add 15-minute buffer between sessions
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="max-sessions" defaultChecked />
              <label htmlFor="max-sessions" className="text-sm">
                Limit to 8 sessions per day
              </label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}