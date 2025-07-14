// Epic 4 Validation Schemas
// Zod validation schemas for all appointment management forms

import * as z from "zod";

// Schedule Appointment validation
export const scheduleAppointmentSchema = z.object({
  serviceType: z.string().min(1, "Please select a service type"),
  providerId: z.string().min(1, "Please select a provider"),
  date: z.string().min(1, "Please select a date"),
  time: z.string().min(1, "Please select a time"),
  comments: z.string().max(512, "Comments must be 512 characters or less").optional()
});

export type ScheduleAppointmentData = z.infer<typeof scheduleAppointmentSchema>;

// Search for Services validation
export const searchServicesSchema = z.object({
  serviceType: z.string().optional(),
  providerName: z.string().optional(),
  specialty: z.string().optional()
}).refine(
  (data) => data.serviceType || data.providerName || data.specialty,
  {
    message: "Please enter at least one search criteria",
    path: ["serviceType"]
  }
);

export type SearchServicesData = z.infer<typeof searchServicesSchema>;

// Waitlist Management validation
export const waitlistSchema = z.object({
  providerId: z.string().min(1, "Please select a provider"),
  serviceType: z.string().min(1, "Please select a service type"),
  preferredDateStart: z.string().min(1, "Please select a start date"),
  preferredDateEnd: z.string().min(1, "Please select an end date"),
  preferredTimes: z.array(z.string()).min(1, "Please select at least one preferred time")
}).refine(
  (data) => new Date(data.preferredDateStart) <= new Date(data.preferredDateEnd),
  {
    message: "End date must be after start date",
    path: ["preferredDateEnd"]
  }
).refine(
  (data) => new Date(data.preferredDateStart) >= new Date(),
  {
    message: "Start date must be in the future",
    path: ["preferredDateStart"]
  }
);

export type WaitlistData = z.infer<typeof waitlistSchema>;

// Appointment History filters validation
export const appointmentHistoryFiltersSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  providerId: z.string().optional()
}).refine(
  (data) => {
    if (data.dateFrom && data.dateTo) {
      return new Date(data.dateFrom) <= new Date(data.dateTo);
    }
    return true;
  },
  {
    message: "End date must be after start date",
    path: ["dateTo"]
  }
);

export type AppointmentHistoryFiltersData = z.infer<typeof appointmentHistoryFiltersSchema>;

// Reminder Settings validation
export const reminderSettingsSchema = z.object({
  method: z.enum(['sms', 'email', 'both'], {
    errorMap: () => ({ message: "Please select a reminder method" })
  }),
  intervals: z.array(z.string()).min(1, "Please select at least one reminder interval"),
  enabled: z.boolean().default(true)
});

export type ReminderSettingsData = z.infer<typeof reminderSettingsSchema>;

// Validation helper functions
export const validateAppointmentSlot = (providerId: string, date: string, time: string) => {
  const today = new Date();
  const appointmentDate = new Date(date);
  
  // Check if date is in the future
  if (appointmentDate < today) {
    return { isValid: false, error: "Appointment date must be in the future" };
  }
  
  // Check if date is not too far in the future (6 months)
  const sixMonthsFromNow = new Date();
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
  
  if (appointmentDate > sixMonthsFromNow) {
    return { isValid: false, error: "Appointment date must be within 6 months" };
  }
  
  // Check if time format is valid (HH:MM)
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(time)) {
    return { isValid: false, error: "Invalid time format" };
  }
  
  return { isValid: true };
};

export const validateReminderInterval = (interval: string) => {
  const validIntervals = ['15m', '30m', '1h', '2h', '4h', '24h', '48h', '1w'];
  return validIntervals.includes(interval);
};

export const validateComments = (comments: string) => {
  if (!comments) return { isValid: true };
  
  if (comments.length > 512) {
    return { isValid: false, error: "Comments must be 512 characters or less" };
  }
  
  // Check for potentially harmful content
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(comments)) {
      return { isValid: false, error: "Invalid characters in comments" };
    }
  }
  
  return { isValid: true };
};

// Form submission helpers
export const sanitizeSearchInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 100); // Limit length
};

export const formatTimeForDisplay = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minutes} ${ampm}`;
};

export const formatDateForDisplay = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Error handling helpers
export const getFieldError = (
  errors: Record<string, unknown>,
  fieldName: string
): string | undefined => {
  const error = errors[fieldName] as { message?: string; _errors?: string[] } | undefined;
  return error?.message || error?._errors?.[0];
};

export const hasFieldError = (
  errors: Record<string, unknown>,
  fieldName: string
): boolean => {
  return !!getFieldError(errors, fieldName);
};

// Constants for form options
export const REMINDER_INTERVALS = [
  { value: '15m', label: '15 minutes before' },
  { value: '30m', label: '30 minutes before' },
  { value: '1h', label: '1 hour before' },
  { value: '2h', label: '2 hours before' },
  { value: '4h', label: '4 hours before' },
  { value: '24h', label: '1 day before' },
  { value: '48h', label: '2 days before' },
  { value: '1w', label: '1 week before' }
];

export const REMINDER_METHODS = [
  { value: 'email', label: 'Email only' },
  { value: 'sms', label: 'SMS only' },
  { value: 'both', label: 'Both Email and SMS' }
];

export const PREFERRED_TIMES = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00'
];

export const APPOINTMENT_STATUSES = [
  { value: 'confirmed', label: 'Confirmed', color: 'green' },
  { value: 'pending', label: 'Pending Approval', color: 'yellow' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
  { value: 'completed', label: 'Completed', color: 'blue' }
];