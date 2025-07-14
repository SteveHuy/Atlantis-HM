"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Calendar, 
  FileText, 
  User, 
  LogOut,
  Bell,
  Settings
} from "lucide-react";

interface UserSession {
  user: string;
  expiry: number;
}

export default function PatientDashboard() {
  const [user, setUser] = useState<string | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    // Check for user session
    const sessionData = localStorage.getItem("atlantis_session") || 
                       sessionStorage.getItem("atlantis_session");
    
    if (sessionData) {
      try {
        const session: UserSession = JSON.parse(sessionData);
        if (session.expiry > Date.now()) {
          setUser(session.user);
        } else {
          // Session expired
          localStorage.removeItem("atlantis_session");
          sessionStorage.removeItem("atlantis_session");
          window.location.href = "/patient/login";
        }
      } catch (error) {
        console.error("Error parsing session:", error);
        window.location.href = "/patient/login";
      }
    } else {
      // No session found
      window.location.href = "/patient/login";
    }
  }, []);

  const handleLogout = () => {
    // Clear session
    localStorage.removeItem("atlantis_session");
    sessionStorage.removeItem("atlantis_session");
    
    // Show success message
    alert("Logged out successfully");
    
    // Redirect to login
    window.location.href = "/patient/login";
  };

  const LogoutModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="p-6 max-w-sm mx-4">
        <h3 className="text-lg font-semibold mb-4">Confirm Logout</h3>
        <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
        <div className="flex space-x-3">
          <Button
            onClick={handleLogout}
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            Yes
          </Button>
          <Button
            onClick={() => setShowLogoutModal(false)}
            variant="outline"
            className="flex-1"
          >
            No
          </Button>
        </div>
      </Card>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/">
                <Image
                  src="/atlantis-logo.svg"
                  alt="Atlantis HMS Logo"
                  width={150}
                  height={40}
                  priority
                />
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Bell className="h-6 w-6 text-gray-400" />
              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
                  <User className="h-6 w-6" />
                  <span className="font-medium">{user}</span>
                </button>
                
                {/* User Dropdown */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <div className="py-1">
                    <Link
                      href="/patient/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      Manage profile
                    </Link>
                    <button
                      onClick={() => setShowLogoutModal(true)}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {user}!
            </h1>
            <p className="text-gray-600">
              Manage your healthcare information and appointments
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Appointments</h3>
                  <p className="text-gray-600">Schedule and manage appointments</p>
                </div>
              </div>
              <div className="mt-4">
                <Button 
                  className="w-full"
                  onClick={() => alert("UD-REF: #Schedule Appointment - will be implemented in future epic")}
                >
                  View Appointments
                </Button>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Health Records</h3>
                  <p className="text-gray-600">Access your medical records</p>
                </div>
              </div>
              <div className="mt-4">
                <Button 
                  className="w-full"
                  onClick={() => alert("UD-REF: #View Medical Records - will be implemented in future epic")}
                >
                  View Records
                </Button>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Profile</h3>
                  <p className="text-gray-600">Update your information</p>
                </div>
              </div>
              <div className="mt-4">
                <Link href="/patient/profile">
                  <Button className="w-full">
                    Manage Profile
                  </Button>
                </Link>
              </div>
            </Card>
          </div>

          {/* Welcome Message */}
          <div className="mt-8">
            <Alert>
              <Bell className="h-4 w-4" />
              <AlertDescription>
                Welcome to Atlantis HMS! This is a demo patient dashboard. Many features are still in development and will be available in future updates.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </main>

      {/* Logout Modal */}
      {showLogoutModal && <LogoutModal />}
    </div>
  );
}