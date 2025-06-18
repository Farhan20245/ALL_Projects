import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Calendar,
  Users,
  Building,
  Heart,
  Share2,
  ArrowLeft,
  Briefcase,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import type { JobWithCompany } from '@/types';

export default function JobDetail() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: job, isLoading, error } = useQuery<JobWithCompany>({
    queryKey: ['/api/jobs', id],
    queryFn: async () => {
      const response = await fetch(`/api/jobs/${id}`);
      if (!response.ok) throw new Error('Job not found');
      return response.json();
    },
    enabled: !!id,
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/applications', {
        jobId: parseInt(id!),
        coverLetter: '',
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Application submitted",
        description: "Your application has been submitted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to apply for job",
        variant: "destructive",
      });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/saved-jobs', {
        jobId: parseInt(id!),
      });
      return response.json();
    },
    onSuccess: () => {
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
    },
  });

  const handleApply = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please login to apply for jobs",
        variant: "destructive",
      });
      navigate('/login');
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

    applyMutation.mutate();
  };

  const handleSave = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please login to save jobs",
        variant: "destructive",
      });
      navigate('/login');
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

    saveMutation.mutate();
  };

  const formatSalary = () => {
    if (!job?.salaryMin && !job?.salaryMax) return null;
    
    const currency = job?.currency === 'BDT' ? '৳' : job?.currency;
    const min = job?.salaryMin ? parseInt(job.salaryMin).toLocaleString() : '';
    const max = job?.salaryMax ? parseInt(job.salaryMax).toLocaleString() : '';
    
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
    if (!job?.createdAt) return '';
    
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-light-gray dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-4"></div>
            <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-light-gray dark:bg-gray-800 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Job Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The job you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/jobs')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-gray dark:bg-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/jobs')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Job Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-linkedin-blue rounded-lg flex items-center justify-center">
                      {job.company?.logo ? (
                        <img 
                          src={job.company.logo} 
                          alt={job.company.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <Building className="h-8 w-8 text-white" />
                      )}
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        {job.title}
                      </h1>
                      <p className="text-lg text-gray-600 dark:text-gray-300">
                        {job.company?.name || 'Company'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={handleSave}>
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Job Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{timeAgo()}</span>
                  </div>
                </div>

                {/* Skills */}
                {job.skills && job.skills.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Required Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Job Status */}
                <div className="flex items-center space-x-4">
                  {job.isActive && job.isApproved ? (
                    <div className="flex items-center text-success-green">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">Active</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-yellow-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">Pending Approval</span>
                    </div>
                  )}
                  
                  {job.experienceLevel && (
                    <Badge variant="outline" className="capitalize">
                      {job.experienceLevel} Level
                    </Badge>
                  )}
                  
                  {job.category && (
                    <Badge variant="outline">
                      {job.category}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ 
                    __html: job.description.replace(/\n/g, '<br />') 
                  }} />
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            {job.requirements && (
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose dark:prose-invert max-w-none">
                    <div dangerouslySetInnerHTML={{ 
                      __html: job.requirements.replace(/\n/g, '<br />') 
                    }} />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            {job.benefits && (
              <Card>
                <CardHeader>
                  <CardTitle>Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose dark:prose-invert max-w-none">
                    <div dangerouslySetInnerHTML={{ 
                      __html: job.benefits.replace(/\n/g, '<br />') 
                    }} />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Apply Section */}
            <Card>
              <CardContent className="p-6">
                <Button 
                  onClick={handleApply}
                  disabled={applyMutation.isPending || !job.isActive || !job.isApproved}
                  className="w-full mb-4 bg-linkedin-blue hover:bg-linkedin-dark"
                  size="lg"
                >
                  {applyMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Applying...
                    </>
                  ) : (
                    <>
                      <Briefcase className="h-4 w-4 mr-2" />
                      Apply Now
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={handleSave}
                  disabled={saveMutation.isPending}
                  className="w-full"
                >
                  {saveMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Heart className="h-4 w-4 mr-2" />
                      Save Job
                    </>
                  )}
                </Button>

                {job.applicationDeadline && (
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Application Deadline
                    </p>
                    <p className="text-sm text-yellow-600 dark:text-yellow-300">
                      {new Date(job.applicationDeadline).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Company Info */}
            {job.company && (
              <Card>
                <CardHeader>
                  <CardTitle>About {job.company.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {job.company.industry && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Industry</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{job.company.industry}</p>
                      </div>
                    )}
                    
                    {job.company.location && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Location</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{job.company.location}</p>
                      </div>
                    )}

                    {job.company.website && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Website</p>
                        <a 
                          href={job.company.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-linkedin-blue hover:text-linkedin-dark"
                        >
                          {job.company.website}
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Job Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Job Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Applications</span>
                    <span className="text-sm font-medium">{job._count?.applications || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Posted</span>
                    <span className="text-sm font-medium">{timeAgo()}</span>
                  </div>
                  {job.expiryDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Expires</span>
                      <span className="text-sm font-medium">
                        {new Date(job.expiryDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
