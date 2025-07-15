// Billing and Payment Validation Schemas
// This file provides Zod-based validation for all billing and payment forms

import { z } from 'zod';

// Make Payment Validation
export const makePaymentSchema = z.object({
  selectedBalances: z.array(z.string()).min(1, 'Please select at least one balance to pay'),
  paymentMethod: z.enum(['Credit Card', 'ACH Transfer'], {
    required_error: 'Please select a payment method'
  }),
  // Credit Card Fields
  cardNumber: z.string().optional().refine((val) => {
    if (!val) return true; // Optional validation will be handled by payment method check
    const cleaned = val.replace(/\s/g, '');
    return /^\d{13,19}$/.test(cleaned);
  }, 'Please enter a valid card number (13-19 digits)'),
  expiryDate: z.string().optional().refine((val) => {
    if (!val) return true;
    const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!regex.test(val)) return false;
    
    const [month, year] = val.split('/');
    const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
    const today = new Date();
    today.setDate(1); // Set to first of month for comparison
    
    return expiry >= today;
  }, 'Please enter a valid expiry date (MM/YY) in the future'),
  cvv: z.string().optional().refine((val) => {
    if (!val) return true;
    return /^\d{3,4}$/.test(val);
  }, 'CVV must be 3 or 4 digits'),
  nameOnCard: z.string().optional().min(1, 'Name on card is required').max(100, 'Name is too long'),
  // ACH Fields
  bankAccount: z.string().optional(),
  routingNumber: z.string().optional(),
  accountType: z.enum(['Checking', 'Savings']).optional()
}).refine((data) => {
  // Conditional validation based on payment method
  if (data.paymentMethod === 'Credit Card') {
    return data.cardNumber && data.expiryDate && data.cvv && data.nameOnCard;
  }
  if (data.paymentMethod === 'ACH Transfer') {
    return data.bankAccount && data.routingNumber && data.accountType;
  }
  return true;
}, {
  message: 'Please fill in all required fields for the selected payment method',
  path: ['paymentMethod']
});

// Payment Plan Validation
export const paymentPlanSchema = z.object({
  totalAmount: z.number().min(0.01, 'Total amount must be greater than 0'),
  paymentInterval: z.enum(['Weekly', 'Monthly'], {
    required_error: 'Please select a payment interval'
  }),
  paymentMethod: z.enum(['Credit Card', 'Bank Transfer'], {
    required_error: 'Please select a payment method'
  }),
  paymentAmount: z.number().min(0.01, 'Payment amount must be greater than 0'),
  startDate: z.string().min(1, 'Start date is required')
});

