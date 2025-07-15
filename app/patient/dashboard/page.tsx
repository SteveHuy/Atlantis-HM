"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Bell, User, Settings, LogOut, FileText, Calendar, CreditCard, MessageSquare, Shield } from "lucide-react";
import { mockPatient, dashboardFeatures } from "@/lib/mockDashboardData";
import { dashboardLogger } from "@/lib/logger";

// Component imports
import { AppointmentSummary } from "@/components/patient/appointment-summary";
import { RecentActivity } from "@/components/patient/recent-activity";
import { ClaimStatus } from "@/components/patient/claim-status";
import { SettingsCard } from "@/components/patient/settings-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/patient/logout-button";
import { AlertBanner } from "@/components/patient/alert-banner";
import { SearchBar } from "@/components/patient/search-bar";

interface UserSession {
  user: string;
  expiry: number;
}

export default function PatientDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for user session
    const sessionData = localStorage.getItem("atlantis_session") || 
                       sessionStorage.getItem("atlantis_session");
    
    if (sessionData) {
      try {
        const session: UserSession = JSON.parse(sessionData);
        if (session.expiry > Date.now()) {
          setUser(session.user);
          
          // Log dashboard visit
          dashboardLogger.logDashboardEvent('dashboard_visit', {
            sessionType: localStorage.getItem("atlantis_session") ? 'persistent' : 'session'
          });
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
    
    setIsLoading(false);
  }, []);

  const handleFeatureSelect = (featureId: string) => {
    switch (featureId) {
      case 'messages':
        router.push('/patient/messages');
        break;
      case 'appointment-history':
        router.push('/patient/appointment-history');
        break;
      case 'appointment-reminders':
        router.push('/patient/appointment-reminders');
        break;
      case 'medical-records':
        router.push('/patient/medical-records');
        break;
      default:
        const feature = dashboardFeatures.find(f => f.id === featureId);
        if (feature) {
          alert(`UD-REF: ${feature.requirementRef} - will be implemented in future epic`);
        }
        break;
    }
  };

  const handleFeatureClick = (feature: any) => {
    dashboardLogger.logDashboardEvent('feature_card_click', {
      featureId: feature.id,
      featureTitle: feature.title,
      requirementRef: feature.requirementRef
    });

    // Handle implemented features
    switch (feature.id) {
      case 'messages':
        router.push('/patient/messages');
        break;
      case 'medical-records':
        router.push('/patient/medical-records');
        break;
      case 'appointment-history':
        router.push('/patient/appointment-history');
        break;
      case 'appointment-reminders':
        router.push('/patient/appointment-reminders');
        break;
      default:
        // Show placeholder for features not yet implemented
        alert(`UD-REF: ${feature.requirementRef} - will be implemented in future epic`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return null; // This should not happen due to redirect logic above
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
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
            
            {/* Search Bar */}
            <div className="hidden md:block">
              <SearchBar onFeatureSelect={handleFeatureSelect} />
            </div>
            
            <div className="flex items-center space-x-4">
              <Bell className="h-6 w-6 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
              <div className="relative group">
                <button 
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
                  aria-label="User menu"
                >
                  <User className="h-6 w-6" />
                  <span className="font-medium">{mockPatient.firstName}</span>
                </button>
                
                {/* User Dropdown */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <div className="py-1">
                    <Link
                      href="/patient/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      Manage profile
                    </Link>
                    <button
                      onClick={() => dashboardLogger.logDashboardEvent('logout_intent_header')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
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
          {/* Page Heading */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Patient Dashboard
            </h1>
            <div className="mt-2">
              <h2 className="text-xl text-gray-700">
                Welcome, {mockPatient.firstName}!
              </h2>
              <p className="text-gray-600 mt-1">
                Manage your healthcare information and appointments from your personalized dashboard.
              </p>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden mb-6">
            <SearchBar onFeatureSelect={handleFeatureSelect} />
          </div>

          {/* Alert Banner */}
          <AlertBanner />

          {/* Dashboard Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Features */}
            <div className="lg:col-span-2 space-y-6">
              {/* Feature Navigation Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dashboardFeatures.map((feature) => (
                  <Card key={feature.id} className="p-4 hover:shadow-lg transition-shadow cursor-pointer group">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        feature.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                        feature.color === 'green' ? 'bg-green-100 text-green-600' :
                        feature.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
                        feature.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {feature.icon === 'MessageSquare' && <MessageSquare className="w-5 h-5" />}
                        {feature.icon === 'FileText' && <FileText className="w-5 h-5" />}
                        {feature.icon === 'Calendar' && <Calendar className="w-5 h-5" />}
                        {feature.icon === 'Bell' && <Bell className="w-5 h-5" />}
                        {feature.icon === 'Shield' && <Shield className="w-5 h-5" />}
                        {feature.icon === 'CreditCard' && <CreditCard className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                    <Button 
                      className="w-full mt-3" 
                      variant="outline"
                      onClick={() => handleFeatureClick(feature)}
                    >
                      Access {feature.title}
                    </Button>
                  </Card>
                ))}
              </div>

              {/* Upcoming Appointments */}
              <AppointmentSummary />

              {/* Recent Activity */}
              <RecentActivity />
            </div>

            {/* Right Column - Secondary Features */}
            <div className="space-y-6">
              {/* Insurance Claims */}
              <ClaimStatus />

              {/* Account Settings */}
              <SettingsCard />

              {/* Logout */}
              <LogoutButton />
            </div>
          </div>

          {/* Help & Support Section */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Need Help?
              </h3>
              <p className="text-gray-600 mb-4">
                Our support team is here to assist you with any questions or concerns.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm">
                <a 
                  href="mailto:support@atlantishms.com" 
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                  onClick={() => dashboardLogger.logDashboardEvent('support_email_click')}
                >
                  support@atlantishms.com
                </a>
                <span className="hidden sm:inline text-gray-400">|</span>
                <button 
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                  onClick={() => {
                    dashboardLogger.logDashboardEvent('faq_click');
                    alert("FAQ section will be implemented in future epic");
                  }}
                >
                  FAQ & Help Center
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}