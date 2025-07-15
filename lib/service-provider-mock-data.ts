// Service Provider Mock Data and Management
// This file contains mock data and utilities for service provider features

export interface Provider {
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  rating: number;
  services: string[];
  schedule: ProviderSchedule;
  availabilitySettings: AvailabilitySettings;
}

export interface ProviderSchedule {
  providerId: string;
  dates: ScheduleDate[];
}

export interface ScheduleDate {
  date: string; // YYYY-MM-DD format
  timeSlots: TimeSlot[];
}

export interface TimeSlot {
  id: string;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  status: 'available' | 'booked' | 'blocked';
  appointmentId?: string;
  patientId?: string;
  notes?: string;
}

export interface AvailabilitySettings {
  providerId: string;
  weeklySchedule: WeeklySchedule;
  blockedDates: string[];
  defaultSlotDuration: number; // minutes
}

export interface WeeklySchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  isAvailable: boolean;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  breakTimes: BreakTime[];
}

export interface BreakTime {
  startTime: string;
  endTime: string;
  description: string;
}

export interface SecureMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'provider' | 'patient' | 'receptionist';
  recipientId: string;
  recipientName: string;
  recipientType: 'provider' | 'patient' | 'receptionist';
  subject: string;
  content: string;
  attachments: MessageAttachment[];
  timestamp: string;
  isRead: boolean;
  deliveryStatus: 'pending' | 'delivered' | 'failed';
  encryptionStatus: 'encrypted' | 'decrypted';
}

export interface MessageAttachment {
  id: string;
  filename: string;
  size: number; // bytes
  type: string;
  url: string;
}

export interface PrescriptionRefill {
  id: string;
  patientId: string;
  patientName: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  originalPrescriptionId: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'denied';
  providerId?: string;
  notes?: string;
  pharmacyId?: string;
  refillsRemaining?: number;
}

export interface Medication {
  id: string;
  name: string;
  genericName: string;
  dosageOptions: string[];
  frequencyOptions: string[];
  routeOptions: string[];
  commonInteractions: string[];
  warnings: string[];
  category: string;
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  faxNumber: string;
  isActive: boolean;
}

