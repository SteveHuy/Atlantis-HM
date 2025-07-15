"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CreditCard, Building2, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { billingDataManager, type OutstandingBalance } from "@/lib/billing-mock-data";
import { makePaymentSchema, validateCreditCard, formatCardNumber, type MakePaymentFormData } from "@/lib/billing-validation";
import { sessionManager } from "@/lib/epic3-mock-data";

export default function MakePaymentPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string; role: string; firstName: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Payment form state
  const [outstandingBalances, setOutstandingBalances] = useState<OutstandingBalance[]>([]);
  const [selectedBalances, setSelectedBalances] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'Credit Card' | 'ACH Transfer'>('Credit Card');
  const [showCvv, setShowCvv] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
    bankAccount: '',
    routingNumber: '',
    accountType: 'Checking' as 'Checking' | 'Savings'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<{
    amount: number;
    confirmationNumber: string;
  } | null>(null);

  useEffect(() => {
    // const session = sessionManager.getSession();
    // console.log("Session: ", session);
    // if (!session || session.role !== 'patient') {
    //   router.push('/patient/login');
    //   return;
    // }

    // setUser(session);

    // Load outstanding balances for the patient
    const balances = billingDataManager.getOutstandingBalances('P001'); // Using mock patient ID
    setOutstandingBalances(balances);
    setIsLoading(false);
  }, [router]);

  const handleBalanceSelection = (balanceId: string) => {
    setSelectedBalances(prev =>
      prev.includes(balanceId)
        ? prev.filter(id => id !== balanceId)
        : [...prev, balanceId]
    );
    setErrors(prev => ({ ...prev, selectedBalances: '' }));
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'cardNumber') {
      // Format card number with spaces
      value = formatCardNumber(value.replace(/\s/g, ''));
    }
    if (field === 'expiryDate') {
      // Format expiry date MM/YY
      value = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5);
    }
    if (field === 'cvv') {
      // Only allow digits, max 4
      value = value.replace(/\D/g, '').slice(0, 4);
    }

    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const calculateTotalAmount = (): number => {
    return selectedBalances.reduce((total, balanceId) => {
      const balance = outstandingBalances.find(b => b.id === balanceId);
      return total + (balance?.amount || 0);
    }, 0);
  };

  const validateForm = (): boolean => {
    const validationData: Partial<MakePaymentFormData> = {
      selectedBalances,
      paymentMethod,
      cardNumber: paymentMethod === 'Credit Card' ? formData.cardNumber : undefined,
      expiryDate: paymentMethod === 'Credit Card' ? formData.expiryDate : undefined,
      cvv: paymentMethod === 'Credit Card' ? formData.cvv : undefined,
      nameOnCard: paymentMethod === 'Credit Card' ? formData.nameOnCard : undefined,
      bankAccount: paymentMethod === 'ACH Transfer' ? formData.bankAccount : undefined,
      routingNumber: paymentMethod === 'ACH Transfer' ? formData.routingNumber : undefined,
      accountType: paymentMethod === 'ACH Transfer' ? formData.accountType : undefined
    };

    try {
      makePaymentSchema.parse(validationData);

      // Additional credit card validation
      if (paymentMethod === 'Credit Card' && formData.cardNumber) {
        const cardValidation = validateCreditCard(formData.cardNumber.replace(/\s/g, ''));
        if (!cardValidation.isValid) {
          setErrors({ cardNumber: cardValidation.error || 'Invalid card number' });
          return false;
        }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const totalAmount = calculateTotalAmount();
      const confirmationNumber = `PAY-${Date.now()}`;

      // Mock payment processing
      console.log('Processing payment:', {
        amount: totalAmount,
        method: paymentMethod,
        balances: selectedBalances,
        timestamp: new Date().toISOString()
      });

      // Simulate email confirmation
      console.log('Confirmation email sent to:', user?.username);

      setPaymentDetails({
        amount: totalAmount,
        confirmationNumber
      });
      setPaymentSuccess(true);

    } catch (error) {
      setErrors({ submit: 'Payment processing failed. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBackToBilling = () => {
    // UD-REF: #Patient Billing Overview - will be implemented in future epic
    router.push('/patient/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading payment information...</p>
        </div>
      </div>
    );
  }

  if (paymentSuccess && paymentDetails) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
              <CardDescription>Your payment has been processed successfully</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-semibold text-green-800">
                  Amount Paid: ${paymentDetails.amount.toFixed(2)}
                </p>
                <p className="text-green-700">
                  Confirmation Number: {paymentDetails.confirmationNumber}
                </p>
                <p className="text-sm text-green-600 mt-2">
                  A confirmation email has been sent to your registered email address.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={handleBackToBilling} className="flex items-center">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Billing Overview
                </Button>
                <Button variant="outline" onClick={() => router.push('/patient/dashboard')}>
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
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/patient/dashboard')}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Make a Payment</h1>
          <p className="text-gray-600 mt-2">
            Pay your outstanding balances securely online
          </p>
        </div>

        {/* Outstanding Balances */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Outstanding Balances</CardTitle>
            <CardDescription>Select the balances you would like to pay</CardDescription>
          </CardHeader>
          <CardContent>
            {outstandingBalances.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No outstanding balances</p>
              </div>
            ) : (
              <div className="space-y-4">
                {outstandingBalances.map((balance) => (
                  <div
                    key={balance.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedBalances.includes(balance.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleBalanceSelection(balance.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <input
                          type="checkbox"
                          checked={selectedBalances.includes(balance.id)}
                          onChange={() => handleBalanceSelection(balance.id)}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{balance.serviceType}</p>
                          <p className="text-sm text-gray-600">
                            {balance.provider} • {balance.serviceDate}
                          </p>
                          <p className="text-sm text-gray-500">{balance.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-semibold text-gray-900">
                          ${balance.amount.toFixed(2)}
                        </p>
                        {balance.isOverdue && (
                          <p className="text-sm text-red-600 font-medium">Overdue</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {errors.selectedBalances && (
                  <p className="text-red-600 text-sm">{errors.selectedBalances}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {selectedBalances.length > 0 && (
          <>
            {/* Payment Total */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center text-lg">
                  <span className="font-medium">Total Payment Amount:</span>
                  <span className="font-bold text-2xl text-blue-600">
                    ${calculateTotalAmount().toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Selection */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Select Method of Payment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      paymentMethod === 'Credit Card'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setPaymentMethod('Credit Card')}
                  >
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-6 h-6 text-blue-600" />
                      <div>
                        <p className="font-medium">Credit Card</p>
                        <p className="text-sm text-gray-600">Visa, Mastercard, American Express</p>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      paymentMethod === 'ACH Transfer'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setPaymentMethod('ACH Transfer')}
                  >
                    <div className="flex items-center space-x-3">
                      <Building2 className="w-6 h-6 text-blue-600" />
                      <div>
                        <p className="font-medium">ACH Transfer</p>
                        <p className="text-sm text-gray-600">Direct bank transfer</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {paymentMethod === 'Credit Card' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Card Number *
                        </label>
                        <input
                          type="text"
                          value={formData.cardNumber}
                          onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                          placeholder="1234 5678 9012 3456"
                          className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                            errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                          }`}
                          maxLength={19}
                        />
                        {errors.cardNumber && (
                          <p className="text-red-600 text-sm mt-1">{errors.cardNumber}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expiry Date *
                          </label>
                          <input
                            type="text"
                            value={formData.expiryDate}
                            onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                            placeholder="MM/YY"
                            className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                              errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                            }`}
                            maxLength={5}
                          />
                          {errors.expiryDate && (
                            <p className="text-red-600 text-sm mt-1">{errors.expiryDate}</p>
                          )}
                        </div>
                        <div className="relative">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            CVV *
                          </label>
                          <input
                            type={showCvv ? 'text' : 'password'}
                            value={formData.cvv}
                            onChange={(e) => handleInputChange('cvv', e.target.value)}
                            placeholder="123"
                            className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 pr-10 ${
                              errors.cvv ? 'border-red-500' : 'border-gray-300'
                            }`}
                            maxLength={4}
                          />
                          <button
                            type="button"
                            onClick={() => setShowCvv(!showCvv)}
                            className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                          >
                            {showCvv ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          {errors.cvv && (
                            <p className="text-red-600 text-sm mt-1">{errors.cvv}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Name on Card *
                        </label>
                        <input
                          type="text"
                          value={formData.nameOnCard}
                          onChange={(e) => handleInputChange('nameOnCard', e.target.value)}
                          placeholder="John Doe"
                          className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                            errors.nameOnCard ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.nameOnCard && (
                          <p className="text-red-600 text-sm mt-1">{errors.nameOnCard}</p>
                        )}
                      </div>
                    </>
                  )}

                  {paymentMethod === 'ACH Transfer' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bank Account Number *
                        </label>
                        <input
                          type="text"
                          value={formData.bankAccount}
                          onChange={(e) => handleInputChange('bankAccount', e.target.value)}
                          placeholder="Account number"
                          className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                            errors.bankAccount ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.bankAccount && (
                          <p className="text-red-600 text-sm mt-1">{errors.bankAccount}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Routing Number *
                        </label>
                        <input
                          type="text"
                          value={formData.routingNumber}
                          onChange={(e) => handleInputChange('routingNumber', e.target.value)}
                          placeholder="9-digit routing number"
                          className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                            errors.routingNumber ? 'border-red-500' : 'border-gray-300'
                          }`}
                          maxLength={9}
                        />
                        {errors.routingNumber && (
                          <p className="text-red-600 text-sm mt-1">{errors.routingNumber}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Account Type *
                        </label>
                        <select
                          value={formData.accountType}
                          onChange={(e) => handleInputChange('accountType', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="Checking">Checking</option>
                          <option value="Savings">Savings</option>
                        </select>
                      </div>
                    </>
                  )}

                  {/* Security Notice */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Secure Payment Processing</p>
                        <p>
                          All payment information is encrypted and processed securely.
                          We do not store your payment details on our servers.
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
                  <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      disabled={isProcessing}
                      className="px-8 py-3 text-lg"
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing Payment...
                        </>
                      ) : (
                        `Process Payment ($${calculateTotalAmount().toFixed(2)})`
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
