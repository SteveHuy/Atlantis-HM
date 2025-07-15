"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Search, User, Calendar, AlertTriangle, Pill, Shield, FileText, Download, ChevronDown, ChevronUp } from "lucide-react";
import { clinicalDataManager } from "@/lib/clinical-mock-data";
import { patientEhrSearchSchema, logClinicalAccess } from "@/lib/clinical-validation";
import { sessionManager, type UserSession } from "@/lib/epic3-mock-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { z } from "zod";



interface SearchResult {
  id: string;
  name: string;
  dateOfBirth: string;
  lastVisit: string;
  phone: string;
  email: string;
}

interface PatientEHR {
  allergies: any[];
  medications: any[];
  recentVisits: any[];
  vitals: any;
  emergencyContact: any;
}

export default function PatientEHRAccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"name" | "id">("name");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patientEHR, setPatientEHR] = useState<PatientEHR | null>(null);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const userSession = sessionManager.getSession();

    if (!userSession || userSession.role !== 'receptionist') {
      router.push('/receptionist/login');
      return;
    }

    setSession(userSession);

          // Check if patient ID is provided in search params
          const patientId = searchParams.get('patientId');
          if (patientId) {
            // Auto-search for the patient
            const patient = clinicalDataManager.getPatient(patientId);
            if (patient) {
              const searchResult = {
                id: patient.id,
                name: `${patient.firstName} ${patient.lastName}`,
                dateOfBirth: patient.dateOfBirth,
                lastVisit: patient.lastVisit || 'No visits',
                phone: patient.phone,
                email: patient.email
              };

              // Set patient data directly
              setSelectedPatient(patient);

              // Get EHR data
              const ehrData = clinicalDataManager.getPatientMedicalRecords(patient.id);

              setPatientEHR({
                allergies: patient.allergies,
                medications: patient.medications.filter(m => m.status === 'active'),
                recentVisits: ehrData.visitSummaries.slice(0, 5),
                vitals: ehrData.visitSummaries.length > 0 ? ehrData.visitSummaries[0].vitals : null,
                emergencyContact: patient.emergencyContact
              });

              // Log EHR access for HIPAA compliance
              logClinicalAccess('access_patient_ehr', patient.id, userSession.username);
            }
          }


    setIsLoading(false);
  }, [router, searchParams]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setValidationErrors({ search: "Search query is required" });
      return;
    }

    setValidationErrors({});
    setIsSearching(true);

    try {
      // Validate search input
      const validatedData = patientEhrSearchSchema.parse({
        query: searchQuery,
        searchType
      });

      // Search patients
      const patients = clinicalDataManager.searchPatients(validatedData.query);

      // Format results
      const results: SearchResult[] = patients.map(patient => ({
        id: patient.id,
        name: `${patient.firstName} ${patient.lastName}`,
        dateOfBirth: patient.dateOfBirth,
        lastVisit: patient.lastVisit || 'No visits',
        phone: patient.phone,
        email: patient.email
      }));

      setSearchResults(results);

      // Log search for audit trail
      logClinicalAccess('search_patient_ehr', 'multiple', user || 'unknown');

    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { [key: string]: string } = {};
        error.issues.forEach(err => {
          if (err.path.length > 0) {
            fieldErrors[err.path[0]] = err.message;
          }
        });
        setValidationErrors(fieldErrors);
      } else {
        console.error("Search error:", error);
        setValidationErrors({ search: "Search failed. Please try again." });
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleViewEHR = (patient: SearchResult) => {
    // Get full patient data
    const fullPatient = clinicalDataManager.getPatient(patient.id);
    if (!fullPatient) {
      setValidationErrors({ search: "Patient not found" });
      return;
    }

    setSelectedPatient(fullPatient);

    // Get EHR data
    const ehrData = clinicalDataManager.getPatientMedicalRecords(patient.id);

    setPatientEHR({
      allergies: fullPatient.allergies,
      medications: fullPatient.medications.filter(m => m.status === 'active'),
      recentVisits: ehrData.visitSummaries.slice(0, 5), // Last 5 visits
      vitals: ehrData.visitSummaries.length > 0 ? ehrData.visitSummaries[0].vitals : null,
      emergencyContact: fullPatient.emergencyContact
    });

    // Log EHR access for HIPAA compliance
    logClinicalAccess('access_patient_ehr', patient.id, user || 'unknown');
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleExportSummary = () => {
    if (!selectedPatient) return;

    const summary = {
      patient: {
        id: selectedPatient.id,
        name: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
        dateOfBirth: selectedPatient.dateOfBirth,
        phone: selectedPatient.phone,
        email: selectedPatient.email
      },
      emergencyContact: selectedPatient.emergencyContact,
      allergies: patientEHR?.allergies || [],
      activeMedications: patientEHR?.medications || [],
      recentVisits: patientEHR?.recentVisits || [],
      exportedBy: user,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patient-ehr-summary-${selectedPatient.id}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Log export for audit trail
    logClinicalAccess('export_patient_ehr', selectedPatient.id, user || 'unknown');
  };

  const handleBackToDashboard = () => {
    router.push("/receptionist/dashboard");
  };

  const handleBackToSearch = () => {
    setSelectedPatient(null);
    setPatientEHR(null);
    setExpandedSections({});
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading patient EHR access...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in as a receptionist to access patient EHR.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={selectedPatient ? handleBackToSearch : handleBackToDashboard}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{selectedPatient ? 'Back to Search' : 'Back to Dashboard'}</span>
            </button>
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            {selectedPatient ? 'Patient EHR Details' : 'Access Patient EHR'}
          </h1>
          <p className="text-gray-600 mt-2">
            {selectedPatient
              ? `View essential EHR information for ${selectedPatient.firstName} ${selectedPatient.lastName}`
              : 'Search for and access essential patient EHR details'
            }
          </p>
        </div>

        {!selectedPatient ? (
          /* Search Interface */
          <div className="max-w-2xl mx-auto">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Search Patient Records</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Type
                  </label>
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value as "name" | "id")}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="name">Patient Name</option>
                    <option value="id">Patient ID</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Query
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder={searchType === 'name' ? 'Enter patient name' : 'Enter patient ID'}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                    />
                    <Search className="absolute right-3 top-3 h-6 w-6 text-gray-400" />
                  </div>
                  {validationErrors.search && (
                    <p className="mt-2 text-sm text-red-600">{validationErrors.search}</p>
                  )}
                </div>

                <Button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="w-full"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </Card>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <Card className="p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Results</h3>
                <div className="space-y-4">
                  {searchResults.map((patient) => (
                    <div
                      key={patient.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium text-gray-900">{patient.name}</h4>
                          <p className="text-sm text-gray-600">
                            DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            Last Visit: {patient.lastVisit === 'No visits' ? 'No visits' : new Date(patient.lastVisit).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            Phone: {patient.phone}
                          </p>
                        </div>
                        <Button
                          onClick={() => handleViewEHR(patient)}
                          variant="outline"
                        >
                          View EHR
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {searchResults.length === 0 && searchQuery && !isSearching && (
              <Card className="p-6 mt-6">
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No patients found matching your search</p>
                </div>
              </Card>
            )}
          </div>
        ) : (
          /* Patient EHR Details */
          <div className="space-y-6">
            {/* Patient Header */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedPatient.firstName} {selectedPatient.lastName}
                  </h2>
                  <p className="text-gray-600">Patient ID: {selectedPatient.id}</p>
                </div>
                <Button
                  onClick={handleExportSummary}
                  className="flex items-center space-x-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Export Summary</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Date of Birth:</p>
                  <p className="font-medium">{new Date(selectedPatient.dateOfBirth).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Phone:</p>
                  <p className="font-medium">{selectedPatient.phone}</p>
                </div>
                <div>
                  <p className="text-gray-600">Email:</p>
                  <p className="font-medium">{selectedPatient.email}</p>
                </div>
              </div>
            </Card>

            {/* EHR Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Allergies */}
              <Card className="p-6">
                <button
                  onClick={() => toggleSection('allergies')}
                  className="w-full flex items-center justify-between mb-4"
                >
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Allergies</h3>
                    <span className="bg-red-100 text-red-800 text-sm px-2 py-1 rounded-full">
                      {patientEHR?.allergies.length || 0}
                    </span>
                  </div>
                  {expandedSections.allergies ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>

                {expandedSections.allergies && (
                  <div className="space-y-2">
                    {patientEHR?.allergies.length === 0 ? (
                      <p className="text-gray-500">No known allergies</p>
                    ) : (
                      patientEHR?.allergies.map((allergy) => (
                        <div key={allergy.id} className="p-3 bg-red-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-red-900">{allergy.allergen}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              allergy.severity === 'high' ? 'bg-red-200 text-red-800' :
                              allergy.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                              'bg-green-200 text-green-800'
                            }`}>
                              {allergy.severity}
                            </span>
                          </div>
                          <p className="text-sm text-red-700 mt-1">{allergy.reaction}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </Card>

              {/* Current Medications */}
              <Card className="p-6">
                <button
                  onClick={() => toggleSection('medications')}
                  className="w-full flex items-center justify-between mb-4"
                >
                  <div className="flex items-center space-x-2">
                    <Pill className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Current Medications</h3>
                    <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
                      {patientEHR?.medications.length || 0}
                    </span>
                  </div>
                  {expandedSections.medications ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>

                {expandedSections.medications && (
                  <div className="space-y-2">
                    {patientEHR?.medications.length === 0 ? (
                      <p className="text-gray-500">No current medications</p>
                    ) : (
                      patientEHR?.medications.map((medication) => (
                        <div key={medication.id} className="p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-blue-900">{medication.name}</span>
                            <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
                              {medication.status}
                            </span>
                          </div>
                          <p className="text-sm text-blue-700 mt-1">
                            {medication.dosage} • {medication.frequency}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </Card>

              {/* Recent Visits */}
              <Card className="p-6">
                <button
                  onClick={() => toggleSection('visits')}
                  className="w-full flex items-center justify-between mb-4"
                >
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Recent Visits</h3>
                    <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full">
                      {patientEHR?.recentVisits.length || 0}
                    </span>
                  </div>
                  {expandedSections.visits ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>

                {expandedSections.visits && (
                  <div className="space-y-2">
                    {patientEHR?.recentVisits.length === 0 ? (
                      <p className="text-gray-500">No recent visits</p>
                    ) : (
                      patientEHR?.recentVisits.map((visit) => (
                        <div key={visit.id} className="p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-green-900">
                              {new Date(visit.visitDate).toLocaleDateString()}
                            </span>
                            <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                              {visit.visitType}
                            </span>
                          </div>
                          <p className="text-sm text-green-700 mt-1">{visit.reasonForVisit}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </Card>

              {/* Emergency Contact */}
              <Card className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <User className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Emergency Contact</h3>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600">Name:</p>
                    <p className="font-medium">{selectedPatient.emergencyContact.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Relationship:</p>
                    <p className="font-medium">{selectedPatient.emergencyContact.relationship}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone:</p>
                    <p className="font-medium">{selectedPatient.emergencyContact.phone}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
