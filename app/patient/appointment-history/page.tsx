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
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Star,
  MessageSquare
} from "lucide-react";
import { 
  appointmentHistoryFiltersSchema, 
  type AppointmentHistoryFiltersData,
  formatDateForDisplay,
  formatTimeForDisplay,
  APPOINTMENT_STATUSES
} from "@/lib/epic4-validation";
import { 
  Epic4MockDataManager, 
  type Appointment
} from "@/lib/epic4-mock-data";

interface AppointmentHistoryState {
  appointments: Appointment[];
  total: number;
  currentPage: number;
  totalPages: number;
  filters: AppointmentHistoryFiltersData;
}

export default function AppointmentHistoryPage() {
  const [historyState, setHistoryState] = useState<AppointmentHistoryState>({
    appointments: [],
    total: 0,
    currentPage: 1,
    totalPages: 0,
    filters: {}
  });
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const itemsPerPage = 10;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<AppointmentHistoryFiltersData>({
    resolver: zodResolver(appointmentHistoryFiltersSchema)
  });

  // Load appointments on mount
  useEffect(() => {
    loadAppointments({}, 1);
  }, []);

  // Load appointments with filters and pagination
  const loadAppointments = async (filters: AppointmentHistoryFiltersData, page: number = 1) => {
    setIsLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Get filtered appointments
      const allAppointments = Epic4MockDataManager.getAppointmentHistory('patient-john', {
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        providerId: filters.providerId
      });
      
      // Paginate results
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedAppointments = allAppointments.slice(startIndex, endIndex);
      
      setHistoryState({
        appointments: paginatedAppointments,
        total: allAppointments.length,
        currentPage: page,
        totalPages: Math.ceil(allAppointments.length / itemsPerPage),
        filters
      });
      
    } catch (error) {
      console.error('Error loading appointments:', error);
      setHistoryState({
        appointments: [],
        total: 0,
        currentPage: 1,
        totalPages: 0,
        filters
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle filter form submission
  const onFilterSubmit = (data: AppointmentHistoryFiltersData) => {
    loadAppointments(data, 1);
    setShowFilters(false);
  };

  // Clear filters
  const handleClearFilters = () => {
    reset();
    loadAppointments({}, 1);
    setShowFilters(false);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    loadAppointments(historyState.filters, page);
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    const statusConfig = APPOINTMENT_STATUSES.find(s => s.value === status);
    return statusConfig?.color || 'gray';
  };

  // Get status label
  const getStatusLabel = (status: string) => {
    const statusConfig = APPOINTMENT_STATUSES.find(s => s.value === status);
    return statusConfig?.label || status;
  };

  // Get all providers for filter dropdown
  const allProviders = Epic4MockDataManager.getProviders();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Appointment History</h1>
          <p className="text-gray-600">View and manage your past appointments and medical consultations</p>
        </div>

        {/* Filters Card */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Filter Appointments</h2>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>

          {showFilters && (
            <form onSubmit={handleSubmit(onFilterSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Date From */}
                <div>
                  <Label htmlFor="dateFrom">From Date</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    {...register('dateFrom')}
                    className="mt-1"
                  />
                  {errors.dateFrom && (
                    <p className="text-sm text-red-600 mt-1">{errors.dateFrom.message}</p>
                  )}
                </div>

                {/* Date To */}
                <div>
                  <Label htmlFor="dateTo">To Date</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    {...register('dateTo')}
                    className="mt-1"
                  />
                  {errors.dateTo && (
                    <p className="text-sm text-red-600 mt-1">{errors.dateTo.message}</p>
                  )}
                </div>

                {/* Provider Filter */}
                <div>
                  <Label htmlFor="providerId">Provider</Label>
                  <select
                    id="providerId"
                    {...register('providerId')}
                    className="w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Providers</option>
                    {allProviders.map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name}
                      </option>
                    ))}
                  </select>
                  {errors.providerId && (
                    <p className="text-sm text-red-600 mt-1">{errors.providerId.message}</p>
                  )}
                </div>
              </div>

              <div className="flex space-x-4">
                <Button type="submit">Apply Filters</Button>
                <Button type="button" variant="outline" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              </div>
            </form>
          )}
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Your Appointments</h2>
            <p className="text-gray-600">
              {historyState.total === 0 
                ? "No appointments found"
                : `Showing ${((historyState.currentPage - 1) * itemsPerPage) + 1}-${Math.min(historyState.currentPage * itemsPerPage, historyState.total)} of ${historyState.total} appointments`
              }
            </p>
          </div>
          
          {historyState.total > 0 && (
            <div className="text-sm text-gray-500">
              Page {historyState.currentPage} of {historyState.totalPages}
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <Card className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading appointments...</p>
          </Card>
        )}

        {/* No Results */}
        {!isLoading && historyState.total === 0 && (
          <Alert>
            <Calendar className="h-4 w-4" />
            <AlertDescription>
              No appointments found matching your criteria. Try adjusting your filters or check back later.
            </AlertDescription>
          </Alert>
        )}

        {/* Appointments List */}
        {!isLoading && historyState.appointments.length > 0 && (
          <div className="space-y-4">
            {historyState.appointments.map((appointment) => (
              <Card key={appointment.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{appointment.providerName}</h3>
                          <p className="text-gray-600 text-sm">{appointment.serviceType}</p>
                        </div>
                      </div>
                      
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        getStatusColor(appointment.status) === 'green' ? 'bg-green-100 text-green-800' :
                        getStatusColor(appointment.status) === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                        getStatusColor(appointment.status) === 'red' ? 'bg-red-100 text-red-800' :
                        getStatusColor(appointment.status) === 'blue' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {getStatusLabel(appointment.status)}
                      </span>
                    </div>

                    {/* Appointment Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          {formatDateForDisplay(appointment.date)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          {formatTimeForDisplay(appointment.time)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{appointment.location}</span>
                      </div>
                    </div>

                    {/* Notes Preview */}
                    {appointment.notes && (
                      <div className="flex items-start space-x-2">
                        <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-700">Notes: </span>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {appointment.notes}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Feedback Preview */}
                    {appointment.feedback && (
                      <div className="flex items-start space-x-2">
                        <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-700">Your feedback: </span>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {appointment.feedback}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* View Details Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedAppointment(appointment)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {historyState.totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(historyState.currentPage - 1)}
              disabled={historyState.currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            
            {/* Page Numbers */}
            {Array.from({ length: historyState.totalPages }, (_, i) => i + 1).map((page) => {
              const showPage = page === 1 || 
                               page === historyState.totalPages || 
                               Math.abs(page - historyState.currentPage) <= 1;
              
              if (!showPage) {
                if (page === 2 && historyState.currentPage > 4) {
                  return <span key={page} className="px-2">...</span>;
                }
                if (page === historyState.totalPages - 1 && historyState.currentPage < historyState.totalPages - 3) {
                  return <span key={page} className="px-2">...</span>;
                }
                return null;
              }
              
              return (
                <Button
                  key={page}
                  variant={page === historyState.currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              );
            })}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(historyState.currentPage + 1)}
              disabled={historyState.currentPage === historyState.totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Appointment Details Modal */}
        {selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Appointment Details</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedAppointment(null)}
                  >
                    Close
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Provider Info */}
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {selectedAppointment.providerName}
                      </h3>
                      <p className="text-gray-600">{selectedAppointment.serviceType}</p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${
                        getStatusColor(selectedAppointment.status) === 'green' ? 'bg-green-100 text-green-800' :
                        getStatusColor(selectedAppointment.status) === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                        getStatusColor(selectedAppointment.status) === 'red' ? 'bg-red-100 text-red-800' :
                        getStatusColor(selectedAppointment.status) === 'blue' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {getStatusLabel(selectedAppointment.status)}
                      </span>
                    </div>
                  </div>

                  {/* Appointment Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <span className="font-medium text-gray-700">Date</span>
                          <p className="text-gray-600">
                            {formatDateForDisplay(selectedAppointment.date)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <div>
                          <span className="font-medium text-gray-700">Time</span>
                          <p className="text-gray-600">
                            {formatTimeForDisplay(selectedAppointment.time)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <div>
                          <span className="font-medium text-gray-700">Location</span>
                          <p className="text-gray-600">{selectedAppointment.location}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <span className="font-medium text-gray-700">Booked On</span>
                          <p className="text-gray-600">
                            {new Date(selectedAppointment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedAppointment.notes && (
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <span className="font-medium text-gray-700">Clinical Notes</span>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {selectedAppointment.notes}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Feedback */}
                  {selectedAppointment.feedback && (
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Star className="w-5 h-5 text-gray-400" />
                        <span className="font-medium text-gray-700">Your Feedback</span>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {selectedAppointment.feedback}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}