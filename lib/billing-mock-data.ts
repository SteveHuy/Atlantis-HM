// Billing and Payment Mock Data System
// This file provides comprehensive mock data for all billing and payment features

// Types and Interfaces
export interface OutstandingBalance {
  id: string;
  patientId: string;
  patientName: string;
  amount: number;
  serviceType: string;
  serviceDate: string;
  dueDate: string;
  provider: string;
  description: string;
  isOverdue: boolean;
}

export interface PaymentPlan {
  id: string;
  patientId: string;
  totalAmount: number;
  remainingAmount: number;
  paymentInterval: 'Weekly' | 'Monthly';
  paymentMethod: 'Credit Card' | 'Bank Transfer';
  startDate: string;
  nextPaymentDate: string;
  paymentAmount: number;
  status: 'Active' | 'Completed' | 'Paused';
  createdAt: string;
}

export interface PendingPayment {
  id: string;
  patientId: string;
  patientName: string;
  amount: number;
  paymentMethod: 'Credit Card' | 'Debit Card' | 'Insurance' | 'Cash';
  serviceDate: string;
  provider: string;
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed';
  createdAt: string;
}

export interface LatePayment {
  id: string;
  patientName: string;
  appointmentDate: string;
  serviceProvider: string;
  amountOverdue: number;
  daysPastDue: number;
  lastContactDate?: string;
}

export interface RemittanceAdvice {
  id: string;
  claimId: string;
  payerName: string;
  payerInformation: string;
  amountPaid: number;
  adjustments: number;
  deniedAmount: number;
  reconciled: boolean;
  reconciledDate?: string;
  processingDate: string;
}

export interface BillingTransaction {
  id: string;
  patientId: string;
  patientName: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  claimId?: string;
  paymentDate?: string;
  serviceType: string;
  serviceDate: string;
  provider: string;
  status: 'Paid' | 'Partial' | 'Outstanding' | 'Overdue';
  notes?: string;
  insuranceDetails?: {
    provider: string;
    policyNumber: string;
    groupNumber: string;
    copay: number;
  };
}

export interface PaymentReceipt {
  id: string;
  patientId: string;
  patientName: string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  processedAt: string;
  processedBy: string;
  receiptNumber: string;
}

// Mock Data
export const mockOutstandingBalances: OutstandingBalance[] = [
  {
    id: 'bal-001',
    patientId: 'P001',
    patientName: 'John Doe',
    amount: 150.00,
    serviceType: 'General Consultation',
    serviceDate: '2024-06-15',
    dueDate: '2024-07-15',
    provider: 'Dr. Sarah Johnson',
    description: 'Annual checkup and consultation',
    isOverdue: false
  },
  {
    id: 'bal-002',
    patientId: 'P001',
    patientName: 'John Doe',
    amount: 85.50,
    serviceType: 'Lab Tests',
    serviceDate: '2024-05-20',
    dueDate: '2024-06-20',
    provider: 'Dr. Michael Chen',
    description: 'Blood work and urinalysis',
    isOverdue: true
  },
  {
    id: 'bal-003',
    patientId: 'P002',
    patientName: 'Jane Smith',
    amount: 320.00,
    serviceType: 'Specialist Consultation',
    serviceDate: '2024-06-25',
    dueDate: '2024-07-25',
    provider: 'Dr. Robert Wilson',
    description: 'Cardiology consultation and EKG',
    isOverdue: false
  }
];

export const mockPaymentPlans: PaymentPlan[] = [
  {
    id: 'plan-001',
    patientId: 'P001',
    totalAmount: 1200.00,
    remainingAmount: 800.00,
    paymentInterval: 'Monthly',
    paymentMethod: 'Credit Card',
    startDate: '2024-06-01',
    nextPaymentDate: '2024-08-01',
    paymentAmount: 200.00,
    status: 'Active',
    createdAt: '2024-06-01T10:00:00Z'
  },
  {
    id: 'plan-002',
    patientId: 'P003',
    totalAmount: 450.00,
    remainingAmount: 150.00,
    paymentInterval: 'Weekly',
    paymentMethod: 'Bank Transfer',
    startDate: '2024-07-01',
    nextPaymentDate: '2024-07-22',
    paymentAmount: 75.00,
    status: 'Active',
    createdAt: '2024-07-01T14:30:00Z'
  }
];

