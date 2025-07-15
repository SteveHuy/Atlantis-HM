"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  ChevronUp, 
  ChevronDown, 
  Eye, 
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

// Mock data for tracking claims
const mockClaimsData = [
  {
    id: "CLM-2024-001",
    patientId: "P001",
    patientName: "John Smith",
    dateSubmitted: "2024-01-15",
    status: "paid" as const,
    amount: 450.00,
    payerInfo: "Blue Cross Blue Shield",
    rejectionReason: null,
    lastUpdated: "2024-01-22"
  },
  {
    id: "CLM-2024-002", 
    patientId: "P002",
    patientName: "Jane Doe",
    dateSubmitted: "2024-02-03",
    status: "processed" as const,
    amount: 125.50,
    payerInfo: "Aetna",
    rejectionReason: null,
    lastUpdated: "2024-02-10"
  },
  {
    id: "CLM-2024-003",
    patientId: "P003",
    patientName: "Robert Johnson",
    dateSubmitted: "2024-02-20",
    status: "denied" as const,
    amount: 680.00,
    payerInfo: "Cigna",
    rejectionReason: "Invalid billing code - requires prior authorization",
    lastUpdated: "2024-02-25"
  },
  {
    id: "CLM-2024-004",
    patientId: "P001",
    patientName: "John Smith",
    dateSubmitted: "2024-03-10",
    status: "received" as const,
    amount: 320.75,
    payerInfo: "Blue Cross Blue Shield",
    rejectionReason: null,
    lastUpdated: "2024-03-10"
  },
  {
    id: "CLM-2024-005",
    patientId: "P004",
    patientName: "Sarah Wilson",
    dateSubmitted: "2024-03-15",
    status: "processed" as const,
    amount: 275.00,
    payerInfo: "UnitedHealthcare",
    rejectionReason: null,
    lastUpdated: "2024-03-18"
  }
];

const statusColors = {
  received: "bg-blue-100 text-blue-800 border-blue-200",
  processed: "bg-yellow-100 text-yellow-800 border-yellow-200",
  paid: "bg-green-100 text-green-800 border-green-200",
  denied: "bg-red-100 text-red-800 border-red-200"
};

const statusIcons = {
  received: Clock,
  processed: RefreshCw,
  paid: CheckCircle,
  denied: XCircle
};

type SortField = 'dateSubmitted' | 'amount' | 'status' | 'patientName';
type SortOrder = 'asc' | 'desc';

