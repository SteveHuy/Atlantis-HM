"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, User, Calendar, Stethoscope, Pill, TestTube, ClipboardList, Shield, Download, Eye, Check, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface UserSession {
  user: string;
  expiry: number;
}

interface VisitSummaryData {
  patientId: string;
  patientName: string;
  visitDate: string;
  encounterData: {
    chiefComplaint: string;
    vitalSigns: {
      bloodPressure: string;
      heartRate: string;
      temperature: string;
      weight: string;
    };
    physicalExam: string;
  };
  diagnoses: string[];
  treatments: string[];
  customSections: {
    medicationsPrescribed: boolean;
    testsOrdered: boolean;
    followUpInstructions: boolean;
  };
  medicationsPrescribed: Array<{
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  testsOrderedAndResults: Array<{
    test: string;
    status: string;
    result?: string;
  }>;
  followUpInstructions: string;
  providerNotes: string;
}

const MOCK_PATIENTS = [
  { id: "P001", name: "John Smith" },
  { id: "P002", name: "Sarah Johnson" },
  { id: "P003", name: "Michael Davis" },
  { id: "P004", name: "Emily Wilson" },
  { id: "P005", name: "David Brown" }
];

export default function VisitSummaryPage() {
  const router = useRouter();
  const [user, setUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [visitSummary, setVisitSummary] = useState<VisitSummaryData>({
    patientId: '',
    patientName: '',
    visitDate: new Date().toISOString().split('T')[0],
    encounterData: {
      chiefComplaint: '',
      vitalSigns: {
        bloodPressure: '',
        heartRate: '',
        temperature: '',
        weight: ''
      },
      physicalExam: ''
    },
    diagnoses: [''],
    treatments: [''],
    customSections: {
      medicationsPrescribed: false,
      testsOrdered: false,
      followUpInstructions: false
    },
    medicationsPrescribed: [],
    testsOrderedAndResults: [],
    followUpInstructions: '',
    providerNotes: ''
  });
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [isReviewMode, setIsReviewMode] = useState(false);

  useEffect(() => {
    // Check for provider session
    const sessionData = localStorage.getItem("atlantis_session") || 
                       sessionStorage.getItem("atlantis_session");
    
    if (sessionData) {
      try {
        const session: UserSession = JSON.parse(sessionData);
        if (session.expiry > Date.now()) {
          setUser(session.user);
        } else {
          // Session expired
          localStorage.removeItem("atlantis_session");
          sessionStorage.removeItem("atlantis_session");
          router.push("/provider/login");
        }
      } catch (error) {
        console.error("Error parsing session:", error);
        router.push("/provider/login");
      }
    } else {
      router.push("/provider/login");
    }
    
    setIsLoading(false);
  }, [router]);

  const handlePatientChange = (patientId: string) => {
    const patient = MOCK_PATIENTS.find(p => p.id === patientId);
    setVisitSummary(prev => ({
      ...prev,
      patientId,
      patientName: patient?.name || ''
    }));
  };

  const handleDiagnosisChange = (index: number, value: string) => {
    const newDiagnoses = [...visitSummary.diagnoses];
    newDiagnoses[index] = value;
    setVisitSummary(prev => ({ ...prev, diagnoses: newDiagnoses }));
  };

  const addDiagnosis = () => {
    setVisitSummary(prev => ({
      ...prev,
      diagnoses: [...prev.diagnoses, '']
    }));
  };

  const removeDiagnosis = (index: number) => {
    if (visitSummary.diagnoses.length > 1) {
      const newDiagnoses = visitSummary.diagnoses.filter((_, i) => i !== index);
      setVisitSummary(prev => ({ ...prev, diagnoses: newDiagnoses }));
    }
  };

  const handleTreatmentChange = (index: number, value: string) => {
    const newTreatments = [...visitSummary.treatments];
    newTreatments[index] = value;
    setVisitSummary(prev => ({ ...prev, treatments: newTreatments }));
  };

  const addTreatment = () => {
    setVisitSummary(prev => ({
      ...prev,
      treatments: [...prev.treatments, '']
    }));
  };

  const removeTreatment = (index: number) => {
    if (visitSummary.treatments.length > 1) {
      const newTreatments = visitSummary.treatments.filter((_, i) => i !== index);
      setVisitSummary(prev => ({ ...prev, treatments: newTreatments }));
    }
  };

  const addMedication = () => {
    setVisitSummary(prev => ({
      ...prev,
      medicationsPrescribed: [
        ...prev.medicationsPrescribed,
        { medication: '', dosage: '', frequency: '', duration: '' }
      ]
    }));
  };

  const updateMedication = (index: number, field: string, value: string) => {
    const newMedications = [...visitSummary.medicationsPrescribed];
    newMedications[index] = { ...newMedications[index], [field]: value };
    setVisitSummary(prev => ({ ...prev, medicationsPrescribed: newMedications }));
  };

  const removeMedication = (index: number) => {
    const newMedications = visitSummary.medicationsPrescribed.filter((_, i) => i !== index);
    setVisitSummary(prev => ({ ...prev, medicationsPrescribed: newMedications }));
  };

  const addTest = () => {
    setVisitSummary(prev => ({
      ...prev,
      testsOrderedAndResults: [
        ...prev.testsOrderedAndResults,
        { test: '', status: 'Ordered', result: '' }
      ]
    }));
  };

  const updateTest = (index: number, field: string, value: string) => {
    const newTests = [...visitSummary.testsOrderedAndResults];
    newTests[index] = { ...newTests[index], [field]: value };
    setVisitSummary(prev => ({ ...prev, testsOrderedAndResults: newTests }));
  };

  const removeTest = (index: number) => {
    const newTests = visitSummary.testsOrderedAndResults.filter((_, i) => i !== index);
    setVisitSummary(prev => ({ ...prev, testsOrderedAndResults: newTests }));
  };

  const validateVisitSummary = (): string[] => {
    const errors: string[] = [];

    if (!visitSummary.patientId) {
      errors.push('Patient selection is required');
    }
    if (!visitSummary.visitDate) {
      errors.push('Visit date is required');
    }
    if (!visitSummary.encounterData.chiefComplaint.trim()) {
      errors.push('Chief complaint is required');
    }
    if (visitSummary.diagnoses.every(d => !d.trim())) {
      errors.push('At least one diagnosis is required');
    }
    if (visitSummary.treatments.every(t => !t.trim())) {
      errors.push('At least one treatment is required');
    }

    // Validate custom sections if enabled
    if (visitSummary.customSections.medicationsPrescribed && visitSummary.medicationsPrescribed.length === 0) {
      errors.push('Please add medications or uncheck the medications section');
    }
    if (visitSummary.customSections.testsOrdered && visitSummary.testsOrderedAndResults.length === 0) {
      errors.push('Please add tests or uncheck the tests section');
    }
    if (visitSummary.customSections.followUpInstructions && !visitSummary.followUpInstructions.trim()) {
      errors.push('Please add follow-up instructions or uncheck the follow-up section');
    }

    return errors;
  };

  const handleGenerateReport = () => {
    const errors = validateVisitSummary();
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);
    setIsGenerating(true);

    // Simulate report generation
    setTimeout(() => {
      setShowPreview(true);
      setIsReviewMode(true);
      setIsGenerating(false);
    }, 1000);
  };

  const handleFinalizeReport = () => {
    setIsGenerating(true);

    // Simulate saving to patient EHR and notifications
    setTimeout(() => {
      // Mock saving to patient's EHR
      console.log('Saving visit summary to patient EHR:', visitSummary);
      
      // Mock audit logging
      console.log('Audit Log:', {
        provider: user,
        action: 'create_visit_summary',
        patient: visitSummary.patientName,
        patientId: visitSummary.patientId,
        visitDate: visitSummary.visitDate,
        timestamp: new Date().toISOString()
      });

      // Mock patient notification
      console.log('Sending notification to patient:', {
        patientId: visitSummary.patientId,
        message: 'Your visit summary is now available in your medical records'
      });

      setSuccessMessage('Visit summary has been saved to patient\'s EHR and made available via Medical Records portal');
      setShowPreview(false);
      setIsReviewMode(false);
      setIsGenerating(false);
      
      // Clear form after successful save
      setTimeout(() => {
        setSuccessMessage('');
        // Reset form or redirect as needed
      }, 5000);
    }, 2000);
  };

  const handleDownloadReport = () => {
    const blob = new Blob([JSON.stringify(visitSummary, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visit-summary-${visitSummary.patientId}-${visitSummary.visitDate}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleBackToDashboard = () => {
    router.push("/provider/dashboard");
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleBackToDashboard}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create Visit Summary Report</h1>
          <p className="text-gray-600 mt-2">Generate comprehensive visit summaries for patient records</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <Alert className="mb-6">
            <Check className="w-4 h-4" />
            <AlertDescription className="text-green-600">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              <p className="font-medium mb-2">Please correct the following errors:</p>
              <ul className="list-disc list-inside space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Visit Summary Form */}
        <div className="space-y-6">
          {/* Patient and Visit Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Patient & Visit Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patient-select">Patient *</Label>
                  <Select value={visitSummary.patientId} onValueChange={handlePatientChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_PATIENTS.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name} ({patient.id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="visit-date">Visit Date *</Label>
                  <Input
                    id="visit-date"
                    type="date"
                    value={visitSummary.visitDate}
                    onChange={(e) => setVisitSummary(prev => ({ ...prev, visitDate: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Encounter Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Stethoscope className="w-5 h-5" />
                <span>Encounter Data</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="chief-complaint">Chief Complaint *</Label>
                <Textarea
                  id="chief-complaint"
                  placeholder="Patient's primary concern or reason for visit..."
                  value={visitSummary.encounterData.chiefComplaint}
                  onChange={(e) => setVisitSummary(prev => ({
                    ...prev,
                    encounterData: { ...prev.encounterData, chiefComplaint: e.target.value }
                  }))}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bp">Blood Pressure</Label>
                  <Input
                    id="bp"
                    placeholder="120/80"
                    value={visitSummary.encounterData.vitalSigns.bloodPressure}
                    onChange={(e) => setVisitSummary(prev => ({
                      ...prev,
                      encounterData: {
                        ...prev.encounterData,
                        vitalSigns: { ...prev.encounterData.vitalSigns, bloodPressure: e.target.value }
                      }
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hr">Heart Rate</Label>
                  <Input
                    id="hr"
                    placeholder="72 bpm"
                    value={visitSummary.encounterData.vitalSigns.heartRate}
                    onChange={(e) => setVisitSummary(prev => ({
                      ...prev,
                      encounterData: {
                        ...prev.encounterData,
                        vitalSigns: { ...prev.encounterData.vitalSigns, heartRate: e.target.value }
                      }
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="temp">Temperature</Label>
                  <Input
                    id="temp"
                    placeholder="98.6°F"
                    value={visitSummary.encounterData.vitalSigns.temperature}
                    onChange={(e) => setVisitSummary(prev => ({
                      ...prev,
                      encounterData: {
                        ...prev.encounterData,
                        vitalSigns: { ...prev.encounterData.vitalSigns, temperature: e.target.value }
                      }
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight</Label>
                  <Input
                    id="weight"
                    placeholder="150 lbs"
                    value={visitSummary.encounterData.vitalSigns.weight}
                    onChange={(e) => setVisitSummary(prev => ({
                      ...prev,
                      encounterData: {
                        ...prev.encounterData,
                        vitalSigns: { ...prev.encounterData.vitalSigns, weight: e.target.value }
                      }
                    }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="physical-exam">Physical Examination</Label>
                <Textarea
                  id="physical-exam"
                  placeholder="Physical examination findings..."
                  value={visitSummary.encounterData.physicalExam}
                  onChange={(e) => setVisitSummary(prev => ({
                    ...prev,
                    encounterData: { ...prev.encounterData, physicalExam: e.target.value }
                  }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Diagnoses */}
          <Card>
            <CardHeader>
              <CardTitle>Diagnoses *</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {visitSummary.diagnoses.map((diagnosis, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    placeholder={`Diagnosis ${index + 1}`}
                    value={diagnosis}
                    onChange={(e) => handleDiagnosisChange(index, e.target.value)}
                    className="flex-1"
                  />
                  {visitSummary.diagnoses.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeDiagnosis(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" onClick={addDiagnosis}>
                Add Diagnosis
              </Button>
            </CardContent>
          </Card>

          {/* Treatments */}
          <Card>
            <CardHeader>
              <CardTitle>Treatments *</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {visitSummary.treatments.map((treatment, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    placeholder={`Treatment ${index + 1}`}
                    value={treatment}
                    onChange={(e) => handleTreatmentChange(index, e.target.value)}
                    className="flex-1"
                  />
                  {visitSummary.treatments.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeTreatment(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" onClick={addTreatment}>
                Add Treatment
              </Button>
            </CardContent>
          </Card>

          {/* Customizable Sections */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Sections</CardTitle>
              <p className="text-sm text-gray-600">Select which additional sections to include in the report</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="medications-section"
                    checked={visitSummary.customSections.medicationsPrescribed}
                    onCheckedChange={(checked) => 
                      setVisitSummary(prev => ({
                        ...prev,
                        customSections: { ...prev.customSections, medicationsPrescribed: checked as boolean }
                      }))
                    }
                  />
                  <Label htmlFor="medications-section" className="flex items-center space-x-2">
                    <Pill className="w-4 h-4" />
                    <span>Medications Prescribed</span>
                  </Label>
                </div>

                {visitSummary.customSections.medicationsPrescribed && (
                  <div className="ml-6 space-y-4">
                    {visitSummary.medicationsPrescribed.map((medication, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 p-4 border rounded-lg">
                        <Input
                          placeholder="Medication"
                          value={medication.medication}
                          onChange={(e) => updateMedication(index, 'medication', e.target.value)}
                        />
                        <Input
                          placeholder="Dosage"
                          value={medication.dosage}
                          onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                        />
                        <Input
                          placeholder="Frequency"
                          value={medication.frequency}
                          onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                        />
                        <div className="flex items-center space-x-2">
                          <Input
                            placeholder="Duration"
                            value={medication.duration}
                            onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeMedication(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" onClick={addMedication}>
                      Add Medication
                    </Button>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="tests-section"
                    checked={visitSummary.customSections.testsOrdered}
                    onCheckedChange={(checked) => 
                      setVisitSummary(prev => ({
                        ...prev,
                        customSections: { ...prev.customSections, testsOrdered: checked as boolean }
                      }))
                    }
                  />
                  <Label htmlFor="tests-section" className="flex items-center space-x-2">
                    <TestTube className="w-4 h-4" />
                    <span>Tests Ordered and Results</span>
                  </Label>
                </div>

                {visitSummary.customSections.testsOrdered && (
                  <div className="ml-6 space-y-4">
                    {visitSummary.testsOrderedAndResults.map((test, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 p-4 border rounded-lg">
                        <Input
                          placeholder="Test name"
                          value={test.test}
                          onChange={(e) => updateTest(index, 'test', e.target.value)}
                        />
                        <Select value={test.status} onValueChange={(value) => updateTest(index, 'status', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Ordered">Ordered</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex items-center space-x-2">
                          <Input
                            placeholder="Result (if available)"
                            value={test.result || ''}
                            onChange={(e) => updateTest(index, 'result', e.target.value)}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeTest(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" onClick={addTest}>
                      Add Test
                    </Button>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="followup-section"
                    checked={visitSummary.customSections.followUpInstructions}
                    onCheckedChange={(checked) => 
                      setVisitSummary(prev => ({
                        ...prev,
                        customSections: { ...prev.customSections, followUpInstructions: checked as boolean }
                      }))
                    }
                  />
                  <Label htmlFor="followup-section" className="flex items-center space-x-2">
                    <ClipboardList className="w-4 h-4" />
                    <span>Follow-up Instructions</span>
                  </Label>
                </div>

                {visitSummary.customSections.followUpInstructions && (
                  <div className="ml-6">
                    <Textarea
                      placeholder="Follow-up instructions for the patient..."
                      value={visitSummary.followUpInstructions}
                      onChange={(e) => setVisitSummary(prev => ({ ...prev, followUpInstructions: e.target.value }))}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Provider Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Provider Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Additional provider notes (optional)..."
                value={visitSummary.providerNotes}
                onChange={(e) => setVisitSummary(prev => ({ ...prev, providerNotes: e.target.value }))}
              />
            </CardContent>
          </Card>

          {/* Generate Report Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Report Preview Modal */}
        {showPreview && (
          <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  Visit Summary Preview - {visitSummary.patientName}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Patient Info */}
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-lg mb-2">Patient Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <p><strong>Patient:</strong> {visitSummary.patientName} ({visitSummary.patientId})</p>
                    <p><strong>Visit Date:</strong> {new Date(visitSummary.visitDate).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Encounter Data */}
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-lg mb-2">Encounter Data</h3>
                  <div className="space-y-2">
                    <p><strong>Chief Complaint:</strong> {visitSummary.encounterData.chiefComplaint}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <p><strong>BP:</strong> {visitSummary.encounterData.vitalSigns.bloodPressure || 'N/A'}</p>
                      <p><strong>HR:</strong> {visitSummary.encounterData.vitalSigns.heartRate || 'N/A'}</p>
                      <p><strong>Temp:</strong> {visitSummary.encounterData.vitalSigns.temperature || 'N/A'}</p>
                      <p><strong>Weight:</strong> {visitSummary.encounterData.vitalSigns.weight || 'N/A'}</p>
                    </div>
                    {visitSummary.encounterData.physicalExam && (
                      <p><strong>Physical Exam:</strong> {visitSummary.encounterData.physicalExam}</p>
                    )}
                  </div>
                </div>

                {/* Diagnoses & Treatments */}
                <div className="border-b pb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Diagnoses</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {visitSummary.diagnoses.filter(d => d.trim()).map((diagnosis, index) => (
                        <li key={index}>{diagnosis}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Treatments</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {visitSummary.treatments.filter(t => t.trim()).map((treatment, index) => (
                        <li key={index}>{treatment}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Custom Sections */}
                {visitSummary.customSections.medicationsPrescribed && visitSummary.medicationsPrescribed.length > 0 && (
                  <div className="border-b pb-4">
                    <h3 className="font-semibold text-lg mb-2">Medications Prescribed</h3>
                    <div className="space-y-2">
                      {visitSummary.medicationsPrescribed.map((med, index) => (
                        <div key={index} className="p-2 bg-gray-50 rounded">
                          <p><strong>{med.medication}</strong> - {med.dosage}, {med.frequency}, {med.duration}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {visitSummary.customSections.testsOrdered && visitSummary.testsOrderedAndResults.length > 0 && (
                  <div className="border-b pb-4">
                    <h3 className="font-semibold text-lg mb-2">Tests Ordered and Results</h3>
                    <div className="space-y-2">
                      {visitSummary.testsOrderedAndResults.map((test, index) => (
                        <div key={index} className="p-2 bg-gray-50 rounded">
                          <p><strong>{test.test}</strong> - Status: {test.status}</p>
                          {test.result && <p>Result: {test.result}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {visitSummary.customSections.followUpInstructions && visitSummary.followUpInstructions && (
                  <div className="border-b pb-4">
                    <h3 className="font-semibold text-lg mb-2">Follow-up Instructions</h3>
                    <p>{visitSummary.followUpInstructions}</p>
                  </div>
                )}

                {visitSummary.providerNotes && (
                  <div className="border-b pb-4">
                    <h3 className="font-semibold text-lg mb-2">Provider Notes</h3>
                    <p>{visitSummary.providerNotes}</p>
                  </div>
                )}

                {/* Compliance Notice */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-700">
                    <Shield className="w-4 h-4 inline mr-1" />
                    All report data complies with privacy and HIPAA standards
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPreview(false);
                      setIsReviewMode(false);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    onClick={handleDownloadReport}
                    variant="outline"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button
                    onClick={handleFinalizeReport}
                    disabled={isGenerating}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Finalizing...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Finalize & Save to EHR
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}