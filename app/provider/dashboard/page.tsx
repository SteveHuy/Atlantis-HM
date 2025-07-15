'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Calendar, 
  Users, 
  FileText, 
  LogOut, 
  Stethoscope,
  ClipboardList,
  Pill,
  MessageSquare,
  AlertTriangle,
  Shield,
  Edit
} from 'lucide-react';
import { sessionManager, mockDataManager, type UserSession } from '@/lib/epic3-mock-data';
import ServiceProviderLogoutModal from '@/components/provider/logout-modal';

export default function ServiceProviderDashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userSession = sessionManager.getSession();
    
    if (!userSession || userSession.role !== 'provider') {
      router.push('/provider/login');
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
      // Log audit event in User Activity Logs Table
      mockDataManager.addAuditLogEntry({
        userId: session.userId,
        userRole: 'provider',
        action: 'LOGOUT',
        details: `Service provider logged out: ${session.fullName}`
      });
      
      // Clear session and cookies
      sessionManager.clearSession();
      
      // Redirect to login page
      router.push('/provider/login?message=logged-out');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
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
              <span className="ml-4 text-gray-600">Service Provider Portal</span>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, {session.fullName}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Provider Dashboard
          </h2>
          <p className="text-gray-600">
            Access appointment schedules, patient records, and clinical tools.
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex items-center p-6">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Appointment Schedules</h3>
                <p className="text-sm text-gray-600">View and manage schedules</p>
                <Button 
                  size="sm" 
                  className="mt-2 bg-purple-600 hover:bg-purple-700"
                  onClick={() => router.push("/provider/appointment-schedules")}
                >
                  View Schedules
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex items-center p-6">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Patient EHR</h3>
                <p className="text-sm text-gray-600">Electronic health records</p>
                <Button 
                  size="sm" 
                  className="mt-2"
                  onClick={() => router.push("/provider/patient-ehr")}
                >
                  Access EHR
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex items-center p-6">
              <div className="flex-shrink-0">
                <Stethoscope className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Patient Encounters</h3>
                <p className="text-sm text-gray-600">Document encounters</p>
                <Button 
                  size="sm" 
                  className="mt-2"
                  onClick={() => router.push("/provider/encounter")}
                >
                  New Encounter
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex items-center p-6">
              <div className="flex-shrink-0">
                <MessageSquare className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Secure Messaging</h3>
                <p className="text-sm text-gray-600">Communicate with patients</p>
                <Button 
                  size="sm" 
                  className="mt-2"
                  onClick={() => router.push("/provider/secure-messaging")}
                >
                  Messages
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Clinical Tools Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-blue-600" />
                Clinical Tools
              </CardTitle>
              <CardDescription>
                Access clinical management tools and resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push("/provider/lab-tests")}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Order Lab Tests
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push("/provider/lab-results")}
                >
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Review Lab Results
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push("/provider/referrals")}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Generate Referrals
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push("/provider/allergies")}
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Update Allergies
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push("/provider/immunizations")}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Track Immunizations
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push("/provider/encounter-notes")}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Update Encounter Notes
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push("/provider/medication-orders")}
                >
                  <Pill className="mr-2 h-4 w-4" />
                  Medication Orders
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push("/provider/view-schedules")}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  View Provider Schedules
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push("/provider/update-schedules")}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Update Provider Schedules
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push("/provider/prescription-refills")}
                >
                  <Pill className="mr-2 h-4 w-4" />
                  Manage Prescription Refills
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                Patient Information
              </CardTitle>
              <CardDescription>
                Quick access to patient data and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium">Total Patients</p>
                    <p className="text-2xl font-bold text-blue-600">247</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium">Today's Appointments</p>
                    <p className="text-2xl font-bold text-green-600">12</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="font-medium">Pending Lab Results</p>
                    <p className="text-2xl font-bold text-yellow-600">5</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div>
                    <p className="font-medium">Unread Messages</p>
                    <p className="text-2xl font-bold text-purple-600">3</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* HIPAA Compliance Footer */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800">
            <FileText className="h-4 w-4" />
            <span className="text-sm font-medium">HIPAA Compliance Notice:</span>
          </div>
          <p className="text-xs text-blue-700 mt-1">
            All patient data access and interactions are logged for security and compliance purposes. 
            Ensure patient confidentiality is maintained at all times.
          </p>
        </div>
      </main>

      {/* Logout Modal */}
      <ServiceProviderLogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
      />
    </div>
  );
}