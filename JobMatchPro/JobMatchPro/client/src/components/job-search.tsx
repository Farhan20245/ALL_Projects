import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Filter, X } from 'lucide-react';
import type { JobSearchFilters } from '@/types';

interface JobSearchProps {
  onSearch: (filters: JobSearchFilters) => void;
  initialFilters?: JobSearchFilters;
}

export default function JobSearch({ onSearch, initialFilters }: JobSearchProps) {
  const [filters, setFilters] = useState<JobSearchFilters>({
    search: '',
    location: '',
    category: '',
    experienceLevel: '',
    jobType: '',
    salaryMin: undefined,
    salaryMax: undefined,
    ...initialFilters,
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Update filters when initialFilters change
  useEffect(() => {
    if (initialFilters) {
      setFilters(prev => ({ ...prev, ...initialFilters }));
    }
  }, [initialFilters]);

  const handleFilterChange = (key: keyof JobSearchFilters, value: string | number | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      location: '',
      category: '',
      experienceLevel: '',
      jobType: '',
      salaryMin: undefined,
      salaryMax: undefined,
    };
    setFilters(clearedFilters);
    onSearch(clearedFilters);
  };

  const hasActiveFilters = () => {
    return filters.search || filters.location || filters.category || 
           filters.experienceLevel || filters.jobType || 
           filters.salaryMin || filters.salaryMax;
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

  const popularLocations = [
    'Dhaka, Bangladesh',
    'Chittagong, Bangladesh',
    'Sylhet, Bangladesh',
    'Rajshahi, Bangladesh',
    'Khulna, Bangladesh',
    'Remote',
  ];

  const popularSearches = [
    'Software Engineer',
    'Marketing Manager',
    'Data Scientist',
    'Product Manager',
    'UI/UX Designer',
    'Backend Developer',
    'Frontend Developer',
    'DevOps Engineer',
  ];

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Search Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Job Title/Keywords */}
            <div className="md:col-span-5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Job title, keywords, or company"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
              {/* Popular Searches */}
              <div className="mt-2 flex flex-wrap gap-1">
                {popularSearches.slice(0, 4).map((search) => (
                  <button
                    key={search}
                    type="button"
                    onClick={() => handleFilterChange('search', search)}
                    className="text-xs text-linkedin-blue hover:text-linkedin-dark px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="md:col-span-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="City, state, or remote"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="pl-10"
                />
              </div>
              {/* Popular Locations */}
              <div className="mt-2 flex flex-wrap gap-1">
                {popularLocations.slice(0, 3).map((location) => (
                  <button
                    key={location}
                    type="button"
                    onClick={() => handleFilterChange('location', location)}
                    className="text-xs text-linkedin-blue hover:text-linkedin-dark px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    {location}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Button */}
            <div className="md:col-span-2">
              <Button type="submit" className="w-full bg-linkedin-blue hover:bg-linkedin-dark">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>

            {/* Advanced Filters Toggle */}
            <div className="md:col-span-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="w-full"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="border-t pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Advanced Filters
                </h3>
                {hasActiveFilters() && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-linkedin-blue hover:text-linkedin-dark"
                  >
                    Clear All
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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

                {/* Experience Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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

                {/* Job Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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

                {/* Quick Apply Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quick Filters
                  </label>
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleFilterChange('jobType', 'remote')}
                    >
                      Remote Only
                    </Button>
                  </div>
                </div>
              </div>

              {/* Salary Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Salary Range (BDT)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input
                      type="number"
                      placeholder="Minimum"
                      value={filters.salaryMin || ''}
                      onChange={(e) => handleFilterChange('salaryMin', e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder="Maximum"
                      value={filters.salaryMax || ''}
                      onChange={(e) => handleFilterChange('salaryMax', e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </div>
                </div>
                
                {/* Salary Quick Filters */}
                <div className="mt-2 flex flex-wrap gap-2">
                  {[
                    { label: '0-30K', min: 0, max: 30000 },
                    { label: '30K-60K', min: 30000, max: 60000 },
                    { label: '60K-100K', min: 60000, max: 100000 },
                    { label: '100K+', min: 100000, max: undefined },
                  ].map((range) => (
                    <button
                      key={range.label}
                      type="button"
                      onClick={() => {
                        handleFilterChange('salaryMin', range.min);
                        handleFilterChange('salaryMax', range.max);
                      }}
                      className="text-xs text-linkedin-blue hover:text-linkedin-dark px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Advanced Search */}
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAdvancedFilters(false)}
                >
                  Close
                </Button>
                <Button type="submit" className="bg-linkedin-blue hover:bg-linkedin-dark">
                  Apply Filters
                </Button>
              </div>
            </div>
          )}

          {/* Active Filters Display */}
          {hasActiveFilters() && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Active Filters:
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-linkedin-blue hover:text-linkedin-dark"
                >
                  Clear All
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.search && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Search: {filters.search}
                    <button 
                      type="button"
                      onClick={() => handleFilterChange('search', '')}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.location && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Location: {filters.location}
                    <button 
                      type="button"
                      onClick={() => handleFilterChange('location', '')}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.category && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Category: {filters.category}
                    <button 
                      type="button"
                      onClick={() => handleFilterChange('category', '')}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.experienceLevel && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Experience: {experienceLevels.find(l => l.value === filters.experienceLevel)?.label}
                    <button 
                      type="button"
                      onClick={() => handleFilterChange('experienceLevel', '')}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.jobType && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Type: {jobTypes.find(t => t.value === filters.jobType)?.label}
                    <button 
                      type="button"
                      onClick={() => handleFilterChange('jobType', '')}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {(filters.salaryMin || filters.salaryMax) && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Salary: {filters.salaryMin ? `৳${filters.salaryMin?.toLocaleString()}` : '0'} - {filters.salaryMax ? `৳${filters.salaryMax?.toLocaleString()}` : '∞'}
                    <button 
                      type="button"
                      onClick={() => {
                        handleFilterChange('salaryMin', undefined);
                        handleFilterChange('salaryMax', undefined);
                      }}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