export const mockPendingPayments: PendingPayment[] = [
  {
    id: 'pay-001',
    patientId: 'P001',
    patientName: 'John Doe',
    amount: 150.00,
    paymentMethod: 'Credit Card',
    serviceDate: '2024-07-10',
    provider: 'Dr. Sarah Johnson',
    status: 'Pending',
    createdAt: '2024-07-11T09:30:00Z'
  },
  {
    id: 'pay-002',
    patientId: 'P002',
    patientName: 'Jane Smith',
    amount: 75.25,
    paymentMethod: 'Insurance',
    serviceDate: '2024-07-08',
    provider: 'Dr. Michael Chen',
    status: 'Pending',
    createdAt: '2024-07-09T14:15:00Z'
  },
  {
    id: 'pay-003',
    patientId: 'P004',
    patientName: 'Robert Johnson',
    amount: 225.00,
    paymentMethod: 'Cash',
    serviceDate: '2024-07-12',
    provider: 'Dr. Emily Davis',
    status: 'Pending',
    createdAt: '2024-07-12T16:45:00Z'
  }
];

export const mockLatePayments: LatePayment[] = [
  {
    id: 'late-001',
    patientName: 'Alice Williams',
    appointmentDate: '2024-05-15',
    serviceProvider: 'Dr. Sarah Johnson',
    amountOverdue: 185.00,
    daysPastDue: 45,
    lastContactDate: '2024-06-20'
  },
  {
    id: 'late-002',
    patientName: 'Mark Thompson',
    appointmentDate: '2024-06-01',
    serviceProvider: 'Dr. Michael Chen',
    amountOverdue: 95.50,
    daysPastDue: 30
  },
  {
    id: 'late-003',
    patientName: 'Lisa Garcia',
    appointmentDate: '2024-06-10',
    serviceProvider: 'Dr. Robert Wilson',
    amountOverdue: 275.00,
    daysPastDue: 25,
    lastContactDate: '2024-07-01'
  }
];

export const mockRemittanceAdvice: RemittanceAdvice[] = [
  {
    id: 'rem-001',
    claimId: 'CLM-2024-001',
    payerName: 'Blue Cross Blue Shield',
    payerInformation: 'Policy: BC123456, Group: GRP789',
    amountPaid: 180.00,
    adjustments: 20.00,
    deniedAmount: 0.00,
    reconciled: false,
    processingDate: '2024-07-10T08:00:00Z'
  },
  {
    id: 'rem-002',
    claimId: 'CLM-2024-002',
    payerName: 'Aetna Health Insurance',
    payerInformation: 'Policy: AET987654, Group: GRP456',
    amountPaid: 250.00,
    adjustments: 15.00,
    deniedAmount: 35.00,
    reconciled: true,
    reconciledDate: '2024-07-08T15:30:00Z',
    processingDate: '2024-07-05T10:15:00Z'
  }
];

