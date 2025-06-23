import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, SlidersHorizontal } from "lucide-react";
import type { SearchFilters } from "@/types";

interface SearchBarProps {
  onSearch: (filters: Partial<SearchFilters>) => void;
  onToggleFilters?: () => void;
  initialFilters?: Partial<SearchFilters>;
}

export default function SearchBar({ onSearch, onToggleFilters, initialFilters }: SearchBarProps) {
  const [filters, setFilters] = useState<Partial<SearchFilters>>({
    search: '',
    location: '',
    jobType: '',
    ...initialFilters,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleInputChange = (field: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    
    // Auto-search on input for better UX
    if (field === 'search') {
      const timeoutId = setTimeout(() => {
        onSearch(newFilters);
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-card rounded-2xl shadow-2xl p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Job Title or Keywords
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="e.g. Software Engineer, Marketing Manager"
                  className="pl-10 search-input"
                  value={filters.search || ''}
                  onChange={(e) => handleInputChange('search', e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="City, State"
                  className="pl-10 search-input"
                  value={filters.location || ''}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Job Type
              </label>
              <Select value={filters.jobType || 'all'} onValueChange={(value) => handleInputChange('jobType', value === 'all' ? '' : value)}>
                <SelectTrigger className="search-input">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="full-time">Full Time</SelectItem>
                  <SelectItem value="part-time">Part Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Button type="submit" className="w-full sm:w-auto btn-primary flex items-center">
              <Search className="mr-2 h-4 w-4" />
              Search Jobs
            </Button>
            {onToggleFilters && (
              <Button 
                type="button"
                variant="ghost" 
                className="text-primary hover:text-secondary font-medium"
                onClick={onToggleFilters}
              >
                Advanced Filters <SlidersHorizontal className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
