// Epic 5 Mock Data - Receptionist Management Features
// For Atlantis HMS Webapp

export interface RejectedClaim {
  id: string;
  claimId: string;
  patientId: string;
  patientName: string;
  dateSubmitted: string;
  payer: string;
  originalAmount: number;
  denialReasons: string[];
  originalDetails: {
    procedureCode: string;
    procedureName: string;
    diagnosisCode: string;
    serviceDate: string;
    providerName: string;
    units: number;
  };
  adjustmentDetails?: {
    procedureCode?: string;
    amount?: number;
    notes?: string;
  };
  status: 'rejected' | 'under_review' | 'appealed' | 'resubmitted';
  auditTrail: AuditEntry[];
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  userId: string;
  userRole: string;
  details: string;
}

export interface PhoneInquiry {
  id: string;
  callerName: string;
  callerPhone: string;
  reason: string;
  patientId?: string;
  patientFound: boolean;
  appointmentActions: string[];
  callNotes: string;
  transferredTo?: string;
  transferNotes?: string;
  followUpMethod?: 'sms' | 'email' | 'none';
  referenceNumber: string;
  timestamp: string;
  receptionistId: string;
}

export interface AppointmentRequest {
  id: string;
  patientId: string;
  patientName: string;
  appointmentType: string;
  preferredProvider: string;
  alternativeProviders?: string[];
  requestedDate: string;
  requestedTime: string;
  notes?: string;
  status: 'pending' | 'approved' | 'declined';
  submittedAt: string;
  processedAt?: string;
  processedBy?: string;
  declineReason?: string;
}

export interface CalendarAppointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  providerId: string;
  providerName: string;
  serviceType: string;
  date: string;
  time: string;
  duration: number; // minutes
  location: string;
  status: 'scheduled' | 'confirmed' | 'checked-in' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WaitlistEntry {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  preferredProvider: string;
  preferredService: string;
  dateRange: {
    start: string;
    end: string;
  };
  timePreferences: string[];
  addedAt: string;
  position: number;
  notified: boolean;
  status: 'active' | 'notified' | 'scheduled' | 'expired';
}

export interface TodayAppointmentCheckIn {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  providerName: string;
  serviceType: string;
  scheduledTime: string;
  status: 'scheduled' | 'checked-in' | 'completed' | 'cancelled';
  checkInTime?: string;
  checkInBy?: string;
  canCheckIn: boolean;
}

// Mock Data
export const mockRejectedClaims: RejectedClaim[] = [
  {
    id: 'rc001',
    claimId: 'CLM-2024-001',
    patientId: 'P001',
    patientName: 'Sarah Johnson',
    dateSubmitted: '2024-01-15',
    payer: 'Blue Cross Blue Shield',
    originalAmount: 250.00,
    denialReasons: ['Invalid procedure code', 'Missing prior authorization'],
    originalDetails: {
      procedureCode: '99213',
      procedureName: 'Office Visit - Established Patient',
      diagnosisCode: 'Z00.00',
      serviceDate: '2024-01-10',
      providerName: 'Dr. Smith',
      units: 1
    },
    status: 'rejected',
    auditTrail: [
      {
        id: 'at001',
        timestamp: '2024-01-15T10:30:00Z',
        action: 'Claim Submitted',
        userId: 'R001',
        userRole: 'Receptionist',
        details: 'Initial claim submission'
      },
      {
        id: 'at002',
        timestamp: '2024-01-20T14:15:00Z',
        action: 'Claim Rejected',
        userId: 'SYS',
        userRole: 'System',
        details: 'Rejected by Blue Cross Blue Shield'
      }
    ]
  },
  {
    id: 'rc002',
    claimId: 'CLM-2024-002',
    patientId: 'P002',
    patientName: 'Michael Brown',
    dateSubmitted: '2024-01-18',
    payer: 'Aetna',
    originalAmount: 450.00,
    denialReasons: ['Service not covered', 'Exceeds annual limit'],
    originalDetails: {
      procedureCode: '90834',
      procedureName: 'Psychotherapy Session',
      diagnosisCode: 'F32.9',
      serviceDate: '2024-01-15',
      providerName: 'Dr. Wilson',
      units: 1
    },
    status: 'rejected',
    auditTrail: [
      {
        id: 'at003',
        timestamp: '2024-01-18T09:00:00Z',
        action: 'Claim Submitted',
        userId: 'R002',
        userRole: 'Receptionist',
        details: 'Initial claim submission'
      }
    ]
  }
];

export const mockPhoneInquiries: PhoneInquiry[] = [
  {
    id: 'pi001',
    callerName: 'Jennifer Davis',
    callerPhone: '(555) 123-4567',
    reason: 'Reschedule appointment',
    patientId: 'P003',
    patientFound: true,
    appointmentActions: ['Rescheduled from 2024-02-15 to 2024-02-20'],
    callNotes: 'Patient needs to reschedule due to work conflict',
    followUpMethod: 'sms',
    referenceNumber: 'REF-240201-001',
    timestamp: '2024-02-01T11:30:00Z',
    receptionistId: 'R001'
  }
];

