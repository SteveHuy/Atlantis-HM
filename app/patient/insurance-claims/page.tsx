"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Search, Download, Filter, ChevronUp, ChevronDown, FileText, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

// Mock data for insurance claims
const mockClaims = [
  {
    id: "CLM-2024-001",
    date: "2024-01-15",
    amount: 450.00,
    status: "Approved" as const,
    patientDetails: "John Smith, DOB: 01/15/1980",
    encounterInfo: "Annual Physical Exam - Dr. Johnson",
    billingCodes: "99213, 99000, 85025"
  },
  {
    id: "CLM-2024-002",
    date: "2024-02-03",
    amount: 125.50,
    status: "Submitted" as const,
    patientDetails: "John Smith, DOB: 01/15/1980",
    encounterInfo: "Lab Work - Dr. Johnson",
    billingCodes: "80053, 85027"
  },
  {
    id: "CLM-2024-003",
    date: "2024-02-20",
    amount: 680.00,
    status: "Denied" as const,
    patientDetails: "John Smith, DOB: 01/15/1980",
    encounterInfo: "Specialist Consultation - Dr. Williams",
    billingCodes: "99244, 99000"
  },
  {
    id: "CLM-2024-004",
    date: "2024-03-10",
    amount: 320.75,
    status: "Approved" as const,
    patientDetails: "John Smith, DOB: 01/15/1980",
    encounterInfo: "Follow-up Visit - Dr. Johnson",
    billingCodes: "99214, 99000"
  }
];

const statusColors = {
  Submitted: "bg-blue-100 text-blue-800 border-blue-200",
  Approved: "bg-green-100 text-green-800 border-green-200",
  Denied: "bg-red-100 text-red-800 border-red-200"
};

type SortField = 'date' | 'amount' | 'status';
type SortOrder = 'asc' | 'desc';

export default function InsuranceClaimsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedClaim, setSelectedClaim] = useState<typeof mockClaims[0] | null>(null);

  const filteredAndSortedClaims = useMemo(() => {
    let filtered = mockClaims.filter(claim => {
      const matchesSearch = claim.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           claim.date.includes(searchTerm);
      const matchesStatus = statusFilter === "all" || claim.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
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

  const handleDownloadSummary = (claim: typeof mockClaims[0]) => {
    // Simulate PDF download
    const element = document.createElement('a');
    const file = new Blob([`Insurance Claim Summary

Claim ID: ${claim.id}
Date: ${claim.date}
Amount: $${claim.amount.toFixed(2)}
Status: ${claim.status}

Patient Details: ${claim.patientDetails}
Encounter: ${claim.encounterInfo}
Billing Codes: ${claim.billingCodes}

This is a simulated PDF download.`], { type: 'text/plain' });

    element.href = URL.createObjectURL(file);
    element.download = `claim-summary-${claim.id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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
                href="/patient/dashboard"
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Insurance Claims</h1>
          <p className="text-gray-600">
            View the details and status of your insurance claims to track your healthcare expenses and reimbursements.
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
                    placeholder="Search by Claim ID or Date..."
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
                    <SelectItem value="Submitted">Submitted</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Denied">Denied</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Claims Table */}
        <Card>
          <CardHeader>
            <CardTitle>Claims ({filteredAndSortedClaims.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">
                      <button
                        onClick={() => handleSort('date')}
                        className="flex items-center space-x-1 font-semibold text-gray-900 hover:text-blue-600"
                      >
                        <span>Claim ID</span>
                      </button>
                    </th>
                    <th className="text-left p-4">
                      <button
                        onClick={() => handleSort('date')}
                        className="flex items-center space-x-1 font-semibold text-gray-900 hover:text-blue-600"
                      >
                        <span>Date</span>
                        {getSortIcon('date')}
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
                        onClick={() => handleSort('status')}
                        className="flex items-center space-x-1 font-semibold text-gray-900 hover:text-blue-600"
                      >
                        <span>Status</span>
                        {getSortIcon('status')}
                      </button>
                    </th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedClaims.map((claim) => (
                    <tr key={claim.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-900">{claim.id}</td>
                      <td className="p-4 text-gray-600">
                        {new Date(claim.date).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-gray-900 font-semibold">
                        ${claim.amount.toFixed(2)}
                      </td>
                      <td className="p-4">
                        <Badge className={statusColors[claim.status]} variant="outline">
                          {claim.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedClaim(claim)}
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
                                <div>
                                  <label className="text-sm font-semibold text-gray-700">Patient Details</label>
                                  <p className="text-gray-900 bg-gray-50 p-2 rounded border mt-1">
                                    {claim.patientDetails}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-semibold text-gray-700">Encounter Info</label>
                                  <p className="text-gray-900 bg-gray-50 p-2 rounded border mt-1">
                                    {claim.encounterInfo}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-semibold text-gray-700">Billing Codes</label>
                                  <p className="text-gray-900 bg-gray-50 p-2 rounded border mt-1">
                                    {claim.billingCodes}
                                  </p>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="text-sm text-gray-600">Amount: <span className="font-semibold">${claim.amount.toFixed(2)}</span></p>
                                    <p className="text-sm text-gray-600">Status:
                                      <Badge className={`ml-2 ${statusColors[claim.status]}`} variant="outline">
                                        {claim.status}
                                      </Badge>
                                    </p>
                                  </div>
                                  <Button
                                    onClick={() => handleDownloadSummary(claim)}
                                    variant="outline"
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download PDF
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredAndSortedClaims.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No claims found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "You don't have any insurance claims yet."
                  }
                </p>
                <Link href="/patient/insurance-details">
                  <Button>
                    Submit Insurance Details
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
