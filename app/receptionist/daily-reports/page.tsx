"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, Mail, Calendar, FileText, Shield, TrendingUp, Users, CreditCard, Clipboard } from "lucide-react";
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

interface DailyReportData {
  reportType: string;
  reportDate: string;
  summary: {
    totalCount: number;
    totalAmount?: number;
    additionalMetrics?: { [key: string]: number | string };
  };
  details: Array<{
    id: string;
    time: string;
    description: string;
    amount?: number;
    status?: string;
    patient?: string;
  }>;
}

const REPORT_TYPES = [
  { value: 'appointments', label: 'Appointments', icon: Calendar },
  { value: 'payments', label: 'Payments', icon: CreditCard },
  { value: 'claims', label: 'Claims', icon: Clipboard }
];

export default function DailyReportsPage() {
  const router = useRouter();
  const [user, setUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reportType, setReportType] = useState('');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState<DailyReportData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
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

  const generateMockReportData = (type: string, date: string): DailyReportData => {
    const baseData = {
      reportType: type,
      reportDate: date,
      summary: { totalCount: 0 },
      details: []
    };

    switch (type) {
      case 'appointments':
        return {
          ...baseData,
          summary: {
            totalCount: 15,
            additionalMetrics: {
              'Completed': 12,
              'Cancelled': 2,
              'No-Show': 1
            }
          },
          details: [
            {
              id: 'A001',
              time: '09:00 AM',
              description: 'John Smith - General Consultation',
              status: 'Completed',
              patient: 'John Smith'
            },
            {
              id: 'A002',
              time: '09:30 AM',
              description: 'Sarah Johnson - Follow-up Visit',
              status: 'Completed',
              patient: 'Sarah Johnson'
            },
            {
              id: 'A003',
              time: '10:00 AM',
              description: 'Michael Davis - Routine Checkup',
              status: 'No-Show',
              patient: 'Michael Davis'
            },
            {
              id: 'A004',
              time: '10:30 AM',
              description: 'Emily Wilson - Annual Physical',
              status: 'Completed',
              patient: 'Emily Wilson'
            },
            {
              id: 'A005',
              time: '11:00 AM',
              description: 'David Brown - Consultation',
              status: 'Cancelled',
              patient: 'David Brown'
            }
          ]
        };

      case 'payments':
        return {
          ...baseData,
          summary: {
            totalCount: 8,
            totalAmount: 1250.00,
            additionalMetrics: {
              'Credit Card': 5,
              'Cash': 2,
              'Insurance': 1
            }
          },
          details: [
            {
              id: 'P001',
              time: '09:15 AM',
              description: 'Patient Copay - Office Visit',
              amount: 25.00,
              status: 'Completed',
              patient: 'John Smith'
            },
            {
              id: 'P002',
              time: '10:45 AM',
              description: 'Lab Test Payment',
              amount: 150.00,
              status: 'Completed',
              patient: 'Sarah Johnson'
            },
            {
              id: 'P003',
              time: '11:30 AM',
              description: 'Procedure Payment',
              amount: 300.00,
              status: 'Completed',
              patient: 'Emily Wilson'
            },
            {
              id: 'P004',
              time: '02:15 PM',
              description: 'Insurance Reimbursement',
              amount: 500.00,
              status: 'Processed',
              patient: 'Multiple Patients'
            },
            {
              id: 'P005',
              time: '03:00 PM',
              description: 'Medication Copay',
              amount: 15.00,
              status: 'Completed',
              patient: 'David Brown'
            }
          ]
        };

      case 'claims':
        return {
          ...baseData,
          summary: {
            totalCount: 12,
            totalAmount: 3500.00,
            additionalMetrics: {
              'Submitted': 8,
              'Approved': 3,
              'Pending': 1
            }
          },
          details: [
            {
              id: 'C001',
              time: '08:30 AM',
              description: 'General Consultation Claim',
              amount: 150.00,
              status: 'Submitted',
              patient: 'John Smith'
            },
            {
              id: 'C002',
              time: '09:45 AM',
              description: 'Lab Work Claim',
              amount: 300.00,
              status: 'Approved',
              patient: 'Sarah Johnson'
            },
            {
              id: 'C003',
              time: '11:15 AM',
              description: 'Imaging Study Claim',
              amount: 450.00,
              status: 'Pending',
              patient: 'Michael Davis'
            },
            {
              id: 'C004',
              time: '01:30 PM',
              description: 'Procedure Claim',
              amount: 800.00,
              status: 'Approved',
              patient: 'Emily Wilson'
            },
            {
              id: 'C005',
              time: '03:45 PM',
              description: 'Follow-up Visit Claim',
              amount: 120.00,
              status: 'Submitted',
              patient: 'David Brown'
            }
          ]
        };

      default:
        return baseData;
    }
  };

  const handleGenerateReport = () => {
    // Validate inputs
    if (!reportType) {
      setErrorMessage('Please select a report type');
      return;
    }
    if (!reportDate) {
      setErrorMessage('Please select a report date');
      return;
    }

    setErrorMessage('');
    setIsGenerating(true);

    // Simulate API call delay
    setTimeout(() => {
      const mockData = generateMockReportData(reportType, reportDate);
      setReportData(mockData);
      setShowPreview(true);
      setIsGenerating(false);

      // Mock logging to #User Activity Logs Table
      console.log('User Activity Log:', {
        user,
        action: 'generate_daily_report',
        reportType,
        reportDate,
        timestamp: new Date().toISOString()
      });
    }, 1000);
  };

  const handleDownloadReport = () => {
    if (!reportData) return;

    // Generate mock PDF
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-${reportData.reportType}-report-${reportData.reportDate}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setSuccessMessage('Report downloaded successfully');
    
    // Mock logging to #User Activity Logs Table
    console.log('User Activity Log:', {
      user,
      action: 'download_daily_report',
      reportType: reportData.reportType,
      reportDate: reportData.reportDate,
      timestamp: new Date().toISOString()
    });

    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  const handleEmailReport = () => {
    if (!recipientEmail) {
      setErrorMessage('Please enter a recipient email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    setErrorMessage('');

    // Simulate sending
    setTimeout(() => {
      setSuccessMessage('Report sent successfully');
      setShowEmailModal(false);
      setRecipientEmail('');
      
      // Mock logging to #User Activity Logs Table
      console.log('User Activity Log:', {
        user,
        action: 'email_daily_report',
        reportType: reportData?.reportType,
        reportDate: reportData?.reportDate,
        recipient: recipientEmail,
        timestamp: new Date().toISOString()
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }, 1000);
  };

  const handleBackToDashboard = () => {
    router.push("/receptionist/dashboard");
  };

  const getReportTypeLabel = (type: string) => {
    const reportType = REPORT_TYPES.find(rt => rt.value === type);
    return reportType ? reportType.label : type;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
      case 'no-show':
        return 'text-red-600 bg-red-100';
      case 'submitted':
      case 'processed':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
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
          <h1 className="text-3xl font-bold text-gray-900">Generate Daily Reports</h1>
          <p className="text-gray-600 mt-2">Generate and review daily activity reports for management review</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <Alert className="mb-6">
            <AlertDescription className="text-green-600">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Report Generation Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Daily Reports</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {errorMessage && (
              <Alert variant="destructive">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Report Type Selection */}
              <div className="space-y-2">
                <Label htmlFor="report-type">Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center space-x-2">
                          <type.icon className="w-4 h-4" />
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Selection */}
              <div className="space-y-2">
                <Label htmlFor="report-date">Report Date</Label>
                <Input
                  id="report-date"
                  type="date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                />
              </div>
            </div>

            <Button 
              onClick={handleGenerateReport}
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
                  Generate Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Report Preview Modal */}
        {showPreview && reportData && (
          <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {getReportTypeLabel(reportData.reportType)} Report - {reportData.reportDate}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Summary Section */}
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-lg mb-3">Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-600">Total Count</p>
                      <p className="text-2xl font-bold text-blue-700">{reportData.summary.totalCount}</p>
                    </div>
                    {reportData.summary.totalAmount && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-sm text-green-600">Total Amount</p>
                        <p className="text-2xl font-bold text-green-700">${reportData.summary.totalAmount.toFixed(2)}</p>
                      </div>
                    )}
                    {reportData.summary.additionalMetrics && Object.entries(reportData.summary.additionalMetrics).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">{key}</p>
                        <p className="text-2xl font-bold text-gray-700">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detailed Breakdown */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Detailed Breakdown</h3>
                  <div className="space-y-2">
                    {reportData.details.map((detail, index) => (
                      <div key={index} className="flex justify-between items-center py-3 px-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-500 font-mono">{detail.time}</span>
                            <span className="font-medium">{detail.description}</span>
                            {detail.status && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(detail.status)}`}>
                                {detail.status}
                              </span>
                            )}
                          </div>
                          {detail.patient && (
                            <p className="text-sm text-gray-600 mt-1">Patient: {detail.patient}</p>
                          )}
                        </div>
                        {detail.amount && (
                          <div className="text-right">
                            <p className="font-bold">${detail.amount.toFixed(2)}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* HIPAA Compliance Notice */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-700">
                    <Shield className="w-4 h-4 inline mr-1" />
                    All data exports comply with privacy and HIPAA standards
                  </p>
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
                    onClick={handleDownloadReport}
                    variant="outline"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Report
                  </Button>
                  <Button
                    onClick={() => setShowEmailModal(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email Report
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Email Report Modal */}
        {showEmailModal && (
          <Dialog open={showEmailModal} onOpenChange={setShowEmailModal}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Email Report</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Enter the recipient's email address to send the report as a PDF attachment.
                </p>
                
                <div className="space-y-2">
                  <Label htmlFor="recipient-email">Recipient Email</Label>
                  <Input
                    id="recipient-email"
                    type="email"
                    placeholder="manager@company.com"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                  />
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
                    Report will be sent securely as a PDF attachment
                  </p>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowEmailModal(false);
                      setRecipientEmail('');
                      setErrorMessage('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleEmailReport}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Report
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