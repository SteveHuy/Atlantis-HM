"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, User, FileText, MessageSquare, CheckCircle, AlertCircle, Calendar, AlertTriangle, Download } from "lucide-react";
import { clinicalDataManager } from "@/lib/clinical-mock-data";
import { generateReferralSchema, logClinicalAccess } from "@/lib/clinical-validation";
import { sessionManager, type UserSession } from "@/lib/epic3-mock-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { z } from "zod";

interface ReferralData {
  patientId: string;
  specialtyType: string;
  referralReason: string;
  urgency: 'routine' | 'urgent' | 'stat';
  preferredProvider: string;
  notes: string;
  referringProvider: string;
}

interface ReferralPreview {
  patient: any;
  specialty: string;
  reason: string;
  urgency: string;
  provider: string;
  notes: string;
}

export default function GenerateReferralsPage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [referralData, setReferralData] = useState<ReferralData>({
    patientId: '',
    specialtyType: '',
    referralReason: '',
    urgency: 'routine',
    preferredProvider: '',
    notes: '',
    referringProvider: ''
  });
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState(false);
  const [referralPreview, setReferralPreview] = useState<ReferralPreview | null>(null);

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
    setReferralData(prev => ({ ...prev, patientId }));
    // Clear validation error when user selects a patient
    if (validationErrors.patientId) {
      setValidationErrors(prev => ({ ...prev, patientId: '' }));
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setReferralData(prev => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateCurrentStep = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (currentStep === 1) {
      if (!referralData.patientId) {
        errors.patientId = "Patient selection is required";
      }
    } else if (currentStep === 2) {
      if (!referralData.specialtyType) {
        errors.specialtyType = "Specialty type is required";
      }
      if (!referralData.referralReason || referralData.referralReason.trim().length === 0) {
        errors.referralReason = "Referral reason is required";
      } else if (referralData.referralReason.length > 512) {
        errors.referralReason = "Referral reason must be 512 characters or less";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      if (currentStep === 2) {
        // Generate preview
        setReferralPreview({
          patient: selectedPatient,
          specialty: referralData.specialtyType,
          reason: referralData.referralReason,
          urgency: referralData.urgency,
          provider: referralData.preferredProvider || 'Any available provider',
          notes: referralData.notes
        });
      }
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleEditReferral = () => {
    setCurrentStep(2);
    setReferralPreview(null);
  };

  const validateFullReferral = (): boolean => {
    const errors: { [key: string]: string } = {};

    try {
      generateReferralSchema.parse(referralData);
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

  const handleSubmitReferral = async () => {
    if (!validateFullReferral()) return;

    setIsSubmitting(true);
    setSuccess(false);

    try {
      // Create referral object
      const referral = {
        patientId: referralData.patientId,
        referringProviderId: referralData.referringProvider,
        specialtyType: referralData.specialtyType,
        referralReason: referralData.referralReason,
        urgency: referralData.urgency,
        status: 'sent' as const,
        notes: referralData.notes,
        sentAt: new Date().toISOString()
      };

      // Add referral to system
      const savedReferral = clinicalDataManager.addReferral(referral);
      
      // Log referral generation for audit trail
      logClinicalAccess('generate_referral', referralData.patientId, session?.username || 'unknown');
      
      setSuccess(true);
      
      // Redirect to patient EHR after a short delay
      setTimeout(() => {
        router.push(`/provider/patient-ehr?patientId=${referralData.patientId}`);
      }, 3000);
      
    } catch (error) {
      console.error("Error submitting referral:", error);
      setValidationErrors({ general: "Failed to submit referral. Please try again." });
    } finally {
      setIsSubmitting(false);
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
          <p className="mt-4 text-gray-600">Loading referral form...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in as a provider to generate referrals.</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 max-w-lg text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Referral Sent Successfully!</h2>
          <p className="text-gray-600 mb-4">
            The referral has been generated and sent electronically to the specialist.
          </p>
          <div className="text-sm text-gray-500 space-y-1 mb-6">
            <p><strong>Patient:</strong> {selectedPatient?.firstName} {selectedPatient?.lastName}</p>
            <p><strong>Specialty:</strong> {referralData.specialtyType}</p>
            <p><strong>Urgency:</strong> {referralData.urgency}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span>Referral details updated in patient EHR</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <MessageSquare className="w-4 h-4" />
              <span>Secure communication enabled with specialist</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4">
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
          
          <h1 className="text-3xl font-bold text-gray-900">Generate Referral</h1>
          <p className="text-gray-600 mt-2">
            Generate referrals to specialists for your patients
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {/* Step 1: Patient Selection */}
          {currentStep === 1 && (
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <User className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Step 1: Select Patient</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose Patient *
                  </label>
                  <select
                    value={referralData.patientId}
                    onChange={(e) => handlePatientSelect(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a patient...</option>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Name:</strong> {selectedPatient.firstName} {selectedPatient.lastName}</p>
                        <p><strong>DOB:</strong> {new Date(selectedPatient.dateOfBirth).toLocaleDateString()}</p>
                        <p><strong>Phone:</strong> {selectedPatient.phone}</p>
                      </div>
                      <div>
                        <p><strong>Email:</strong> {selectedPatient.email}</p>
                        <p><strong>Last Visit:</strong> {selectedPatient.lastVisit ? new Date(selectedPatient.lastVisit).toLocaleDateString() : 'No visits'}</p>
                        <p><strong>Allergies:</strong> {selectedPatient.allergies.length > 0 ? selectedPatient.allergies.map((a: any) => a.allergen).join(', ') : 'None'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Step 2: Referral Details */}
          {currentStep === 2 && (
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="w-5 h-5 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">Step 2: Referral Details</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specialty Type *
                  </label>
                  <select
                    value={referralData.specialtyType}
                    onChange={(e) => handleInputChange('specialtyType', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select specialty...</option>
                    {mockSpecialties.map(specialty => (
                      <option key={specialty} value={specialty}>
                        {specialty}
                      </option>
                    ))}
                  </select>
                  {validationErrors.specialtyType && (
                    <p className="mt-2 text-sm text-red-600">{validationErrors.specialtyType}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Referral *
                  </label>
                  <textarea
                    value={referralData.referralReason}
                    onChange={(e) => handleInputChange('referralReason', e.target.value)}
                    placeholder="Enter detailed reason for referral (max 512 characters)"
                    rows={4}
                    maxLength={512}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex justify-between items-center mt-1">
                    {validationErrors.referralReason && (
                      <p className="text-sm text-red-600">{validationErrors.referralReason}</p>
                    )}
                    <p className="text-sm text-gray-500 ml-auto">
                      {referralData.referralReason.length}/512 characters
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Urgency Level
                    </label>
                    <select
                      value={referralData.urgency}
                      onChange={(e) => handleInputChange('urgency', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="routine">Routine</option>
                      <option value="urgent">Urgent</option>
                      <option value="stat">STAT</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Provider (Optional)
                    </label>
                    <input
                      type="text"
                      value={referralData.preferredProvider}
                      onChange={(e) => handleInputChange('preferredProvider', e.target.value)}
                      placeholder="Specific provider name"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={referralData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Any additional notes or special instructions"
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Step 3: Review and Submit */}
          {currentStep === 3 && referralPreview && (
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Send className="w-5 h-5 text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-900">Step 3: Review and Submit</h2>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">Referral Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Patient:</strong> {referralPreview.patient.firstName} {referralPreview.patient.lastName}</p>
                      <p><strong>Specialty:</strong> {referralPreview.specialty}</p>
                      <p><strong>Urgency:</strong> {referralPreview.urgency}</p>
                    </div>
                    <div>
                      <p><strong>Preferred Provider:</strong> {referralPreview.provider}</p>
                      <p><strong>Referring Provider:</strong> {referralData.referringProvider}</p>
                      <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Reason for Referral:</h4>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-900">{referralPreview.reason}</p>
                  </div>
                </div>
                
                {referralPreview.notes && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Additional Notes:</h4>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{referralPreview.notes}</p>
                    </div>
                  </div>
                )}
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-900">Ready to Submit</p>
                      <p className="text-sm text-green-700">
                        This referral will be sent electronically to the specialist and updated in the patient's EHR.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    onClick={handleEditReferral}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Edit Referral</span>
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* General Error */}
          {validationErrors.general && (
            <Card className="p-4 bg-red-50 border-red-200">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-700">{validationErrors.general}</p>
              </div>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <div>
              {currentStep > 1 && (
                <Button
                  onClick={handlePrevStep}
                  variant="outline"
                  disabled={isSubmitting}
                >
                  Previous
                </Button>
              )}
            </div>
            
            <div className="flex space-x-4">
              <Button
                onClick={handleBackToDashboard}
                variant="outline"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              
              {currentStep < 3 ? (
                <Button
                  onClick={handleNextStep}
                  disabled={!referralData.patientId || (currentStep === 2 && (!referralData.specialtyType || !referralData.referralReason))}
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmitReferral}
                  disabled={isSubmitting}
                  className="flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting...' : 'Generate Referral'}</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}