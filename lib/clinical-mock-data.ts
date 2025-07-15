// Mock data for clinical features - HIPAA compliant simulation
import { z } from 'zod';

// Core data types
export interface MedicalRecord {
  id: string;
  patientId: string;
  type: 'lab_result' | 'visit_summary' | 'medication' | 'immunization';
  date: string;
  provider: string;
  data: any;
  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  allergies: Allergy[];
  medications: Medication[];
  immunizations: Immunization[];
  encounters: Encounter[];
  labResults: LabResult[];
  visitSummaries: VisitSummary[];
  lastVisit?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Provider {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  specialty: string;
  department: string;
  email: string;
  phone: string;
  licenseNumber: string;
  createdAt: string;
}

export interface LabResult {
  id: string;
  patientId: string;
  testName: string;
  testCode: string;
  orderDate: string;
  resultDate: string;
  status: 'pending' | 'completed' | 'abnormal' | 'critical';
  results: {
    name: string;
    value: string;
    unit: string;
    referenceRange: string;
    isAbnormal: boolean;
    isCritical: boolean;
  }[];
  providerId: string;
  notes?: string;
  reviewed: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
  priority: 'routine' | 'urgent' | 'stat';
  createdAt: string;
}

export interface VisitSummary {
  id: string;
  patientId: string;
  encounterId: string;
  visitDate: string;
  visitType: string;
  providerId: string;
  reasonForVisit: string;
  diagnoses: string[];
  treatmentPlan: string;
  notes: string;
  vitals: {
    height: string;
    weight: string;
    bloodPressure: string;
    heartRate: string;
    temperature: string;
    respiratoryRate: string;
    oxygenSaturation: string;
  };
  followUpRequired: boolean;
  followUpDate?: string;
  createdAt: string;
}

export interface Medication {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'discontinued' | 'completed';
  prescribedBy: string;
  instructions: string;
  refillsRemaining: number;
  sideEffects?: string[];
  createdAt: string;
}

export interface Immunization {
  id: string;
  patientId: string;
  vaccineName: string;
  vaccineCode: string;
  administrationDate: string;
  lotNumber?: string;
  manufacturer: string;
  dosage: string;
  route: string;
  site: string;
  providerId: string;
  notes?: string;
  nextDueDate?: string;
  series?: string;
  createdAt: string;
}

export interface Allergy {
  id: string;
  patientId: string;
  allergen: string;
  allergenType: 'medication' | 'food' | 'environmental' | 'other';
  severity: 'low' | 'medium' | 'high';
  reaction: string;
  notes?: string;
  onsetDate?: string;
  providerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Encounter {
  id: string;
  patientId: string;
  providerId: string;
  encounterDate: string;
  reasonForVisit: string;
  vitals: {
    height: string;
    weight: string;
    bloodPressure: string;
    heartRate: string;
    temperature: string;
    respiratoryRate: string;
    oxygenSaturation: string;
  };
  diagnoses: string[];
  treatmentPlan: string;
  notes: string;
  attachments?: string[];
  status: 'draft' | 'finalized';
  createdAt: string;
  updatedAt: string;
}

export interface Referral {
  id: string;
  patientId: string;
  referringProviderId: string;
  specialtyType: string;
  referralReason: string;
  urgency: 'routine' | 'urgent' | 'stat';
  status: 'pending' | 'sent' | 'accepted' | 'declined' | 'completed';
  createdAt: string;
  sentAt?: string;
  responseAt?: string;
  notes?: string;
}

export interface LabTest {
  id: string;
  name: string;
  code: string;
  category: string;
  normalRange: string;
  description: string;
  requirements: string;
  turnaroundTime: string;
}

export interface LabResultsFilter {
  patientId: string;
  dateFrom: string;
  dateTo: string;
  status: 'pending' | 'completed' | 'abnormal' | 'critical' | '';
  provider: string;
}

export interface ReviewData {
  resultId: string;
  notes: string;
  reviewerId: string;
  followUpRequired: boolean;
  followUpInstructions: string;
}

export interface Notification {
  id: string;
  type: string;
  message: string;
  timestamp: string;
}

export type TestResult = {
  name: string;
  value: string;
  unit: string;
  referenceRange: string;
  isAbnormal: boolean;
  isCritical: boolean;
};

export interface ExtendedLabResult extends LabResult {
  patientName: string;
}

// Mock data
export const mockPatients: Patient[] = [
  {
    id: 'P001',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1985-03-15',
    phone: '(555) 123-4567',
    email: 'john.doe@email.com',
    address: '123 Main St, Anytown, ST 12345',
    emergencyContact: {
      name: 'Jane Doe',
      relationship: 'Spouse',
      phone: '(555) 987-6543'
    },
    allergies: [
      {
        id: 'A001',
        patientId: 'P001',
        allergen: 'Penicillin',
        allergenType: 'medication',
        severity: 'high',
        reaction: 'Severe rash, difficulty breathing',
        notes: 'Patient experienced anaphylaxis-like reaction in 2019',
        onsetDate: '2019-06-15',
        providerId: 'PR001',
        createdAt: '2019-06-15T10:30:00Z',
        updatedAt: '2019-06-15T10:30:00Z'
      }
    ],
    medications: [
      {
        id: 'M001',
        patientId: 'P001',
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        startDate: '2024-01-15',
        status: 'active',
        prescribedBy: 'Dr. Smith',
        instructions: 'Take with food in the morning',
        refillsRemaining: 3,
        createdAt: '2024-01-15T09:00:00Z'
      }
    ],
    immunizations: [
      {
        id: 'I001',
        patientId: 'P001',
        vaccineName: 'COVID-19 mRNA',
        vaccineCode: 'CVX-208',
        administrationDate: '2024-02-01',
        lotNumber: 'ABC123',
        manufacturer: 'Pfizer',
        dosage: '0.3mL',
        route: 'Intramuscular',
        site: 'Left deltoid',
        providerId: 'PR001',
        notes: 'No adverse reactions',
        nextDueDate: '2024-08-01',
        series: 'Booster',
        createdAt: '2024-02-01T14:00:00Z'
      }
    ],
    encounters: [],
    labResults: [
      {
        id: 'L001',
        patientId: 'P001',
        testName: 'Complete Blood Count',
        testCode: 'CBC',
        orderDate: '2024-03-01',
        resultDate: '2024-03-02',
        status: 'completed',
        results: [
          {
            name: 'White Blood Cell Count',
            value: '7.2',
            unit: 'K/uL',
            referenceRange: '4.5-11.0',
            isAbnormal: false,
            isCritical: false
          },
          {
            name: 'Hemoglobin',
            value: '14.5',
            unit: 'g/dL',
            referenceRange: '12.0-15.5',
            isAbnormal: false,
            isCritical: false
          }
        ],
        providerId: 'PR001',
        reviewed: true,
        reviewedBy: 'Dr. Smith',
        reviewedAt: '2024-03-02T10:30:00Z',
        priority: 'routine',
        createdAt: '2024-03-01T09:00:00Z'
      }
    ],
    visitSummaries: [
      {
        id: 'VS001',
        patientId: 'P001',
        encounterId: 'E001',
        visitDate: '2024-03-01',
        visitType: 'Follow-up',
        providerId: 'PR001',
        reasonForVisit: 'Hypertension follow-up',
        diagnoses: ['Essential hypertension'],
        treatmentPlan: 'Continue current medication, lifestyle modifications',
        notes: 'Blood pressure well controlled',
        vitals: {
          height: '175cm',
          weight: '80kg',
          bloodPressure: '125/80',
          heartRate: '72',
          temperature: '36.5°C',
          respiratoryRate: '16',
          oxygenSaturation: '98%'
        },
        followUpRequired: true,
        followUpDate: '2024-06-01',
        createdAt: '2024-03-01T11:00:00Z'
      }
    ],
    lastVisit: '2024-03-01',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-03-01T11:00:00Z'
  },
  {
    id: 'P002',
    firstName: 'Sarah',
    lastName: 'Johnson',
    dateOfBirth: '1990-07-22',
    phone: '(555) 234-5678',
    email: 'sarah.johnson@email.com',
    address: '456 Oak Ave, Somewhere, ST 67890',
    emergencyContact: {
      name: 'Michael Johnson',
      relationship: 'Brother',
      phone: '(555) 345-6789'
    },
    allergies: [],
    medications: [],
    immunizations: [],
    encounters: [],
    labResults: [],
    visitSummaries: [],
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z'
  }
];

export const mockProviders: Provider[] = [
  {
    id: 'PR001',
    firstName: 'James',
    lastName: 'Smith',
    title: 'MD',
    specialty: 'Family Medicine',
    department: 'Primary Care',
    email: 'james.smith@hospital.com',
    phone: '(555) 111-2222',
    licenseNumber: 'MD-12345',
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 'PR002',
    firstName: 'Emily',
    lastName: 'Wilson',
    title: 'MD',
    specialty: 'Cardiology',
    department: 'Cardiology',
    email: 'emily.wilson@hospital.com',
    phone: '(555) 222-3333',
    licenseNumber: 'MD-67890',
    createdAt: '2023-01-01T00:00:00Z'
  }
];

export const mockLabTests: LabTest[] = [
  {
    id: 'LT001',
    name: 'Complete Blood Count',
    code: 'CBC',
    category: 'Hematology',
    normalRange: 'Various',
    description: 'Comprehensive blood cell analysis',
    requirements: 'No special preparation required',
    turnaroundTime: '24 hours'
  },
  {
    id: 'LT002',
    name: 'Basic Metabolic Panel',
    code: 'BMP',
    category: 'Chemistry',
    normalRange: 'Various',
    description: 'Basic metabolic function assessment',
    requirements: 'Fasting 8-12 hours',
    turnaroundTime: '24 hours'
  },
  {
    id: 'LT003',
    name: 'Lipid Panel',
    code: 'LIPID',
    category: 'Chemistry',
    normalRange: 'Various',
    description: 'Cholesterol and lipid assessment',
    requirements: 'Fasting 9-12 hours',
    turnaroundTime: '24 hours'
  }
];

export const mockSpecialties = [
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Gastroenterology',
  'Neurology',
  'Oncology',
  'Orthopedics',
  'Psychiatry',
  'Pulmonology',
  'Rheumatology',
  'Urology'
];

export const mockDiagnoses = [
  'Essential hypertension',
  'Type 2 diabetes mellitus',
  'Hyperlipidemia',
  'Osteoarthritis',
  'Anxiety disorder',
  'Depression',
  'Chronic obstructive pulmonary disease',
  'Gastroesophageal reflux disease',
  'Migraine headache',
  'Chronic kidney disease'
];

export const mockVaccines = [
  'COVID-19 mRNA',
  'Influenza (seasonal)',
  'Tetanus, diphtheria, pertussis (Tdap)',
  'Pneumococcal conjugate (PCV13)',
  'Pneumococcal polysaccharide (PPSV23)',
  'Hepatitis B',
  'Hepatitis A',
  'Measles, mumps, rubella (MMR)',
  'Varicella (chickenpox)',
  'Shingles (zoster)'
];

// Mock data manager class
export class ClinicalDataManager {
  private patients: Patient[] = mockPatients;
  private providers: Provider[] = mockProviders;
  private labTests: LabTest[] = mockLabTests;
  private referrals: Referral[] = [];
  private auditLog: any[] = [];

