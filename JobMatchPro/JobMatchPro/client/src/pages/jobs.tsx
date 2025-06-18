import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import JobCard from '@/components/job-card';
import JobSearch from '@/components/job-search';
import { Search, Filter, MapPin, Briefcase, DollarSign, Clock } from 'lucide-react';
import type { JobWithCompany, JobSearchFilters } from '@/types';

export default function Jobs() {
  const [location] = useLocation();
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  
  const [filters, setFilters] = useState<JobSearchFilters>({
    search: urlParams.get('search') || '',
    location: urlParams.get('location') || '',
    category: urlParams.get('category') || '',
    experienceLevel: urlParams.get('experienceLevel') || '',
    jobType: urlParams.get('jobType') || '',
    page: 1,
    limit: 12,
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const { data: jobsData, isLoading, refetch } = useQuery({
    queryKey: ['/api/jobs', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          params.append(key, value.toString());
        }
      });
      
      const response = await fetch(`/api/jobs?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch jobs');
      return response.json();
    },
  });

  const jobs = jobsData?.jobs || [];
  const totalJobs = jobsData?.total || 0;
  const totalPages = Math.ceil(totalJobs / (filters.limit || 12));

  const handleFilterChange = (key: keyof JobSearchFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handleSearch = (searchData: JobSearchFilters) => {
    setFilters(prev => ({
      ...prev,
      ...searchData,
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      location: '',
      category: '',
      experienceLevel: '',
      jobType: '',
      page: 1,
      limit: 12,
    });
  };

  const categories = [
    'Technology',
    'Marketing',
    'Sales',
    'Design',
    'Finance',
    'Human Resources',
    'Operations',
    'Customer Service',
    'Engineering',
    'Healthcare',
    'Education',
    'Consulting',
  ];

  const experienceLevels = [
    { value: 'entry', label: 'Entry Level (0-1 years)' },
    { value: 'mid', label: 'Mid Level (2-5 years)' },
    { value: 'senior', label: 'Senior Level (5+ years)' },
  ];

  const jobTypes = [
    { value: 'full-time', label: 'Full Time' },
    { value: 'part-time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'remote', label: 'Remote' },
  ];

  return (
    <div className="min-h-screen bg-light-gray dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Find Your Perfect Job
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Discover opportunities that match your skills and career goals
          </p>
        </div>

        {/* Search Component */}
        <div className="mb-8">
          <JobSearch onSearch={handleSearch} initialFilters={filters} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Filter className="h-5 w-5 mr-2" />
                    Filters
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearFilters}
                    className="text-linkedin-blue hover:text-linkedin-dark"
                  >
                    Clear
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Category Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Category
                  </label>
                  <Select 
                    value={filters.category} 
                    onValueChange={(value) => handleFilterChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Experience Level Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Experience Level
                  </label>
                  <Select 
                    value={filters.experienceLevel} 
                    onValueChange={(value) => handleFilterChange('experienceLevel', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any experience</SelectItem>
                      {experienceLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Job Type Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Job Type
                  </label>
                  <Select 
                    value={filters.jobType} 
                    onValueChange={(value) => handleFilterChange('jobType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All types</SelectItem>
                      {jobTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Enter location"
                      value={filters.location}
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Advanced Filters */}
                <div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="w-full justify-start"
                  >
                    {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
                  </Button>
                  
                  {showAdvancedFilters && (
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                          Min Salary (BDT)
                        </label>
                        <Input
                          type="number"
                          placeholder="Minimum salary"
                          value={filters.salaryMin || ''}
                          onChange={(e) => handleFilterChange('salaryMin', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                          Max Salary (BDT)
                        </label>
                        <Input
                          type="number"
                          placeholder="Maximum salary"
                          value={filters.salaryMax || ''}
                          onChange={(e) => handleFilterChange('salaryMax', parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Jobs List */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {totalJobs > 0 ? `${totalJobs.toLocaleString()} Jobs Found` : 'No Jobs Found'}
                </h2>
                {filters.search && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Results for "{filters.search}"
                  </p>
                )}
              </div>

              {/* Sort Options */}
              <Select defaultValue="newest">
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="salary-high">Highest Salary</SelectItem>
                  <SelectItem value="salary-low">Lowest Salary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters */}
            {(filters.search || filters.location || filters.category || filters.experienceLevel || filters.jobType) && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {filters.search && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Search: {filters.search}
                      <button 
                        onClick={() => handleFilterChange('search', '')}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {filters.location && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Location: {filters.location}
                      <button 
                        onClick={() => handleFilterChange('location', '')}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {filters.category && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Category: {filters.category}
                      <button 
                        onClick={() => handleFilterChange('category', '')}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {filters.experienceLevel && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Experience: {experienceLevels.find(l => l.value === filters.experienceLevel)?.label}
                      <button 
                        onClick={() => handleFilterChange('experienceLevel', '')}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {filters.jobType && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Type: {jobTypes.find(t => t.value === filters.jobType)?.label}
                      <button 
                        onClick={() => handleFilterChange('jobType', '')}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-4"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Jobs Grid */}
            {!isLoading && jobs.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {jobs.map((job: JobWithCompany) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}

            {/* No Results */}
            {!isLoading && jobs.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No jobs found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Try adjusting your search criteria or removing some filters.
                  </p>
                  <Button onClick={clearFilters} variant="outline">
                    Clear all filters
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(filters.page! - 1)}
                    disabled={filters.page === 1}
                  >
                    Previous
                  </Button>
                  
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const page = i + 1;
                    const isCurrentPage = page === filters.page;
                    
                    return (
                      <Button
                        key={page}
                        variant={isCurrentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className={isCurrentPage ? "bg-linkedin-blue hover:bg-linkedin-dark" : ""}
                      >
                        {page}
                      </Button>
                    );
                  })}
                  
                  {totalPages > 5 && (
                    <>
                      <span className="text-gray-400">...</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(totalPages)}
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(filters.page! + 1)}
                    disabled={filters.page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
