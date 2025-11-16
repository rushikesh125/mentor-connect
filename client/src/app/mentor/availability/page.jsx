'use client';

import { useEffect, useState } from 'react';
import { MentorLayout } from '@/components/layout/mentor-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Plus, X, Loader, Save } from 'lucide-react';
import { getMyMentorProfile, updateAvailability } from '@/lib/api/mentors';
import { formatDateTime } from '@/lib/utils/date';
import toast from 'react-hot-toast';

export default function AvailabilityPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availability, setAvailability] = useState([]);
  const [newSlot, setNewSlot] = useState('');
  
  useEffect(() => {
    loadAvailability();
  }, []);
  
  const loadAvailability = async () => {
    try {
      const profile = await getMyMentorProfile();
      setAvailability(profile?.availability || []);
    } catch (error) {
      toast.error('Failed to load availability');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddSlot = () => {
    if (!newSlot) {
      toast.error('Please select a date and time');
      return;
    }
    
    const dateTime = new Date(newSlot).toISOString();
    
    // Check if past
    if (new Date(dateTime) < new Date()) {
      toast.error('Cannot add past time slots');
      return;
    }
    
    // Check if already exists
    if (availability.includes(dateTime)) {
      toast.error('This time slot already exists');
      return;
    }
    
    setAvailability([...availability, dateTime].sort());
    setNewSlot('');
    toast.success('Time slot added');
  };
  
  const handleRemoveSlot = (slot) => {
    setAvailability(availability.filter(s => s !== slot));
    toast.success('Time slot removed');
  };
  
  const handleSave = async () => {
    if (availability.length === 0) {
      toast.error('Please add at least one availability slot');
      return;
    }
    
    setSaving(true);
    try {
      await updateAvailability(availability);
      toast.success('Availability updated successfully!');
    } catch (error) {
      toast.error('Failed to update availability');
    } finally {
      setSaving(false);
    }
  };
  
  const handleQuickAdd = (hours) => {
    const slots = [];
    const now = new Date();
    
    for (let i = 1; i <= 7; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      date.setHours(hours, 0, 0, 0);
      
      const dateTime = date.toISOString();
      if (!availability.includes(dateTime)) {
        slots.push(dateTime);
      }
    }
    
    if (slots.length > 0) {
      setAvailability([...availability, ...slots].sort());
      toast.success(`Added ${slots.length} time slots`);
    } else {
      toast.info('These slots already exist');
    }
  };
  
  if (loading) {
    return (
      <MentorLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader className="animate-spin h-12 w-12 text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading availability...</p>
          </div>
        </div>
      </MentorLayout>
    );
  }
  
  return (
    <MentorLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Availability</h1>
          <p className="text-gray-600">
            Set your available time slots for mentoring sessions
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Add Slots */}
          <div className="lg:col-span-2 space-y-6">
            {/* Add New Slot */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus size={20} />
                  Add Time Slot
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="newSlot">Select Date & Time</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="newSlot"
                      type="datetime-local"
                      value={newSlot}
                      onChange={(e) => setNewSlot(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                    />
                    <Button onClick={handleAddSlot}>
                      <Plus size={16} />
                    </Button>
                  </div>
                </div>
                
                {/* Quick Add */}
                <div>
                  <Label>Quick Add (Next 7 Days)</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleQuickAdd(10)}
                    >
                      10:00 AM
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleQuickAdd(14)}
                    >
                      2:00 PM
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleQuickAdd(16)}
                    >
                      4:00 PM
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleQuickAdd(18)}
                    >
                      6:00 PM
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Adds the same time for the next 7 days
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {/* Current Availability */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Calendar size={20} />
                    Your Availability ({availability.length})
                  </span>
                  <Button 
                    onClick={handleSave}
                    disabled={saving}
                    size="sm"
                  >
                    {saving ? (
                      <>
                        <Loader className="animate-spin mr-2" size={16} />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} className="mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {availability.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {availability.map((slot, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Clock size={16} className="text-purple-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {formatDateTime(slot)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(slot) < new Date() ? 'Past' : 'Available'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveSlot(slot)}
                          className="text-red-600 hover:text-red-700 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar size={40} className="mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-600 mb-2">No availability set</p>
                    <p className="text-sm text-gray-500">
                      Add time slots to let students book sessions with you
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Right Column - Tips */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-purple-900 mb-3">💡 Tips</h3>
                <ul className="space-y-2 text-sm text-purple-800">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-0.5">•</span>
                    <span>Add multiple time slots to give students flexibility</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-0.5">•</span>
                    <span>Use quick add for recurring availability</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-0.5">•</span>
                    <span>Remove past slots to keep your calendar clean</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-0.5">•</span>
                    <span>Update regularly to reflect your schedule</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Slots</span>
                  <Badge variant="secondary">{availability.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Upcoming</span>
                  <Badge variant="secondary">
                    {availability.filter(s => new Date(s) > new Date()).length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Past</span>
                  <Badge variant="secondary">
                    {availability.filter(s => new Date(s) < new Date()).length}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MentorLayout>
  );
}
