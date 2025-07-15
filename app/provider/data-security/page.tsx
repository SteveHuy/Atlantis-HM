'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Shield, 
  ArrowLeft, 
  Lock,
  Eye,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  User,
  Activity,
  Key,
  Settings,
  Bell,
  LogOut
} from 'lucide-react';
import { sessionManager, type UserSession } from '@/lib/epic3-mock-data';
import { serviceProviderDataManager } from '@/lib/service-provider-mock-data';

interface SecurityMetric {
  id: string;
  title: string;
  value: string | number;
  status: 'good' | 'warning' | 'critical';
  description: string;
  icon: React.ComponentType<any>;
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userRole: string;
  action: string;
  resource: string;
  ipAddress: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: string;
}

const mockSecurityMetrics: SecurityMetric[] = [
  {
    id: 'session-timeout',
    title: 'Session Timeout',
    value: '30 minutes',
    status: 'good',
    description: 'Automatic session timeout is properly configured',
    icon: Clock
  },
  {
    id: 'encryption-status',
    title: 'Data Encryption',
    value: 'AES-256',
    status: 'good',
    description: 'All sensitive data is encrypted with AES-256',
    icon: Lock
  },
  {
    id: 'access-control',
    title: 'Role-Based Access',
    value: 'Active',
    status: 'good',
    description: 'Role-based access controls are enforced',
    icon: User
  },
  {
    id: 'audit-logging',
    title: 'Audit Logging',
    value: '100%',
    status: 'good',
    description: 'All user activities are logged',
    icon: FileText
  },
  {
    id: 'failed-logins',
    title: 'Failed Login Attempts',
    value: 3,
    status: 'warning',
    description: 'Recent failed login attempts detected',
    icon: AlertTriangle
  },
  {
    id: 'password-policy',
    title: 'Password Policy',
    value: 'Enforced',
    status: 'good',
    description: 'Strong password policy is active',
    icon: Key
  }
];

const mockAuditLogs: AuditLogEntry[] = [
  {
    id: 'audit-1',
    timestamp: '2024-01-20T10:30:00Z',
    userId: 'provider-1',
    userRole: 'provider',
    action: 'EHR_ACCESSED',
    resource: 'patient-1',
    ipAddress: '192.168.1.100',
    severity: 'medium',
    details: 'Accessed patient EHR for clinical consultation'
  },
  {
    id: 'audit-2',
    timestamp: '2024-01-20T09:15:00Z',
    userId: 'provider-2',
    userRole: 'provider',
    action: 'LOGIN_SUCCESS',
    resource: 'user_session',
    ipAddress: '192.168.1.101',
    severity: 'low',
    details: 'Successful login from authorized device'
  },
  {
    id: 'audit-3',
    timestamp: '2024-01-20T08:45:00Z',
    userId: 'unknown',
    userRole: 'unknown',
    action: 'LOGIN_FAILED',
    resource: 'user_session',
    ipAddress: '10.0.0.50',
    severity: 'high',
    details: 'Failed login attempt - incorrect credentials'
  },
  {
    id: 'audit-4',
    timestamp: '2024-01-20T08:30:00Z',
    userId: 'provider-1',
    userRole: 'provider',
    action: 'PRESCRIPTION_ORDERED',
    resource: 'medication_order',
    ipAddress: '192.168.1.100',
    severity: 'medium',
    details: 'Electronic prescription sent to pharmacy'
  }
];

