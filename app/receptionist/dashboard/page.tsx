'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Calendar, 
  UserPlus, 
  Users, 
  Phone, 
  FileText, 
  LogOut, 
  ChevronDown,
  Bell,
  Clock,
  ClipboardList,
  UserCog,
  AlertCircle,
  CreditCard,
  Mail,
  Building2
} from 'lucide-react';
import { sessionManager, mockDataManager, type UserSession } from '@/lib/epic3-mock-data';
import ReceptionistLogoutModal from '@/components/receptionist/logout-modal';

export default function ReceptionistDashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userSession = sessionManager.getSession();
    
    if (!userSession || userSession.role !== 'receptionist') {
      router.push('/receptionist/login');
      return;
    }
    
    setSession(userSession);
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    if (session) {
      // Log audit event
      mockDataManager.addAuditLogEntry({
        userId: session.userId,
        userRole: 'receptionist',
        action: 'LOGOUT',
        details: `Receptionist logged out: ${session.fullName}`
      });
      
      // Clear session
      sessionManager.clearSession();
      
      // Redirect to login with logout message
      router.push('/receptionist/login?message=logged-out');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
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
              <h1 className="text-2xl font-bold text-blue-600">Atlantis HMS</h1>
              <span className="ml-4 text-gray-600">Receptionist Portal</span>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {session.fullName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block">{session.fullName}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {session.fullName.split(' ')[0]}!
          </h2>
          <p className="text-gray-600">
            Manage appointments, register patients, and handle daily operations.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex items-center p-6">
              <div className="flex-shrink-0">
                <UserPlus className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Register Patient</h3>
                <p className="text-sm text-gray-600">Add new patient to system</p>
                <Link href="/receptionist/register">
                  <Button size="sm" className="mt-2">Register</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex items-center p-6">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Appointment Calendar</h3>
                <p className="text-sm text-gray-600">Manage appointments</p>
                <Link href="/receptionist/appointment-calendar">
                  <Button size="sm" className="mt-2">
                    View Calendar
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex items-center p-6">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Patient Check-in</h3>
                <p className="text-sm text-gray-600">Check-in arriving patients</p>
                <Link href="/receptionist/check-in">
                  <Button size="sm" className="mt-2">
                    Check-in
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex items-center p-6">
              <div className="flex-shrink-0">
                <Phone className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Phone Inquiries</h3>
                <p className="text-sm text-gray-600">Handle patient calls</p>
                <Link href="/receptionist/phone-inquiries">
                  <Button size="sm" className="mt-2">
                    Manage Calls
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex items-center p-6">
              <div className="flex-shrink-0">
                <ClipboardList className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Appointment Requests</h3>
                <p className="text-sm text-gray-600">Process pending requests</p>
                <Link href="/receptionist/appointment-requests">
                  <Button size="sm" className="mt-2">
                    Review Requests
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex items-center p-6">
              <div className="flex-shrink-0">
                <UserCog className="h-8 w-8 text-teal-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Waiting List</h3>
                <p className="text-sm text-gray-600">Manage patient waitlist</p>
                <Link href="/receptionist/waiting-list">
                  <Button size="sm" className="mt-2">
                    Manage Waitlist
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex items-center p-6">
              <div className="flex-shrink-0">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Claims & Appeals</h3>
                <p className="text-sm text-gray-600">Handle rejected claims</p>
                <Link href="/receptionist/manage-rejections">
                  <Button size="sm" className="mt-2">
                    Manage Claims
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex items-center p-6">
              <div className="flex-shrink-0">
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Process Payments</h3>
                <p className="text-sm text-gray-600">Process patient payments</p>
                <Link href="/receptionist/process-payments">
                  <Button size="sm" className="mt-2">
                    Process Payments
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex items-center p-6">
              <div className="flex-shrink-0">
                <Mail className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Late Payment Report</h3>
                <p className="text-sm text-gray-600">Generate late payment reports</p>
                <Link href="/receptionist/late-payment-report">
                  <Button size="sm" className="mt-2">
                    View Reports
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex items-center p-6">
              <div className="flex-shrink-0">
                <Building2 className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Remittance Advice</h3>
                <p className="text-sm text-gray-600">Reconcile remittance advice</p>
                <Link href="/receptionist/remittance-advice">
                  <Button size="sm" className="mt-2">
                    Reconcile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex items-center p-6">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Patient Billing</h3>
                <p className="text-sm text-gray-600">View patient billing information</p>
                <Link href="/receptionist/patient-billing">
                  <Button size="sm" className="mt-2">
                    Manage Billing
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Today's Schedule
              </CardTitle>
              <CardDescription>
                Upcoming appointments and tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium">9:00 AM - Patient Registration</p>
                    <p className="text-sm text-gray-600">New patient intake</p>
                  </div>
                  <span className="text-sm text-blue-600 font-medium">Upcoming</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium">10:30 AM - Dr. Smith Appointments</p>
                    <p className="text-sm text-gray-600">5 scheduled appointments</p>
                  </div>
                  <span className="text-sm text-green-600 font-medium">Scheduled</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="font-medium">2:00 PM - Insurance Verification</p>
                    <p className="text-sm text-gray-600">Verify pending claims</p>
                  </div>
                  <span className="text-sm text-yellow-600 font-medium">Pending</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest system activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Patient registered successfully</p>
                    <p className="text-xs text-gray-500">John Smith - 2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Appointment scheduled</p>
                    <p className="text-xs text-gray-500">Dr. Wilson - 15 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Insurance verification completed</p>
                    <p className="text-xs text-gray-500">Patient ID: 12345 - 1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Phone inquiry handled</p>
                    <p className="text-xs text-gray-500">Appointment rescheduling - 2 hours ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Logout Modal */}
      <ReceptionistLogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
      />
    </div>
  );
}