export default function TrackClaimsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>('dateSubmitted');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedClaim, setSelectedClaim] = useState<typeof mockClaimsData[0] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [auditLog, setAuditLog] = useState<string[]>([]);
  const itemsPerPage = 10;

  // Simulate real-time status updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly update a claim status for demo purposes
      const randomIndex = Math.floor(Math.random() * mockClaimsData.length);
      const statuses = ['received', 'processed', 'paid', 'denied'];
      const currentStatus = mockClaimsData[randomIndex].status;
      const statusIndex = statuses.indexOf(currentStatus);
      
      if (statusIndex < statuses.length - 1 && Math.random() > 0.8) {
        const newStatus = statuses[statusIndex + 1] as typeof currentStatus;
        mockClaimsData[randomIndex].status = newStatus;
        mockClaimsData[randomIndex].lastUpdated = new Date().toISOString().split('T')[0];
        
        // Add to audit log
        const logEntry = `${new Date().toLocaleTimeString()}: Claim ${mockClaimsData[randomIndex].id} status updated to ${newStatus}`;
        setAuditLog(prev => [...prev.slice(-4), logEntry]);
      }
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const filteredAndSortedClaims = useMemo(() => {
    let filtered = mockClaimsData.filter(claim => {
      const matchesSearch = 
        claim.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.patientName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || claim.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'dateSubmitted':
          aValue = new Date(a.dateSubmitted);
          bValue = new Date(b.dateSubmitted);
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'patientName':
          aValue = a.patientName;
          bValue = b.patientName;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [searchTerm, statusFilter, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedClaims.length / itemsPerPage);
  const paginatedClaims = filteredAndSortedClaims.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (field !== sortField) return null;
    return sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  const handleViewDetails = (claim: typeof mockClaimsData[0]) => {
    setSelectedClaim(claim);
    const logEntry = `${new Date().toLocaleString()}: Viewed details for claim ${claim.id}`;
    setAuditLog(prev => [...prev.slice(-4), logEntry]);
  };

  const handleManageRejection = (claimId: string) => {
    router.push('/receptionist/manage-rejections');
  };

  const handleUpdateClaim = (claimId: string) => {
    alert(`Update functionality for claim ${claimId} would be implemented here`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/">
                <Image
                  src="/atlantis-logo.svg"
                  alt="Atlantis HMS Logo"
                  width={150}
                  height={40}
                  priority
                />
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/receptionist/dashboard"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Claim Status</h1>
          <p className="text-gray-600">
            Track the status of submitted claims and stay informed on their progress.
          </p>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by Claim ID or Patient ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              {/* Status Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="processed">Processed</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="denied">Denied</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Claims Table */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>
                  Claims ({filteredAndSortedClaims.length}) - Page {currentPage} of {totalPages}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">
                          <span className="font-semibold text-gray-900">Claim ID</span>
                        </th>
                        <th className="text-left p-4">
                          <button
                            onClick={() => handleSort('dateSubmitted')}
                            className="flex items-center space-x-1 font-semibold text-gray-900 hover:text-blue-600"
                          >
                            <span>Date Submitted</span>
                            {getSortIcon('dateSubmitted')}
                          </button>
                        </th>
                        <th className="text-left p-4">
                          <button
                            onClick={() => handleSort('status')}
                            className="flex items-center space-x-1 font-semibold text-gray-900 hover:text-blue-600"
                          >
                            <span>Status</span>
                            {getSortIcon('status')}
                          </button>
                        </th>
                        <th className="text-left p-4">
                          <button
                            onClick={() => handleSort('amount')}
                            className="flex items-center space-x-1 font-semibold text-gray-900 hover:text-blue-600"
                          >
                            <span>Amount</span>
                            {getSortIcon('amount')}
                          </button>
                        </th>
                        <th className="text-left p-4">
                          <button
                            onClick={() => handleSort('patientName')}
                            className="flex items-center space-x-1 font-semibold text-gray-900 hover:text-blue-600"
                          >
                            <span>Patient</span>
                            {getSortIcon('patientName')}
                          </button>
                        </th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedClaims.map((claim) => {
                        const StatusIcon = statusIcons[claim.status];
                        return (
                          <tr key={claim.id} className="border-b hover:bg-gray-50">
                            <td className="p-4 font-medium text-gray-900">{claim.id}</td>
                            <td className="p-4 text-gray-600">
                              {new Date(claim.dateSubmitted).toLocaleDateString()}
                            </td>
                            <td className="p-4">
                              <Badge className={statusColors[claim.status]} variant="outline">
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {claim.status}
                              </Badge>
                            </td>
                            <td className="p-4 text-gray-900 font-semibold">
                              ${claim.amount.toFixed(2)}
                            </td>
                            <td className="p-4 text-gray-600">{claim.patientName}</td>
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleViewDetails(claim)}
                                    >
                                      <Eye className="h-4 w-4 mr-1" />
                                      View
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>Claim Details - {claim.id}</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-sm font-semibold text-gray-700">Patient</label>
                                          <p className="text-gray-900">{claim.patientName} ({claim.patientId})</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-semibold text-gray-700">Date Submitted</label>
                                          <p className="text-gray-900">{new Date(claim.dateSubmitted).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-semibold text-gray-700">Amount</label>
                                          <p className="text-gray-900 font-semibold">${claim.amount.toFixed(2)}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-semibold text-gray-700">Payer</label>
                                          <p className="text-gray-900">{claim.payerInfo}</p>
                                        </div>
                                      </div>
                                      
                                      <div>
                                        <label className="text-sm font-semibold text-gray-700">Status</label>
                                        <div className="flex items-center mt-1">
                                          <Badge className={statusColors[claim.status]} variant="outline">
                                            <StatusIcon className="h-3 w-3 mr-1" />
                                            {claim.status}
                                          </Badge>
                                          <span className="ml-2 text-sm text-gray-500">
                                            Last updated: {new Date(claim.lastUpdated).toLocaleDateString()}
                                          </span>
                                        </div>
                                      </div>

                                      {claim.rejectionReason && (
                                        <div>
                                          <label className="text-sm font-semibold text-gray-700">Rejection Reason</label>
                                          <p className="text-red-600 bg-red-50 p-2 rounded border border-red-200 mt-1">
                                            <AlertTriangle className="h-4 w-4 inline mr-2" />
                                            {claim.rejectionReason}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </DialogContent>
                                </Dialog>

                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => handleUpdateClaim(claim.id)}>
                                      Update Claim
                                    </DropdownMenuItem>
                                    {claim.status === 'denied' && (
                                      <DropdownMenuItem onClick={() => handleManageRejection(claim.id)}>
                                        Manage Rejection
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-gray-600">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedClaims.length)} of {filteredAndSortedClaims.length} results
                    </p>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}

                {filteredAndSortedClaims.length === 0 && (
                  <div className="text-center py-12">
                    <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No claims found</h3>
                    <p className="text-gray-600 mb-4">
                      {searchTerm || statusFilter !== "all" 
                        ? "Try adjusting your search or filter criteria."
                        : "No claims have been submitted yet."
                      }
                    </p>
                    <Link href="/receptionist/submit-claims">
                      <Button>
                        Submit New Claim
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Real-time Updates */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Real-time Updates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {auditLog.length > 0 ? (
                    auditLog.slice(-5).map((entry, index) => (
                      <div key={index} className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
                        {entry}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500">No recent updates</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Link href="/receptionist/submit-claims">
                    <Button variant="outline" size="sm" className="w-full">
                      Submit New Claim
                    </Button>
                  </Link>
                  <Link href="/receptionist/manage-rejections">
                    <Button variant="outline" size="sm" className="w-full">
                      Manage Rejections
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}