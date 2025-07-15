'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Pill,
  Send,
  ArrowLeft,
  AlertTriangle,
  User,
  Search,
  CheckCircle,
  Shield
} from 'lucide-react';
import { sessionManager, type UserSession } from '@/lib/epic3-mock-data';
import {
  serviceProviderDataManager,
  mockMedications,
  mockPharmacies,
  type Medication
} from '@/lib/service-provider-mock-data';
import { medicationOrderSchema } from '@/lib/service-provider-validation';

// Mock patients for selection
const mockPatients = [
  { id: 'patient-1', name: 'John Doe', age: 45, allergies: ['Penicillin'] },
  { id: 'patient-2', name: 'Jane Smith', age: 32, allergies: [] },
  { id: 'patient-3', name: 'Bob Johnson', age: 67, allergies: ['Sulfa', 'NSAIDs'] },
  { id: 'patient-4', name: 'Alice Brown', age: 28, allergies: ['Latex'] }
];

interface MedicationOrderForm {
  patientId: string;
  drugName: string;
  dosage: string;
  duration: string;
  frequency: string;
  route: string;
  pharmacyId: string;
  specialInstructions: string;
  quantity: number;
  refills: number;
}

export default function MedicationOrdersPage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState<MedicationOrderForm>({
    patientId: '',
    drugName: '',
    dosage: '',
    duration: '',
    frequency: '',
    route: '',
    pharmacyId: '',
    specialInstructions: '',
    quantity: 30,
    refills: 0
  });

  // Selected medication details
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<typeof mockPatients[0] | null>(null);

  // Drug search
  const [drugSearchQuery, setDrugSearchQuery] = useState('');
  const [drugSearchResults, setDrugSearchResults] = useState<Medication[]>([]);
  const [showDrugSearch, setShowDrugSearch] = useState(false);

  // UI state
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [sendSuccess, setSendSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Alerts
  const [drugInteractionAlerts, setDrugInteractionAlerts] = useState<string[]>([]);
  const [allergyAlerts, setAllergyAlerts] = useState<string[]>([]);

  useEffect(() => {
    const userSession = sessionManager.getSession();

    if (!userSession || userSession.role !== 'provider') {
      router.push('/provider/login');
      return;
    }

    setSession(userSession);
    setIsLoading(false);
  }, [router]);

  const handlePatientChange = (patientId: string) => {
    const patient = mockPatients.find(p => p.id === patientId);
    setSelectedPatient(patient || null);
    setFormData(prev => ({ ...prev, patientId }));

    // Check for allergy interactions with current medication
    if (patient && selectedMedication) {
      checkAllergyInteractions(patient, selectedMedication);
    }
  };

  const handleDrugSearch = (query: string) => {
    setDrugSearchQuery(query);

    if (query.length >= 2) {
      const results = mockMedications.filter(med =>
        med.name.toLowerCase().includes(query.toLowerCase()) ||
        med.genericName.toLowerCase().includes(query.toLowerCase())
      );
      setDrugSearchResults(results);
      setShowDrugSearch(true);
    } else {
      setShowDrugSearch(false);
      setDrugSearchResults([]);
    }
  };

  const selectMedication = (medication: Medication) => {
    setSelectedMedication(medication);
    setFormData(prev => ({
      ...prev,
      drugName: medication.name,
      dosage: medication.dosageOptions[0] || '',
      frequency: medication.frequencyOptions[0] || '',
      route: medication.routeOptions[0] || ''
    }));
    setShowDrugSearch(false);
    setDrugSearchQuery(medication.name);

    // Check for drug interactions and allergies
    setDrugInteractionAlerts(medication.commonInteractions);
    if (selectedPatient) {
      checkAllergyInteractions(selectedPatient, medication);
    }
  };

  const checkAllergyInteractions = (patient: typeof mockPatients[0], medication: Medication) => {
    const alerts: string[] = [];

    // Check if medication name contains any patient allergies
    patient.allergies.forEach(allergy => {
      if (medication.name.toLowerCase().includes(allergy.toLowerCase()) ||
          medication.category.toLowerCase().includes(allergy.toLowerCase())) {
        alerts.push(`Patient is allergic to ${allergy}`);
      }
    });

    setAllergyAlerts(alerts);
  };

  const updateFormField = (field: keyof MedicationOrderForm, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear field-specific errors
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.patientId) errors.patientId = 'Patient selection is required';
    if (!formData.drugName) errors.drugName = 'Drug name is required';
    if (!formData.dosage) errors.dosage = 'Dosage is required';
    if (!formData.duration) errors.duration = 'Duration is required';
    if (!formData.frequency) errors.frequency = 'Frequency is required';
    if (!formData.route) errors.route = 'Route is required';
    if (formData.quantity <= 0) errors.quantity = 'Quantity must be positive';
    if (formData.refills < 0) errors.refills = 'Refills cannot be negative';
    if (formData.refills > 11) errors.refills = 'Cannot exceed 11 refills';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSendPrescription = async () => {
    setSendError('');
    setSendSuccess(false);
    setIsSending(true);

    try {
      // Validate form
      if (!validateForm()) {
        setSendError('Please correct the form errors before submitting');
        setIsSending(false);
        return;
      }

      // Validate with schema
      const validationResult = medicationOrderSchema.safeParse(formData);

      if (!validationResult.success) {
        const errors = validationResult.error.issues.map((e: any) => e.message).join(', ');
        setSendError(errors);
        setIsSending(false);
        return;
      }

      // Mock prescription sending
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call

      // Log the prescription order
      serviceProviderDataManager.logSecurityEvent(
        'PRESCRIPTION_ORDERED',
        'medication_order',
        `${formData.patientId}-${Date.now()}`,
        `Prescription ordered: ${formData.drugName} for ${selectedPatient?.name}`
      );

      setSendSuccess(true);

      // Reset form
      setFormData({
        patientId: '',
        drugName: '',
        dosage: '',
        duration: '',
        frequency: '',
        route: '',
        pharmacyId: '',
        specialInstructions: '',
        quantity: 30,
        refills: 0
      });
      setSelectedMedication(null);
      setSelectedPatient(null);
      setDrugSearchQuery('');
      setDrugInteractionAlerts([]);
      setAllergyAlerts([]);

      // Auto-hide success message and redirect
      setTimeout(() => {
        setSendSuccess(false);
        router.push(`/provider/patient-ehr?patientId=${formData.patientId}`);
      }, 3000);

    } catch (error) {
      setSendError('Failed to send prescription. Please try again.');
      console.error('Send prescription error:', error);
    } finally {
      setIsSending(false);
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
              <h1 className="text-2xl font-bold text-blue-600">Order Medication</h1>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {session.fullName}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {sendSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800">Prescription sent successfully to pharmacy and patient EHR updated</span>
          </div>
        )}

        {/* Error Message */}
        {sendError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{sendError}</span>
          </div>
        )}

        {/* Allergy Alerts */}
        {allergyAlerts.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-800">Allergy Alert</span>
            </div>
            <ul className="text-sm text-red-700 list-disc list-inside">
              {allergyAlerts.map((alert, index) => (
                <li key={index}>{alert}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Drug Interaction Alerts */}
        {drugInteractionAlerts.length > 0 && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <span className="font-medium text-amber-800">Drug Interaction Alert</span>
            </div>
            <p className="text-sm text-amber-700 mb-2">This medication may interact with:</p>
            <ul className="text-sm text-amber-700 list-disc list-inside">
              {drugInteractionAlerts.map((interaction, index) => (
                <li key={index}>{interaction}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Medication Order Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-blue-600" />
              Medication Order Form
            </CardTitle>
            <CardDescription>
              Complete all required fields to send prescription electronically
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Patient Selection */}
            <div>
              <label htmlFor="patient" className="block text-sm font-medium text-gray-700 mb-2">
                Select Patient *
              </label>
              <select
                id="patient"
                value={formData.patientId}
                onChange={(e) => handlePatientChange(e.target.value)}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.patientId ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Choose a patient...</option>
                {mockPatients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} (Age: {patient.age})
                  </option>
                ))}
              </select>
              {formErrors.patientId && (
                <p className="text-sm text-red-600 mt-1">{formErrors.patientId}</p>
              )}

              {selectedPatient && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">{selectedPatient.name}</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Age: {selectedPatient.age} |
                    Allergies: {selectedPatient.allergies.length > 0 ? selectedPatient.allergies.join(', ') : 'None'}
                  </p>
                </div>
              )}
            </div>

            {/* Drug Name with Autocomplete */}
            <div className="relative">
              <label htmlFor="drugName" className="block text-sm font-medium text-gray-700 mb-2">
                Drug Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="drugName"
                  value={drugSearchQuery}
                  onChange={(e) => handleDrugSearch(e.target.value)}
                  placeholder="Search for medication..."
                  className={`w-full border rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.drugName ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              </div>
              {formErrors.drugName && (
                <p className="text-sm text-red-600 mt-1">{formErrors.drugName}</p>
              )}

              {/* Drug Search Results */}
              {showDrugSearch && drugSearchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {drugSearchResults.map(medication => (
                    <div
                      key={medication.id}
                      onClick={() => selectMedication(medication)}
                      className="p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">{medication.name}</div>
                      <div className="text-sm text-gray-600">{medication.genericName} - {medication.category}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Medication Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dosage */}
              <div>
                <label htmlFor="dosage" className="block text-sm font-medium text-gray-700 mb-2">
                  Dosage *
                </label>
                <select
                  id="dosage"
                  value={formData.dosage}
                  onChange={(e) => updateFormField('dosage', e.target.value)}
                  className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.dosage ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select dosage...</option>
                  {selectedMedication?.dosageOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  )) || (
                    <>
                      <option value="5mg">5mg</option>
                      <option value="10mg">10mg</option>
                      <option value="25mg">25mg</option>
                      <option value="50mg">50mg</option>
                    </>
                  )}
                </select>
                {formErrors.dosage && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.dosage}</p>
                )}
              </div>

              {/* Frequency */}
              <div>
                <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-2">
                  Frequency *
                </label>
                <select
                  id="frequency"
                  value={formData.frequency}
                  onChange={(e) => updateFormField('frequency', e.target.value)}
                  className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.frequency ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select frequency...</option>
                  {selectedMedication?.frequencyOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  )) || (
                    <>
                      <option value="Once daily">Once daily</option>
                      <option value="Twice daily">Twice daily</option>
                      <option value="Three times daily">Three times daily</option>
                      <option value="Four times daily">Four times daily</option>
                      <option value="As needed">As needed</option>
                    </>
                  )}
                </select>
                {formErrors.frequency && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.frequency}</p>
                )}
              </div>

              {/* Duration */}
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                  Duration *
                </label>
                <select
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => updateFormField('duration', e.target.value)}
                  className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.duration ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select duration...</option>
                  <option value="7 days">7 days</option>
                  <option value="14 days">14 days</option>
                  <option value="30 days">30 days</option>
                  <option value="60 days">60 days</option>
                  <option value="90 days">90 days</option>
                  <option value="Until further notice">Until further notice</option>
                </select>
                {formErrors.duration && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.duration}</p>
                )}
              </div>

              {/* Route */}
              <div>
                <label htmlFor="route" className="block text-sm font-medium text-gray-700 mb-2">
                  Route *
                </label>
                <select
                  id="route"
                  value={formData.route}
                  onChange={(e) => updateFormField('route', e.target.value)}
                  className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.route ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select route...</option>
                  {selectedMedication?.routeOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  )) || (
                    <>
                      <option value="Oral">Oral</option>
                      <option value="Topical">Topical</option>
                      <option value="Injection">Injection</option>
                      <option value="Inhalation">Inhalation</option>
                    </>
                  )}
                </select>
                {formErrors.route && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.route}</p>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  id="quantity"
                  value={formData.quantity}
                  onChange={(e) => updateFormField('quantity', parseInt(e.target.value) || 0)}
                  min="1"
                  max="365"
                  className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.quantity ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {formErrors.quantity && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.quantity}</p>
                )}
              </div>

              {/* Refills */}
              <div>
                <label htmlFor="refills" className="block text-sm font-medium text-gray-700 mb-2">
                  Refills Authorized
                </label>
                <input
                  type="number"
                  id="refills"
                  value={formData.refills}
                  onChange={(e) => updateFormField('refills', parseInt(e.target.value) || 0)}
                  min="0"
                  max="11"
                  className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.refills ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {formErrors.refills && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.refills}</p>
                )}
              </div>
            </div>

            {/* Pharmacy Selection */}
            <div>
              <label htmlFor="pharmacy" className="block text-sm font-medium text-gray-700 mb-2">
                Pharmacy (Optional)
              </label>
              <select
                id="pharmacy"
                value={formData.pharmacyId}
                onChange={(e) => updateFormField('pharmacyId', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Patient will choose pharmacy</option>
                {mockPharmacies.map(pharmacy => (
                  <option key={pharmacy.id} value={pharmacy.id}>
                    {pharmacy.name} - {pharmacy.address}
                  </option>
                ))}
              </select>
            </div>

            {/* Special Instructions */}
            <div>
              <label htmlFor="specialInstructions" className="block text-sm font-medium text-gray-700 mb-2">
                Special Instructions
              </label>
              <textarea
                id="specialInstructions"
                value={formData.specialInstructions}
                onChange={(e) => updateFormField('specialInstructions', e.target.value)}
                placeholder="Any special instructions for the patient or pharmacy..."
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={1000}
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {formData.specialInstructions.length}/1000 characters
              </div>
            </div>

            {/* Send Prescription Button */}
            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSendPrescription}
                disabled={isSending}
                className="bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                {isSending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending Prescription...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Prescription
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Electronic Prescription Notice */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <Shield className="h-5 w-5" />
              Electronic Prescription Benefits
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 space-y-2">
            <p>• Secure electronic transmission to pharmacy</p>
            <p>• Automatic medication history update in patient EHR</p>
            <p>• Real-time drug interaction and allergy checking</p>
            <p>• Reduced medication errors and improved patient safety</p>
            <p>• Complete audit trail for regulatory compliance</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
