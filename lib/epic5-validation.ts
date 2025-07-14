// Epic 5 Validation Schemas - Receptionist Management Features
// For Atlantis HMS Webapp

import { z } from 'zod';

// Manage Rejections and Appeals Validation
export const claimAdjustmentSchema = z.object({
  procedureCode: z.string().min(1, "Procedure code is required").max(10, "Procedure code too long"),
  amount: z.number().min(0, "Amount must be positive").max(10000, "Amount too large"),
  notes: z.string().max(500, "Notes must be 500 characters or less")
});

export const appealSubmissionSchema = z.object({
  claimId: z.string().min(1, "Claim ID is required"),
  appealLetter: z.string()
    .min(50, "Appeal letter must be at least 50 characters")
    .max(5000, "Appeal letter must be 5000 characters or less")
});

// Handle Phone Inquiries Validation
export const phoneInquirySchema = z.object({
  callerName: z.string()
    .min(1, "Caller name is required")
    .max(100, "Caller name too long")
    .regex(/^[a-zA-Z\s'-]+$/, "Caller name contains invalid characters"),
  callerPhone: z.string()
    .min(1, "Phone number is required")
    .regex(/^\(?[\d\s\-\(\)\.]+$/, "Invalid phone number format"),
  reason: z.string()
    .min(1, "Reason for call is required")
    .max(500, "Reason too long"),
  patientSearch: z.string().optional(),
  appointmentActions: z.array(z.string()).optional(),
  callNotes: z.string().max(1000, "Call notes too long").optional(),
  transferredTo: z.string().max(100, "Department name too long").optional(),
  transferNotes: z.string().max(500, "Transfer notes too long").optional(),
  followUpMethod: z.enum(['sms', 'email', 'none']).optional()
});

// Manage Appointment Requests Validation
export const appointmentRequestActionSchema = z.object({
  requestId: z.string().min(1, "Request ID is required"),
  action: z.enum(['approve', 'decline']),
  declineReason: z.string().optional(),
  alternativeDate: z.string().optional(),
  alternativeProvider: z.string().optional()
});

// Manage Appointment Calendar Validation
export const calendarAppointmentSchema = z.object({
  patientId: z.string()
    .min(1, "Patient ID is required")
    .max(20, "Patient ID too long"),
  providerId: z.string().min(1, "Provider is required"),
  serviceType: z.string().min(1, "Service type is required"),
  date: z.string()
    .min(1, "Date is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  time: z.string()
    .min(1, "Time is required")
    .regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
  duration: z.number().min(15, "Duration must be at least 15 minutes").max(480, "Duration too long"),
  location: z.string().min(1, "Location is required"),
  notes: z.string().max(500, "Notes too long").optional()
});

export const calendarFilterSchema = z.object({
  provider: z.string().optional(),
  service: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  view: z.enum(['day', 'week', 'month']).default('week')
});

// Add to Waiting List Validation
export const waitlistEntrySchema = z.object({
  patientId: z.string()
    .min(1, "Patient ID is required")
    .max(20, "Patient ID too long")
    .regex(/^[A-Za-z0-9]+$/, "Patient ID can only contain letters and numbers"),
  preferredProvider: z.string().min(1, "Preferred provider is required"),
  preferredService: z.string().min(1, "Preferred service is required"),
  startDate: z.string()
    .min(1, "Start date is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid start date format"),
  endDate: z.string()
    .min(1, "End date is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid end date format"),
  timePreferences: z.array(z.string()).min(1, "At least one time preference is required")
}).refine(data => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return start >= today && end >= start;
}, {
  message: "End date must be after start date and dates cannot be in the past",
  path: ["endDate"]
});

// Check-in Patient Validation
export const patientCheckInSchema = z.object({
  appointmentId: z.string().min(1, "Appointment ID is required"),
  patientId: z.string().min(1, "Patient ID is required"),
  searchQuery: z.string().optional()
});

export const checkInSearchSchema = z.object({
  query: z.string()
    .min(1, "Search query is required")
    .max(100, "Search query too long")
});

// Utility validation functions
export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
};

export const validatePatientId = (patientId: string): boolean => {
  const patientIdRegex = /^P\d{3,6}$/;
  return patientIdRegex.test(patientId);
};

export const validateClaimId = (claimId: string): boolean => {
  const claimIdRegex = /^CLM-\d{4}-\d{3}$/;
  return claimIdRegex.test(claimId);
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

export const formatDateTime = (date: string, time: string): string => {
  try {
    const dateObj = new Date(`${date}T${time}:00`);
    return dateObj.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return `${date} ${time}`;
  }
};

export const validateBusinessHours = (time: string): boolean => {
  const [hours, minutes] = time.split(':').map(Number);
  const timeInMinutes = hours * 60 + minutes;
  const startTime = 8 * 60; // 8:00 AM
  const endTime = 17 * 60; // 5:00 PM
  
  return timeInMinutes >= startTime && timeInMinutes <= endTime;
};

export const validateFutureDate = (date: string): boolean => {
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return inputDate >= today;
};

export const validateDateRange = (startDate: string, endDate: string): boolean => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return start <= end;
};

// Form validation error messages
export const validationMessages = {
  required: (field: string) => `${field} is required`,
  minLength: (field: string, min: number) => `${field} must be at least ${min} characters`,
  maxLength: (field: string, max: number) => `${field} must be no more than ${max} characters`,
  invalidFormat: (field: string) => `${field} has an invalid format`,
  invalidPhone: 'Please enter a valid phone number',
  invalidEmail: 'Please enter a valid email address',
  invalidDate: 'Please enter a valid date',
  pastDate: 'Date cannot be in the past',
  invalidTime: 'Please enter a valid time',
  outsideBusinessHours: 'Time must be during business hours (8:00 AM - 5:00 PM)',
  endBeforeStart: 'End date must be after start date'
};

// Type exports for form validation
export type ClaimAdjustmentData = z.infer<typeof claimAdjustmentSchema>;
export type AppealSubmissionData = z.infer<typeof appealSubmissionSchema>;
export type PhoneInquiryData = z.infer<typeof phoneInquirySchema>;
export type AppointmentRequestActionData = z.infer<typeof appointmentRequestActionSchema>;
export type CalendarAppointmentData = z.infer<typeof calendarAppointmentSchema>;
export type CalendarFilterData = z.infer<typeof calendarFilterSchema>;
export type WaitlistEntryData = z.infer<typeof waitlistEntrySchema>;
export type PatientCheckInData = z.infer<typeof patientCheckInSchema>;
export type CheckInSearchData = z.infer<typeof checkInSearchSchema>;