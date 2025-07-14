'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Epic5MockDataManager, 
  type CalendarAppointment,
  mockProviders,
  mockServices,
  mockLocations
} from '@/lib/epic5-mock-data';
import { 
  calendarAppointmentSchema, 
  calendarFilterSchema,
  type CalendarAppointmentData,
  type CalendarFilterData,
  sanitizeInput,
  validatePatientId,
  validateBusinessHours,
  validateFutureDate
} from '@/lib/epic5-validation';
import { 
  ArrowLeft, 
  Calendar, 
  Plus, 
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  User,
  Stethoscope,
  AlertCircle
} from 'lucide-react';

type CalendarView = 'day' | 'week' | 'month';

export default function AppointmentCalendarPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<CalendarAppointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<CalendarAppointment[]>([]);
  const [currentView, setCurrentView] = useState<CalendarView>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<CalendarAppointment | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showAppointmentLog, setShowAppointmentLog] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState<CalendarAppointmentData>({
    patientId: '',
    providerId: '',
    serviceType: '',
    date: '',
    time: '',
    duration: 30,
    location: '',
    notes: ''
  });
  
  // Filter states
  const [filters, setFilters] = useState<CalendarFilterData>({
    provider: '',
    service: '',
    location: '',
    startDate: '',
    endDate: '',
    view: 'week'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [draggedAppointment, setDraggedAppointment] = useState<CalendarAppointment | null>(null);

  useEffect(() => {
    // Check if user is logged in as receptionist
    const userSession = localStorage.getItem('receptionistSession');
    if (!userSession) {
      router.push('/receptionist/login');
      return;
    }

    loadAppointments();
  }, [router]);

  useEffect(() => {
    applyFilters();
  }, [appointments, filters, currentDate, currentView]);

  const loadAppointments = () => {
    const allAppointments = Epic5MockDataManager.getAllAppointments();
    setAppointments(allAppointments);
  };

  const applyFilters = () => {
    let filtered = [...appointments];
    
    // Apply provider filter
    if (filters.provider) {
      filtered = filtered.filter(apt => apt.providerName === filters.provider);
    }
    
    // Apply service filter
    if (filters.service) {
      filtered = filtered.filter(apt => apt.serviceType === filters.service);
    }
    
    // Apply location filter
    if (filters.location) {
      filtered = filtered.filter(apt => apt.location === filters.location);
    }
    
    // Apply date range filter based on current view
    const startOfView = getStartOfView(currentDate, currentView);
    const endOfView = getEndOfView(currentDate, currentView);
    
    filtered = filtered.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate >= startOfView && aptDate <= endOfView;
    });
    
    setFilteredAppointments(filtered);
  };

  const getStartOfView = (date: Date, view: CalendarView): Date => {
    const start = new Date(date);
    switch (view) {
      case 'day':
        start.setHours(0, 0, 0, 0);
        break;
      case 'week':
        start.setDate(start.getDate() - start.getDay());
        start.setHours(0, 0, 0, 0);
        break;
      case 'month':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        break;
    }
    return start;
  };

  const getEndOfView = (date: Date, view: CalendarView): Date => {
    const end = new Date(date);
    switch (view) {
      case 'day':
        end.setHours(23, 59, 59, 999);
        break;
      case 'week':
        end.setDate(end.getDate() + (6 - end.getDay()));
        end.setHours(23, 59, 59, 999);
        break;
      case 'month':
        end.setMonth(end.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
        break;
    }
    return end;
  };

  const handleInputChange = (field: keyof CalendarAppointmentData, value: string | number) => {
    const sanitizedValue = typeof value === 'string' ? sanitizeInput(value) : value;
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

  const handleFilterChange = (field: keyof CalendarFilterData, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    try {
      calendarAppointmentSchema.parse(formData);
      
      // Additional validation
      if (!validatePatientId(formData.patientId)) {
        setValidationErrors({ patientId: 'Patient ID must be in format P001-P999999' });
        return false;
      }
      
      if (!validateFutureDate(formData.date)) {
        setValidationErrors({ date: 'Appointment date cannot be in the past' });
        return false;
      }
      
      if (!validateBusinessHours(formData.time)) {
        setValidationErrors({ time: 'Appointment time must be during business hours (8:00 AM - 5:00 PM)' });
        return false;
      }
      
      setValidationErrors({});
      return true;
      
    } catch (error: any) {
      const errors: Record<string, string> = {};
      error.errors?.forEach((err: any) => {
        if (err.path) {
          errors[err.path[0]] = err.message;
        }
      });
      setValidationErrors(errors);
      return false;
    }
  };

  const checkSlotAvailability = (date: string, time: string, providerId: string, excludeId?: string): boolean => {
    const conflictingAppointments = appointments.filter(apt => 
      apt.date === date && 
      apt.providerId === providerId && 
      apt.time === time &&
      apt.status !== 'cancelled' &&
      apt.id !== excludeId
    );
    
    return conflictingAppointments.length === 0;
  };

  const handleAddAppointment = async () => {
    if (!validateForm()) {
      setMessage({ type: 'error', text: 'Please fix validation errors before scheduling' });
      return;
    }

    // Check slot availability
    const isAvailable = checkSlotAvailability(formData.date, formData.time, formData.providerId);
    if (!isAvailable) {
      setMessage({ 
        type: 'error', 
        text: 'The selected time slot is not available. Please choose a different time.' 
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const providerName = mockProviders.find(p => p.id === formData.providerId)?.name || 'Unknown Provider';
      
      const newAppointment = Epic5MockDataManager.createAppointment({
        ...formData,
        patientName: `Patient ${formData.patientId}`, // Mock patient name
        patientPhone: '(555) 000-0000', // Mock phone
        providerName,
        status: 'scheduled'
      });
      
      setAppointments(prev => [...prev, newAppointment]);
      setMessage({ 
        type: 'success', 
        text: 'Appointment scheduled successfully. Confirmation sent to patient and provider.' 
      });
      
      // Reset form
      setFormData({
        patientId: '',
        providerId: '',
        serviceType: '',
        date: '',
        time: '',
        duration: 30,
        location: '',
        notes: ''
      });
      setShowAddForm(false);
      
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to schedule appointment. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragStart = (appointment: CalendarAppointment, e: React.DragEvent) => {
    setDraggedAppointment(appointment);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (newDate: string, newTime: string, e: React.DragEvent) => {
    e.preventDefault();
    
    if (!draggedAppointment) return;
    
    // Check if new slot is available
    const isAvailable = checkSlotAvailability(newDate, newTime, draggedAppointment.providerId, draggedAppointment.id);
    if (!isAvailable) {
      setMessage({ type: 'error', text: 'Cannot reschedule: Time slot is not available' });
      setDraggedAppointment(null);
      return;
    }

    // Show confirmation dialog
    const confirmed = window.confirm(
      `Reschedule appointment for ${draggedAppointment.patientName} from ${draggedAppointment.date} ${draggedAppointment.time} to ${newDate} ${newTime}?`
    );
    
    if (confirmed) {
      const success = Epic5MockDataManager.updateAppointment(draggedAppointment.id, {
        date: newDate,
        time: newTime
      });
      
      if (success) {
        loadAppointments();
        setMessage({ 
          type: 'success', 
          text: 'Appointment rescheduled successfully. Notifications sent to patient and provider.' 
        });
      } else {
        setMessage({ type: 'error', text: 'Failed to reschedule appointment' });
      }
    }
    
    setDraggedAppointment(null);
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    const confirmed = window.confirm('Are you sure you want to cancel this appointment?');
    
    if (confirmed) {
      const success = Epic5MockDataManager.cancelAppointment(appointmentId);
      
      if (success) {
        loadAppointments();
        setMessage({ 
          type: 'success', 
          text: 'Appointment cancelled successfully. Notifications sent to patient and provider.' 
        });
        setSelectedAppointment(null);
      } else {
        setMessage({ type: 'error', text: 'Failed to cancel appointment' });
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'checked-in': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return timeString;
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    switch (currentView) {
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setCurrentDate(newDate);
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const getAppointmentsForSlot = (date: string, time: string) => {
    return filteredAppointments.filter(apt => apt.date === date && apt.time === time);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
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
              <Calendar className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Appointment Calendar</h1>
                <p className="text-gray-600">Manage appointments, scheduling, and availability</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Appointment
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

        {/* Filters */}
        {showFilters && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filter Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Provider</Label>
                  <select
                    value={filters.provider}
                    onChange={(e) => handleFilterChange('provider', e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">All Providers</option>
                    {mockProviders.map((provider) => (
                      <option key={provider.id} value={provider.name}>
                        {provider.name} - {provider.specialty}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Service</Label>
                  <select
                    value={filters.service}
                    onChange={(e) => handleFilterChange('service', e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">All Services</option>
                    {mockServices.map((service) => (
                      <option key={service} value={service}>{service}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Location</Label>
                  <select
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">All Locations</option>
                    {mockLocations.map((location) => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Calendar Controls */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button onClick={() => navigateDate('prev')} variant="outline" size="sm">
                  ← Previous
                </Button>
                <h2 className="text-xl font-semibold">
                  {formatDate(currentDate)}
                </h2>
                <Button onClick={() => navigateDate('next')} variant="outline" size="sm">
                  Next →
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => setCurrentDate(new Date())}
                  variant="outline"
                  size="sm"
                >
                  Today
                </Button>
                <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as CalendarView)}>
                  <TabsList>
                    <TabsTrigger value="day">Day</TabsTrigger>
                    <TabsTrigger value="week">Week</TabsTrigger>
                    <TabsTrigger value="month">Month</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar View */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Calendar View - {currentView.charAt(0).toUpperCase() + currentView.slice(1)}</span>
                  <span className="text-sm font-normal text-gray-500">
                    {filteredAppointments.length} appointments
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentView === 'week' && (
                  <div className="space-y-4">
                    {generateTimeSlots().map((timeSlot) => (
                      <div
                        key={timeSlot}
                        className="grid grid-cols-8 gap-2 py-2 border-b"
                        onDragOver={handleDragOver}
                      >
                        <div className="text-sm font-medium text-gray-600 text-right pr-2">
                          {formatTime(timeSlot)}
                        </div>
                        {Array.from({ length: 7 }, (_, dayOffset) => {
                          const date = new Date(getStartOfView(currentDate, 'week'));
                          date.setDate(date.getDate() + dayOffset);
                          const dateString = date.toISOString().split('T')[0];
                          const appointments = getAppointmentsForSlot(dateString, timeSlot);
                          
                          return (
                            <div
                              key={dayOffset}
                              className="min-h-[60px] border rounded-lg p-1 bg-gray-50 hover:bg-gray-100"
                              onDrop={(e) => handleDrop(dateString, timeSlot, e)}
                              onDragOver={handleDragOver}
                            >
                              {appointments.map((apt) => (
                                <div
                                  key={apt.id}
                                  draggable
                                  onDragStart={(e) => handleDragStart(apt, e)}
                                  className={`text-xs p-1 rounded cursor-move mb-1 ${getStatusColor(apt.status)}`}
                                  onClick={() => setSelectedAppointment(apt)}
                                >
                                  <div className="font-medium truncate">{apt.patientName}</div>
                                  <div className="text-[10px] truncate">{apt.providerName}</div>
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                    
                    {/* Week days header */}
                    <div className="grid grid-cols-8 gap-2 pb-2 border-b font-medium text-center text-sm sticky top-0 bg-white">
                      <div></div>
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => {
                        const date = new Date(getStartOfView(currentDate, 'week'));
                        date.setDate(date.getDate() + index);
                        return (
                          <div key={day} className="text-center">
                            <div>{day}</div>
                            <div className="text-xs text-gray-500">{date.getDate()}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {(currentView === 'day' || currentView === 'month') && (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {currentView === 'day' ? 'Day view' : 'Month view'} coming soon
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Currently showing appointments in list format below
                    </p>
                  </div>
                )}
                
                {/* Simple list view for day/month */}
                {(currentView === 'day' || currentView === 'month') && (
                  <div className="space-y-3 mt-6">
                    {filteredAppointments.map((apt) => (
                      <div
                        key={apt.id}
                        className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedAppointment(apt)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-semibold">{apt.patientName}</span>
                            <Badge className={getStatusColor(apt.status)}>
                              {apt.status}
                            </Badge>
                          </div>
                          <span className="text-sm text-gray-500">{formatTime(apt.time)}</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                          <div>Provider: {apt.providerName}</div>
                          <div>Service: {apt.serviceType}</div>
                          <div>Location: {apt.location}</div>
                          <div>Duration: {apt.duration}min</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Appointment Details Panel */}
          <div className="space-y-6">
            {selectedAppointment && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Appointment Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>Patient</Label>
                      <div className="font-medium">{selectedAppointment.patientName}</div>
                      <div className="text-sm text-gray-500">{selectedAppointment.patientPhone}</div>
                    </div>
                    
                    <div>
                      <Label>Provider</Label>
                      <div className="font-medium">{selectedAppointment.providerName}</div>
                    </div>
                    
                    <div>
                      <Label>Service Type</Label>
                      <div className="font-medium">{selectedAppointment.serviceType}</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Date</Label>
                        <div className="font-medium">{new Date(selectedAppointment.date).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <Label>Time</Label>
                        <div className="font-medium">{formatTime(selectedAppointment.time)}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Duration</Label>
                        <div className="font-medium">{selectedAppointment.duration} minutes</div>
                      </div>
                      <div>
                        <Label>Location</Label>
                        <div className="font-medium">{selectedAppointment.location}</div>
                      </div>
                    </div>
                    
                    <div>
                      <Label>Status</Label>
                      <Badge className={getStatusColor(selectedAppointment.status)}>
                        {selectedAppointment.status}
                      </Badge>
                    </div>
                    
                    {selectedAppointment.notes && (
                      <div>
                        <Label>Notes</Label>
                        <div className="text-sm bg-gray-50 p-2 rounded">{selectedAppointment.notes}</div>
                      </div>
                    )}
                    
                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={() => handleCancelAppointment(selectedAppointment.id)}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Appointments</span>
                    <span className="font-semibold">{filteredAppointments.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Scheduled</span>
                    <span className="font-semibold text-blue-600">
                      {filteredAppointments.filter(apt => apt.status === 'scheduled').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Confirmed</span>
                    <span className="font-semibold text-green-600">
                      {filteredAppointments.filter(apt => apt.status === 'confirmed').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cancelled</span>
                    <span className="font-semibold text-red-600">
                      {filteredAppointments.filter(apt => apt.status === 'cancelled').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Add Appointment Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Add New Appointment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    
                    <div>
                      <Label htmlFor="providerId">Provider *</Label>
                      <select
                        id="providerId"
                        value={formData.providerId}
                        onChange={(e) => handleInputChange('providerId', e.target.value)}
                        className={`w-full p-2 border rounded-md ${validationErrors.providerId ? 'border-red-500' : ''}`}
                      >
                        <option value="">Select Provider</option>
                        {mockProviders.map((provider) => (
                          <option key={provider.id} value={provider.id}>
                            {provider.name} - {provider.specialty}
                          </option>
                        ))}
                      </select>
                      {validationErrors.providerId && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.providerId}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="serviceType">Service Type *</Label>
                      <select
                        id="serviceType"
                        value={formData.serviceType}
                        onChange={(e) => handleInputChange('serviceType', e.target.value)}
                        className={`w-full p-2 border rounded-md ${validationErrors.serviceType ? 'border-red-500' : ''}`}
                      >
                        <option value="">Select Service</option>
                        {mockServices.map((service) => (
                          <option key={service} value={service}>{service}</option>
                        ))}
                      </select>
                      {validationErrors.serviceType && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.serviceType}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="location">Location *</Label>
                      <select
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className={`w-full p-2 border rounded-md ${validationErrors.location ? 'border-red-500' : ''}`}
                      >
                        <option value="">Select Location</option>
                        {mockLocations.map((location) => (
                          <option key={location} value={location}>{location}</option>
                        ))}
                      </select>
                      {validationErrors.location && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.location}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className={validationErrors.date ? 'border-red-500' : ''}
                      />
                      {validationErrors.date && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.date}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="time">Time *</Label>
                      <select
                        id="time"
                        value={formData.time}
                        onChange={(e) => handleInputChange('time', e.target.value)}
                        className={`w-full p-2 border rounded-md ${validationErrors.time ? 'border-red-500' : ''}`}
                      >
                        <option value="">Select Time</option>
                        {generateTimeSlots().map((slot) => (
                          <option key={slot} value={slot}>{formatTime(slot)}</option>
                        ))}
                      </select>
                      {validationErrors.time && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.time}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="duration">Duration (minutes) *</Label>
                      <select
                        id="duration"
                        value={formData.duration}
                        onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                        className={`w-full p-2 border rounded-md ${validationErrors.duration ? 'border-red-500' : ''}`}
                      >
                        <option value={15}>15 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={45}>45 minutes</option>
                        <option value={60}>60 minutes</option>
                        <option value={90}>90 minutes</option>
                      </select>
                      {validationErrors.duration && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.duration}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes || ''}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="Any special notes for this appointment..."
                      rows={3}
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={() => setShowAddForm(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddAppointment}
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? 'Scheduling...' : 'Schedule Appointment'}
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