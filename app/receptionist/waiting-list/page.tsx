'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Epic5MockDataManager,
  type WaitlistEntry,
  mockProviders,
  mockServices
} from '@/lib/epic5-mock-data';
import {
  waitlistEntrySchema,
  type WaitlistEntryData,
  sanitizeInput,
  validatePatientId
} from '@/lib/epic5-validation';
import {
  ArrowLeft,
  Clock,
  Plus,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  Calendar,
  Trash2,
  Users
} from 'lucide-react';

export default function WaitingListPage() {
  const router = useRouter();
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isFullyBooked, setIsFullyBooked] = useState(false);

  const [formData, setFormData] = useState<WaitlistEntryData>({
    patientId: '',
    preferredProvider: '',
    preferredService: '',
    startDate: '',
    endDate: '',
    timePreferences: []
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [selectedTimePrefs, setSelectedTimePrefs] = useState<string[]>([]);

  const timePreferenceOptions = [
    'Early Morning (8:00-10:00 AM)',
    'Late Morning (10:00 AM-12:00 PM)',
    'Early Afternoon (12:00-2:00 PM)',
    'Late Afternoon (2:00-4:00 PM)',
    'Evening (4:00-5:00 PM)'
  ];

  useEffect(() => {
    // Check if user is logged in as receptionist
    // const userSession = localStorage.getItem('receptionistSession');
    // if (!userSession) {
    //   router.push('/receptionist/login');
    //   return;
    // }

    loadWaitlistEntries();

    // Check if current schedule is fully booked (mock logic)
    const currentHour = new Date().getHours();
    setIsFullyBooked(currentHour % 2 === 0); // Mock: fully booked every even hour
  }, [router]);

  const loadWaitlistEntries = () => {
    const entries = Epic5MockDataManager.getWaitlistEntries();
    setWaitlistEntries(entries);
  };

  const handleInputChange = (field: keyof WaitlistEntryData, value: string | string[]) => {
    const sanitizedValue = Array.isArray(value) ? value : sanitizeInput(value);
    setFormData(prev => ({
      ...prev,
      [field]: sanitizedValue
    }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleTimePreferenceToggle = (preference: string) => {
    const newPrefs = selectedTimePrefs.includes(preference)
      ? selectedTimePrefs.filter(p => p !== preference)
      : [...selectedTimePrefs, preference];

    setSelectedTimePrefs(newPrefs);
    handleInputChange('timePreferences', newPrefs);
  };

  const validateForm = (): boolean => {
    try {
      waitlistEntrySchema.parse(formData);

      // Additional validation
      if (!validatePatientId(formData.patientId)) {
        setValidationErrors({ patientId: 'Patient ID must be in format P001-P999999' });
        return false;
      }

      setValidationErrors({});
      return true;

    } catch (error: any) {
      const errors: Record<string, string> = {};
      error.issues?.forEach((err: any) => {
        if (err.path) {
          errors[err.path[0]] = err.message;
        }
      });
      setValidationErrors(errors);
      return false;
    }
  };

  const handleAddToWaitlist = async () => {
    if (!validateForm()) {
      setMessage({ type: 'error', text: 'Please fix validation errors before adding to waitlist' });
      return;
    }

    setIsLoading(true);

    try {
      const { startDate, endDate, ...restFormData } = formData;
      const newEntry = Epic5MockDataManager.addToWaitlist({
        ...restFormData,
        dateRange: {
          start: startDate,
          end: endDate
        },
        patientName: `Patient ${formData.patientId}`, // Mock patient name lookup
        patientPhone: '(555) 000-0000', // Mock patient phone lookup
        notified: false,
        status: 'active'
      });

      setWaitlistEntries(prev => [...prev, newEntry]);

      setMessage({
        type: 'success',
        text: `Patient ${formData.patientId} added to waiting list successfully. They are position #${newEntry.position} and will be notified when a slot becomes available.`
      });

      // Simulate automatic patient notification
      setTimeout(() => {
        setMessage(prev => prev ? {
          ...prev,
          text: prev.text + ' Notification sent to patient via SMS/email.'
        } : null);
      }, 1000);

      // Reset form
      setFormData({
        patientId: '',
        preferredProvider: '',
        preferredService: '',
        startDate: '',
        endDate: '',
        timePreferences: []
      });
      setSelectedTimePrefs([]);
      setShowAddForm(false);

    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to add patient to waiting list. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromWaitlist = async (entryId: string) => {
    const confirmed = window.confirm('Are you sure you want to remove this patient from the waiting list?');

    if (confirmed) {
      // Mock removal logic
      setWaitlistEntries(prev => prev.filter(entry => entry.id !== entryId));
      setMessage({
        type: 'success',
        text: 'Patient removed from waiting list. They have been notified.'
      });
    }
  };

  const simulateSlotAvailable = (entryId: string) => {
    // Mock slot becoming available
    const entry = waitlistEntries.find(e => e.id === entryId);
    if (entry) {
      setMessage({
        type: 'success',
        text: `Slot available for ${entry.patientName}! They have been notified and have 24 hours to confirm.`
      });

      // Update entry status
      setWaitlistEntries(prev => prev.map(e =>
        e.id === entryId ? { ...e, status: 'notified', notified: true } : e
      ));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'notified': return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'expired': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysWaiting = (addedAt: string) => {
    const addedDate = new Date(addedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - addedDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day';
    return `${diffDays} days`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/receptionist/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Add to Waiting List</h1>
                <p className="text-gray-600">Manage patient waiting list for appointments</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isFullyBooked && (
                <Alert className="w-auto bg-orange-50 border-orange-200">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    Schedule fully booked
                  </AlertDescription>
                </Alert>
              )}
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!isFullyBooked}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add to Waiting List
              </Button>
            </div>
          </div>
        </div>

        {message && (
          <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
            {message.type === 'error' ?
              <XCircle className="h-4 w-4 text-red-600" /> :
              <CheckCircle className="h-4 w-4 text-green-600" />
            }
            <AlertDescription className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {!isFullyBooked && !showAddForm && (
          <Card className="mb-6">
            <CardContent className="py-8">
              <div className="text-center">
                <Calendar className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Appointments Available</h3>
                <p className="text-gray-600 mb-4">
                  There are currently available appointment slots. Patients can book directly without joining the waiting list.
                </p>
                <Button
                  onClick={() => router.push('/receptionist/appointment-calendar')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Go to Appointment Calendar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="current" className="space-y-6">
          <TabsList>
            <TabsTrigger value="current">Current Waiting List ({waitlistEntries.length})</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Waiting List Entries</span>
                  <Badge variant="outline">
                    {waitlistEntries.filter(e => e.status === 'active').length} Active
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {waitlistEntries.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No patients on waiting list</p>
                    <p className="text-gray-400 text-sm">Patients will appear here when appointments are fully booked</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {waitlistEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                              #{entry.position}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-500" />
                                <span className="font-semibold">{entry.patientName}</span>
                                <Badge variant="outline">ID: {entry.patientId}</Badge>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                <Phone className="h-3 w-3" />
                                {entry.patientPhone}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(entry.status)}>
                              {entry.status.toUpperCase()}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {getDaysWaiting(entry.addedAt)} waiting
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">Preferred Provider:</span>
                            <div>{entry.preferredProvider}</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Preferred Service:</span>
                            <div>{entry.preferredService}</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Date Range:</span>
                            <div>
                              {formatDate(entry.dateRange.start)} - {formatDate(entry.dateRange.end)}
                            </div>
                          </div>
                        </div>

                        <div className="mt-3">
                          <span className="font-medium text-gray-600 text-sm">Time Preferences:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {entry.timePreferences.map((pref, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {pref}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-between items-center mt-4 pt-3 border-t">
                          <div className="text-xs text-gray-500">
                            Added: {new Date(entry.addedAt).toLocaleString()}
                          </div>
                          <div className="flex gap-2">
                            {entry.status === 'active' && (
                              <Button
                                onClick={() => simulateSlotAvailable(entry.id)}
                                variant="outline"
                                size="sm"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Notify Available
                              </Button>
                            )}
                            <Button
                              onClick={() => handleRemoveFromWaitlist(entry.id)}
                              variant="outline"
                              size="sm"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total Entries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{waitlistEntries.length}</div>
                  <p className="text-sm text-gray-600">Patients on waiting list</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active Entries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {waitlistEntries.filter(e => e.status === 'active').length}
                  </div>
                  <p className="text-sm text-gray-600">Currently waiting</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Avg. Wait Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">3.2</div>
                  <p className="text-sm text-gray-600">Days average wait</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Popular Providers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockProviders.slice(0, 3).map((provider, index) => (
                    <div key={provider.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{provider.name}</div>
                        <div className="text-sm text-gray-600">{provider.specialty}</div>
                      </div>
                      <Badge variant="outline">
                        {waitlistEntries.filter(e => e.preferredProvider === provider.name).length} waiting
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add to Waiting List Form */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Add Patient to Waiting List</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="patientId">Patient ID *</Label>
                    <Input
                      id="patientId"
                      value={formData.patientId}
                      onChange={(e) => handleInputChange('patientId', e.target.value)}
                      placeholder="P001"
                      className={validationErrors.patientId ? 'border-red-500' : ''}
                    />
                    {validationErrors.patientId && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.patientId}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="preferredProvider">Preferred Provider *</Label>
                      <select
                        id="preferredProvider"
                        value={formData.preferredProvider}
                        onChange={(e) => handleInputChange('preferredProvider', e.target.value)}
                        className={`w-full p-2 border rounded-md ${validationErrors.preferredProvider ? 'border-red-500' : ''}`}
                      >
                        <option value="">Select Provider</option>
                        {mockProviders.map((provider) => (
                          <option key={provider.id} value={provider.name}>
                            {provider.name} - {provider.specialty}
                          </option>
                        ))}
                      </select>
                      {validationErrors.preferredProvider && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.preferredProvider}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="preferredService">Preferred Service *</Label>
                      <select
                        id="preferredService"
                        value={formData.preferredService}
                        onChange={(e) => handleInputChange('preferredService', e.target.value)}
                        className={`w-full p-2 border rounded-md ${validationErrors.preferredService ? 'border-red-500' : ''}`}
                      >
                        <option value="">Select Service</option>
                        {mockServices.map((service) => (
                          <option key={service} value={service}>{service}</option>
                        ))}
                      </select>
                      {validationErrors.preferredService && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.preferredService}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Desired Start Date *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className={validationErrors.startDate ? 'border-red-500' : ''}
                      />
                      {validationErrors.startDate && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.startDate}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="endDate">Desired End Date *</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => handleInputChange('endDate', e.target.value)}
                        min={formData.startDate || new Date().toISOString().split('T')[0]}
                        className={validationErrors.endDate ? 'border-red-500' : ''}
                      />
                      {validationErrors.endDate && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.endDate}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label>Time Preferences *</Label>
                    <p className="text-sm text-gray-600 mb-3">Select at least one preferred time range</p>
                    <div className="space-y-2">
                      {timePreferenceOptions.map((option) => (
                        <label key={option} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedTimePrefs.includes(option)}
                            onChange={() => handleTimePreferenceToggle(option)}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                    {validationErrors.timePreferences && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.timePreferences}</p>
                    )}
                  </div>

                  {Object.keys(validationErrors).length > 0 && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        Please fix the validation errors above before continuing.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={() => {
                      setShowAddForm(false);
                      setFormData({
                        patientId: '',
                        preferredProvider: '',
                        preferredService: '',
                        startDate: '',
                        endDate: '',
                        timePreferences: []
                      });
                      setSelectedTimePrefs([]);
                      setValidationErrors({});
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddToWaitlist}
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? 'Adding...' : 'Add to Waiting List'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