export default function DataSecurityCompliancePage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Data state
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetric[]>(mockSecurityMetrics);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(mockAuditLogs);
  const [filteredLogs, setFilteredLogs] = useState<AuditLogEntry[]>(mockAuditLogs);
  
  // Filter state
  const [logFilter, setLogFilter] = useState<'all' | 'high' | 'critical'>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'audit' | 'settings' | 'training'>('overview');
  
  // UI state
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState(30);
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  useEffect(() => {
    const userSession = sessionManager.getSession();
    
    if (!userSession || userSession.role !== 'provider') {
      router.push('/provider/login');
      return;
    }
    
    setSession(userSession);
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    // Filter audit logs based on current filters
    let filtered = [...auditLogs];
    
    if (logFilter !== 'all') {
      filtered = filtered.filter(log => log.severity === logFilter);
    }
    
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate.toDateString() === filterDate.toDateString();
      });
    }
    
    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    setFilteredLogs(filtered);
  }, [logFilter, dateFilter, auditLogs]);

  const exportAuditLog = (format: 'csv' | 'pdf') => {
    if (!session) return;

    // Log the export action
    serviceProviderDataManager.logSecurityEvent(
      'AUDIT_LOG_EXPORTED',
      'security_audit',
      'export',
      `Audit log exported in ${format.toUpperCase()} format by ${session.fullName}`,
      'high'
    );

    // Mock export functionality
    alert(`Audit log exported in ${format.toUpperCase()} format (mock)`);
  };

  const testSessionTimeout = () => {
    // Mock session timeout test
    alert(`Session timeout test initiated. Current setting: ${sessionTimeoutMinutes} minutes`);
  };

  const runSecurityScan = () => {
    // Mock security scan
    alert('Security scan initiated. This will check for vulnerabilities and compliance issues.');
  };

  const forceLogout = () => {
    if (!session) return;

    // Log forced logout
    serviceProviderDataManager.logSecurityEvent(
      'FORCED_LOGOUT',
      'user_session',
      session.userId,
      'User initiated forced logout from security panel',
      'medium'
    );

    // Clear session and redirect
    sessionManager.clearSession();
    router.push('/provider/login?message=logged-out');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'text-blue-600 bg-blue-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/provider/dashboard')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-blue-600">Data Security & Compliance</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-green-600">
                <Shield className="h-4 w-4" />
                <span className="text-sm">HIPAA Compliant</span>
              </div>
              <span className="text-sm text-gray-600">
                {session.fullName}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Security Overview', icon: Shield },
              { id: 'audit', label: 'Audit Trail', icon: FileText },
              { id: 'settings', label: 'Security Settings', icon: Settings },
              { id: 'training', label: 'HIPAA Training', icon: User }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Security Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Security Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {securityMetrics.map((metric) => {
                const IconComponent = metric.icon;
                return (
                  <Card key={metric.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                          <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                          <p className="text-sm text-gray-500 mt-1">{metric.description}</p>
                        </div>
                        <div className={`p-3 rounded-full ${getStatusColor(metric.status)}`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Security Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Security Actions</CardTitle>
                <CardDescription>
                  Quick actions for security management and compliance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    onClick={runSecurityScan}
                    className="w-full justify-start"
                  >
                    <Activity className="mr-2 h-4 w-4" />
                    Run Security Scan
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => exportAuditLog('pdf')}
                    className="w-full justify-start"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export Audit Log
                  </Button>
                  <Button
                    variant="outline"
                    onClick={testSessionTimeout}
                    className="w-full justify-start"
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Test Session Timeout
                  </Button>
                  <Button
                    variant="outline"
                    onClick={forceLogout}
                    className="w-full justify-start text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Force Logout
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Compliance Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  HIPAA Compliance Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm">Data encryption at rest and in transit</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm">Role-based access controls implemented</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm">Comprehensive audit logging active</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm">Multi-factor authentication enforced</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm">Session timeout policies active</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm">Strong password policies enforced</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Audit Trail Tab */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            {/* Audit Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Audit Trail Filters</CardTitle>
                <CardDescription>
                  Filter audit logs by severity level and date
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-2">
                      Severity Level
                    </label>
                    <select
                      id="severity"
                      value={logFilter}
                      onChange={(e) => setLogFilter(e.target.value as any)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Levels</option>
                      <option value="high">High Priority</option>
                      <option value="critical">Critical Only</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                      Date Filter
                    </label>
                    <input
                      type="date"
                      id="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={() => exportAuditLog('csv')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export CSV
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Audit Log Entries */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity ({filteredLogs.length} entries)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredLogs.map((entry) => (
                    <div key={entry.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(entry.severity)}`}>
                            {entry.severity.toUpperCase()}
                          </span>
                          <span className="font-medium text-gray-900">{entry.action}</span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm text-gray-600 mb-2">
                        <div>User: {entry.userId}</div>
                        <div>Role: {entry.userRole}</div>
                        <div>Resource: {entry.resource}</div>
                        <div>IP: {entry.ipAddress}</div>
                      </div>
                      <p className="text-sm text-gray-700">{entry.details}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Security Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Session Management</CardTitle>
                <CardDescription>
                  Configure session timeout and security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="sessionTimeout" className="block text-sm font-medium text-gray-700 mb-2">
                    Session Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    id="sessionTimeout"
                    value={sessionTimeoutMinutes}
                    onChange={(e) => setSessionTimeoutMinutes(parseInt(e.target.value) || 30)}
                    min="5"
                    max="480"
                    className="w-full max-w-xs border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Automatically log out users after this period of inactivity
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="mfa"
                    checked={mfaEnabled}
                    onChange={(e) => setMfaEnabled(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="mfa" className="text-sm font-medium text-gray-700">
                    Require Multi-Factor Authentication
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="alerts"
                    checked={alertsEnabled}
                    onChange={(e) => setAlertsEnabled(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="alerts" className="text-sm font-medium text-gray-700">
                    Enable Security Alerts
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Password Policy</CardTitle>
                <CardDescription>
                  Current password requirements for all users
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Minimum 8 characters required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Must contain uppercase and lowercase letters</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Must contain at least one number</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Must contain at least one special character</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Account lockout after 5 failed attempts</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* HIPAA Training Tab */}
        {activeTab === 'training' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>HIPAA Compliance Training</CardTitle>
                <CardDescription>
                  Essential information for healthcare providers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Key HIPAA Requirements</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Protect patient health information (PHI) at all times</li>
                    <li>• Only access PHI when necessary for patient care</li>
                    <li>• Never share login credentials with others</li>
                    <li>• Report any suspected security incidents immediately</li>
                    <li>• Log out of systems when not in use</li>
                    <li>• Keep workstations secure and locked when unattended</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Data Handling Best Practices</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• All data is encrypted during transmission and storage</li>
                    <li>• Use secure messaging for all patient communications</li>
                    <li>• Verify patient identity before sharing information</li>
                    <li>• Follow minimum necessary standard for data access</li>
                    <li>• Document all access to patient records</li>
                    <li>• Report any unauthorized access attempts</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Security Incident Response</h3>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <span className="font-medium text-red-800">If you suspect a security incident:</span>
                    </div>
                    <ul className="space-y-1 text-sm text-red-700">
                      <li>1. Immediately secure the affected system</li>
                      <li>2. Document the incident details</li>
                      <li>3. Contact the IT security team</li>
                      <li>4. Do not attempt to fix the issue yourself</li>
                      <li>5. Follow organizational incident response procedures</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Contact Information</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>IT Security Team:</strong> security@atlantishms.com<br/>
                      <strong>HIPAA Compliance Officer:</strong> compliance@atlantishms.com<br/>
                      <strong>Emergency Contact:</strong> (555) 123-HELP
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}