export const mockAppointmentRequests: AppointmentRequest[] = [
  {
    id: 'ar001',
    patientId: 'P004',
    patientName: 'David Wilson',
    appointmentType: 'General Consultation',
    preferredProvider: 'Dr. Smith',
    requestedDate: '2024-02-15',
    requestedTime: '10:00 AM',
    notes: 'Follow-up for blood pressure monitoring',
    status: 'pending',
    submittedAt: '2024-02-01T08:00:00Z'
  },
  {
    id: 'ar002',
    patientId: 'P005',
    patientName: 'Lisa Anderson',
    appointmentType: 'Dermatology',
    preferredProvider: 'Dr. Johnson',
    requestedDate: '2024-02-12',
    requestedTime: '2:00 PM',
    status: 'pending',
    submittedAt: '2024-01-30T14:30:00Z'
  }
];

export const mockCalendarAppointments: CalendarAppointment[] = [
  {
    id: 'ca001',
    patientId: 'P001',
    patientName: 'Sarah Johnson',
    patientPhone: '(555) 111-2222',
    providerId: 'PR001',
    providerName: 'Dr. Smith',
    serviceType: 'General Consultation',
    date: '2024-02-10',
    time: '09:00',
    duration: 30,
    location: 'Room 101',
    status: 'scheduled',
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-02-01T10:00:00Z'
  },
  {
    id: 'ca002',
    patientId: 'P002',
    patientName: 'Michael Brown',
    patientPhone: '(555) 333-4444',
    providerId: 'PR002',
    providerName: 'Dr. Wilson',
    serviceType: 'Cardiology',
    date: '2024-02-10',
    time: '10:30',
    duration: 45,
    location: 'Room 203',
    status: 'confirmed',
    createdAt: '2024-01-25T14:00:00Z',
    updatedAt: '2024-02-01T09:00:00Z'
  }
];

export const mockWaitlistEntries: WaitlistEntry[] = [
  {
    id: 'wl001',
    patientId: 'P006',
    patientName: 'Emma Thompson',
    patientPhone: '(555) 777-8888',
    preferredProvider: 'Dr. Smith',
    preferredService: 'General Consultation',
    dateRange: {
      start: '2024-02-12',
      end: '2024-02-16'
    },
    timePreferences: ['Morning', 'Afternoon'],
    addedAt: '2024-02-01T16:00:00Z',
    position: 1,
    notified: false,
    status: 'active'
  }
];

export const mockTodayAppointments: TodayAppointmentCheckIn[] = [
  {
    id: 'tac001',
    appointmentId: 'ca001',
    patientId: 'P001',
    patientName: 'Sarah Johnson',
    patientPhone: '(555) 111-2222',
    providerName: 'Dr. Smith',
    serviceType: 'General Consultation',
    scheduledTime: '09:00',
    status: 'scheduled',
    canCheckIn: true
  },
  {
    id: 'tac002',
    appointmentId: 'ca002',
    patientId: 'P002',
    patientName: 'Michael Brown',
    patientPhone: '(555) 333-4444',
    providerName: 'Dr. Wilson',
    serviceType: 'Cardiology',
    scheduledTime: '10:30',
    status: 'checked-in',
    checkInTime: '10:25',
    checkInBy: 'R001',
    canCheckIn: false
  }
];

// Mock Data Management Class
export class Epic5MockDataManager {
  // Rejected Claims Management
  static getAllRejectedClaims(): RejectedClaim[] {
    return [...mockRejectedClaims];
  }

  static getRejectedClaimById(id: string): RejectedClaim | null {
    return mockRejectedClaims.find(claim => claim.id === id) || null;
  }

