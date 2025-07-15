export interface MockPatient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface MockAppointment {
  id: string;
  date: string;
  time: string;
  provider: string;
  location: string;
  type: string;
}

export interface MockActivity {
  id: string;
  action: string;
  timestamp: string;
  description: string;
  icon: string;
}

export interface MockInsuranceClaim {
  id: string;
  claimNumber: string;
  status: 'Pending' | 'Approved' | 'Denied' | 'Processing';
  amount: number;
  submittedDate: string;
  description: string;
}

export interface MockNotification {
  id: string;
  type: 'warning' | 'info' | 'success' | 'error';
  title: string;
  message: string;
  dismissible: boolean;
}

export const mockPatient: MockPatient = {
  id: "patient-001",
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  phone: "(555) 123-4567"
};

export const mockUpcomingAppointments: MockAppointment[] = [
  {
    id: "apt-001",
    date: "2025-01-16",
    time: "10:00 AM",
    provider: "Dr. Sarah Johnson",
    location: "Atlantis Medical Center - Room 205",
    type: "General Checkup"
  },
  {
    id: "apt-002", 
    date: "2025-01-22",
    time: "2:30 PM",
    provider: "Dr. Michael Chen",
    location: "Atlantis Specialty Clinic - Suite 401",
    type: "Cardiology Consultation"
  },
  {
    id: "apt-003",
    date: "2025-01-28",
    time: "9:15 AM", 
    provider: "Dr. Emily Rodriguez",
    location: "Atlantis Medical Center - Room 102",
    type: "Lab Work"
  }
];

export const mockRecentActivity: MockActivity[] = [
  {
    id: "act-001",
    action: "Scheduled Appointment",
    timestamp: "2025-01-14T14:30:00Z",
    description: "Scheduled cardiology consultation with Dr. Michael Chen",
    icon: "Calendar"
  },
  {
    id: "act-002",
    action: "Payment Made",
    timestamp: "2025-01-13T10:15:00Z", 
    description: "Payment of $125.00 for previous consultation",
    icon: "CreditCard"
  },
  {
    id: "act-003",
    action: "Medical Records Accessed",
    timestamp: "2025-01-12T16:45:00Z",
    description: "Viewed lab results from December 2024",
    icon: "FileText"
  },
  {
    id: "act-004",
    action: "Profile Updated",
    timestamp: "2025-01-11T11:20:00Z",
    description: "Updated emergency contact information",
    icon: "User"
  },
  {
    id: "act-005",
    action: "Insurance Claim Submitted",
    timestamp: "2025-01-10T09:30:00Z",
    description: "Submitted claim for December consultation",
    icon: "Shield"
  }
];

export const mockInsuranceClaims: MockInsuranceClaim[] = [
  {
    id: "claim-001",
    claimNumber: "CLM-2025-001234",
    status: "Approved",
    amount: 285.50,
    submittedDate: "2025-01-10",
    description: "General consultation and lab work"
  },
  {
    id: "claim-002", 
    claimNumber: "CLM-2025-001189",
    status: "Processing",
    amount: 450.00,
    submittedDate: "2025-01-08",
    description: "Specialist consultation - Cardiology"
  },
  {
    id: "claim-003",
    claimNumber: "CLM-2024-009876",
    status: "Pending",
    amount: 125.00,
    submittedDate: "2025-01-05",
    description: "Routine checkup and immunizations"
  }
];

export const mockNotifications: MockNotification[] = [
  {
    id: "notif-001",
    type: "warning",
    title: "Verify Your Email",
    message: "Please verify your email address to ensure you receive important updates.",
    dismissible: true
  },
  {
    id: "notif-002",
    type: "info", 
    title: "Unread Messages",
    message: "You have 2 unread messages from your healthcare providers.",
    dismissible: false
  }
];

export const dashboardFeatures = [
  {
    id: "messages",
    title: "Messages",
    description: "Secure communication with your healthcare providers",
    icon: "MessageSquare",
    color: "blue",
    requirementRef: "#Secure Messaging"
  },
  {
    id: "medical-records",
    title: "Medical Records",
    description: "View your complete medical history and test results",
    icon: "FileText",
    color: "green",
    requirementRef: "#View Medical Records"
  },
  {
    id: "appointment-history",
    title: "Appointment History", 
    description: "Review past and upcoming appointments",
    icon: "Calendar",
    color: "purple",
    requirementRef: "#View Appointment History"
  },
  {
    id: "appointment-reminders",
    title: "Appointment Reminders",
    description: "Manage your appointment notifications and reminders",
    icon: "Bell",
    color: "yellow",
    requirementRef: "#Manage Appointment Reminders"
  },
  {
    id: "insurance-details",
    title: "Insurance Details",
    description: "Submit and manage your insurance information",
    icon: "Shield",
    color: "gray",
    requirementRef: "#Submit Insurance Details"
  },
  {
    id: "make-payment",
    title: "Make Payment",
    description: "Pay your outstanding balances securely online",
    icon: "CreditCard",
    color: "blue",
    requirementRef: "#Make Payment"
  },
  {
    id: "payment-plans",
    title: "Payment Plans",
    description: "Setup and manage payment plans for your healthcare expenses",
    icon: "Calendar",
    color: "green",
    requirementRef: "#Manage Payment Plans"
  },
  {
    id: "billing-info",
    title: "Billing Information",
    description: "View billing details, transactions, and payment history",
    icon: "FileText",
    color: "indigo",
    requirementRef: "#View Patient Billing Info"
  }
];