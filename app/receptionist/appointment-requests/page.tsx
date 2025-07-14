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
import { 
  Epic5MockDataManager, 
  type AppointmentRequest,
  mockProviders
} from '@/lib/epic5-mock-data';
import { 
  appointmentRequestActionSchema,
  type AppointmentRequestActionData,
  sanitizeInput
} from '@/lib/epic5-validation';
import { 
  ArrowLeft, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock,
  User,
  AlertCircle,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

export default function AppointmentRequestsPage() {
  const router = useRouter();
  const [pendingRequests, setPendingRequests] = useState<AppointmentRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<AppointmentRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'decline' | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [alternativeDate, setAlternativeDate] = useState('');
  const [alternativeProvider, setAlternativeProvider] = useState('');
  const [showAlternatives, setShowAlternatives] = useState(false);
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

    loadPendingRequests();
  }, [router]);

  const loadPendingRequests = () => {
    const requests = Epic5MockDataManager.getAllPendingRequests();
    setPendingRequests(requests);
  };

  const checkProviderAvailability = (providerId: string, date: string, time: string): boolean => {
    // Mock availability check - randomly return true/false for demonstration
    const random = Math.random();
    return random > 0.3; // 70% chance of availability
  };

  const handleRequestSelect = (request: AppointmentRequest) => {
    setSelectedRequest(request);
    setActionType(null);
    setDeclineReason('');
    setAlternativeDate('');
    setAlternativeProvider('');
    setShowAlternatives(false);
    setMessage(null);
    setValidationErrors({});
  };

  const handleActionStart = (action: 'approve' | 'decline') => {
    setActionType(action);
    setShowAlternatives(false);
    setMessage(null);
    
    if (action === 'approve' && selectedRequest) {
      // Check provider availability
      const isAvailable = checkProviderAvailability(
        selectedRequest.preferredProvider,
        selectedRequest.requestedDate,
        selectedRequest.requestedTime
      );
      
      if (!isAvailable) {
        setShowAlternatives(true);
        setMessage({
          type: 'error',
          text: `${selectedRequest.preferredProvider} is not available on ${selectedRequest.requestedDate} at ${selectedRequest.requestedTime}. Please choose an alternative.`
        });
      }
    }
  };

  const validateAction = (): boolean => {
    if (!selectedRequest || !actionType) return false;

    const actionData: AppointmentRequestActionData = {
      requestId: selectedRequest.id,
      action: actionType,
      declineReason: actionType === 'decline' ? sanitizeInput(declineReason) : undefined,
      alternativeDate: showAlternatives ? alternativeDate : undefined,
      alternativeProvider: showAlternatives ? alternativeProvider : undefined
    };

    try {
      appointmentRequestActionSchema.parse(actionData);
      
      // Additional validation
      if (actionType === 'decline' && !declineReason.trim()) {
        setValidationErrors({ declineReason: 'Please provide a reason for declining' });
        return false;
      }
      
      if (showAlternatives && (!alternativeDate || !alternativeProvider)) {
        setValidationErrors({ 
          alternatives: 'Please select both alternative date and provider' 
        });
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

  const handleApproveRequest = async () => {
    if (!selectedRequest) return;

    if (!validateAction()) {
      setMessage({ type: 'error', text: 'Please fix validation errors before continuing' });
      return;
    }

    setIsLoading(true);
    
    try {
      if (showAlternatives) {
        // Simulate checking alternative availability
        const altAvailable = checkProviderAvailability(alternativeProvider, alternativeDate, selectedRequest.requestedTime);
        
        if (!altAvailable) {
          setMessage({
            type: 'error',
            text: `${alternativeProvider} is also not available on ${alternativeDate}. Please try another option.`
          });
          setIsLoading(false);
          return;
        }
      }

      const success = Epic5MockDataManager.approveAppointmentRequest(selectedRequest.id);
      
      if (success) {
        setMessage({
          type: 'success',
          text: showAlternatives 
            ? `Appointment request approved with alternative scheduling: ${alternativeProvider} on ${alternativeDate}. Patient has been notified.`
            : `Appointment request approved for ${selectedRequest.preferredProvider} on ${selectedRequest.requestedDate}. Patient has been notified.`
        });
        
        // Remove from pending list
        setPendingRequests(prev => prev.filter(req => req.id !== selectedRequest.id));
        setSelectedRequest(null);
        setActionType(null);
        
        // Navigate to calendar after 2 seconds
        setTimeout(() => {
          handleNavigateToCalendar();
        }, 2000);
        
      } else {
        setMessage({ type: 'error', text: 'Failed to approve appointment request. Please try again.' });
      }
      
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while processing the request.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeclineRequest = async () => {
    if (!selectedRequest) return;

    if (!validateAction()) {
      setMessage({ type: 'error', text: 'Please provide a reason for declining' });
      return;
    }

    setIsLoading(true);
    
    try {
      const success = Epic5MockDataManager.declineAppointmentRequest(
        selectedRequest.id, 
        sanitizeInput(declineReason)
      );
      
      if (success) {
        setMessage({
          type: 'success',
          text: `Appointment request declined. Patient has been notified with the provided reason.`
        });
        
        // Remove from pending list
        setPendingRequests(prev => prev.filter(req => req.id !== selectedRequest.id));
        setSelectedRequest(null);
        setActionType(null);
        
      } else {
        setMessage({ type: 'error', text: 'Failed to decline appointment request. Please try again.' });
      }
      
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while processing the request.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToCalendar = () => {
    router.push('/receptionist/appointment-calendar');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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

  const getDaysAgo = (dateString: string) => {
    const submittedDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - submittedDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
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
                <h1 className="text-3xl font-bold text-gray-900">Manage Appointment Requests</h1>
                <p className="text-gray-600">Review and process pending appointment requests</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-500">Pending Requests</div>
              <div className="text-2xl font-bold text-blue-600">{pendingRequests.length}</div>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Requests List */}
          <Card>
            <CardHeader>
              <CardTitle>Appointment Requests ({pendingRequests.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingRequests.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No pending appointment requests</p>
                  <p className="text-gray-400 text-sm">New requests will appear here when submitted</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div
                      key={request.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedRequest?.id === request.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleRequestSelect(request)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-semibold">{request.patientName}</span>
                          <Badge variant="outline">ID: {request.patientId}</Badge>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {getDaysAgo(request.submittedAt)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Appointment Type:</span>
                          <span className="font-medium">{request.appointmentType}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Preferred Provider:</span>
                          <span className="font-medium">{request.preferredProvider}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Requested Date:</span>
                          <span className="font-medium">{formatDate(request.requestedDate)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Requested Time:</span>
                          <span className="font-medium">{formatTime(request.requestedTime)}</span>
                        </div>
                        {request.notes && (
                          <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                            <span className="font-medium">Notes:</span> {request.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Request Details and Actions */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedRequest ? `Process Request - ${selectedRequest.patientName}` : 'Request Actions'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedRequest ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Select a request from the list to process</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Request Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">Request Summary</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><strong>Patient:</strong> {selectedRequest.patientName}</div>
                      <div><strong>Patient ID:</strong> {selectedRequest.patientId}</div>
                      <div><strong>Type:</strong> {selectedRequest.appointmentType}</div>
                      <div><strong>Provider:</strong> {selectedRequest.preferredProvider}</div>
                      <div><strong>Date:</strong> {formatDate(selectedRequest.requestedDate)}</div>
                      <div><strong>Time:</strong> {formatTime(selectedRequest.requestedTime)}</div>
                    </div>
                    {selectedRequest.notes && (
                      <div className="mt-3">
                        <strong>Notes:</strong> {selectedRequest.notes}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {!actionType && (
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleActionStart('approve')}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        Approve Request
                      </Button>
                      <Button
                        onClick={() => handleActionStart('decline')}
                        variant="destructive"
                        className="flex-1"
                      >
                        <ThumbsDown className="h-4 w-4 mr-2" />
                        Decline Request
                      </Button>
                    </div>
                  )}

                  {/* Alternative Options (when provider not available) */}
                  {showAlternatives && (
                    <div className="border border-orange-200 bg-orange-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-orange-800 mb-3">Choose Alternative Options</h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="alternativeDate">Alternative Date</Label>
                          <Input
                            id="alternativeDate"
                            type="date"
                            value={alternativeDate}
                            onChange={(e) => setAlternativeDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className={validationErrors.alternatives ? 'border-red-500' : ''}
                          />
                        </div>
                        <div>
                          <Label htmlFor="alternativeProvider">Alternative Provider</Label>
                          <select
                            id="alternativeProvider"
                            value={alternativeProvider}
                            onChange={(e) => setAlternativeProvider(e.target.value)}
                            className={`w-full p-2 border rounded-md ${validationErrors.alternatives ? 'border-red-500' : ''}`}
                          >
                            <option value="">Select Alternative Provider</option>
                            {mockProviders
                              .filter(p => p.name !== selectedRequest.preferredProvider)
                              .map((provider) => (
                                <option key={provider.id} value={provider.name}>
                                  {provider.name} - {provider.specialty}
                                </option>
                              ))}
                          </select>
                        </div>
                        {validationErrors.alternatives && (
                          <p className="text-red-500 text-sm">{validationErrors.alternatives}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Approve Action */}
                  {actionType === 'approve' && (
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                      <h3 className="font-semibold text-green-800 mb-3">Approve Appointment Request</h3>
                      <p className="text-green-700 text-sm mb-4">
                        {showAlternatives 
                          ? 'Confirm appointment with alternative scheduling options:'
                          : 'Confirm appointment with requested details:'
                        }
                      </p>
                      <div className="flex gap-3">
                        <Button
                          onClick={handleApproveRequest}
                          disabled={isLoading || (showAlternatives && (!alternativeDate || !alternativeProvider))}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {isLoading ? 'Processing...' : 'Confirm Approval'}
                        </Button>
                        <Button
                          onClick={() => {
                            setActionType(null);
                            setShowAlternatives(false);
                          }}
                          variant="outline"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Decline Action */}
                  {actionType === 'decline' && (
                    <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                      <h3 className="font-semibold text-red-800 mb-3">Decline Appointment Request</h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="declineReason">Reason for Declining (Optional)</Label>
                          <Textarea
                            id="declineReason"
                            value={declineReason}
                            onChange={(e) => setDeclineReason(sanitizeInput(e.target.value))}
                            placeholder="Provide a reason for declining this request (will be sent to patient)..."
                            rows={3}
                            className={validationErrors.declineReason ? 'border-red-500' : ''}
                          />
                          {validationErrors.declineReason && (
                            <p className="text-red-500 text-sm mt-1">{validationErrors.declineReason}</p>
                          )}
                        </div>
                        <div className="flex gap-3">
                          <Button
                            onClick={handleDeclineRequest}
                            disabled={isLoading}
                            variant="destructive"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            {isLoading ? 'Processing...' : 'Confirm Decline'}
                          </Button>
                          <Button
                            onClick={() => setActionType(null)}
                            variant="outline"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation to Calendar */}
                  {!actionType && (
                    <div className="border-t pt-4">
                      <Button
                        onClick={handleNavigateToCalendar}
                        variant="outline"
                        className="w-full"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Go to Appointment Calendar
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}