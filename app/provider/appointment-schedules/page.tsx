'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Calendar, 
  Clock, 
  ArrowLeft, 
  User,
  MapPin,
  Filter,
  Plus,
  Edit,
  X,
  Phone,
  FileText,
  Download,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { sessionManager, type UserSession } from '@/lib/epic3-mock-data';
import { serviceProviderDataManager } from '@/lib/service-provider-mock-data';
import { accessAppointmentSchedulesSchema } from '@/lib/service-provider-validation';

// Mock appointment data
interface AppointmentData {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  appointmentTime: string;
  appointmentType: string;
  serviceType: string;
  providerId: string;
  providerName: string;
  locationId: string;
  locationName: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  duration: number;
  notes?: string;
  healthInfo?: {
    allergies: string[];
    medications: string[];
    conditions: string[];
  };
}

const mockAppointments: AppointmentData[] = [
  {
    id: 'apt-1',
    patientId: 'patient-1',
    patientName: 'John Doe',
    patientPhone: '(555) 123-4567',
    appointmentTime: '2024-01-20T09:00:00',
    appointmentType: 'Routine Checkup',
    serviceType: 'General Consultation',
    providerId: 'provider-1',
    providerName: 'Dr. Sarah Johnson',
    locationId: 'loc-1',
    locationName: 'Main Clinic',
    status: 'confirmed',
    duration: 30,
    notes: 'Annual physical examination',
    healthInfo: {
      allergies: ['Penicillin'],
      medications: ['Lisinopril 10mg'],
      conditions: ['Hypertension']
    }
  },
  {
    id: 'apt-2',
    patientId: 'patient-2',
    patientName: 'Jane Smith',
    patientPhone: '(555) 234-5678',
    appointmentTime: '2024-01-20T10:30:00',
    appointmentType: 'Follow-up Visit',
    serviceType: 'Cardiology Consultation',
    providerId: 'provider-2',
    providerName: 'Dr. Michael Chen',
    locationId: 'loc-1',
    locationName: 'Main Clinic',
    status: 'scheduled',
    duration: 45,
    notes: 'Follow-up for cardiac consultation',
    healthInfo: {
      allergies: [],
      medications: ['Metoprolol 50mg', 'Atorvastatin 20mg'],
      conditions: ['Atrial Fibrillation', 'High Cholesterol']
    }
  },
  {
    id: 'apt-3',
    patientId: 'patient-3',
    patientName: 'Bob Johnson',
    patientPhone: '(555) 345-6789',
    appointmentTime: '2024-01-20T14:00:00',
    appointmentType: 'Procedure',
    serviceType: 'Minor Surgery',
    providerId: 'provider-1',
    providerName: 'Dr. Sarah Johnson',
    locationId: 'loc-2',
    locationName: 'Surgery Center',
    status: 'confirmed',
    duration: 90,
    notes: 'Mole removal procedure',
    healthInfo: {
      allergies: ['Latex', 'Iodine'],
      medications: [],
      conditions: []
    }
  }
];

const mockLocations = [
  { id: 'loc-1', name: 'Main Clinic' },
  { id: 'loc-2', name: 'Surgery Center' },
  { id: 'loc-3', name: 'Imaging Center' }
];

