"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Search, 
  MapPin, 
  User, 
  Calendar,
  Star,
  ChevronLeft,
  ChevronRight,
  Filter,
  SortAsc,
  SortDesc
} from "lucide-react";
import { 
  searchServicesSchema, 
  type SearchServicesData,
  sanitizeSearchInput
} from "@/lib/epic4-validation";
import { 
  Epic4MockDataManager, 
  type Provider
} from "@/lib/epic4-mock-data";

interface SearchResults {
  providers: Provider[];
  total: number;
  currentPage: number;
  totalPages: number;
}

type SortOption = 'name' | 'specialty' | 'rating';
type SortDirection = 'asc' | 'desc';

export default function SearchServicesPage() {
  const router = useRouter();
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showFilters, setShowFilters] = useState(false);
  
  const itemsPerPage = 6;
  const specialties = Epic4MockDataManager.getSpecialties();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm<SearchServicesData>({
    resolver: zodResolver(searchServicesSchema)
  });

  // Perform search
  const performSearch = async (data: SearchServicesData, page: number = 1) => {
    setIsSearching(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Sanitize inputs
      const sanitizedData = {
        serviceType: data.serviceType ? sanitizeSearchInput(data.serviceType) : undefined,
        providerName: data.providerName ? sanitizeSearchInput(data.providerName) : undefined,
        specialty: data.specialty
      };
      
      // Search providers
      let providers = Epic4MockDataManager.searchProviders(sanitizedData);
      
      // Sort results
      providers = sortProviders(providers, sortBy, sortDirection);
      
      // Paginate results
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedProviders = providers.slice(startIndex, endIndex);
      
      setSearchResults({
        providers: paginatedProviders,
        total: providers.length,
        currentPage: page,
        totalPages: Math.ceil(providers.length / itemsPerPage)
      });
      setCurrentPage(page);
      
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults({
        providers: [],
        total: 0,
        currentPage: 1,
        totalPages: 0
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Sort providers
  const sortProviders = (providers: Provider[], sortBy: SortOption, direction: SortDirection): Provider[] => {
    return [...providers].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'specialty':
          aValue = a.specialty.toLowerCase();
          bValue = b.specialty.toLowerCase();
          break;
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
          break;
        default:
          return 0;
      }
      
      if (direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  };

  // Handle search form submission
  const onSubmit = (data: SearchServicesData) => {
    performSearch(data, 1);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    const formData = {
      serviceType: watch('serviceType'),
      providerName: watch('providerName'),
      specialty: watch('specialty')
    };
    performSearch(formData, page);
  };

  // Handle sorting change
  const handleSortChange = (newSortBy: SortOption) => {
    const newDirection = sortBy === newSortBy && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortBy(newSortBy);
    setSortDirection(newDirection);
    
    if (searchResults) {
      const formData = {
        serviceType: watch('serviceType'),
        providerName: watch('providerName'),
        specialty: watch('specialty')
      };
      performSearch(formData, currentPage);
    }
  };

  // Handle booking
  const handleBookAppointment = (providerId: string) => {
    router.push(`/patient/schedule-appointment?providerId=${providerId}`);
  };

  // Clear search
  const handleClearSearch = () => {
    reset();
    setSearchResults(null);
    setCurrentPage(1);
    setSortBy('name');
    setSortDirection('asc');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Search for Services</h1>
          <p className="text-gray-600">Find healthcare services and providers that meet your needs</p>
        </div>

        {/* Search Form */}
        <Card className="p-6 mb-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="serviceType">Service Type</Label>
                <Input
                  id="serviceType"
                  {...register('serviceType')}
                  placeholder="e.g., General, Cardiology, Dermatology"
                  className="mt-1"
                />
                {errors.serviceType && (
                  <p className="text-sm text-red-600 mt-1">{errors.serviceType.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="providerName">Provider Name</Label>
                <Input
                  id="providerName"
                  {...register('providerName')}
                  placeholder="e.g., Dr. Smith, Dr. Johnson"
                  className="mt-1"
                />
                {errors.providerName && (
                  <p className="text-sm text-red-600 mt-1">{errors.providerName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="specialty">Specialty</Label>
                <select
                  id="specialty"
                  {...register('specialty')}
                  className="w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Specialties</option>
                  {specialties.map((specialty) => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>
                {errors.specialty && (
                  <p className="text-sm text-red-600 mt-1">{errors.specialty.message}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button type="submit" disabled={isSearching} className="flex-1 sm:flex-none">
                <Search className="w-4 h-4 mr-2" />
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClearSearch}
                className="flex-1 sm:flex-none"
              >
                Clear
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex-1 sm:flex-none"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium text-gray-900 mb-4">Sort Results</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant={sortBy === 'name' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSortChange('name')}
                  >
                    Name
                    {sortBy === 'name' && (
                      sortDirection === 'asc' ? <SortAsc className="w-4 h-4 ml-1" /> : <SortDesc className="w-4 h-4 ml-1" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant={sortBy === 'specialty' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSortChange('specialty')}
                  >
                    Specialty
                    {sortBy === 'specialty' && (
                      sortDirection === 'asc' ? <SortAsc className="w-4 h-4 ml-1" /> : <SortDesc className="w-4 h-4 ml-1" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant={sortBy === 'rating' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSortChange('rating')}
                  >
                    Rating
                    {sortBy === 'rating' && (
                      sortDirection === 'asc' ? <SortAsc className="w-4 h-4 ml-1" /> : <SortDesc className="w-4 h-4 ml-1" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </Card>

        {/* Search Results */}
        {searchResults !== null && (
          <div className="space-y-6">
            {/* Results Summary */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Search Results</h2>
                <p className="text-gray-600">
                  {searchResults.total === 0 
                    ? "No matching services or providers found"
                    : `Showing ${((searchResults.currentPage - 1) * itemsPerPage) + 1}-${Math.min(searchResults.currentPage * itemsPerPage, searchResults.total)} of ${searchResults.total} results`
                  }
                </p>
              </div>
              
              {searchResults.total > 0 && (
                <div className="text-sm text-gray-500">
                  Page {searchResults.currentPage} of {searchResults.totalPages}
                </div>
              )}
            </div>

            {/* No Results */}
            {searchResults.total === 0 && (
              <Alert>
                <Search className="h-4 w-4" />
                <AlertDescription>
                  No matching services or providers found. Try adjusting your search criteria or contact support for assistance.
                </AlertDescription>
              </Alert>
            )}

            {/* Provider Cards */}
            {searchResults.providers.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.providers.map((provider) => (
                  <Card key={provider.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="space-y-4">
                      {/* Provider Header */}
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {provider.name}, {provider.title}
                          </h3>
                          <p className="text-gray-600 text-sm">{provider.specialty}</p>
                          <div className="flex items-center space-x-1 mt-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600">{provider.rating}</span>
                          </div>
                        </div>
                      </div>

                      {/* Services */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Available Services</h4>
                        <div className="flex flex-wrap gap-1">
                          {provider.serviceTypes.slice(0, 3).map((serviceTypeId) => {
                            const serviceType = Epic4MockDataManager.getServiceTypes()
                              .find(st => st.id === serviceTypeId);
                            return serviceType ? (
                              <span 
                                key={serviceTypeId}
                                className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                              >
                                {serviceType.name}
                              </span>
                            ) : null;
                          })}
                          {provider.serviceTypes.length > 3 && (
                            <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                              +{provider.serviceTypes.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Location */}
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{provider.location}</span>
                      </div>

                      {/* Status */}
                      {provider.requiresApproval && (
                        <div>
                          <span className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                            Requires Approval
                          </span>
                        </div>
                      )}

                      {/* Book Button */}
                      <Button 
                        onClick={() => handleBookAppointment(provider.id)}
                        className="w-full"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Book Appointment
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {searchResults.totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(searchResults.currentPage - 1)}
                  disabled={searchResults.currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                
                {/* Page Numbers */}
                {Array.from({ length: searchResults.totalPages }, (_, i) => i + 1).map((page) => {
                  // Show first page, last page, current page, and adjacent pages
                  const showPage = page === 1 || 
                                   page === searchResults.totalPages || 
                                   Math.abs(page - searchResults.currentPage) <= 1;
                  
                  if (!showPage) {
                    // Show ellipsis for gaps
                    if (page === 2 && searchResults.currentPage > 4) {
                      return <span key={page} className="px-2">...</span>;
                    }
                    if (page === searchResults.totalPages - 1 && searchResults.currentPage < searchResults.totalPages - 3) {
                      return <span key={page} className="px-2">...</span>;
                    }
                    return null;
                  }
                  
                  return (
                    <Button
                      key={page}
                      variant={page === searchResults.currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  );
                })}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(searchResults.currentPage + 1)}
                  disabled={searchResults.currentPage === searchResults.totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}