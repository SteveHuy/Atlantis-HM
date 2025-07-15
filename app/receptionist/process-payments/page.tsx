"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CreditCard, Building2, Banknote, Receipt, CheckCircle, AlertTriangle, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { billingDataManager, type PendingPayment, type PaymentReceipt, logBillingActivity } from "@/lib/billing-mock-data";
import { processPaymentSchema, formatCurrency, type ProcessPaymentFormData } from "@/lib/billing-validation";
import { sessionManager } from "@/lib/epic3-mock-data";

export default function ProcessPaymentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string; role: string; firstName: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Payments state
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<PendingPayment | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedReceipt, setProcessedReceipt] = useState<PaymentReceipt | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    confirmationCode: '',
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
    
    // Load pending payments
    const payments = billingDataManager.getPendingPayments();
    setPendingPayments(payments);
    setIsLoading(false);
  }, [router]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSelectPayment = (payment: PendingPayment) => {
    setSelectedPayment(payment);
    setFormData({
      confirmationCode: '',
      notes: ''
    });
    setErrors({});
    setProcessedReceipt(null);
  };

  const validateForm = (): boolean => {
    if (!selectedPayment) {
      setErrors({ submit: 'Please select a payment to process' });
      return false;
    }

    const validationData: ProcessPaymentFormData = {
      paymentId: selectedPayment.id,
      paymentMethod: selectedPayment.paymentMethod,
      amount: selectedPayment.amount,
      confirmationCode: formData.confirmationCode,
      notes: formData.notes
    };

    try {
      processPaymentSchema.parse(validationData);
      
      // Additional validation for specific payment methods
      if (selectedPayment.paymentMethod !== 'Cash' && !formData.confirmationCode.trim()) {
        setErrors({ confirmationCode: 'Confirmation code is required for non-cash payments' });
        return false;
      }
      
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

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPayment || !validateForm()) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Process payment through billing data manager
      const receipt = billingDataManager.processPayment(selectedPayment.id, user?.username || 'Unknown');
      
      if (receipt) {
        // Log the activity
        logBillingActivity(
          'payment_processed',
          selectedPayment.patientId,
          user?.username || 'Unknown',
          {
            paymentId: selectedPayment.id,
            amount: selectedPayment.amount,
            paymentMethod: selectedPayment.paymentMethod,
            confirmationCode: formData.confirmationCode,
            notes: formData.notes
          }
        );
        
        // Update pending payments list
        setPendingPayments(prev => prev.filter(p => p.id !== selectedPayment.id));
        setProcessedReceipt(receipt);
        setSelectedPayment(null);
        
        // Auto-redirect to Generate Patient Statements after 3 seconds
        setTimeout(() => {
          router.push('/receptionist/generate-statements');
        }, 3000);
        
      } else {
        setErrors({ submit: 'Failed to process payment. Please try again.' });
      }
      
    } catch (error) {
      setErrors({ submit: 'Payment processing failed. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredPayments = pendingPayments.filter(payment => 
    payment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.provider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'Credit Card':
      case 'Debit Card':
        return <CreditCard className="w-5 h-5" />;
      case 'Insurance':
        return <Building2 className="w-5 h-5" />;
      case 'Cash':
        return <Banknote className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'Credit Card':
        return 'text-blue-600 bg-blue-100';
      case 'Debit Card':
        return 'text-green-600 bg-green-100';
      case 'Insurance':
        return 'text-purple-600 bg-purple-100';
      case 'Cash':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading payments...</p>
        </div>
      </div>
    );
  }

  if (processedReceipt) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <CardTitle className="text-2xl text-green-600">Payment Processed Successfully!</CardTitle>
              <CardDescription>Transaction completed and receipt generated</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div>
                    <p className="text-sm font-medium text-green-800">Patient</p>
                    <p className="text-green-700">{processedReceipt.patientName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-800">Amount</p>
                    <p className="text-green-700 font-semibold">{formatCurrency(processedReceipt.amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-800">Payment Method</p>
                    <p className="text-green-700">{processedReceipt.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-800">Receipt Number</p>
                    <p className="text-green-700 font-mono">{processedReceipt.receiptNumber}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-green-200">
                  <p className="text-sm text-green-600">
                    Transaction ID: {processedReceipt.transactionId}
                  </p>
                  <p className="text-sm text-green-600">
                    Processed by: {processedReceipt.processedBy}
                  </p>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <Receipt className="w-4 h-4 inline mr-2" />
                  Redirecting to Generate Patient Statements in 3 seconds...
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => setProcessedReceipt(null)} className="flex items-center">
                  Process Another Payment
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
          <h1 className="text-3xl font-bold text-gray-900">Process Payments</h1>
          <p className="text-gray-600 mt-2">
            Process pending payments from patients and generate receipts
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Pending Payments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Pending Payments</span>
                <span className="text-sm font-normal text-gray-500">
                  {filteredPayments.length} payment(s)
                </span>
              </CardTitle>
              <CardDescription>Select a payment to process</CardDescription>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by patient name, ID, or provider..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </CardHeader>
            <CardContent>
              {filteredPayments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No pending payments found</p>
                  {searchTerm && (
                    <p className="text-sm mt-1">Try adjusting your search criteria</p>
                  )}
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedPayment?.id === payment.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleSelectPayment(payment)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${getPaymentMethodColor(payment.paymentMethod)}`}>
                            {getPaymentIcon(payment.paymentMethod)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{payment.patientName}</p>
                            <p className="text-sm text-gray-600">ID: {payment.patientId}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            {formatCurrency(payment.amount)}
                          </p>
                          <p className="text-sm text-gray-600">{payment.paymentMethod}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Provider: {payment.provider}</p>
                        <p>Service Date: {payment.serviceDate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Column - Payment Processing */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Processing</CardTitle>
              <CardDescription>
                {selectedPayment 
                  ? `Process payment for ${selectedPayment.patientName}`
                  : 'Select a payment from the left to process'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedPayment ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Please select a payment to process</p>
                </div>
              ) : (
                <form onSubmit={handleProcessPayment} className="space-y-6">
                  {/* Payment Details */}
                  <div className="bg-gray-50 border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Payment Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Patient</p>
                        <p className="font-medium">{selectedPayment.patientName}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Patient ID</p>
                        <p className="font-medium">{selectedPayment.patientId}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Amount</p>
                        <p className="font-medium text-lg">{formatCurrency(selectedPayment.amount)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Payment Method</p>
                        <p className="font-medium">{selectedPayment.paymentMethod}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-gray-600">Provider</p>
                        <p className="font-medium">{selectedPayment.provider}</p>
                      </div>
                    </div>
                  </div>

                  {/* Confirmation Code */}
                  {selectedPayment.paymentMethod !== 'Cash' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirmation Code *
                      </label>
                      <input
                        type="text"
                        value={formData.confirmationCode}
                        onChange={(e) => handleInputChange('confirmationCode', e.target.value)}
                        placeholder="Enter confirmation code from payment processor"
                        className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                          errors.confirmationCode ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.confirmationCode && (
                        <p className="text-red-600 text-sm mt-1">{errors.confirmationCode}</p>
                      )}
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="Add any additional notes about this payment..."
                      rows={3}
                      maxLength={500}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                        errors.notes ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.notes.length}/500 characters
                    </p>
                    {errors.notes && (
                      <p className="text-red-600 text-sm mt-1">{errors.notes}</p>
                    )}
                  </div>

                  {/* Security Notice */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Payment Processing Security</p>
                        <p>
                          All payment processing is logged for audit purposes. Ensure all payment 
                          details are verified before processing.
                        </p>
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
                    disabled={isProcessing}
                    className="w-full py-3 text-lg"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <Receipt className="w-4 h-4 mr-2" />
                        Process Payment ({formatCurrency(selectedPayment.amount)})
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}