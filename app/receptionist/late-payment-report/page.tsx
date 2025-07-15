"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, FileText, Calendar, AlertTriangle, Download, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { billingDataManager, type LatePayment, logBillingActivity } from "@/lib/billing-mock-data";
import { formatCurrency } from "@/lib/billing-validation";
import { sessionManager } from "@/lib/epic3-mock-data";

export default function LatePaymentReportPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string; role: string; firstName: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Report state
  const [reportData, setReportData] = useState<{
    summary: string;
    count: number;
    data: LatePayment[];
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    const session = sessionManager.getSession();
    if (!session || session.role !== 'receptionist') {
      router.push('/receptionist/login');
      return;
    }
    
    setUser(session);
    
    // Generate initial report
    generateReport();
    setIsLoading(false);
  }, [router]);

  const generateReport = () => {
    const report = billingDataManager.generateLatePaymentReport();
    setReportData(report);
  };

  const handleSimulateReport = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate report generation delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      generateReport();
      
      // Log the activity
      logBillingActivity(
        'late_payment_report_generated',
        'system',
        user?.username || 'Unknown',
        {
          reportDate: new Date().toISOString(),
          latePaymentCount: reportData?.count || 0,
          totalOverdue: reportData?.data.reduce((sum, payment) => sum + payment.amountOverdue, 0) || 0
        }
      );
      
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendEmail = async () => {
    if (!reportData || !user) return;
    
    try {
      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock email sending
      const emailContent = {
        to: 'receptionist@atlantishms.com',
        subject: 'Weekly Late Payment Report',
        body: generateEmailBody(),
        attachment: 'late_payment_report.pdf'
      };
      
      console.log('Mock Email Sent:', emailContent);
      
      // Log the activity
      logBillingActivity(
        'late_payment_email_sent',
        'system',
        user.username,
        {
          emailTo: emailContent.to,
          latePaymentCount: reportData.count,
          reportDate: new Date().toISOString()
        }
      );
      
      setEmailSent(true);
      
      // Reset email sent status after 5 seconds
      setTimeout(() => setEmailSent(false), 5000);
      
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  };

  const generateEmailBody = (): string => {
    if (!reportData) return '';
    
    if (reportData.count === 0) {
      return 'No late payments this week. All patient accounts are current.';
    }
    
    const totalOverdue = reportData.data.reduce((sum, payment) => sum + payment.amountOverdue, 0);
    
    return `Weekly Late Payment Report - ${new Date().toLocaleDateString()}

${reportData.summary}

Summary:
- Total late payments: ${reportData.count}
- Total amount overdue: ${formatCurrency(totalOverdue)}
- Report generated: ${new Date().toLocaleString()}

Please review the attached PDF report for detailed information about each late payment.

You can process individual payments at: [Link to Process Payments]

Best regards,
Atlantis HMS Billing System`;
  };

  const handleDownloadPDF = () => {
    // Simulate PDF download
    const blob = new Blob([generatePDFContent()], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `late_payment_report_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generatePDFContent = (): string => {
    if (!reportData) return '';
    
    return `ATLANTIS HMS - LATE PAYMENT REPORT
Generated: ${new Date().toLocaleString()}
Report Period: Weekly

${reportData.summary}

PATIENT DETAILS:
${reportData.data.map((payment, index) => `
${index + 1}. Patient: ${payment.patientName}
   Appointment Date: ${payment.appointmentDate}
   Service Provider: ${payment.serviceProvider}
   Amount Overdue: ${formatCurrency(payment.amountOverdue)}
   Days Past Due: ${payment.daysPastDue}
   Last Contact: ${payment.lastContactDate || 'N/A'}
`).join('\n')}

Total Overdue Amount: ${formatCurrency(reportData.data.reduce((sum, p) => sum + p.amountOverdue, 0))}

This report was automatically generated by Atlantis HMS.
Please follow up on overdue accounts as appropriate.`;
  };

  const getScheduleInfo = () => {
    return {
      frequency: 'Weekly',
      day: 'Monday',
      time: '6:00 AM',
      nextRun: getNextMondayAt6AM()
    };
  };

  const getNextMondayAt6AM = (): string => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek; // If Sunday (0), 1 day; otherwise 8 - current day
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilMonday);
    nextMonday.setHours(6, 0, 0, 0);
    return nextMonday.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading report...</p>
        </div>
      </div>
    );
  }

  const scheduleInfo = getScheduleInfo();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/receptionist/dashboard')}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Automatic Late Payment Report</h1>
          <p className="text-gray-600 mt-2">
            Weekly automated report on overdue patient accounts
          </p>
        </div>

        {/* Schedule Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Report Schedule
            </CardTitle>
            <CardDescription>Automated report generation schedule</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Frequency</p>
                <p className="text-lg font-semibold text-blue-600">{scheduleInfo.frequency}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Day</p>
                <p className="text-lg font-semibold text-blue-600">{scheduleInfo.day}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Time</p>
                <p className="text-lg font-semibold text-blue-600">{scheduleInfo.time}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Next Run</p>
                <p className="text-sm text-gray-600">{scheduleInfo.nextRun}</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Automated Process</p>
                  <p>
                    This report is automatically generated every Monday at 6:00 AM and emailed to the receptionist. 
                    You can also generate a manual report using the button below.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Report */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Current Report</CardTitle>
              <CardDescription>
                Latest late payment report - Generated: {new Date().toLocaleDateString()}
              </CardDescription>
            </div>
            <Button
              onClick={handleSimulateReport}
              disabled={isGenerating}
              className="flex items-center"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Simulate Report Run
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent>
            {reportData ? (
              <div className="space-y-6">
                {/* Report Summary */}
                <div className="bg-gray-50 border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Report Summary</h4>
                  <p className="text-gray-700">{reportData.summary}</p>
                  {reportData.count > 0 && (
                    <div className="mt-3 flex items-center space-x-4">
                      <span className="text-sm text-gray-600">
                        Total Overdue: {formatCurrency(reportData.data.reduce((sum, p) => sum + p.amountOverdue, 0))}
                      </span>
                      <span className="text-sm text-gray-600">
                        Average Days Past Due: {Math.round(reportData.data.reduce((sum, p) => sum + p.daysPastDue, 0) / reportData.count)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Late Payments Table */}
                {reportData.count > 0 ? (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Late Payment Details</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Patient Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Appointment Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Service Provider
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount Overdue
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Days Past Due
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {reportData.data.map((payment, index) => (
                            <tr key={payment.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {payment.patientName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {payment.appointmentDate}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {payment.serviceProvider}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
                                {formatCurrency(payment.amountOverdue)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  payment.daysPastDue > 60 ? 'bg-red-100 text-red-800' :
                                  payment.daysPastDue > 30 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-orange-100 text-orange-800'
                                }`}>
                                  {payment.daysPastDue} days
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-green-600">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4" />
                    <p className="font-medium">All accounts are current!</p>
                    <p className="text-sm mt-1">No late payments to report this week.</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
                  <Button
                    onClick={handleSendEmail}
                    disabled={emailSent}
                    className="flex items-center"
                  >
                    {emailSent ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Email Sent!
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Send Email Report
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDownloadPDF}
                    className="flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                  {reportData.count > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => router.push('/receptionist/process-payments')}
                      className="flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Process Payments
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No report data available</p>
                <p className="text-sm mt-1">Click "Simulate Report Run" to generate a report</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Email Preview */}
        {reportData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Email Preview
              </CardTitle>
              <CardDescription>Preview of the email that will be sent to the receptionist</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 border rounded-lg p-4">
                <div className="space-y-2 text-sm">
                  <div><strong>To:</strong> receptionist@atlantishms.com</div>
                  <div><strong>Subject:</strong> Weekly Late Payment Report</div>
                  <div><strong>Attachment:</strong> late_payment_report.pdf</div>
                </div>
                <div className="mt-4 p-4 bg-white border rounded-md">
                  <h5 className="font-medium text-gray-900 mb-2">Email Body:</h5>
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">{generateEmailBody()}</pre>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Missing import for CheckCircle
import { CheckCircle } from "lucide-react";