export default function AccessAppointmentSchedulesPage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [viewType, setViewType] = useState<'day' | 'week' | 'month'>('week');
  const [selectedProviderId, setSelectedProviderId] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'personal' | 'patient-specific'>('all');
  
  // Data state
  const [appointments, setAppointments] = useState<AppointmentData[]>(mockAppointments);
  const [filteredAppointments, setFilteredAppointments] = useState<AppointmentData[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentData | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  // UI state
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [newAppointmentTime, setNewAppointmentTime] = useState('');

  useEffect(() => {
    const userSession = sessionManager.getSession();
    
    if (!userSession || userSession.role !== 'provider') {
      router.push('/provider/login');
      return;
    }
    
    setSession(userSession);
    
    // Set default date range (current week)
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    setStartDate(startOfWeek.toISOString().split('T')[0]);
    setEndDate(endOfWeek.toISOString().split('T')[0]);
    
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    applyFilters();
  }, [startDate, endDate, selectedProviderId, selectedLocationId, filterType, appointments]);

  const applyFilters = () => {
    let filtered = [...appointments];
    
    // Date range filter
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.appointmentTime);
        return aptDate >= start && aptDate <= end;
      });
    }
    
    // Provider filter
    if (selectedProviderId) {
      filtered = filtered.filter(apt => apt.providerId === selectedProviderId);
    }
    
    // Location filter
    if (selectedLocationId) {
      filtered = filtered.filter(apt => apt.locationId === selectedLocationId);
    }
    
    // Filter type
    if (filterType === 'personal' && session) {
      filtered = filtered.filter(apt => apt.providerId === session.userId);
    }
    
    // Sort by appointment time
    filtered.sort((a, b) => new Date(a.appointmentTime).getTime() - new Date(b.appointmentTime).getTime());
    
    setFilteredAppointments(filtered);
  };

  const handleAppointmentSelect = (appointment: AppointmentData) => {
    setSelectedAppointment(appointment);
    setShowDetails(true);
    
    // Log appointment access
    if (session) {
      serviceProviderDataManager.logSecurityEvent(
        'APPOINTMENT_VIEWED',
        'appointment',
        appointment.id,
        `Appointment details viewed for ${appointment.patientName}`,
        'low'
      );
    }
  };

  const handleViewPatientEHR = (appointment: AppointmentData) => {
    // Navigate to patient EHR with patient ID
    router.push(`/provider/patient-ehr?patientId=${appointment.patientId}`);
  };

  const handleRescheduleAppointment = (appointment: AppointmentData) => {
    setSelectedAppointment(appointment);
    setNewAppointmentTime(appointment.appointmentTime.split('T')[0] + 'T' + appointment.appointmentTime.split('T')[1].substring(0, 5));
    setShowRescheduleModal(true);
  };

  const confirmReschedule = async () => {
    if (!selectedAppointment || !newAppointmentTime || !session) return;
    
    setUpdateError('');
    setUpdateSuccess('');
    setIsUpdating(true);

    try {
      // Validate the reschedule request
      const validationResult = accessAppointmentSchedulesSchema.safeParse({
        startDate: startDate,
        endDate: endDate,
        providerId: selectedAppointment.providerId,
        locationId: selectedAppointment.locationId,
        viewType: viewType
      });

      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(e => e.message).join(', ');
        setUpdateError(errors);
        setIsUpdating(false);
        return;
      }

      // Update appointment time
      const updatedAppointments = appointments.map(apt => 
        apt.id === selectedAppointment.id 
          ? { ...apt, appointmentTime: newAppointmentTime }
          : apt
      );
      setAppointments(updatedAppointments);
      
      // Log the reschedule
      serviceProviderDataManager.logSecurityEvent(
        'APPOINTMENT_RESCHEDULED',
        'appointment',
        selectedAppointment.id,
        `Appointment rescheduled for ${selectedAppointment.patientName}`,
        'medium'
      );

      setUpdateSuccess('Appointment rescheduled successfully. Patient has been notified.');
      setShowRescheduleModal(false);
      setSelectedAppointment(null);
      
      // Auto-hide success message
      setTimeout(() => setUpdateSuccess(''), 3000);

    } catch (error) {
      setUpdateError('Failed to reschedule appointment. Please try again.');
      console.error('Reschedule error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelAppointment = async (appointment: AppointmentData) => {
    if (!window.confirm(`Are you sure you want to cancel the appointment for ${appointment.patientName}?`)) {
      return;
    }

    setIsUpdating(true);
    setUpdateError('');
    setUpdateSuccess('');

    try {
      // Update appointment status
      const updatedAppointments = appointments.map(apt => 
        apt.id === appointment.id 
          ? { ...apt, status: 'cancelled' as const }
          : apt
      );
      setAppointments(updatedAppointments);
      
      // Log the cancellation
      if (session) {
        serviceProviderDataManager.logSecurityEvent(
          'APPOINTMENT_CANCELLED',
          'appointment',
          appointment.id,
          `Appointment cancelled for ${appointment.patientName}`,
          'medium'
        );
      }

      setUpdateSuccess('Appointment cancelled successfully. Patient has been notified.');
      
      // Auto-hide success message
      setTimeout(() => setUpdateSuccess(''), 3000);

    } catch (error) {
      setUpdateError('Failed to cancel appointment. Please try again.');
      console.error('Cancel error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const exportSchedule = (format: 'pdf' | 'csv') => {
    if (!session) return;

    // Log export action
    serviceProviderDataManager.logSecurityEvent(
      'SCHEDULE_EXPORTED',
      'appointment_schedule',
      'export',
      `Schedule exported in ${format.toUpperCase()} format`,
      'low'
    );

    // Mock export functionality
    alert(`Appointment schedule exported in ${format.toUpperCase()} format (mock)`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'no-show':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
                onClick={() => router.push('/provider/dashboard')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-blue-600">Appointment Schedules</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportSchedule('pdf')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportSchedule('csv')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <span className="text-sm text-gray-600">
                {session.fullName}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {updateSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800">{updateSuccess}</span>
          </div>
        )}

        {updateError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{updateError}</span>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-600" />
              Schedule Filters
            </CardTitle>
            <CardDescription>
              Filter appointments by date range, provider, and location
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Date Range */}
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* View Type */}
              <div>
                <label htmlFor="viewType" className="block text-sm font-medium text-gray-700 mb-2">
                  View Type
                </label>
                <select
                  id="viewType"
                  value={viewType}
                  onChange={(e) => setViewType(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="day">Day View</option>
                  <option value="week">Week View</option>
                  <option value="month">Month View</option>
                </select>
              </div>

              {/* Filter Type */}
              <div>
                <label htmlFor="filterType" className="block text-sm font-medium text-gray-700 mb-2">
                  Filter Type
                </label>
                <select
                  id="filterType"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Appointments</option>
                  <option value="personal">My Appointments</option>
                  <option value="patient-specific">Patient Specific</option>
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <select
                  id="location"
                  value={selectedLocationId}
                  onChange={(e) => setSelectedLocationId(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Locations</option>
                  {mockLocations.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointment List */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Appointments ({filteredAppointments.length})
              </CardTitle>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => alert('Add appointment functionality would be implemented here')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Appointment
              </Button>
            </div>
            <CardDescription>
              {startDate && endDate && 
                `Showing appointments from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
                <p className="text-gray-600">No appointments match your current filter criteria.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAppointments.map((appointment) => (
                  <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-medium text-gray-900">{appointment.patientName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            {new Date(appointment.appointmentTime).toLocaleString()}
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                          <div>
                            <p className="text-sm text-gray-600">Type</p>
                            <p className="font-medium text-gray-900">{appointment.appointmentType}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Service</p>
                            <p className="font-medium text-gray-900">{appointment.serviceType}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Provider</p>
                            <p className="font-medium text-gray-900">{appointment.providerName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Location</p>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-gray-500" />
                              <p className="font-medium text-gray-900">{appointment.locationName}</p>
                            </div>
                          </div>
                        </div>

                        {appointment.notes && (
                          <p className="text-sm text-gray-600 italic">{appointment.notes}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAppointmentSelect(appointment)}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                        {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRescheduleAppointment(appointment)}
                              disabled={isUpdating}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Reschedule
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancelAppointment(appointment)}
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              disabled={isUpdating}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Appointment Details Modal */}
        {showDetails && selectedAppointment && (
          <Card className="mt-6">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Appointment Details</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Patient Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <span className="ml-2 font-medium">{selectedAppointment.patientName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{selectedAppointment.patientPhone}</span>
                    </div>
                    <div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewPatientEHR(selectedAppointment)}
                        className="mt-2"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View Patient EHR
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Appointment Details</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Date & Time:</span>
                      <span className="ml-2 font-medium">{new Date(selectedAppointment.appointmentTime).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Duration:</span>
                      <span className="ml-2 font-medium">{selectedAppointment.duration} minutes</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAppointment.status)}`}>
                        {selectedAppointment.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedAppointment.healthInfo && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-medium text-gray-900 mb-3">Patient Health Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Allergies:</p>
                      {selectedAppointment.healthInfo.allergies.length > 0 ? (
                        <ul className="text-sm text-gray-700 list-disc list-inside">
                          {selectedAppointment.healthInfo.allergies.map((allergy, index) => (
                            <li key={index} className="text-red-600">{allergy}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500">None reported</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Current Medications:</p>
                      {selectedAppointment.healthInfo.medications.length > 0 ? (
                        <ul className="text-sm text-gray-700 list-disc list-inside">
                          {selectedAppointment.healthInfo.medications.map((medication, index) => (
                            <li key={index}>{medication}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500">None reported</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Conditions:</p>
                      {selectedAppointment.healthInfo.conditions.length > 0 ? (
                        <ul className="text-sm text-gray-700 list-disc list-inside">
                          {selectedAppointment.healthInfo.conditions.map((condition, index) => (
                            <li key={index}>{condition}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500">None reported</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Reschedule Modal */}
        {showRescheduleModal && selectedAppointment && (
          <Card className="mt-6">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Reschedule Appointment</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRescheduleModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm text-blue-800">
                    <strong>Patient:</strong> {selectedAppointment.patientName} | 
                    <strong> Type:</strong> {selectedAppointment.appointmentType}
                  </p>
                </div>

                <div>
                  <label htmlFor="newTime" className="block text-sm font-medium text-gray-700 mb-2">
                    New Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    id="newTime"
                    value={newAppointmentTime}
                    onChange={(e) => setNewAppointmentTime(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={confirmReschedule}
                    disabled={isUpdating || !newAppointmentTime}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isUpdating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Rescheduling...
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        Confirm Reschedule
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowRescheduleModal(false)}
                    disabled={isUpdating}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}