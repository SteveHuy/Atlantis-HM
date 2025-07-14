// Epic 4 Mock Data - Appointment Management Features
// Comprehensive mock data for all appointment-related functionality

export interface ServiceType {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface Provider {
  id: string;
  name: string;
  title: string;
  specialty: string;
  serviceTypes: string[];
  location: string;
  avatar?: string;
  rating: number;
  requiresApproval: boolean;
  availableDates: string[];
}

export interface TimeSlot {
  time: string;
  available: boolean;
  provider: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  providerId: string;
  providerName: string;
  serviceType: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  location: string;
  notes?: string;
  feedback?: string;
  createdAt: string;
}

export interface WaitlistEntry {
  id: string;
  patientId: string;
  providerId: string;
  providerName: string;
  serviceType: string;
  preferredDateRange: {
    start: string;
    end: string;
  };
  preferredTimes: string[];
  status: 'active' | 'notified' | 'expired';
  createdAt: string;
  position: number;
}

export interface ReminderSettings {
  patientId: string;
  method: 'sms' | 'email' | 'both';
  intervals: string[]; // e.g., ['24h', '1h']
  enabled: boolean;
  testRemindersSent: number;
  lastUpdated: string;
}

export interface ReminderLog {
  id: string;
  appointmentId: string;
  method: string;
  sentAt: string;
  status: 'sent' | 'failed' | 'delivered';
  message: string;
}

// Mock Service Types
export const mockServiceTypes: ServiceType[] = [
  {
    id: 'general',
    name: 'General Consultation',
    icon: '👩‍⚕️',
    description: 'General health check-ups and consultations'
  },
  {
    id: 'cardiology',
    name: 'Cardiology',
    icon: '❤️',
    description: 'Heart and cardiovascular health'
  },
  {
    id: 'dermatology',
    name: 'Dermatology',
    icon: '🧴',
    description: 'Skin, hair, and nail conditions'
  },
  {
    id: 'orthopedics',
    name: 'Orthopedics',
    icon: '🦴',
    description: 'Bone, joint, and muscle issues'
  },
  {
    id: 'pediatrics',
    name: 'Pediatrics',
    icon: '👶',
    description: 'Child and adolescent healthcare'
  },
  {
    id: 'psychiatry',
    name: 'Psychiatry',
    icon: '🧠',
    description: 'Mental health and behavioral therapy'
  },
  {
    id: 'ophthalmology',
    name: 'Ophthalmology',
    icon: '👁️',
    description: 'Eye care and vision health'
  },
  {
    id: 'dentistry',
    name: 'Dentistry',
    icon: '🦷',
    description: 'Dental care and oral health'
  }
];

// Mock Providers
export const mockProviders: Provider[] = [
  {
    id: 'dr-smith',
    name: 'Dr. Sarah Smith',
    title: 'MD',
    specialty: 'General Medicine',
    serviceTypes: ['general', 'pediatrics'],
    location: 'Building A, Room 101',
    rating: 4.8,
    requiresApproval: false,
    availableDates: ['2025-07-15', '2025-07-16', '2025-07-17', '2025-07-18', '2025-07-21']
  },
  {
    id: 'dr-johnson',
    name: 'Dr. Michael Johnson',
    title: 'MD, FACC',
    specialty: 'Cardiology',
    serviceTypes: ['cardiology', 'general'],
    location: 'Building B, Room 205',
    rating: 4.9,
    requiresApproval: true,
    availableDates: ['2025-07-16', '2025-07-18', '2025-07-22', '2025-07-23']
  },
  {
    id: 'dr-brown',
    name: 'Dr. Emily Brown',
    title: 'MD, FAAD',
    specialty: 'Dermatology',
    serviceTypes: ['dermatology'],
    location: 'Building C, Room 310',
    rating: 4.7,
    requiresApproval: false,
    availableDates: ['2025-07-15', '2025-07-17', '2025-07-19', '2025-07-21']
  },
  {
    id: 'dr-wilson',
    name: 'Dr. Robert Wilson',
    title: 'MD, FAAOS',
    specialty: 'Orthopedics',
    serviceTypes: ['orthopedics'],
    location: 'Building D, Room 115',
    rating: 4.6,
    requiresApproval: true,
    availableDates: ['2025-07-18', '2025-07-19', '2025-07-22']
  },
  {
    id: 'dr-davis',
    name: 'Dr. Jennifer Davis',
    title: 'MD, FAAP',
    specialty: 'Pediatrics',
    serviceTypes: ['pediatrics', 'general'],
    location: 'Building A, Room 102',
    rating: 4.9,
    requiresApproval: false,
    availableDates: ['2025-07-15', '2025-07-16', '2025-07-17', '2025-07-18', '2025-07-19']
  },
  {
    id: 'dr-miller',
    name: 'Dr. David Miller',
    title: 'MD, PhD',
    specialty: 'Psychiatry',
    serviceTypes: ['psychiatry'],
    location: 'Building E, Room 201',
    rating: 4.8,
    requiresApproval: true,
    availableDates: ['2025-07-17', '2025-07-19', '2025-07-21', '2025-07-23']
  }
];

// Mock Time Slots (for each provider on each available date)
export const mockTimeSlots: { [key: string]: TimeSlot[] } = {
  'dr-smith-2025-07-15': [
    { time: '09:00', available: true, provider: 'dr-smith' },
    { time: '09:30', available: true, provider: 'dr-smith' },
    { time: '10:00', available: false, provider: 'dr-smith' },
    { time: '10:30', available: true, provider: 'dr-smith' },
    { time: '14:00', available: true, provider: 'dr-smith' },
    { time: '14:30', available: false, provider: 'dr-smith' },
    { time: '15:00', available: true, provider: 'dr-smith' }
  ],
  'dr-johnson-2025-07-16': [
    { time: '08:00', available: false, provider: 'dr-johnson' },
    { time: '08:30', available: false, provider: 'dr-johnson' },
    { time: '09:00', available: false, provider: 'dr-johnson' },
    { time: '09:30', available: false, provider: 'dr-johnson' },
    { time: '10:00', available: false, provider: 'dr-johnson' }
  ]
};

// Mock Appointment History
export const mockAppointmentHistory: Appointment[] = [
  {
    id: 'apt-001',
    patientId: 'patient-john',
    providerId: 'dr-smith',
    providerName: 'Dr. Sarah Smith',
    serviceType: 'General Consultation',
    date: '2025-06-15',
    time: '10:00',
    status: 'completed',
    location: 'Building A, Room 101',
    notes: 'Annual check-up completed. All vitals normal.',
    feedback: 'Excellent care and service.',
    createdAt: '2025-06-10T09:00:00Z'
  },
  {
    id: 'apt-002',
    patientId: 'patient-john',
    providerId: 'dr-brown',
    providerName: 'Dr. Emily Brown',
    serviceType: 'Dermatology',
    date: '2025-05-22',
    time: '14:30',
    status: 'completed',
    location: 'Building C, Room 310',
    notes: 'Skin examination completed. Minor issues addressed.',
    createdAt: '2025-05-18T11:00:00Z'
  },
  {
    id: 'apt-003',
    patientId: 'patient-john',
    providerId: 'dr-johnson',
    providerName: 'Dr. Michael Johnson',
    serviceType: 'Cardiology',
    date: '2025-04-10',
    time: '09:30',
    status: 'completed',
    location: 'Building B, Room 205',
    notes: 'Cardiac screening completed. Follow-up recommended in 6 months.',
    createdAt: '2025-04-05T14:00:00Z'
  },
  {
    id: 'apt-004',
    patientId: 'patient-john',
    providerId: 'dr-smith',
    providerName: 'Dr. Sarah Smith',
    serviceType: 'General Consultation',
    date: '2025-03-18',
    time: '11:00',
    status: 'completed',
    location: 'Building A, Room 101',
    notes: 'Routine consultation for flu symptoms. Prescribed medication.',
    createdAt: '2025-03-15T10:00:00Z'
  },
  {
    id: 'apt-005',
    patientId: 'patient-john',
    providerId: 'dr-davis',
    providerName: 'Dr. Jennifer Davis',
    serviceType: 'Pediatrics',
    date: '2025-02-28',
    time: '15:30',
    status: 'cancelled',
    location: 'Building A, Room 102',
    notes: 'Cancelled by patient.',
    createdAt: '2025-02-25T16:00:00Z'
  }
];

// Mock Current Waitlist Entries
export const mockWaitlistEntries: WaitlistEntry[] = [
  {
    id: 'wait-001',
    patientId: 'patient-john',
    providerId: 'dr-johnson',
    providerName: 'Dr. Michael Johnson',
    serviceType: 'Cardiology',
    preferredDateRange: {
      start: '2025-07-20',
      end: '2025-07-25'
    },
    preferredTimes: ['09:00', '09:30', '10:00'],
    status: 'active',
    createdAt: '2025-07-10T14:30:00Z',
    position: 3
  }
];

// Mock Reminder Settings
export const mockReminderSettings: ReminderSettings = {
  patientId: 'patient-john',
  method: 'both',
  intervals: ['24h', '1h'],
  enabled: true,
  testRemindersSent: 2,
  lastUpdated: '2025-07-01T10:00:00Z'
};

// Mock Reminder Logs
export const mockReminderLogs: ReminderLog[] = [
  {
    id: 'rem-001',
    appointmentId: 'apt-001',
    method: 'email',
    sentAt: '2025-06-14T10:00:00Z',
    status: 'delivered',
    message: 'Reminder: You have an appointment with Dr. Sarah Smith tomorrow at 10:00 AM'
  },
  {
    id: 'rem-002',
    appointmentId: 'apt-001',
    method: 'sms',
    sentAt: '2025-06-15T09:00:00Z',
    status: 'delivered',
    message: 'Your appointment with Dr. Sarah Smith is in 1 hour (10:00 AM)'
  }
];

// Utility functions for mock data management
export class Epic4MockDataManager {
  private static appointments: Appointment[] = [...mockAppointmentHistory];
  private static waitlistEntries: WaitlistEntry[] = [...mockWaitlistEntries];
  private static reminderSettings: ReminderSettings = { ...mockReminderSettings };
  private static reminderLogs: ReminderLog[] = [...mockReminderLogs];

