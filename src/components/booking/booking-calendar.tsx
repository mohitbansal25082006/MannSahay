'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';

interface TimeSlot {
  id: string;
  dayOfWeek: number;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isBooked: boolean;
}

interface SelectedSlot extends TimeSlot {
  dateTime: Date;
}

interface BookingCalendarProps {
  counselorId: string;
  onSlotSelect: (slot: SelectedSlot) => void;
}

export default function BookingCalendar({ counselorId, onSlotSelect }: BookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  useEffect(() => {
    if (counselorId) {
      fetchAvailability();
    }
  }, [counselorId]);

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/counselors/${counselorId}/availability`);
      if (response.ok) {
        const data = await response.json();
        setAvailableSlots(data);
      } else {
        console.error('Failed to fetch availability');
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    if (!selectedDate) return;
    
    // Create a proper DateTime object for the selected slot
    const slotDateTime = new Date(selectedDate);
    const [hours, minutes] = slot.startTime.split(':');
    slotDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    onSlotSelect({
      ...slot,
      dateTime: slotDateTime
    });
  };

  const getSlotsForDate = (date: Date) => {
    const dayOfWeek = date.getDay();
    return availableSlots.filter(slot => slot.dayOfWeek === dayOfWeek && !slot.isBooked);
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-16 border border-gray-200 bg-gray-50"></div>);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isSelected = selectedDate && 
        selectedDate.getDate() === day && 
        selectedDate.getMonth() === month && 
        selectedDate.getFullYear() === year;
      
      const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
      const slots = getSlotsForDate(date);
      const hasSlots = slots.length > 0;
      
      days.push(
        <div
          key={`day-${day}`}
          className={`h-16 border border-gray-200 p-1 cursor-pointer transition-colors ${
            isSelected ? 'bg-blue-100 border-blue-300' : 
            hasSlots ? 'hover:bg-gray-50' : 
            'bg-gray-50'
          } ${isPast ? 'opacity-50' : ''}`}
          onClick={() => !isPast && handleDateSelect(date)}
        >
          <div className="flex flex-col h-full">
            <div className="text-right text-sm font-medium">{day}</div>
            {hasSlots && (
              <div className="flex-1 flex items-center justify-center">
                <Badge variant="outline" className="text-xs">
                  {slots.length} slots
                </Badge>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return days;
  };

  const renderTimeSlots = () => {
    if (!selectedDate) return null;
    
    const slots = getSlotsForDate(selectedDate);
    
    if (slots.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No available slots for this date
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {slots.map((slot) => (
          <Button
            key={slot.id}
            variant="outline"
            className="flex flex-col items-center h-auto py-3"
            onClick={() => handleSlotSelect(slot)}
          >
            <Clock className="h-4 w-4 mb-1" />
            <span>{slot.startTime}</span>
          </Button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handlePrevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {daysOfWeek.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
            {renderCalendar()}
          </div>
        </CardContent>
      </Card>
      
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle>
              Available slots for {selectedDate.toLocaleDateString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading available slots...</div>
            ) : (
              renderTimeSlots()
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}