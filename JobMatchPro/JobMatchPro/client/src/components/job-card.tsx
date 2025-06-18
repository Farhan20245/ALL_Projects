import { useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Heart,
  Building,
  Calendar
} from 'lucide-react';
import type { JobWithCompany } from '@/types';

interface JobCardProps {
  job: JobWithCompany;
  showSaveButton?: boolean;
  onApplicationSuccess?: () => void;
}

export default function JobCard({ job, showSaveButton = true, onApplicationSuccess }: JobCardProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSaved, setIsSaved] = useState(false);

  const saveJobMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/saved-jobs', { jobId: job.id });
      return response.json();
    },
    onSuccess: () => {
      setIsSaved(true);
      toast({
        title: "Job saved",
        description: "Job has been added to your saved list",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-jobs'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save job",
        variant: "destructive",
      });
    }
  });

  const applyJobMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/applications', { 
        jobId: job.id,
        coverLetter: '' 
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Application submitted",
        description: "Your application has been submitted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
      onApplicationSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to apply for job",
        variant: "destructive",
      });
    }
  });

  const handleSaveJob = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please login to save jobs",
        variant: "destructive",
      });
      return;
    }

    if (user?.role !== 'job_seeker') {
      toast({
        title: "Not available",
        description: "Only job seekers can save jobs",
        variant: "destructive",
      });
      return;
    }

    saveJobMutation.mutate();
  };

  const handleApplyJob = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please login to apply for jobs",
        variant: "destructive",
      });
      return;
    }

    if (user?.role !== 'job_seeker') {
      toast({
        title: "Not available",
        description: "Only job seekers can apply for jobs",
        variant: "destructive",
      });
      return;
    }

    applyJobMutation.mutate();
  };

  const formatSalary = () => {
    if (!job.salaryMin && !job.salaryMax) return null;
    
    const currency = job.currency === 'BDT' ? '৳' : job.currency;
    const min = job.salaryMin ? parseInt(job.salaryMin).toLocaleString() : '';
    const max = job.salaryMax ? parseInt(job.salaryMax).toLocaleString() : '';
    
    if (min && max) {
      return `${currency}${min} - ${currency}${max}`;
    } else if (min) {
      return `From ${currency}${min}`;
    } else if (max) {
      return `Up to ${currency}${max}`;
    }
    return null;
  };

  const timeAgo = () => {
    const now = new Date();
    const created = new Date(job.createdAt);
    const diffInHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  };

  return (
    <Link href={`/jobs/${job.id}`}>
      <Card className="hover:shadow-xl transition-shadow duration-300 cursor-pointer border border-gray-200 dark:border-gray-600">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-3 flex-1">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                {job.company?.logo ? (
                  <img 
                    src={job.company.logo} 
                    alt={job.company.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <Building className="h-6 w-6 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                  {job.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                  {job.company?.name || 'Company Name'}
                </p>
              </div>
            </div>
            
            {showSaveButton && isAuthenticated && user?.role === 'job_seeker' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSaveJob}
                className={`p-2 ${isSaved ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                disabled={saveJobMutation.isPending}
              >
                <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
              </Button>
            )}
          </div>
          
          <div className="space-y-3 mb-4">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{job.location}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <Clock className="h-4 w-4 mr-2" />
              <span className="capitalize">{job.jobType.replace('_', ' ')}</span>
            </div>
            
            {formatSalary() && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <DollarSign className="h-4 w-4 mr-2" />
                <span>{formatSalary()}</span>
              </div>
            )}
          </div>
          
          {/* Skills Tags */}
          {job.skills && job.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {job.skills.slice(0, 3).map((skill, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-xs"
                >
                  {skill}
                </Badge>
              ))}
              {job.skills.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{job.skills.length - 3} more
                </Badge>
              )}
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{timeAgo()}</span>
            </div>
            
            {isAuthenticated && user?.role === 'job_seeker' && (
              <Button
                onClick={handleApplyJob}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
                disabled={applyJobMutation.isPending}
              >
                {applyJobMutation.isPending ? 'Applying...' : 'Apply Now'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
