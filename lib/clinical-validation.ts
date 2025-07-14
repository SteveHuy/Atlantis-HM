// Clinical features validation schemas
import { z } from 'zod';

// View Medical Records validation
export const medicalRecordsFilterSchema = z.object({
  section: z.enum(['lab_results', 'visit_summaries', 'medications', 'immunizations']).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  provider: z.string().optional(),
});

export type MedicalRecordsFilter = z.infer<typeof medicalRecordsFilterSchema>;

// Access Patient EHR validation
export const patientEhrSearchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(100, 'Search query too long'),
  searchType: z.enum(['name', 'id']).default('name'),
});

export type PatientEhrSearch = z.infer<typeof patientEhrSearchSchema>;

// Document Patient Encounter validation
export const documentEncounterSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  reasonForVisit: z.string().min(1, 'Reason for visit is required').max(500, 'Reason too long'),
  vitals: z.object({
    height: z.string().optional(),
    weight: z.string().optional(),
    bloodPressure: z.string().optional(),
    heartRate: z.string().optional(),
    temperature: z.string().optional(),
    respiratoryRate: z.string().optional(),
    oxygenSaturation: z.string().optional(),
  }),
  diagnoses: z.array(z.string()).min(1, 'At least one diagnosis is required'),
  treatmentPlan: z.string().min(1, 'Treatment plan is required').max(2000, 'Treatment plan too long'),
  notes: z.string().max(2000, 'Notes too long').optional(),
  attachments: z.array(z.string()).optional(),
});

export type DocumentEncounter = z.infer<typeof documentEncounterSchema>;

// Order Lab Tests validation
export const orderLabTestSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  testName: z.string().min(1, 'Test name is required').max(200, 'Test name too long'),
  testCode: z.string().optional(),
  priority: z.enum(['routine', 'urgent', 'stat']).default('routine'),
  notes: z.string().max(500, 'Notes too long').optional(),
  orderingProvider: z.string().min(1, 'Ordering provider is required'),
});

export type OrderLabTest = z.infer<typeof orderLabTestSchema>;

// Review Lab Results validation
export const reviewLabResultSchema = z.object({
  resultId: z.string().min(1, 'Result ID is required'),
  notes: z.string().max(1000, 'Notes too long').optional(),
  reviewerId: z.string().min(1, 'Reviewer ID is required'),
  followUpRequired: z.boolean().default(false),
  followUpInstructions: z.string().max(500, 'Follow-up instructions too long').optional(),
});

export type ReviewLabResult = z.infer<typeof reviewLabResultSchema>;

export const labResultsFilterSchema = z.object({
  patientId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  status: z.enum(['pending', 'completed', 'abnormal', 'critical']).optional(),
  provider: z.string().optional(),
});

export type LabResultsFilter = z.infer<typeof labResultsFilterSchema>;

// Generate Referrals validation
export const generateReferralSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  specialtyType: z.string().min(1, 'Specialty type is required').max(100, 'Specialty type too long'),
  referralReason: z.string().min(1, 'Referral reason is required').max(512, 'Referral reason must be 512 characters or less'),
  urgency: z.enum(['routine', 'urgent', 'stat']).default('routine'),
  preferredProvider: z.string().optional(),
  notes: z.string().max(1000, 'Notes too long').optional(),
  referringProvider: z.string().min(1, 'Referring provider is required'),
});

export type GenerateReferral = z.infer<typeof generateReferralSchema>;

// Update Allergy Info validation
export const updateAllergySchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  allergen: z.string().min(1, 'Allergen is required').max(256, 'Allergy details must be 256 characters or less'),
  allergenType: z.enum(['medication', 'food', 'environmental', 'other']).default('other'),
  severity: z.enum(['low', 'medium', 'high']).default('medium'),
  reaction: z.string().min(1, 'Reaction is required').max(500, 'Reaction description too long'),
  notes: z.string().max(512, 'Notes must be 512 characters or less').optional(),
  onsetDate: z.string().optional(),
  providerId: z.string().min(1, 'Provider ID is required'),
});