export interface SecurityAuditLog {
  id: string;
  userId: string;
  userRole: string;
  action: string;
  resourceType: string;
  resourceId: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface SessionActivity {
  sessionId: string;
  userId: string;
  startTime: string;
  lastActivity: string;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  logoutTime?: string;
  logoutReason?: 'manual' | 'timeout' | 'forced';
}

// Mock Data
export const mockProviders: Provider[] = [
  {
    id: 'provider-1',
    name: 'Dr. Sarah Johnson',
    specialty: 'Family Medicine',
    email: 'sarah.johnson@atlantis.com',
    phone: '(555) 123-4567',
    rating: 4.8,
    services: ['General Consultation', 'Physical Exam', 'Wellness Check'],
    schedule: {
      providerId: 'provider-1',
      dates: []
    },
    availabilitySettings: {
      providerId: 'provider-1',
      weeklySchedule: {
        monday: { isAvailable: true, startTime: '09:00', endTime: '17:00', breakTimes: [{ startTime: '12:00', endTime: '13:00', description: 'Lunch' }] },
        tuesday: { isAvailable: true, startTime: '09:00', endTime: '17:00', breakTimes: [{ startTime: '12:00', endTime: '13:00', description: 'Lunch' }] },
        wednesday: { isAvailable: true, startTime: '09:00', endTime: '17:00', breakTimes: [{ startTime: '12:00', endTime: '13:00', description: 'Lunch' }] },
        thursday: { isAvailable: true, startTime: '09:00', endTime: '17:00', breakTimes: [{ startTime: '12:00', endTime: '13:00', description: 'Lunch' }] },
        friday: { isAvailable: true, startTime: '09:00', endTime: '17:00', breakTimes: [{ startTime: '12:00', endTime: '13:00', description: 'Lunch' }] },
        saturday: { isAvailable: false, startTime: '00:00', endTime: '00:00', breakTimes: [] },
        sunday: { isAvailable: false, startTime: '00:00', endTime: '00:00', breakTimes: [] }
      },
      blockedDates: [],
      defaultSlotDuration: 30
    }
  },
  {
    id: 'provider-2',
    name: 'Dr. Michael Chen',
    specialty: 'Cardiology',
    email: 'michael.chen@atlantis.com',
    phone: '(555) 234-5678',
    rating: 4.9,
    services: ['Cardiac Consultation', 'EKG', 'Stress Test'],
    schedule: {
      providerId: 'provider-2',
      dates: []
    },
    availabilitySettings: {
      providerId: 'provider-2',
      weeklySchedule: {
        monday: { isAvailable: true, startTime: '08:00', endTime: '16:00', breakTimes: [{ startTime: '12:00', endTime: '13:00', description: 'Lunch' }] },
        tuesday: { isAvailable: true, startTime: '08:00', endTime: '16:00', breakTimes: [{ startTime: '12:00', endTime: '13:00', description: 'Lunch' }] },
        wednesday: { isAvailable: true, startTime: '08:00', endTime: '16:00', breakTimes: [{ startTime: '12:00', endTime: '13:00', description: 'Lunch' }] },
        thursday: { isAvailable: true, startTime: '08:00', endTime: '16:00', breakTimes: [{ startTime: '12:00', endTime: '13:00', description: 'Lunch' }] },
        friday: { isAvailable: true, startTime: '08:00', endTime: '16:00', breakTimes: [{ startTime: '12:00', endTime: '13:00', description: 'Lunch' }] },
        saturday: { isAvailable: true, startTime: '09:00', endTime: '13:00', breakTimes: [] },
        sunday: { isAvailable: false, startTime: '00:00', endTime: '00:00', breakTimes: [] }
      },
      blockedDates: [],
      defaultSlotDuration: 45
    }
  },
  {
    id: 'provider-3',
    name: 'Dr. Emily Rodriguez',
    specialty: 'Dermatology',
    email: 'emily.rodriguez@atlantis.com',
    phone: '(555) 345-6789',
    rating: 4.7,
    services: ['Skin Consultation', 'Dermatology Screening', 'Mole Removal'],
    schedule: {
      providerId: 'provider-3',
      dates: []
    },
    availabilitySettings: {
      providerId: 'provider-3',
      weeklySchedule: {
        monday: { isAvailable: true, startTime: '10:00', endTime: '18:00', breakTimes: [{ startTime: '14:00', endTime: '15:00', description: 'Break' }] },
        tuesday: { isAvailable: true, startTime: '10:00', endTime: '18:00', breakTimes: [{ startTime: '14:00', endTime: '15:00', description: 'Break' }] },
        wednesday: { isAvailable: false, startTime: '00:00', endTime: '00:00', breakTimes: [] },
        thursday: { isAvailable: true, startTime: '10:00', endTime: '18:00', breakTimes: [{ startTime: '14:00', endTime: '15:00', description: 'Break' }] },
        friday: { isAvailable: true, startTime: '10:00', endTime: '18:00', breakTimes: [{ startTime: '14:00', endTime: '15:00', description: 'Break' }] },
        saturday: { isAvailable: false, startTime: '00:00', endTime: '00:00', breakTimes: [] },
        sunday: { isAvailable: false, startTime: '00:00', endTime: '00:00', breakTimes: [] }
      },
      blockedDates: [],
      defaultSlotDuration: 20
    }
  }
];

export const mockMedications: Medication[] = [
  {
    id: 'med-1',
    name: 'Lisinopril',
    genericName: 'Lisinopril',
    dosageOptions: ['5mg', '10mg', '20mg', '40mg'],
    frequencyOptions: ['Once daily', 'Twice daily'],
    routeOptions: ['Oral'],
    commonInteractions: ['NSAIDs', 'Potassium supplements'],
    warnings: ['Monitor blood pressure', 'Check kidney function'],
    category: 'ACE Inhibitor'
  },
  {
    id: 'med-2',
    name: 'Metformin',
    genericName: 'Metformin',
    dosageOptions: ['500mg', '850mg', '1000mg'],
    frequencyOptions: ['Once daily', 'Twice daily', 'Three times daily'],
    routeOptions: ['Oral'],
    commonInteractions: ['Alcohol', 'Contrast dye'],
    warnings: ['Take with food', 'Monitor kidney function'],
    category: 'Antidiabetic'
  },
  {
    id: 'med-3',
    name: 'Amoxicillin',
    genericName: 'Amoxicillin',
    dosageOptions: ['250mg', '500mg', '875mg'],
    frequencyOptions: ['Twice daily', 'Three times daily'],
    routeOptions: ['Oral'],
    commonInteractions: ['Warfarin', 'Oral contraceptives'],
    warnings: ['Complete full course', 'Report allergic reactions'],
    category: 'Antibiotic'
  }
];

export const mockPharmacies: Pharmacy[] = [
  {
    id: 'pharmacy-1',
    name: 'Atlantis Pharmacy',
    address: '123 Health Street, Medical City, MC 12345',
    phone: '(555) 111-2222',
    email: 'info@atlantispharmacy.com',
    faxNumber: '(555) 111-2223',
    isActive: true
  },
  {
    id: 'pharmacy-2',
    name: 'MedCare Pharmacy',
    address: '456 Wellness Ave, Medical City, MC 12345',
    phone: '(555) 333-4444',
    email: 'contact@medcarepharmacy.com',
    faxNumber: '(555) 333-4445',
    isActive: true
  },
  {
    id: 'pharmacy-3',
    name: 'HealthPlus Pharmacy',
    address: '789 Care Blvd, Medical City, MC 12345',
    phone: '(555) 555-6666',
    email: 'support@healthpluspharmacy.com',
    faxNumber: '(555) 555-6667',
    isActive: true
  }
];

export const mockPrescriptionRefills: PrescriptionRefill[] = [
  {
    id: 'refill-1',
    patientId: 'patient-1',
    patientName: 'John Doe',
    medicationName: 'Lisinopril 10mg',
    dosage: '10mg',
    frequency: 'Once daily',
    originalPrescriptionId: 'rx-001',
    requestDate: '2024-01-15',
    status: 'pending',
    refillsRemaining: 2
  },
  {
    id: 'refill-2',
    patientId: 'patient-2',
    patientName: 'Jane Smith',
    medicationName: 'Metformin 500mg',
    dosage: '500mg',
    frequency: 'Twice daily',
    originalPrescriptionId: 'rx-002',
    requestDate: '2024-01-14',
    status: 'pending',
    refillsRemaining: 1
  },
  {
    id: 'refill-3',
    patientId: 'patient-3',
    patientName: 'Bob Johnson',
    medicationName: 'Amoxicillin 500mg',
    dosage: '500mg',
    frequency: 'Three times daily',
    originalPrescriptionId: 'rx-003',
    requestDate: '2024-01-13',
    status: 'approved',
    providerId: 'provider-1',
    pharmacyId: 'pharmacy-1',
    refillsRemaining: 0
  }
];

export const mockSecureMessages: SecureMessage[] = [
  {
    id: 'msg-1',
    senderId: 'patient-1',
    senderName: 'John Doe',
    senderType: 'patient',
    recipientId: 'provider-1',
    recipientName: 'Dr. Sarah Johnson',
    recipientType: 'provider',
    subject: 'Question about medication',
    content: 'I have a question about my new medication. Should I take it with food?',
    attachments: [],
    timestamp: '2024-01-15T10:30:00Z',
    isRead: false,
    deliveryStatus: 'delivered',
    encryptionStatus: 'encrypted'
  },
  {
    id: 'msg-2',
    senderId: 'provider-2',
    senderName: 'Dr. Michael Chen',
    senderType: 'provider',
    recipientId: 'provider-1',
    recipientName: 'Dr. Sarah Johnson',
    recipientType: 'provider',
    subject: 'Patient referral consultation',
    content: 'I am referring patient Jane Smith for cardiac evaluation. Please see attached EKG results.',
    attachments: [
      {
        id: 'att-1',
        filename: 'ekg_results.pdf',
        size: 1024000,
        type: 'application/pdf',
        url: '/mock/attachments/ekg_results.pdf'
      }
    ],
    timestamp: '2024-01-14T14:15:00Z',
    isRead: false,
    deliveryStatus: 'delivered',
    encryptionStatus: 'encrypted'
  }
];

// Service Provider Data Manager Class
export class ServiceProviderDataManager {
  private auditLogs: SecurityAuditLog[] = [];
  private sessionActivities: SessionActivity[] = [];