  // Service and Provider queries
  static getServiceTypes(): ServiceType[] {
    return mockServiceTypes;
  }

  static getProviders(serviceTypeId?: string): Provider[] {
    if (!serviceTypeId) return mockProviders;
    return mockProviders.filter(provider => 
      provider.serviceTypes.includes(serviceTypeId)
    );
  }

  static getProvider(id: string): Provider | undefined {
    return mockProviders.find(p => p.id === id);
  }

  static searchProviders(query: {
    serviceType?: string;
    providerName?: string;
    specialty?: string;
  }): Provider[] {
    return mockProviders.filter(provider => {
      const matchesServiceType = !query.serviceType || 
        provider.serviceTypes.some(st => 
          mockServiceTypes.find(mst => mst.id === st)?.name
            .toLowerCase().includes(query.serviceType!.toLowerCase())
        );
      
      const matchesProviderName = !query.providerName || 
        provider.name.toLowerCase().includes(query.providerName.toLowerCase());
      
      const matchesSpecialty = !query.specialty || 
        provider.specialty.toLowerCase().includes(query.specialty.toLowerCase());

      return matchesServiceType && matchesProviderName && matchesSpecialty;
    });
  }

  // Appointment scheduling
  static getAvailableTimeSlots(providerId: string, date: string): TimeSlot[] {
    const key = `${providerId}-${date}`;
    return mockTimeSlots[key] || [];
  }

