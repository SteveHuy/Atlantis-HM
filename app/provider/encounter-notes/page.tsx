"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, FileText, Edit, History, User, Calendar } from "lucide-react";
import { clinicalDataManager } from "@/lib/clinical-mock-data";
import { updateEncounterNotesSchema, logClinicalAccess } from "@/lib/clinical-validation";
import { sessionManager, type UserSession } from "@/lib/epic3-mock-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { z } from "zod";

interface EncounterData {
  encounterId: string;
  notes: string;
  treatmentPlan: string;
  diagnoses: string[];
  providerId: string;
}

export default function UpdateEncounterNotesPage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [encounters, setEncounters] = useState<any[]>([]);
  const [selectedEncounter, setSelectedEncounter] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [encounterData, setEncounterData] = useState<EncounterData>({
    encounterId: '',
    notes: '',
    treatmentPlan: '',
    diagnoses: [],
    providerId: ''
  });
  const [originalData, setOriginalData] = useState<EncounterData>({
    encounterId: '',
    notes: '',
    treatmentPlan: '',
    diagnoses: [],
    providerId: ''
  });
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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

  useEffect(() => {
    // Check for unsaved changes
    if (isEditing && selectedEncounter) {
      const hasChanges =
        encounterData.notes !== originalData.notes ||
        encounterData.treatmentPlan !== originalData.treatmentPlan ||
        JSON.stringify(encounterData.diagnoses) !== JSON.stringify(originalData.diagnoses);

      setHasUnsavedChanges(hasChanges);
    }
  }, [encounterData, originalData, isEditing, selectedEncounter]);

  const handlePatientSelect = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    setSelectedPatient(patient);

    if (patient) {
      // Get encounters for this patient
      const patientEncounters = patient.encounters || [];

      // Sort encounters by date (newest first)
      const sortedEncounters = patientEncounters.sort((a: any, b: any) =>
        new Date(b.encounterDate).getTime() - new Date(a.encounterDate).getTime()
      );

      setEncounters(sortedEncounters);
      setSelectedEncounter(null);
      setIsEditing(false);
    }
  };

  const handleEncounterSelect = (encounter: any) => {
    if (hasUnsavedChanges) {
      const confirmDiscard = window.confirm("You have unsaved changes. Are you sure you want to discard them?");
      if (!confirmDiscard) return;
    }

    setSelectedEncounter(encounter);
    setIsEditing(false);

    const data = {
      encounterId: encounter.id,
      notes: encounter.notes || '',
      treatmentPlan: encounter.treatmentPlan || '',
      diagnoses: encounter.diagnoses || [],
      providerId: user || ''
    };

    setEncounterData(data);
    setOriginalData(data);
    setHasUnsavedChanges(false);
  };

  const handleStartEditing = () => {
    if (selectedEncounter.status === 'finalized') {
      // Check if user has authorization to edit finalized records
      const hasAuth = window.confirm(
        "This is a finalized record. Are you authorized to edit finalized encounter notes? This action will be logged."
      );
      if (!hasAuth) return;
    }

    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    if (hasUnsavedChanges) {
      const confirmDiscard = window.confirm("You have unsaved changes. Are you sure you want to discard them?");
      if (!confirmDiscard) return;
    }

    setEncounterData(originalData);
    setIsEditing(false);
    setHasUnsavedChanges(false);
    setValidationErrors({});
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setEncounterData(prev => ({ ...prev, [field]: value }));

    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDiagnosisChange = (index: number, value: string) => {
    const newDiagnoses = [...encounterData.diagnoses];
    newDiagnoses[index] = value;
    setEncounterData(prev => ({ ...prev, diagnoses: newDiagnoses }));
  };

  const addDiagnosis = () => {
    setEncounterData(prev => ({
      ...prev,
      diagnoses: [...prev.diagnoses, '']
    }));
  };

  const removeDiagnosis = (index: number) => {
    if (encounterData.diagnoses.length > 1) {
      const newDiagnoses = encounterData.diagnoses.filter((_, i) => i !== index);
      setEncounterData(prev => ({ ...prev, diagnoses: newDiagnoses }));
    }
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    try {
      updateEncounterNotesSchema.parse(encounterData);

      // Check for conflicts with existing records
      if (selectedEncounter && selectedEncounter.status === 'finalized') {
        // Additional validation for finalized records
        if (!encounterData.notes && !encounterData.treatmentPlan) {
          errors.general = "Cannot save empty notes for finalized record";
        }
      }

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
    if (!validateForm()) {
      // Show validation popup
      alert("Please deal with the errors and save again");
      return;
    }

    setIsSaving(true);
    setSuccess(false);

    try {
      // Update encounter
      const updates = {
        notes: encounterData.notes,
        treatmentPlan: encounterData.treatmentPlan,
        diagnoses: encounterData.diagnoses.filter(d => d.trim() !== ''),
        updatedAt: new Date().toISOString()
      };

      // Update encounter in system
      const updatedEncounter = clinicalDataManager.updateEncounter(encounterData.encounterId, updates);

      if (updatedEncounter) {
        // Update local state
        setSelectedEncounter(updatedEncounter);
        setEncounters(prev => prev.map(enc =>
          enc.id === encounterData.encounterId ? updatedEncounter : enc
        ));

        // Update original data
        setOriginalData(encounterData);

        // Log encounter notes update for audit trail
        logClinicalAccess('update_encounter_notes', selectedPatient.id, session?.username || 'unknown');

        setSuccess(true);
        setIsEditing(false);
        setHasUnsavedChanges(false);

        // Hide success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      }

    } catch (error) {
      console.error("Error saving encounter notes:", error);
      setValidationErrors({ general: "Failed to save encounter notes. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackToDashboard = () => {
    if (hasUnsavedChanges) {
      const confirmDiscard = window.confirm("You have unsaved changes. Are you sure you want to leave?");
      if (!confirmDiscard) return;
    }

    router.push("/provider/dashboard");
  };

  const handleBackToPatientEHR = () => {
    if (hasUnsavedChanges) {
      const confirmDiscard = window.confirm("You have unsaved changes. Are you sure you want to leave?");
      if (!confirmDiscard) return;
    }

    if (selectedPatient) {
      router.push(`/provider/patient-ehr?patientId=${selectedPatient.id}`);
    } else {
      router.push("/provider/dashboard");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading encounter notes...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in as a provider to update encounter notes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
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
              <Button
                onClick={handleBackToPatientEHR}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <User className="w-4 h-4" />
                <span>View Patient EHR</span>
              </Button>
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900">Update Encounter Notes</h1>
          <p className="text-gray-600 mt-2">
            Review and update past encounter notes with comprehensive tracking and safeguards
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <Card className="p-4 mb-6 bg-green-50 border-green-200">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-700 font-medium">Encounter notes updated successfully!</p>
            </div>
          </Card>
        )}

        {/* Unsaved Changes Warning */}
        {hasUnsavedChanges && (
          <Card className="p-4 mb-6 bg-yellow-50 border-yellow-200">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <p className="text-yellow-700 font-medium">You have unsaved changes</p>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Patient and Encounter Selection */}
          <div className="space-y-6">
            {/* Patient Selection */}
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <User className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Select Patient</h2>
              </div>

              <div className="space-y-4">
                <select
                  value={selectedPatient?.id || ''}
                  onChange={(e) => handlePatientSelect(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a patient...</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName}
                    </option>
                  ))}
                </select>

                {selectedPatient && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm"><strong>DOB:</strong> {new Date(selectedPatient.dateOfBirth).toLocaleDateString()}</p>
                    <p className="text-sm"><strong>Encounters:</strong> {encounters.length}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Encounter List */}
            {encounters.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Past Encounters</h2>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {encounters.map((encounter) => (
                    <button
                      key={encounter.id}
                      onClick={() => handleEncounterSelect(encounter)}
                      className={`w-full text-left p-4 rounded-lg border transition-colors ${
                        selectedEncounter?.id === encounter.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {new Date(encounter.encounterDate).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {encounter.reasonForVisit}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              encounter.status === 'finalized'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {encounter.status}
                            </span>
                            {encounter.status === 'finalized' && (
                              <Lock className="w-3 h-3 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Encounter Details */}
          <div className="lg:col-span-2">
            {selectedEncounter ? (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Encounter Details</h2>
                  </div>

                  {!isEditing && (
                    <Button
                      onClick={handleStartEditing}
                      className="flex items-center space-x-2"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit Notes</span>
                    </Button>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Encounter Info */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Date:</strong> {new Date(selectedEncounter.encounterDate).toLocaleDateString()}</p>
                        <p><strong>Reason:</strong> {selectedEncounter.reasonForVisit}</p>
                      </div>
                      <div>
                        <p><strong>Status:</strong> {selectedEncounter.status}</p>
                        <p><strong>Provider:</strong> {selectedEncounter.providerId}</p>
                      </div>
                    </div>
                  </div>

                  {/* Vital Signs */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Vital Signs</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Height</p>
                        <p className="font-medium">{selectedEncounter.vitals?.height || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Weight</p>
                        <p className="font-medium">{selectedEncounter.vitals?.weight || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Blood Pressure</p>
                        <p className="font-medium">{selectedEncounter.vitals?.bloodPressure || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Heart Rate</p>
                        <p className="font-medium">{selectedEncounter.vitals?.heartRate || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Diagnoses */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Diagnoses</h3>
                    {isEditing ? (
                      <div className="space-y-2">
                        {encounterData.diagnoses.map((diagnosis, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={diagnosis}
                              onChange={(e) => handleDiagnosisChange(index, e.target.value)}
                              placeholder="Enter diagnosis"
                              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {encounterData.diagnoses.length > 1 && (
                              <Button
                                onClick={() => removeDiagnosis(index)}
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          onClick={addDiagnosis}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          Add Diagnosis
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {selectedEncounter.diagnoses?.map((diagnosis: string, index: number) => (
                          <p key={index} className="text-sm bg-gray-50 p-2 rounded">
                            {index + 1}. {diagnosis}
                          </p>
                        )) || <p className="text-gray-500">No diagnoses recorded</p>}
                      </div>
                    )}
                  </div>

                  {/* Treatment Plan */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Treatment Plan</h3>
                    {isEditing ? (
                      <textarea
                        value={encounterData.treatmentPlan}
                        onChange={(e) => handleInputChange('treatmentPlan', e.target.value)}
                        placeholder="Enter treatment plan"
                        rows={4}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm">
                          {selectedEncounter.treatmentPlan || 'No treatment plan recorded'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Notes</h3>
                    {isEditing ? (
                      <textarea
                        value={encounterData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        placeholder="Enter additional notes"
                        rows={4}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm">
                          {selectedEncounter.notes || 'No additional notes'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* General Error */}
                  {validationErrors.general && (
                    <div className="p-4 bg-red-50 border-red-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <p className="text-red-700">{validationErrors.general}</p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {isEditing && (
                    <div className="flex justify-end space-x-4 pt-4 border-t">
                      <Button
                        onClick={handleCancelEditing}
                        variant="outline"
                        disabled={isSaving}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center space-x-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <Card className="p-8 text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Select a patient and encounter to view and edit notes</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
