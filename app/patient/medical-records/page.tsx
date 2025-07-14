"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, TestTube, Pill, Shield, Download, ChevronDown, ChevronUp } from "lucide-react";
import { clinicalDataManager } from "@/lib/clinical-mock-data";
import { logClinicalAccess } from "@/lib/clinical-validation";

interface UserSession {
  user: string;
  expiry: number;
}

interface MedicalSection {
  id: string;
  title: string;
  icon: any;
  data: any[];
  isExpanded: boolean;
}

export default function MedicalRecordsPage() {
  const router = useRouter();
  const [user, setUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sections, setSections] = useState<MedicalSection[]>([]);
  const [selectedDetail, setSelectedDetail] = useState<any>(null);
  const [detailType, setDetailType] = useState<string>("");

  useEffect(() => {
    // Check for user session
    const sessionData = localStorage.getItem("atlantis_session") || 
                       sessionStorage.getItem("atlantis_session");
    
    if (sessionData) {
      try {
        const session: UserSession = JSON.parse(sessionData);
        if (session.expiry > Date.now()) {
          setUser(session.user);
          loadMedicalRecords();
          
          // Log medical records access for HIPAA compliance
          logClinicalAccess('view_medical_records', 'P001', session.user);
        } else {
          // Session expired
          localStorage.removeItem("atlantis_session");
          sessionStorage.removeItem("atlantis_session");
          router.push("/patient/login");
        }
      } catch (error) {
        console.error("Session parsing error:", error);
        router.push("/patient/login");
      }
    } else {
      router.push("/patient/login");
    }
    
    setIsLoading(false);
  }, [router]);

  const loadMedicalRecords = () => {
    // In a real app, patient ID would come from authenticated session
    const patientId = 'P001';
    const records = clinicalDataManager.getPatientMedicalRecords(patientId);
    
    setSections([
      {
        id: 'lab_results',
        title: 'Lab Results',
        icon: TestTube,
        data: records.labResults,
        isExpanded: false
      },
      {
        id: 'visit_summaries',
        title: 'Visit Summaries',
        icon: FileText,
        data: records.visitSummaries,
        isExpanded: false
      },
      {
        id: 'medications',
        title: 'Medications',
        icon: Pill,
        data: records.medications,
        isExpanded: false
      },
      {
        id: 'immunizations',
        title: 'Immunizations',
        icon: Shield,
        data: records.immunizations,
        isExpanded: false
      }
    ]);
  };

  const toggleSection = (sectionId: string) => {
    setSections(sections.map(section => 
      section.id === sectionId 
        ? { ...section, isExpanded: !section.isExpanded }
        : section
    ));
  };

  const showDetail = (item: any, type: string) => {
    setSelectedDetail(item);
    setDetailType(type);
  };

  const closeDetail = () => {
    setSelectedDetail(null);
    setDetailType("");
  };

  const handleDownloadReport = () => {
    // In a real app, this would generate and download a PDF report
    const summary = clinicalDataManager.generateHealthSummary('P001');
    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medical-records-summary-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Log download for HIPAA compliance
    logClinicalAccess('download_medical_records', 'P001', user || 'unknown');
  };

  const handleBackToDashboard = () => {
    router.push("/patient/dashboard");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading medical records...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to access your medical records.</p>
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
            <button
              onClick={handleDownloadReport}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>Download Report</span>
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">My Medical Records</h1>
          <p className="text-gray-600 mt-2">Access and review your complete medical history</p>
        </div>

        {/* Medical Records Sections */}
        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <section.icon className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
                  <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
                    {section.data.length}
                  </span>
                </div>
                {section.isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {section.isExpanded && (
                <div className="border-t border-gray-200 p-6">
                  {section.data.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No {section.title.toLowerCase()} found</p>
                  ) : (
                    <div className="space-y-4">
                      {section.data.map((item, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => showDetail(item, section.id)}
                        >
                          {section.id === 'lab_results' && (
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium text-gray-900">{item.testName}</h3>
                                <p className="text-sm text-gray-500">
                                  {new Date(item.resultDate).toLocaleDateString()} • {item.status}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                {item.status === 'abnormal' && (
                                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                                    Abnormal
                                  </span>
                                )}
                                {item.status === 'critical' && (
                                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                                    Critical
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {section.id === 'visit_summaries' && (
                            <div>
                              <h3 className="font-medium text-gray-900">{item.visitType}</h3>
                              <p className="text-sm text-gray-500">
                                {new Date(item.visitDate).toLocaleDateString()} • {item.reasonForVisit}
                              </p>
                            </div>
                          )}

                          {section.id === 'medications' && (
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium text-gray-900">{item.name}</h3>
                                <p className="text-sm text-gray-500">
                                  {item.dosage} • {item.frequency}
                                </p>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                item.status === 'active' ? 'bg-green-100 text-green-800' : 
                                item.status === 'discontinued' ? 'bg-red-100 text-red-800' : 
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {item.status}
                              </span>
                            </div>
                          )}

                          {section.id === 'immunizations' && (
                            <div>
                              <h3 className="font-medium text-gray-900">{item.vaccineName}</h3>
                              <p className="text-sm text-gray-500">
                                {new Date(item.administrationDate).toLocaleDateString()} • {item.dosage}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Detail Modal */}
        {selectedDetail && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {detailType === 'lab_results' && 'Lab Result Details'}
                    {detailType === 'visit_summaries' && 'Visit Summary'}
                    {detailType === 'medications' && 'Medication Details'}
                    {detailType === 'immunizations' && 'Immunization Details'}
                  </h2>
                  <button
                    onClick={closeDetail}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  {detailType === 'lab_results' && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{selectedDetail.testName}</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Test Date:</p>
                          <p className="font-medium">{new Date(selectedDetail.resultDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Status:</p>
                          <p className="font-medium">{selectedDetail.status}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Priority:</p>
                          <p className="font-medium">{selectedDetail.priority}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Reviewed:</p>
                          <p className="font-medium">{selectedDetail.reviewed ? 'Yes' : 'No'}</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900 mb-2">Results:</h4>
                        <div className="space-y-2">
                          {selectedDetail.results.map((result: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span className="text-sm">{result.name}</span>
                              <div className="text-right">
                                <span className={`text-sm font-medium ${
                                  result.isAbnormal ? 'text-red-600' : 'text-green-600'
                                }`}>
                                  {result.value} {result.unit}
                                </span>
                                <p className="text-xs text-gray-500">{result.referenceRange}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {detailType === 'visit_summaries' && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{selectedDetail.visitType}</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-gray-600">Visit Date:</p>
                          <p className="font-medium">{new Date(selectedDetail.visitDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Reason for Visit:</p>
                          <p className="font-medium">{selectedDetail.reasonForVisit}</p>
                        </div>
                      </div>
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Vital Signs:</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>Height: {selectedDetail.vitals.height}</div>
                          <div>Weight: {selectedDetail.vitals.weight}</div>
                          <div>Blood Pressure: {selectedDetail.vitals.bloodPressure}</div>
                          <div>Heart Rate: {selectedDetail.vitals.heartRate}</div>
                          <div>Temperature: {selectedDetail.vitals.temperature}</div>
                          <div>Oxygen Saturation: {selectedDetail.vitals.oxygenSaturation}</div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Diagnoses:</h4>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {selectedDetail.diagnoses.map((diagnosis: string, index: number) => (
                            <li key={index}>{diagnosis}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900 mb-2">Treatment Plan:</h4>
                        <p className="text-sm">{selectedDetail.treatmentPlan}</p>
                      </div>
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900 mb-2">Notes:</h4>
                        <p className="text-sm">{selectedDetail.notes}</p>
                      </div>
                    </div>
                  )}

                  {detailType === 'medications' && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{selectedDetail.name}</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Dosage:</p>
                          <p className="font-medium">{selectedDetail.dosage}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Frequency:</p>
                          <p className="font-medium">{selectedDetail.frequency}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Start Date:</p>
                          <p className="font-medium">{new Date(selectedDetail.startDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Status:</p>
                          <p className="font-medium">{selectedDetail.status}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Prescribed By:</p>
                          <p className="font-medium">{selectedDetail.prescribedBy}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Refills Remaining:</p>
                          <p className="font-medium">{selectedDetail.refillsRemaining}</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900 mb-2">Instructions:</h4>
                        <p className="text-sm">{selectedDetail.instructions}</p>
                      </div>
                    </div>
                  )}

                  {detailType === 'immunizations' && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{selectedDetail.vaccineName}</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Administration Date:</p>
                          <p className="font-medium">{new Date(selectedDetail.administrationDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Dosage:</p>
                          <p className="font-medium">{selectedDetail.dosage}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Manufacturer:</p>
                          <p className="font-medium">{selectedDetail.manufacturer}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Lot Number:</p>
                          <p className="font-medium">{selectedDetail.lotNumber || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Route:</p>
                          <p className="font-medium">{selectedDetail.route}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Site:</p>
                          <p className="font-medium">{selectedDetail.site}</p>
                        </div>
                      </div>
                      {selectedDetail.notes && (
                        <div className="mt-4">
                          <h4 className="font-medium text-gray-900 mb-2">Notes:</h4>
                          <p className="text-sm">{selectedDetail.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}