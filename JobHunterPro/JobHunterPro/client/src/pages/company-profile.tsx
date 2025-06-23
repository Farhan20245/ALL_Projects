import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import JobCard from "@/components/JobCard";
import ApplicationModal from "@/components/ApplicationModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building, 
  MapPin, 
  Users, 
  Calendar, 
  ExternalLink, 
  ArrowLeft,
  Briefcase,
  Globe,
  Award,
  Heart,
  Coffee,
  Zap,
  Shield,
  Target
} from "lucide-react";
import { Link } from "wouter";
import type { JobWithCompany, CompanyWithJobs } from "@shared/schema";

export default function CompanyProfile() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedJob, setSelectedJob] = useState<JobWithCompany | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  // Fetch company details with jobs
  const { data: company, isLoading, error } = useQuery({
    queryKey: [`/api/companies/${id}`],
    retry: false,
    enabled: !!id,
  });

  const handleApply = (job: JobWithCompany) => {
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

    setSelectedJob(job);
    setShowApplicationModal(true);
  };

  const getBenefitIcon = (benefit: string) => {
    const lowerBenefit = benefit.toLowerCase();
    if (lowerBenefit.includes('health') || lowerBenefit.includes('medical')) return <Shield className="h-4 w-4" />;
    if (lowerBenefit.includes('remote') || lowerBenefit.includes('work from home')) return <Globe className="h-4 w-4" />;
    if (lowerBenefit.includes('coffee') || lowerBenefit.includes('snack')) return <Coffee className="h-4 w-4" />;
    if (lowerBenefit.includes('bonus') || lowerBenefit.includes('equity')) return <Target className="h-4 w-4" />;
    if (lowerBenefit.includes('training') || lowerBenefit.includes('development')) return <Zap className="h-4 w-4" />;
    return <Award className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-60 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Company Not Found
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                The company you're looking for doesn't exist or has been removed.
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

  const activeJobs = company.jobs?.filter(job => job.isActive) || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center text-primary hover:text-secondary mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Link>

        {/* Company Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex items-start space-x-6 flex-1">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Building className="h-12 w-12 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {company.name}
                    </h1>
                    {company.isVerified && (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                        <Award className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
                    {company.industry}
                  </p>
                  <div className="flex flex-wrap items-center gap-6 text-gray-600 dark:text-gray-400">
                    {company.location && (
                      <span className="flex items-center">
                        <MapPin className="mr-2 h-4 w-4" />
                        {company.location}
                      </span>
                    )}
                    {company.size && (
                      <span className="flex items-center">
                        <Users className="mr-2 h-4 w-4" />
                        {company.size} employees
                      </span>
                    )}
                    {company.foundedYear && (
                      <span className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        Founded {company.foundedYear}
                      </span>
                    )}
                    <span className="flex items-center">
                      <Briefcase className="mr-2 h-4 w-4" />
                      {activeJobs.length} open positions
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {company.website && (
                  <a 
                    href={company.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="w-full">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visit Website
                    </Button>
                  </a>
                )}
                <Button variant="outline" className="w-full">
                  <Heart className="h-4 w-4 mr-2" />
                  Follow Company
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="jobs">Jobs ({activeJobs.length})</TabsTrigger>
                <TabsTrigger value="culture">Culture</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* About Company */}
                <Card>
                  <CardHeader>
                    <CardTitle>About {company.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {company.description ? (
                      <div className="prose dark:prose-invert max-w-none">
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {company.description}
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 italic">
                        No company description available.
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Benefits */}
                {company.benefits && company.benefits.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Benefits & Perks</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {company.benefits.map((benefit, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                              {getBenefitIcon(benefit)}
                            </div>
                            <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Recent Jobs Preview */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Latest Job Openings</CardTitle>
                    {activeJobs.length > 3 && (
                      <Button variant="ghost" size="sm">
                        View All Jobs
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent>
                    {activeJobs.length > 0 ? (
                      <div className="space-y-4">
                        {activeJobs.slice(0, 3).map((job) => (
                          <div key={job.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 hover:text-primary cursor-pointer">
                                  {job.title}
                                </h4>
                                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  <span className="flex items-center">
                                    <MapPin className="mr-1 h-3 w-3" />
                                    {job.isRemote ? "Remote" : job.location}
                                  </span>
                                  <span className="flex items-center">
                                    <Users className="mr-1 h-3 w-3" />
                                    {job.applicantCount || 0} applicants
                                  </span>
                                </div>
                              </div>
                              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                                {job.jobType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </Badge>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">
                              {job.description}
                            </p>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500 dark:text-gray-500">
                                Posted {new Date(job.createdAt).toLocaleDateString()}
                              </span>
                              <Link href={`/jobs/${job.id}`}>
                                <Button variant="outline" size="sm">
                                  View Details
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">No active job openings at the moment.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="jobs" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>All Job Openings</CardTitle>
                    <p className="text-gray-600 dark:text-gray-400">
                      {activeJobs.length} open positions
                    </p>
                  </CardHeader>
                  <CardContent>
                    {activeJobs.length > 0 ? (
                      <div className="space-y-6">
                        {activeJobs.map((job) => (
                          <JobCard
                            key={job.id}
                            job={{
                              ...job,
                              company: company,
                              postedBy: null,
                            } as JobWithCompany}
                            onApply={handleApply}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                          No job openings
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          This company doesn't have any active job postings at the moment.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="culture" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Company Culture</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {company.culture ? (
                      <div className="prose dark:prose-invert max-w-none">
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {company.culture}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                          Culture information not available
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          This company hasn't shared their culture information yet.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Benefits in Culture Tab */}
                {company.benefits && company.benefits.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>What We Offer</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {company.benefits.map((benefit, index) => (
                          <div key={index} className="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                              {getBenefitIcon(benefit)}
                            </div>
                            <div>
                              <span className="font-medium text-gray-900 dark:text-gray-100">{benefit}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Company Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Company Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Industry</span>
                  <span className="font-medium">{company.industry || 'Not specified'}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Company Size</span>
                  <span className="font-medium">{company.size || 'Not specified'}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Location</span>
                  <span className="font-medium">{company.location || 'Not specified'}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Founded</span>
                  <span className="font-medium">{company.foundedYear || 'Not specified'}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Open Positions</span>
                  <span className="font-medium text-primary">{activeJobs.length}</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {company.website && (
                  <a 
                    href={company.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button variant="outline" className="w-full justify-start">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visit Website
                    </Button>
                  </a>
                )}
                <Button variant="outline" className="w-full justify-start">
                  <Heart className="h-4 w-4 mr-2" />
                  Follow Company
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  View Employees
                </Button>
              </CardContent>
            </Card>

            {/* Job Categories */}
            {activeJobs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Job Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Array.from(new Set(activeJobs.map(job => job.jobType))).map(type => {
                      const count = activeJobs.filter(job => job.jobType === type).length;
                      return (
                        <div key={type} className="flex justify-between items-center">
                          <span className="text-gray-700 dark:text-gray-300">
                            {type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Application Modal */}
      <ApplicationModal
        job={selectedJob}
        isOpen={showApplicationModal}
        onClose={() => {
          setShowApplicationModal(false);
          setSelectedJob(null);
        }}
      />
    </div>
  );
}
