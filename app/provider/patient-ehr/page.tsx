'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FileText,
  Search,
  ArrowLeft,
  User,
  Calendar,
  Pill,
  Shield,
  Download,
  Eye,
  AlertTriangle,
  Phone,
  Mail,
  MapPin,
  Clipboard,
  Activity
} from 'lucide-react';
import { sessionManager, type UserSession } from '@/lib/epic3-mock-data';
import { serviceProviderDataManager } from '@/lib/service-provider-mock-data';
import { viewPatientEHRSchema } from '@/lib/service-provider-validation';

// Mock comprehensive patient data
const mockPatientEHR = {
  'patient-1': {
    id: 'patient-1',
    name: 'John Doe',
    dateOfBirth: '1978-03-15',
    age: 45,
    gender: 'Male',
    phone: '(555) 123-4567',
    email: 'john.doe@email.com',
    address: '123 Main St, Anytown, ST 12345',
    emergencyContact: {
      name: 'Jane Doe',
      relation: 'Spouse',
      phone: '(555) 123-4568'
    },
    demographics: {
      maritalStatus: 'Married',
      occupation: 'Software Engineer',
      insurance: 'Blue Cross Blue Shield',
      policyNumber: 'BC123456789'
    },
    diagnoses: [
      { id: '1', code: 'I10', description: 'Essential Hypertension', date: '2023-01-15', status: 'Active' },
      { id: '2', code: 'E11', description: 'Type 2 Diabetes Mellitus', date: '2022-08-20', status: 'Active' },
      { id: '3', code: 'M79.3', description: 'Lower Back Pain', date: '2024-01-10', status: 'Resolved' }
    ],
    medications: [
      { id: '1', name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', prescriber: 'Dr. Smith', datePrescribed: '2023-01-15' },
      { id: '2', name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', prescriber: 'Dr. Smith', datePrescribed: '2022-08-20' },
      { id: '3', name: 'Ibuprofen', dosage: '400mg', frequency: 'As needed', prescriber: 'Dr. Johnson', datePrescribed: '2024-01-10' }
    ],
    allergies: [
      { id: '1', allergen: 'Penicillin', reaction: 'Rash', severity: 'Mild', dateReported: '2020-05-10' },
      { id: '2', allergen: 'Shellfish', reaction: 'Hives, Swelling', severity: 'Moderate', dateReported: '2019-03-22' }
    ],
    visitSummaries: [
      {
        id: '1',
        date: '2024-01-15',
        provider: 'Dr. Sarah Johnson',
        type: 'Follow-up Visit',
        chiefComplaint: 'Diabetes management checkup',
        diagnosis: 'Type 2 Diabetes - well controlled',
        treatment: 'Continue current medications, dietary counseling',
        notes: 'Patient reports good compliance with medications. HbA1c improved to 6.8%.'
      },
      {
        id: '2',
        date: '2023-12-10',
        provider: 'Dr. Michael Chen',
        type: 'Routine Physical',
        chiefComplaint: 'Annual physical examination',
        diagnosis: 'Hypertension, well controlled',
        treatment: 'Continue Lisinopril, lifestyle modifications',
        notes: 'Blood pressure well controlled. Patient encouraged to continue regular exercise.'
      }
    ],
    labResults: [
      {
        id: '1',
        test: 'Comprehensive Metabolic Panel',
        date: '2024-01-15',
        results: 'Glucose: 105 mg/dL (Normal), Creatinine: 1.0 mg/dL (Normal)',
        status: 'Final',
        orderedBy: 'Dr. Johnson'
      },
      {
        id: '2',
        test: 'HbA1c',
        date: '2024-01-15',
        results: '6.8% (Good control)',
        status: 'Final',
        orderedBy: 'Dr. Johnson'
      },
      {
        id: '3',
        test: 'Lipid Panel',
        date: '2023-12-10',
        results: 'Total Cholesterol: 185 mg/dL, LDL: 110 mg/dL, HDL: 55 mg/dL',
        status: 'Final',
        orderedBy: 'Dr. Chen'
      }
    ],
    immunizations: [
      { id: '1', vaccine: 'COVID-19 Booster', date: '2023-10-15', provider: 'Pharmacy', lotNumber: 'CVX208' },
      { id: '2', vaccine: 'Influenza', date: '2023-09-20', provider: 'Dr. Smith', lotNumber: 'FLU2023' },
      { id: '3', vaccine: 'Tdap', date: '2020-07-10', provider: 'Dr. Johnson', lotNumber: 'TD2020' }
    ],
    documents: [
      { id: '1', type: 'Referral Letter', title: 'Cardiology Referral', date: '2023-12-15', provider: 'Dr. Chen' },
      { id: '2', type: 'Lab Report', title: 'Annual Lab Results', date: '2024-01-15', provider: 'Quest Diagnostics' },
      { id: '3', type: 'Imaging Report', title: 'Chest X-Ray', date: '2023-11-20', provider: 'Radiology Associates' }
    ]
  }
};

export default function ViewPatientEHRPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Selected patient state
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [accessReason, setAccessReason] = useState('');
  const [activeSection, setActiveSection] = useState<string>('overview');

  // UI state
  const [showAccessForm, setShowAccessForm] = useState(false);
  const [accessError, setAccessError] = useState('');

  useEffect(() => {
    const userSession = sessionManager.getSession();

    if (!userSession || userSession.role !== 'provider') {
      router.push('/provider/login');
      return;
    }

    setSession(userSession);

    // Check if patient ID is provided via URL params
    const patientId = searchParams.get('patientId');
    if (patientId && mockPatientEHR[patientId as keyof typeof mockPatientEHR]) {
      setSelectedPatient(mockPatientEHR[patientId as keyof typeof mockPatientEHR]);
      setAccessReason('Clinical consultation');
    }

    setIsLoading(false);
  }, [router, searchParams]);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError('');

    // Simulate search delay
    setTimeout(() => {
      // Mock search results - in real app, this would be API call
      const results = Object.values(mockPatientEHR).filter(patient =>
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.id.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setSearchResults(results);

      if (results.length === 0) {
        setSearchError('No patients found matching your search criteria');
      }

      setIsSearching(false);
    }, 1000);
  };

  const handlePatientSelect = (patient: any) => {
    setSelectedPatient(patient);
    setSearchResults([]);
    setSearchQuery('');
    setShowAccessForm(true);
  };

  const handleAccessEHR = async () => {
    if (!accessReason.trim()) {
      setAccessError('Access reason is required for HIPAA compliance');
      return;
    }

    if (!session || !selectedPatient) return;

    try {
      // Validate access request
      const validationResult = viewPatientEHRSchema.safeParse({
        patientId: selectedPatient.id,
        accessReason: accessReason.trim()
      });

      if (!validationResult.success) {
        const errors = validationResult.error.issues.map(e => e.message).join(', ');
        setAccessError(errors);
        return;
      }

      // Log EHR access for audit
      serviceProviderDataManager.logSecurityEvent(
        'EHR_ACCESSED',
        'patient_record',
        selectedPatient.id,
        `EHR accessed by ${session.fullName}. Reason: ${accessReason.trim()}`,
        'medium'
      );

      setShowAccessForm(false);
      setAccessError('');
      setActiveSection('overview');

    } catch (error) {
      setAccessError('Failed to access EHR. Please try again.');
      console.error('EHR access error:', error);
    }
  };

  const handleExportRecord = (format: 'pdf' | 'json' | 'csv') => {
    if (!selectedPatient || !session) return;

    // Log export action
    serviceProviderDataManager.logSecurityEvent(
      'EHR_EXPORTED',
      'patient_record',
      selectedPatient.id,
      `EHR exported in ${format.toUpperCase()} format by ${session.fullName}`,
      'high'
    );

    // Mock export functionality
    alert(`Patient EHR exported in ${format.toUpperCase()} format (mock)`);
  };

  const handlePrintRecord = () => {
    if (!selectedPatient || !session) return;

    // Log print action
    serviceProviderDataManager.logSecurityEvent(
      'EHR_PRINTED',
      'patient_record',
      selectedPatient.id,
      `EHR printed by ${session.fullName}`,
      'medium'
    );

    // Mock print functionality
    window.print();
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
              <h1 className="text-2xl font-bold text-blue-600">View Patient EHR</h1>
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
        {!selectedPatient || showAccessForm ? (
          /* Patient Search */
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-blue-600" />
                  Patient Search
                </CardTitle>
                <CardDescription>
                  Search for a patient by name or ID to access their electronic health record
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search Input */}
                <div>
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                    Patient Name or ID
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      id="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Enter patient name or ID..."
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button
                      onClick={handleSearch}
                      disabled={isSearching || !searchQuery.trim()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isSearching ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Search Error */}
                {searchError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                    {searchError}
                  </div>
                )}

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Search Results</h3>
                    <div className="space-y-2">
                      {searchResults.map(patient => (
                        <div
                          key={patient.id}
                          onClick={() => handlePatientSelect(patient)}
                          className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{patient.name}</p>
                              <p className="text-sm text-gray-600">
                                ID: {patient.id} | DOB: {new Date(patient.dateOfBirth).toLocaleDateString()} | Age: {patient.age}
                              </p>
                            </div>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              View EHR
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Access Reason Form */}
                {showAccessForm && selectedPatient && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Access Authorization Required</h3>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded mb-4">
                      <p className="text-sm text-blue-800">
                        <strong>Patient:</strong> {selectedPatient.name} | <strong>ID:</strong> {selectedPatient.id}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="accessReason" className="block text-sm font-medium text-gray-700 mb-2">
                          Reason for Accessing EHR *
                        </label>
                        <textarea
                          id="accessReason"
                          value={accessReason}
                          onChange={(e) => setAccessReason(e.target.value)}
                          placeholder="Please provide the medical reason for accessing this patient's EHR..."
                          rows={3}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          maxLength={500}
                          required
                        />
                        <div className="text-right text-xs text-gray-500 mt-1">
                          {accessReason.length}/500 characters
                        </div>
                      </div>

                      {accessError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                          {accessError}
                        </div>
                      )}

                      <div className="flex gap-3">
                        <Button
                          onClick={handleAccessEHR}
                          disabled={!accessReason.trim()}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Access EHR
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowAccessForm(false);
                            setSelectedPatient(null);
                            setAccessReason('');
                            setAccessError('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Patient EHR Display */
          <div className="space-y-6">
            {/* Patient Header */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{selectedPatient.name}</CardTitle>
                      <CardDescription>
                        Patient ID: {selectedPatient.id} | DOB: {new Date(selectedPatient.dateOfBirth).toLocaleDateString()} | Age: {selectedPatient.age} | {selectedPatient.gender}
                      </CardDescription>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrintRecord}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Print
                    </Button>
                    <div className="relative group">
                      <Button
                        variant="outline"
                        size="sm"
                        className="dropdown-toggle"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                      <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                        <button
                          onClick={() => handleExportRecord('pdf')}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Export PDF
                        </button>
                        <button
                          onClick={() => handleExportRecord('json')}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Export JSON
                        </button>
                        <button
                          onClick={() => handleExportRecord('csv')}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Export CSV
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8">
                {[
                  { id: 'overview', label: 'Overview', icon: User },
                  { id: 'diagnoses', label: 'Diagnoses', icon: Clipboard },
                  { id: 'medications', label: 'Medications', icon: Pill },
                  { id: 'visits', label: 'Visit Summaries', icon: Calendar },
                  { id: 'labs', label: 'Lab Results', icon: Activity },
                  { id: 'allergies', label: 'Allergies', icon: AlertTriangle },
                  { id: 'immunizations', label: 'Immunizations', icon: Shield },
                  { id: 'documents', label: 'Documents', icon: FileText }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveSection(id)}
                    className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                      activeSection === id
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

            {/* Content Sections */}
            {activeSection === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Demographics & Contact</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{selectedPatient.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{selectedPatient.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{selectedPatient.address}</span>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-sm text-gray-600">Marital Status: {selectedPatient.demographics.maritalStatus}</p>
                      <p className="text-sm text-gray-600">Occupation: {selectedPatient.demographics.occupation}</p>
                      <p className="text-sm text-gray-600">Insurance: {selectedPatient.demographics.insurance}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Emergency Contact</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium">{selectedPatient.emergencyContact.name}</p>
                    <p className="text-sm text-gray-600">{selectedPatient.emergencyContact.relation}</p>
                    <p className="text-sm text-gray-600">{selectedPatient.emergencyContact.phone}</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === 'diagnoses' && (
              <Card>
                <CardHeader>
                  <CardTitle>Current and Past Diagnoses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedPatient.diagnoses.map((diagnosis: any) => (
                      <div key={diagnosis.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">{diagnosis.description}</p>
                            <p className="text-sm text-gray-600">ICD-10: {diagnosis.code}</p>
                            <p className="text-sm text-gray-600">Date: {new Date(diagnosis.date).toLocaleDateString()}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            diagnosis.status === 'Active'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {diagnosis.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'medications' && (
              <Card>
                <CardHeader>
                  <CardTitle>Current Medications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedPatient.medications.map((medication: any) => (
                      <div key={medication.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Pill className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-gray-900">{medication.name}</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                          <div>Dosage: {medication.dosage}</div>
                          <div>Frequency: {medication.frequency}</div>
                          <div>Prescriber: {medication.prescriber}</div>
                          <div>Date: {new Date(medication.datePrescribed).toLocaleDateString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'visits' && (
              <Card>
                <CardHeader>
                  <CardTitle>Visit Summaries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {selectedPatient.visitSummaries.map((visit: any) => (
                      <div key={visit.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-medium text-gray-900">{visit.type}</p>
                            <p className="text-sm text-gray-600">{visit.provider} • {new Date(visit.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div><strong>Chief Complaint:</strong> {visit.chiefComplaint}</div>
                          <div><strong>Diagnosis:</strong> {visit.diagnosis}</div>
                          <div><strong>Treatment:</strong> {visit.treatment}</div>
                          <div><strong>Notes:</strong> {visit.notes}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'labs' && (
              <Card>
                <CardHeader>
                  <CardTitle>Laboratory Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedPatient.labResults.map((lab: any) => (
                      <div key={lab.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-gray-900">{lab.test}</p>
                            <p className="text-sm text-gray-600">Ordered by: {lab.orderedBy}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">{new Date(lab.date).toLocaleDateString()}</p>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {lab.status}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700">{lab.results}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'allergies' && (
              <Card>
                <CardHeader>
                  <CardTitle>Allergies and Adverse Reactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedPatient.allergies.map((allergy: any) => (
                      <div key={allergy.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                              <span className="font-medium text-gray-900">{allergy.allergen}</span>
                            </div>
                            <p className="text-sm text-gray-600">Reaction: {allergy.reaction}</p>
                            <p className="text-sm text-gray-600">Reported: {new Date(allergy.dateReported).toLocaleDateString()}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            allergy.severity === 'Mild' ? 'bg-yellow-100 text-yellow-800' :
                            allergy.severity === 'Moderate' ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {allergy.severity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'immunizations' && (
              <Card>
                <CardHeader>
                  <CardTitle>Immunization History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedPatient.immunizations.map((immunization: any) => (
                      <div key={immunization.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-gray-900">{immunization.vaccine}</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-600">
                          <div>Date: {new Date(immunization.date).toLocaleDateString()}</div>
                          <div>Provider: {immunization.provider}</div>
                          <div>Lot: {immunization.lotNumber}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'documents' && (
              <Card>
                <CardHeader>
                  <CardTitle>Uploaded Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedPatient.documents.map((document: any) => (
                      <div key={document.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="font-medium text-gray-900">{document.title}</p>
                              <p className="text-sm text-gray-600">{document.type} • {document.provider}</p>
                              <p className="text-xs text-gray-500">{new Date(document.date).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
