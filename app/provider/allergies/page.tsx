"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertTriangle, Save, User, History, Plus, X } from "lucide-react";
import { clinicalDataManager } from "@/lib/clinical-mock-data";
import { updateAllergySchema, checkDrugAllergies, logClinicalAccess } from "@/lib/clinical-validation";
import { sessionManager, type UserSession } from "@/lib/epic3-mock-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { z } from "zod";

interface AllergyData {
  patientId: string;
  allergen: string;
  allergenType: 'medication' | 'food' | 'environmental' | 'other';
  severity: 'low' | 'medium' | 'high';
  reaction: string;
  notes: string;
  onsetDate: string;
  providerId: string;
}

export default function UpdateAllergyInfoPage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [existingAllergies, setExistingAllergies] = useState<any[]>([]);
  const [allergyData, setAllergyData] = useState<AllergyData>({
    patientId: '',
    allergen: '',
    allergenType: 'medication',
    severity: 'medium',
    reaction: '',
    notes: '',
    onsetDate: '',
    providerId: ''
  });
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [drugInteractions, setDrugInteractions] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

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
    setAllergyData(prev => ({ ...prev, patientId }));
    
    if (patient) {
      setExistingAllergies(patient.allergies || []);
      
      // Check for drug interactions with current medications
      if (allergyData.allergen) {
        checkInteractions(patient, allergyData.allergen);
      }
    }
    
    // Clear validation error when user selects a patient
    if (validationErrors.patientId) {
      setValidationErrors(prev => ({ ...prev, patientId: '' }));
    }
  };

  const checkInteractions = (patient: any, allergen: string) => {
    const activeMedications = patient.medications
      .filter((med: any) => med.status === 'active')
      .map((med: any) => med.name);
    
    const interactions = checkDrugAllergies([allergen], activeMedications);
    setDrugInteractions(interactions);
  };

  const handleInputChange = (field: string, value: string) => {
    setAllergyData(prev => ({ ...prev, [field]: value }));
    
    // Check for drug interactions when allergen changes
    if (field === 'allergen' && selectedPatient && value) {
      checkInteractions(selectedPatient, value);
    }
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    try {
      updateAllergySchema.parse(allergyData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach(err => {
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
      // Create allergy object
      const allergy = {
        patientId: allergyData.patientId,
        allergen: allergyData.allergen,
        allergenType: allergyData.allergenType,
        severity: allergyData.severity,
        reaction: allergyData.reaction,
        notes: allergyData.notes,
        onsetDate: allergyData.onsetDate,
        providerId: allergyData.providerId
      };

      // Add allergy to patient record
      const savedAllergy = clinicalDataManager.addAllergy(allergyData.patientId, allergy);
      
      // Update existing allergies display
      setExistingAllergies(prev => [...prev, savedAllergy]);
      
      // Log allergy update for audit trail
      logClinicalAccess('update_allergy_info', allergyData.patientId, session?.username || 'unknown');
      
      setSuccess(true);
      
      // Reset form
      setAllergyData({
        patientId: allergyData.patientId,
        allergen: '',
        allergenType: 'medication',
        severity: 'medium',
        reaction: '',
        notes: '',
        onsetDate: '',
        providerId: allergyData.providerId
      });
      
      // Clear interactions
      setDrugInteractions([]);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (error) {
      console.error("Error saving allergy:", error);
      setValidationErrors({ general: "Failed to save allergy information. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveAllergy = (allergyId: string) => {
    // In a real app, this would call an API to remove the allergy
    setExistingAllergies(prev => prev.filter(allergy => allergy.id !== allergyId));
  };

  const handleViewHistory = () => {
    setShowHistory(!showHistory);
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading allergy information...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in as a provider to update allergy information.</p>
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
          
          <h1 className="text-3xl font-bold text-gray-900">Update Allergy Information</h1>
          <p className="text-gray-600 mt-2">
            Safely update patient allergy information with comprehensive tracking and drug interaction alerts
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <Card className="p-4 mb-6 bg-green-50 border-green-200">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-green-600" />
              <p className="text-green-700 font-medium">Allergy information updated successfully!</p>
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
                  value={allergyData.patientId}
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
                    <p><strong>DOB:</strong> {new Date(selectedPatient.dateOfBirth).toLocaleDateString()}</p>
                    <p><strong>Current Allergies:</strong> {existingAllergies.length}</p>
                    <p><strong>Active Medications:</strong> {selectedPatient.medications.filter((m: any) => m.status === 'active').length}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Existing Allergies */}
          {selectedPatient && existingAllergies.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <History className="w-5 h-5 text-purple-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Current Allergies</h2>
                </div>
                <Button
                  onClick={handleViewHistory}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <History className="w-4 h-4" />
                  <span>{showHistory ? 'Hide' : 'View'} History</span>
                </Button>
              </div>
              
              <div className="space-y-3">
                {existingAllergies.map((allergy) => (
                  <div key={allergy.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-red-900">{allergy.allergen}</span>
                        <span className={`text-xs px-2 py-1 rounded-full border ${getSeverityColor(allergy.severity)}`}>
                          {allergy.severity}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {allergy.allergenType}
                        </span>
                      </div>
                      <p className="text-sm text-red-700 mt-1">{allergy.reaction}</p>
                      {allergy.notes && (
                        <p className="text-sm text-gray-600 mt-1">Note: {allergy.notes}</p>
                      )}
                    </div>
                    <Button
                      onClick={() => handleRemoveAllergy(allergy.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Drug Interactions Warning */}
          {drugInteractions.length > 0 && (
            <Card className="p-6 bg-yellow-50 border-yellow-200">
              <div className="flex items-center space-x-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <h2 className="text-xl font-semibold text-yellow-900">Drug Interaction Alert</h2>
              </div>
              
              <div className="space-y-2">
                {drugInteractions.map((interaction, index) => (
                  <div key={index} className="p-3 bg-yellow-100 rounded-lg">
                    <p className="text-sm text-yellow-800">{interaction}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Add New Allergy */}
          {selectedPatient && (
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Plus className="w-5 h-5 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">Add New Allergy</h2>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Allergen *
                    </label>
                    <input
                      type="text"
                      value={allergyData.allergen}
                      onChange={(e) => handleInputChange('allergen', e.target.value)}
                      placeholder="Enter allergen name"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {validationErrors.allergen && (
                      <p className="mt-2 text-sm text-red-600">{validationErrors.allergen}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Allergen Type *
                    </label>
                    <select
                      value={allergyData.allergenType}
                      onChange={(e) => handleInputChange('allergenType', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="medication">Medication</option>
                      <option value="food">Food</option>
                      <option value="environmental">Environmental</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Severity Level *
                    </label>
                    <select
                      value={allergyData.severity}
                      onChange={(e) => handleInputChange('severity', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Onset Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={allergyData.onsetDate}
                      onChange={(e) => handleInputChange('onsetDate', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reaction *
                  </label>
                  <textarea
                    value={allergyData.reaction}
                    onChange={(e) => handleInputChange('reaction', e.target.value)}
                    placeholder="Describe the allergic reaction"
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {validationErrors.reaction && (
                    <p className="mt-2 text-sm text-red-600">{validationErrors.reaction}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={allergyData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Any additional notes about the allergy"
                    rows={2}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {validationErrors.notes && (
                    <p className="mt-2 text-sm text-red-600">{validationErrors.notes}</p>
                  )}
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
                disabled={isSaving || !allergyData.allergen || !allergyData.reaction}
                className="flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Update Allergy'}</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}