  // Patient operations
  getPatients(): Patient[] {
    return this.patients;
  }

  getAllPatients(): Patient[] {
    return this.patients;
  }

  getPatient(id: string): Patient | undefined {
    return this.patients.find(p => p.id === id);
  }

  getPatientLabResults(patientId: string): LabResult[] {
    const patient = this.getPatient(patientId);
    if (!patient) {
      return [];
    }
    return patient.labResults;
  }

  searchPatients(query: string): Patient[] {
    const lowerQuery = query.toLowerCase();
    return this.patients.filter(p => 
      p.firstName.toLowerCase().includes(lowerQuery) ||
      p.lastName.toLowerCase().includes(lowerQuery) ||
      p.id.toLowerCase().includes(lowerQuery)
    );
  }

  // Provider operations
  getProviders(): Provider[] {
    return this.providers;
  }

  getProvider(id: string): Provider | undefined {
    return this.providers.find(p => p.id === id);
  }

  // Lab operations
  getLabTests(): LabTest[] {
    return this.labTests;
  }

  getLabTestByName(name: string): LabTest | undefined {
    return this.labTests.find(lt => lt.name.toLowerCase().includes(name.toLowerCase()));
  }

  // Medical records operations
  getPatientMedicalRecords(patientId: string): {
    labResults: LabResult[];
    visitSummaries: VisitSummary[];
    medications: Medication[];
    immunizations: Immunization[];
  } {
    const patient = this.getPatient(patientId);
    if (!patient) {
      return {
        labResults: [],
        visitSummaries: [],
        medications: [],
        immunizations: []
      };
    }

    return {
      labResults: patient.labResults,
      visitSummaries: patient.visitSummaries,
      medications: patient.medications,
      immunizations: patient.immunizations
    };
  }

