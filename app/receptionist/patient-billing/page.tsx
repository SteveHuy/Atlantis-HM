"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Filter, Download, FileText, Edit, Eye, CreditCard, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { billingDataManager, type BillingTransaction, logBillingActivity } from "@/lib/billing-mock-data";
import { billingSearchSchema, billingUpdateSchema, formatCurrency, type BillingSearchFormData, type BillingUpdateFormData } from "@/lib/billing-validation";
import { sessionManager } from "@/lib/epic3-mock-data";

export default function ViewPatientBillingInfoPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string; role: string; firstName: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Billing data state
  const [allTransactions, setAllTransactions] = useState<BillingTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<BillingTransaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<BillingTransaction | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    serviceType: '',
    provider: '',
    status: '' as '' | 'Paid' | 'Partial' | 'Outstanding' | 'Overdue',
    minAmount: '',
    maxAmount: ''
  });
  
  // Update form state
  const [updateForm, setUpdateForm] = useState({
    adjustmentAmount: 0,
    adjustmentReason: '',
    notes: '',
    updateType: 'balance_adjustment' as 'balance_adjustment' | 'payment_correction' | 'billing_correction'
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const session = sessionManager.getSession();
    if (!session || session.role !== 'receptionist') {
      router.push('/receptionist/login');
      return;
    }
    
    setUser(session);
    
    // Load billing transactions
    const transactions = billingDataManager.getBillingTransactions();
    setAllTransactions(transactions);
    setFilteredTransactions(transactions);
    setIsLoading(false);
  }, [router]);

  // Apply search and filters
  useEffect(() => {
    let filtered = allTransactions;
    
    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(transaction => 
        transaction.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.serviceType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply filters
    if (filters.dateFrom) {
      filtered = filtered.filter(t => new Date(t.serviceDate) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      filtered = filtered.filter(t => new Date(t.serviceDate) <= new Date(filters.dateTo));
    }
    if (filters.serviceType) {
      filtered = filtered.filter(t => t.serviceType.toLowerCase().includes(filters.serviceType.toLowerCase()));
    }
    if (filters.provider) {
      filtered = filtered.filter(t => t.provider.toLowerCase().includes(filters.provider.toLowerCase()));
    }
    if (filters.status) {
      filtered = filtered.filter(t => t.status === filters.status);
    }
    if (filters.minAmount) {
      filtered = filtered.filter(t => t.totalAmount >= parseFloat(filters.minAmount));
    }
    if (filters.maxAmount) {
      filtered = filtered.filter(t => t.totalAmount <= parseFloat(filters.maxAmount));
    }
    
    setFilteredTransactions(filtered);
  }, [searchTerm, filters, allTransactions]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      serviceType: '',
      provider: '',
      status: '',
      minAmount: '',
      maxAmount: ''
    });
    setSearchTerm('');
  };

  const handleSelectTransaction = (transaction: BillingTransaction) => {
    setSelectedTransaction(transaction);
    
    // Log access to billing record
    logBillingActivity(
      'billing_record_accessed',
      transaction.patientId,
      user?.username || 'Unknown',
      {
        transactionId: transaction.id,
        patientName: transaction.patientName
      }
    );
  };

  const handleUpdateTransaction = (transaction: BillingTransaction) => {
    setSelectedTransaction(transaction);
    setUpdateForm({
      adjustmentAmount: 0,
      adjustmentReason: '',
      notes: '',
      updateType: 'balance_adjustment'
    });
    setShowUpdateModal(true);
    setErrors({});
  };

  const handleUpdateFormChange = (field: string, value: string | number) => {
    setUpdateForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateUpdateForm = (): boolean => {
    if (!selectedTransaction) return false;

    const validationData: BillingUpdateFormData = {
      transactionId: selectedTransaction.id,
      adjustmentAmount: updateForm.adjustmentAmount,
      adjustmentReason: updateForm.adjustmentReason,
      notes: updateForm.notes,
      updateType: updateForm.updateType
    };

    try {
      billingUpdateSchema.parse(validationData);
      
      // Additional validation
      if (Math.abs(updateForm.adjustmentAmount) > selectedTransaction.totalAmount) {
        setErrors({ adjustmentAmount: 'Adjustment amount cannot exceed total transaction amount' });
        return false;
      }
      
      if (updateForm.adjustmentAmount !== 0 && !updateForm.adjustmentReason.trim()) {
        setErrors({ adjustmentReason: 'Adjustment reason is required when making adjustments' });
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

  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTransaction || !validateUpdateForm()) {
      return;
    }
    
    setIsUpdating(true);
    
    try {
      // Simulate update processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Calculate new balance
      const newBalance = selectedTransaction.balance + updateForm.adjustmentAmount;
      const newPaidAmount = selectedTransaction.totalAmount - newBalance;
      
      // Update transaction
      const updates: Partial<BillingTransaction> = {
        balance: Math.max(0, newBalance),
        paidAmount: Math.max(0, newPaidAmount),
        status: newBalance <= 0 ? 'Paid' : newBalance < selectedTransaction.totalAmount ? 'Partial' : 'Outstanding',
        notes: updateForm.notes || selectedTransaction.notes
      };
      
      const updatedTransaction = billingDataManager.updateBillingTransaction(selectedTransaction.id, updates);
      
      if (updatedTransaction) {
        // Log the update
        logBillingActivity(
          'billing_record_updated',
          selectedTransaction.patientId,
          user?.username || 'Unknown',
          {
            transactionId: selectedTransaction.id,
            updateType: updateForm.updateType,
            adjustmentAmount: updateForm.adjustmentAmount,
            adjustmentReason: updateForm.adjustmentReason,
            oldBalance: selectedTransaction.balance,
            newBalance: updates.balance
          }
        );
        
        // Update local state
        setAllTransactions(prev => 
          prev.map(t => t.id === selectedTransaction.id ? updatedTransaction : t)
        );
        
        setShowUpdateModal(false);
        setSelectedTransaction(updatedTransaction);
      }
      
    } catch (error) {
      setErrors({ submit: 'Failed to update billing record. Please try again.' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDownloadStatement = (transaction: BillingTransaction) => {
    // Generate and download billing statement
    const statementContent = generateStatement(transaction);
    const blob = new Blob([statementContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `billing_statement_${transaction.patientId}_${transaction.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateStatement = (transaction: BillingTransaction): string => {
    return `ATLANTIS HMS - BILLING STATEMENT
Generated: ${new Date().toLocaleString()}

PATIENT INFORMATION:
Name: ${transaction.patientName}
Patient ID: ${transaction.patientId}

BILLING DETAILS:
Transaction ID: ${transaction.id}
Service Date: ${transaction.serviceDate}
Service Type: ${transaction.serviceType}
Provider: ${transaction.provider}

FINANCIAL SUMMARY:
Total Amount: ${formatCurrency(transaction.totalAmount)}
Amount Paid: ${formatCurrency(transaction.paidAmount)}
Outstanding Balance: ${formatCurrency(transaction.balance)}
Status: ${transaction.status}

${transaction.claimId ? `Claim ID: ${transaction.claimId}` : ''}
${transaction.paymentDate ? `Last Payment: ${transaction.paymentDate}` : ''}

${transaction.insuranceDetails ? `
INSURANCE INFORMATION:
Provider: ${transaction.insuranceDetails.provider}
Policy Number: ${transaction.insuranceDetails.policyNumber}
Group Number: ${transaction.insuranceDetails.groupNumber}
Copay: ${formatCurrency(transaction.insuranceDetails.copay)}
` : ''}

${transaction.notes ? `
NOTES:
${transaction.notes}
` : ''}

This statement was generated electronically by Atlantis HMS.
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
      <div className="max-w-7xl mx-auto px-4">
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
          <h1 className="text-3xl font-bold text-gray-900">View Patient Billing Info</h1>
          <p className="text-gray-600 mt-2">
            Manage billing inquiries, view patient billing history, and update records
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Search & Filter</CardTitle>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center"
              >
                <Filter className="w-4 h-4 mr-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by patient name, ID, provider, or service type..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="Paid">Paid</option>
                    <option value="Partial">Partial</option>
                    <option value="Outstanding">Outstanding</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                  <input
                    type="text"
                    placeholder="Filter by service type..."
                    value={filters.serviceType}
                    onChange={(e) => handleFilterChange('serviceType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                  <input
                    type="text"
                    placeholder="Filter by provider..."
                    value={filters.provider}
                    onChange={(e) => handleFilterChange('provider', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex items-end">
                  <Button variant="outline" onClick={clearFilters} className="w-full">
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}

            <div className="text-sm text-gray-600">
              Showing {filteredTransactions.length} of {allTransactions.length} transactions
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Transaction List */}
          <Card>
            <CardHeader>
              <CardTitle>Billing Transactions</CardTitle>
              <CardDescription>Patient billing history and transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No billing transactions found</p>
                  {searchTerm || Object.values(filters).some(f => f) && (
                    <p className="text-sm mt-1">Try adjusting your search or filters</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedTransaction?.id === transaction.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleSelectTransaction(transaction)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{transaction.patientName}</p>
                          <p className="text-sm text-gray-600">ID: {transaction.patientId}</p>
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
                        <p>{transaction.serviceType} • {transaction.serviceDate}</p>
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
                  ? `Details for ${selectedTransaction.patientName}`
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
                  {/* Patient Information */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Patient Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Name</p>
                        <p className="font-medium">{selectedTransaction.patientName}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Patient ID</p>
                        <p className="font-medium">{selectedTransaction.patientId}</p>
                      </div>
                    </div>
                  </div>

                  {/* Billing Details */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Billing Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Total Amount</p>
                        <p className="font-semibold">{formatCurrency(selectedTransaction.totalAmount)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Paid Amount</p>
                        <p className="font-semibold text-green-600">{formatCurrency(selectedTransaction.paidAmount)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Balance</p>
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
                      <div>
                        <p className="text-gray-600">Service Date</p>
                        <p className="font-medium">{selectedTransaction.serviceDate}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Service Type</p>
                        <p className="font-medium">{selectedTransaction.serviceType}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-gray-600">Provider</p>
                        <p className="font-medium">{selectedTransaction.provider}</p>
                      </div>
                    </div>
                  </div>

                  {/* Insurance Details */}
                  {selectedTransaction.insuranceDetails && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <Shield className="w-4 h-4 mr-2" />
                        Insurance Information
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Provider</p>
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

                  {/* Notes */}
                  {selectedTransaction.notes && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Notes</h4>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                        {selectedTransaction.notes}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col gap-3 pt-4 border-t">
                    <Button
                      onClick={() => handleUpdateTransaction(selectedTransaction)}
                      className="flex items-center justify-center"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Update Transaction
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDownloadStatement(selectedTransaction)}
                      className="flex items-center justify-center"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Statement
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => router.push('/receptionist/patient-ehr')}
                      className="flex items-center justify-center"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Patient EHR
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Update Modal */}
        {showUpdateModal && selectedTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Update Transaction</CardTitle>
                <CardDescription>
                  Adjust balance or correct billing information for {selectedTransaction.patientName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Update Type *
                    </label>
                    <select
                      value={updateForm.updateType}
                      onChange={(e) => handleUpdateFormChange('updateType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="balance_adjustment">Balance Adjustment</option>
                      <option value="payment_correction">Payment Correction</option>
                      <option value="billing_correction">Billing Correction</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adjustment Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={updateForm.adjustmentAmount}
                        onChange={(e) => handleUpdateFormChange('adjustmentAmount', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        step="0.01"
                        className={`w-full pl-8 pr-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                          errors.adjustmentAmount ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Positive values increase balance, negative values decrease balance
                    </p>
                    {errors.adjustmentAmount && (
                      <p className="text-red-600 text-sm mt-1">{errors.adjustmentAmount}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adjustment Reason
                    </label>
                    <input
                      type="text"
                      value={updateForm.adjustmentReason}
                      onChange={(e) => handleUpdateFormChange('adjustmentReason', e.target.value)}
                      placeholder="Reason for adjustment..."
                      maxLength={500}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                        errors.adjustmentReason ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.adjustmentReason && (
                      <p className="text-red-600 text-sm mt-1">{errors.adjustmentReason}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={updateForm.notes}
                      onChange={(e) => handleUpdateFormChange('notes', e.target.value)}
                      placeholder="Additional notes..."
                      rows={3}
                      maxLength={1000}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                        errors.notes ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.notes && (
                      <p className="text-red-600 text-sm mt-1">{errors.notes}</p>
                    )}
                  </div>

                  {errors.submit && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-800 text-sm">{errors.submit}</p>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowUpdateModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Updating...
                        </>
                      ) : (
                        'Update Transaction'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}