export type UpdateAllergy = z.infer<typeof updateAllergySchema>;

// Track Immunizations validation
export const trackImmunizationSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  vaccineName: z.string().min(1, 'Vaccine name is required').max(128, 'Vaccine name must be 128 characters or less'),
  vaccineCode: z.string().optional(),
  administrationDate: z.string().min(1, 'Administration date is required'),
  lotNumber: z.string().max(128, 'Lot number must be 128 characters or less').optional(),
  manufacturer: z.string().min(1, 'Manufacturer is required').max(100, 'Manufacturer name too long'),
  dosage: z.string().min(1, 'Dosage is required').max(50, 'Dosage too long'),
  route: z.string().min(1, 'Route is required').max(50, 'Route too long'),
  site: z.string().min(1, 'Site is required').max(50, 'Site too long'),
  providerId: z.string().min(1, 'Provider ID is required'),
  notes: z.string().max(256, 'Notes must be 256 characters or less').optional(),
  nextDueDate: z.string().optional(),
  series: z.string().optional(),
});

export type TrackImmunization = z.infer<typeof trackImmunizationSchema>;

// Update Encounter Notes validation
export const updateEncounterNotesSchema = z.object({
  encounterId: z.string().min(1, 'Encounter ID is required'),
  notes: z.string().max(2000, 'Notes too long').optional(),
  treatmentPlan: z.string().max(2000, 'Treatment plan too long').optional(),
  diagnoses: z.array(z.string()).optional(),
  providerId: z.string().min(1, 'Provider ID is required'),
});

export type UpdateEncounterNotes = z.infer<typeof updateEncounterNotesSchema>;

// Common validation utilities
export const validatePatientId = (id: string): boolean => {
  return /^P\d{3,}$/.test(id);
};

export const validateProviderId = (id: string): boolean => {
  return /^PR\d{3,}$/.test(id);
};

export const validateDate = (date: string): boolean => {
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime()) && parsedDate <= new Date();
};

export const validateFutureDate = (date: string): boolean => {
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime()) && parsedDate > new Date();
};

