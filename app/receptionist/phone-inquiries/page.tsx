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
  type PhoneInquiry,
  mockDepartments 
} from '@/lib/epic5-mock-data';
import { 
  phoneInquirySchema,
  type PhoneInquiryData,
  sanitizeInput,
  formatPhoneNumber,
  validatePhoneNumber
} from '@/lib/epic5-validation';
import { 
  ArrowLeft, 
  Phone, 
  Search, 
  User, 
  Calendar, 
  MessageSquare,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck
} from 'lucide-react';

interface PatientSearchResult {
  id: string;
  name: string;
  phone: string;
  appointments?: any[];
}

export default function PhoneInquiriesPage() {
  const router = useRouter();
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [formData, setFormData] = useState<PhoneInquiryData>({
    callerName: '',
    callerPhone: '',
    reason: '',
    patientSearch: '',
    appointmentActions: [],
    callNotes: '',
    transferredTo: '',
    transferNotes: '',
    followUpMethod: 'none'
  });
  const [searchResults, setSearchResults] = useState<PatientSearchResult[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientSearchResult | null>(null);
  const [appointmentActions, setAppointmentActions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    // Check if user is logged in as receptionist
    // const userSession = localStorage.getItem('receptionistSession');
    // if (!userSession) {
    //   router.push('/receptionist/login');
    //   return;
    // }
  }, [router]);

  const handleInputChange = (field: keyof PhoneInquiryData, value: string | string[]) => {
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

  const handlePatientSearch = async () => {
    if (!formData.patientSearch?.trim()) {
      setMessage({ type: 'error', text: 'Please enter a name or phone number to search' });
      return;
    }

    setIsLoading(true);
    try {
      const results = Epic5MockDataManager.searchPatientByNameOrPhone(formData.patientSearch);
      setSearchResults(results);
      
      if (results.length === 0) {
        setMessage({ type: 'error', text: 'No patients found with that name or phone number' });
      } else {
        setMessage(null);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error searching for patients' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePatientSelect = (patient: PatientSearchResult) => {
    setSelectedPatient(patient);
    setSearchResults([]);
    setFormData(prev => ({ ...prev, patientSearch: patient.name }));
    
    // Mock appointment history for selected patient
    const mockAppointmentHistory = [
      { id: 'a1', date: '2024-01-15', time: '10:00 AM', provider: 'Dr. Smith', status: 'completed' },
      { id: 'a2', date: '2024-02-20', time: '2:00 PM', provider: 'Dr. Wilson', status: 'scheduled' }
    ];
    
    setSelectedPatient(prev => prev ? { ...prev, appointments: mockAppointmentHistory } : null);
  };

  const handleAppointmentAction = (action: string) => {
    const newAction = sanitizeInput(action);
    if (newAction.trim()) {
      setAppointmentActions(prev => [...prev, newAction]);
      setFormData(prev => ({
        ...prev,
        appointmentActions: [...(prev.appointmentActions || []), newAction]
      }));
    }
  };

  const removeAppointmentAction = (index: number) => {
    setAppointmentActions(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      appointmentActions: prev.appointmentActions?.filter((_, i) => i !== index) || []
    }));
  };

  const validateForm = (): boolean => {
    try {
      phoneInquirySchema.parse(formData);
      
      // Additional phone validation
      if (!validatePhoneNumber(formData.callerPhone)) {
        setValidationErrors({ callerPhone: 'Please enter a valid phone number' });
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

  const handleSaveInquiry = async () => {
    if (!validateForm()) {
      setMessage({ type: 'error', text: 'Please fix validation errors before saving' });
      return;
    }

    setIsLoading(true);
    try {
      const inquiryData = {
        ...formData,
        patientId: selectedPatient?.id,
        patientFound: !!selectedPatient,
        appointmentActions: appointmentActions,
        callNotes: formData.callNotes || '',
        transferNotes: formData.transferNotes || '',
        receptionistId: 'R001' // Mock receptionist ID
      };

      const savedInquiry = Epic5MockDataManager.createPhoneInquiry(inquiryData);
      setReferenceNumber(savedInquiry.referenceNumber);
      setShowConfirmation(true);
      setMessage({ 
        type: 'success', 
        text: `Call log saved successfully. Reference number: ${savedInquiry.referenceNumber}` 
      });
      
      // Reset form
      setFormData({
        callerName: '',
        callerPhone: '',
        reason: '',
        patientSearch: '',
        appointmentActions: [],
        callNotes: '',
        transferredTo: '',
        transferNotes: '',
        followUpMethod: 'none'
      });
      setSelectedPatient(null);
      setAppointmentActions([]);
      setSearchResults([]);
      
    } catch (error) {
      setMessage({ type: 'error', text: 'Error saving call log' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendFollowUp = async () => {
    if (formData.followUpMethod === 'none') {
      setMessage({ type: 'error', text: 'Please select a follow-up method' });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate sending confirmation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({ 
        type: 'success', 
        text: `Follow-up confirmation sent via ${formData.followUpMethod === 'sms' ? 'SMS' : 'email'}` 
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error sending follow-up confirmation' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!formData.transferredTo) {
      setMessage({ type: 'error', text: 'Please select a department to transfer to' });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate transfer notification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({ 
        type: 'success', 
        text: `Call transferred to ${formData.transferredTo} department. They have been notified.` 
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error transferring call' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToCalendar = () => {
    router.push('/receptionist/appointment-calendar');
  };

  const formatPhoneDisplay = (phone: string) => {
    return formatPhoneNumber(phone);
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
              <Phone className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Handle Phone Inquiries</h1>
                <p className="text-gray-600">Log calls and manage appointments over the phone</p>
              </div>
            </div>
            
            <Button
              onClick={() => setShowInquiryForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Phone className="h-4 w-4 mr-2" />
              Log Phone Inquiry
            </Button>
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

        {showConfirmation && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                Call Log Saved Successfully
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label>Reference Number</Label>
                    <div className="font-mono text-lg font-bold text-green-700 bg-white p-2 rounded border">
                      {referenceNumber}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirmation(false)}
                  >
                    Close
                  </Button>
                  <Button
                    onClick={handleNavigateToCalendar}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Go to Appointment Calendar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!showInquiryForm ? (
          <Card>
            <CardHeader>
              <CardTitle>Phone Inquiry Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Phone className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Handle Phone Calls</h3>
                <p className="text-gray-600 mb-6">
                  Click the "Log Phone Inquiry" button to start recording a new phone call
                </p>
                <Button
                  onClick={() => setShowInquiryForm(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Log Phone Inquiry
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="caller" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="caller">Caller Details</TabsTrigger>
              <TabsTrigger value="patient">Patient Search</TabsTrigger>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              <TabsTrigger value="actions">Actions & Save</TabsTrigger>
            </TabsList>

            <TabsContent value="caller" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Caller Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="callerName">Caller Name *</Label>
                      <Input
                        id="callerName"
                        value={formData.callerName}
                        onChange={(e) => handleInputChange('callerName', e.target.value)}
                        placeholder="Enter caller's full name"
                        className={validationErrors.callerName ? 'border-red-500' : ''}
                      />
                      {validationErrors.callerName && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.callerName}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="callerPhone">Caller Phone Number *</Label>
                      <Input
                        id="callerPhone"
                        value={formData.callerPhone}
                        onChange={(e) => handleInputChange('callerPhone', e.target.value)}
                        placeholder="(555) 123-4567"
                        className={validationErrors.callerPhone ? 'border-red-500' : ''}
                      />
                      {validationErrors.callerPhone && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.callerPhone}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Label htmlFor="reason">Reason for Call *</Label>
                    <Textarea
                      id="reason"
                      value={formData.reason}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('reason', e.target.value)}
                      placeholder="What is the caller asking about? (e.g., schedule appointment, reschedule, billing question, etc.)"
                      rows={4}
                      className={validationErrors.reason ? 'border-red-500' : ''}
                    />
                    {validationErrors.reason && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.reason}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="patient" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Patient Search
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="patientSearch">Search by Name or Phone Number</Label>
                      <div className="flex gap-2">
                        <Input
                          id="patientSearch"
                          value={formData.patientSearch || ''}
                          onChange={(e) => handleInputChange('patientSearch', e.target.value)}
                          placeholder="Enter patient name or phone number"
                        />
                        <Button
                          onClick={handlePatientSearch}
                          disabled={isLoading}
                          variant="outline"
                        >
                          <Search className="h-4 w-4 mr-2" />
                          {isLoading ? 'Searching...' : 'Search'}
                        </Button>
                      </div>
                    </div>

                    {searchResults.length > 0 && (
                      <div className="space-y-2">
                        <Label>Search Results</Label>
                        {searchResults.map((patient) => (
                          <div
                            key={patient.id}
                            className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                            onClick={() => handlePatientSelect(patient)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold">{patient.name}</p>
                                <p className="text-sm text-gray-600">ID: {patient.id}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm">{formatPhoneDisplay(patient.phone)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedPatient && (
                      <Card className="border-green-200 bg-green-50">
                        <CardHeader>
                          <CardTitle className="text-green-800 flex items-center gap-2">
                            <UserCheck className="h-5 w-5" />
                            Selected Patient
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="font-medium">Name:</span> {selectedPatient.name}
                            </div>
                            <div>
                              <span className="font-medium">Phone:</span> {formatPhoneDisplay(selectedPatient.phone)}
                            </div>
                            <div>
                              <span className="font-medium">Patient ID:</span> {selectedPatient.id}
                            </div>
                          </div>
                          
                          {selectedPatient.appointments && (
                            <div className="mt-4">
                              <Label>Recent Appointment History</Label>
                              <div className="space-y-2 mt-2">
                                {selectedPatient.appointments.map((apt, index) => (
                                  <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                                    <div>
                                      <span className="font-medium">{apt.date}</span> at {apt.time}
                                    </div>
                                    <div className="text-right">
                                      <div>{apt.provider}</div>
                                      <Badge variant={apt.status === 'completed' ? 'default' : 'secondary'}>
                                        {apt.status}
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appointments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Appointment Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>Appointment Actions Taken</Label>
                      <p className="text-sm text-gray-600 mb-2">
                        Record any scheduling, rescheduling, or cancellation actions performed during this call
                      </p>
                      
                      <div className="flex gap-2">
                        <Input
                          placeholder="e.g., Scheduled appointment for 2024-02-15 at 10:00 AM with Dr. Smith"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleAppointmentAction(e.currentTarget.value);
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                        <Button
                          onClick={() => {
                            const input = document.querySelector('input[placeholder*="Scheduled"]') as HTMLInputElement;
                            if (input?.value) {
                              handleAppointmentAction(input.value);
                              input.value = '';
                            }
                          }}
                          variant="outline"
                        >
                          Add Action
                        </Button>
                      </div>
                    </div>

                    {appointmentActions.length > 0 && (
                      <div className="space-y-2">
                        <Label>Recorded Actions</Label>
                        {appointmentActions.map((action, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                            <span>{action}</span>
                            <Button
                              onClick={() => removeAppointmentAction(index)}
                              variant="ghost"
                              size="sm"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div>
                      <Label htmlFor="callNotes">Call Notes</Label>
                      <Textarea
                        id="callNotes"
                        value={formData.callNotes || ''}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('callNotes', e.target.value)}
                        placeholder="Additional notes about the call and any special instructions..."
                        rows={4}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="actions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Call Actions & Follow-up
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Transfer Section */}
                    <div>
                      <Label>Transfer to Department</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <div>
                          <select
                            value={formData.transferredTo || ''}
                            onChange={(e) => handleInputChange('transferredTo', e.target.value)}
                            className="w-full p-2 border rounded-md"
                          >
                            <option value="">Select Department (Optional)</option>
                            {mockDepartments.map((dept) => (
                              <option key={dept} value={dept}>{dept}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Input
                            placeholder="Transfer notes"
                            value={formData.transferNotes || ''}
                            onChange={(e) => handleInputChange('transferNotes', e.target.value)}
                          />
                        </div>
                      </div>
                      {formData.transferredTo && (
                        <Button
                          onClick={handleTransfer}
                          disabled={isLoading}
                          variant="outline"
                          className="mt-2"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          {isLoading ? 'Transferring...' : 'Transfer Call'}
                        </Button>
                      )}
                    </div>

                    {/* Follow-up Section */}
                    <div>
                      <Label>Follow-up Confirmation</Label>
                      <div className="flex items-center gap-4 mt-2">
                        <select
                          value={formData.followUpMethod || 'none'}
                          onChange={(e) => handleInputChange('followUpMethod', e.target.value as 'sms' | 'email' | 'none')}
                          className="p-2 border rounded-md"
                        >
                          <option value="none">No Follow-up</option>
                          <option value="sms">Send SMS</option>
                          <option value="email">Send Email</option>
                        </select>
                        {formData.followUpMethod !== 'none' && (
                          <Button
                            onClick={handleSendFollowUp}
                            disabled={isLoading}
                            variant="outline"
                          >
                            <Send className="h-4 w-4 mr-2" />
                            {isLoading ? 'Sending...' : 'Send Confirmation'}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Save Call Log */}
                    <div className="border-t pt-6">
                      <div className="flex gap-3">
                        <Button
                          onClick={() => setShowInquiryForm(false)}
                          variant="outline"
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveInquiry}
                          disabled={isLoading}
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {isLoading ? 'Saving...' : 'Save Call Log'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}