  // Encounter operations
  addEncounter(patientId: string, encounter: Omit<Encounter, 'id' | 'createdAt' | 'updatedAt'>): Encounter {
    const patient = this.getPatient(patientId);
    if (!patient) {
      throw new Error('Patient not found');
    }

    const newEncounter: Encounter = {
      ...encounter,
      id: `E${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    patient.encounters.push(newEncounter);
    this.logAudit('encounter_created', patientId, newEncounter.id);
    return newEncounter;
  }

  updateEncounter(encounterId: string, updates: Partial<Encounter>): Encounter | null {
    for (const patient of this.patients) {
      const encounter = patient.encounters.find(e => e.id === encounterId);
      if (encounter) {
        Object.assign(encounter, updates, { updatedAt: new Date().toISOString() });
        this.logAudit('encounter_updated', patient.id, encounterId);
        return encounter;
      }
    }
    return null;
  }

  // Lab result operations
  addLabResult(patientId: string, labResult: Omit<LabResult, 'id' | 'createdAt'>): LabResult {
    const patient = this.getPatient(patientId);
    if (!patient) {
      throw new Error('Patient not found');
    }

    const newLabResult: LabResult = {
      ...labResult,
      id: `L${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    patient.labResults.push(newLabResult);
    this.logAudit('lab_result_added', patientId, newLabResult.id);
    return newLabResult;
  }

  reviewLabResult(resultId: string, reviewerId: string): boolean {
    for (const patient of this.patients) {
      const result = patient.labResults.find(r => r.id === resultId);
      if (result) {
        result.reviewed = true;
        result.reviewedBy = reviewerId;
        result.reviewedAt = new Date().toISOString();
        this.logAudit('lab_result_reviewed', patient.id, resultId);
        return true;
      }
    }
    return false;
  }

  // Allergy operations
  addAllergy(patientId: string, allergy: Omit<Allergy, 'id' | 'createdAt' | 'updatedAt'>): Allergy {
    const patient = this.getPatient(patientId);
    if (!patient) {
      throw new Error('Patient not found');
    }

    const newAllergy: Allergy = {
      ...allergy,
      id: `A${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    patient.allergies.push(newAllergy);
    this.logAudit('allergy_added', patientId, newAllergy.id);
    return newAllergy;
  }

  updateAllergy(allergyId: string, updates: Partial<Allergy>): Allergy | null {
    for (const patient of this.patients) {
      const allergy = patient.allergies.find(a => a.id === allergyId);
      if (allergy) {
        Object.assign(allergy, updates, { updatedAt: new Date().toISOString() });
        this.logAudit('allergy_updated', patient.id, allergyId);
        return allergy;
      }
    }
    return null;
  }

  // Immunization operations
  addImmunization(patientId: string, immunization: Omit<Immunization, 'id' | 'createdAt'>): Immunization {
    const patient = this.getPatient(patientId);
    if (!patient) {
      throw new Error('Patient not found');
    }

    const newImmunization: Immunization = {
      ...immunization,
      id: `I${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    patient.immunizations.push(newImmunization);
    this.logAudit('immunization_added', patientId, newImmunization.id);
    return newImmunization;
  }

  // Referral operations
  addReferral(referral: Omit<Referral, 'id' | 'createdAt'>): Referral {
    const newReferral: Referral = {
      ...referral,
      id: `R${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    this.referrals.push(newReferral);
    this.logAudit('referral_created', referral.patientId, newReferral.id);
    return newReferral;
  }

  // Audit logging
  private logAudit(action: string, patientId: string, resourceId: string): void {
    this.auditLog.push({
      timestamp: new Date().toISOString(),
      action,
      patientId,
      resourceId,
      userId: 'current-user' // In real app, would be from auth context
    });
  }

  getAuditLog(): any[] {
    return this.auditLog;
  }

  // Utility methods
  checkDrugInteractions(allergens: string[], medications: string[]): string[] {
    const interactions: string[] = [];
    
    // Simple mock interaction checking
    if (allergens.includes('Penicillin') && medications.some(m => m.includes('Amoxicillin'))) {
      interactions.push('Potential penicillin allergy interaction with Amoxicillin');
    }
    
    return interactions;
  }

  generateHealthSummary(patientId: string): any {
    const patient = this.getPatient(patientId);
    if (!patient) return null;

    return {
      patient: {
        name: `${patient.firstName} ${patient.lastName}`,
        dob: patient.dateOfBirth,
        id: patient.id
      },
      summary: {
        totalLabResults: patient.labResults.length,
        totalVisits: patient.visitSummaries.length,
        currentMedications: patient.medications.filter(m => m.status === 'active').length,
        totalImmunizations: patient.immunizations.length,
        totalAllergies: patient.allergies.length,
        lastVisit: patient.lastVisit
      },
      generatedAt: new Date().toISOString()
    };
  }
}

// Global instance
export const clinicalDataManager = new ClinicalDataManager();