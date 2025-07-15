"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Shield, CheckCircle, XCircle, AlertCircle, Download, Calendar, DollarSign, User, FileText } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const eligibilitySchema = z.object({
  patientInsurance: z.string().min(1, "Patient insurance information is required").min(5, "Insurance information must be at least 5 characters"),
  serviceDate: z.string().min(1, "Service date is required").refine(
    (date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    },
    "Service date must be today or in the future"
  )
});

type EligibilityForm = z.infer<typeof eligibilitySchema>;

interface EligibilityResponse {
  status: 'active' | 'inactive';
  coverageLimits: {
    annual: number;
    remaining: number;
    deductible: number;
    deductibleMet: number;
  };
  copayInfo: {
    primaryCare: number;
    specialist: number;
    emergency: number;
  };
  eligibilityDetails?: string;
  verificationDate: string;
}

export default function InsuranceEligibilityPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<EligibilityForm>({
    patientInsurance: "",
    serviceDate: new Date().toISOString().split('T')[0]
  });
  const [errors, setErrors] = useState<Partial<Record<keyof EligibilityForm, string>>>({});
  const [isChecking, setIsChecking] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState<EligibilityResponse | null>(null);
  const [auditTrail, setAuditTrail] = useState<string[]>([]);

  const validateForm = (): boolean => {
    try {
      eligibilitySchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof EligibilityForm, string>> = {};
        // Use 'issues' property which is the correct property for ZodError
        error.issues.forEach((issue) => {
          if (issue.path && issue.path.length > 0) {
            const field = issue.path[0] as keyof EligibilityForm;
            fieldErrors[field] = issue.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        // Handle non-ZodError cases
        console.error('Non-ZodError validation error:', error);
        setErrors({ patientInsurance: 'An unexpected validation error occurred' });
      }
      return false;
    }
  };

  const handleCheckEligibility = async () => {
    if (!validateForm()) {
      return;
    }

    setIsChecking(true);

    try {
      // Simulate API call to check eligibility
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock eligibility response based on insurance info
      const mockResponse: EligibilityResponse = {
        status: formData.patientInsurance.toLowerCase().includes('expired') ? 'inactive' : 'active',
        coverageLimits: {
          annual: 5000,
          remaining: 3250,
          deductible: 1000,
          deductibleMet: 450
        },
        copayInfo: {
          primaryCare: 25,
          specialist: 50,
          emergency: 100
        },
        eligibilityDetails: formData.patientInsurance.toLowerCase().includes('expired') 
          ? "Policy has expired. Patient must update insurance information."
          : "Active coverage verified. All services covered under current plan.",
        verificationDate: new Date().toISOString()
      };

      setEligibilityResult(mockResponse);
      
      // Add to audit trail
      const auditEntry = `${new Date().toLocaleString()}: Eligibility verified for ${formData.patientInsurance} - Status: ${mockResponse.status}`;
      setAuditTrail(prev => [...prev, auditEntry]);
      
    } catch (error) {
      console.error('Error checking eligibility:', error);
      alert('Failed to check eligibility. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleFieldChange = (field: keyof EligibilityForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleDownloadDetails = () => {
    if (!eligibilityResult) return;

    const content = `Insurance Eligibility Verification Report

Verification Date: ${new Date(eligibilityResult.verificationDate).toLocaleString()}
Service Date: ${formData.serviceDate}
Patient Insurance: ${formData.patientInsurance}

ELIGIBILITY STATUS: ${eligibilityResult.status.toUpperCase()}

Coverage Information:
- Annual Limit: $${eligibilityResult.coverageLimits.annual.toLocaleString()}
- Remaining Coverage: $${eligibilityResult.coverageLimits.remaining.toLocaleString()}
- Annual Deductible: $${eligibilityResult.coverageLimits.deductible.toLocaleString()}
- Deductible Met: $${eligibilityResult.coverageLimits.deductibleMet.toLocaleString()}

Co-pay Information:
- Primary Care Visit: $${eligibilityResult.copayInfo.primaryCare}
- Specialist Visit: $${eligibilityResult.copayInfo.specialist}
- Emergency Room: $${eligibilityResult.copayInfo.emergency}

Additional Details:
${eligibilityResult.eligibilityDetails}

This verification is valid for 24 hours from the verification date.
For questions, contact the insurance provider directly.`;

    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `eligibility-verification-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePrintDetails = () => {
    if (!eligibilityResult) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Insurance Eligibility Verification</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 20px; }
              .status-active { color: green; font-weight: bold; }
              .status-inactive { color: red; font-weight: bold; }
              .section { margin-bottom: 15px; }
              .label { font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Insurance Eligibility Verification Report</h1>
              <p>Generated on: ${new Date().toLocaleString()}</p>
            </div>
            
            <div class="section">
              <div class="label">Patient Insurance:</div>
              <div>${formData.patientInsurance}</div>
            </div>
            
            <div class="section">
              <div class="label">Service Date:</div>
              <div>${formData.serviceDate}</div>
            </div>
            
            <div class="section">
              <div class="label">Eligibility Status:</div>
              <div class="status-${eligibilityResult.status}">${eligibilityResult.status.toUpperCase()}</div>
            </div>
            
            <div class="section">
              <div class="label">Coverage Information:</div>
              <ul>
                <li>Annual Limit: $${eligibilityResult.coverageLimits.annual.toLocaleString()}</li>
                <li>Remaining Coverage: $${eligibilityResult.coverageLimits.remaining.toLocaleString()}</li>
                <li>Annual Deductible: $${eligibilityResult.coverageLimits.deductible.toLocaleString()}</li>
                <li>Deductible Met: $${eligibilityResult.coverageLimits.deductibleMet.toLocaleString()}</li>
              </ul>
            </div>
            
            <div class="section">
              <div class="label">Co-pay Information:</div>
              <ul>
                <li>Primary Care Visit: $${eligibilityResult.copayInfo.primaryCare}</li>
                <li>Specialist Visit: $${eligibilityResult.copayInfo.specialist}</li>
                <li>Emergency Room: $${eligibilityResult.copayInfo.emergency}</li>
              </ul>
            </div>
            
            <div class="section">
              <div class="label">Additional Details:</div>
              <div>${eligibilityResult.eligibilityDetails}</div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
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
              <Link
                href="/provider/dashboard"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Shield className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Review Insurance Eligibility</h1>
          </div>
          <p className="text-gray-600">
            Verify insurance eligibility in real-time to confirm coverage for services during patient encounters.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Eligibility Verification Form</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); handleCheckEligibility(); }} className="space-y-6">
                  {/* Patient Insurance Info */}
                  <div className="space-y-2">
                    <Label htmlFor="patientInsurance">Patient Insurance Information *</Label>
                    <Input
                      id="patientInsurance"
                      type="text"
                      value={formData.patientInsurance}
                      onChange={(e) => handleFieldChange('patientInsurance', e.target.value)}
                      placeholder="Enter patient insurance ID, policy number, or provider details"
                      className={errors.patientInsurance ? "border-red-500" : ""}
                    />
                    {errors.patientInsurance && (
                      <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.patientInsurance}
                      </p>
                    )}
                  </div>

                  {/* Service Date */}
                  <div className="space-y-2">
                    <Label htmlFor="serviceDate">Service Date *</Label>
                    <Input
                      id="serviceDate"
                      type="date"
                      value={formData.serviceDate}
                      onChange={(e) => handleFieldChange('serviceDate', e.target.value)}
                      className={errors.serviceDate ? "border-red-500" : ""}
                    />
                    {errors.serviceDate && (
                      <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.serviceDate}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isChecking}
                    >
                      {isChecking ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                          Checking Eligibility...
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4 mr-2" />
                          Check Eligibility
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Eligibility Results */}
            {eligibilityResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Eligibility Results</span>
                    <Badge 
                      variant={eligibilityResult.status === 'active' ? 'default' : 'destructive'}
                      className={eligibilityResult.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {eligibilityResult.status === 'active' ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 mr-1" />
                      )}
                      {eligibilityResult.status.toUpperCase()}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Status Message */}
                    <Alert className={eligibilityResult.status === 'active' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                      {eligibilityResult.status === 'active' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <AlertDescription className={eligibilityResult.status === 'active' ? 'text-green-800' : 'text-red-800'}>
                        {eligibilityResult.status === 'active' ? 'Eligible for Service' : 'Service Not Covered'}
                        <br />
                        <span className="text-sm">{eligibilityResult.eligibilityDetails}</span>
                      </AlertDescription>
                    </Alert>

                    {eligibilityResult.status === 'active' && (
                      <>
                        {/* Coverage Information */}
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center">
                            <DollarSign className="h-4 w-4 mr-2 text-blue-600" />
                            Coverage Information
                          </h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-gray-50 p-3 rounded">
                              <span className="font-medium text-gray-700">Annual Limit:</span>
                              <div className="text-lg font-semibold">${eligibilityResult.coverageLimits.annual.toLocaleString()}</div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded">
                              <span className="font-medium text-gray-700">Remaining Coverage:</span>
                              <div className="text-lg font-semibold text-green-600">${eligibilityResult.coverageLimits.remaining.toLocaleString()}</div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded">
                              <span className="font-medium text-gray-700">Annual Deductible:</span>
                              <div className="text-lg font-semibold">${eligibilityResult.coverageLimits.deductible.toLocaleString()}</div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded">
                              <span className="font-medium text-gray-700">Deductible Met:</span>
                              <div className="text-lg font-semibold text-blue-600">${eligibilityResult.coverageLimits.deductibleMet.toLocaleString()}</div>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Co-pay Information */}
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center">
                            <User className="h-4 w-4 mr-2 text-blue-600" />
                            Co-pay/Deductible Information
                          </h4>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="bg-blue-50 p-3 rounded border border-blue-200">
                              <span className="font-medium text-blue-800">Primary Care:</span>
                              <div className="text-lg font-semibold text-blue-900">${eligibilityResult.copayInfo.primaryCare}</div>
                            </div>
                            <div className="bg-blue-50 p-3 rounded border border-blue-200">
                              <span className="font-medium text-blue-800">Specialist:</span>
                              <div className="text-lg font-semibold text-blue-900">${eligibilityResult.copayInfo.specialist}</div>
                            </div>
                            <div className="bg-blue-50 p-3 rounded border border-blue-200">
                              <span className="font-medium text-blue-800">Emergency:</span>
                              <div className="text-lg font-semibold text-blue-900">${eligibilityResult.copayInfo.emergency}</div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {eligibilityResult.status === 'inactive' && (
                      <Alert className="border-yellow-200 bg-yellow-50">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <AlertDescription className="text-yellow-800">
                          <strong>Alternative Options:</strong><br />
                          • Patient can pay out-of-pocket for services<br />
                          • Patient should contact insurance provider to resolve coverage issues<br />
                          • Consider referring to network providers if available
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-4 pt-4">
                      <Button onClick={handleDownloadDetails} variant="outline" className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Download Summary
                      </Button>
                      <Button onClick={handlePrintDetails} variant="outline" className="flex-1">
                        <FileText className="h-4 w-4 mr-2" />
                        Print Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Verification Info</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Real-time eligibility verification is processed through integrated insurance APIs. Results are valid for 24 hours.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Audit Trail */}
            {auditTrail.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Verification History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {auditTrail.slice(-5).map((entry, index) => (
                      <div key={index} className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
                        {entry}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full" disabled>
                    Schedule Follow-up
                  </Button>
                  <Button variant="outline" size="sm" className="w-full" disabled>
                    Contact Insurance
                  </Button>
                  <Button variant="outline" size="sm" className="w-full" disabled>
                    Patient Self-Pay Setup
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Additional features coming soon</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}