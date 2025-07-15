"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Shield, Save, User, Calendar, AlertTriangle, CheckCircle, Download } from "lucide-react";
import { clinicalDataManager } from "@/lib/clinical-mock-data";
import { trackImmunizationSchema, validateImmunizationSchedule, logClinicalAccess } from "@/lib/clinical-validation";
import { sessionManager, type UserSession } from "@/lib/epic3-mock-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { z } from "zod";

interface ImmunizationData {
  patientId: string;
  vaccineName: string;
  vaccineCode: string;
  administrationDate: string;
  lotNumber: string;
  manufacturer: string;
  dosage: string;
  route: string;
  site: string;
  providerId: string;
  notes: string;
  nextDueDate: string;
  series: string;
}

interface VaccineAlert {
  type: 'overdue' | 'due_soon' | 'up_to_date';
  vaccine: string;
  message: string;
  dueDate?: string;
}

export default function TrackImmunizationsPage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [immunizationHistory, setImmunizationHistory] = useState<any[]>([]);
  const [vaccineAlerts, setVaccineAlerts] = useState<VaccineAlert[]>([]);
  const [immunizationData, setImmunizationData] = useState<ImmunizationData>({
    patientId: '',
    vaccineName: '',
    vaccineCode: '',
    administrationDate: '',
    lotNumber: '',
    manufacturer: '',
    dosage: '',
    route: 'Intramuscular',
    site: 'Left deltoid',
    providerId: '',
    notes: '',
    nextDueDate: '',
    series: ''
  });
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const userSession = sessionManager.getSession();

    if (!userSession || userSession.role !== 'provider') {
      router.push('/provider/login');
      return;
    }

    setSession(userSession);

    // Load patients
    const patientsData = clinicalDataManager.getAllPatients();
    setPatients(patientsData);

    setIsLoading(false);
  }, [router]);

  const handlePatientSelect = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    setSelectedPatient(patient);
    setImmunizationData(prev => ({ ...prev, patientId }));

    if (patient) {
      setImmunizationHistory(patient.immunizations || []);
      generateVaccineAlerts(patient);
    }

    // Clear validation error when user selects a patient
    if (validationErrors.patientId) {
      setValidationErrors(prev => ({ ...prev, patientId: '' }));
    }
  };

  const generateVaccineAlerts = (patient: any) => {
    const alerts: VaccineAlert[] = [];
    const patientAge = calculateAge(patient.dateOfBirth);
    const today = new Date();

    // Mock vaccine schedule checking
    const requiredVaccines = [
      { name: 'COVID-19 mRNA', interval: 365, description: 'Annual booster' },
      { name: 'Influenza (seasonal)', interval: 365, description: 'Annual vaccination' },
      { name: 'Tetanus, diphtheria, pertussis (Tdap)', interval: 3650, description: 'Every 10 years' }
    ];

    requiredVaccines.forEach(vaccine => {
      const lastVaccination = patient.immunizations?.find((imm: any) =>
        imm.vaccineName === vaccine.name
      );

      if (!lastVaccination) {
        alerts.push({
          type: 'overdue',
          vaccine: vaccine.name,
          message: `${vaccine.name} not found in records - may be overdue`,
        });
      } else {
        const lastDate = new Date(lastVaccination.administrationDate);
        const nextDue = new Date(lastDate);
        nextDue.setDate(nextDue.getDate() + vaccine.interval);

        const daysDiff = Math.ceil((nextDue.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDiff < 0) {
          alerts.push({
            type: 'overdue',
            vaccine: vaccine.name,
            message: `${vaccine.name} is overdue (${vaccine.description})`,
            dueDate: nextDue.toLocaleDateString()
          });
        } else if (daysDiff < 30) {
          alerts.push({
            type: 'due_soon',
            vaccine: vaccine.name,
            message: `${vaccine.name} due in ${daysDiff} days (${vaccine.description})`,
            dueDate: nextDue.toLocaleDateString()
          });
        } else {
          alerts.push({
            type: 'up_to_date',
            vaccine: vaccine.name,
            message: `${vaccine.name} up to date (next due: ${nextDue.toLocaleDateString()})`,
            dueDate: nextDue.toLocaleDateString()
          });
        }
      }
    });

    setVaccineAlerts(alerts);
  };

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  const handleInputChange = (field: string, value: string) => {
    setImmunizationData(prev => ({ ...prev, [field]: value }));

    // Auto-populate vaccine code when vaccine name is selected
    if (field === 'vaccineName') {
      const selectedVaccine = mockVaccines.find(v => v === value);
      if (selectedVaccine) {
        const vaccineCode = generateVaccineCode(selectedVaccine);
        setImmunizationData(prev => ({ ...prev, vaccineCode }));
      }
    }

    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const generateVaccineCode = (vaccineName: string): string => {
    // Mock vaccine code generation
    const codeMappings: { [key: string]: string } = {
      'COVID-19 mRNA': 'CVX-208',
      'Influenza (seasonal)': 'CVX-158',
      'Tetanus, diphtheria, pertussis (Tdap)': 'CVX-115',
      'Pneumococcal conjugate (PCV13)': 'CVX-133',
      'Pneumococcal polysaccharide (PPSV23)': 'CVX-33',
      'Hepatitis B': 'CVX-08',
      'Hepatitis A': 'CVX-85',
      'Measles, mumps, rubella (MMR)': 'CVX-03',
      'Varicella (chickenpox)': 'CVX-21',
      'Shingles (zoster)': 'CVX-187'
    };

    return codeMappings[vaccineName] || 'CVX-999';
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    try {
      trackImmunizationSchema.parse(immunizationData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.issues.forEach(err => {
          if (err.path.length > 0) {
            errors[err.path[0]] = err.message;
          }
        });
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    setSuccess(false);

    try {
      // Create immunization object
      const immunization = {
        patientId: immunizationData.patientId,
        vaccineName: immunizationData.vaccineName,
        vaccineCode: immunizationData.vaccineCode,
        administrationDate: immunizationData.administrationDate,
        lotNumber: immunizationData.lotNumber,
        manufacturer: immunizationData.manufacturer,
        dosage: immunizationData.dosage,
        route: immunizationData.route,
        site: immunizationData.site,
        providerId: immunizationData.providerId,
        notes: immunizationData.notes,
        nextDueDate: immunizationData.nextDueDate,
        series: immunizationData.series
      };

      // Add immunization to patient record
      const savedImmunization = clinicalDataManager.addImmunization(immunizationData.patientId, immunization);

      // Update immunization history
      setImmunizationHistory(prev => [...prev, savedImmunization]);

      // Regenerate vaccine alerts
      if (selectedPatient) {
        generateVaccineAlerts(selectedPatient);
      }

      // Log immunization tracking for audit trail
      logClinicalAccess('track_immunization', immunizationData.patientId, session?.username || 'unknown');

      setSuccess(true);

      // Reset form
      setImmunizationData({
        patientId: immunizationData.patientId,
        vaccineName: '',
        vaccineCode: '',
        administrationDate: '',
        lotNumber: '',
        manufacturer: '',
        dosage: '',
        route: 'Intramuscular',
        site: 'Left deltoid',
        providerId: immunizationData.providerId,
        notes: '',
        nextDueDate: '',
        series: ''
      });

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);

    } catch (error) {
      console.error("Error saving immunization:", error);
      setValidationErrors({ general: "Failed to save immunization information. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadHistory = () => {
    if (!selectedPatient) return;

    const historyData = {
      patient: {
        name: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
        id: selectedPatient.id,
        dateOfBirth: selectedPatient.dateOfBirth
      },
      immunizations: immunizationHistory,
      alerts: vaccineAlerts,
      exportedBy: user,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(historyData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `immunization-history-${selectedPatient.id}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Log download for audit trail
    logClinicalAccess('download_immunization_history', selectedPatient.id, session?.username || 'unknown');
  };

  const handleBackToDashboard = () => {
    router.push("/provider/dashboard");
  };

  const handleBackToPatientEHR = () => {
    if (selectedPatient) {
      router.push(`/provider/patient-ehr?patientId=${selectedPatient.id}`);
    } else {
      router.push("/provider/dashboard");
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      case 'due_soon': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'up_to_date': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'overdue': return <AlertTriangle className="w-4 h-4" />;
      case 'due_soon': return <Calendar className="w-4 h-4" />;
      case 'up_to_date': return <CheckCircle className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading immunization tracker...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in as a provider to track immunizations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToDashboard}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </button>
            </div>
            {selectedPatient && (
              <div className="flex items-center space-x-4">
                <Button
                  onClick={handleDownloadHistory}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download History</span>
                </Button>
                <Button
                  onClick={handleBackToPatientEHR}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <User className="w-4 h-4" />
                  <span>View Patient EHR</span>
                </Button>
              </div>
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900">Track Immunizations</h1>
          <p className="text-gray-600 mt-2">
            Track patient immunizations and maintain up-to-date vaccine histories
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <Card className="p-4 mb-6 bg-green-50 border-green-200">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-700 font-medium">Immunization information added successfully!</p>
            </div>
          </Card>
        )}

        <div className="space-y-6">
          {/* Patient Selection */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <User className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Patient Selection</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Patient *
                </label>
                <select
                  value={immunizationData.patientId}
                  onChange={(e) => handlePatientSelect(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a patient...</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName} ({patient.id})
                    </option>
                  ))}
                </select>
                {validationErrors.patientId && (
                  <p className="mt-2 text-sm text-red-600">{validationErrors.patientId}</p>
                )}
              </div>

              {selectedPatient && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Patient Information</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Name:</strong> {selectedPatient.firstName} {selectedPatient.lastName}</p>
                    <p><strong>Age:</strong> {calculateAge(selectedPatient.dateOfBirth)} years</p>
                    <p><strong>DOB:</strong> {new Date(selectedPatient.dateOfBirth).toLocaleDateString()}</p>
                    <p><strong>Immunizations:</strong> {immunizationHistory.length} on record</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Vaccine Alerts */}
          {selectedPatient && vaccineAlerts.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <h2 className="text-xl font-semibold text-gray-900">Vaccine Schedule Alerts</h2>
              </div>

              <div className="space-y-3">
                {vaccineAlerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-3 p-3 rounded-lg border ${getAlertColor(alert.type)}`}
                  >
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <p className="font-medium">{alert.vaccine}</p>
                      <p className="text-sm">{alert.message}</p>
                    </div>
                    {alert.dueDate && (
                      <span className="text-sm font-medium">{alert.dueDate}</span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Immunization History */}
          {selectedPatient && immunizationHistory.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="w-5 h-5 text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-900">Immunization History</h2>
              </div>

              <div className="space-y-3">
                {immunizationHistory.map((immunization) => (
                  <div key={immunization.id} className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-purple-900">{immunization.vaccineName}</span>
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                          {immunization.vaccineCode}
                        </span>
                      </div>
                      <p className="text-sm text-purple-700 mt-1">
                        Administered: {new Date(immunization.administrationDate).toLocaleDateString()} •
                        Dosage: {immunization.dosage} •
                        Route: {immunization.route} •
                        Site: {immunization.site}
                      </p>
                      {immunization.lotNumber && (
                        <p className="text-sm text-gray-600 mt-1">Lot: {immunization.lotNumber}</p>
                      )}
                      {immunization.notes && (
                        <p className="text-sm text-gray-600 mt-1">Notes: {immunization.notes}</p>
                      )}
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {immunization.nextDueDate && (
                        <p>Next due: {new Date(immunization.nextDueDate).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Add New Immunization */}
          {selectedPatient && (
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="w-5 h-5 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">Add Immunization</h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vaccine Name *
                    </label>
                    <select
                      value={immunizationData.vaccineName}
                      onChange={(e) => handleInputChange('vaccineName', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select vaccine...</option>
                      {mockVaccines.map(vaccine => (
                        <option key={vaccine} value={vaccine}>
                          {vaccine}
                        </option>
                      ))}
                    </select>
                    {validationErrors.vaccineName && (
                      <p className="mt-2 text-sm text-red-600">{validationErrors.vaccineName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vaccine Code
                    </label>
                    <input
                      type="text"
                      value={immunizationData.vaccineCode}
                      onChange={(e) => handleInputChange('vaccineCode', e.target.value)}
                      placeholder="Auto-populated"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Administration Date *
                    </label>
                    <input
                      type="date"
                      value={immunizationData.administrationDate}
                      onChange={(e) => handleInputChange('administrationDate', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {validationErrors.administrationDate && (
                      <p className="mt-2 text-sm text-red-600">{validationErrors.administrationDate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Next Due Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={immunizationData.nextDueDate}
                      onChange={(e) => handleInputChange('nextDueDate', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dosage *
                    </label>
                    <input
                      type="text"
                      value={immunizationData.dosage}
                      onChange={(e) => handleInputChange('dosage', e.target.value)}
                      placeholder="e.g., 0.5mL"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {validationErrors.dosage && (
                      <p className="mt-2 text-sm text-red-600">{validationErrors.dosage}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Route *
                    </label>
                    <select
                      value={immunizationData.route}
                      onChange={(e) => handleInputChange('route', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Intramuscular">Intramuscular</option>
                      <option value="Subcutaneous">Subcutaneous</option>
                      <option value="Oral">Oral</option>
                      <option value="Nasal">Nasal</option>
                      <option value="Intradermal">Intradermal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Site *
                    </label>
                    <select
                      value={immunizationData.site}
                      onChange={(e) => handleInputChange('site', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Left deltoid">Left deltoid</option>
                      <option value="Right deltoid">Right deltoid</option>
                      <option value="Left thigh">Left thigh</option>
                      <option value="Right thigh">Right thigh</option>
                      <option value="Left buttock">Left buttock</option>
                      <option value="Right buttock">Right buttock</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lot Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={immunizationData.lotNumber}
                      onChange={(e) => handleInputChange('lotNumber', e.target.value)}
                      placeholder="Vaccine lot number"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Manufacturer *
                    </label>
                    <input
                      type="text"
                      value={immunizationData.manufacturer}
                      onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                      placeholder="Vaccine manufacturer"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {validationErrors.manufacturer && (
                      <p className="mt-2 text-sm text-red-600">{validationErrors.manufacturer}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Series (Optional)
                    </label>
                    <input
                      type="text"
                      value={immunizationData.series}
                      onChange={(e) => handleInputChange('series', e.target.value)}
                      placeholder="e.g., Primary series, Booster"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <input
                      type="text"
                      value={immunizationData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="Additional notes"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* General Error */}
          {validationErrors.general && (
            <Card className="p-4 bg-red-50 border-red-200">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <p className="text-red-700">{validationErrors.general}</p>
              </div>
            </Card>
          )}

          {/* Save Button */}
          {selectedPatient && (
            <div className="flex justify-end space-x-4">
              <Button
                onClick={handleBackToDashboard}
                variant="outline"
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || !immunizationData.vaccineName || !immunizationData.administrationDate || !immunizationData.dosage || !immunizationData.manufacturer}
                className="flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Add Immunization'}</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
