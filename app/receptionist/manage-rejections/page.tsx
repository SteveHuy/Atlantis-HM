'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Epic5MockDataManager,
  type RejectedClaim
} from '@/lib/epic5-mock-data';
import {
  claimAdjustmentSchema,
  appealSubmissionSchema,
  type ClaimAdjustmentData,
  type AppealSubmissionData,
  sanitizeInput
} from '@/lib/epic5-validation';
import { ArrowLeft, FileText, AlertCircle, CheckCircle, XCircle, Edit, Send } from 'lucide-react';

export default function ManageRejectionsPage() {
  const router = useRouter();
  const [rejectedClaims, setRejectedClaims] = useState<RejectedClaim[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<RejectedClaim | null>(null);
  const [adjustmentData, setAdjustmentData] = useState<ClaimAdjustmentData>({
    procedureCode: '',
    amount: 0,
    notes: ''
  });
  const [appealLetter, setAppealLetter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('list');

  useEffect(() => {
    // Check if user is logged in as receptionist
    // const userSession = localStorage.getItem('receptionistSession');
    // if (!userSession) {
    //   router.push('/receptionist/login');
    //   return;
    // }

    // Load rejected claims
    loadRejectedClaims();
  }, [router]);

  const loadRejectedClaims = () => {
    const claims = Epic5MockDataManager.getAllRejectedClaims();
    setRejectedClaims(claims);
  };

  const handleClaimSelect = (claim: RejectedClaim) => {
    setSelectedClaim(claim);
    setAdjustmentData({
      procedureCode: claim.adjustmentDetails?.procedureCode || claim.originalDetails.procedureCode,
      amount: claim.adjustmentDetails?.amount || claim.originalAmount,
      notes: claim.adjustmentDetails?.notes || ''
    });
    setAppealLetter('');
    setActiveTab('details');
    setMessage(null);
    setValidationErrors({});
  };

  const handleAdjustmentChange = (field: keyof ClaimAdjustmentData, value: string | number) => {
    setAdjustmentData(prev => ({
      ...prev,
      [field]: field === 'notes' ? sanitizeInput(value as string) : value
    }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateAdjustmentData = (): boolean => {
    try {
      claimAdjustmentSchema.parse(adjustmentData);
      setValidationErrors({});
      return true;
    } catch (error: any) {
      const errors: Record<string, string> = {};
      error.issues?.forEach((err: any) => {
        if (err.path) {
          errors[err.path[0]] = err.message;
        }
      });
      setValidationErrors(errors);
      return false;
    }
  };

  const handleResubmitClaim = async () => {
    if (!selectedClaim) return;

    if (!validateAdjustmentData()) {
      setMessage({ type: 'error', text: 'Please fix validation errors before resubmitting.' });
      return;
    }

    setIsLoading(true);

    try {
      // Update claim adjustments
      const updateSuccess = Epic5MockDataManager.updateClaimAdjustments(
        selectedClaim.id,
        adjustmentData
      );

      if (updateSuccess) {
        // Resubmit claim
        const resubmitSuccess = Epic5MockDataManager.resubmitClaim(selectedClaim.id);

        if (resubmitSuccess) {
          setMessage({
            type: 'success',
            text: 'Claim resubmitted successfully. The payer will review the updated information.'
          });

          // Reload claims data
          loadRejectedClaims();

          // Navigate to Track Claim Status after 2 seconds
          setTimeout(() => {
            router.push('/receptionist/track-claims');
          }, 2000);
        } else {
          setMessage({ type: 'error', text: 'Failed to resubmit claim. Please try again.' });
        }
      } else {
        setMessage({ type: 'error', text: 'Failed to update claim adjustments.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while resubmitting the claim.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAppeal = async () => {
    if (!selectedClaim) return;

    const appealData: AppealSubmissionData = {
      claimId: selectedClaim.claimId,
      appealLetter: sanitizeInput(appealLetter)
    };

    try {
      appealSubmissionSchema.parse(appealData);
      setValidationErrors({});
    } catch (error: any) {
      const errors: Record<string, string> = {};
      error.issues?.forEach((err: any) => {
        if (err.path) {
          errors[err.path[0]] = err.message;
        }
      });
      setValidationErrors(errors);
      setMessage({ type: 'error', text: 'Please fix validation errors before submitting appeal.' });
      return;
    }

    setIsLoading(true);

    try {
      const success = Epic5MockDataManager.submitAppeal(selectedClaim.id, appealData.appealLetter);

      if (success) {
        setMessage({
          type: 'success',
          text: 'Appeal submitted successfully. Electronic submission status: Pending review.'
        });

        // Reload claims data
        loadRejectedClaims();

        // Navigate to Track Claim Status after 2 seconds
        setTimeout(() => {
          router.push('/receptionist/track-claims');
        }, 2000);
      } else {
        setMessage({ type: 'error', text: 'Failed to submit appeal. Please try again.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while submitting the appeal.' });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'rejected': return 'destructive';
      case 'under_review': return 'secondary';
      case 'appealed': return 'outline';
      case 'resubmitted': return 'default';
      default: return 'secondary';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/receptionist/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Rejections and Appeals</h1>
              <p className="text-gray-600">Review and resolve rejected insurance claims</p>
            </div>
          </div>
        </div>

        {message && (
          <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
            {message.type === 'error' ?
              <XCircle className="h-4 w-4 text-red-600" /> :
              <CheckCircle className="h-4 w-4 text-green-600" />
            }
            <AlertDescription className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">Rejected Claims List</TabsTrigger>
            <TabsTrigger value="details" disabled={!selectedClaim}>
              Claim Details {selectedClaim && `(${selectedClaim.claimId})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Rejected Claims ({rejectedClaims.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {rejectedClaims.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No rejected claims found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {rejectedClaims.map((claim) => (
                      <div
                        key={claim.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleClaimSelect(claim)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold">{claim.claimId}</h3>
                            <Badge variant={getStatusColor(claim.status)}>
                              {claim.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          <span className="text-sm text-gray-500">
                            {formatDate(claim.dateSubmitted)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Patient:</span> {claim.patientName}
                          </div>
                          <div>
                            <span className="font-medium">Payer:</span> {claim.payer}
                          </div>
                          <div>
                            <span className="font-medium">Amount:</span> {formatCurrency(claim.originalAmount)}
                          </div>
                          <div>
                            <span className="font-medium">Provider:</span> {claim.originalDetails.providerName}
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className="font-medium text-red-600">Denial Reasons:</span>
                          <ul className="list-disc list-inside text-sm text-red-600 ml-2">
                            {claim.denialReasons.map((reason, index) => (
                              <li key={index}>{reason}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            {selectedClaim && (
              <>
                {/* Original Claim Details - Read Only */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Original Claim Details (Read Only)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label>Claim ID</Label>
                          <Input value={selectedClaim.claimId} readOnly className="bg-gray-50" />
                        </div>
                        <div>
                          <Label>Patient Name</Label>
                          <Input value={selectedClaim.patientName} readOnly className="bg-gray-50" />
                        </div>
                        <div>
                          <Label>Procedure Code</Label>
                          <Input value={selectedClaim.originalDetails.procedureCode} readOnly className="bg-gray-50" />
                        </div>
                        <div>
                          <Label>Procedure Name</Label>
                          <Input value={selectedClaim.originalDetails.procedureName} readOnly className="bg-gray-50" />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label>Service Date</Label>
                          <Input value={formatDate(selectedClaim.originalDetails.serviceDate)} readOnly className="bg-gray-50" />
                        </div>
                        <div>
                          <Label>Provider</Label>
                          <Input value={selectedClaim.originalDetails.providerName} readOnly className="bg-gray-50" />
                        </div>
                        <div>
                          <Label>Original Amount</Label>
                          <Input value={formatCurrency(selectedClaim.originalAmount)} readOnly className="bg-gray-50" />
                        </div>
                        <div>
                          <Label>Payer</Label>
                          <Input value={selectedClaim.payer} readOnly className="bg-gray-50" />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <Label>Denial Reasons</Label>
                      <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                        <ul className="list-disc list-inside text-red-800">
                          {selectedClaim.denialReasons.map((reason, index) => (
                            <li key={index}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Edit Claim - Adjustment Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Edit className="h-5 w-5" />
                      Edit Claim - Adjustment Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="procedureCode">Corrected Procedure Code *</Label>
                        <Input
                          id="procedureCode"
                          value={adjustmentData.procedureCode}
                          onChange={(e) => handleAdjustmentChange('procedureCode', e.target.value)}
                          placeholder="Enter corrected procedure code"
                          className={validationErrors.procedureCode ? 'border-red-500' : ''}
                        />
                        {validationErrors.procedureCode && (
                          <p className="text-red-500 text-sm mt-1">{validationErrors.procedureCode}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="amount">Corrected Amount *</Label>
                        <Input
                          id="amount"
                          type="number"
                          min="0"
                          step="0.01"
                          value={adjustmentData.amount}
                          onChange={(e) => handleAdjustmentChange('amount', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          className={validationErrors.amount ? 'border-red-500' : ''}
                        />
                        {validationErrors.amount && (
                          <p className="text-red-500 text-sm mt-1">{validationErrors.amount}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="notes">Adjustment Notes</Label>
                        <Textarea
                          id="notes"
                          value={adjustmentData.notes}
                          onChange={(e) => handleAdjustmentChange('notes', e.target.value)}
                          placeholder="Enter notes explaining the adjustments made..."
                          rows={4}
                          maxLength={500}
                          className={validationErrors.notes ? 'border-red-500' : ''}
                        />
                        <div className="flex justify-between mt-1">
                          {validationErrors.notes && (
                            <p className="text-red-500 text-sm">{validationErrors.notes}</p>
                          )}
                          <span className="text-sm text-gray-500 ml-auto">
                            {adjustmentData.notes.length}/500
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <Button
                        onClick={handleResubmitClaim}
                        disabled={isLoading}
                        className="w-full"
                      >
                        {isLoading ? 'Resubmitting...' : 'Resubmit Claim'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Submit Appeal */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Send className="h-5 w-5" />
                      Submit Appeal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="claimIdAppeal">Claim ID (Auto-filled)</Label>
                        <Input
                          id="claimIdAppeal"
                          value={selectedClaim.claimId}
                          readOnly
                          className="bg-gray-50"
                        />
                      </div>

                      <div>
                        <Label htmlFor="appealLetter">Appeal Letter *</Label>
                        <Textarea
                          id="appealLetter"
                          value={appealLetter}
                          onChange={(e) => setAppealLetter(sanitizeInput(e.target.value))}
                          placeholder="Please provide a detailed explanation of why this claim should be reconsidered. Include any additional medical information, documentation, or justification for the services provided..."
                          rows={8}
                          maxLength={5000}
                          className={validationErrors.appealLetter ? 'border-red-500' : ''}
                        />
                        <div className="flex justify-between mt-1">
                          {validationErrors.appealLetter && (
                            <p className="text-red-500 text-sm">{validationErrors.appealLetter}</p>
                          )}
                          <span className="text-sm text-gray-500 ml-auto">
                            {appealLetter.length}/5000 (minimum 50 characters)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <Button
                        onClick={handleSubmitAppeal}
                        disabled={isLoading || appealLetter.length < 50}
                        variant="outline"
                        className="w-full"
                      >
                        {isLoading ? 'Submitting Appeal...' : 'Submit Appeal'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Audit Trail */}
                <Card>
                  <CardHeader>
                    <CardTitle>Audit Trail</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedClaim.auditTrail.map((entry, index) => (
                        <div key={entry.id} className="flex items-start gap-3 pb-3 border-b last:border-b-0">
                          <div className="mt-1">
                            {index === 0 ? (
                              <AlertCircle className="h-4 w-4 text-blue-500" />
                            ) : (
                              <div className="h-2 w-2 bg-gray-400 rounded-full mt-1" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{entry.action}</span>
                              <span className="text-sm text-gray-500">
                                {new Date(entry.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{entry.details}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              by {entry.userRole} ({entry.userId})
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
