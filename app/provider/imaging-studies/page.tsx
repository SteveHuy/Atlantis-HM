"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Calendar, Stethoscope, Shield, Check, AlertCircle, Clock, FileText, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface UserSession {
  user: string;
  expiry: number;
}

interface ImagingOrder {
  id: string;
  patientId: string;
  patientName: string;
  studyType: string;
  clinicalIndication: string;
  priorityLevel: string;
  orderDate: string;
  status: 'Ordered' | 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  scheduledDate?: string;
  results?: string;
}

interface ImagingOrderForm {
  patientId: string;
  studyType: string;
  clinicalIndication: string;
  priorityLevel: string;
}

const MOCK_PATIENTS = [
  { id: "P001", name: "John Smith" },
  { id: "P002", name: "Sarah Johnson" },
  { id: "P003", name: "Michael Davis" },
  { id: "P004", name: "Emily Wilson" },
  { id: "P005", name: "David Brown" }
];

const STUDY_TYPES = [
  { value: 'xray', label: 'X-ray' },
  { value: 'mri', label: 'MRI' },
  { value: 'ct', label: 'CT scan' },
  { value: 'ultrasound', label: 'Ultrasound' },
  { value: 'mammography', label: 'Mammography' },
  { value: 'bone_scan', label: 'Bone Scan' }
];

const PRIORITY_LEVELS = [
  { value: 'routine', label: 'Routine', color: 'bg-green-100 text-green-800' },
  { value: 'urgent', label: 'Urgent', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'stat', label: 'Stat', color: 'bg-red-100 text-red-800' }
];

