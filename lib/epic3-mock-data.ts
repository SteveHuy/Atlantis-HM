// Mock data for Epic 3 - Receptionist & Provider Authentication Features

export interface MockReceptionist {
  id: string;
  username: string;
  password: string; // In real app, this would be hashed
  fullName: string;
  email: string;
  phone: string;
  role: 'receptionist';
  isActive: boolean;
  failedLoginAttempts: number;
  lockedUntil?: Date;
  lastLogin?: Date;
}

export interface MockProvider {
  id: string;
  username: string;
  password: string; // In real app, this would be hashed
  fullName: string;
  email: string;
  phone: string;
  specialty: string;
  licenseNumber: string;
  role: 'provider';
  isActive: boolean;
  failedLoginAttempts: number;
  lockedUntil?: Date;
  lastLogin?: Date;
}

export interface MockPatient {
  id: string;
  username: string;
  password: string; // In real app, this would be hashed
  fullName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  insuranceProvider?: string;
  emergencyContact?: {
    name: string;
    relation: string;
    phone: string;
    email?: string;
  };
  role: 'patient';
  isActive: boolean;
  isVerified: boolean;
  registeredBy?: string; // ID of receptionist who registered them
  registrationDate: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userRole: 'patient' | 'receptionist' | 'provider';
  action: string;
  timestamp: string;
  ipAddress?: string;
  details?: string;
}

// Mock Insurance Providers
export const MOCK_INSURANCE_PROVIDERS = [
  'Blue Cross Blue Shield',
  'Aetna',
  'Cigna',
  'UnitedHealthcare',
  'Humana',
  'Kaiser Permanente',
  'Anthem',
  'Medicare',
  'Medicaid',
  'Other'
];

// Emergency Contact Relations
export const EMERGENCY_CONTACT_RELATIONS = [
  'Spouse',
  'Parent',
  'Child',
  'Sibling',
  'Grandparent',
  'Aunt/Uncle',
  'Cousin',
  'Friend',
  'Guardian',
  'Other'
];

// Mock data storage (in real app, this would be a database)
const mockReceptionists: MockReceptionist[] = [
  {
    id: 'rec001',
    username: 'receptionist1',
    password: 'Recept123!', // Meets password policy
    fullName: 'Sarah Johnson',
    email: 'sarah.johnson@atlantishms.com',
    phone: '(555) 123-4567',
    role: 'receptionist',
    isActive: true,
    failedLoginAttempts: 0,
    lastLogin: new Date('2025-07-13T10:30:00Z')
  },
  {
    id: 'rec002',
    username: 'frontdesk',
    password: 'FrontDesk456!',
    fullName: 'Maria Rodriguez',
    email: 'maria.rodriguez@atlantishms.com',
    phone: '(555) 234-5678',
    role: 'receptionist',
    isActive: true,
    failedLoginAttempts: 0
  }
];

const mockProviders: MockProvider[] = [
  {
    id: 'prov001',
    username: 'drsmith',
    password: 'Doctor123!',
    fullName: 'Dr. John Smith',
    email: 'john.smith@atlantishms.com',
    phone: '(555) 345-6789',
    specialty: 'Family Medicine',
    licenseNumber: 'MD123456',
    role: 'provider',
    isActive: true,
    failedLoginAttempts: 0,
    lastLogin: new Date('2025-07-13T08:15:00Z')
  },
  {
    id: 'prov002',
    username: 'drwilson',
    password: 'Provider456!',
    fullName: 'Dr. Emily Wilson',
    email: 'emily.wilson@atlantishms.com',
    phone: '(555) 456-7890',
    specialty: 'Cardiology',
    licenseNumber: 'MD789012',
    role: 'provider',
    isActive: true,
    failedLoginAttempts: 0
  }
];

const mockPatients: MockPatient[] = [
  {
    id: 'pat001',
    username: 'johndoe',
    password: 'Patient123!',
    fullName: 'John Doe',
    dateOfBirth: '1985-03-15',
    email: 'john.doe@email.com',
    phone: '(555) 567-8901',
    insuranceProvider: 'Blue Cross Blue Shield',
    emergencyContact: {
      name: 'Jane Doe',
      relation: 'Spouse',
      phone: '(555) 678-9012',
      email: 'jane.doe@email.com'
    },
    role: 'patient',
    isActive: true,
    isVerified: true,
    registrationDate: '2025-07-01T09:00:00Z'
  }
];

const auditLog: AuditLogEntry[] = [];

