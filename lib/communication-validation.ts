// Communication Validation Schemas
// Provides Zod validation for all communication features

import { z } from 'zod';

// Secure Messaging (Patient) Validation
export const secureMessageSchema = z.object({
  recipientId: z.string().min(1, 'Recipient is required'),
  subject: z.string().max(128, 'Subject must be 128 characters or less').optional(),
  content: z.string()
    .min(1, 'Message content is required')
    .max(1024, 'Message content must be 1024 characters or less'),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  attachments: z.array(z.object({
    fileName: z.string(),
    fileSize: z.number().max(5 * 1024 * 1024, 'File size must be 5MB or less'),
    fileType: z.string()
  })).optional()
});

// Secure Messaging with Patients (Provider) Validation
export const providerMessageSchema = z.object({
  patientId: z.string().min(1, 'Patient selection is required'),
  content: z.string()
    .min(1, 'Content cannot be empty')
    .max(1024, 'Message content must be 1024 characters or less'),
  attachments: z.array(z.object({
    fileName: z.string(),
    fileSize: z.number().max(5 * 1024 * 1024, 'File size must be 5MB or less'),
    fileType: z.string()
  })).optional()
});

// Log Patient Communications (Receptionist) Validation
export const communicationLogSchema = z.object({
  patientId: z.string()
    .min(1, 'Patient ID is required')
    .regex(/^patient-\d+$/, 'Invalid Patient ID format'),
  communicationType: z.enum(['phone', 'email', 'in-person', 'secure-message', 'other']),
  details: z.string()
    .min(1, 'Communication details are required')
    .max(2048, 'Details must be 2048 characters or less'),
  timestamp: z.date().optional() // Auto-generated if not provided
});

// Secure Communication (Receptionist) Validation
export const receptionistMessageSchema = z.object({
  recipientId: z.string().min(1, 'Recipient is required'),
  recipientType: z.enum(['provider', 'staff']),
  content: z.string()
    .min(1, 'Message content cannot be empty')
    .max(4096, 'Message content must be 4096 characters or less'),
  priority: z.enum(['low', 'medium', 'high']).optional()
});

// File upload validation
export const fileUploadSchema = z.object({
  file: z.custom<File>((file) => {
    if (!(file instanceof File)) return false;
    
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    return file.size <= maxSize && allowedTypes.includes(file.type);
  }, {
    message: 'File must be under 5MB and be a valid type (images, PDF, Word, or text)'
  })
});

// Message search/filter validation
export const messageFilterSchema = z.object({
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  sender: z.string().optional(),
  recipient: z.string().optional(),
  isRead: z.boolean().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional()
});

// Communication log filter validation
export const logFilterSchema = z.object({
  patientId: z.string().optional(),
  communicationType: z.enum(['phone', 'email', 'in-person', 'secure-message', 'other']).optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  receptionistId: z.string().optional()
});

// Utility validation functions
export const validatePatientId = (patientId: string): boolean => {
  return /^patient-\d+$/.test(patientId);
};

export const validateFileSize = (file: File): boolean => {
  return file.size <= 5 * 1024 * 1024; // 5MB
};

export const validateFileType = (file: File): boolean => {
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];
  return allowedTypes.includes(file.type);
};

export const sanitizeInput = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/[<>]/g, '') // Remove < and > characters
    .trim();
};

export const formatMessageContent = (content: string): string => {
  return sanitizeInput(content)
    .replace(/\n{3,}/g, '\n\n') // Limit consecutive line breaks
    .slice(0, 4096); // Ensure max length
};

export const validateHIPAACompliance = (userRole: string, action: string): boolean => {
  // Mock HIPAA compliance validation
  const allowedRoles = ['patient', 'provider', 'receptionist', 'admin'];
  const allowedActions = ['send_message', 'view_message', 'log_communication'];
  
  return allowedRoles.includes(userRole) && allowedActions.includes(action);
};

// Type definitions for form data
export type SecureMessageFormData = z.infer<typeof secureMessageSchema>;
export type ProviderMessageFormData = z.infer<typeof providerMessageSchema>;
export type CommunicationLogFormData = z.infer<typeof communicationLogSchema>;
export type ReceptionistMessageFormData = z.infer<typeof receptionistMessageSchema>;
export type MessageFilterData = z.infer<typeof messageFilterSchema>;
export type LogFilterData = z.infer<typeof logFilterSchema>;