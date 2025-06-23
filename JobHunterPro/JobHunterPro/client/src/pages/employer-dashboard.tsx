import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Building, 
  Users, 
  Briefcase, 
  Plus, 
  Edit, 
  Eye, 
  Mail, 
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import type { Job, Company, ApplicationWithJobAndCompany, JobFormData, CompanyFormData } from "@shared/schema";

export default function EmployerDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showJobForm, setShowJobForm] = useState(false);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [selectedJobForApplications, setSelectedJobForApplications] = useState<Job | null>(null);

  const [jobFormData, setJobFormData] = useState<JobFormData>({
    title: '',
    description: '',
    requirements: [],
    responsibilities: [],
    skills: [],
    salaryMin: undefined,
    salaryMax: undefined,
    salaryType: 'yearly',
    jobType: 'full-time',
    experienceLevel: 'mid',
    location: '',
    isRemote: false,
    deadline: undefined,
    isAnonymous: false,
  });

  const [companyFormData, setCompanyFormData] = useState<CompanyFormData>({
    name: '',
    description: '',
    industry: '',
    website: '',
    location: '',
    size: '',
    foundedYear: undefined,
    culture: '',
    benefits: [],
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  // Fetch employer's jobs
  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ["/api/jobs", { postedBy: user?.id }],
    retry: false,
  });

  // Fetch companies owned by the user
  const { data: companies, isLoading: companiesLoading } = useQuery({
    queryKey: ["/api/companies"],
    retry: false,
  });

  // Fetch applications for selected job
  const { data: applications, isLoading: applicationsLoading } = useQuery({
    queryKey: ["/api/jobs", selectedJobForApplications?.id, "applications"],
    enabled: !!selectedJobForApplications,
    retry: false,
  });

  // Create job mutation
  const createJobMutation = useMutation({
    mutationFn: async (data: JobFormData) => {
      return await apiRequest('POST', '/api/jobs', data);
    },
    onSuccess: () => {
      toast({
        title: "Job posted successfully",
        description: "Your job posting is now live.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      setShowJobForm(false);
      resetJobForm();
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
        title: "Error creating job",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update job mutation
  const updateJobMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<JobFormData> }) => {
      return await apiRequest('PATCH', `/api/jobs/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Job updated successfully",
        description: "Your job posting has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      setEditingJob(null);
      resetJobForm();
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
        title: "Error updating job",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create company mutation
  const createCompanyMutation = useMutation({
    mutationFn: async (data: CompanyFormData) => {
      return await apiRequest('POST', '/api/companies', data);
    },
    onSuccess: () => {
      toast({
        title: "Company created successfully",
        description: "Your company profile has been created.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      setShowCompanyForm(false);
      resetCompanyForm();
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
        title: "Error creating company",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update application status mutation
  const updateApplicationStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return await apiRequest('PATCH', `/api/applications/${id}`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Application status updated",
        description: "The applicant has been notified of the status change.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs", selectedJobForApplications?.id, "applications"] });
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
        title: "Error updating application",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetJobForm = () => {
    setJobFormData({
      title: '',
      description: '',
      requirements: [],
      responsibilities: [],
      skills: [],
      salaryMin: undefined,
      salaryMax: undefined,
      salaryType: 'yearly',
      jobType: 'full-time',
      experienceLevel: 'mid',
      location: '',
      isRemote: false,
      deadline: undefined,
      isAnonymous: false,
    });
  };

  const resetCompanyForm = () => {
    setCompanyFormData({
      name: '',
      description: '',
      industry: '',
      website: '',
      location: '',
      size: '',
      foundedYear: undefined,
      culture: '',
      benefits: [],
    });
  };

  const handleJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingJob) {
      updateJobMutation.mutate({ id: editingJob.id, data: jobFormData });
    } else {
      createJobMutation.mutate(jobFormData);
    }
  };

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCompanyMutation.mutate(companyFormData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'viewed':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'shortlisted':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'interview':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'hired':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'employer') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Employer Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your job postings and find the best candidates.
            </p>
          </div>
          <div className="flex space-x-3">
            <Button onClick={() => setShowCompanyForm(true)} variant="outline">
              <Building className="mr-2 h-4 w-4" />
              Add Company
            </Button>
            <Button onClick={() => setShowJobForm(true)} className="btn-primary">
              <Plus className="mr-2 h-4 w-4" />
              Post Job
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="jobs">My Jobs</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="companies">Companies</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <Briefcase className="h-6 w-6 text-primary" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Jobs</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {jobs?.jobs?.filter((job: Job) => job.isActive).length || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Applicants</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {jobs?.jobs?.reduce((sum: number, job: Job) => sum + (job.applicantCount || 0), 0) || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <Eye className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Views</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {jobs?.jobs?.reduce((sum: number, job: Job) => sum + (job.viewCount || 0), 0) || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                      <Building className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Companies</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {companies?.length || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Jobs */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Job Postings</CardTitle>
              </CardHeader>
              <CardContent>
                {jobsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : jobs?.jobs?.length > 0 ? (
                  <div className="space-y-4">
                    {jobs.jobs.slice(0, 5).map((job: Job) => (
                      <div key={job.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">{job.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {job.applicantCount || 0} applicants • {job.viewCount || 0} views
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge variant={job.isActive ? "default" : "secondary"}>
                            {job.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedJobForApplications(job)}
                          >
                            View Applications
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No jobs posted yet</p>
                    <Button className="mt-4 btn-primary" onClick={() => setShowJobForm(true)}>
                      Post Your First Job
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>My Job Postings</CardTitle>
                <Button onClick={() => setShowJobForm(true)} className="btn-primary">
                  <Plus className="mr-2 h-4 w-4" />
                  Post New Job
                </Button>
              </CardHeader>
              <CardContent>
                {jobsLoading ? (
                  <div className="space-y-6">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                      </div>
                    ))}
                  </div>
                ) : jobs?.jobs?.length > 0 ? (
                  <div className="space-y-6">
                    {jobs.jobs.map((job: Job) => (
                      <div key={job.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                              {job.title}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-2">
                              <span className="flex items-center">
                                <MapPin className="mr-1 h-4 w-4" />
                                {job.location}
                              </span>
                              <span className="flex items-center">
                                <DollarSign className="mr-1 h-4 w-4" />
                                {job.salaryMin && job.salaryMax 
                                  ? `$${parseInt(job.salaryMin).toLocaleString()} - $${parseInt(job.salaryMax).toLocaleString()}`
                                  : 'Salary not specified'
                                }
                              </span>
                              <span className="flex items-center">
                                <Calendar className="mr-1 h-4 w-4" />
                                Posted {new Date(job.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={job.isActive ? "default" : "secondary"}>
                              {job.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingJob(job);
                                setJobFormData({
                                  title: job.title,
                                  description: job.description,
                                  requirements: job.requirements || [],
                                  responsibilities: job.responsibilities || [],
                                  skills: job.skills || [],
                                  salaryMin: job.salaryMin ? parseInt(job.salaryMin) : undefined,
                                  salaryMax: job.salaryMax ? parseInt(job.salaryMax) : undefined,
                                  salaryType: job.salaryType || 'yearly',
                                  jobType: job.jobType,
                                  experienceLevel: job.experienceLevel,
                                  location: job.location || '',
                                  isRemote: job.isRemote || false,
                                  deadline: job.deadline ? new Date(job.deadline) : undefined,
                                  isAnonymous: job.isAnonymous || false,
                                  companyId: job.companyId || undefined,
                                });
                                setShowJobForm(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                          {job.description}
                        </p>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center">
                              <Users className="mr-1 h-4 w-4" />
                              {job.applicantCount || 0} applicants
                            </span>
                            <span className="flex items-center">
                              <Eye className="mr-1 h-4 w-4" />
                              {job.viewCount || 0} views
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedJobForApplications(job)}
                          >
                            View Applications
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      No jobs posted yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Start hiring by posting your first job
                    </p>
                    <Button className="btn-primary" onClick={() => setShowJobForm(true)}>
                      Post Your First Job
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            {selectedJobForApplications ? (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Applications for {selectedJobForApplications.title}</CardTitle>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {applications?.length || 0} total applications
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedJobForApplications(null)}
                  >
                    Back to Jobs
                  </Button>
                </CardHeader>
                <CardContent>
                  {applicationsLoading ? (
                    <div className="space-y-6">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                        </div>
                      ))}
                    </div>
                  ) : applications?.length > 0 ? (
                    <div className="space-y-6">
                      {applications.map((application: ApplicationWithJobAndCompany) => (
                        <div key={application.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-start space-x-4">
                              <Avatar className="h-12 w-12">
                                <AvatarFallback>
                                  {application.applicant?.firstName?.[0]}{application.applicant?.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                  {application.applicant?.firstName} {application.applicant?.lastName}
                                </h4>
                                <p className="text-gray-600 dark:text-gray-400">
                                  {application.applicant?.email}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-500">
                                  Applied {new Date(application.appliedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className={`px-3 py-1 rounded-full ${getStatusColor(application.status)}`}>
                                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                              </Badge>
                              <select
                                value={application.status}
                                onChange={(e) => updateApplicationStatusMutation.mutate({ 
                                  id: application.id, 
                                  status: e.target.value 
                                })}
                                className="text-sm border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-background"
                              >
                                <option value="applied">Applied</option>
                                <option value="viewed">Viewed</option>
                                <option value="shortlisted">Shortlisted</option>
                                <option value="interview">Interview</option>
                                <option value="hired">Hired</option>
                                <option value="rejected">Rejected</option>
                              </select>
                            </div>
                          </div>
                          
                          {application.coverLetter && (
                            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Cover Letter</h5>
                              <p className="text-gray-600 dark:text-gray-400 text-sm">
                                {application.coverLetter}
                              </p>
                            </div>
                          )}
                          
                          {application.resumeUrl && (
                            <div className="mt-4">
                              <Button variant="outline" size="sm">
                                <FileText className="mr-2 h-4 w-4" />
                                View Resume
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                        No applications yet
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Applications for this job will appear here
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Select a Job to View Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {jobs?.jobs?.map((job: Job) => (
                      <Card 
                        key={job.id} 
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedJobForApplications(job)}
                      >
                        <CardContent className="p-4">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                            {job.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {job.applicantCount || 0} applications
                          </p>
                          <Badge variant={job.isActive ? "default" : "secondary"} className="text-xs">
                            {job.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="companies" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>My Companies</CardTitle>
                <Button onClick={() => setShowCompanyForm(true)} className="btn-primary">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Company
                </Button>
              </CardHeader>
              <CardContent>
                {companiesLoading ? (
                  <div className="space-y-6">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                      </div>
                    ))}
                  </div>
                ) : companies?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {companies.map((company: Company) => (
                      <Card key={company.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <Building className="h-8 w-8 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {company.name}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-400">
                                {company.industry}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2 line-clamp-2">
                                {company.description}
                              </p>
                              <div className="flex items-center justify-between mt-4">
                                <Badge variant={company.isVerified ? "default" : "secondary"}>
                                  {company.isVerified ? "Verified" : "Pending"}
                                </Badge>
                                <Button variant="outline" size="sm">
                                  Edit
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      No companies yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Create a company profile to start posting jobs
                    </p>
                    <Button className="btn-primary" onClick={() => setShowCompanyForm(true)}>
                      Create Your First Company
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Job Form Modal */}
      <Dialog open={showJobForm} onOpenChange={setShowJobForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingJob ? 'Edit Job' : 'Post New Job'}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleJobSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  value={jobFormData.title}
                  onChange={(e) => setJobFormData({ ...jobFormData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="jobType">Job Type *</Label>
                <select
                  id="jobType"
                  value={jobFormData.jobType}
                  onChange={(e) => setJobFormData({ ...jobFormData, jobType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                  required
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="remote">Remote</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Job Description *</Label>
              <Textarea
                id="description"
                rows={6}
                value={jobFormData.description}
                onChange={(e) => setJobFormData({ ...jobFormData, description: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="salaryMin">Minimum Salary</Label>
                <Input
                  id="salaryMin"
                  type="number"
                  value={jobFormData.salaryMin || ''}
                  onChange={(e) => setJobFormData({ ...jobFormData, salaryMin: e.target.value ? parseInt(e.target.value) : undefined })}
                />
              </div>
              <div>
                <Label htmlFor="salaryMax">Maximum Salary</Label>
                <Input
                  id="salaryMax"
                  type="number"
                  value={jobFormData.salaryMax || ''}
                  onChange={(e) => setJobFormData({ ...jobFormData, salaryMax: e.target.value ? parseInt(e.target.value) : undefined })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={jobFormData.location}
                  onChange={(e) => setJobFormData({ ...jobFormData, location: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="experienceLevel">Experience Level *</Label>
                <select
                  id="experienceLevel"
                  value={jobFormData.experienceLevel}
                  onChange={(e) => setJobFormData({ ...jobFormData, experienceLevel: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                  required
                >
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="executive">Executive</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Input
                id="skills"
                value={jobFormData.skills?.join(', ') || ''}
                onChange={(e) => setJobFormData({ 
                  ...jobFormData, 
                  skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) 
                })}
                placeholder="e.g. JavaScript, React, Node.js"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => setShowJobForm(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="btn-primary"
                disabled={createJobMutation.isPending || updateJobMutation.isPending}
              >
                {createJobMutation.isPending || updateJobMutation.isPending ? 'Saving...' : (editingJob ? 'Update Job' : 'Post Job')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Company Form Modal */}
      <Dialog open={showCompanyForm} onOpenChange={setShowCompanyForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Company</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleCompanySubmit} className="space-y-6">
            <div>
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                value={companyFormData.name}
                onChange={(e) => setCompanyFormData({ ...companyFormData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="companyDescription">Description</Label>
              <Textarea
                id="companyDescription"
                rows={4}
                value={companyFormData.description}
                onChange={(e) => setCompanyFormData({ ...companyFormData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={companyFormData.industry}
                  onChange={(e) => setCompanyFormData({ ...companyFormData, industry: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="companyLocation">Location</Label>
                <Input
                  id="companyLocation"
                  value={companyFormData.location}
                  onChange={(e) => setCompanyFormData({ ...companyFormData, location: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={companyFormData.website}
                  onChange={(e) => setCompanyFormData({ ...companyFormData, website: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="size">Company Size</Label>
                <select
                  id="size"
                  value={companyFormData.size}
                  onChange={(e) => setCompanyFormData({ ...companyFormData, size: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                >
                  <option value="">Select Size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501-1000">501-1000 employees</option>
                  <option value="1000+">1000+ employees</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => setShowCompanyForm(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="btn-primary"
                disabled={createCompanyMutation.isPending}
              >
                {createCompanyMutation.isPending ? 'Creating...' : 'Create Company'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
