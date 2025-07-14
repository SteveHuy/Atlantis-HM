"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, TestTube, Save, User, Calendar, AlertTriangle, CheckCircle, Search } from "lucide-react";
import { clinicalDataManager, mockLabTests } from "@/lib/clinical-mock-data";
import { orderLabTestSchema, logClinicalAccess } from "@/lib/clinical-validation";
import { sessionManager, type UserSession } from "@/lib/epic3-mock-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { z } from "zod";

interface FormData {
  patientId: string;
  testName: string;
  testCode: string;
  priority: 'routine' | 'urgent' | 'stat';
  notes: string;
  orderingProvider: string;
}

interface ConflictWarning {
  type: 'recent_order' | 'duplicate_test' | 'conflicting_medication';
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export default function OrderLabTestsPage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [filteredTests, setFilteredTests] = useState(mockLabTests);
  const [testSearchQuery, setTestSearchQuery] = useState("");
  const [formData, setFormData] = useState<FormData>({
    patientId: '',
    testName: '',
    testCode: '',
    priority: 'routine',
    notes: '',
    orderingProvider: ''
  });
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [warnings, setWarnings] = useState<ConflictWarning[]>([]);
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

  useEffect(() => {
    // Filter lab tests based on search query
    if (testSearchQuery.trim()) {
      const filtered = mockLabTests.filter(test =>
        test.name.toLowerCase().includes(testSearchQuery.toLowerCase()) ||
        test.code.toLowerCase().includes(testSearchQuery.toLowerCase()) ||
        test.category.toLowerCase().includes(testSearchQuery.toLowerCase())
      );
      setFilteredTests(filtered);
    } else {
      setFilteredTests(mockLabTests);
    }
  }, [testSearchQuery]);

  const handlePatientSelect = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    setSelectedPatient(patient);
    setFormData(prev => ({ ...prev, patientId }));
    
