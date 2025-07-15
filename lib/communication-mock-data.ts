// Communication Mock Data System
// Provides comprehensive mock data for all 4 communication features

export interface SecureMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'patient' | 'provider' | 'receptionist';
  recipientId: string;
  recipientName: string;
  recipientRole: 'patient' | 'provider' | 'receptionist';
  subject?: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  isEncrypted: boolean;
  threadId?: string;
  attachments?: MessageAttachment[];
  priority?: 'low' | 'medium' | 'high';
  status: 'sent' | 'delivered' | 'read';
}

export interface MessageAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadDate: Date;
}

export interface CommunicationLog {
  id: string;
  patientId: string;
  patientName: string;
  receptionistId: string;
  receptionistName: string;
  communicationType: 'phone' | 'email' | 'in-person' | 'secure-message' | 'other';
  details: string;
  timestamp: Date;
  loggedAt: Date;  
}

export interface Provider {
  id: string;
  name: string;
  specialty: string;
  department: string;
  isActive: boolean;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
}

export interface Staff {
  id: string;
  name: string;
  role: 'receptionist' | 'nurse' | 'admin';
  department: string;
  isActive: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  details: string;
  timestamp: Date;
  ipAddress?: string;
  sessionId?: string;
}

// Mock data
const mockProviders: Provider[] = [
  { id: 'provider-1', name: 'Dr. Sarah Johnson', specialty: 'Cardiology', department: 'Heart Center', isActive: true },
  { id: 'provider-2', name: 'Dr. Michael Chen', specialty: 'Family Medicine', department: 'Primary Care', isActive: true },
  { id: 'provider-3', name: 'Dr. Emily Rodriguez', specialty: 'Orthopedics', department: 'Surgery', isActive: true },
  { id: 'provider-4', name: 'Dr. David Kim', specialty: 'Dermatology', department: 'Outpatient', isActive: true },
  { id: 'provider-5', name: 'Dr. Lisa Thompson', specialty: 'Pediatrics', department: 'Children\'s Center', isActive: true },
];

const mockPatients: Patient[] = [
  { id: 'patient-1', name: 'John Doe', email: 'john.doe@email.com', phone: '555-0101', isActive: true },
  { id: 'patient-2', name: 'Jane Smith', email: 'jane.smith@email.com', phone: '555-0102', isActive: true },
  { id: 'patient-3', name: 'Robert Johnson', email: 'robert.j@email.com', phone: '555-0103', isActive: true },
  { id: 'patient-4', name: 'Maria Garcia', email: 'maria.garcia@email.com', phone: '555-0104', isActive: true },
  { id: 'patient-5', name: 'William Brown', email: 'william.brown@email.com', phone: '555-0105', isActive: true },
];

const mockStaff: Staff[] = [
  { id: 'staff-1', name: 'Jennifer Adams', role: 'receptionist', department: 'Front Desk', isActive: true },
  { id: 'staff-2', name: 'Mark Wilson', role: 'receptionist', department: 'Front Desk', isActive: true },
  { id: 'staff-3', name: 'Sarah Davis', role: 'nurse', department: 'Primary Care', isActive: true },
  { id: 'staff-4', name: 'Thomas Miller', role: 'admin', department: 'Administration', isActive: true },
];

