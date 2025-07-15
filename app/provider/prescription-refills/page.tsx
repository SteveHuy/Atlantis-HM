'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Pill,
  Check,
  X,
  ArrowLeft,
  AlertTriangle,
  User,
  Clock,
  FileText,
  CheckCircle,
  Shield,
  Download
} from 'lucide-react';
import { sessionManager, type UserSession } from '@/lib/epic3-mock-data';
import {
  serviceProviderDataManager,
  mockMedications,
  mockPharmacies,
  type PrescriptionRefill,
  type Medication,
  type Pharmacy
} from '@/lib/service-provider-mock-data';
import { managePrescriptionRefillsSchema } from '@/lib/service-provider-validation';

interface RefillWithDetails extends PrescriptionRefill {
  medicationDetails?: Medication;
  pharmacyDetails?: Pharmacy;
}

export default function ManagePrescriptionRefillsPage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Data state
  const [pendingRefills, setPendingRefills] = useState<RefillWithDetails[]>([]);
  const [selectedRefill, setSelectedRefill] = useState<RefillWithDetails | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Action state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState('');
  const [processingSuccess, setProcessingSuccess] = useState('');

  // Form state for denial
  const [denialReason, setDenialReason] = useState('');
  const [selectedPharmacy, setSelectedPharmacy] = useState('');
  const [showDenialForm, setShowDenialForm] = useState(false);
  const [showApprovalForm, setShowApprovalForm] = useState(false);

  // Drug interaction alerts
  const [drugInteractions, setDrugInteractions] = useState<string[]>([]);
  const [showInteractionAlert, setShowInteractionAlert] = useState(false);

  useEffect(() => {
    const userSession = sessionManager.getSession();

    if (!userSession || userSession.role !== 'provider') {
      router.push('/provider/login');
      return;
    }

    setSession(userSession);
    loadPendingRefills();
    setIsLoading(false);
  }, [router]);

  const loadPendingRefills = () => {
    const refills = serviceProviderDataManager.getPendingRefills();

    // Enhance refills with medication and pharmacy details
    const enhancedRefills: RefillWithDetails[] = refills.map(refill => ({
      ...refill,
      medicationDetails: mockMedications.find(med =>
        med.name.toLowerCase().includes(refill.medicationName.toLowerCase().split(' ')[0])
      ),
      pharmacyDetails: refill.pharmacyId ?
        mockPharmacies.find(pharmacy => pharmacy.id === refill.pharmacyId) : undefined
    }));

    setPendingRefills(enhancedRefills);
  };

  const handleViewDetails = (refill: RefillWithDetails) => {
    setSelectedRefill(refill);
    setShowDetails(true);

    // Check for drug interactions
    if (refill.medicationDetails) {
      const interactions = refill.medicationDetails.commonInteractions;
      if (interactions.length > 0) {
        setDrugInteractions(interactions);
        setShowInteractionAlert(true);
      }
    }
  };

  const handleApproveRefill = (refill: RefillWithDetails) => {
    setSelectedRefill(refill);
    setSelectedPharmacy(refill.pharmacyId || mockPharmacies[0].id);
    setShowApprovalForm(true);
  };

  const handleDenyRefill = (refill: RefillWithDetails) => {
    setSelectedRefill(refill);
    setDenialReason('');
    setShowDenialForm(true);
  };

  const confirmApproval = async () => {
    if (!selectedRefill || !session) return;

    setProcessingError('');
    setProcessingSuccess('');
    setIsProcessing(true);

    try {
      // Validate approval data
      const validationResult = managePrescriptionRefillsSchema.safeParse({
        refillId: selectedRefill.id,
        action: 'approve',
        pharmacyId: selectedPharmacy
      });

      if (!validationResult.success) {
        const errors = validationResult.error.issues.map((e: any) => e.message).join(', ');
        setProcessingError(errors);
        setIsProcessing(false);
        return;
      }

      // Process approval
      const success = serviceProviderDataManager.approveRefill(
        selectedRefill.id,
        session.userId,
        selectedPharmacy
      );

      if (success) {
        setProcessingSuccess(`Prescription refill approved and sent to pharmacy`);

        // Update local state
        setPendingRefills(prev => prev.filter(r => r.id !== selectedRefill.id));

        // Close forms
        setShowApprovalForm(false);
        setSelectedRefill(null);

        // Auto-hide success message
        setTimeout(() => setProcessingSuccess(''), 3000);
      } else {
        setProcessingError('Failed to approve refill. Please try again.');
      }

    } catch (error) {
      setProcessingError('An error occurred while processing the approval.');
      console.error('Approval error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmDenial = async () => {
    if (!selectedRefill || !session || !denialReason.trim()) return;

    setProcessingError('');
    setProcessingSuccess('');
    setIsProcessing(true);

    try {
      // Validate denial data
      const validationResult = managePrescriptionRefillsSchema.safeParse({
        refillId: selectedRefill.id,
        action: 'deny',
        denialReason: denialReason.trim()
      });

      if (!validationResult.success) {
        const errors = validationResult.error.issues.map((e: any) => e.message).join(', ');
        setProcessingError(errors);
        setIsProcessing(false);
        return;
      }

      // Process denial
      const success = serviceProviderDataManager.denyRefill(
        selectedRefill.id,
        session.userId,
        denialReason.trim()
      );

      if (success) {
        setProcessingSuccess(`Prescription refill denied and patient notified`);

        // Update local state
        setPendingRefills(prev => prev.filter(r => r.id !== selectedRefill.id));

        // Close forms
        setShowDenialForm(false);
        setSelectedRefill(null);
        setDenialReason('');

        // Auto-hide success message
        setTimeout(() => setProcessingSuccess(''), 3000);
      } else {
        setProcessingError('Failed to deny refill. Please try again.');
      }

    } catch (error) {
      setProcessingError('An error occurred while processing the denial.');
      console.error('Denial error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateRefillReport = () => {
    // Mock report generation
    const reportData = {
      generatedAt: new Date().toISOString(),
      providerId: session?.userId,
      providerName: session?.fullName,
      totalRefills: pendingRefills.length,
      refills: pendingRefills
    };

    // In a real app, this would generate a PDF or CSV
    console.log('Refill Report Generated:', reportData);
    alert('Refill report generated and ready for download (mock)');
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/provider/dashboard')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-blue-600">Manage Prescription Refills</h1>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={generateRefillReport}
                className="text-green-600 border-green-600 hover:bg-green-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
              <span className="text-sm text-gray-600">
                {session.fullName}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {processingSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800">{processingSuccess}</span>
          </div>
        )}

        {/* Error Message */}
        {processingError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{processingError}</span>
          </div>
        )}

        {/* Drug Interaction Alert */}
        {showInteractionAlert && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <span className="font-medium text-amber-800">Drug Interaction Alert</span>
            </div>
            <p className="text-sm text-amber-700 mb-2">
              This medication may interact with:
            </p>
            <ul className="text-sm text-amber-700 list-disc list-inside mb-3">
              {drugInteractions.map((interaction, index) => (
                <li key={index}>{interaction}</li>
              ))}
            </ul>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowInteractionAlert(false)}
              className="border-amber-300 text-amber-700 hover:bg-amber-100"
            >
              Acknowledge
            </Button>
          </div>
        )}

        {/* Pending Refills List */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-blue-600" />
              Pending Refill Requests
            </CardTitle>
            <CardDescription>
              {pendingRefills.length} refill request{pendingRefills.length !== 1 ? 's' : ''} awaiting your review
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingRefills.length === 0 ? (
              <div className="text-center py-8">
                <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No pending refills</h3>
                <p className="text-gray-600">All prescription refill requests have been processed.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRefills.map((refill) => (
                  <div key={refill.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-medium text-gray-900">{refill.patientName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            {new Date(refill.requestDate).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          <div>
                            <p className="text-sm text-gray-600">Medication</p>
                            <p className="font-medium text-gray-900">{refill.medicationName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Dosage</p>
                            <p className="font-medium text-gray-900">{refill.dosage}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Frequency</p>
                            <p className="font-medium text-gray-900">{refill.frequency}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-600">
                            Refills Remaining: <span className="font-medium">{refill.refillsRemaining || 0}</span>
                          </span>
                          <span className="text-gray-600">
                            Original Rx: <span className="font-medium">{refill.originalPrescriptionId}</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(refill)}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApproveRefill(refill)}
                          className="text-green-600 border-green-600 hover:bg-green-50"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDenyRefill(refill)}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Deny
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Refill Details Modal */}
        {showDetails && selectedRefill && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Refill Request Details</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Patient Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <span className="ml-2 font-medium">{selectedRefill.patientName}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Patient ID:</span>
                      <span className="ml-2 font-medium">{selectedRefill.patientId}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Request Date:</span>
                      <span className="ml-2 font-medium">{new Date(selectedRefill.requestDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Medication Details</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Medication:</span>
                      <span className="ml-2 font-medium">{selectedRefill.medicationName}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Dosage:</span>
                      <span className="ml-2 font-medium">{selectedRefill.dosage}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Frequency:</span>
                      <span className="ml-2 font-medium">{selectedRefill.frequency}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Refills Remaining:</span>
                      <span className="ml-2 font-medium">{selectedRefill.refillsRemaining || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedRefill.medicationDetails && (
                <div className="mt-6">
                  <h3 className="font-medium text-gray-900 mb-3">Medication Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Common Interactions:</p>
                      <ul className="text-sm text-gray-700 list-disc list-inside">
                        {selectedRefill.medicationDetails.commonInteractions.map((interaction, index) => (
                          <li key={index}>{interaction}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Warnings:</p>
                      <ul className="text-sm text-gray-700 list-disc list-inside">
                        {selectedRefill.medicationDetails.warnings.map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Approval Form */}
        {showApprovalForm && selectedRefill && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-green-600">Approve Refill Request</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowApprovalForm(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm text-green-800">
                    <strong>Patient:</strong> {selectedRefill.patientName} |
                    <strong> Medication:</strong> {selectedRefill.medicationName}
                  </p>
                </div>

                <div>
                  <label htmlFor="pharmacy" className="block text-sm font-medium text-gray-700 mb-2">
                    Select Pharmacy
                  </label>
                  <select
                    id="pharmacy"
                    value={selectedPharmacy}
                    onChange={(e) => setSelectedPharmacy(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {mockPharmacies.map(pharmacy => (
                      <option key={pharmacy.id} value={pharmacy.id}>
                        {pharmacy.name} - {pharmacy.address}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={confirmApproval}
                    disabled={isProcessing}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Confirm Approval
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowApprovalForm(false)}
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Denial Form */}
        {showDenialForm && selectedRefill && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-red-600">Deny Refill Request</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDenialForm(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm text-red-800">
                    <strong>Patient:</strong> {selectedRefill.patientName} |
                    <strong> Medication:</strong> {selectedRefill.medicationName}
                  </p>
                </div>

                <div>
                  <label htmlFor="denialReason" className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Denial *
                  </label>
                  <textarea
                    id="denialReason"
                    value={denialReason}
                    onChange={(e) => setDenialReason(e.target.value)}
                    placeholder="Please provide a detailed reason for denying this refill request..."
                    rows={4}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    maxLength={1000}
                    required
                  />
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {denialReason.length}/1000 characters
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={confirmDenial}
                    disabled={isProcessing || !denialReason.trim()}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 mr-2" />
                        Confirm Denial
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowDenialForm(false)}
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Compliance Notice */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <Shield className="h-5 w-5" />
              Regulatory Compliance
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 space-y-2">
            <p>• All refill actions are logged for regulatory compliance</p>
            <p>• Drug interaction checking is performed automatically</p>
            <p>• Electronic prescriptions are sent securely to pharmacies</p>
            <p>• Patient EHR is updated with all refill decisions</p>
            <p>• Audit trail maintains complete medication history</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
