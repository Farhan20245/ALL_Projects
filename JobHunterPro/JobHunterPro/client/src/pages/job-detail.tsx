import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/Header";
import ApplicationModal from "@/components/ApplicationModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  Heart, 
  Share2, 
  Building, 
  Calendar,
  Briefcase,
  CheckCircle,
  ArrowLeft,
  ExternalLink
} from "lucide-react";
import { Link } from "wouter";
import type { JobWithCompany } from "@shared/schema";

export default function JobDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Fetch job details
  const { data: job, isLoading, error } = useQuery({
    queryKey: [`/api/jobs/${id}`],
    retry: false,
    enabled: !!id,
  });

  // Set bookmark status when job loads
  useEffect(() => {
    if (job?.isBookmarked) {
      setIsBookmarked(true);
    }
  }, [job]);

  // Bookmark mutation
  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      if (isBookmarked) {
        await apiRequest('DELETE', `/api/bookmarks/${job?.id}`);
      } else {
        await apiRequest('POST', '/api/bookmarks', { jobId: job?.id });
      }
    },
    onSuccess: () => {
      setIsBookmarked(!isBookmarked);
      queryClient.invalidateQueries({ queryKey: [`/api/jobs/${id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/bookmarks'] });
      toast({
        title: isBookmarked ? "Bookmark removed" : "Job bookmarked",
        description: isBookmarked ? "Job removed from your bookmarks" : "Job added to your bookmarks",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleApply = () => {
    if (!isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to apply for jobs",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1000);
      return;
    }

    if (user?.role !== 'jobseeker') {
      toast({
        title: "Access denied",
        description: "Only job seekers can apply for jobs",
        variant: "destructive",
      });
      return;
    }

    setShowApplicationModal(true);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: job?.title,
          text: `Check out this job opportunity: ${job?.title} at ${job?.company?.name}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied",
          description: "Job link copied to clipboard",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Could not copy link",
          variant: "destructive",
        });
      }
    }
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

  const getJobTypeColor = (type: string) => {
    switch (type) {
      case 'full-time':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'part-time':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'contract':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'remote':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'internship':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getExperienceColor = (level: string) => {
    switch (level) {
      case 'entry':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'mid':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'senior':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'executive':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Job Not Found
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                The job you're looking for doesn't exist or has been removed.
              </p>
              <Link href="/">
                <Button className="btn-primary">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Jobs
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center text-primary hover:text-secondary mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Link>

        {/* Job Header */}
        <Card className="mb-6">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
              <div className="flex-1">
                <div className="flex items-start space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {job.title}
                    </h1>
                    <Link href={`/companies/${job.company?.id}`}>
                      <h2 className="text-xl text-primary hover:text-secondary mb-3 cursor-pointer">
                        {job.isAnonymous ? "Confidential Company" : job.company?.name}
                      </h2>
                    </Link>
                    <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-400">
                      <span className="flex items-center">
                        <MapPin className="mr-2 h-4 w-4" />
                        {job.isRemote ? "Remote" : job.location}
                      </span>
                      <span className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        {job.jobType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                      <span className="flex items-center">
                        <DollarSign className="mr-2 h-4 w-4" />
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          {formatSalary(job.salaryMin, job.salaryMax, job.salaryType)}
                        </span>
                      </span>
                      <span className="flex items-center">
                        <Users className="mr-2 h-4 w-4" />
                        {job.applicantCount || 0} applicants
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className={getJobTypeColor(job.jobType)}>
                    {job.jobType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                  <Badge className={getExperienceColor(job.experienceLevel)}>
                    {job.experienceLevel.charAt(0).toUpperCase() + job.experienceLevel.slice(1)} Level
                  </Badge>
                  {job.isRemote && (
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                      Remote
                    </Badge>
                  )}
                </div>

                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Posted {new Date(job.createdAt).toLocaleDateString()} 
                  {job.deadline && (
                    <span> • Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                  )}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="flex gap-3">
                  {isAuthenticated && user?.role === 'jobseeker' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => bookmarkMutation.mutate()}
                      disabled={bookmarkMutation.isPending}
                      className={isBookmarked ? "text-red-500 border-red-500" : ""}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${isBookmarked ? "fill-current" : ""}`} />
                      {isBookmarked ? "Saved" : "Save"}
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
                
                {isAuthenticated && user?.role === 'jobseeker' && (
                  <Button 
                    className="btn-primary"
                    onClick={handleApply}
                    disabled={!!job.applicationStatus}
                  >
                    {job.applicationStatus ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Applied
                      </>
                    ) : (
                      "Apply Now"
                    )}
                  </Button>
                )}
                
                {!isAuthenticated && (
                  <Button className="btn-primary" onClick={handleApply}>
                    Apply Now
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {job.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {job.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Responsibilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {job.responsibilities.map((responsibility, index) => (
                      <li key={index} className="flex items-start">
                        <Briefcase className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{responsibility}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Skills */}
            {job.skills && job.skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Required Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="skill-tag">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Job Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Job Type</span>
                  <span className="font-medium">{job.jobType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Experience</span>
                  <span className="font-medium">{job.experienceLevel.charAt(0).toUpperCase() + job.experienceLevel.slice(1)} Level</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Location</span>
                  <span className="font-medium">{job.isRemote ? "Remote" : job.location}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Salary</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {formatSalary(job.salaryMin, job.salaryMax, job.salaryType)}
                  </span>
                </div>
                {job.deadline && (
                  <>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Deadline</span>
                      <span className="font-medium">{new Date(job.deadline).toLocaleDateString()}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Company Info */}
            {!job.isAnonymous && job.company && (
              <Card>
                <CardHeader>
                  <CardTitle>About {job.company.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Building className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">{job.company.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{job.company.industry}</p>
                    </div>
                  </div>
                  
                  {job.company.description && (
                    <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-3">
                      {job.company.description}
                    </p>
                  )}
                  
                  <div className="space-y-2 text-sm">
                    {job.company.location && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Location</span>
                        <span className="font-medium">{job.company.location}</span>
                      </div>
                    )}
                    {job.company.size && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Size</span>
                        <span className="font-medium">{job.company.size}</span>
                      </div>
                    )}
                    {job.company.foundedYear && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Founded</span>
                        <span className="font-medium">{job.company.foundedYear}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Link href={`/companies/${job.company.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        View Company
                      </Button>
                    </Link>
                    {job.company.website && (
                      <a 
                        href={job.company.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button variant="outline" size="sm" className="w-full">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Website
                        </Button>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Application Status */}
            {job.applicationStatus && (
              <Card>
                <CardHeader>
                  <CardTitle>Application Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {job.applicationStatus.charAt(0).toUpperCase() + job.applicationStatus.slice(1)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Your application has been received
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Application Modal */}
      <ApplicationModal
        job={job}
        isOpen={showApplicationModal}
        onClose={() => setShowApplicationModal(false)}
      />
    </div>
  );
}
