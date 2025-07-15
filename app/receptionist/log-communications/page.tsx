'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, Clock, User, AlertCircle, Search, Filter, Phone, Mail, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { communicationDataManager, CommunicationLog, Patient } from '@/lib/communication-mock-data';
import { communicationLogSchema, CommunicationLogFormData } from '@/lib/communication-validation';
import { sessionManager } from '@/lib/session-manager';

interface LogFormProps {
  onLogCommunication: (logData: CommunicationLogFormData) => void;
  patients: Patient[];
}

const LogForm: React.FC<LogFormProps> = ({ onLogCommunication, patients }) => {
  const [formData, setFormData] = useState<CommunicationLogFormData>({
    patientId: '',
    communicationType: 'phone',
    details: '',
    timestamp: new Date()
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate patient ID exists
      if (!communicationDataManager.validatePatientId(formData.patientId)) {
        setErrors({ patientId: 'Invalid Patient ID' });
        return;
      }

      const validatedData = communicationLogSchema.parse(formData);
      onLogCommunication(validatedData);
      
      // Reset form
      setFormData({
        patientId: '',
        communicationType: 'phone',
        details: '',
        timestamp: new Date()
      });
      setSelectedPatient(null);
      setErrors({});
    } catch (error: any) {
      if (error.errors) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          newErrors[err.path[0]] = err.message;
        });
        setErrors(newErrors);
      }
    }
  };

  const handlePatientIdChange = (value: string) => {
    setFormData(prev => ({ ...prev, patientId: value }));
    
    // Find and set selected patient
    const patient = patients.find(p => p.id === value);
    setSelectedPatient(patient || null);
    
    // Clear patient ID error if valid
    if (communicationDataManager.validatePatientId(value)) {
      setErrors(prev => ({ ...prev, patientId: '' }));
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'secure-message': return <MessageSquare className="h-4 w-4" />;
      case 'in-person': return <User className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Log Patient Communication</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Patient ID *</label>
            <div className="flex space-x-2">
              <select
                value={formData.patientId}
                onChange={(e) => handlePatientIdChange(e.target.value)}
                className="flex-1 border rounded-md px-3 py-2"
                required
              >
                <option value="">Select a patient</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.id} - {patient.name}
                  </option>
                ))}
              </select>
            </div>
            {errors.patientId && (
              <p className="text-red-500 text-sm mt-1">{errors.patientId}</p>
            )}
          </div>

          {selectedPatient && (
            <div className="bg-blue-50 p-3 rounded-md">
              <h4 className="font-medium text-blue-900">Patient Information</h4>
              <p className="text-sm text-blue-800">
                <strong>Name:</strong> {selectedPatient.name}<br />
                <strong>Email:</strong> {selectedPatient.email}<br />
                <strong>Phone:</strong> {selectedPatient.phone}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Communication Type *</label>
            <select
              value={formData.communicationType}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                communicationType: e.target.value as any
              }))}
              className="w-full border rounded-md px-3 py-2"
              required
            >
              <option value="phone">Phone Call</option>
              <option value="email">Email</option>
              <option value="in-person">In-Person</option>
              <option value="secure-message">Secure Message</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Communication Details *</label>
            <Textarea
              value={formData.details}
              onChange={(e) => setFormData(prev => ({ ...prev, details: e.target.value }))}
              placeholder="Enter detailed description of the communication (max 2048 characters)"
              maxLength={2048}
              rows={6}
              required
            />
            <p className="text-sm text-gray-500 mt-1">{formData.details?.length || 0}/2048 characters</p>
            {errors.details && (
              <p className="text-red-500 text-sm mt-1">{errors.details}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Timestamp</label>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Auto-generated: {new Date().toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-yellow-50 p-3 rounded-md">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Role-Based Access</p>
                <p>This communication logging is restricted to authorized receptionist personnel only. All entries are maintained in the User Activity Logs with full audit trail.</p>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full flex items-center justify-center space-x-2"
            disabled={!formData.patientId || !formData.details.trim()}
          >
            <FileText className="h-4 w-4" />
            <span>Log Communication</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

interface LogHistoryProps {
  logs: CommunicationLog[];
  onLogClick: (log: CommunicationLog) => void;
  onFilter: (filters: any) => void;
}

const LogHistory: React.FC<LogHistoryProps> = ({ logs, onLogClick, onFilter }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || log.communicationType === typeFilter;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'secure-message': return <MessageSquare className="h-4 w-4" />;
      case 'in-person': return <User className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'phone': return 'bg-blue-100 text-blue-800';
      case 'email': return 'bg-green-100 text-green-800';
      case 'secure-message': return 'bg-purple-100 text-purple-800';
      case 'in-person': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Communication History</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-1" />
            Filters
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by patient name or details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Communication Type</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="">All Types</option>
                    <option value="phone">Phone Call</option>
                    <option value="email">Email</option>
                    <option value="in-person">In-Person</option>
                    <option value="secure-message">Secure Message</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Logs List */}
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No Communication Logs</h3>
                <p>No communication logs found matching your criteria.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredLogs.map((log) => (
                <div 
                  key={log.id}
                  className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => onLogClick(log)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getTypeIcon(log.communicationType)}
                        <span className="font-medium">{log.patientName}</span>
                        <Badge className={`text-xs ${getTypeBadgeColor(log.communicationType)}`}>
                          {log.communicationType.replace('-', ' ')}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {log.details}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {log.timestamp.toLocaleDateString()} {log.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <span>Logged by: {log.receptionistName}</span>
                        </div>
                        <span>Patient ID: {log.patientId}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const LogDetailModal: React.FC<{
  log: CommunicationLog | null;
  isOpen: boolean;
  onClose: () => void;
}> = ({ log, isOpen, onClose }) => {
  if (!isOpen || !log) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'secure-message': return <MessageSquare className="h-4 w-4" />;
      case 'in-person': return <User className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Communication Log Details</h2>
          <Button variant="ghost" onClick={onClose}>×</Button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Patient Information</h4>
              <p className="text-sm text-gray-600">
                <strong>Name:</strong> {log.patientName}<br />
                <strong>ID:</strong> {log.patientId}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Communication Type</h4>
              <div className="flex items-center space-x-2">
                {getTypeIcon(log.communicationType)}
                <span className="text-sm capitalize">{log.communicationType.replace('-', ' ')}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Communication Details</h4>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="whitespace-pre-wrap text-sm">{log.details}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Communication Time</h4>
              <p className="text-sm text-gray-600">
                {log.timestamp.toLocaleDateString()} at {log.timestamp.toLocaleTimeString()}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Logged By</h4>
              <p className="text-sm text-gray-600">
                {log.receptionistName}<br />
                <span className="text-xs">Logged: {log.loggedAt.toLocaleDateString()} {log.loggedAt.toLocaleTimeString()}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};

export default function LogPatientCommunicationsPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<CommunicationLog[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedLog, setSelectedLog] = useState<CommunicationLog | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const userSession = sessionManager.getSession();
    if (!userSession || userSession.role !== 'receptionist') {
      router.push('/receptionist/login');
      return;
    }

    setSession(userSession);
    loadData();
    setIsLoading(false);
  }, [router]);

  const loadData = () => {
    const allLogs = communicationDataManager.getCommunicationLogs();
    const availablePatients = communicationDataManager.getPatients();
    
    setLogs(allLogs);
    setPatients(availablePatients);
  };

  const handleLogCommunication = (logData: CommunicationLogFormData) => {
    if (!session) return;

    const selectedPatient = patients.find(p => p.id === logData.patientId);
    if (!selectedPatient) return;

    const newLog = communicationDataManager.logCommunication({
      patientId: logData.patientId,
      patientName: selectedPatient.name,
      receptionistId: session.username,
      receptionistName: session.firstName + ' ' + session.lastName,
      communicationType: logData.communicationType,
      details: logData.details,
      timestamp: new Date()
    });

    setLogs(prev => [newLog, ...prev]);
    setSuccessMessage('Communication logged successfully in User Activity Logs');
    
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const handleLogClick = (log: CommunicationLog) => {
    setSelectedLog(log);
    setIsDetailOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading communication logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              variant="outline"
              onClick={() => router.push('/receptionist/dashboard')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Log Patient Communications</h1>
            <p className="text-gray-600 mt-1">Maintain comprehensive audit trail of patient interactions</p>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex items-center space-x-2">
              <div className="h-5 w-5 text-green-600">✓</div>
              <p className="text-green-800">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Log Form */}
          <LogForm
            onLogCommunication={handleLogCommunication}
            patients={patients}
          />

          {/* Log History */}
          <LogHistory
            logs={logs}
            onLogClick={handleLogClick}
            onFilter={() => {}}
          />
        </div>

        {/* Log Detail Modal */}
        <LogDetailModal
          log={selectedLog}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
        />
      </div>
    </div>
  );
}