export const sanitizeHtmlInput = (input: string): string => {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

export const validateVitalSigns = (vitals: any): string[] => {
  const errors: string[] = [];
  
  if (vitals.bloodPressure && !/^\d{2,3}\/\d{2,3}$/.test(vitals.bloodPressure)) {
    errors.push('Blood pressure must be in format XXX/XXX');
  }
  
  if (vitals.heartRate && (parseInt(vitals.heartRate) < 30 || parseInt(vitals.heartRate) > 200)) {
    errors.push('Heart rate must be between 30 and 200 bpm');
  }
  
  if (vitals.temperature) {
    const temp = parseFloat(vitals.temperature);
    if (temp < 35.0 || temp > 42.0) {
      errors.push('Temperature must be between 35.0°C and 42.0°C');
    }
  }
  
  if (vitals.respiratoryRate && (parseInt(vitals.respiratoryRate) < 8 || parseInt(vitals.respiratoryRate) > 40)) {
    errors.push('Respiratory rate must be between 8 and 40 breaths per minute');
  }
  
  if (vitals.oxygenSaturation) {
    const o2 = parseInt(vitals.oxygenSaturation);
    if (o2 < 70 || o2 > 100) {
      errors.push('Oxygen saturation must be between 70% and 100%');
    }
  }
  
  return errors;
};

export const checkDrugAllergies = (allergies: string[], medications: string[]): string[] => {
  const interactions: string[] = [];
  
  // Simple mock allergy checking
  const allergyMap: { [key: string]: string[] } = {
    'penicillin': ['amoxicillin', 'ampicillin', 'penicillin'],
    'sulfa': ['sulfamethoxazole', 'sulfasalazine'],
    'aspirin': ['aspirin', 'salicylate'],
    'codeine': ['codeine', 'morphine', 'oxycodone'],
  };
  
  allergies.forEach(allergy => {
    const allergyLower = allergy.toLowerCase();
    const relatedMeds = allergyMap[allergyLower] || [];
    
    medications.forEach(med => {
      const medLower = med.toLowerCase();
      if (relatedMeds.some(relatedMed => medLower.includes(relatedMed))) {
        interactions.push(`Potential allergy interaction: ${allergy} allergy with ${med}`);
      }
    });
  });
  
  return interactions;
};

export const formatLabValue = (value: string, unit: string): string => {
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return value;
  
  return `${numValue.toFixed(1)} ${unit}`;
};

export const isAbnormalLabValue = (value: string, referenceRange: string): boolean => {
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return false;
  
  const rangeMatch = referenceRange.match(/(\d+\.?\d*)-(\d+\.?\d*)/);
  if (!rangeMatch) return false;
  
  const [, minStr, maxStr] = rangeMatch;
  const min = parseFloat(minStr);
  const max = parseFloat(maxStr);
  
  return numValue < min || numValue > max;
};

export const isCriticalLabValue = (value: string, testName: string): boolean => {
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return false;
  
  // Mock critical values for common tests
  const criticalValues: { [key: string]: { min?: number; max?: number } } = {
    'glucose': { min: 40, max: 400 },
    'potassium': { min: 2.5, max: 6.5 },
    'sodium': { min: 120, max: 160 },
    'creatinine': { max: 5.0 },
    'hemoglobin': { min: 7.0, max: 20.0 },
    'white blood cell count': { min: 1.0, max: 50.0 },
  };
  
  const testLower = testName.toLowerCase();
  const critical = criticalValues[testLower];
  
  if (!critical) return false;
  
  return (critical.min && numValue < critical.min) || (critical.max && numValue > critical.max);
};

// Form validation helpers
export const validateRequired = (value: string, fieldName: string): string | null => {
  if (!value || value.trim() === '') {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateMaxLength = (value: string, maxLength: number, fieldName: string): string | null => {
  if (value && value.length > maxLength) {
    return `${fieldName} must be ${maxLength} characters or less`;
  }
  return null;
};

export const validateMinLength = (value: string, minLength: number, fieldName: string): string | null => {
  if (value && value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  return null;
};

export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    return 'Invalid email format';
  }
  return null;
};

export const validatePhoneNumber = (phone: string): string | null => {
  const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
  if (phone && !phoneRegex.test(phone)) {
    return 'Phone number must be in format (XXX) XXX-XXXX';
  }
  return null;
};

// HIPAA compliance helpers
export const logClinicalAccess = (action: string, patientId: string, userId: string): void => {
  // In a real application, this would log to a secure audit system
  console.log(`HIPAA Audit: ${new Date().toISOString()} - ${action} - Patient: ${patientId} - User: ${userId}`);
};

export const maskPatientData = (data: string, maskLevel: 'partial' | 'full' = 'partial'): string => {
  if (maskLevel === 'full') {
    return '***';
  }
  
  if (data.length <= 4) {
    return '***';
  }
  
  return data.substring(0, 2) + '***' + data.substring(data.length - 2);
};

export const validateHipaaCompliance = (action: string, userRole: string): boolean => {
  // Mock HIPAA compliance checking
  const allowedActions: { [key: string]: string[] } = {
    'patient': ['view_own_records', 'download_own_records'],
    'provider': ['view_patient_records', 'update_patient_records', 'create_encounter', 'order_tests', 'review_results'],
    'receptionist': ['view_patient_basic_info', 'search_patients', 'schedule_appointments'],
    'admin': ['view_audit_logs', 'manage_users', 'system_configuration'],
  };
  
  return allowedActions[userRole]?.includes(action) || false;
};