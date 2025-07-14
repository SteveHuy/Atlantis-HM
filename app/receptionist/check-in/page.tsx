'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Epic5MockDataManager, 
  type TodayAppointmentCheckIn
} from '@/lib/epic5-mock-data';
import { 
  checkInSearchSchema,
  type CheckInSearchData,
  sanitizeInput
} from '@/lib/epic5-validation';
import { 
  ArrowLeft, 
  UserCheck, 
  Search, 
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  FileText,
  Phone,
  Stethoscope
} from 'lucide-react';

export default function CheckInPatientPage() {
  const router = useRouter();
  const [todayAppointments, setTodayAppointments] = useState<TodayAppointmentCheckIn[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<TodayAppointmentCheckIn[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<TodayAppointmentCheckIn | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Check if user is logged in as receptionist
    const userSession = localStorage.getItem('receptionistSession');
    if (!userSession) {
      router.push('/receptionist/login');
      return;
    }

    loadTodayAppointments();
  }, [router]);

  useEffect(() => {
    filterAppointments();
  }, [todayAppointments, searchQuery]);

  const loadTodayAppointments = () => {
    const appointments = Epic5MockDataManager.getTodayAppointments();
    setTodayAppointments(appointments);
  };

  const filterAppointments = () => {
    if (!searchQuery.trim()) {
      setFilteredAppointments(todayAppointments);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = todayAppointments.filter(apt => 
      apt.patientName.toLowerCase().includes(query) ||
      apt.appointmentId.toLowerCase().includes(query) ||
      apt.patientId.toLowerCase().includes(query)
    );
    
    setFilteredAppointments(filtered);
  };

  const handleSearch = () => {
    const searchData: CheckInSearchData = {
      query: sanitizeInput(searchQuery)
    };

    try {
      checkInSearchSchema.parse(searchData);
      setValidationErrors({});
      
      if (filteredAppointments.length === 0 && searchQuery.trim()) {
        setMessage({
          type: 'error',
          text: 'No appointments found matching your search criteria.'
        });
      } else {
        setMessage(null);
      }
    } catch (error: any) {
      const errors: Record<string, string> = {};
      error.errors?.forEach((err: any) => {
        if (err.path) {
          errors[err.path[0]] = err.message;
        }
      });
      setValidationErrors(errors);
    }
  };

  const handleAppointmentSelect = (appointment: TodayAppointmentCheckIn) => {
    setSelectedAppointment(appointment);
    setMessage(null);
  };

  const handleCheckIn = async (appointmentId: string) => {
    const appointment = todayAppointments.find(apt => apt.id === appointmentId);
    
    if (!appointment) {
      setMessage({ type: 'error', text: 'Appointment not found.' });
      return;
    }

    if (!appointment.canCheckIn) {
      setMessage({ 
        type: 'error', 
        text: 'Patient cannot be checked in. Appointment may be cancelled or already checked in.' 
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const success = Epic5MockDataManager.checkInPatient(appointmentId);
      
      if (success) {
        // Update local state
        setTodayAppointments(prev => prev.map(apt => 
          apt.id === appointmentId 
            ? { 
                ...apt, 
                status: 'checked-in',
                checkInTime: new Date().toLocaleTimeString('en-US', { 
                  hour12: false, 
                  hour: '2-digit', 
                  minute: '2-digit' 
                }),
                checkInBy: 'R001',
                canCheckIn: false
              }
            : apt
        ));
        
        setMessage({
          type: 'success',
          text: `${appointment.patientName} checked in successfully. Provider ${appointment.providerName} has been notified.`
        });
        
        // Clear selection after successful check-in
        setTimeout(() => {
          setSelectedAppointment(null);
        }, 2000);
        
      } else {
        setMessage({ type: 'error', text: 'Failed to check in patient. Please try again.' });
      }
      
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred during check-in process.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewMedicalRecords = (patientId: string) => {
    // Navigate to patient EHR page with patient ID as search parameter
    router.push(`/receptionist/patient-ehr?patientId=${patientId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'checked-in': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Clock className="h-4 w-4" />;
      case 'checked-in': return <CheckCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
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

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const isAppointmentSoon = (scheduledTime: string) => {
    const now = new Date();
    const [hours, minutes] = scheduledTime.split(':').map(Number);
    const appointmentTime = new Date();
    appointmentTime.setHours(hours, minutes, 0, 0);
    
    const diffMinutes = (appointmentTime.getTime() - now.getTime()) / (1000 * 60);
    return diffMinutes <= 30 && diffMinutes >= -15; // Within 30 minutes before or 15 minutes after
  };

  const todayStats = {
    total: todayAppointments.length,
    scheduled: todayAppointments.filter(apt => apt.status === 'scheduled').length,
    checkedIn: todayAppointments.filter(apt => apt.status === 'checked-in').length,
    completed: todayAppointments.filter(apt => apt.status === 'completed').length,
    cancelled: todayAppointments.filter(apt => apt.status === 'cancelled').length
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
              <UserCheck className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Check-in Patient</h1>
                <p className="text-gray-600">Manage patient arrivals for today's appointments</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-500">Current Time</div>
              <div className="text-xl font-bold text-blue-600">{getCurrentTime()}</div>
              <div className="text-sm text-gray-500">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="py-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{todayStats.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{todayStats.scheduled}</div>
                <div className="text-sm text-gray-600">Scheduled</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{todayStats.checkedIn}</div>
                <div className="text-sm text-gray-600">Checked In</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{todayStats.completed}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{todayStats.cancelled}</div>
                <div className="text-sm text-gray-600">Cancelled</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Appointments List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Today's Appointments ({filteredAppointments.length})</span>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Search by name or appointment ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(sanitizeInput(e.target.value))}
                      className="w-64"
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button
                      onClick={handleSearch}
                      variant="outline"
                      size="sm"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">
                      {searchQuery ? 'No appointments found' : 'No appointments scheduled for today'}
                    </p>
                    {searchQuery && (
                      <p className="text-gray-400 text-sm">Try adjusting your search criteria</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedAppointment?.id === appointment.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'hover:bg-gray-50'
                        } ${
                          isAppointmentSoon(appointment.scheduledTime) ? 'border-l-4 border-l-orange-400' : ''
                        }`}
                        onClick={() => handleAppointmentSelect(appointment)}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-gray-500" />
                            <div>
                              <div className="font-semibold text-lg">{appointment.patientName}</div>
                              <div className="text-sm text-gray-600">ID: {appointment.patientId}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={getStatusColor(appointment.status)}>
                                {getStatusIcon(appointment.status)}
                                <span className="ml-1">{appointment.status.toUpperCase()}</span>
                              </Badge>
                            </div>
                            <div className="text-lg font-bold text-blue-600">
                              {formatTime(appointment.scheduledTime)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">Provider:</span>
                            <div>{appointment.providerName}</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Service:</span>
                            <div>{appointment.serviceType}</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Phone:</span>
                            <div>{appointment.patientPhone}</div>
                          </div>
                        </div>
                        
                        {appointment.checkInTime && (
                          <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-sm">
                            <div className="flex items-center gap-2 text-green-800">
                              <CheckCircle className="h-4 w-4" />
                              <span>Checked in at {appointment.checkInTime}</span>
                              {appointment.checkInBy && <span>by {appointment.checkInBy}</span>}
                            </div>
                          </div>
                        )}
                        
                        {isAppointmentSoon(appointment.scheduledTime) && appointment.canCheckIn && (
                          <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-sm">
                            <div className="flex items-center gap-2 text-orange-800">
                              <AlertCircle className="h-4 w-4" />
                              <span>Appointment time approaching - ready for check-in</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Appointment Details and Actions */}
          <div className="space-y-6">
            {selectedAppointment ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Patient Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label>Full Name</Label>
                        <div className="font-semibold text-lg">{selectedAppointment.patientName}</div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Patient ID</Label>
                          <div className="font-medium">{selectedAppointment.patientId}</div>
                        </div>
                        <div>
                          <Label>Phone</Label>
                          <div className="font-medium">{selectedAppointment.patientPhone}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Stethoscope className="h-5 w-5" />
                      Appointment Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label>Provider</Label>
                        <div className="font-semibold">{selectedAppointment.providerName}</div>
                      </div>
                      
                      <div>
                        <Label>Service Type</Label>
                        <div className="font-medium">{selectedAppointment.serviceType}</div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Scheduled Time</Label>
                          <div className="font-bold text-blue-600">
                            {formatTime(selectedAppointment.scheduledTime)}
                          </div>
                        </div>
                        <div>
                          <Label>Status</Label>
                          <Badge className={getStatusColor(selectedAppointment.status)}>
                            {getStatusIcon(selectedAppointment.status)}
                            <span className="ml-1">{selectedAppointment.status.toUpperCase()}</span>
                          </Badge>
                        </div>
                      </div>
                      
                      {selectedAppointment.checkInTime && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded">
                          <div className="text-green-800 font-medium">
                            ✓ Checked in at {selectedAppointment.checkInTime}
                          </div>
                          {selectedAppointment.checkInBy && (
                            <div className="text-green-600 text-sm">
                              by {selectedAppointment.checkInBy}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedAppointment.canCheckIn ? (
                        <Button
                          onClick={() => handleCheckIn(selectedAppointment.id)}
                          disabled={isLoading}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          {isLoading ? 'Checking In...' : 'Check-in Patient'}
                        </Button>
                      ) : (
                        <div className="text-center py-4">
                          {selectedAppointment.status === 'checked-in' ? (
                            <div className="text-green-600 font-medium">
                              ✓ Patient already checked in
                            </div>
                          ) : selectedAppointment.status === 'cancelled' ? (
                            <div className="text-red-600 font-medium">
                              ✗ Appointment cancelled
                            </div>
                          ) : (
                            <div className="text-gray-600">
                              Check-in not available
                            </div>
                          )}
                        </div>
                      )}
                      
                      <Button
                        onClick={() => handleViewMedicalRecords(selectedAppointment.patientId)}
                        variant="outline"
                        className="w-full"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View Medical Records
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Select an appointment to view details and check-in options</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}