"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  FileText,
  User,
  Calendar,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Send,
  Edit,
  Eye,
  RefreshCw,
  Download
} from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Mock data
const mockPatients = [
  { id: "P001", name: "John Smith", insuranceProvider: "Blue Cross Blue Shield", policyNumber: "BC12345" },
  { id: "P002", name: "Jane Doe", insuranceProvider: "Aetna", policyNumber: "AE67890" },
  { id: "P003", name: "Robert Johnson", insuranceProvider: "Cigna", policyNumber: "CG54321" },
  { id: "P004", name: "Sarah Wilson", insuranceProvider: "UnitedHealthcare", policyNumber: "UH98765" }
];

const mockClaims = [
  {
    id: "CLM001",
    patientId: "P001",
    patientName: "John Smith",
    serviceDate: "2024-01-15",
    codes: ["99213", "99000"],
    amounts: [150.00, 25.00],
    descriptions: ["Office Visit", "Administrative Fee"],
    status: "draft" as const,
    submissionDate: null,
    ehrData: {
      diagnosis: "Routine physical examination",
      procedureNotes: "Annual physical completed, all vitals normal",
      providerName: "Dr. Johnson"
    }
  },
  {
    id: "CLM002",
    patientId: "P002",
    patientName: "Jane Doe",
    serviceDate: "2024-02-03",
    codes: ["80053", "85027"],
    amounts: [85.50, 40.00],
    descriptions: ["Comprehensive Metabolic Panel", "Complete Blood Count"],
    status: "ready" as const,
    submissionDate: null,
    ehrData: {
      diagnosis: "Routine lab work",
      procedureNotes: "Lab work for annual physical",
      providerName: "Dr. Smith"
    }
  }
];

const claimSchema = z.object({
  serviceDate: z.string().min(1, "Service date is required"),
  codes: z.array(z.string()).min(1, "At least one service code is required"),
  amounts: z.array(z.number()).min(1, "At least one amount is required"),
  notes: z.string().optional()
});

type ClaimData = z.infer<typeof claimSchema>;

