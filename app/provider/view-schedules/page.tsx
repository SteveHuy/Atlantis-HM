'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Filter, ArrowLeft, Search } from 'lucide-react';
import { sessionManager, type UserSession } from '@/lib/epic3-mock-data';
import { serviceProviderDataManager, mockProviders, type Provider, type TimeSlot } from '@/lib/service-provider-mock-data';
import { viewProviderSchedulesSchema, type ViewProviderSchedulesInput } from '@/lib/service-provider-validation';

export default function ViewProviderSchedulesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form state
  const [selectedProviderId, setSelectedProviderId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'booked' | 'blocked'>('all');
  
  // Results state
  const [scheduleData, setScheduleData] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const userSession = sessionManager.getSession();
    
    if (!userSession || userSession.role !== 'provider') {
      router.push('/provider/login');
      return;
    }
    
    setSession(userSession);
    
    // Set default date range (next 7 days)
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    setStartDate(today.toISOString().split('T')[0]);
    setEndDate(nextWeek.toISOString().split('T')[0]);
    
    setIsLoading(false);
  }, [router]);

  const handleSearch = async () => {
    setSearchError('');
    setIsSearching(true);
    
    try {
      // Validate input
      const validationResult = viewProviderSchedulesSchema.safeParse({
        providerId: selectedProviderId,
        startDate,
        endDate,
        availabilityFilter
      });

      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(e => e.message).join(', ');
        setSearchError(errors);
        setIsSearching(false);
        return;
      }

      // Generate schedule data
      const schedules = serviceProviderDataManager.generateScheduleForProvider(
        selectedProviderId,
        startDate,
        endDate
      );

      // Apply availability filter
      const filteredSchedules = schedules.map(schedule => ({
        ...schedule,
        timeSlots: schedule.timeSlots.filter(slot => {
          if (availabilityFilter === 'all') return true;
          return slot.status === availabilityFilter;
        })
      })).filter(schedule => schedule.timeSlots.length > 0);

      setScheduleData(filteredSchedules);
      setHasSearched(true);

      // Log the search
      serviceProviderDataManager.logSecurityEvent(
        'SCHEDULE_VIEWED',
        'provider_schedule',
        selectedProviderId,
        `Schedule viewed for date range ${startDate} to ${endDate}`
      );

    } catch (error) {
      setSearchError('An error occurred while searching. Please try again.');
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleTimeSlotClick = (slot: TimeSlot) => {
    if (slot.status === 'available') {
      // Navigate to Schedule Appointment with pre-filled data
      const params = new URLSearchParams({
        providerId: selectedProviderId,
        date: slot.startTime, // This would be properly formatted in real implementation
        time: slot.startTime
      });
      router.push(`/patient/schedule-appointment?${params.toString()}`);
    } else {
      // UD-REF: Navigate to Schedule Appointment or show appointment details
      alert('UD-REF: #Schedule Appointment - will be implemented in future epic');
    }
  };

  const handleBackToServices = () => {
    // UD-REF: Navigate back to Search for Services
    alert('UD-REF: #Search for Services - will be implemented in future epic');
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
                onClick={() => router.push('/provider/dashboard')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-blue-600">View Provider Schedules</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {session.fullName}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-blue-600" />
              Schedule Search
            </CardTitle>
            <CardDescription>
              Select a provider and date range to view their schedule
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Provider Selection */}
              <div>
                <label htmlFor="provider" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Provider *
                </label>
                <select
                  id="provider"
                  value={selectedProviderId}
                  onChange={(e) => setSelectedProviderId(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Choose a provider...</option>
                  {mockProviders.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name} - {provider.specialty}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* End Date */}
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Availability Filter */}
              <div>
                <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Availability
                </label>
                <select
                  id="filter"
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Time Slots</option>
                  <option value="available">Available Only</option>
                  <option value="booked">Booked Only</option>
                  <option value="blocked">Blocked Only</option>
                </select>
              </div>
            </div>

            {/* Search Error */}
            {searchError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{searchError}</p>
              </div>
            )}

            {/* Search Button */}
            <div className="mt-6">
              <Button
                onClick={handleSearch}
                disabled={isSearching || !selectedProviderId || !startDate || !endDate}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSearching ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search Schedule
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Legend */}
        {hasSearched && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-600" />
                Schedule Legend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                  <span className="text-sm text-gray-700">Available - Click to schedule</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                  <span className="text-sm text-gray-700">Booked - Appointment scheduled</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
                  <span className="text-sm text-gray-700">Blocked - Provider unavailable</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Schedule Results */}
        {hasSearched && (
          <>
            {scheduleData.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No schedule found</h3>
                  <p className="text-gray-600 mb-4">
                    No time slots found for the selected criteria. Try adjusting your search parameters.
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleBackToServices}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Services
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {scheduleData.map((schedule) => (
                  <Card key={schedule.date}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        {new Date(schedule.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </CardTitle>
                      <CardDescription>
                        {schedule.timeSlots.length} time slot{schedule.timeSlots.length !== 1 ? 's' : ''} found
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                        {schedule.timeSlots.map((slot: TimeSlot) => (
                          <div
                            key={slot.id}
                            onClick={() => handleTimeSlotClick(slot)}
                            className={`
                              p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md
                              ${getSlotStatusColor(slot.status)}
                              ${slot.status === 'available' ? 'hover:scale-105' : ''}
                            `}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Clock className="h-4 w-4" />
                              <span className="font-medium text-sm">
                                {slot.startTime} - {slot.endTime}
                              </span>
                            </div>
                            <div className="text-xs capitalize font-medium">
                              {slot.status}
                            </div>
                            {slot.notes && (
                              <div className="text-xs mt-1 opacity-75">
                                {slot.notes}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Navigation Actions */}
                <Card>
                  <CardContent className="text-center py-6">
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button
                        variant="outline"
                        onClick={handleBackToServices}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Services
                      </Button>
                      <Button
                        onClick={() => {
                          setHasSearched(false);
                          setScheduleData([]);
                          setSelectedProviderId('');
                        }}
                      >
                        <Search className="mr-2 h-4 w-4" />
                        New Search
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}