"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Clock, 
  Calendar, 
  User, 
  MapPin, 
  Plus, 
  Trash2, 
  AlertCircle,
  CheckCircle,
  Bell
} from "lucide-react";
import { 
  waitlistSchema, 
  type WaitlistData,
  formatDateForDisplay,
  formatTimeForDisplay,
  PREFERRED_TIMES
} from "@/lib/epic4-validation";
import { 
  Epic4MockDataManager, 
  type WaitlistEntry,
  type Provider,
  type ServiceType
} from "@/lib/epic4-mock-data";

export default function WaitingListPage() {
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<WaitlistData>({
    resolver: zodResolver(waitlistSchema)
  });

  const serviceTypes = Epic4MockDataManager.getServiceTypes();
  const providers = Epic4MockDataManager.getProviders();
  const selectedServiceType = watch('serviceType');

  // Load waitlist entries on mount and handle URL parameters
  useEffect(() => {
    loadWaitlistEntries();
    
    // Pre-fill form if URL parameters are present
    const serviceType = searchParams.get('serviceType');
    const providerId = searchParams.get('providerId');
    
    if (serviceType || providerId) {
      if (serviceType) {
        setValue('serviceType', serviceType);
      }
      if (providerId) {
        setValue('providerId', providerId);
      }
      setShowAddForm(true);
    }
  }, []);

  // Filter providers based on selected service type
  const filteredProviders = selectedServiceType 
    ? providers.filter(p => 
        p.serviceTypes.some(st => 
          serviceTypes.find(type => type.id === st)?.name === selectedServiceType
        )
      )
    : providers;

  // Load current waitlist entries
  const loadWaitlistEntries = () => {
    const entries = Epic4MockDataManager.getWaitlistEntries('patient-john');
    setWaitlistEntries(entries);
  };

  // Handle form submission
  const onSubmit = async (data: WaitlistData) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find the selected provider
      const provider = providers.find(p => p.id === data.providerId);
      if (!provider) {
        throw new Error('Provider not found');
      }
      
      // Add to waitlist
      const newEntry = Epic4MockDataManager.addToWaitlist({
        patientId: 'patient-john',
        providerId: data.providerId,
        providerName: provider.name,
        serviceType: data.serviceType,
        preferredDateRange: {
          start: data.preferredDateStart,
          end: data.preferredDateEnd
        },
        preferredTimes: data.preferredTimes,
        status: 'active'
      });
      
      setNotification({
        type: 'success',
        message: 'Added to waitlist'
      });
      
      // Refresh the list
      loadWaitlistEntries();
      
      // Reset form and hide it
      reset();
      setShowAddForm(false);
      
      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
      
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to add to waitlist. Please try again.'
      });
      
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Remove from waitlist
  const handleRemoveFromWaitlist = async (entryId: string) => {
    if (!confirm('Are you sure you want to remove this waitlist entry?')) {
      return;
    }
    
    try {
      const success = Epic4MockDataManager.removeFromWaitlist(entryId);
      
      if (success) {
        setNotification({
          type: 'success',
          message: 'Removed from waitlist'
        });
        
        loadWaitlistEntries();
        
        setTimeout(() => setNotification(null), 3000);
      } else {
        throw new Error('Failed to remove entry');
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to remove from waitlist. Please try again.'
      });
      
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Simulate slot becoming available
  const simulateSlotAvailable = (entry: WaitlistEntry) => {
    setNotification({
      type: 'info',
      message: `Good news! A slot has become available with ${entry.providerName}. You can now book an appointment.`
    });
    
    setTimeout(() => setNotification(null), 5000);
  };

  // Handle preferred times selection
  const handlePreferredTimeChange = (time: string, checked: boolean) => {
    const currentTimes = watch('preferredTimes') || [];
    
    if (checked) {
      setValue('preferredTimes', [...currentTimes, time]);
    } else {
      setValue('preferredTimes', currentTimes.filter(t => t !== time));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Waiting List Management</h1>
          <p className="text-gray-600">Manage your position on waiting lists for services and providers</p>
        </div>

        {/* Notification */}
        {notification && (
          <Alert className={`mb-6 ${
            notification.type === 'success' ? 'bg-green-50 border-green-200' :
            notification.type === 'error' ? 'bg-red-50 border-red-200' :
            'bg-blue-50 border-blue-200'
          }`}>
            {notification.type === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
            {notification.type === 'error' && <AlertCircle className="h-4 w-4 text-red-600" />}
            {notification.type === 'info' && <Bell className="h-4 w-4 text-blue-600" />}
            <AlertDescription className={
              notification.type === 'success' ? 'text-green-800' :
              notification.type === 'error' ? 'text-red-800' :
              'text-blue-800'
            }>
              {notification.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Current Waitlist Entries */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Current Waitlist Entries</h2>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="w-4 h-4 mr-2" />
              Add to Waitlist
            </Button>
          </div>

          {waitlistEntries.length === 0 ? (
            <Card className="p-8 text-center">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Waitlist Entries</h3>
              <p className="text-gray-600 mb-4">
                You are not currently on any waiting lists. Add yourself to a waitlist when your preferred appointment slots are not available.
              </p>
              <Button variant="outline" onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add to Waitlist
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {waitlistEntries.map((entry) => (
                <Card key={entry.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      {/* Provider Info */}
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{entry.providerName}</h3>
                          <p className="text-gray-600 text-sm">{entry.serviceType}</p>
                        </div>
                      </div>

                      {/* Waitlist Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            Preferred dates: {formatDateForDisplay(entry.preferredDateRange.start)} - {formatDateForDisplay(entry.preferredDateRange.end)}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            Position: #{entry.position}
                          </span>
                        </div>
                      </div>

                      {/* Preferred Times */}
                      <div>
                        <span className="text-sm font-medium text-gray-700">Preferred times: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {entry.preferredTimes.map((time) => (
                            <span 
                              key={time}
                              className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                            >
                              {formatTimeForDisplay(time)}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Status */}
                      <div className="flex items-center space-x-4">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                          entry.status === 'active' ? 'bg-green-100 text-green-800' :
                          entry.status === 'notified' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {entry.status === 'active' ? 'Active' :
                           entry.status === 'notified' ? 'Slot Available' :
                           'Expired'}
                        </span>
                        
                        <span className="text-xs text-gray-500">
                          Added {new Date(entry.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => simulateSlotAvailable(entry)}
                      >
                        <Bell className="w-4 h-4 mr-1" />
                        Test Notify
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveFromWaitlist(entry.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Add to Waitlist Form */}
        {showAddForm && (
          <Card className="p-6 mt-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Add to Waitlist</h2>
              <p className="text-gray-600">Join a waiting list for your preferred provider and service</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Service Type */}
              <div>
                <Label htmlFor="serviceType">Service Type</Label>
                <select
                  id="serviceType"
                  {...register('serviceType')}
                  className="w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a service type</option>
                  {serviceTypes.map((serviceType) => (
                    <option key={serviceType.id} value={serviceType.name}>
                      {serviceType.name}
                    </option>
                  ))}
                </select>
                {errors.serviceType && (
                  <p className="text-sm text-red-600 mt-1">{errors.serviceType.message}</p>
                )}
              </div>

              {/* Provider */}
              <div>
                <Label htmlFor="providerId">Provider</Label>
                <select
                  id="providerId"
                  {...register('providerId')}
                  className="w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!selectedServiceType}
                >
                  <option value="">Select a provider</option>
                  {filteredProviders.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}, {provider.title} - {provider.specialty}
                    </option>
                  ))}
                </select>
                {errors.providerId && (
                  <p className="text-sm text-red-600 mt-1">{errors.providerId.message}</p>
                )}
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="preferredDateStart">Preferred Start Date</Label>
                  <Input
                    id="preferredDateStart"
                    type="date"
                    {...register('preferredDateStart')}
                    min={new Date().toISOString().split('T')[0]}
                    className="mt-1"
                  />
                  {errors.preferredDateStart && (
                    <p className="text-sm text-red-600 mt-1">{errors.preferredDateStart.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="preferredDateEnd">Preferred End Date</Label>
                  <Input
                    id="preferredDateEnd"
                    type="date"
                    {...register('preferredDateEnd')}
                    min={new Date().toISOString().split('T')[0]}
                    className="mt-1"
                  />
                  {errors.preferredDateEnd && (
                    <p className="text-sm text-red-600 mt-1">{errors.preferredDateEnd.message}</p>
                  )}
                </div>
              </div>

              {/* Preferred Times */}
              <div>
                <Label>Preferred Times</Label>
                <div className="mt-2 grid grid-cols-3 md:grid-cols-6 gap-2">
                  {PREFERRED_TIMES.map((time) => (
                    <label key={time} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        onChange={(e) => handlePreferredTimeChange(time, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{formatTimeForDisplay(time)}</span>
                    </label>
                  ))}
                </div>
                {errors.preferredTimes && (
                  <p className="text-sm text-red-600 mt-1">{errors.preferredTimes.message}</p>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Join Waitlist'}
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}