// Process Payment Validation
export const processPaymentSchema = z.object({
  paymentId: z.string().min(1, 'Payment ID is required'),
  paymentMethod: z.enum(['Credit Card', 'Debit Card', 'Insurance', 'Cash'], {
    required_error: 'Payment method is required'
  }),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  confirmationCode: z.string().optional(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional()
});

// Remittance Reconciliation Validation
export const remittanceReconciliationSchema = z.object({
  remittanceId: z.string().min(1, 'Remittance ID is required'),
  claimId: z.string().min(1, 'Claim ID is required'),
  amountReceived: z.number().min(0, 'Amount received cannot be negative'),
  adjustments: z.number().optional(),
  notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional()
});

// Billing Info Update Validation
export const billingUpdateSchema = z.object({
  transactionId: z.string().min(1, 'Transaction ID is required'),
  adjustmentAmount: z.number().optional(),
  adjustmentReason: z.string().max(500, 'Adjustment reason cannot exceed 500 characters').optional(),
  notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional(),
  updateType: z.enum(['balance_adjustment', 'payment_correction', 'billing_correction'], {
    required_error: 'Update type is required'
  })
});

// Search/Filter Validation
export const billingSearchSchema = z.object({
  patientId: z.string().optional(),
  patientName: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  serviceType: z.string().optional(),
  provider: z.string().optional(),
  status: z.enum(['Paid', 'Partial', 'Outstanding', 'Overdue']).optional(),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional()
}).refine((data) => {
  if (data.dateFrom && data.dateTo) {
    return new Date(data.dateFrom) <= new Date(data.dateTo);
  }
  return true;
}, {
  message: 'Date from must be earlier than or equal to date to',
  path: ['dateTo']
}).refine((data) => {
  if (data.minAmount && data.maxAmount) {
    return data.minAmount <= data.maxAmount;
  }
  return true;
}, {
  message: 'Minimum amount must be less than or equal to maximum amount',
  path: ['maxAmount']
});

// Type exports for TypeScript
export type MakePaymentFormData = z.infer<typeof makePaymentSchema>;
export type PaymentPlanFormData = z.infer<typeof paymentPlanSchema>;
export type ProcessPaymentFormData = z.infer<typeof processPaymentSchema>;
export type RemittanceReconciliationFormData = z.infer<typeof remittanceReconciliationSchema>;
export type BillingUpdateFormData = z.infer<typeof billingUpdateSchema>;
export type BillingSearchFormData = z.infer<typeof billingSearchSchema>;

// Helper Functions
export function validateCreditCard(cardNumber: string): {
  isValid: boolean;
  cardType: string;
  error?: string;
} {
  const cleaned = cardNumber.replace(/\s/g, '');
  
  if (!/^\d+$/.test(cleaned)) {
    return { isValid: false, cardType: 'Unknown', error: 'Card number must contain only digits' };
  }
  
  if (cleaned.length < 13 || cleaned.length > 19) {
    return { isValid: false, cardType: 'Unknown', error: 'Card number must be 13-19 digits' };
  }
  
  // Luhn algorithm validation
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  const isValid = sum % 10 === 0;
  
  // Determine card type
  let cardType = 'Unknown';
  if (cleaned.startsWith('4')) cardType = 'Visa';
  else if (cleaned.startsWith('5') || cleaned.startsWith('2')) cardType = 'Mastercard';
  else if (cleaned.startsWith('3')) cardType = 'American Express';
  else if (cleaned.startsWith('6')) cardType = 'Discover';
  
  return { isValid, cardType, error: isValid ? undefined : 'Invalid card number' };
}

export function validateRoutingNumber(routingNumber: string): boolean {
  if (!/^\d{9}$/.test(routingNumber)) return false;
  
  // ABA routing number checksum validation
  const digits = routingNumber.split('').map(Number);
  const checksum = (3 * (digits[0] + digits[3] + digits[6]) +
                   7 * (digits[1] + digits[4] + digits[7]) +
                   1 * (digits[2] + digits[5] + digits[8])) % 10;
  
  return checksum === 0;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

export function formatCardNumber(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s/g, '');
  const groups = cleaned.match(/.{1,4}/g) || [];
  return groups.join(' ');
}

export function maskCardNumber(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s/g, '');
  if (cleaned.length < 4) return '*'.repeat(cleaned.length);
  return '*'.repeat(cleaned.length - 4) + cleaned.slice(-4);
}

export function isValidPaymentAmount(amount: number, maxAmount?: number): boolean {
  if (amount <= 0) return false;
  if (maxAmount && amount > maxAmount) return false;
  return true;
}

export function calculatePaymentSchedule(
  totalAmount: number,
  paymentAmount: number,
  interval: 'Weekly' | 'Monthly',
  startDate: Date
): { paymentDate: Date; amount: number }[] {
  const schedule: { paymentDate: Date; amount: number }[] = [];
  let remainingAmount = totalAmount;
  let currentDate = new Date(startDate);
  
  while (remainingAmount > 0) {
    const payment = Math.min(paymentAmount, remainingAmount);
    schedule.push({
      paymentDate: new Date(currentDate),
      amount: payment
    });
    
    remainingAmount -= payment;
    
    // Calculate next payment date
    if (interval === 'Weekly') {
      currentDate.setDate(currentDate.getDate() + 7);
    } else {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
  }
  
  return schedule;
}

// Security validation helpers
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>\"'&]/g, '');
}

export function validateSecureInput(input: string): boolean {
  // Check for common injection patterns
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /eval\(/i,
    /expression\(/i
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(input));
}