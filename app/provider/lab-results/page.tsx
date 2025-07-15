"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, TestTube, CheckCircle, AlertTriangle, Filter, Bell, Edit } from "lucide-react";
import { clinicalDataManager } from "@/lib/clinical-mock-data";
import { reviewLabResultSchema, logClinicalAccess } from "@/lib/clinical-validation";
import { sessionManager, type UserSession } from "@/lib/epic3-mock-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { z } from "zod";

interface LabResultsFilter {
  patientId: string;
  dateFrom: string;
  dateTo: string;
  status: 'pending' | 'completed' | 'abnormal' | 'critical' | '';
  provider: string;
}

interface ReviewData {
  resultId: string;
  notes: string;
  reviewerId: string;
  followUpRequired: boolean;
  followUpInstructions: string;
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
}

interface TestResult {
  name: string;
  value: string;
  unit: string;
  referenceRange: string;
  isAbnormal: boolean;
  isCritical?: boolean;
}

interface LabResult {
  id: string;
  testName: string;
  testCode: string;
  orderDate: string;
  resultDate: string;
  status: string;
  priority: string;
  patientName: string;
  patientId: string;
  providerId: string;
  results: TestResult[];
  reviewed: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
}

interface Notification {
  id: string;
  type: string;
  message: string;
  timestamp: string;
}

