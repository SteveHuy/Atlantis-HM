"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, Mail, Printer, User, Calendar, FileText, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UserSession {
  user: string;
  expiry: number;
}

interface PatientStatementData {
  patientId: string;
  patientName: string;
  patientEmail: string;
  address: string;
  dateFrom: string;
  dateTo: string;
  charges: Array<{
    date: string;
    description: string;
    amount: number;
  }>;
  payments: Array<{
    date: string;
    amount: number;
    method: string;
  }>;
  currentBalance: number;
}

const MOCK_PATIENTS = [
  { id: "P001", name: "John Smith", email: "john.smith@email.com" },
  { id: "P002", name: "Sarah Johnson", email: "sarah.johnson@email.com" },
  { id: "P003", name: "Michael Davis", email: "michael.davis@email.com" },
  { id: "P004", name: "Emily Wilson", email: "emily.wilson@email.com" },
  { id: "P005", name: "David Brown", email: "david.brown@email.com" }
];

export default function GenerateStatementsPage() {
  const router = useRouter();
  const [user, setUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statementData, setStatementData] = useState<PatientStatementData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Check for receptionist session
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
          router.push("/receptionist/login");
        }
      } catch (error) {
        console.error("Error parsing session:", error);
        router.push("/receptionist/login");
      }
    } else {
      router.push("/receptionist/login");
    }
    
    setIsLoading(false);
  }, [router]);

  const generateMockStatementData = (patientId: string, dateFrom: string, dateTo: string): PatientStatementData => {
    const patient = MOCK_PATIENTS.find(p => p.id === patientId);
    
    return {
      patientId,
      patientName: patient?.name || "Unknown Patient",
      patientEmail: patient?.email || "unknown@email.com",
      address: "123 Main St, City, State 12345",
      dateFrom,
      dateTo,
      charges: [
        {
          date: "2024-07-01",
          description: "Office Visit - General Consultation",
          amount: 150.00
        },
        {
          date: "2024-07-05",
          description: "Laboratory Tests - Blood Panel",
          amount: 85.00
        },
        {
          date: "2024-07-10",
          description: "X-Ray - Chest",
          amount: 120.00
        }
      ],
      payments: [
        {
          date: "2024-07-03",
          amount: 100.00,
          method: "Credit Card"
        },
        {
          date: "2024-07-15",
          amount: 50.00,
          method: "Insurance Payment"
        }
      ],
      currentBalance: 205.00
    };
  };

  const handleGenerateStatement = () => {
    // Validate inputs
    if (!selectedPatient) {
      setErrorMessage('Please select a patient');
      return;
    }
    if (!dateFrom || !dateTo) {
      setErrorMessage('Please select both from and to dates');
      return;
    }
    if (new Date(dateFrom) > new Date(dateTo)) {
      setErrorMessage('From date cannot be after to date');
      return;
    }

    setErrorMessage('');
    setIsGenerating(true);

    // Simulate API call delay
    setTimeout(() => {
      const mockData = generateMockStatementData(selectedPatient, dateFrom, dateTo);
      setStatementData(mockData);
      setShowPreview(true);
      setIsGenerating(false);
    }, 1000);
  };

  const handleSendStatement = () => {
    if (!deliveryMethod) {
      setErrorMessage('Please select a delivery method');
      return;
    }

    setErrorMessage('');

    // Simulate sending
    setTimeout(() => {
      if (deliveryMethod === 'email') {
        setSuccessMessage('Statement sent successfully');
        // Mock logging to #User Activity Logs Table
        console.log('User Activity Log:', {
          user,
          action: 'send_patient_statement',
          patient: statementData?.patientName,
          dateRange: `${dateFrom} to ${dateTo}`,
          method: 'email',
          timestamp: new Date().toISOString()
        });
      } else if (deliveryMethod === 'postal') {
        setSuccessMessage('Statement queued for mailing');
        // Mock logging to #User Activity Logs Table
        console.log('User Activity Log:', {
          user,
          action: 'queue_patient_statement',
          patient: statementData?.patientName,
          dateRange: `${dateFrom} to ${dateTo}`,
          method: 'postal',
          timestamp: new Date().toISOString()
        });
      }
      
      setShowSendModal(false);
      setDeliveryMethod('');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }, 500);
  };

  const handleBackToDashboard = () => {
    router.push("/receptionist/dashboard");
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleBackToDashboard}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Generate Patient Statements</h1>
          <p className="text-gray-600 mt-2">Generate and send billing statements to patients</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <Alert className="mb-6">
            <AlertDescription className="text-green-600">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Statement Generation Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Statement Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {errorMessage && (
              <Alert variant="destructive">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Patient Selection */}
              <div className="space-y-2">
                <Label htmlFor="patient-select">Patient</Label>
                <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_PATIENTS.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name} ({patient.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date From */}
              <div className="space-y-2">
                <Label htmlFor="date-from">From Date</Label>
                <Input
                  id="date-from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              {/* Date To */}
              <div className="space-y-2">
                <Label htmlFor="date-to">To Date</Label>
                <Input
                  id="date-to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>

            <Button 
              onClick={handleGenerateStatement}
              disabled={isGenerating}
              className="w-full md:w-auto"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Statement
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Statement Preview Modal */}
        {showPreview && statementData && (
          <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Statement Preview</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Patient Details */}
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-lg mb-2">Patient Information</h3>
                  <p><strong>Name:</strong> {statementData.patientName}</p>
                  <p><strong>Patient ID:</strong> {statementData.patientId}</p>
                  <p><strong>Address:</strong> {statementData.address}</p>
                  <p><strong>Statement Period:</strong> {statementData.dateFrom} to {statementData.dateTo}</p>
                </div>

                {/* Charges */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Itemized Charges</h3>
                  <div className="space-y-2">
                    {statementData.charges.map((charge, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b">
                        <div>
                          <p className="font-medium">{charge.description}</p>
                          <p className="text-sm text-gray-600">{charge.date}</p>
                        </div>
                        <p className="font-medium">${charge.amount.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payments */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Payments Made</h3>
                  <div className="space-y-2">
                    {statementData.payments.map((payment, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b">
                        <div>
                          <p className="font-medium">Payment - {payment.method}</p>
                          <p className="text-sm text-gray-600">{payment.date}</p>
                        </div>
                        <p className="font-medium text-green-600">-${payment.amount.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Current Balance */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">Current Balance</h3>
                    <p className="font-bold text-xl text-red-600">${statementData.currentBalance.toFixed(2)}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowPreview(false)}
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => setShowSendModal(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Statement
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Send Statement Modal */}
        {showSendModal && (
          <Dialog open={showSendModal} onOpenChange={setShowSendModal}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Send Statement</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Select delivery method for the patient statement:
                </p>
                
                <div className="space-y-3">
                  <div 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      deliveryMethod === 'email' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setDeliveryMethod('email')}
                  >
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-sm text-gray-600">Send as PDF attachment to registered email</p>
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      deliveryMethod === 'postal' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setDeliveryMethod('postal')}
                  >
                    <div className="flex items-center space-x-3">
                      <Printer className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Postal Mail</p>
                        <p className="text-sm text-gray-600">Queue for printing and mailing</p>
                      </div>
                    </div>
                  </div>
                </div>

                {errorMessage && (
                  <Alert variant="destructive">
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}

                {/* Security Notice */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-700">
                    <Shield className="w-4 h-4 inline mr-1" />
                    All patient data is handled securely and in compliance with HIPAA standards
                  </p>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowSendModal(false);
                      setDeliveryMethod('');
                      setErrorMessage('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSendStatement}
                    disabled={!deliveryMethod}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Send Statement
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}