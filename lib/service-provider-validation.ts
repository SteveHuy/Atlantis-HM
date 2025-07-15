// Service Provider Validation Schemas
// Zod-based validation for service provider features

import { z } from 'zod';

// View Provider Schedules Validation
export const viewProviderSchedulesSchema = z.object({
  providerId: z.string().min(1, 'Provider selection is required'),
  startDate: z.string().refine(date => {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  }, 'Date range must be in the future'),
  endDate: z.string().refine(date => {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  }, 'End date must be in the future'),
  availabilityFilter: z.enum(['all', 'available', 'booked', 'blocked']).default('all')
}).refine(data => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end >= start;
}, {
  message: 'End date must be after or equal to start date',
  path: ['endDate']
});

// Update Provider Schedules Validation
export const updateProviderSchedulesSchema = z.object({
  providerId: z.string().min(1, 'Provider selection is required'),
  scheduleUpdates: z.array(z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    timeSlots: z.array(z.object({
      id: z.string().optional(),
      startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
      endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
      status: z.enum(['available', 'booked', 'blocked']),
      notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional()
    })).refine(slots => {
      // Check for overlapping time slots
      const sortedSlots = slots.sort((a, b) => a.startTime.localeCompare(b.startTime));
      for (let i = 0; i < sortedSlots.length - 1; i++) {
        if (sortedSlots[i].endTime > sortedSlots[i + 1].startTime) {
          return false;
        }
      }
      return true;
    }, 'Time slots cannot overlap')
  })),
  reason: z.string().max(1000, 'Reason cannot exceed 1000 characters').optional()
});

// Provider Secure Communication Validation
export const providerSecureCommunicationSchema = z.object({
  recipientId: z.string().min(1, 'Recipient selection is required'),
  recipientType: z.enum(['provider', 'patient', 'receptionist']),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject cannot exceed 200 characters'),
  content: z.string().min(1, 'Message cannot be empty').max(5000, 'Message cannot exceed 5000 characters'),
  attachments: z.array(z.object({
    filename: z.string().min(1, 'Filename is required'),
    size: z.number().max(10 * 1024 * 1024, 'File size cannot exceed 10MB'),
    type: z.string().min(1, 'File type is required')
  })).max(5, 'Cannot attach more than 5 files').default([]),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal')
});

// Manage Prescription Refills Validation
export const managePrescriptionRefillsSchema = z.object({
  refillId: z.string().min(1, 'Refill ID is required'),
  action: z.enum(['approve', 'deny']),
  pharmacyId: z.string().optional(),
  denialReason: z.string().max(1000, 'Denial reason cannot exceed 1000 characters').optional(),
  prescriptionAdjustments: z.object({
    dosage: z.string().optional(),
    frequency: z.string().optional(),
    quantity: z.number().positive('Quantity must be positive').optional(),
    refillsRemaining: z.number().min(0, 'Refills remaining cannot be negative').optional()
  }).optional()
}).refine(data => {
  if (data.action === 'deny' && !data.denialReason) {
    return false;
  }
  return true;
}, {
  message: 'Denial reason is required when denying a refill',
  path: ['denialReason']
});

// Medication Order Validation
export const medicationOrderSchema = z.object({
  patientId: z.string().min(1, 'Patient selection is required'),
  drugName: z.string().min(1, 'Drug name is required').max(200, 'Drug name cannot exceed 200 characters'),
  dosage: z.string().min(1, 'Dosage is required'),
  duration: z.string().min(1, 'Duration is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  route: z.string().min(1, 'Route is required'),
  pharmacyId: z.string().optional(),
  specialInstructions: z.string().max(1000, 'Special instructions cannot exceed 1000 characters').optional(),
  quantity: z.number().positive('Quantity must be positive'),
  refills: z.number().min(0, 'Refills cannot be negative').max(11, 'Cannot exceed 11 refills')
});

// View Patient EHR Validation
export const viewPatientEHRSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  searchQuery: z.string().optional(),
  exportFormat: z.enum(['pdf', 'json', 'csv']).optional(),
  accessReason: z.string().min(1, 'Access reason is required for HIPAA compliance').max(500, 'Access reason cannot exceed 500 characters')
});

// Access Appointment Schedules Validation
export const accessAppointmentSchedulesSchema = z.object({
  startDate: z.string().refine(date => {
    const selectedDate = new Date(date);
    return !isNaN(selectedDate.getTime());
  }, 'Invalid start date'),
  endDate: z.string().refine(date => {
    const selectedDate = new Date(date);
    return !isNaN(selectedDate.getTime());
  }, 'Invalid end date'),
  providerId: z.string().optional(),
  locationId: z.string().optional(),
  viewType: z.enum(['day', 'week', 'month']).default('week'),
  filterType: z.enum(['all', 'personal', 'patient-specific']).default('all'),
  patientId: z.string().optional()
}).refine(data => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end >= start;
}, {
  message: 'End date must be after or equal to start date',
  path: ['endDate']
});

