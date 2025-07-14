import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, User } from "lucide-react";
import { mockUpcomingAppointments } from "@/lib/mockDashboardData";
import { dashboardLogger } from "@/lib/logger";

export function AppointmentSummary() {
  const upcomingAppointments = mockUpcomingAppointments.slice(0, 3);

  const handleViewAll = () => {
    dashboardLogger.logDashboardEvent('view_all_appointments_click');
    alert("UD-REF: #View Appointment History - will be implemented in future epic");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (upcomingAppointments.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h3>
          <Calendar className="w-5 h-5 text-gray-400" />
        </div>
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No upcoming appointments</p>
          <Button 
            className="mt-4" 
            variant="outline"
            onClick={() => alert("UD-REF: #Schedule Appointment - will be implemented in future epic")}
          >
            Schedule Appointment
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h3>
        <Calendar className="w-5 h-5 text-blue-600" />
      </div>

      <div className="space-y-4">
        {upcomingAppointments.map((appointment) => (
          <div 
            key={appointment.id}
            className="border-l-4 border-blue-500 pl-4 py-2 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-sm font-medium text-gray-900">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>{formatDate(appointment.date)}</span>
                  <Clock className="w-4 h-4 text-gray-400 ml-2" />
                  <span>{appointment.time}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{appointment.provider}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{appointment.location}</span>
                </div>
                
                <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                  {appointment.type}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={handleViewAll}
        >
          View All Appointments
        </Button>
      </div>
    </Card>
  );
}