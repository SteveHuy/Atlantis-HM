"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, FileText, User, Calendar, DollarSign, CheckCircle, AlertCircle, Send } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Mock data
const mockPatients = [
  { id: "P001", name: "John Smith", dob: "1980-01-15", insuranceProvider: "Blue Cross Blue Shield", policyNumber: "BC12345" },
  { id: "P002", name: "Jane Doe", dob: "1992-06-22", insuranceProvider: "Aetna", policyNumber: "AE67890" },
  { id: "P003", name: "Robert Johnson", dob: "1975-03-10", insuranceProvider: "Cigna", policyNumber: "CG54321" }
];

const mockEncounters = [
  { id: "E001", type: "Annual Physical", date: "2024-01-15", provider: "Dr. Johnson", codes: ["99213", "99000"] },
  { id: "E002", type: "Lab Work", date: "2024-02-03", provider: "Dr. Smith", codes: ["80053", "85027"] },
  { id: "E003", type: "Specialist Consultation", date: "2024-02-20", provider: "Dr. Williams", codes: ["99244", "99000"] },
  { id: "E004", type: "Follow-up Visit", date: "2024-03-10", provider: "Dr. Johnson", codes: ["99214", "99000"] }
];

const claimSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  encounterId: z.string().min(1, "Encounter is required"),
  charges: z.string().min(1, "Charges are required").refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    },
    "Charges must be a valid positive number"
  )
});

type ClaimForm = z.infer<typeof claimSchema>;

export default function SubmitClaimsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ClaimForm>({
    patientId: "",
    encounterId: "",
    charges: ""
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ClaimForm, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [claimNumber, setClaimNumber] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<typeof mockPatients[0] | null>(null);
  const [selectedEncounter, setSelectedEncounter] = useState<typeof mockEncounters[0] | null>(null);
  const [auditLog, setAuditLog] = useState<string[]>([]);

  useEffect(() => {
    if (formData.patientId) {
      const patient = mockPatients.find(p => p.id === formData.patientId);
      setSelectedPatient(patient || null);
    }
  }, [formData.patientId]);

  useEffect(() => {
    if (formData.encounterId) {
      const encounter = mockEncounters.find(e => e.id === formData.encounterId);
      setSelectedEncounter(encounter || null);
    }
  }, [formData.encounterId]);

  const validateForm = (): boolean => {
    try {
      claimSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof ClaimForm, string>> = {};
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            const field = err.path[0] as keyof ClaimForm;
            fieldErrors[field] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const formatClaimToHIPAA5010 = () => {
    const currentDate = new Date().toISOString();
    const claimNum = `CLM-${Date.now()}`;
    
    return {
      transactionSetId: "837",
      version: "005010X222A1",
      claimNumber: claimNum,
      submissionDate: currentDate,
      patient: {
        id: selectedPatient?.id,
        name: selectedPatient?.name,
        dateOfBirth: selectedPatient?.dob,
        insurance: {
          provider: selectedPatient?.insuranceProvider,
          policyNumber: selectedPatient?.policyNumber
        }
      },
      encounter: {
        id: selectedEncounter?.id,
        type: selectedEncounter?.type,
        date: selectedEncounter?.date,
        provider: selectedEncounter?.provider,
        billingCodes: selectedEncounter?.codes
      },
      charges: parseFloat(formData.charges),
      status: "submitted"
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Format claim in HIPAA 5010 standard
      const formattedClaim = formatClaimToHIPAA5010();
      setClaimNumber(formattedClaim.claimNumber);
      
      // Update audit log
      const newLogEntry = `${new Date().toLocaleString()}: Claim ${formattedClaim.claimNumber} submitted for patient ${selectedPatient?.name}`;
      setAuditLog(prev => [...prev, newLogEntry]);

      // Simulate API call to submit claim
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setShowSuccess(true);
      
      // Redirect to Track Claim Status after showing success
      setTimeout(() => {
        router.push('/receptionist/track-claims');
      }, 3000);
    } catch (error) {
      console.error('Error submitting claim:', error);
      alert('Failed to submit claim. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = (field: keyof ClaimForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Claim Submitted Successfully
              </h2>
              <p className="text-gray-600 mb-4">
                Claim number: <strong>{claimNumber}</strong>
              </p>
              <p className="text-sm text-gray-500 mb-4">
                The claim has been formatted in HIPAA 5010 standard and submitted electronically. 
                You will be redirected to track the claim status.
              </p>
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                href="/receptionist/dashboard"
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
            <FileText className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Submit Insurance Claims</h1>
          </div>
          <p className="text-gray-600">
            Submit insurance claims electronically to receive payment for provided services more efficiently.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Claim Submission Form</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Patient Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="patient">Patient *</Label>
                    <Select
                      value={formData.patientId}
                      onValueChange={(value) => handleFieldChange('patientId', value)}
                    >
                      <SelectTrigger className={errors.patientId ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockPatients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.name} (ID: {patient.id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.patientId && (
                      <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.patientId}
                      </p>
                    )}
                  </div>

                  {/* Patient Details Preview */}
                  {selectedPatient && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Patient Details (Auto-filled)
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-blue-800">Name:</span> {selectedPatient.name}
                        </div>
                        <div>
                          <span className="font-medium text-blue-800">DOB:</span> {selectedPatient.dob}
                        </div>
                        <div>
                          <span className="font-medium text-blue-800">Insurance:</span> {selectedPatient.insuranceProvider}
                        </div>
                        <div>
                          <span className="font-medium text-blue-800">Policy:</span> {selectedPatient.policyNumber}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Encounter Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="encounter">Encounter Info *</Label>
                    <Select
                      value={formData.encounterId}
                      onValueChange={(value) => handleFieldChange('encounterId', value)}
                    >
                      <SelectTrigger className={errors.encounterId ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select encounter" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockEncounters.map((encounter) => (
                          <SelectItem key={encounter.id} value={encounter.id}>
                            {encounter.type} - {encounter.date} ({encounter.provider})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.encounterId && (
                      <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.encounterId}
                      </p>
                    )}
                  </div>

                  {/* Encounter Details Preview */}
                  {selectedEncounter && (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        Encounter Details
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-green-800">Type:</span> {selectedEncounter.type}
                        </div>
                        <div>
                          <span className="font-medium text-green-800">Date:</span> {selectedEncounter.date}
                        </div>
                        <div>
                          <span className="font-medium text-green-800">Provider:</span> {selectedEncounter.provider}
                        </div>
                        <div>
                          <span className="font-medium text-green-800">Codes:</span> {selectedEncounter.codes.join(", ")}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Charges */}
                  <div className="space-y-2">
                    <Label htmlFor="charges">Charges (USD) *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="charges"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.charges}
                        onChange={(e) => handleFieldChange('charges', e.target.value)}
                        placeholder="0.00"
                        className={`pl-10 ${errors.charges ? "border-red-500" : ""}`}
                      />
                    </div>
                    {errors.charges && (
                      <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.charges}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                          Submitting Claim...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Submit Claim
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Info and Audit */}
          <div className="space-y-6">
            {/* Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Submission Info</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Claims will be formatted in HIPAA 5010 standard and submitted electronically to the insurance provider.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Audit Log */}
            {auditLog.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {auditLog.slice(-3).map((entry, index) => (
                      <div key={index} className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
                        {entry}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}