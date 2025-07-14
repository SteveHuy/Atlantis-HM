export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface Appointment {
  id: string;
  date: string;
  time: string;
  provider: string;
  location: string;
  type: string;
}

export interface Activity {
  id: string;
  action: string;
  timestamp: string;
  description: string;
  icon: string;
}

export interface InsuranceClaim {
  id: string;
  claimNumber: string;
  status: 'Pending' | 'Approved' | 'Denied' | 'Processing';
  amount: number;
  submittedDate: string;
  description: string;
}

export interface Notification {
  id: string;
  type: 'warning' | 'info' | 'success' | 'error';
  title: string;
  message: string;
  dismissible: boolean;
}

export interface DashboardFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  requirementRef: string;
}