// Validation schemas for Epic 3 features
import { z } from 'zod';

// Password policy validation (referenced by multiple features)
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(256, 'Password must not exceed 256 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character');

// Receptionist-Assisted Registration validation
export const receptionistAssistedRegistrationSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .max(128, 'Full name must not exceed 128 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Full name can only contain letters, spaces, hyphens, and apostrophes'),
  
  dateOfBirth: z
    .string()
    .min(1, 'Date of birth is required')
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1 >= 0;
      }
      return age >= 0 && age <= 150;
    }, 'Please enter a valid date of birth'),
  
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(256, 'Email must not exceed 256 characters'),
  
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^[\+]?[1-9][\d]{0,15}$|^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/, 'Please enter a valid phone number'),
  
  insuranceProvider: z
    .string()
    .optional(),
  
  username: z
    .string()
    .min(1, 'Username is required')
    .max(128, 'Username must not exceed 128 characters')
    .regex(/^[a-zA-Z0-9_.-]+$/, 'Username can only contain letters, numbers, underscores, dots, and hyphens'),
  
  password: passwordSchema
});

export type ReceptionistAssistedRegistrationData = z.infer<typeof receptionistAssistedRegistrationSchema>;

// Receptionist Login validation
export const receptionistLoginSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .max(128, 'Username must not exceed 128 characters'),
  
  password: z
    .string()
    .min(1, 'Password is required')
});

export type ReceptionistLoginData = z.infer<typeof receptionistLoginSchema>;

// Service Provider Login validation
export const serviceProviderLoginSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .max(128, 'Username must not exceed 128 characters'),
  
  password: z
    .string()
    .min(1, 'Password is required'),
  
  rememberMe: z.boolean().optional()
});

export type ServiceProviderLoginData = z.infer<typeof serviceProviderLoginSchema>;

// Update Emergency Contact validation
export const updateEmergencyContactSchema = z.object({
  name: z
    .string()
    .min(1, 'Emergency contact name is required')
    .max(128, 'Name must not exceed 128 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  
  relation: z
    .string()
    .min(1, 'Relationship is required'),
  
  phone: z
    .string()
    .min(1, 'Contact phone number is required')
    .regex(/^[\+]?[1-9][\d]{0,15}$|^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/, 'Please enter a valid phone number'),
  
  email: z
    .string()
    .email('Please enter a valid email address')
    .max(256, 'Email must not exceed 256 characters')
    .optional()
    .or(z.literal(''))
});

export type UpdateEmergencyContactData = z.infer<typeof updateEmergencyContactSchema>;

// Account Recovery validation
export const accountRecoverySchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(256, 'Email must not exceed 256 characters'),
  
  phone: z
    .string()
    .regex(/^[\+]?[1-9][\d]{0,15}$|^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal(''))
});

export type AccountRecoveryData = z.infer<typeof accountRecoverySchema>;

// Password reset validation (for account recovery flow)
export const passwordResetSchema = z.object({
  newPassword: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export type PasswordResetData = z.infer<typeof passwordResetSchema>;

// Validation helper functions
export const validateField = <T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; error?: string; data?: T } => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || 'Validation error' };
    }
    return { success: false, error: 'Unknown validation error' };
  }
};

export const getFieldErrors = <T>(schema: z.ZodSchema<T>, data: unknown): Record<string, string> => {
  try {
    schema.parse(data);
    return {};
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.issues.reduce((acc: Record<string, string>, err) => {
        const path = err.path.join('.');
        acc[path] = err.message;
        return acc;
      }, {});
    }
    return {};
  }
};