  // Provider Schedule Management
  generateScheduleForProvider(providerId: string, startDate: string, endDate: string): ScheduleDate[] {
    const provider = mockProviders.find(p => p.id === providerId);
    if (!provider) return [];

    const schedules: ScheduleDate[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dayName = date.toLocaleDateString('en-US', { weekday: 'lowercase' }) as keyof WeeklySchedule;
      const daySchedule = provider.availabilitySettings.weeklySchedule[dayName];
      
      if (daySchedule.isAvailable && !provider.availabilitySettings.blockedDates.includes(date.toISOString().split('T')[0])) {
        const timeSlots = this.generateTimeSlotsForDay(date.toISOString().split('T')[0], daySchedule, provider.availabilitySettings.defaultSlotDuration);
        schedules.push({
          date: date.toISOString().split('T')[0],
          timeSlots
        });
      }
    }
    
    return schedules;
  }

  private generateTimeSlotsForDay(date: string, daySchedule: DaySchedule, slotDuration: number): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const startTime = this.timeStringToMinutes(daySchedule.startTime);
    const endTime = this.timeStringToMinutes(daySchedule.endTime);
    
    for (let currentTime = startTime; currentTime < endTime; currentTime += slotDuration) {
      const slotStart = this.minutesToTimeString(currentTime);
      const slotEnd = this.minutesToTimeString(currentTime + slotDuration);
      
      // Check if slot conflicts with break times
      const isBreakTime = daySchedule.breakTimes.some(breakTime => {
        const breakStart = this.timeStringToMinutes(breakTime.startTime);
        const breakEnd = this.timeStringToMinutes(breakTime.endTime);
        return currentTime >= breakStart && currentTime < breakEnd;
      });
      
      if (!isBreakTime) {
        slots.push({
          id: `slot-${date}-${slotStart}`,
          startTime: slotStart,
          endTime: slotEnd,
          status: Math.random() > 0.3 ? 'available' : (Math.random() > 0.5 ? 'booked' : 'blocked'),
          notes: Math.random() > 0.8 ? 'Special consultation' : undefined
        });
      }
    }
    