// Utility functions for mock data management
export const mockDataManager = {
  // Receptionist functions
  getReceptionists: () => [...mockReceptionists],

  getReceptionistByUsername: (username: string) =>
    mockReceptionists.find(r => r.username === username && r.isActive),

  updateReceptionistFailedAttempts: (username: string, attempts: number) => {
    const receptionist = mockReceptionists.find(r => r.username === username);
    if (receptionist) {
      receptionist.failedLoginAttempts = attempts;
      if (attempts >= 5) {
        receptionist.lockedUntil = new Date(Date.now() + 15 * 60000); // 15 minutes
      }
    }
  },

  updateReceptionistLastLogin: (username: string) => {
    const receptionist = mockReceptionists.find(r => r.username === username);
    if (receptionist) {
      receptionist.lastLogin = new Date();
      receptionist.failedLoginAttempts = 0;
      receptionist.lockedUntil = undefined;
    }
  },

  // Provider functions
  getProviders: () => [...mockProviders],

  getProviderByUsername: (username: string) =>
    mockProviders.find(p => p.username === username && p.isActive),

  updateProviderFailedAttempts: (username: string, attempts: number) => {
    const provider = mockProviders.find(p => p.username === username);
    if (provider) {
      provider.failedLoginAttempts = attempts;
      if (attempts >= 5) {
        provider.lockedUntil = new Date(Date.now() + 15 * 60000); // 15 minutes
      }
    }
  },

  updateProviderLastLogin: (username: string) => {
    const provider = mockProviders.find(p => p.username === username);
    if (provider) {
      provider.lastLogin = new Date();
      provider.failedLoginAttempts = 0;
      provider.lockedUntil = undefined;
    }
  },

  // Patient functions
  getPatients: () => [...mockPatients],

  getPatientByUsername: (username: string) =>
    mockPatients.find(p => p.username === username && p.isActive),

  getPatientByEmail: (email: string) =>
    mockPatients.find(p => p.email === email && p.isActive),

  createPatient: (patientData: Omit<MockPatient, 'id' | 'role' | 'isActive' | 'registrationDate'>) => {
    const newPatient: MockPatient = {
      ...patientData,
      id: `pat${String(mockPatients.length + 1).padStart(3, '0')}`,
      role: 'patient',
      isActive: true,
      registrationDate: new Date().toISOString()
    };
    mockPatients.push(newPatient);
    return newPatient;
  },

  updatePatientEmergencyContact: (patientId: string, emergencyContact: MockPatient['emergencyContact']) => {
    const patient = mockPatients.find(p => p.id === patientId);
    if (patient) {
      patient.emergencyContact = emergencyContact;
      return true;
    }
    return false;
  },

  // Audit log functions
  addAuditLogEntry: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `audit${String(auditLog.length + 1).padStart(6, '0')}`,
      timestamp: new Date().toISOString()
    };
    auditLog.push(newEntry);
    return newEntry;
  },

  getAuditLog: () => [...auditLog],

  // Utility functions
  isUsernameUnique: (username: string) => {
    return !mockReceptionists.some(r => r.username === username) &&
           !mockProviders.some(p => p.username === username) &&
           !mockPatients.some(p => p.username === username);
  },

  isEmailUnique: (email: string, excludeId?: string) => {
    return !mockPatients.some(p => p.email === email && p.id !== excludeId);
  }
};

// Session management utilities
export interface UserSession {
  userId: string;
  username: string;
  role: 'patient' | 'receptionist' | 'provider';
  fullName: string;
  loginTime: string;
  expiresAt: string;
  rememberMe?: boolean;
}

export const sessionManager = {
  createSession: (user: MockReceptionist | MockProvider | MockPatient, rememberMe = false): UserSession => {
    const loginTime = new Date().toISOString();
    const expiresAt = rememberMe
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      : new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(); // 8 hours

    return {
      userId: user.id,
      username: user.username,
      role: user.role,
      fullName: user.fullName,
      loginTime,
      expiresAt,
      rememberMe
    };
  },

  isSessionValid: (session: UserSession): boolean => {
    return new Date(session.expiresAt) > new Date();
  },

  clearSession: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userSession');
      sessionStorage.removeItem('userSession');
    }
  },

  saveSession: (session: UserSession) => {
    if (typeof window !== 'undefined') {
      const storage = session.rememberMe ? localStorage : sessionStorage;
      storage.setItem('userSession', JSON.stringify(session));
    }
  },

  getSession: (): UserSession | null => {
    if (typeof window === 'undefined') return null;
    console.log("Window not undefined");

    // Check session storage first, then local storage
    const sessionData = sessionStorage.getItem('userSession') || localStorage.getItem('userSession');
    console.log("Session data is: ", sessionData);
    if (!sessionData) return null;

    try {
      const session: UserSession = JSON.parse(sessionData);
      return sessionManager.isSessionValid(session) ? session : null;
    } catch {
      console.error("Error parsing session data");
      return null;
    }
  }
};
