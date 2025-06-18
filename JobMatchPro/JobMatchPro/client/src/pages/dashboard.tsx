import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import ResumeBuilder from '@/components/resume-builder';
import PortfolioManager from '@/components/portfolio-manager';
import { 
  Briefcase, 
  FileText, 
  Heart, 
  Calendar,
  TrendingUp,
  Award,
  Upload,
  PlusCircle,
  Clock,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';
import type { ApplicationWithJob, SavedJobWithDetails, PortfolioProject } from '@/types';

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: applications } = useQuery<ApplicationWithJob[]>({
    queryKey: ['/api/applications'],
    enabled: !!user,
  });

  const { data: savedJobs } = useQuery<SavedJobWithDetails[]>({
    queryKey: ['/api/saved-jobs'],
    enabled: !!user,
  });

  const { data: portfolios } = useQuery<PortfolioProject[]>({
    queryKey: ['/api/portfolios'],
    enabled: !!user,
  });

  const { data: resumes } = useQuery({
    queryKey: ['/api/resumes'],
    enabled: !!user,
  });

  const { data: recommendations } = useQuery({
    queryKey: ['/api/recommendations'],
    enabled: !!user,
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'viewed': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'shortlisted': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'interview': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'hired': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied': return <Clock className="h-3 w-3" />;
      case 'viewed': return <Eye className="h-3 w-3" />;
      case 'shortlisted': return <CheckCircle className="h-3 w-3" />;
      case 'interview': return <Calendar className="h-3 w-3" />;
      case 'rejected': return <XCircle className="h-3 w-3" />;
      case 'hired': return <Award className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const stats = {
    applications: applications?.length || 0,
    saved: savedJobs?.length || 0,
    interviews: applications?.filter(app => app.status === 'interview').length || 0,
    portfolios: portfolios?.length || 0,
  };

  return (
    <div className="min-h-screen bg-light-gray dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <Card className="mb-6">
              <CardContent className="p-6">
                {/* Profile Header */}
                <div className="text-center mb-6">
                  <Avatar className="w-24 h-24 mx-auto mb-4">
                    <AvatarImage src={user?.profilePicture} />
                    <AvatarFallback className="bg-linkedin-blue text-white text-lg">
                      {user?.fullName ? getInitials(user.fullName) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {user?.fullName || 'User'}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    Job Seeker
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {user?.location || 'Location not set'}
                  </p>
                </div>

                {/* Profile Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {stats.applications}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Applications</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {stats.interviews}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Interviews</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {stats.saved}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Saved Jobs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {stats.portfolios}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Projects</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button className="w-full bg-linkedin-blue hover:bg-linkedin-dark">
                    View Profile
                  </Button>
                  <Button variant="outline" className="w-full">
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => setActiveTab('resume')}
                >
                  <Upload className="h-4 w-4 mr-3 text-linkedin-blue" />
                  Upload Resume
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => setActiveTab('portfolio')}
                >
                  <PlusCircle className="h-4 w-4 mr-3 text-green-500" />
                  Add Project
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Award className="h-4 w-4 mr-3 text-yellow-500" />
                  Take Skill Test
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-3 text-purple-500" />
                  View Analytics
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="applications">Applications</TabsTrigger>
                <TabsTrigger value="saved">Saved Jobs</TabsTrigger>
                <TabsTrigger value="resume">Resume</TabsTrigger>
                <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            Total Applications
                          </p>
                          <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            {stats.applications}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                          <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            Saved Jobs
                          </p>
                          <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            {stats.saved}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                          <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            Interviews
                          </p>
                          <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            {stats.interviews}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            Portfolio Projects
                          </p>
                          <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            {stats.portfolios}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                          <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Applications */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Applications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {applications && applications.length > 0 ? (
                      <div className="space-y-4">
                        {applications.slice(0, 5).map((application) => (
                          <div key={application.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-linkedin-blue rounded-lg flex items-center justify-center">
                                <Briefcase className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {application.job?.title}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  {application.job?.company?.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Applied {new Date(application.appliedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <Badge className={`${getStatusColor(application.status)} flex items-center gap-1`}>
                              {getStatusIcon(application.status)}
                              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No applications yet</p>
                        <Button className="mt-4" onClick={() => window.location.href = '/jobs'}>
                          Browse Jobs
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Job Recommendations */}
                {recommendations && recommendations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Recommended Jobs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recommendations.slice(0, 4).map((job: any) => (
                          <div key={job.id} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:shadow-md transition-shadow">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                              {job.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                              {job.company?.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {job.location}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Applications Tab */}
              <TabsContent value="applications">
                <Card>
                  <CardHeader>
                    <CardTitle>My Applications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {applications && applications.length > 0 ? (
                      <div className="space-y-4">
                        {applications.map((application) => (
                          <div key={application.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-linkedin-blue rounded-lg flex items-center justify-center">
                                <Briefcase className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {application.job?.title}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  {application.job?.company?.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Applied on {new Date(application.appliedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <Badge className={`${getStatusColor(application.status)} flex items-center gap-1`}>
                                {getStatusIcon(application.status)}
                                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                              </Badge>
                              <Button variant="ghost" size="sm">
                                View Details
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          No applications yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Start applying to jobs that match your skills and interests.
                        </p>
                        <Button onClick={() => window.location.href = '/jobs'}>
                          Browse Jobs
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Saved Jobs Tab */}
              <TabsContent value="saved">
                <Card>
                  <CardHeader>
                    <CardTitle>Saved Jobs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {savedJobs && savedJobs.length > 0 ? (
                      <div className="space-y-4">
                        {savedJobs.map((savedJob) => (
                          <div key={savedJob.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-linkedin-blue rounded-lg flex items-center justify-center">
                                <Briefcase className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {savedJob.job.title}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  {savedJob.job.company?.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Saved on {new Date(savedJob.savedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button size="sm" className="bg-linkedin-blue hover:bg-linkedin-dark">
                                Apply Now
                              </Button>
                              <Button variant="ghost" size="sm">
                                Remove
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          No saved jobs
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Save jobs you're interested in to apply later.
                        </p>
                        <Button onClick={() => window.location.href = '/jobs'}>
                          Browse Jobs
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Resume Tab */}
              <TabsContent value="resume">
                <ResumeBuilder />
              </TabsContent>

              {/* Portfolio Tab */}
              <TabsContent value="portfolio">
                <PortfolioManager />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