export const mockBillingTransactions: BillingTransaction[] = [
  {
    id: 'trans-001',
    patientId: 'P001',
    patientName: 'John Doe',
    totalAmount: 350.00,
    paidAmount: 200.00,
    balance: 150.00,
    claimId: 'CLM-2024-001',
    paymentDate: '2024-06-15',
    serviceType: 'General Consultation',
    serviceDate: '2024-06-01',
    provider: 'Dr. Sarah Johnson',
    status: 'Partial',
    notes: 'Partial payment received, insurance pending',
    insuranceDetails: {
      provider: 'Blue Cross Blue Shield',
      policyNumber: 'BC123456',
      groupNumber: 'GRP789',
      copay: 25.00
    }
  },
  {
    id: 'trans-002',
    patientId: 'P002',
    patientName: 'Jane Smith',
    totalAmount: 125.00,
    paidAmount: 125.00,
    balance: 0.00,
    paymentDate: '2024-06-20',
    serviceType: 'Lab Tests',
    serviceDate: '2024-06-15',
    provider: 'Dr. Michael Chen',
    status: 'Paid'
  },
  {
    id: 'trans-003',
    patientId: 'P003',
    patientName: 'Alice Williams',
    totalAmount: 285.00,
    paidAmount: 0.00,
    balance: 285.00,
    serviceType: 'Specialist Consultation',
    serviceDate: '2024-05-20',
    provider: 'Dr. Robert Wilson',
    status: 'Overdue',
    notes: 'Patient contacted multiple times'
  }
];

// Data Manager Class
export class BillingDataManager {
  private outstandingBalances: OutstandingBalance[] = [...mockOutstandingBalances];
  private paymentPlans: PaymentPlan[] = [...mockPaymentPlans];
  private pendingPayments: PendingPayment[] = [...mockPendingPayments];
  private latePayments: LatePayment[] = [...mockLatePayments];
  private remittanceAdvice: RemittanceAdvice[] = [...mockRemittanceAdvice];
  private billingTransactions: BillingTransaction[] = [...mockBillingTransactions];
  private paymentReceipts: PaymentReceipt[] = [];

  // Outstanding Balances
  getOutstandingBalances(patientId?: string): OutstandingBalance[] {
    if (patientId) {
      return this.outstandingBalances.filter(balance => balance.patientId === patientId);
    }
    return this.outstandingBalances;
  }

  // Payment Plans
  getPaymentPlans(patientId?: string): PaymentPlan[] {
    if (patientId) {
      return this.paymentPlans.filter(plan => plan.patientId === patientId);
    }
    return this.paymentPlans;
  }