    // Check for potential conflicts when patient is selected
    if (patient && formData.testName) {
      checkForConflicts(patient, formData.testName);
    }
  };

  const handleTestSelect = (test: any) => {
    setFormData(prev => ({
      ...prev,
      testName: test.name,
      testCode: test.code
    }));
    
    // Check for potential conflicts when test is selected
    if (selectedPatient) {
      checkForConflicts(selectedPatient, test.name);
    }
  };

  const checkForConflicts = (patient: any, testName: string) => {
    const conflicts: ConflictWarning[] = [];
    
    // Check for recent similar orders (within 30 days)
    const recentLabResults = clinicalDataManager.getPatientLabResults(patient.id).filter((result: any) => {
      const resultDate = new Date(result.orderDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return resultDate > thirtyDaysAgo && result.testName === testName;
    });
    
    if (recentLabResults.length > 0) {
      conflicts.push({
        type: 'recent_order',
        message: `Similar test "${testName}" was ordered ${recentLabResults.length} time(s) in the last 30 days`,
        severity: 'medium'
      });
    }
    
    // Check for duplicate pending orders
    const pendingOrders = clinicalDataManager.getPatientLabResults(patient.id).filter((result: any) => 
      result.status === 'pending' && result.testName === testName
    );
    
    if (pendingOrders.length > 0) {
      conflicts.push({
        type: 'duplicate_test',
        message: `There is already a pending order for "${testName}"`,
        severity: 'high'
      });
    }
    
    // Check for potential medication conflicts (mock logic)
    if (testName.toLowerCase().includes('liver') || testName.toLowerCase().includes('hepatic')) {
      const patientRecords = clinicalDataManager.getPatientMedicalRecords(patient.id);
      const hepatotoxicMeds = patientRecords.medications.filter((med: any) => 
        med.status === 'active' && 
        (med.name.toLowerCase().includes('acetaminophen') || med.name.toLowerCase().includes('statins'))
      );
      
      if (hepatotoxicMeds.length > 0) {
        conflicts.push({
          type: 'conflicting_medication',
          message: `Patient is on hepatotoxic medications. Monitor liver function closely.`,
          severity: 'medium'
        });
      }
    }
    
    setWarnings(conflicts);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    try {
      orderLabTestSchema.parse(formData);
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

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSuccess(false);

    try {
      // Create lab order
      const labOrder = {
        patientId: formData.patientId,
        testName: formData.testName,
        testCode: formData.testCode,
        orderDate: new Date().toISOString(),
        resultDate: '', // Will be set when results are available
        status: 'pending' as const,
        results: [],
        providerId: formData.orderingProvider,
        notes: formData.notes,
        reviewed: false,
        priority: formData.priority
      };

      // Add lab result to patient record
      const savedLabResult = clinicalDataManager.addLabResult(formData.patientId, labOrder);
      
      // Log lab test order for audit trail  
      logClinicalAccess('order_lab_test', formData.patientId, session?.username || 'unknown');
      
      setSuccess(true);
      
      // Redirect to patient EHR after a short delay
      setTimeout(() => {
        router.push(`/provider/patient-ehr?patientId=${formData.patientId}`);
      }, 2000);
      
    } catch (error) {
      console.error("Error submitting lab order:", error);
      setValidationErrors({ general: "Failed to submit lab order. Please try again." });
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
          <p className="mt-4 text-gray-600">Loading lab order form...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in as a provider to order lab tests.</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lab Order Submitted Successfully!</h2>
          <p className="text-gray-600 mb-4">
            The lab order has been sent to the laboratory for processing.
          </p>
          <div className="text-sm text-gray-500 space-y-1">
            <p><strong>Test:</strong> {formData.testName}</p>
            <p><strong>Priority:</strong> {formData.priority}</p>
            <p><strong>Patient:</strong> {selectedPatient?.firstName} {selectedPatient?.lastName}</p>
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
          
          <h1 className="text-3xl font-bold text-gray-900">Order Lab Tests</h1>
          <p className="text-gray-600 mt-2">
            Order and track lab tests directly within the system
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
                    <p><strong>Allergies:</strong> {selectedPatient.allergies.length > 0 ? selectedPatient.allergies.map((a: any) => a.allergen).join(', ') : 'None'}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Test Selection */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <TestTube className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Test Selection</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Tests
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={testSearchQuery}
                    onChange={(e) => setTestSearchQuery(e.target.value)}
                    placeholder="Search by test name, code, or category"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  />
                  <Search className="absolute right-3 top-3 h-6 w-6 text-gray-400" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                {filteredTests.map((test) => (
                  <button
                    key={test.id}
                    onClick={() => handleTestSelect(test)}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      formData.testName === test.name
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="space-y-1">
                      <h3 className="font-medium text-gray-900">{test.name}</h3>
                      <p className="text-sm text-gray-600">Code: {test.code}</p>
                      <p className="text-sm text-gray-600">Category: {test.category}</p>
                      <p className="text-sm text-gray-500">Turnaround: {test.turnaroundTime}</p>
                    </div>
                  </button>
                ))}
              </div>
              
              {formData.testName && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-2">Selected Test</h3>
                  <p className="text-sm text-green-800">{formData.testName} ({formData.testCode})</p>
                </div>
              )}
              
              {validationErrors.testName && (
                <p className="text-sm text-red-600">{validationErrors.testName}</p>
              )}
            </div>
          </Card>

          {/* Warnings */}
          {warnings.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <h2 className="text-xl font-semibold text-gray-900">Warnings</h2>
              </div>
              
              <div className="space-y-3">
                {warnings.map((warning, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      warning.severity === 'high' ? 'bg-red-50 border-red-200' :
                      warning.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                        warning.severity === 'high' ? 'text-red-600' :
                        warning.severity === 'medium' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`} />
                      <div>
                        <p className={`font-medium ${
                          warning.severity === 'high' ? 'text-red-900' :
                          warning.severity === 'medium' ? 'text-yellow-900' :
                          'text-blue-900'
                        }`}>
                          {warning.type === 'recent_order' ? 'Recent Similar Order' :
                           warning.type === 'duplicate_test' ? 'Duplicate Test Order' :
                           'Medication Interaction'}
                        </p>
                        <p className={`text-sm ${
                          warning.severity === 'high' ? 'text-red-700' :
                          warning.severity === 'medium' ? 'text-yellow-700' :
                          'text-blue-700'
                        }`}>
                          {warning.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Order Details */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">Order Details</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority *
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="routine">Routine</option>
                  <option value="urgent">Urgent</option>
                  <option value="stat">STAT</option>
                </select>
                {validationErrors.priority && (
                  <p className="mt-2 text-sm text-red-600">{validationErrors.priority}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Enter any additional notes or special instructions"
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {validationErrors.notes && (
                  <p className="mt-2 text-sm text-red-600">{validationErrors.notes}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ordering Provider
                </label>
                <input
                  type="text"
                  value={formData.orderingProvider}
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none"
                />
              </div>
            </div>
          </Card>

          {/* General Error */}
          {validationErrors.general && (
            <Card className="p-4 bg-red-50 border-red-200">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <p className="text-red-700">{validationErrors.general}</p>
              </div>
            </Card>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleBackToDashboard}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.patientId || !formData.testName}
              className="flex items-center space-x-2"
            >
              <TestTube className="w-5 h-5" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Order'}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}