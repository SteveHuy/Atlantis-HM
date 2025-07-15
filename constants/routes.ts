// Route name mappings and constants
export const ROUTES = {
  HOME: '/',
  
  // Patient Routes
  PATIENT_LOGIN: '/patient/login',
  PATIENT_REGISTER: '/patient/register',
  PATIENT_DASHBOARD: '/patient/dashboard',
  PATIENT_PROFILE: '/patient/profile',
  
  // Dashboard Feature Routes (placeholders for future implementation)
  MEDICAL_RECORDS: '/patient/medical-records',
  APPOINTMENT_HISTORY: '/patient/appointments',
  APPOINTMENT_REMINDERS: '/patient/reminders',
  INSURANCE_DETAILS: '/patient/insurance',
  INSURANCE_CLAIMS: '/patient/claims',
  EMERGENCY_CONTACT: '/patient/emergency-contact',
  
  // Receptionist Routes
  RECEPTIONIST_LOGIN: '/receptionist/login',
  RECEPTIONIST_DASHBOARD: '/receptionist/dashboard',
  GENERATE_PATIENT_STATEMENTS: '/receptionist/generate-statements',
  GENERATE_DAILY_REPORTS: '/receptionist/daily-reports',
  
  // Provider Routes
  PROVIDER_LOGIN: '/provider/login',
  PROVIDER_DASHBOARD: '/provider/dashboard',
  CREATE_VISIT_SUMMARY: '/provider/visit-summary',
  ORDER_IMAGING_STUDIES: '/provider/imaging-studies',
  
  // Account Management
  ACCOUNT_RECOVERY: '/account/recover',
} as const;

// Dashboard feature mappings to Userdoc requirements
export const DASHBOARD_FEATURES = {
  MEDICAL_RECORDS: {
    route: ROUTES.MEDICAL_RECORDS,
    requirementRef: '#View Medical Records',
    title: 'Medical Records'
  },
  APPOINTMENT_HISTORY: {
    route: ROUTES.APPOINTMENT_HISTORY,
    requirementRef: '#View Appointment History',
    title: 'Appointment History'
  },
  APPOINTMENT_REMINDERS: {
    route: ROUTES.APPOINTMENT_REMINDERS,
    requirementRef: '#Manage Appointment Reminders',
    title: 'Appointment Reminders'
  },
  INSURANCE_DETAILS: {
    route: ROUTES.INSURANCE_DETAILS,
    requirementRef: '#Submit Insurance Details',
    title: 'Insurance Details'
  },
  INSURANCE_CLAIMS: {
    route: ROUTES.INSURANCE_CLAIMS,
    requirementRef: '#View Insurance Claims',
    title: 'Insurance Claims'
  },
  PROFILE_MANAGEMENT: {
    route: ROUTES.PATIENT_PROFILE,
    requirementRef: '#Profile Management',
    title: 'Profile Management'
  },
  EMERGENCY_CONTACT: {
    route: ROUTES.EMERGENCY_CONTACT,
    requirementRef: '#Update Emergency Contact',
    title: 'Emergency Contact'
  }
} as const;