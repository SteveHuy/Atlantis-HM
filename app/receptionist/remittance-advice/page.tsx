"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, CheckCircle, AlertTriangle, Building2, DollarSign } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { billingDataManager, type RemittanceAdvice, logBillingActivity } from "@/lib/billing-mock-data";
import { remittanceReconciliationSchema, formatCurrency, type RemittanceReconciliationFormData } from "@/lib/billing-validation";
import { sessionManager } from "@/lib/epic3-mock-data";

export default function RemittanceAdvicePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string; role: string; firstName: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Remittance state
  const [remittanceAdvice, setRemittanceAdvice] = useState<RemittanceAdvice[]>([]);
  const [selectedRemittance, setSelectedRemittance] = useState<RemittanceAdvice | null>(null);
  const [selectedClaimId, setSelectedClaimId] = useState('');
  const [isReconciling, setIsReconciling] = useState(false);
  const [reconciliationSuccess, setReconciliationSuccess] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    adjustments: 0,
    notes: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const session = sessionManager.getSession();
    if (!session || session.role !== 'receptionist') {
      router.push('/receptionist/login');
      return;
    }
    
    setUser(session);
    
    // Load remittance advice
    const advice = billingDataManager.getRemittanceAdvice();
    setRemittanceAdvice(advice);
    setIsLoading(false);
  }, [router]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleClaimSelection = (claimId: string) => {
    setSelectedClaimId(claimId);
    const remittance = remittanceAdvice.find(r => r.claimId === claimId);
    setSelectedRemittance(remittance || null);
    setErrors({});
    setReconciliationSuccess(false);
  };

  const validateForm = (): boolean => {
    if (!selectedRemittance) {
      setErrors({ submit: 'Please select a claim to reconcile' });
      return false;
    }

    const validationData: RemittanceReconciliationFormData = {
      remittanceId: selectedRemittance.id,
      claimId: selectedRemittance.claimId,
      amountReceived: selectedRemittance.amountPaid,
      adjustments: formData.adjustments,
      notes: formData.notes
    };

    try {
      remittanceReconciliationSchema.parse(validationData);
      setErrors({});
      return true;
    } catch (error: any) {
      const fieldErrors: Record<string, string> = {};
      
      if (error.errors) {
        error.errors.forEach((err: any) => {
          const field = err.path[0];
          fieldErrors[field] = err.message;
        });
      }
      
      setErrors(fieldErrors);
      return false;
    }
  };

  const handleReconcile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRemittance || !validateForm()) {
      return;
    }
    
    setIsReconciling(true);
    
    try {
      // Simulate reconciliation processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Process reconciliation through billing data manager
      const success = billingDataManager.reconcileRemittance(selectedRemittance.id);
      
      if (success) {
        // Log the activity
        logBillingActivity(
          'remittance_reconciled',
          'system', // Patient ID not applicable for remittance
          user?.username || 'Unknown',
          {
            remittanceId: selectedRemittance.id,
            claimId: selectedRemittance.claimId,
            amountPaid: selectedRemittance.amountPaid,
            adjustments: formData.adjustments,
            notes: formData.notes
          }
        );
        
        // Update local state
        setRemittanceAdvice(prev => 
          prev.map(advice => 
            advice.id === selectedRemittance.id 
              ? { ...advice, reconciled: true, reconciledDate: new Date().toISOString() }
              : advice
          )
        );
        
        setReconciliationSuccess(true);
        
        // Auto-redirect to Process Payments after 3 seconds
        setTimeout(() => {
          // UD-REF: #Process Payments - redirect to Process Payments page
          router.push('/receptionist/process-payments');
        }, 3000);
        
      } else {
        setErrors({ submit: 'Failed to reconcile remittance. Please try again.' });
      }
      
    } catch (error) {
      setErrors({ submit: 'Reconciliation failed. Please try again.' });
    } finally {
      setIsReconciling(false);
    }
  };

  const getUnreconciledAdvice = () => {
    return remittanceAdvice.filter(advice => !advice.reconciled);
  };

  const getReconciledAdvice = () => {
    return remittanceAdvice.filter(advice => advice.reconciled);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading remittance advice...</p>
        </div>
      </div>
    );
  }

  if (reconciliationSuccess && selectedRemittance) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <CardTitle className="text-2xl text-green-600">Reconciliation Completed Successfully!</CardTitle>
              <CardDescription>Payment has been reconciled with patient account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div>
                    <p className="text-sm font-medium text-green-800">Claim ID</p>
                    <p className="text-green-700">{selectedRemittance.claimId}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-800">Amount Paid</p>
                    <p className="text-green-700 font-semibold">{formatCurrency(selectedRemittance.amountPaid)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-800">Payer</p>
                    <p className="text-green-700">{selectedRemittance.payerName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-800">Reconciled</p>
                    <p className="text-green-700">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>
                {formData.adjustments !== 0 && (
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <p className="text-sm font-medium text-green-800">Adjustments Applied</p>
                    <p className="text-green-700">{formatCurrency(formData.adjustments)}</p>
                  </div>
                )}
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Redirecting to Process Payments in 3 seconds...
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => setReconciliationSuccess(false)} className="flex items-center">
                  Reconcile Another
                </Button>
                <Button variant="outline" onClick={() => router.push('/receptionist/dashboard')}>
                  Return to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const unreconciledAdvice = getUnreconciledAdvice();
  const reconciledAdvice = getReconciledAdvice();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
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
          <h1 className="text-3xl font-bold text-gray-900">Receive Remittance Advice</h1>
          <p className="text-gray-600 mt-2">
            Reconcile electronic remittance advice with patient accounts
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Remittance Advice Selection */}
          <div className="space-y-6">
            {/* Claim Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Remittance Advice</CardTitle>
                <CardDescription>Select a claim to reconcile from electronic remittance advice</CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Claim to Reconcile *
                  </label>
                  <select
                    value={selectedClaimId}
                    onChange={(e) => handleClaimSelection(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-- Select a claim ID --</option>
                    {unreconciledAdvice.map((advice) => (
                      <option key={advice.id} value={advice.claimId}>
                        {advice.claimId} - {advice.payerName} - {formatCurrency(advice.amountPaid)}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Unreconciled Remittance Advice */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Pending Reconciliation</span>
                  <span className="text-sm font-normal text-gray-500">
                    {unreconciledAdvice.length} item(s)
                  </span>
                </CardTitle>
                <CardDescription>Remittance advice awaiting reconciliation</CardDescription>
              </CardHeader>
              <CardContent>
                {unreconciledAdvice.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No pending remittance advice</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {unreconciledAdvice.map((advice) => (
                      <div
                        key={advice.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedRemittance?.id === advice.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleClaimSelection(advice.claimId)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                              <Building2 className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{advice.claimId}</p>
                              <p className="text-sm text-gray-600">{advice.payerName}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-gray-900">
                              {formatCurrency(advice.amountPaid)}
                            </p>
                            <p className="text-sm text-gray-600">Paid</p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>Processing Date: {new Date(advice.processingDate).toLocaleDateString()}</p>
                          {advice.adjustments > 0 && (
                            <p>Adjustments: {formatCurrency(advice.adjustments)}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Reconciliation */}
          <div className="space-y-6">
            {/* Remittance Details */}
            {selectedRemittance && (
              <Card>
                <CardHeader>
                  <CardTitle>Remittance Details</CardTitle>
                  <CardDescription>Details of selected remittance advice</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Claim ID</p>
                        <p className="text-gray-900">{selectedRemittance.claimId}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Payer Information</p>
                        <p className="text-gray-900">{selectedRemittance.payerInformation}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Amount Paid</p>
                        <p className="text-lg font-semibold text-green-600">
                          {formatCurrency(selectedRemittance.amountPaid)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Processing Date</p>
                        <p className="text-gray-900">
                          {new Date(selectedRemittance.processingDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    {(selectedRemittance.adjustments > 0 || selectedRemittance.deniedAmount > 0) && (
                      <div className="border-t pt-4">
                        <h4 className="font-medium text-gray-900 mb-2">Additional Details</h4>
                        <div className="grid grid-cols-2 gap-4">
                          {selectedRemittance.adjustments > 0 && (
                            <div>
                              <p className="text-sm font-medium text-gray-700">Adjustments</p>
                              <p className="text-yellow-600">{formatCurrency(selectedRemittance.adjustments)}</p>
                            </div>
                          )}
                          {selectedRemittance.deniedAmount > 0 && (
                            <div>
                              <p className="text-sm font-medium text-gray-700">Denied Amount</p>
                              <p className="text-red-600">{formatCurrency(selectedRemittance.deniedAmount)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reconciliation Form */}
            <Card>
              <CardHeader>
                <CardTitle>Reconcile Payment</CardTitle>
                <CardDescription>
                  {selectedRemittance 
                    ? `Reconcile payment for claim ${selectedRemittance.claimId}`
                    : 'Select a remittance advice to reconcile'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedRemittance ? (
                  <div className="text-center py-8 text-gray-500">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>Please select a remittance advice to reconcile</p>
                  </div>
                ) : (
                  <form onSubmit={handleReconcile} className="space-y-6">
                    {/* Manual Adjustments */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Manual Adjustments (Optional)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          value={formData.adjustments}
                          onChange={(e) => handleInputChange('adjustments', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          step="0.01"
                          className={`w-full pl-8 pr-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                            errors.adjustments ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                      </div>
                      {errors.adjustments && (
                        <p className="text-red-600 text-sm mt-1">{errors.adjustments}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Enter positive amount to increase balance, negative to decrease
                      </p>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reconciliation Notes (Optional)
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        placeholder="Add any notes about this reconciliation..."
                        rows={3}
                        maxLength={1000}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                          errors.notes ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.notes.length}/1000 characters
                      </p>
                      {errors.notes && (
                        <p className="text-red-600 text-sm mt-1">{errors.notes}</p>
                      )}
                    </div>

                    {/* Summary */}
                    <div className="bg-gray-50 border rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Reconciliation Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Amount Received:</span>
                          <span className="font-medium">{formatCurrency(selectedRemittance.amountPaid)}</span>
                        </div>
                        {formData.adjustments !== 0 && (
                          <div className="flex justify-between">
                            <span>Manual Adjustments:</span>
                            <span className={`font-medium ${formData.adjustments > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formData.adjustments > 0 ? '+' : ''}{formatCurrency(formData.adjustments)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-medium">Net Amount Applied:</span>
                          <span className="font-semibold">
                            {formatCurrency(selectedRemittance.amountPaid + formData.adjustments)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {errors.submit && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800">{errors.submit}</p>
                      </div>
                    )}

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isReconciling}
                      className="w-full py-3 text-lg"
                    >
                      {isReconciling ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Reconciling...
                        </>
                      ) : (
                        <>
                          <DollarSign className="w-4 h-4 mr-2" />
                          Reconcile Payment
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Reconciled Remittance Advice */}
        {reconciledAdvice.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recently Reconciled</span>
                <span className="text-sm font-normal text-gray-500">
                  {reconciledAdvice.length} item(s)
                </span>
              </CardTitle>
              <CardDescription>Recently reconciled remittance advice</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Claim ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount Paid
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reconciled Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reconciledAdvice.map((advice, index) => (
                      <tr key={advice.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {advice.claimId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {advice.payerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                          {formatCurrency(advice.amountPaid)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {advice.reconciledDate ? new Date(advice.reconciledDate).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}