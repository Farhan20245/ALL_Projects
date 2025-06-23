import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import type { SearchFilters } from "@/types";

interface JobFiltersProps {
  onFiltersChange: (filters: Partial<SearchFilters>) => void;
  initialFilters?: Partial<SearchFilters>;
}

export default function JobFilters({ onFiltersChange, initialFilters }: JobFiltersProps) {
  const [filters, setFilters] = useState<Partial<SearchFilters>>({
    salaryMin: 0,
    salaryMax: 200000,
    experienceLevel: '',
    ...initialFilters,
  });

  const salaryRanges = [
    { label: '$30,000 - $50,000', min: 30000, max: 50000 },
    { label: '$50,000 - $75,000', min: 50000, max: 75000 },
    { label: '$75,000 - $100,000', min: 75000, max: 100000 },
    { label: '$100,000+', min: 100000, max: 1000000 },
  ];

  const experienceLevels = [
    { value: 'entry', label: 'Entry Level' },
    { value: 'mid', label: 'Mid Level' },
    { value: 'senior', label: 'Senior Level' },
    { value: 'executive', label: 'Executive' },
  ];

  const industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Marketing',
    'Education',
    'Manufacturing',
    'Retail',
    'Consulting',
  ];

  const handleSalaryRangeChange = (range: { min: number; max: number }) => {
    const newFilters = {
      ...filters,
      salaryMin: range.min,
      salaryMax: range.max === 1000000 ? null : range.max,
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleExperienceChange = (level: string, checked: boolean) => {
    const newFilters = {
      ...filters,
      experienceLevel: checked ? level : '',
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      salaryMin: null,
      salaryMax: null,
      experienceLevel: '',
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="text-lg">Filter Jobs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Salary Range */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Salary Range</Label>
          <div className="space-y-2">
            {salaryRanges.map((range) => (
              <div key={range.label} className="flex items-center space-x-2">
                <Checkbox
                  id={`salary-${range.min}`}
                  checked={filters.salaryMin === range.min && filters.salaryMax === (range.max === 1000000 ? null : range.max)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleSalaryRangeChange(range);
                    }
                  }}
                />
                <Label
                  htmlFor={`salary-${range.min}`}
                  className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer"
                >
                  {range.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Experience Level */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Experience Level</Label>
          <div className="space-y-2">
            {experienceLevels.map((level) => (
              <div key={level.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`exp-${level.value}`}
                  checked={filters.experienceLevel === level.value}
                  onCheckedChange={(checked) => handleExperienceChange(level.value, !!checked)}
                />
                <Label
                  htmlFor={`exp-${level.value}`}
                  className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer"
                >
                  {level.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Industry */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Industry</Label>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {industries.map((industry) => (
              <div key={industry} className="flex items-center space-x-2">
                <Checkbox id={`industry-${industry}`} />
                <Label
                  htmlFor={`industry-${industry}`}
                  className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer"
                >
                  {industry}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Button
          variant="outline"
          onClick={clearFilters}
          className="w-full"
        >
          Clear Filters
        </Button>
      </CardContent>
    </Card>
  );
}
