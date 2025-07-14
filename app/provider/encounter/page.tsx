"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, User, FileText, Stethoscope, ClipboardList, Upload, AlertCircle } from "lucide-react";
import { clinicalDataManager } from "@/lib/clinical-mock-data";
import { documentEncounterSchema, validateVitalSigns, logClinicalAccess } from "@/lib/clinical-validation";
import { sessionManager, type UserSession } from "@/lib/epic3-mock-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { z } from "zod";

interface FormData {
  patientId: string;
  reasonForVisit: string;
  vitals: {
    height: string;
    weight: string;
    bloodPressure: string;
    heartRate: string;
    temperature: string;
    respiratoryRate: string;
    oxygenSaturation: string;
  };
  diagnoses: string[];
  treatmentPlan: string;
  notes: string;
  attachments: string[];
}

export default function DocumentPatientEncounterPage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [formData, setFormData] = useState<FormData>({
    patientId: '',
    reasonForVisit: '',
    vitals: {
      height: '',
      weight: '',
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      respiratoryRate: '',
      oxygenSaturation: ''
    },
    diagnoses: [''],
    treatmentPlan: '',
    notes: '',
    attachments: []
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
    const patientsData = clinicalDataManager.getPatients();
    setPatients(patientsData);
    
    setIsLoading(false);
  }, [router]);

  const handlePatientSelect = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    setSelectedPatient(patient);
    setFormData(prev => ({ ...prev, patientId }));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleVitalChange = (vital: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      vitals: { ...prev.vitals, [vital]: value }
    }));
    // Clear validation error when user starts typing
    if (validationErrors[`vitals.${vital}`]) {
      setValidationErrors(prev => ({ ...prev, [`vitals.${vital}`]: '' }));
    }
  };

  const handleDiagnosisChange = (index: number, value: string) => {
    const newDiagnoses = [...formData.diagnoses];
    newDiagnoses[index] = value;
    setFormData(prev => ({ ...prev, diagnoses: newDiagnoses }));
  };

  const addDiagnosis = () => {
    setFormData(prev => ({
      ...prev,
      diagnoses: [...prev.diagnoses, '']
    }));
  };

  const removeDiagnosis = (index: number) => {
    if (formData.diagnoses.length > 1) {
      const newDiagnoses = formData.diagnoses.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, diagnoses: newDiagnoses }));
    }
  };

  const handleAttachmentUpload = (file: File) => {
    // In a real app, this would upload the file to a server
    const fileName = `${Date.now()}-${file.name}`;
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, fileName]
    }));
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    try {
      // Validate main form data
      documentEncounterSchema.parse({
        patientId: formData.patientId,
        reasonForVisit: formData.reasonForVisit,
        vitals: formData.vitals,
        diagnoses: formData.diagnoses.filter(d => d.trim() !== ''),
        treatmentPlan: formData.treatmentPlan,
        notes: formData.notes,
        attachments: formData.attachments
      });

      // Validate vital signs
      const vitalErrors = validateVitalSigns(formData.vitals);
      vitalErrors.forEach(error => {
        errors[`vitals.${error.split(' ')[0].toLowerCase()}`] = error;
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err: any) => {
          if (err.path.length > 0) {
            errors[err.path.join('.')] = err.message;
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
      // Create encounter object
      const encounter = {
        patientId: formData.patientId,
        providerId: session?.username || 'current-provider',
        encounterDate: new Date().toISOString(),
        reasonForVisit: formData.reasonForVisit,
        vitals: formData.vitals,
        diagnoses: formData.diagnoses.filter(d => d.trim() !== ''),
        treatmentPlan: formData.treatmentPlan,
        notes: formData.notes,
        attachments: formData.attachments,
        status: 'finalized' as const
      };

      // Save encounter
      const savedEncounter = clinicalDataManager.addEncounter(formData.patientId, encounter);
      
      // Log encounter creation for audit trail
      logClinicalAccess('create_encounter', formData.patientId, session?.username || 'unknown');
      
      setSuccess(true);
      
      // Redirect to patient EHR after a short delay
      setTimeout(() => {
        router.push(`/provider/patient-ehr?patientId=${formData.patientId}`);
      }, 2000);
      
    } catch (error) {
      console.error("Error saving encounter:", error);
      setValidationErrors({ general: "Failed to save encounter. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackToDashboard = () => {
    router.push("/provider/dashboard");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading encounter form...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in as a provider to document patient encounters.</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Encounter Saved Successfully!</h2>
          <p className="text-gray-600 mb-4">
            The patient encounter has been saved to the EHR system.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to patient EHR...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={handleBackToDashboard}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900">Document Patient Encounter</h1>
          <p className="text-gray-600 mt-2">
            Record details of patient encounters for accurate and up-to-date patient records
          </p>
        </div>

        {/* Form */}
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
                  value={formData.patientId}
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
                    <p><strong>DOB:</strong> {new Date(selectedPatient.dateOfBirth).toLocaleDateString()}</p>
                    <p><strong>Phone:</strong> {selectedPatient.phone}</p>
                    <p><strong>Email:</strong> {selectedPatient.email}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Encounter Details */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Encounter Details</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Visit *
                </label>
                <input
                  type="text"
                  value={formData.reasonForVisit}
                  onChange={(e) => handleInputChange('reasonForVisit', e.target.value)}
                  placeholder="Enter reason for visit"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {validationErrors.reasonForVisit && (
                  <p className="mt-2 text-sm text-red-600">{validationErrors.reasonForVisit}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Vital Signs */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Stethoscope className="w-5 h-5 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-900">Vital Signs</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
                <input
                  type="text"
                  value={formData.vitals.height}
                  onChange={(e) => handleVitalChange('height', e.target.value)}
                  placeholder="e.g., 175cm"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight</label>
                <input
                  type="text"
                  value={formData.vitals.weight}
                  onChange={(e) => handleVitalChange('weight', e.target.value)}
                  placeholder="e.g., 70kg"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Blood Pressure</label>
                <input
                  type="text"
                  value={formData.vitals.bloodPressure}
                  onChange={(e) => handleVitalChange('bloodPressure', e.target.value)}
                  placeholder="e.g., 120/80"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {validationErrors['vitals.bloodPressure'] && (
                  <p className="mt-2 text-sm text-red-600">{validationErrors['vitals.bloodPressure']}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Heart Rate</label>
                <input
                  type="text"
                  value={formData.vitals.heartRate}
                  onChange={(e) => handleVitalChange('heartRate', e.target.value)}
                  placeholder="e.g., 72"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {validationErrors['vitals.heartRate'] && (
                  <p className="mt-2 text-sm text-red-600">{validationErrors['vitals.heartRate']}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Temperature</label>
                <input
                  type="text"
                  value={formData.vitals.temperature}
                  onChange={(e) => handleVitalChange('temperature', e.target.value)}
                  placeholder="e.g., 36.5"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {validationErrors['vitals.temperature'] && (
                  <p className="mt-2 text-sm text-red-600">{validationErrors['vitals.temperature']}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Respiratory Rate</label>
                <input
                  type="text"
                  value={formData.vitals.respiratoryRate}
                  onChange={(e) => handleVitalChange('respiratoryRate', e.target.value)}
                  placeholder="e.g., 16"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {validationErrors['vitals.respiratoryRate'] && (
                  <p className="mt-2 text-sm text-red-600">{validationErrors['vitals.respiratoryRate']}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Oxygen Saturation</label>
                <input
                  type="text"
                  value={formData.vitals.oxygenSaturation}
                  onChange={(e) => handleVitalChange('oxygenSaturation', e.target.value)}
                  placeholder="e.g., 98"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {validationErrors['vitals.oxygenSaturation'] && (
                  <p className="mt-2 text-sm text-red-600">{validationErrors['vitals.oxygenSaturation']}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Diagnoses */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <ClipboardList className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">Diagnoses</h2>
            </div>
            
            <div className="space-y-4">
              {formData.diagnoses.map((diagnosis, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={diagnosis}
                    onChange={(e) => handleDiagnosisChange(index, e.target.value)}
                    placeholder="Enter diagnosis"
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {formData.diagnoses.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeDiagnosis(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={addDiagnosis}
                className="w-full"
              >
                Add Another Diagnosis
              </Button>
              
              {validationErrors.diagnoses && (
                <p className="mt-2 text-sm text-red-600">{validationErrors.diagnoses}</p>
              )}
            </div>
          </Card>

          {/* Treatment Plan and Notes */}
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Treatment Plan *
                </label>
                <textarea
                  value={formData.treatmentPlan}
                  onChange={(e) => handleInputChange('treatmentPlan', e.target.value)}
                  placeholder="Enter treatment plan"
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {validationErrors.treatmentPlan && (
                  <p className="mt-2 text-sm text-red-600">{validationErrors.treatmentPlan}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Enter additional notes"
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {validationErrors.notes && (
                  <p className="mt-2 text-sm text-red-600">{validationErrors.notes}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Attachments */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Upload className="w-5 h-5 text-orange-600" />
              <h2 className="text-xl font-semibold text-gray-900">Attachments</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Documents (Optional)
                </label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    if (e.target.files) {
                      Array.from(e.target.files).forEach(file => {
                        handleAttachmentUpload(file);
                      });
                    }
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {formData.attachments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Uploaded Files:</p>
                  {formData.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{attachment}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* General Error */}
          {validationErrors.general && (
            <Card className="p-4 bg-red-50 border-red-200">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-700">{validationErrors.general}</p>
              </div>
            </Card>
          )}

          {/* Save Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleBackToDashboard}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>{isSaving ? 'Saving...' : 'Save Encounter'}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}