  static scheduleAppointment(appointment: Omit<Appointment, 'id' | 'createdAt'>): Appointment {
    const newAppointment: Appointment = {
      ...appointment,
      id: `apt-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    this.appointments.unshift(newAppointment);
    return newAppointment;
  }

  // Appointment history
  static getAppointmentHistory(patientId: string, filters?: {
    dateFrom?: string;
    dateTo?: string;
    providerId?: string;
  }): Appointment[] {
    let filtered = this.appointments.filter(apt => apt.patientId === patientId);
    
    if (filters?.dateFrom) {
      filtered = filtered.filter(apt => apt.date >= filters.dateFrom!);
    }
    
    if (filters?.dateTo) {
      filtered = filtered.filter(apt => apt.date <= filters.dateTo!);
    }
    
    if (filters?.providerId) {
      filtered = filtered.filter(apt => apt.providerId === filters.providerId);
    }
    
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Waitlist management
  static getWaitlistEntries(patientId: string): WaitlistEntry[] {
    return this.waitlistEntries.filter(entry => entry.patientId === patientId);
  }

  static addToWaitlist(entry: Omit<WaitlistEntry, 'id' | 'createdAt' | 'position'>): WaitlistEntry {
    const position = this.waitlistEntries.filter(e => 
      e.providerId === entry.providerId && e.status === 'active'
    ).length + 1;

    const newEntry: WaitlistEntry = {
      ...entry,
      id: `wait-${Date.now()}`,
      position,
      createdAt: new Date().toISOString()
    };
    
    this.waitlistEntries.push(newEntry);
    return newEntry;
  }

  static removeFromWaitlist(entryId: string): boolean {
    const index = this.waitlistEntries.findIndex(e => e.id === entryId);
    if (index !== -1) {
      this.waitlistEntries.splice(index, 1);
      return true;
    }
    return false;
  }

  // Reminder management
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static getReminderSettings(_patientId: string): ReminderSettings {
    return { ...this.reminderSettings };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static updateReminderSettings(_patientId: string, settings: Partial<ReminderSettings>): ReminderSettings {
    this.reminderSettings = {
      ...this.reminderSettings,
      ...settings,
      lastUpdated: new Date().toISOString()
    };
    return { ...this.reminderSettings };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static sendTestReminder(_patientId: string): ReminderLog {
    const testReminder: ReminderLog = {
      id: `test-${Date.now()}`,
      appointmentId: 'test',
      method: this.reminderSettings.method === 'both' ? 'email' : this.reminderSettings.method,
      sentAt: new Date().toISOString(),
      status: 'sent',
      message: 'This is a test reminder from Atlantis HMS'
    };
    
    this.reminderLogs.push(testReminder);
    this.reminderSettings.testRemindersSent++;
    
    return testReminder;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static getReminderLogs(_patientId: string): ReminderLog[] {
    return [...this.reminderLogs].sort((a, b) => 
      new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
    );
  }

  // Utility methods
  static getSpecialties(): string[] {
    return [...new Set(mockProviders.map(p => p.specialty))].sort();
  }

  static isSlotAvailable(providerId: string, date: string, time: string): boolean {
    const slots = this.getAvailableTimeSlots(providerId, date);
    const slot = slots.find(s => s.time === time);
    return slot?.available || false;
  }
}