  static updateClaimAdjustments(claimId: string, adjustments: any): boolean {
    const claim = mockRejectedClaims.find(c => c.id === claimId);
    if (claim) {
      claim.adjustmentDetails = adjustments;
      claim.auditTrail.push({
        id: `at${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'Claim Adjusted',
        userId: 'R001',
        userRole: 'Receptionist',
        details: 'Claim details adjusted for resubmission'
      });
      return true;
    }
    return false;
  }

  static resubmitClaim(claimId: string): boolean {
    const claim = mockRejectedClaims.find(c => c.id === claimId);
    if (claim) {
      claim.status = 'resubmitted';
      claim.auditTrail.push({
        id: `at${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'Claim Resubmitted',
        userId: 'R001',
        userRole: 'Receptionist',
        details: 'Claim resubmitted to payer'
      });
      return true;
    }
    return false;
  }

  static submitAppeal(claimId: string, appealLetter: string): boolean {
    const claim = mockRejectedClaims.find(c => c.id === claimId);
    if (claim) {
      claim.status = 'appealed';
      claim.auditTrail.push({
        id: `at${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'Appeal Submitted',
        userId: 'R001',
        userRole: 'Receptionist',
        details: `Appeal submitted: ${appealLetter.substring(0, 100)}...`
      });
      return true;
    }
    return false;
  }

  // Phone Inquiries Management
  static createPhoneInquiry(inquiry: Omit<PhoneInquiry, 'id' | 'referenceNumber' | 'timestamp'>): PhoneInquiry {
    const newInquiry: PhoneInquiry = {
      ...inquiry,
      id: `pi${Date.now()}`,
      referenceNumber: `REF-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      timestamp: new Date().toISOString()
    };
    mockPhoneInquiries.push(newInquiry);
    return newInquiry;
  }

  static searchPatientByNameOrPhone(query: string): any[] {
    // Mock patient search results
    const mockPatients = [
      { id: 'P001', name: 'Sarah Johnson', phone: '(555) 111-2222' },
      { id: 'P002', name: 'Michael Brown', phone: '(555) 333-4444' },
      { id: 'P003', name: 'Jennifer Davis', phone: '(555) 123-4567' }
    ];
    
    return mockPatients.filter(patient => 
      patient.name.toLowerCase().includes(query.toLowerCase()) ||
      patient.phone.includes(query)
    );
  }

  // Appointment Requests Management
  static getAllPendingRequests(): AppointmentRequest[] {
    return mockAppointmentRequests.filter(req => req.status === 'pending');
  }

  static approveAppointmentRequest(requestId: string): boolean {
    const request = mockAppointmentRequests.find(r => r.id === requestId);
    if (request) {
      request.status = 'approved';
      request.processedAt = new Date().toISOString();
      request.processedBy = 'R001';
      return true;
    }
    return false;
  }

  static declineAppointmentRequest(requestId: string, reason?: string): boolean {
    const request = mockAppointmentRequests.find(r => r.id === requestId);
    if (request) {
      request.status = 'declined';
      request.processedAt = new Date().toISOString();
      request.processedBy = 'R001';
      request.declineReason = reason;
      return true;
    }
    return false;
  }

  // Calendar Management
  static getAllAppointments(): CalendarAppointment[] {
    return [...mockCalendarAppointments];
  }

  static createAppointment(appointment: Omit<CalendarAppointment, 'id' | 'createdAt' | 'updatedAt'>): CalendarAppointment {
    const newAppointment: CalendarAppointment = {
      ...appointment,
      id: `ca${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockCalendarAppointments.push(newAppointment);
    return newAppointment;
  }

  static updateAppointment(id: string, updates: Partial<CalendarAppointment>): boolean {
    const index = mockCalendarAppointments.findIndex(a => a.id === id);
    if (index !== -1) {
      mockCalendarAppointments[index] = {
        ...mockCalendarAppointments[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      return true;
    }
    return false;
  }

  static cancelAppointment(id: string): boolean {
    return this.updateAppointment(id, { status: 'cancelled' });
  }

  // Waitlist Management
  static addToWaitlist(entry: Omit<WaitlistEntry, 'id' | 'addedAt' | 'position'>): WaitlistEntry {
    const newEntry: WaitlistEntry = {
      ...entry,
      id: `wl${Date.now()}`,
      addedAt: new Date().toISOString(),
      position: mockWaitlistEntries.length + 1
    };
    mockWaitlistEntries.push(newEntry);
    return newEntry;
  }

  static getWaitlistEntries(): WaitlistEntry[] {
    return [...mockWaitlistEntries];
  }

  // Check-in Management
  static getTodayAppointments(): TodayAppointmentCheckIn[] {
    return [...mockTodayAppointments];
  }

  static checkInPatient(appointmentId: string): boolean {
    const appointment = mockTodayAppointments.find(a => a.id === appointmentId);
    if (appointment && appointment.canCheckIn) {
      appointment.status = 'checked-in';
      appointment.checkInTime = new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      appointment.checkInBy = 'R001';
      appointment.canCheckIn = false;
      return true;
    }
    return false;
  }

  static searchTodayAppointments(query: string): TodayAppointmentCheckIn[] {
    return mockTodayAppointments.filter(apt => 
      apt.patientName.toLowerCase().includes(query.toLowerCase()) ||
      apt.appointmentId.toLowerCase().includes(query.toLowerCase())
    );
  }
}

// Mock providers and services for forms
export const mockProviders = [
  { id: 'PR001', name: 'Dr. Smith', specialty: 'General Medicine' },
  { id: 'PR002', name: 'Dr. Wilson', specialty: 'Cardiology' },
  { id: 'PR003', name: 'Dr. Johnson', specialty: 'Dermatology' },
  { id: 'PR004', name: 'Dr. Davis', specialty: 'Pediatrics' }
];

export const mockServices = [
  'General Consultation',
  'Follow-up Visit',
  'Physical Exam',
  'Cardiology Consultation',
  'Dermatology Consultation',
  'Pediatric Visit',
  'Preventive Care',
  'Urgent Care'
];

export const mockLocations = [
  'Room 101',
  'Room 102', 
  'Room 201',
  'Room 202',
  'Room 203',
  'Consultation Room A',
  'Consultation Room B'
];

export const mockDepartments = [
  'Billing',
  'Medical Records',
  'Pharmacy',
  'Laboratory',
  'Radiology',
  'Administration',
  'Patient Services'
];