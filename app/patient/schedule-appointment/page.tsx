"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CalendarDays, 
  Clock, 
  MapPin, 
  User, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  MessageCircle
} from "lucide-react";
import { 
  scheduleAppointmentSchema, 
  type ScheduleAppointmentData,
  formatTimeForDisplay,
  formatDateForDisplay
} from "@/lib/epic4-validation";
import { 
  Epic4MockDataManager, 
  type ServiceType, 
  type Provider,
  type TimeSlot
} from "@/lib/epic4-mock-data";

interface AppointmentSummary {
  serviceType: string;
  serviceTypeName: string;
  provider: Provider;
  date: string;
  time: string;
  comments?: string;
}

export default function ScheduleAppointmentPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType | null>(null);
  const [availableProviders, setAvailableProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [appointmentSummary, setAppointmentSummary] = useState<AppointmentSummary | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    success: boolean;
    message: string;
    requiresApproval?: boolean;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<ScheduleAppointmentData>({
    resolver: zodResolver(scheduleAppointmentSchema)
  });

  const serviceTypes = Epic4MockDataManager.getServiceTypes();

  // Step 1: Service Type Selection
  const handleServiceTypeSelect = (serviceType: ServiceType) => {
    setSelectedServiceType(serviceType);
    setValue('serviceType', serviceType.id);
    
    // Filter providers for this service type
    const providers = Epic4MockDataManager.getProviders(serviceType.id);
    setAvailableProviders(providers);
    
    setStep(2);
  };

  // Step 2: Provider Selection
  const handleProviderSelect = (provider: Provider) => {
    setSelectedProvider(provider);
    setValue('providerId', provider.id);
    setAvailableDates(provider.availableDates);
    setStep(3);
  };

  // Step 3: Date Selection
  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setValue('date', date);
    
    // Get available time slots for this provider and date
    const timeSlots = Epic4MockDataManager.getAvailableTimeSlots(selectedProvider!.id, date);
    setAvailableTimeSlots(timeSlots);
    
    setStep(4);
  };

  // Step 4: Time Selection
  const handleTimeSelect = (time: string) => {
    setValue('time', time);
    setStep(5);
  };

  // Step 5: Comments (Optional)
  const handleCommentsSubmit = (data: ScheduleAppointmentData) => {
    if (!selectedServiceType || !selectedProvider) return;

    const summary: AppointmentSummary = {
      serviceType: data.serviceType,
      serviceTypeName: selectedServiceType.name,
      provider: selectedProvider,
      date: data.date,
      time: data.time,
      comments: data.comments
    };

    setAppointmentSummary(summary);
    setStep(6);
  };

  // Step 6: Confirm and Submit
  const handleFinalSubmit = async () => {
    if (!appointmentSummary) return;

    setIsSubmitting(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create appointment
      const appointment = Epic4MockDataManager.scheduleAppointment({
        patientId: 'patient-john',
        providerId: appointmentSummary.provider.id,
        providerName: appointmentSummary.provider.name,
        serviceType: appointmentSummary.serviceTypeName,
        date: appointmentSummary.date,
        time: appointmentSummary.time,
        status: appointmentSummary.provider.requiresApproval ? 'pending' : 'confirmed',
        location: appointmentSummary.provider.location,
        notes: appointmentSummary.comments
      });

      setSubmissionResult({
        success: true,
        message: appointmentSummary.provider.requiresApproval 
          ? 'Appointment pending provider approval'
          : 'Appointment confirmed',
        requiresApproval: appointmentSummary.provider.requiresApproval
      });
      
      setStep(7);
    } catch (error) {
      setSubmissionResult({
        success: false,
        message: 'Failed to schedule appointment. Please try again.'
      });
      setStep(7);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Handle waiting list (when no slots available)
  const handleAddToWaitingList = () => {
    const params = new URLSearchParams();
    if (selectedServiceType) {
      params.set('serviceType', selectedServiceType.name);
    }
    if (selectedProvider) {
      params.set('providerId', selectedProvider.id);
    }
    router.push(`/patient/waiting-list?${params.toString()}`);
  };

  // Navigate to appointment history
  const handleViewAppointmentHistory = () => {
    router.push('/patient/appointment-history');
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Schedule Appointment</h1>
              <p className="text-gray-600">Select the type of service you need</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {serviceTypes.map((serviceType) => (
                <Card
                  key={serviceType.id}
                  className="p-6 cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-300"
                  onClick={() => handleServiceTypeSelect(serviceType)}
                >
                  <div className="text-center space-y-3">
                    <div className="text-4xl">{serviceType.icon}</div>
                    <h3 className="font-semibold text-gray-900">{serviceType.name}</h3>
                    <p className="text-sm text-gray-600">{serviceType.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Select Provider</h1>
                <p className="text-gray-600">Choose a provider for {selectedServiceType?.name}</p>
              </div>
            </div>

            {availableProviders.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No providers available for this service type. 
                  <Button 
                    variant="link" 
                    className="p-0 ml-1 h-auto"
                    onClick={handleAddToWaitingList}
                  >
                    Add to waiting list
                  </Button>
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {availableProviders.map((provider) => (
                  <Card
                    key={provider.id}
                    className="p-4 cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-300"
                    onClick={() => handleProviderSelect(provider)}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {provider.name}, {provider.title}
                        </h3>
                        <p className="text-gray-600">{provider.specialty}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{provider.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span>★ {provider.rating}</span>
                          </div>
                        </div>
                        {provider.requiresApproval && (
                          <div className="mt-2">
                            <span className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                              Requires Approval
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Select Date</h1>
                <p className="text-gray-600">Choose an available date with {selectedProvider?.name}</p>
              </div>
            </div>

            {availableDates.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No available dates for this provider. 
                  <Button 
                    variant="link" 
                    className="p-0 ml-1 h-auto"
                    onClick={handleAddToWaitingList}
                  >
                    Add to waiting list
                  </Button>
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableDates.map((date) => (
                  <Card
                    key={date}
                    className="p-4 cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-300"
                    onClick={() => handleDateSelect(date)}
                  >
                    <div className="text-center space-y-2">
                      <CalendarDays className="w-6 h-6 text-blue-600 mx-auto" />
                      <div className="font-semibold text-gray-900">
                        {formatDateForDisplay(date)}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 4:
        const availableSlots = availableTimeSlots.filter(slot => slot.available);
        
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Select Time</h1>
                <p className="text-gray-600">
                  Available times on {formatDateForDisplay(selectedDate)}
                </p>
              </div>
            </div>

            {availableSlots.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No available time slots for this date. 
                  <Button 
                    variant="link" 
                    className="p-0 ml-1 h-auto"
                    onClick={handleAddToWaitingList}
                  >
                    Add to waiting list
                  </Button>
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {availableSlots.map((slot) => (
                  <Card
                    key={slot.time}
                    className="p-4 cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-300"
                    onClick={() => handleTimeSelect(slot.time)}
                  >
                    <div className="text-center space-y-2">
                      <Clock className="w-5 h-5 text-blue-600 mx-auto" />
                      <div className="font-semibold text-gray-900">
                        {formatTimeForDisplay(slot.time)}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Additional Comments</h1>
                <p className="text-gray-600">Any additional information for your appointment (optional)</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(handleCommentsSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="comments">Comments (Optional)</Label>
                <textarea
                  id="comments"
                  {...register('comments')}
                  className="w-full mt-1 p-3 border rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  maxLength={512}
                  placeholder="Any specific concerns, symptoms, or requests for your appointment..."
                />
                {errors.comments && (
                  <p className="text-sm text-red-600 mt-1">{errors.comments.message}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  {watch('comments')?.length || 0}/512 characters
                </p>
              </div>

              <div className="flex space-x-4">
                <Button type="submit" className="flex-1">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Confirm Appointment
                </Button>
              </div>
            </form>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Review Appointment</h1>
              <p className="text-gray-600">Please confirm your appointment details</p>
            </div>

            {appointmentSummary && (
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {appointmentSummary.provider.name}, {appointmentSummary.provider.title}
                      </h3>
                      <p className="text-gray-600">{appointmentSummary.provider.specialty}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    <div className="flex items-center space-x-3">
                      <CalendarDays className="w-5 h-5 text-gray-400" />
                      <div>
                        <span className="font-medium">Date: </span>
                        {formatDateForDisplay(appointmentSummary.date)}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <div>
                        <span className="font-medium">Time: </span>
                        {formatTimeForDisplay(appointmentSummary.time)}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <span className="font-medium">Location: </span>
                        {appointmentSummary.provider.location}
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <MessageCircle className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <span className="font-medium">Service: </span>
                        {appointmentSummary.serviceTypeName}
                      </div>
                    </div>

                    {appointmentSummary.comments && (
                      <div className="flex items-start space-x-3">
                        <MessageCircle className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <span className="font-medium">Comments: </span>
                          <p className="text-gray-600 mt-1">{appointmentSummary.comments}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {appointmentSummary.provider.requiresApproval && (
                    <Alert className="bg-yellow-50 border-yellow-200">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-yellow-800">
                        This appointment requires provider approval. You will be notified once approved.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </Card>
            )}

            <div className="flex space-x-4">
              <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Edit
              </Button>
              <Button 
                onClick={handleFinalSubmit} 
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Appointment'}
              </Button>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6 text-center">
            {submissionResult?.success ? (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {submissionResult.requiresApproval ? 'Appointment Pending' : 'Appointment Confirmed'}
                  </h1>
                  <p className="text-gray-600">{submissionResult.message}</p>
                </div>
                
                {submissionResult.requiresApproval && (
                  <Alert className="bg-yellow-50 border-yellow-200">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      You will receive a notification once your appointment is approved by the provider.
                    </AlertDescription>
                  </Alert>
                )}
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Submission Failed</h1>
                  <p className="text-gray-600">{submissionResult?.message}</p>
                </div>
              </>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleViewAppointmentHistory}
                variant={submissionResult?.success ? "default" : "outline"}
              >
                View Appointment History
              </Button>
              {!submissionResult?.success && (
                <Button onClick={() => {
                  reset();
                  setStep(1);
                  setSubmissionResult(null);
                }}>
                  Try Again
                </Button>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress indicator */}
        {step <= 6 && (
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
              <span>Step {step} of 6</span>
              <span>
                {step === 1 && 'Service Type'}
                {step === 2 && 'Provider'}
                {step === 3 && 'Date'}
                {step === 4 && 'Time'}
                {step === 5 && 'Comments'}
                {step === 6 && 'Review'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 6) * 100}%` }}
              />
            </div>
          </div>
        )}

        <Card className="p-6">
          {renderStep()}
        </Card>
      </div>
    </div>
  );
}