    return slots;
  }

  private timeStringToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private minutesToTimeString(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  // Update provider schedule
  updateProviderSchedule(providerId: string, scheduleUpdate: Partial<ProviderSchedule>): boolean {
    const provider = mockProviders.find(p => p.id === providerId);
    if (!provider) return false;

    // Validate for conflicts
    if (scheduleUpdate.dates) {
      const hasConflicts = this.checkScheduleConflicts(scheduleUpdate.dates);
      if (hasConflicts) {
        throw new Error('Conflict in schedule, please resolve');
      }
    }

    // Update the schedule
    Object.assign(provider.schedule, scheduleUpdate);
    
    // Log the update
    this.logSecurityEvent('SCHEDULE_UPDATE', 'provider_schedule', providerId, 'Provider schedule updated');
    
    return true;
  }

  private checkScheduleConflicts(dates: ScheduleDate[]): boolean {
    // Simple conflict detection - check for overlapping time slots
    for (const date of dates) {
      const sortedSlots = date.timeSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));
      for (let i = 0; i < sortedSlots.length - 1; i++) {
        if (sortedSlots[i].endTime > sortedSlots[i + 1].startTime) {
          return true;
        }
      }
    }
    return false;
  }

  // Secure messaging
  sendSecureMessage(message: Omit<SecureMessage, 'id' | 'timestamp' | 'deliveryStatus' | 'encryptionStatus'>): SecureMessage {
    const newMessage: SecureMessage = {
      ...message,
      id: `msg-${Date.now()}`,
      timestamp: new Date().toISOString(),
      deliveryStatus: 'pending',
      encryptionStatus: 'encrypted'
    };

    // Simulate encryption and delivery
    setTimeout(() => {
      newMessage.deliveryStatus = Math.random() > 0.1 ? 'delivered' : 'failed';
    }, 1000);

    mockSecureMessages.push(newMessage);
    this.logSecurityEvent('MESSAGE_SENT', 'secure_message', newMessage.id, `Message sent to ${message.recipientType}`);
    
    return newMessage;
  }

  getMessagesForUser(userId: string, userType: 'provider' | 'patient' | 'receptionist'): SecureMessage[] {
    return mockSecureMessages.filter(msg => 
      (msg.senderId === userId && msg.senderType === userType) ||
      (msg.recipientId === userId && msg.recipientType === userType)
    );
  }

  // Prescription refill management
  getPendingRefills(): PrescriptionRefill[] {
    return mockPrescriptionRefills.filter(refill => refill.status === 'pending');
  }

  approveRefill(refillId: string, providerId: string, pharmacyId?: string): boolean {
    const refill = mockPrescriptionRefills.find(r => r.id === refillId);
    if (!refill) return false;

    refill.status = 'approved';
    refill.providerId = providerId;
    refill.pharmacyId = pharmacyId;
    
    // Log the approval
    this.logSecurityEvent('REFILL_APPROVED', 'prescription_refill', refillId, `Refill approved for ${refill.patientName}`);
    
    return true;
  }

  denyRefill(refillId: string, providerId: string, reason: string): boolean {
    const refill = mockPrescriptionRefills.find(r => r.id === refillId);
    if (!refill) return false;

    refill.status = 'denied';
    refill.providerId = providerId;
    refill.notes = reason;
    
    // Log the denial
    this.logSecurityEvent('REFILL_DENIED', 'prescription_refill', refillId, `Refill denied for ${refill.patientName}: ${reason}`);
    
    return true;
  }

  // Security and audit logging
  logSecurityEvent(action: string, resourceType: string, resourceId: string, details: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'low'): void {
    const auditLog: SecurityAuditLog = {
      id: `audit-${Date.now()}`,
      userId: 'current-user-id', // Would be replaced with actual user ID
      userRole: 'provider',
      action,
      resourceType,
      resourceId,
      timestamp: new Date().toISOString(),
      ipAddress: '192.168.1.100', // Mock IP
      userAgent: 'Mozilla/5.0 (Mock Browser)',
      details,
      severity
    };

    this.auditLogs.push(auditLog);
  }

  getAuditLogs(userId?: string): SecurityAuditLog[] {
    if (userId) {
      return this.auditLogs.filter(log => log.userId === userId);
    }
    return this.auditLogs;
  }

  // Session management
  trackSessionActivity(sessionId: string, userId: string): void {
    const activity: SessionActivity = {
      sessionId,
      userId,
      startTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Mock Browser)',
      isActive: true
    };

    this.sessionActivities.push(activity);
  }

  updateSessionActivity(sessionId: string): void {
    const activity = this.sessionActivities.find(a => a.sessionId === sessionId);
    if (activity) {
      activity.lastActivity = new Date().toISOString();
    }
  }

  endSession(sessionId: string, reason: 'manual' | 'timeout' | 'forced' = 'manual'): void {
    const activity = this.sessionActivities.find(a => a.sessionId === sessionId);
    if (activity) {
      activity.isActive = false;
      activity.logoutTime = new Date().toISOString();
      activity.logoutReason = reason;
    }
  }

  getActiveSessions(): SessionActivity[] {
    return this.sessionActivities.filter(activity => activity.isActive);
  }

  // Utility methods
  checkPasswordPolicy(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateDateRange(startDate: string, endDate: string): boolean {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return start >= today && end >= start;
  }
}

// Export singleton instance
export const serviceProviderDataManager = new ServiceProviderDataManager();