const mockMessages: SecureMessage[] = [
  {
    id: 'msg-1',
    senderId: 'patient-1',
    senderName: 'John Doe',
    senderRole: 'patient',
    recipientId: 'provider-1',
    recipientName: 'Dr. Sarah Johnson',
    recipientRole: 'provider',
    subject: 'Question about test results',
    content: 'Hi Dr. Johnson, I received my blood test results and had a question about my cholesterol levels. Could you please clarify what the numbers mean?',
    timestamp: new Date('2025-01-10T14:30:00'),
    isRead: false,
    isEncrypted: true,
    threadId: 'thread-1',
    priority: 'medium',
    status: 'delivered'
  },
  {
    id: 'msg-2',
    senderId: 'provider-2',
    senderName: 'Dr. Michael Chen',
    senderRole: 'provider',
    recipientId: 'patient-2',
    recipientName: 'Jane Smith',
    recipientRole: 'patient',
    subject: 'Follow-up appointment reminder',
    content: 'Hello Jane, this is a reminder for your follow-up appointment next week. Please remember to bring your medication list.',
    timestamp: new Date('2025-01-12T09:15:00'),
    isRead: true,
    isEncrypted: true,
    threadId: 'thread-2',
    priority: 'low',
    status: 'read'
  },
  {
    id: 'msg-3',
    senderId: 'staff-1',
    senderName: 'Jennifer Adams',
    senderRole: 'receptionist',
    recipientId: 'provider-3',
    recipientName: 'Dr. Emily Rodriguez',
    recipientRole: 'provider',
    subject: 'Patient scheduling request',
    content: 'Dr. Rodriguez, we have a patient requesting an urgent consultation for knee pain. Are you available this Friday afternoon?',
    timestamp: new Date('2025-01-13T11:45:00'),
    isRead: false,
    isEncrypted: true,
    threadId: 'thread-3',
    priority: 'high',
    status: 'sent'
  }
];

const mockCommunicationLogs: CommunicationLog[] = [
  {
    id: 'log-1',
    patientId: 'patient-1',
    patientName: 'John Doe',
    receptionistId: 'staff-1',
    receptionistName: 'Jennifer Adams',
    communicationType: 'phone',
    details: 'Patient called to inquire about appointment availability. Scheduled for next Tuesday at 2 PM with Dr. Johnson.',
    timestamp: new Date('2025-01-14T10:30:00'),
    loggedAt: new Date('2025-01-14T10:35:00')
  },
  {
    id: 'log-2',
    patientId: 'patient-2',
    patientName: 'Jane Smith',
    receptionistId: 'staff-1',
    receptionistName: 'Jennifer Adams',
    communicationType: 'in-person',
    details: 'Patient visited front desk to update insurance information. Provided new insurance card and verified coverage.',
    timestamp: new Date('2025-01-13T14:15:00'),
    loggedAt: new Date('2025-01-13T14:20:00')
  },
  {
    id: 'log-3',
    patientId: 'patient-3',
    patientName: 'Robert Johnson',
    receptionistId: 'staff-2',
    receptionistName: 'Mark Wilson',
    communicationType: 'email',
    details: 'Patient emailed requesting prescription refill. Forwarded request to Dr. Chen for approval.',
    timestamp: new Date('2025-01-12T16:45:00'),
    loggedAt: new Date('2025-01-12T16:50:00')
  }
];

const mockAuditLogs: AuditLog[] = [
  {
    id: 'audit-1',
    userId: 'patient-1',
    userName: 'John Doe',
    userRole: 'patient',
    action: 'SECURE_MESSAGE_SENT',
    details: 'Sent secure message to Dr. Sarah Johnson regarding test results',
    timestamp: new Date('2025-01-14T10:30:00'),
    sessionId: 'session-123'
  },
  {
    id: 'audit-2',
    userId: 'staff-1',
    userName: 'Jennifer Adams',
    userRole: 'receptionist',
    action: 'COMMUNICATION_LOGGED',
    details: 'Logged phone communication with patient John Doe',
    timestamp: new Date('2025-01-14T10:35:00'),
    sessionId: 'session-456'
  }
];

class CommunicationDataManager {
  private messages: SecureMessage[] = [...mockMessages];
  private communicationLogs: CommunicationLog[] = [...mockCommunicationLogs];
  private auditLogs: AuditLog[] = [...mockAuditLogs];

  // Providers
  getProviders(): Provider[] {
    return mockProviders.filter(p => p.isActive);
  }

  getProviderById(id: string): Provider | undefined {
    return mockProviders.find(p => p.id === id);
  }