export default function ProcessClaimsPage() {
  const router = useRouter();
  const [selectedPatient, setSelectedPatient] = useState<string>("all");
  const [selectedClaim, setSelectedClaim] = useState<typeof mockClaims[0] | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState<ClaimData>({
    serviceDate: "",
    codes: [],
    amounts: [],
    notes: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<{
    status: 'pending' | 'success' | 'error';
    message: string;
    claimNumber?: string;
  } | null>(null);
  const [claimHistory, setClaimHistory] = useState<string[]>([]);

  const availableClaims = mockClaims.filter(claim =>
    selectedPatient === "all" || claim.patientId === selectedPatient
  );

  useEffect(() => {
    if (selectedClaim) {
      setEditableData({
        serviceDate: selectedClaim.serviceDate,
        codes: [...selectedClaim.codes],
        amounts: [...selectedClaim.amounts],
        notes: selectedClaim.ehrData.procedureNotes
      });
    }
  }, [selectedClaim]);

  const validateClaimData = (): boolean => {
    try {
      claimSchema.parse(editableData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path.length > 0) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleClaimSelect = (claimId: string) => {
    const claim = mockClaims.find(c => c.id === claimId);
    setSelectedClaim(claim || null);
    setIsEditing(false);
    setSubmissionStatus(null);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setErrors({});
  };

  const handleSaveChanges = () => {
    if (!validateClaimData()) {
      return;
    }

    if (selectedClaim) {
      // Update the claim with edited data
      selectedClaim.serviceDate = editableData.serviceDate;
      selectedClaim.codes = [...editableData.codes];
      selectedClaim.amounts = [...editableData.amounts];
      selectedClaim.ehrData.procedureNotes = editableData.notes || "";

      setIsEditing(false);

      const historyEntry = `${new Date().toLocaleString()}: Claim ${selectedClaim.id} updated by provider`;
      setClaimHistory(prev => [...prev, historyEntry]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedClaim || !validateClaimData()) {
      return;
    }

    setIsSubmitting(true);
    setSubmissionStatus({ status: 'pending', message: 'Submitting claim...' });

    try {
      // Simulate electronic transmission
      await new Promise(resolve => setTimeout(resolve, 3000));

      const claimNumber = `CLM-${Date.now()}`;
      const patient = mockPatients.find(p => p.id === selectedClaim.patientId);

      // Mock submission success/failure
      const isSuccess = Math.random() > 0.2; // 80% success rate

      if (isSuccess) {
        setSubmissionStatus({
          status: 'success',
          message: `Claim successfully transmitted to ${patient?.insuranceProvider}`,
          claimNumber
        });

        // Update claim status
        selectedClaim.status = 'submitted' as const;
        selectedClaim.submissionDate = new Date().toISOString();

        const historyEntry = `${new Date().toLocaleString()}: Claim ${selectedClaim.id} submitted electronically - Reference: ${claimNumber}`;
        setClaimHistory(prev => [...prev, historyEntry]);

        // Navigate to Track Claim Status after 3 seconds
        setTimeout(() => {
          router.push('/receptionist/track-claims');
        }, 3000);
      } else {
        setSubmissionStatus({
          status: 'error',
          message: 'Submission failed. Please check claim details and try again.'
        });
      }
    } catch (error) {
      setSubmissionStatus({
        status: 'error',
        message: 'Network error occurred during submission.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddServiceCode = () => {
    setEditableData(prev => ({
      ...prev,
      codes: [...prev.codes, ""],
      amounts: [...prev.amounts, 0]
    }));
  };

  const handleRemoveServiceCode = (index: number) => {
    setEditableData(prev => ({
      ...prev,
      codes: prev.codes.filter((_, i) => i !== index),
      amounts: prev.amounts.filter((_, i) => i !== index)
    }));
  };

  const handleCodeChange = (index: number, value: string) => {
    setEditableData(prev => ({
      ...prev,
      codes: prev.codes.map((code, i) => i === index ? value : code)
    }));
  };

  const handleAmountChange = (index: number, value: number) => {
    setEditableData(prev => ({
      ...prev,
      amounts: prev.amounts.map((amount, i) => i === index ? value : amount)
    }));
  };

  const getTotalAmount = () => {
    return editableData.amounts.reduce((sum, amount) => sum + amount, 0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'ready': return 'bg-blue-100 text-blue-800';
      case 'submitted': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <FileText className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Process Claim Submissions</h1>
          </div>
          <p className="text-gray-600">
            Process claim submissions efficiently to expedite patient insurance claim processing.
          </p>
        </div>

        {/* Submission Status */}
        {submissionStatus && (
          <Alert className={`mb-6 ${
            submissionStatus.status === 'success' ? 'border-green-200 bg-green-50' :
            submissionStatus.status === 'error' ? 'border-red-200 bg-red-50' :
            'border-blue-200 bg-blue-50'
          }`}>
            {submissionStatus.status === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : submissionStatus.status === 'error' ? (
              <AlertCircle className="h-4 w-4 text-red-600" />
            ) : (
              <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
            )}
            <AlertDescription className={
              submissionStatus.status === 'success' ? 'text-green-800' :
              submissionStatus.status === 'error' ? 'text-red-800' :
              'text-blue-800'
            }>
              {submissionStatus.message}
              {submissionStatus.claimNumber && (
                <div className="mt-1 font-semibold">
                  Claim Reference: {submissionStatus.claimNumber}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Patient and Claim Selection */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Select Patient & Claim</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Patient Filter */}
                  <div>
                    <Label>Filter by Patient</Label>
                    <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                      <SelectTrigger>
                        <SelectValue placeholder="All patients" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All patients</SelectItem>
                        {mockPatients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Available Claims */}
                  <div>
                    <Label>Available Claims ({availableClaims.length})</Label>
                    <div className="space-y-2 mt-2">
                      {availableClaims.map((claim) => (
                        <div
                          key={claim.id}
                          className={`p-3 border rounded cursor-pointer transition-colors ${
                            selectedClaim?.id === claim.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                          onClick={() => handleClaimSelect(claim.id)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{claim.id}</span>
                            <Badge className={getStatusColor(claim.status)} variant="outline">
                              {claim.status}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-600">
                            {claim.patientName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(claim.serviceDate).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Claim History */}
            {claimHistory.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-sm">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {claimHistory.slice(-3).map((entry, index) => (
                      <div key={index} className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
                        {entry}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Claim Processing Area */}
          <div className="lg:col-span-3">
            {selectedClaim ? (
              <div className="space-y-6">
                {/* EHR Data (Pre-populated) */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>EHR Data (Pre-populated)</span>
                      <Badge className={getStatusColor(selectedClaim.status)} variant="outline">
                        {selectedClaim.status.toUpperCase()}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label>Patient Name</Label>
                          <Input value={selectedClaim.patientName} readOnly className="bg-gray-50" />
                        </div>
                        <div>
                          <Label>Service Date</Label>
                          <Input
                            value={isEditing ? editableData.serviceDate : selectedClaim.serviceDate}
                            onChange={(e) => isEditing && setEditableData(prev => ({ ...prev, serviceDate: e.target.value }))}
                            readOnly={!isEditing}
                            className={isEditing ? "" : "bg-gray-50"}
                            type="date"
                          />
                        </div>
                        <div>
                          <Label>Provider</Label>
                          <Input value={selectedClaim.ehrData.providerName} readOnly className="bg-gray-50" />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label>Diagnosis</Label>
                          <Input value={selectedClaim.ehrData.diagnosis} readOnly className="bg-gray-50" />
                        </div>
                        <div>
                          <Label>Total Amount</Label>
                          <Input
                            value={`$${getTotalAmount().toFixed(2)}`}
                            readOnly
                            className="bg-gray-50 font-semibold"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Service Codes and Amounts */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Service Codes & Amounts</span>
                      {!isEditing && selectedClaim.status !== 'submitted' && (
                        <Button onClick={handleEdit} variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Claim
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {editableData.codes.map((code, index) => (
                        <div key={index} className="grid grid-cols-12 gap-4 items-center">
                          <div className="col-span-4">
                            <Label>Service Code {index + 1}</Label>
                            <Input
                              value={code}
                              onChange={(e) => isEditing && handleCodeChange(index, e.target.value)}
                              readOnly={!isEditing}
                              className={isEditing ? "" : "bg-gray-50"}
                              placeholder="CPT Code"
                            />
                          </div>
                          <div className="col-span-3">
                            <Label>Description</Label>
                            <Input
                              value={selectedClaim.descriptions[index] || ""}
                              readOnly
                              className="bg-gray-50"
                            />
                          </div>
                          <div className="col-span-3">
                            <Label>Amount</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={editableData.amounts[index] || 0}
                              onChange={(e) => isEditing && handleAmountChange(index, parseFloat(e.target.value) || 0)}
                              readOnly={!isEditing}
                              className={isEditing ? "" : "bg-gray-50"}
                            />
                          </div>
                          <div className="col-span-2">
                            {isEditing && (
                              <Button
                                onClick={() => handleRemoveServiceCode(index)}
                                variant="outline"
                                size="sm"
                                className="mt-6"
                                disabled={editableData.codes.length <= 1}
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}

                      {isEditing && (
                        <Button onClick={handleAddServiceCode} variant="outline" size="sm">
                          Add Service Code
                        </Button>
                      )}
                    </div>

                    {/* Procedure Notes */}
                    <div className="mt-6">
                      <Label>Procedure Notes</Label>
                      <Textarea
                        value={editableData.notes}
                        onChange={(e) => isEditing && setEditableData(prev => ({ ...prev, notes: e.target.value }))}
                        readOnly={!isEditing}
                        className={isEditing ? "" : "bg-gray-50"}
                        rows={4}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-4 mt-6">
                      {isEditing ? (
                        <>
                          <Button onClick={handleSaveChanges} className="flex-1">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Save Changes
                          </Button>
                          <Button onClick={() => setIsEditing(false)} variant="outline" className="flex-1">
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          {selectedClaim.status !== 'submitted' && (
                            <Button
                              onClick={handleSubmit}
                              disabled={isSubmitting}
                              className="flex-1"
                            >
                              {isSubmitting ? (
                                <>
                                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                  Submitting...
                                </>
                              ) : (
                                <>
                                  <Send className="h-4 w-4 mr-2" />
                                  Submit to Payer
                                </>
                              )}
                            </Button>
                          )}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" className="flex-1">
                                <Eye className="h-4 w-4 mr-2" />
                                Preview Submission
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Electronic Claim Preview</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded">
                                  <h4 className="font-semibold mb-2">Claim Summary</h4>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>Patient: {selectedClaim.patientName}</div>
                                    <div>Service Date: {selectedClaim.serviceDate}</div>
                                    <div>Provider: {selectedClaim.ehrData.providerName}</div>
                                    <div>Total: ${getTotalAmount().toFixed(2)}</div>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <h4 className="font-semibold">Service Codes:</h4>
                                  {editableData.codes.map((code, index) => (
                                    <div key={index} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                                      <span>{code}</span>
                                      <span>${editableData.amounts[index]?.toFixed(2)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="pt-12">
                  <div className="text-center">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Claim Selected</h3>
                    <p className="text-gray-600 mb-4">
                      Select a patient and claim from the sidebar to begin processing.
                    </p>
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