export default function ReviewLabResultsPage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<LabResult[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedResult, setSelectedResult] = useState<LabResult | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<LabResultsFilter>({
    patientId: '',
    dateFrom: '',
    dateTo: '',
    status: '',
    provider: ''
  });
  const [reviewData, setReviewData] = useState<ReviewData>({
    resultId: '',
    notes: '',
    reviewerId: '',
    followUpRequired: false,
    followUpInstructions: ''
  });
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const userSession = sessionManager.getSession();

    if (!userSession || userSession.role !== 'provider') {
      router.push('/provider/login');
      return;
    }

    setSession(userSession);

    // Load patients and lab results
    const patientsData = clinicalDataManager.getAllPatients();
    setPatients(patientsData);

    // Collect all lab results from all patients
    const allLabResults: LabResult[] = [];
    patientsData.forEach((patient: Patient) => {
      const patientLabResults = clinicalDataManager.getPatientLabResults(patient.id);
      patientLabResults.forEach((result: any) => {
        allLabResults.push({
          ...result,
          patientName: `${patient.firstName} ${patient.lastName}`,
          patientId: patient.id
        });
      });
    });

    // Sort by result date (newest first)
    allLabResults.sort((a, b) => new Date(b.resultDate || b.orderDate).getTime() - new Date(a.resultDate || a.orderDate).getTime());

    setLabResults(allLabResults);
    setFilteredResults(allLabResults);

    // Generate notifications for new results
    const newResults = allLabResults.filter(r => !r.reviewed && r.status === 'completed');
    setNotifications(newResults.map(r => ({
      id: r.id,
      type: r.status === 'critical' ? 'critical' : r.status === 'abnormal' ? 'abnormal' : 'normal',
      message: `New ${r.testName} result available for ${r.patientName}`,
      timestamp: r.resultDate || r.orderDate
    })));

    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    // Apply filters
    let filtered = labResults;

    if (filters.patientId) {
      filtered = filtered.filter(result => result.patientId === filters.patientId);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(result => {
        const resultDate = new Date(result.resultDate || result.orderDate);
        return resultDate >= new Date(filters.dateFrom);
      });
    }

    if (filters.dateTo) {
      filtered = filtered.filter(result => {
        const resultDate = new Date(result.resultDate || result.orderDate);
        return resultDate <= new Date(filters.dateTo);
      });
    }

    if (filters.status) {
      filtered = filtered.filter(result => result.status === filters.status);
    }

    if (filters.provider) {
      filtered = filtered.filter(result => result.providerId.includes(filters.provider));
    }

    setFilteredResults(filtered);
  }, [filters, labResults]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      patientId: '',
      dateFrom: '',
      dateTo: '',
      status: '',
      provider: ''
    });
  };

  const handleResultSelect = (result: LabResult) => {
    setSelectedResult(result);
    setReviewData(prev => ({
      ...prev,
      resultId: result.id,
      notes: result.notes || '',
      followUpRequired: false,
      followUpInstructions: ''
    }));
    setIsReviewing(true);
  };

  const handleReviewDataChange = (field: string, value: string | boolean) => {
    setReviewData(prev => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateReview = (): boolean => {
    const errors: { [key: string]: string } = {};

    try {
      reviewLabResultSchema.parse(reviewData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.issues.forEach((err: z.ZodIssue) => {
          if (err.path.length > 0) {
            errors[err.path[0].toString()] = err.message;
          }
        });
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirmReview = async () => {
    if (!validateReview()) return;

    try {
      // Mark result as reviewed
      const success = clinicalDataManager.reviewLabResult(reviewData.resultId, reviewData.reviewerId);

      if (success) {
        // Update the result in our local state
        setLabResults(prev => prev.map(result =>
          result.id === reviewData.resultId
            ? { ...result, reviewed: true, reviewedBy: reviewData.reviewerId, reviewedAt: new Date().toISOString(), notes: reviewData.notes }
            : result
        ));

        // Remove from notifications
        setNotifications(prev => prev.filter(n => n.id !== reviewData.resultId));

        // Log review for audit trail
        logClinicalAccess('review_lab_result', selectedResult?.patientId || '', session?.username || 'unknown');

        // Close review modal
        setIsReviewing(false);
        setSelectedResult(null);
        setReviewData({
          resultId: '',
          notes: '',
          reviewerId: session?.username || '',
          followUpRequired: false,
          followUpInstructions: ''
        });
      }
    } catch (error) {
      console.error("Error confirming review:", error);
      setValidationErrors({ general: "Failed to confirm review. Please try again." });
    }
  };

  const handleDownloadResult = (result: LabResult) => {
    const resultData = {
      patient: {
        name: result.patientName,
        id: result.patientId
      },
      test: {
        name: result.testName,
        code: result.testCode,
        orderDate: result.orderDate,
        resultDate: result.resultDate,
        status: result.status,
        priority: result.priority
      },
      results: result.results,
      provider: result.providerId,
      reviewed: result.reviewed,
      reviewedBy: result.reviewedBy,
      reviewedAt: result.reviewedAt,
      notes: result.notes,
      downloadedBy: session?.username,
      downloadedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(resultData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lab-result-${result.testCode}-${result.patientId}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Log download for audit trail
    logClinicalAccess('download_lab_result', result.patientId, session?.username || 'unknown');
  };

  const handleBackToDashboard = () => {
    router.push("/provider/dashboard");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'abnormal': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'abnormal': return <AlertTriangle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <TestTube className="w-4 h-4" />;
      default: return <TestTube className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading lab results...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in as a provider to review lab results.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
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
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Filter className="w-5 h-5" />
                <span>Filters</span>
              </Button>
              {notifications.length > 0 && (
                <div className="flex items-center space-x-2 bg-red-100 text-red-800 px-3 py-1 rounded-full">
                  <Bell className="w-4 h-4" />
                  <span className="text-sm">{notifications.length} new results</span>
                </div>
              )}
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900">Review Lab Results</h1>
          <p className="text-gray-600 mt-2">
            Review and annotate lab results for accurate diagnosis and follow-up
          </p>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Filter Results</h2>
              <Button onClick={clearFilters} variant="outline" size="sm">
                Clear All
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Patient</label>
                <select
                  value={filters.patientId}
                  onChange={(e) => handleFilterChange('patientId', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Patients</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="abnormal">Abnormal</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
                <input
                  type="text"
                  value={filters.provider}
                  onChange={(e) => handleFilterChange('provider', e.target.value)}
                  placeholder="Search by provider name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </Card>
        )}

        {/* Results List */}
        <div className="space-y-4">
          {filteredResults.length === 0 ? (
            <Card className="p-8 text-center">
              <TestTube className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No lab results found matching your criteria</p>
            </Card>
          ) : (
            filteredResults.map((result) => (
              <Card key={result.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{result.testName}</h3>
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(result.status)}`}>
                        {getStatusIcon(result.status)}
                        <span>{result.status}</span>
                      </span>
                      {!result.reviewed && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          New
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                      <div>
                        <p><strong>Patient:</strong> {result.patientName}</p>
                        <p><strong>Order Date:</strong> {new Date(result.orderDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p><strong>Result Date:</strong> {result.resultDate ? new Date(result.resultDate).toLocaleDateString() : 'Pending'}</p>
                        <p><strong>Priority:</strong> {result.priority}</p>
                      </div>
                    </div>

                    {result.results && result.results.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {result.results.slice(0, 3).map((res: TestResult, index: number) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm">{res.name}</span>
                            <div className="text-right">
                              <span className={`text-sm font-medium ${
                                res.isAbnormal ? 'text-red-600' : 'text-green-600'
                              }`}>
                                {res.value} {res.unit}
                              </span>
                              <p className="text-xs text-gray-500">{res.referenceRange}</p>
                            </div>
                          </div>
                        ))}
                        {result.results.length > 3 && (
                          <p className="text-xs text-gray-500">+{result.results.length - 3} more results</p>
                        )}
                      </div>
                    )}

                    {result.reviewed && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                        <p className="text-green-800">
                          <strong>Reviewed by:</strong> {result.reviewedBy} on {new Date(result.reviewedAt || '').toLocaleDateString()}
                        </p>
                        {result.notes && (
                          <p className="text-green-700 mt-1">
                            <strong>Notes:</strong> {result.notes}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      onClick={() => handleDownloadResult(result)}
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-1"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </Button>

                    {result.status === 'completed' && !result.reviewed && (
                      <Button
                        onClick={() => handleResultSelect(result)}
                        size="sm"
                        className="flex items-center space-x-1"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Review</span>
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Review Modal */}
        {isReviewing && selectedResult && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Review Lab Result</h2>
                  <button
                    onClick={() => setIsReviewing(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">{selectedResult.testName}</h3>
                    <p className="text-sm text-gray-600">
                      <strong>Patient:</strong> {selectedResult.patientName} |
                      <strong> Result Date:</strong> {new Date(selectedResult.resultDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Test Results:</h4>
                    <div className="space-y-2">
                      {selectedResult.results.map((testResult: TestResult, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{testResult.name}</span>
                          <div className="text-right">
                            <span className={`text-sm font-medium ${
                              testResult.isAbnormal ? 'text-red-600' :
                              testResult.isCritical ? 'text-red-800' : 'text-green-600'
                            }`}>
                              {testResult.value} {testResult.unit}
                            </span>
                            <p className="text-xs text-gray-500">{testResult.referenceRange}</p>
                            {testResult.isAbnormal && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-1 rounded">Abnormal</span>
                            )}
                            {testResult.isCritical && (
                              <span className="text-xs bg-red-100 text-red-800 px-1 rounded">Critical</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Review Notes
                    </label>
                    <textarea
                      value={reviewData.notes}
                      onChange={(e) => handleReviewDataChange('notes', e.target.value)}
                      placeholder="Add your review notes, observations, or recommendations"
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {validationErrors.notes && (
                      <p className="mt-2 text-sm text-red-600">{validationErrors.notes}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="followUpRequired"
                      checked={reviewData.followUpRequired}
                      onChange={(e) => handleReviewDataChange('followUpRequired', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="followUpRequired" className="text-sm font-medium text-gray-700">
                      Follow-up required
                    </label>
                  </div>

                  {reviewData.followUpRequired && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Follow-up Instructions
                      </label>
                      <textarea
                        value={reviewData.followUpInstructions}
                        onChange={(e) => handleReviewDataChange('followUpInstructions', e.target.value)}
                        placeholder="Enter follow-up instructions"
                        rows={2}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {validationErrors.followUpInstructions && (
                        <p className="mt-2 text-sm text-red-600">{validationErrors.followUpInstructions}</p>
                      )}
                    </div>
                  )}

                  {validationErrors.general && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700">{validationErrors.general}</p>
                    </div>
                  )}

                  <div className="flex justify-end space-x-4 pt-4">
                    <Button
                      onClick={() => setIsReviewing(false)}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleConfirmReview}
                      className="flex items-center space-x-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Confirm Review</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
