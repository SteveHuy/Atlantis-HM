"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, Eye, Shield, CreditCard } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { billingDataManager, type BillingTransaction } from "@/lib/billing-mock-data";
import { formatCurrency } from "@/lib/billing-validation";
import { sessionManager } from "@/lib/epic3-mock-data";

export default function PatientBillingInfoPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string; role: string; firstName: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<BillingTransaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<BillingTransaction | null>(null);

  useEffect(() => {
    const session = sessionManager.getSession();
    if (!session || session.role !== 'patient') {
      router.push('/patient/login');
      return;
    }
    
    setUser(session);
    
    // Load patient billing transactions
    const patientTransactions = billingDataManager.getBillingTransactions('P001'); // Mock patient ID
    setTransactions(patientTransactions);
    setIsLoading(false);
  }, [router]);

  const handleViewDetails = (transaction: BillingTransaction) => {
    setSelectedTransaction(transaction);
  };

  const handleDownloadStatement = (transaction: BillingTransaction) => {
    // Generate and download billing statement
    const statementContent = generatePatientStatement(transaction);
    const blob = new Blob([statementContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `billing_statement_${transaction.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generatePatientStatement = (transaction: BillingTransaction): string => {
    return `ATLANTIS HMS - BILLING STATEMENT
Generated: ${new Date().toLocaleString()}

PATIENT: ${transaction.patientName}
PATIENT ID: ${transaction.patientId}

BILLING DETAILS:
Service Date: ${transaction.serviceDate}
Service Type: ${transaction.serviceType}
Provider: ${transaction.provider}

FINANCIAL SUMMARY:
Total Amount: ${formatCurrency(transaction.totalAmount)}
Amount Paid: ${formatCurrency(transaction.paidAmount)}
Outstanding Balance: ${formatCurrency(transaction.balance)}
Payment Status: ${transaction.status}

${transaction.insuranceDetails ? `
INSURANCE INFORMATION:
Provider: ${transaction.insuranceDetails.provider}
Policy Number: ${transaction.insuranceDetails.policyNumber}
Copay: ${formatCurrency(transaction.insuranceDetails.copay)}
` : ''}

Thank you for choosing Atlantis HMS for your healthcare needs.
For questions about this bill, please contact our billing department.`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'Outstanding':
        return 'bg-blue-100 text-blue-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTotalOutstanding = () => {
    return transactions.reduce((sum, t) => sum + t.balance, 0);
  };

  const getTotalPaid = () => {
    return transactions.reduce((sum, t) => sum + t.paidAmount, 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading billing information...</p>
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
            onClick={() => router.push('/patient/dashboard')}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Billing Information</h1>
          <p className="text-gray-600 mt-2">
            View your billing history, payment details, and download statements
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Paid</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(getTotalPaid())}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-red-100 text-red-600">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Outstanding Balance</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(getTotalOutstanding())}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-bold text-blue-600">{transactions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Transaction List */}
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>Your past and current billing transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No billing transactions found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedTransaction?.id === transaction.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleViewDetails(transaction)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{transaction.serviceType}</p>
                          <p className="text-sm text-gray-600">{transaction.serviceDate}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            {formatCurrency(transaction.totalAmount)}
                          </p>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                            {transaction.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Provider: {transaction.provider}</p>
                        <p>Balance: {formatCurrency(transaction.balance)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Column - Transaction Details */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction Details</CardTitle>
              <CardDescription>
                {selectedTransaction 
                  ? `Details for ${selectedTransaction.serviceType}`
                  : 'Select a transaction to view details'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedTransaction ? (
                <div className="text-center py-8 text-gray-500">
                  <Eye className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Select a transaction to view details</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Service Details */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Service Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Service Type</p>
                        <p className="font-medium">{selectedTransaction.serviceType}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Service Date</p>
                        <p className="font-medium">{selectedTransaction.serviceDate}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-gray-600">Provider</p>
                        <p className="font-medium">{selectedTransaction.provider}</p>
                      </div>
                    </div>
                  </div>

                  {/* Financial Details */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Financial Summary</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Total Amount</p>
                        <p className="font-semibold">{formatCurrency(selectedTransaction.totalAmount)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Amount Paid</p>
                        <p className="font-semibold text-green-600">{formatCurrency(selectedTransaction.paidAmount)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Outstanding Balance</p>
                        <p className={`font-semibold ${selectedTransaction.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {formatCurrency(selectedTransaction.balance)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Status</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedTransaction.status)}`}>
                          {selectedTransaction.status}
                        </span>
                      </div>
                      {selectedTransaction.paymentDate && (
                        <div className="col-span-2">
                          <p className="text-gray-600">Last Payment</p>
                          <p className="font-medium">{selectedTransaction.paymentDate}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Insurance Information */}
                  {selectedTransaction.insuranceDetails && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <Shield className="w-4 h-4 mr-2" />
                        Insurance Information
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Insurance Provider</p>
                          <p className="font-medium">{selectedTransaction.insuranceDetails.provider}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Policy Number</p>
                          <p className="font-medium">{selectedTransaction.insuranceDetails.policyNumber}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Group Number</p>
                          <p className="font-medium">{selectedTransaction.insuranceDetails.groupNumber}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Copay</p>
                          <p className="font-medium">{formatCurrency(selectedTransaction.insuranceDetails.copay)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Claim Information */}
                  {selectedTransaction.claimId && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Claim Information</h4>
                      <div className="text-sm">
                        <p className="text-gray-600">Claim ID</p>
                        <p className="font-medium">{selectedTransaction.claimId}</p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col gap-3 pt-4 border-t">
                    <Button
                      onClick={() => handleDownloadStatement(selectedTransaction)}
                      className="flex items-center justify-center"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Statement
                    </Button>
                    {selectedTransaction.balance > 0 && (
                      <Button
                        variant="outline"
                        onClick={() => router.push('/patient/make-payment')}
                        className="flex items-center justify-center"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Make Payment
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}