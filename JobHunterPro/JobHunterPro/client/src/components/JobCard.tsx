import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Clock, DollarSign, Users } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import type { JobWithCompany } from "@shared/schema";

interface JobCardProps {
  job: JobWithCompany;
  onApply?: (job: JobWithCompany) => void;
  showApplicationStatus?: boolean;
}

export default function JobCard({ job, onApply, showApplicationStatus }: JobCardProps) {
  const { isAuthenticated, user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(job.isBookmarked || false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      if (isBookmarked) {
        await apiRequest('DELETE', `/api/bookmarks/${job.id}`);
      } else {
        await apiRequest('POST', '/api/bookmarks', { jobId: job.id });
      }
    },
    onSuccess: () => {
      setIsBookmarked(!isBookmarked);
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bookmarks'] });
      toast({
        title: isBookmarked ? "Bookmark removed" : "Job bookmarked",
        description: isBookmarked ? "Job removed from your bookmarks" : "Job added to your bookmarks",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getCompanyIcon = (industry?: string) => {
    // Return appropriate icon based on industry
    return "💼"; // Default icon
  };

  const formatSalary = (min?: string, max?: string, type?: string) => {
    if (!min && !max) return "Salary not specified";
    
    const format = (amount: string) => {
      const num = parseInt(amount);
      if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
      if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
      return `$${num.toLocaleString()}`;
    };

    const suffix = type === 'hourly' ? '/hr' : type === 'monthly' ? '/mo' : '/yr';
    
    if (min && max) {
      return `${format(min)} - ${format(max)}${suffix}`;
    }
    return `${format(min || max!)}+${suffix}`;
  };

  const getApplicationStatusBadge = () => {
    if (!showApplicationStatus || !job.applicationStatus) return null;
    
    const statusColors = {
      applied: "bg-blue-100 text-blue-800",
      viewed: "bg-yellow-100 text-yellow-800",
      shortlisted: "bg-purple-100 text-purple-800",
      interview: "bg-orange-100 text-orange-800",
      rejected: "bg-red-100 text-red-800",
      hired: "bg-green-100 text-green-800",
    };

    return (
      <Badge className={cn("text-xs", statusColors[job.applicationStatus as keyof typeof statusColors])}>
        {job.applicationStatus.charAt(0).toUpperCase() + job.applicationStatus.slice(1)}
      </Badge>
    );
  };

  return (
    <Card className="job-card">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
          <div className="flex items-start space-x-4 flex-1">
            {/* Company Logo */}
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xl">{getCompanyIcon(job.company?.industry)}</span>
            </div>
            
            <div className="flex-1 min-w-0">
              <Link href={`/jobs/${job.id}`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1 hover:text-primary cursor-pointer">
                  {job.title}
                </h3>
              </Link>
              
              <Link href={`/companies/${job.company?.id}`}>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-2 hover:text-primary cursor-pointer">
                  {job.isAnonymous ? "Confidential Company" : job.company?.name}
                </p>
              </Link>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center">
                  <MapPin className="mr-1 h-4 w-4" />
                  {job.isRemote ? "Remote" : job.location}
                </span>
                <span className="flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  {job.jobType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
                <span className="flex items-center">
                  <DollarSign className="mr-1 h-4 w-4" />
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {formatSalary(job.salaryMin, job.salaryMax, job.salaryType)}
                  </span>
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            {getApplicationStatusBadge()}
            
            {isAuthenticated && user?.role === 'jobseeker' && (
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "p-2 transition-colors",
                  isBookmarked ? "text-red-500 hover:text-red-600" : "text-gray-400 hover:text-red-500"
                )}
                onClick={() => bookmarkMutation.mutate()}
                disabled={bookmarkMutation.isPending}
              >
                <Heart className={cn("h-4 w-4", isBookmarked && "fill-current")} />
              </Button>
            )}
            
            {isAuthenticated && user?.role === 'jobseeker' && onApply && (
              <Button 
                className="btn-primary"
                onClick={() => onApply(job)}
                disabled={!!job.applicationStatus}
              >
                {job.applicationStatus ? 'Applied' : 'Apply Now'}
              </Button>
            )}
          </div>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {job.description}
        </p>
        
        {/* Skills */}
        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {job.skills.slice(0, 4).map((skill, index) => (
              <Badge key={index} variant="secondary" className="skill-tag">
                {skill}
              </Badge>
            ))}
            {job.skills.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{job.skills.length - 4} more
              </Badge>
            )}
          </div>
        )}
        
        <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-800">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Posted {new Date(job.createdAt).toLocaleDateString()}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
            <Users className="mr-1 h-3 w-3" />
            {job.applicantCount || 0} applicants
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
