"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { 
  Calendar, 
  Shield, 
  CreditCard, 
  Clock,
  FileText,
  Users,
  Award
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Navigation Bar */}
      <nav className="sticky top-0 bg-white border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Image
                src="/atlantis-logo.svg"
                alt="Atlantis HMS Logo"
                width={150}
                height={40}
                priority
              />
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a 
                href="#login-register" 
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                aria-label="Navigate to login or register section"
              >
                Login or Register
              </a>
              <a 
                href="#features" 
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                aria-label="Navigate to features section"
              >
                Features
              </a>
              <a 
                href="#pricing" 
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                aria-label="Navigate to pricing section"
              >
                Pricing
              </a>
              <a 
                href="mailto:contact@atlantishms.com" 
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                aria-label="Contact Atlantis HMS via email"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-blue-900 mb-6">
            Atlantis HMS – Modern Healthcare Management, Simplified.
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
            Streamline appointments, manage health records securely, and process insurance claims with ease. HIPAA compliant and accessible anywhere.
          </p>
          <div className="mt-12">
            <div className="relative w-full max-w-4xl mx-auto h-64 bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-20"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-gray-600 text-lg">Professional Healthcare Management Interface</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Overview Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Atlantis HMS?
            </h2>
            <p className="text-xl text-gray-600">
              Comprehensive healthcare management tools designed for modern practices
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Fast, flexible appointment scheduling
              </h3>
              <p className="text-gray-600">
                Streamline your booking process with intuitive scheduling tools
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Secure, accessible Electronic Health Records (EHR)
              </h3>
              <p className="text-gray-600">
                Access patient records securely from anywhere with HIPAA compliance
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Real-time insurance claims processing
              </h3>
              <p className="text-gray-600">
                Process and track insurance claims with real-time updates
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                HIPAA compliance &amp; mobile friendly
              </h3>
              <p className="text-gray-600">
                Secure, compliant, and accessible on all your devices
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Device Preview/Visuals */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Access your healthcare management tools anywhere.
            </h2>
          </div>
          
          <div className="flex justify-center items-end space-x-8">
            {/* Desktop mockup */}
            <div className="hidden lg:block">
              <div className="w-64 h-40 bg-white rounded-lg shadow-lg border-4 border-gray-300 p-2">
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 rounded flex items-center justify-center">
                  <span className="text-xs text-gray-600">Desktop</span>
                </div>
              </div>
            </div>
            
            {/* Tablet mockup */}
            <div className="hidden md:block">
              <div className="w-32 h-44 bg-white rounded-lg shadow-lg border-4 border-gray-300 p-2">
                <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-200 rounded flex items-center justify-center">
                  <span className="text-xs text-gray-600">Tablet</span>
                </div>
              </div>
            </div>
            
            {/* Mobile mockup */}
            <div>
              <div className="w-20 h-36 bg-white rounded-lg shadow-lg border-4 border-gray-300 p-1">
                <div className="w-full h-full bg-gradient-to-br from-purple-100 to-purple-200 rounded flex items-center justify-center">
                  <span className="text-xs text-gray-600">Mobile</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* User Type Section */}
      <section id="login-register" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Who Are You?
            </h2>
            <p className="text-xl text-gray-600">
              Choose your role to access the right tools for your needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Patient</h3>
              <p className="text-gray-600 mb-6">
                Manage appointments and health records.
              </p>
              <div className="space-y-3">
                <Link href="/patient/login">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700" aria-label="Go to patient login">
                    Patient Login
                  </Button>
                </Link>
                <Link href="/patient/register">
                  <Button variant="outline" className="w-full" aria-label="Go to patient registration">
                    Patient Register
                  </Button>
                </Link>
              </div>
            </Card>

            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Reception Staff</h3>
              <p className="text-gray-600 mb-6">
                Handle scheduling and patient intake.
              </p>
              <div className="space-y-3">
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700" 
                  onClick={() => alert("Receptionist login will be available in a future update")}
                  aria-label="Go to receptionist login"
                >
                  Receptionist Login
                </Button>
              </div>
            </Card>

            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Service Provider</h3>
              <p className="text-gray-600 mb-6">
                Access EHR and billing tools.
              </p>
              <div className="space-y-3">
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={() => alert("Service Provider login will be available in a future update")}
                  aria-label="Go to service provider login"
                >
                  Service Provider Login
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-600">
              Flexible pricing for healthcare practices of all sizes
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 relative">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Basic Plan</h3>
                <div className="text-3xl font-bold text-blue-600 mb-4">$29<span className="text-lg text-gray-500">/month</span></div>
                <p className="text-gray-600 mb-6">Essential features for small practices</p>
                
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Appointment scheduling
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Basic EHR access
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Patient portal
                  </li>
                </ul>
                
                <div className="space-y-3">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => alert("Free trial will be available soon!")}
                  >
                    Start Free Trial
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => alert("Purchase option will be available soon!")}
                  >
                    Purchase
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-8 relative border-2 border-blue-500">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">Most Popular</span>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Standard Plan</h3>
                <div className="text-3xl font-bold text-blue-600 mb-4">$59<span className="text-lg text-gray-500">/month</span></div>
                <p className="text-gray-600 mb-6">All Basic plus additional reporting tools</p>
                
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Everything in Basic
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Advanced reporting
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Insurance claims
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Analytics dashboard
                  </li>
                </ul>
                
                <div className="space-y-3">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => alert("Free trial will be available soon!")}
                  >
                    Start Free Trial
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => alert("Purchase option will be available soon!")}
                  >
                    Purchase
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-8 relative">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Premium Plan</h3>
                <div className="text-3xl font-bold text-blue-600 mb-4">$99<span className="text-lg text-gray-500">/month</span></div>
                <p className="text-gray-600 mb-6">All Standard plus priority support</p>
                
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Everything in Standard
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Priority support
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Custom integrations
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Dedicated account manager
                  </li>
                </ul>
                
                <div className="space-y-3">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => alert("Free trial will be available soon!")}
                  >
                    Start Free Trial
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => alert("Purchase option will be available soon!")}
                  >
                    Purchase
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <Image
                src="/atlantis-logo.svg"
                alt="Atlantis HMS Logo"
                width={150}
                height={40}
                className="brightness-0 invert"
              />
            </div>
            
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
              <a 
                href="#" 
                className="hover:text-blue-400 transition-colors"
                onClick={() => alert("Privacy Policy will be available soon")}
              >
                Privacy Policy
              </a>
              <a 
                href="#" 
                className="hover:text-blue-400 transition-colors"
                onClick={() => alert("Terms of Use will be available soon")}
              >
                Terms of Use
              </a>
              <a 
                href="mailto:contact@atlantishms.com" 
                className="hover:text-blue-400 transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-700 text-center">
            <p className="text-gray-400">
              © 2024 Atlantis HMS. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