// Compliance Data Security Validation
export const complianceDataSecuritySchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  accessType: z.enum(['view', 'edit', 'delete', 'export']),
  resourceType: z.enum(['patient_record', 'appointment', 'prescription', 'message', 'lab_result']),
  resourceId: z.string().min(1, 'Resource ID is required'),
  justification: z.string().min(1, 'Access justification is required for audit trail').max(500, 'Justification cannot exceed 500 characters'),
  sessionId: z.string().min(1, 'Session ID is required'),
  ipAddress: z.string().min(1, 'IP address is required'),
  userAgent: z.string().min(1, 'User agent is required')
});

// Service Provider Dashboard Search Validation
export const serviceProviderDashboardSearchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(100, 'Search query cannot exceed 100 characters'),
  category: z.enum(['all', 'patients', 'appointments', 'messages', 'lab_results', 'prescriptions']).default('all'),
  sortBy: z.enum(['relevance', 'date', 'name', 'status']).default('relevance'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  limit: z.number().min(1).max(100).default(10),
  offset: z.number().min(0).default(0)
});

// Password Policy Validation
export const passwordPolicySchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .max(128, 'Password cannot exceed 128 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')
});

// Session Timeout Validation
export const sessionTimeoutSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  lastActivity: z.string().refine(date => {
    const activityDate = new Date(date);
    return !isNaN(activityDate.getTime());
  }, 'Invalid last activity date'),
  timeoutMinutes: z.number().min(1).max(480).default(30) // 1 minute to 8 hours
});

// Multi-Factor Authentication Validation
export const mfaValidationSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  method: z.enum(['sms', 'email', 'totp', 'backup_code']),
  code: z.string().length(6, 'Verification code must be 6 digits').regex(/^\d{6}$/, 'Verification code must contain only digits'),
  sessionId: z.string().min(1, 'Session ID is required')
});

// Audit Trail Query Validation
export const auditTrailQuerySchema = z.object({
  userId: z.string().optional(),
  action: z.string().optional(),
  resourceType: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  limit: z.number().min(1).max(1000).default(100),
  offset: z.number().min(0).default(0),
  sortBy: z.enum(['timestamp', 'action', 'severity', 'userId']).default('timestamp'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Type exports for TypeScript
export type ViewProviderSchedulesInput = z.infer<typeof viewProviderSchedulesSchema>;
export type UpdateProviderSchedulesInput = z.infer<typeof updateProviderSchedulesSchema>;
export type ProviderSecureCommunicationInput = z.infer<typeof providerSecureCommunicationSchema>;
export type ManagePrescriptionRefillsInput = z.infer<typeof managePrescriptionRefillsSchema>;
export type MedicationOrderInput = z.infer<typeof medicationOrderSchema>;
export type ViewPatientEHRInput = z.infer<typeof viewPatientEHRSchema>;
export type AccessAppointmentSchedulesInput = z.infer<typeof accessAppointmentSchedulesSchema>;
export type ComplianceDataSecurityInput = z.infer<typeof complianceDataSecuritySchema>;
export type ServiceProviderDashboardSearchInput = z.infer<typeof serviceProviderDashboardSearchSchema>;
export type PasswordPolicyInput = z.infer<typeof passwordPolicySchema>;
export type SessionTimeoutInput = z.infer<typeof sessionTimeoutSchema>;
export type MfaValidationInput = z.infer<typeof mfaValidationSchema>;
export type AuditTrailQueryInput = z.infer<typeof auditTrailQuerySchema>;

// Validation helper functions
export const validateScheduleTimeSlot = (startTime: string, endTime: string): boolean => {
  const start = new Date(`2000-01-01T${startTime}:00`);
  const end = new Date(`2000-01-01T${endTime}:00`);
  return end > start;
};

export const validateBusinessHours = (time: string): boolean => {
  const hour = parseInt(time.split(':')[0]);
  return hour >= 6 && hour <= 22; // Business hours: 6 AM to 10 PM
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[\r\n]/g, ' ').replace(/\s+/g, ' ');
};

export const validateFileUpload = (file: File): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (file.size > maxSize) {
    errors.push('File size cannot exceed 10MB');
  }

  if (!allowedTypes.includes(file.type)) {
    errors.push('File type not allowed. Please upload PDF, image, or document files only.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const generateSecureToken = (): string => {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

export const hashPassword = async (password: string): Promise<string> => {
  // In a real implementation, use bcrypt or similar
  // This is a mock implementation for demonstration
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'atlantis_salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  const computedHash = await hashPassword(password);
  return computedHash === hash;
};