  createPaymentPlan(plan: Omit<PaymentPlan, 'id' | 'createdAt'>): PaymentPlan {
    const newPlan: PaymentPlan = {
      ...plan,
      id: `plan-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.paymentPlans.push(newPlan);
    return newPlan;
  }

  updatePaymentPlan(planId: string, updates: Partial<PaymentPlan>): PaymentPlan | null {
    const planIndex = this.paymentPlans.findIndex(plan => plan.id === planId);
    if (planIndex !== -1) {
      this.paymentPlans[planIndex] = { ...this.paymentPlans[planIndex], ...updates };
      return this.paymentPlans[planIndex];
    }
    return null;
  }

  // Pending Payments
  getPendingPayments(): PendingPayment[] {
    return this.pendingPayments.filter(payment => payment.status === 'Pending');
  }

  processPayment(paymentId: string, processedBy: string): PaymentReceipt | null {
    const paymentIndex = this.pendingPayments.findIndex(payment => payment.id === paymentId);
    if (paymentIndex !== -1) {
      const payment = this.pendingPayments[paymentIndex];
      
      // Update payment status
      this.pendingPayments[paymentIndex] = { ...payment, status: 'Completed' };
      
      // Create receipt
      const receipt: PaymentReceipt = {
        id: `receipt-${Date.now()}`,
        patientId: payment.patientId,
        patientName: payment.patientName,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        transactionId: `txn-${Date.now()}`,
        processedAt: new Date().toISOString(),
        processedBy,
        receiptNumber: `RCT-${Date.now()}`
      };
      
      this.paymentReceipts.push(receipt);
      
      // Update billing transaction
      this.updatePatientBalance(payment.patientId, payment.amount);
      
      return receipt;
    }
    return null;
  }

  // Late Payments
  getLatePayments(): LatePayment[] {
    return this.latePayments;
  }

  generateLatePaymentReport(): { summary: string; count: number; data: LatePayment[] } {
    const latePayments = this.getLatePayments();
    const totalOverdue = latePayments.reduce((sum, payment) => sum + payment.amountOverdue, 0);
    
    return {
      summary: latePayments.length > 0 
        ? `${latePayments.length} late payments totaling $${totalOverdue.toFixed(2)}`
        : 'No late payments this week',
      count: latePayments.length,
      data: latePayments
    };
  }

  // Remittance Advice
  getRemittanceAdvice(): RemittanceAdvice[] {
    return this.remittanceAdvice;
  }

  getUnreconciledRemittance(): RemittanceAdvice[] {
    return this.remittanceAdvice.filter(advice => !advice.reconciled);
  }

  reconcileRemittance(remittanceId: string): boolean {
    const adviceIndex = this.remittanceAdvice.findIndex(advice => advice.id === remittanceId);
    if (adviceIndex !== -1) {
      this.remittanceAdvice[adviceIndex] = {
        ...this.remittanceAdvice[adviceIndex],
        reconciled: true,
        reconciledDate: new Date().toISOString()
      };
      return true;
    }
    return false;
  }

  // Billing Transactions
  getBillingTransactions(patientId?: string): BillingTransaction[] {
    if (patientId) {
      return this.billingTransactions.filter(transaction => transaction.patientId === patientId);
    }
    return this.billingTransactions;
  }

  updateBillingTransaction(transactionId: string, updates: Partial<BillingTransaction>): BillingTransaction | null {
    const transactionIndex = this.billingTransactions.findIndex(transaction => transaction.id === transactionId);
    if (transactionIndex !== -1) {
      this.billingTransactions[transactionIndex] = { ...this.billingTransactions[transactionIndex], ...updates };
      return this.billingTransactions[transactionIndex];
    }
    return null;
  }

  // Helper Methods
  private updatePatientBalance(patientId: string, paymentAmount: number): void {
    // Update outstanding balances
    const patientBalances = this.outstandingBalances.filter(balance => balance.patientId === patientId);
    let remainingPayment = paymentAmount;
    
    for (const balance of patientBalances) {
      if (remainingPayment <= 0) break;
      
      if (remainingPayment >= balance.amount) {
        remainingPayment -= balance.amount;
        // Remove this balance (fully paid)
        const balanceIndex = this.outstandingBalances.findIndex(b => b.id === balance.id);
        if (balanceIndex !== -1) {
          this.outstandingBalances.splice(balanceIndex, 1);
        }
      } else {
        // Partial payment
        balance.amount -= remainingPayment;
        remainingPayment = 0;
      }
    }
  }

  formatCurrency(amount: number): string {
    return `$${amount.toFixed(2)}`;
  }

  isOverdue(dueDate: string): boolean {
    return new Date(dueDate) < new Date();
  }

  getDaysPastDue(dueDate: string): number {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today.getTime() - due.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

// Singleton instance
export const billingDataManager = new BillingDataManager();

// Mock Insurance Providers
export const mockInsuranceProviders = [
  'Blue Cross Blue Shield',
  'Aetna Health Insurance',
  'Cigna Healthcare',
  'UnitedHealth Group',
  'Humana Inc.',
  'Kaiser Permanente',
  'Anthem Inc.',
  'Medicare',
  'Medicaid'
];

// Mock Payment Methods
export const paymentMethods = [
  'Credit Card',
  'Debit Card',
  'ACH Transfer',
  'Bank Transfer',
  'Insurance',
  'Cash',
  'Check'
];

// Audit logging
export function logBillingActivity(
  action: string,
  patientId: string,
  userId: string,
  details: any
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    patientId,
    userId,
    details,
    ipAddress: 'Mock IP for security compliance'
  };
  
  console.log('Billing Activity Log:', logEntry);
  // In a real application, this would be sent to a secure logging service
}