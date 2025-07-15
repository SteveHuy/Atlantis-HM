'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Save, AlertTriangle, ArrowLeft, Edit, CheckCircle, X, Plus } from 'lucide-react';
import { sessionManager, type UserSession } from '@/lib/epic3-mock-data';
import { 
  serviceProviderDataManager, 
  mockProviders, 
  type Provider, 
  type TimeSlot, 
  type ScheduleDate 
} from '@/lib/service-provider-mock-data';
import { updateProviderSchedulesSchema } from '@/lib/service-provider-validation';

interface EditableTimeSlot extends TimeSlot {
  isEditing?: boolean;
  hasChanges?: boolean;
}

interface EditableScheduleDate extends Omit<ScheduleDate, 'timeSlots'> {
  timeSlots: EditableTimeSlot[];
}

export default function UpdateProviderSchedulesPage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form state
  const [selectedProviderId, setSelectedProviderId] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [scheduleData, setScheduleData] = useState<EditableScheduleDate[]>([]);
  const [originalScheduleData, setOriginalScheduleData] = useState<EditableScheduleDate[]>([]);
  
  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showConflictWarning, setShowConflictWarning] = useState(false);
  const [conflictDetails, setConflictDetails] = useState('');

  useEffect(() => {
    const userSession = sessionManager.getSession();
    
    if (!userSession || userSession.role !== 'provider') {
      router.push('/provider/login');
      return;
    }
    
    setSession(userSession);
    setIsLoading(false);
  }, [router]);

  const loadProviderSchedule = async (providerId: string) => {
    const provider = mockProviders.find(p => p.id === providerId);
    if (!provider) return;

    setSelectedProvider(provider);
    
    // Generate schedule for next 7 days
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const schedules = serviceProviderDataManager.generateScheduleForProvider(
      providerId,
      startDate,
      endDate
    );

    const editableSchedules: EditableScheduleDate[] = schedules.map(schedule => ({
      ...schedule,
      timeSlots: schedule.timeSlots.map(slot => ({
        ...slot,
        isEditing: false,
        hasChanges: false
      }))
    }));

    setScheduleData(editableSchedules);
    setOriginalScheduleData(JSON.parse(JSON.stringify(editableSchedules)));
    setHasUnsavedChanges(false);
  };

  const handleProviderChange = (providerId: string) => {
    if (hasUnsavedChanges) {
      const confirmChange = window.confirm(
        'You have unsaved changes. Are you sure you want to switch providers? Your changes will be lost.'
      );
      if (!confirmChange) return;
    }

    setSelectedProviderId(providerId);
    if (providerId) {
      loadProviderSchedule(providerId);
    } else {
      setSelectedProvider(null);
      setScheduleData([]);
      setOriginalScheduleData([]);
      setHasUnsavedChanges(false);
    }
  };

  const startEditingSlot = (dateIndex: number, slotIndex: number) => {
    const updatedSchedules = [...scheduleData];
    updatedSchedules[dateIndex].timeSlots[slotIndex].isEditing = true;
    setScheduleData(updatedSchedules);
  };

  const cancelEditingSlot = (dateIndex: number, slotIndex: number) => {
    const updatedSchedules = [...scheduleData];
    const originalSlot = originalScheduleData[dateIndex].timeSlots[slotIndex];
    
    // Restore original values
    updatedSchedules[dateIndex].timeSlots[slotIndex] = {
      ...originalSlot,
      isEditing: false,
      hasChanges: false
    };
    
    setScheduleData(updatedSchedules);
    checkForUnsavedChanges(updatedSchedules);
  };

  const updateSlot = (dateIndex: number, slotIndex: number, field: keyof TimeSlot, value: any) => {
    const updatedSchedules = [...scheduleData];
    const slot = updatedSchedules[dateIndex].timeSlots[slotIndex];
    
    (slot as any)[field] = value;
    slot.hasChanges = true;
    
    setScheduleData(updatedSchedules);
    checkForUnsavedChanges(updatedSchedules);
  };

  const saveSlotChanges = (dateIndex: number, slotIndex: number) => {
    const updatedSchedules = [...scheduleData];
    const slot = updatedSchedules[dateIndex].timeSlots[slotIndex];
    
    // Validate time slot
    const startTime = new Date(`2000-01-01T${slot.startTime}:00`);
    const endTime = new Date(`2000-01-01T${slot.endTime}:00`);
    
    if (endTime <= startTime) {
      setSaveError('End time must be after start time');
      return;
    }
    
    slot.isEditing = false;
    setScheduleData(updatedSchedules);
    setSaveError('');
  };

  const addNewTimeSlot = (dateIndex: number) => {
    const updatedSchedules = [...scheduleData];
    const existingSlots = updatedSchedules[dateIndex].timeSlots;
    
    // Find next available time slot
    const lastSlot = existingSlots[existingSlots.length - 1];
    const lastEndTime = lastSlot ? lastSlot.endTime : '09:00';
    const [hours, minutes] = lastEndTime.split(':').map(Number);
    const newStartTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    const newEndTime = `${String(hours + 1).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    
    const newSlot: EditableTimeSlot = {
      id: `slot-new-${Date.now()}`,
      startTime: newStartTime,
      endTime: newEndTime,
      status: 'available',
      isEditing: true,
      hasChanges: true
    };
    
    updatedSchedules[dateIndex].timeSlots.push(newSlot);
    setScheduleData(updatedSchedules);
    checkForUnsavedChanges(updatedSchedules);
  };

  const removeTimeSlot = (dateIndex: number, slotIndex: number) => {
    const updatedSchedules = [...scheduleData];
    updatedSchedules[dateIndex].timeSlots.splice(slotIndex, 1);
    setScheduleData(updatedSchedules);
    checkForUnsavedChanges(updatedSchedules);
  };

  const checkForUnsavedChanges = (schedules: EditableScheduleDate[]) => {
    const hasChanges = schedules.some(schedule =>
      schedule.timeSlots.some(slot => slot.hasChanges)
    );
    setHasUnsavedChanges(hasChanges);
  };

  const validateScheduleConflicts = (schedules: EditableScheduleDate[]): { hasConflicts: boolean; details: string } => {
    for (const schedule of schedules) {
      const sortedSlots = schedule.timeSlots
        .filter(slot => !slot.isEditing)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
      
      for (let i = 0; i < sortedSlots.length - 1; i++) {
        const currentSlot = sortedSlots[i];
        const nextSlot = sortedSlots[i + 1];
        
        if (currentSlot.endTime > nextSlot.startTime) {
          return {
            hasConflicts: true,
            details: `Overlapping time slots on ${schedule.date}: ${currentSlot.startTime}-${currentSlot.endTime} and ${nextSlot.startTime}-${nextSlot.endTime}`
          };
        }
      }
    }
    
    return { hasConflicts: false, details: '' };
  };

  const handleSaveChanges = async () => {
    setSaveError('');
    setSaveSuccess(false);
    setIsSaving(true);

    try {
      // Validate for conflicts
      const conflictValidation = validateScheduleConflicts(scheduleData);
      if (conflictValidation.hasConflicts) {
        setConflictDetails(conflictValidation.details);
        setShowConflictWarning(true);
        setIsSaving(false);
        return;
      }

      // Prepare schedule updates
      const scheduleUpdates = scheduleData.map(schedule => ({
        date: schedule.date,
        timeSlots: schedule.timeSlots.map(slot => ({
          id: slot.id,
          startTime: slot.startTime,
          endTime: slot.endTime,
          status: slot.status,
          notes: slot.notes
        }))
      }));

      // Validate with schema
      const validationResult = updateProviderSchedulesSchema.safeParse({
        providerId: selectedProviderId,
        scheduleUpdates,
        reason: 'Schedule update via provider portal'
      });

      if (!validationResult.success) {
        const errors = validationResult.error.issues.map(e => e.message).join(', ');
        setSaveError(errors);
        setIsSaving(false);
        return;
      }

      // Update the schedule
      const success = serviceProviderDataManager.updateProviderSchedule(
        selectedProviderId,
        { dates: scheduleUpdates as any }
      );

      if (success) {
        setSaveSuccess(true);
        setHasUnsavedChanges(false);
        
        // Update original data to reflect saved state
        const updatedOriginal = scheduleData.map(schedule => ({
          ...schedule,
          timeSlots: schedule.timeSlots.map(slot => ({
            ...slot,
            hasChanges: false,
            isEditing: false
          }))
        }));
        setOriginalScheduleData(updatedOriginal);
        setScheduleData(updatedOriginal);

        // Auto-hide success message after 3 seconds
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError('Failed to update schedule. Please try again.');
      }

    } catch (error: any) {
      if (error.message === 'Conflict in schedule, please resolve') {
        setConflictDetails('Overlapping time slots detected. Please resolve conflicts before saving.');
        setShowConflictWarning(true);
      } else {
        setSaveError('An error occurred while saving. Please try again.');
      }
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getSlotStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'booked':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'blocked':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (hasUnsavedChanges) {
                    const confirmLeave = window.confirm('You have unsaved changes. Are you sure you want to leave?');
                    if (!confirmLeave) return;
                  }
                  router.push('/provider/dashboard');
                }}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-blue-600">Update Provider Schedules</h1>
            </div>
            
            <div className="flex items-center gap-4">
              {hasUnsavedChanges && (
                <span className="text-sm text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  Unsaved changes
                </span>
              )}
              <span className="text-sm text-gray-600">
                {session.fullName}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Provider Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-600" />
              Provider Schedule Management
            </CardTitle>
            <CardDescription>
              Select a provider to view and update their schedule
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-md">
              <label htmlFor="provider" className="block text-sm font-medium text-gray-700 mb-2">
                Select Provider *
              </label>
              <select
                id="provider"
                value={selectedProviderId}
                onChange={(e) => handleProviderChange(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a provider...</option>
                {mockProviders.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name} - {provider.specialty}
                  </option>
                ))}
              </select>
            </div>

            {selectedProvider && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-blue-900">{selectedProvider.name}</h3>
                <p className="text-sm text-blue-700">
                  {selectedProvider.specialty} • {selectedProvider.email} • {selectedProvider.phone}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Success Message */}
        {saveSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800">Provider schedule updated successfully!</span>
          </div>
        )}

        {/* Error Message */}
        {saveError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{saveError}</span>
          </div>
        )}

        {/* Conflict Warning */}
        {showConflictWarning && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <span className="font-medium text-amber-800">Conflict in schedule, please resolve</span>
            </div>
            <p className="text-sm text-amber-700 mb-3">{conflictDetails}</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowConflictWarning(false)}
              className="border-amber-300 text-amber-700 hover:bg-amber-100"
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* Schedule Display */}
        {scheduleData.length > 0 && (
          <>
            <div className="space-y-6">
              {scheduleData.map((schedule, dateIndex) => (
                <Card key={schedule.date}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        {new Date(schedule.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </CardTitle>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addNewTimeSlot(dateIndex)}
                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Slot
                      </Button>
                    </div>
                    <CardDescription>
                      {schedule.timeSlots.length} time slot{schedule.timeSlots.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {schedule.timeSlots.map((slot, slotIndex) => (
                        <div
                          key={slot.id}
                          className={`
                            p-4 border rounded-lg transition-all
                            ${slot.hasChanges ? 'border-amber-300 bg-amber-50' : 'border-gray-200'}
                            ${slot.isEditing ? 'ring-2 ring-blue-500' : ''}
                          `}
                        >
                          {slot.isEditing ? (
                            /* Editing Mode */
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Start Time
                                  </label>
                                  <input
                                    type="time"
                                    value={slot.startTime}
                                    onChange={(e) => updateSlot(dateIndex, slotIndex, 'startTime', e.target.value)}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    End Time
                                  </label>
                                  <input
                                    type="time"
                                    value={slot.endTime}
                                    onChange={(e) => updateSlot(dateIndex, slotIndex, 'endTime', e.target.value)}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                  </label>
                                  <select
                                    value={slot.status}
                                    onChange={(e) => updateSlot(dateIndex, slotIndex, 'status', e.target.value)}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value="available">Available</option>
                                    <option value="blocked">Blocked</option>
                                    <option value="booked" disabled>Booked (Cannot Edit)</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Notes
                                  </label>
                                  <input
                                    type="text"
                                    value={slot.notes || ''}
                                    onChange={(e) => updateSlot(dateIndex, slotIndex, 'notes', e.target.value)}
                                    placeholder="Optional notes..."
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => saveSlotChanges(dateIndex, slotIndex)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => cancelEditingSlot(dateIndex, slotIndex)}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Cancel
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => removeTimeSlot(dateIndex, slotIndex)}
                                  className="text-red-600 border-red-600 hover:bg-red-50"
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Remove
                                </Button>
                              </div>
                            </div>
                          ) : (
                            /* Display Mode */
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-gray-600" />
                                  <span className="font-medium">
                                    {slot.startTime} - {slot.endTime}
                                  </span>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSlotStatusColor(slot.status)}`}>
                                  {slot.status}
                                </div>
                                {slot.notes && (
                                  <span className="text-sm text-gray-600 italic">
                                    {slot.notes}
                                  </span>
                                )}
                                {slot.hasChanges && (
                                  <span className="text-xs text-amber-600 font-medium">
                                    • Modified
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-2">
                                {slot.status !== 'booked' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => startEditingSlot(dateIndex, slotIndex)}
                                  >
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => removeTimeSlot(dateIndex, slotIndex)}
                                  className="text-red-600 border-red-600 hover:bg-red-50"
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Remove
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Save Changes Button */}
            {hasUnsavedChanges && (
              <Card className="mt-8">
                <CardContent className="text-center py-6">
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2 text-amber-600">
                      <AlertTriangle className="h-5 w-5" />
                      <span className="font-medium">You have unsaved changes</span>
                    </div>
                    <Button
                      onClick={handleSaveChanges}
                      disabled={isSaving}
                      className="bg-blue-600 hover:bg-blue-700"
                      size="lg"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving Changes...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Breadcrumb Navigation */}
            <Card className="mt-8">
              <CardContent className="text-center py-4">
                <Button
                  variant="outline"
                  onClick={() => router.push('/provider/appointment-schedules')}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Appointment Calendar
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}