export default function ImagingStudiesPage() {
  const router = useRouter();
  const [user, setUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orderForm, setOrderForm] = useState<ImagingOrderForm>({
    patientId: '',
    studyType: '',
    clinicalIndication: '',
    priorityLevel: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [imagingOrders, setImagingOrders] = useState<ImagingOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<ImagingOrder | null>(null);

  useEffect(() => {
    // Check for provider session
    const sessionData = localStorage.getItem("atlantis_session") || 
                       sessionStorage.getItem("atlantis_session");
    
    if (sessionData) {
      try {
        const session: UserSession = JSON.parse(sessionData);
        if (session.expiry > Date.now()) {
          setUser(session.user);
          loadExistingOrders();
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

  const loadExistingOrders = () => {
    // Mock existing orders
    const mockOrders: ImagingOrder[] = [
      {
        id: 'IMG001',
        patientId: 'P001',
        patientName: 'John Smith',
        studyType: 'xray',
        clinicalIndication: 'Chest pain evaluation',
        priorityLevel: 'routine',
        orderDate: '2024-07-10',
        status: 'Completed',
        scheduledDate: '2024-07-12',
        results: 'Normal chest X-ray. No acute findings.'
      },
      {
        id: 'IMG002',
        patientId: 'P002',
        patientName: 'Sarah Johnson',
        studyType: 'mri',
        clinicalIndication: 'Lower back pain',
        priorityLevel: 'urgent',
        orderDate: '2024-07-12',
        status: 'Scheduled',
        scheduledDate: '2024-07-15'
      },
      {
        id: 'IMG003',
        patientId: 'P003',
        patientName: 'Michael Davis',
        studyType: 'ct',
        clinicalIndication: 'Abdominal pain workup',
        priorityLevel: 'stat',
        orderDate: '2024-07-14',
        status: 'In Progress'
      }
    ];
    setImagingOrders(mockOrders);
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!orderForm.patientId) {
      errors.patientId = 'Patient selection is required';
    }
    if (!orderForm.studyType) {
      errors.studyType = 'Study type is required';
    }
    if (!orderForm.clinicalIndication.trim()) {
      errors.clinicalIndication = 'Clinical indication is required';
    } else if (orderForm.clinicalIndication.length > 256) {
      errors.clinicalIndication = 'Clinical indication must be 256 characters or less';
    }
    if (!orderForm.priorityLevel) {
      errors.priorityLevel = 'Priority level is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitOrder = () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate order transmission to radiology system
    setTimeout(() => {
      const selectedPatient = MOCK_PATIENTS.find(p => p.id === orderForm.patientId);
      const newOrder: ImagingOrder = {
        id: `IMG${Date.now()}`,
        patientId: orderForm.patientId,
        patientName: selectedPatient?.name || 'Unknown Patient',
        studyType: orderForm.studyType,
        clinicalIndication: orderForm.clinicalIndication,
        priorityLevel: orderForm.priorityLevel,
        orderDate: new Date().toISOString().split('T')[0],
        status: 'Ordered'
      };

      // Add to orders list
      setImagingOrders(prev => [newOrder, ...prev]);

      // Mock logging and EHR update
      console.log('Imaging order transmitted to radiology system:', newOrder);
      console.log('Order added to patient EHR:', {
        patientId: orderForm.patientId,
        orderId: newOrder.id,
        provider: user,
        timestamp: new Date().toISOString()
      });

      setSuccessMessage('Imaging study ordered successfully');
      setIsSubmitting(false);

      // Reset form
      setOrderForm({
        patientId: '',
        studyType: '',
        clinicalIndication: '',
        priorityLevel: ''
      });
      setValidationErrors({});

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    }, 1500);
  };

  const handleBackToDashboard = () => {
    router.push("/provider/dashboard");
  };

  const handleViewPatientEHR = (patientId: string) => {
    // UD-REF: #View Patient EHR - will be implemented in future epic
    console.log(`Navigating to View Patient EHR for patient ${patientId}`);
    // Placeholder navigation
    router.push(`/provider/patient-ehr?patientId=${patientId}`);
  };

  const getStudyTypeLabel = (studyType: string) => {
    const study = STUDY_TYPES.find(s => s.value === studyType);
    return study ? study.label : studyType;
  };

  const getPriorityLabel = (priority: string) => {
    const priorityObj = PRIORITY_LEVELS.find(p => p.value === priority);
    return priorityObj ? priorityObj.label : priority;
  };

  const getPriorityColor = (priority: string) => {
    const priorityObj = PRIORITY_LEVELS.find(p => p.value === priority);
    return priorityObj ? priorityObj.color : 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ordered':
        return 'bg-blue-100 text-blue-800';
      case 'Scheduled':
        return 'bg-purple-100 text-purple-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
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
          <h1 className="text-3xl font-bold text-gray-900">Order Imaging Studies</h1>
          <p className="text-gray-600 mt-2">Order imaging studies for patients and track their progress</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Stethoscope className="w-5 h-5" />
                  <span>Order Imaging Studies</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Patient Selection */}
                <div className="space-y-2">
                  <Label htmlFor="patient-select">Patient ID *</Label>
                  <Select 
                    value={orderForm.patientId} 
                    onValueChange={(value) => setOrderForm(prev => ({ ...prev, patientId: value }))}
                  >
                    <SelectTrigger className={validationErrors.patientId ? 'border-red-500' : ''}>
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
                  {validationErrors.patientId && (
                    <p className="text-sm text-red-600">{validationErrors.patientId}</p>
                  )}
                </div>

                {/* Study Type */}
                <div className="space-y-2">
                  <Label htmlFor="study-type">Study Type *</Label>
                  <Select 
                    value={orderForm.studyType} 
                    onValueChange={(value) => setOrderForm(prev => ({ ...prev, studyType: value }))}
                  >
                    <SelectTrigger className={validationErrors.studyType ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select study type" />
                    </SelectTrigger>
                    <SelectContent>
                      {STUDY_TYPES.map((study) => (
                        <SelectItem key={study.value} value={study.value}>
                          {study.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.studyType && (
                    <p className="text-sm text-red-600">{validationErrors.studyType}</p>
                  )}
                </div>

                {/* Clinical Indication */}
                <div className="space-y-2">
                  <Label htmlFor="clinical-indication">Clinical Indication *</Label>
                  <Textarea
                    id="clinical-indication"
                    placeholder="Describe the clinical reason for this imaging study..."
                    value={orderForm.clinicalIndication}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, clinicalIndication: e.target.value }))}
                    className={validationErrors.clinicalIndication ? 'border-red-500' : ''}
                    maxLength={256}
                  />
                  <div className="flex justify-between items-center">
                    {validationErrors.clinicalIndication ? (
                      <p className="text-sm text-red-600">{validationErrors.clinicalIndication}</p>
                    ) : (
                      <span></span>
                    )}
                    <p className="text-sm text-gray-500">
                      {orderForm.clinicalIndication.length}/256 characters
                    </p>
                  </div>
                </div>

                {/* Priority Level */}
                <div className="space-y-2">
                  <Label htmlFor="priority-level">Priority Level *</Label>
                  <Select 
                    value={orderForm.priorityLevel} 
                    onValueChange={(value) => setOrderForm(prev => ({ ...prev, priorityLevel: value }))}
                  >
                    <SelectTrigger className={validationErrors.priorityLevel ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select priority level" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_LEVELS.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${priority.color}`}>
                              {priority.label}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.priorityLevel && (
                    <p className="text-sm text-red-600">{validationErrors.priorityLevel}</p>
                  )}
                </div>

                {/* Security & Compliance Notice */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-700">
                    <Shield className="w-4 h-4 inline mr-1" />
                    All data transmission is secure and complies with HIPAA regulations
                  </p>
                </div>

                {/* Submit Button */}
                <Button 
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting Order...
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4 mr-2" />
                      Submit Order
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Current Orders Status */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Current Orders Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {imagingOrders.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No imaging orders found</p>
                  ) : (
                    imagingOrders.map((order) => (
                      <div 
                        key={order.id} 
                        className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{order.patientName}</h3>
                            <p className="text-sm text-gray-600">{order.id} • {getStudyTypeLabel(order.studyType)}</p>
                          </div>
                          <div className="flex flex-col items-end space-y-1">
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                            <Badge className={getPriorityColor(order.priorityLevel)}>
                              {getPriorityLabel(order.priorityLevel)}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{order.clinicalIndication}</p>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>Ordered: {new Date(order.orderDate).toLocaleDateString()}</span>
                          {order.scheduledDate && (
                            <span>Scheduled: {new Date(order.scheduledDate).toLocaleDateString()}</span>
                          )}
                        </div>
                        {order.results && (
                          <div className="mt-2 p-2 bg-green-50 rounded text-sm">
                            <p className="font-medium text-green-800">Results:</p>
                            <p className="text-green-700">{order.results}</p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Order Details</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Order ID</p>
                    <p className="font-medium">{selectedOrder.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Patient</p>
                    <p className="font-medium">{selectedOrder.patientName} ({selectedOrder.patientId})</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Study Type</p>
                    <p className="font-medium">{getStudyTypeLabel(selectedOrder.studyType)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Priority</p>
                    <Badge className={getPriorityColor(selectedOrder.priorityLevel)}>
                      {getPriorityLabel(selectedOrder.priorityLevel)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <Badge className={getStatusColor(selectedOrder.status)}>
                      {selectedOrder.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Order Date</p>
                    <p className="font-medium">{new Date(selectedOrder.orderDate).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Clinical Indication</p>
                  <p className="font-medium">{selectedOrder.clinicalIndication}</p>
                </div>

                {selectedOrder.scheduledDate && (
                  <div>
                    <p className="text-sm text-gray-600">Scheduled Date</p>
                    <p className="font-medium">{new Date(selectedOrder.scheduledDate).toLocaleDateString()}</p>
                  </div>
                )}

                {selectedOrder.results && (
                  <div>
                    <p className="text-sm text-gray-600">Results</p>
                    <div className="mt-1 p-3 bg-green-50 rounded">
                      <p className="text-green-700">{selectedOrder.results}</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => handleViewPatientEHR(selectedOrder.patientId)}
                  >
                    <User className="w-4 h-4 mr-2" />
                    View Patient EHR
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedOrder(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}