"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Edit, Calendar, CreditCard, Building2, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { billingDataManager, type PaymentPlan } from "@/lib/billing-mock-data";
import { paymentPlanSchema, formatCurrency, calculatePaymentSchedule, type PaymentPlanFormData } from "@/lib/billing-validation";
import { sessionManager } from "@/lib/epic3-mock-data";

export default function ManagePaymentPlansPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string; role: string; firstName: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Payment plans state
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PaymentPlan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    totalAmount: 500.00, // Mock total amount (read-only)
    paymentInterval: 'Monthly' as 'Weekly' | 'Monthly',
    paymentMethod: 'Credit Card' as 'Credit Card' | 'Bank Transfer',
    paymentAmount: 100.00,
    startDate: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // const session = sessionManager.getSession();
    // if (!session || session.role !== 'patient') {
    //   router.push('/patient/login');
    //   return;
    // }

    // setUser(session);

    // Load existing payment plans for the patient
    const plans = billingDataManager.getPaymentPlans('P001'); // Using mock patient ID
    setPaymentPlans(plans);
    setIsLoading(false);
  }, [router]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = (): boolean => {
    try {
      paymentPlanSchema.parse(formData);

      // Additional business logic validation
      if (formData.paymentAmount > formData.totalAmount) {
        setErrors({ paymentAmount: 'Payment amount cannot exceed total amount' });
        return false;
      }

      const startDate = new Date(formData.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (startDate < today) {
        setErrors({ startDate: 'Start date cannot be in the past' });
        return false;
      }

      setErrors({});
      return true;
    } catch (error: any) {
      const fieldErrors: Record<string, string> = {};

      if (error.issues) {
        error.issues.forEach((err: any) => {
          const field = err.path[0];
          fieldErrors[field] = err.message;
        });
      }

      setErrors(fieldErrors);
      return false;
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Calculate next payment date
      const startDate = new Date(formData.startDate);
      const nextPaymentDate = new Date(startDate);
      if (formData.paymentInterval === 'Weekly') {
        nextPaymentDate.setDate(nextPaymentDate.getDate() + 7);
      } else {
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
      }

      const newPlan = billingDataManager.createPaymentPlan({
        patientId: 'P001',
        totalAmount: formData.totalAmount,
        remainingAmount: formData.totalAmount,
        paymentInterval: formData.paymentInterval,
        paymentMethod: formData.paymentMethod,
        startDate: formData.startDate,
        nextPaymentDate: nextPaymentDate.toISOString().split('T')[0],
        paymentAmount: formData.paymentAmount,
        status: 'Active'
      });

      setPaymentPlans(prev => [...prev, newPlan]);
      setShowForm(false);
      setSuccessMessage('Payment plan created successfully');

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);

    } catch (error) {
      setErrors({ submit: 'Failed to create payment plan. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdatePlan = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingPlan || !validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Calculate next payment date
      const startDate = new Date(formData.startDate);
      const nextPaymentDate = new Date(startDate);
      if (formData.paymentInterval === 'Weekly') {
        nextPaymentDate.setDate(nextPaymentDate.getDate() + 7);
      } else {
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
      }

      const updatedPlan = billingDataManager.updatePaymentPlan(editingPlan.id, {
        paymentInterval: formData.paymentInterval,
        paymentMethod: formData.paymentMethod,
        paymentAmount: formData.paymentAmount,
        nextPaymentDate: nextPaymentDate.toISOString().split('T')[0]
      });

      if (updatedPlan) {
        setPaymentPlans(prev =>
          prev.map(plan => plan.id === editingPlan.id ? updatedPlan : plan)
        );
        setEditingPlan(null);
        setShowForm(false);
        setSuccessMessage('Payment plan updated successfully');

        // Clear success message after 5 seconds
        setTimeout(() => setSuccessMessage(''), 5000);
      }

    } catch (error) {
      setErrors({ submit: 'Failed to update payment plan. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditPlan = (plan: PaymentPlan) => {
    setEditingPlan(plan);
    setFormData({
      totalAmount: plan.totalAmount,
      paymentInterval: plan.paymentInterval,
      paymentMethod: plan.paymentMethod,
      paymentAmount: plan.paymentAmount,
      startDate: plan.startDate
    });
    setShowForm(true);
    setErrors({});
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingPlan(null);
    setFormData({
      totalAmount: 500.00,
      paymentInterval: 'Monthly',
      paymentMethod: 'Credit Card',
      paymentAmount: 100.00,
      startDate: new Date().toISOString().split('T')[0]
    });
    setErrors({});
  };

  const getPaymentSchedulePreview = () => {
    if (!formData.paymentAmount || !formData.startDate) return [];

    return calculatePaymentSchedule(
      formData.totalAmount,
      formData.paymentAmount,
      formData.paymentInterval,
      new Date(formData.startDate)
    ).slice(0, 3); // Show first 3 payments
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading payment plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => router.push('/patient/dashboard')}
              className="flex items-center mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Manage Payment Plans</h1>
          <p className="text-gray-600 mt-2">
            Setup and adjust your payment plans to manage healthcare expenses flexibly
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <p className="text-green-800">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Current Payment Plans */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Current Payment Plans</CardTitle>
              <CardDescription>View and manage your active payment plans</CardDescription>
            </div>
            {!showForm && (
              <Button onClick={() => setShowForm(true)} className="flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Create New Plan
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {paymentPlans.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No payment plans created yet</p>
                <p className="text-sm mt-1">Create your first payment plan to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {paymentPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <div className="flex items-center space-x-2">
                            {plan.paymentMethod === 'Credit Card' ? (
                              <CreditCard className="w-5 h-5 text-blue-600" />
                            ) : (
                              <Building2 className="w-5 h-5 text-blue-600" />
                            )}
                            <span className="font-medium">{plan.paymentMethod}</span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            plan.status === 'Active' ? 'bg-green-100 text-green-800' :
                            plan.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {plan.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Total Amount</p>
                            <p className="font-semibold">{formatCurrency(plan.totalAmount)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Remaining</p>
                            <p className="font-semibold">{formatCurrency(plan.remainingAmount)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Payment Amount</p>
                            <p className="font-semibold">{formatCurrency(plan.paymentAmount)} {plan.paymentInterval}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Next Payment</p>
                            <p className="font-semibold">{plan.nextPaymentDate}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditPlan(plan)}
                          className="flex items-center"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Adjust Plan
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Payment Plan Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>
                {editingPlan ? 'Adjust Existing Plan' : 'Create New Payment Plan'}
              </CardTitle>
              <CardDescription>
                {editingPlan
                  ? 'Update the details of your existing payment plan'
                  : 'Set up a new payment plan for your healthcare expenses'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={editingPlan ? handleUpdatePlan : handleCreatePlan} className="space-y-6">
                {/* Total Amount (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Amount
                  </label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                    {formatCurrency(formData.totalAmount)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">This amount is based on your outstanding balances</p>
                </div>

                {/* Payment Interval */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Interval *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        formData.paymentInterval === 'Weekly'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleInputChange('paymentInterval', 'Weekly')}
                    >
                      <div className="text-center">
                        <Calendar className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                        <p className="font-medium">Weekly</p>
                        <p className="text-sm text-gray-600">Every 7 days</p>
                      </div>
                    </div>
                    <div
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        formData.paymentInterval === 'Monthly'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleInputChange('paymentInterval', 'Monthly')}
                    >
                      <div className="text-center">
                        <Calendar className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                        <p className="font-medium">Monthly</p>
                        <p className="text-sm text-gray-600">Every 30 days</p>
                      </div>
                    </div>
                  </div>
                  {errors.paymentInterval && (
                    <p className="text-red-600 text-sm mt-1">{errors.paymentInterval}</p>
                  )}
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        formData.paymentMethod === 'Credit Card'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleInputChange('paymentMethod', 'Credit Card')}
                    >
                      <div className="flex items-center space-x-3">
                        <CreditCard className="w-6 h-6 text-blue-600" />
                        <div>
                          <p className="font-medium">Credit Card</p>
                          <p className="text-sm text-gray-600">Automatic charges</p>
                        </div>
                      </div>
                    </div>
                    <div
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        formData.paymentMethod === 'Bank Transfer'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleInputChange('paymentMethod', 'Bank Transfer')}
                    >
                      <div className="flex items-center space-x-3">
                        <Building2 className="w-6 h-6 text-blue-600" />
                        <div>
                          <p className="font-medium">Bank Transfer</p>
                          <p className="text-sm text-gray-600">Direct from account</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {errors.paymentMethod && (
                    <p className="text-red-600 text-sm mt-1">{errors.paymentMethod}</p>
                  )}
                </div>

                {/* Payment Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Amount *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={formData.paymentAmount}
                      onChange={(e) => handleInputChange('paymentAmount', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      min="0.01"
                      max={formData.totalAmount}
                      step="0.01"
                      className={`w-full pl-8 pr-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                        errors.paymentAmount ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.paymentAmount && (
                    <p className="text-red-600 text-sm mt-1">{errors.paymentAmount}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum: {formatCurrency(formData.totalAmount)}
                  </p>
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      errors.startDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.startDate && (
                    <p className="text-red-600 text-sm mt-1">{errors.startDate}</p>
                  )}
                </div>

                {/* Payment Schedule Preview */}
                {formData.paymentAmount > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Payment Schedule Preview</h4>
                    <div className="space-y-2">
                      {getPaymentSchedulePreview().map((payment, index) => (
                        <div key={index} className="flex justify-between text-sm text-blue-800">
                          <span>Payment {index + 1}:</span>
                          <span>{payment.paymentDate.toLocaleDateString()} - {formatCurrency(payment.amount)}</span>
                        </div>
                      ))}
                      {formData.totalAmount > formData.paymentAmount * 3 && (
                        <p className="text-xs text-blue-600 mt-2">
                          + {Math.ceil(formData.totalAmount / formData.paymentAmount) - 3} more payments
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Security Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Secure Payment Handling</p>
                      <p>
                        All payment details are handled securely and in compliance with healthcare regulations.
                        You can modify or cancel your payment plan at any time.
                      </p>
                    </div>
                  </div>
                </div>

                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">{errors.submit}</p>
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelForm}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isProcessing}
                    className="px-8"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {editingPlan ? 'Updating Plan...' : 'Creating Plan...'}
                      </>
                    ) : (
                      editingPlan ? 'Update Plan' : 'Create Plan'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