  // Patients
  getPatients(): Patient[] {
    return mockPatients.filter(p => p.isActive);
  }

  getPatientById(id: string): Patient | undefined {
    return mockPatients.find(p => p.id === id);
  }

  validatePatientId(patientId: string): boolean {
    return mockPatients.some(p => p.id === patientId);
  }

  // Staff
  getStaff(): Staff[] {
    return mockStaff.filter(s => s.isActive);
  }

  getStaffById(id: string): Staff | undefined {
    return mockStaff.find(s => s.id === id);
  }

  // Messages
  getMessages(): SecureMessage[] {
    return this.messages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getMessagesByUser(userId: string): SecureMessage[] {
    return this.messages.filter(m => 
      m.senderId === userId || m.recipientId === userId
    ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getMessagesByThread(threadId: string): SecureMessage[] {
    return this.messages.filter(m => m.threadId === threadId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  sendMessage(message: Omit<SecureMessage, 'id' | 'timestamp' | 'isEncrypted' | 'status'>): SecureMessage {
    const newMessage: SecureMessage = {
      ...message,
      id: `msg-${Date.now()}`,
      timestamp: new Date(),
      isEncrypted: true,
      status: 'sent'
    };

    this.messages.push(newMessage);
    this.logAudit(
      message.senderId,
      message.senderName,
      message.senderRole,
      'SECURE_MESSAGE_SENT',
      `Sent secure message to ${message.recipientName}`
    );

    return newMessage;
  }

  markMessageAsRead(messageId: string): void {
    const message = this.messages.find(m => m.id === messageId);
    if (message) {
      message.isRead = true;
      message.status = 'read';
    }
  }

  // Communication Logs
  getCommunicationLogs(): CommunicationLog[] {
    return this.communicationLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getCommunicationLogsByPatient(patientId: string): CommunicationLog[] {
    return this.communicationLogs.filter(log => log.patientId === patientId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  logCommunication(log: Omit<CommunicationLog, 'id' | 'loggedAt'>): CommunicationLog {
    const newLog: CommunicationLog = {
      ...log,
      id: `log-${Date.now()}`,
      loggedAt: new Date()
    };

    this.communicationLogs.push(newLog);
    this.logAudit(
      log.receptionistId,
      log.receptionistName,
      'receptionist',
      'COMMUNICATION_LOGGED',
      `Logged ${log.communicationType} communication with patient ${log.patientName}`
    );

    return newLog;
  }

  // Audit Logging
  logAudit(userId: string, userName: string, userRole: string, action: string, details: string): void {
    const auditLog: AuditLog = {
      id: `audit-${Date.now()}`,
      userId,
      userName,
      userRole,
      action,
      details,
      timestamp: new Date(),
      sessionId: `session-${Date.now()}`
    };

    this.auditLogs.push(auditLog);
  }

  getAuditLogs(): AuditLog[] {
    return this.auditLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Utility functions
  generateThreadId(): string {
    return `thread-${Date.now()}`;
  }

  encryptMessage(content: string): string {
    // Mock encryption - in real implementation would use proper encryption
    return btoa(content).split('').reverse().join('');
  }

  decryptMessage(encryptedContent: string): string {
    // Mock decryption - in real implementation would use proper decryption
    return atob(encryptedContent.split('').reverse().join(''));
  }

  validateFileAttachment(file: File): { isValid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (file.size > maxSize) {
      return { isValid: false, error: 'File size exceeds 5MB limit' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Invalid file type. Allowed: images, PDF, Word documents, text files' };
    }

    return { isValid: true };
  }

  // HIPAA Compliance helpers
  isHIPAACompliant(): boolean {
    return true; // Mock compliance check
  }

  getPrivacyNotice(): string {
    return 'All communications are encrypted and HIPAA compliant. This system maintains audit trails for all message activities. Unauthorized access is prohibited.';
  }
}

export const communicationDataManager = new CommunicationDataManager();
export default communicationDataManager;