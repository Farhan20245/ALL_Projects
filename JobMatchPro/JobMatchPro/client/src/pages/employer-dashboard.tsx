import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { 
  Plus, 
  Briefcase, 
  Users, 
  Eye,
  Calendar,
  TrendingUp,
  Building,
  Settings,
  Search,
  MapPin,
  Clock
} from 'lucide-react';
import type { JobWithCompany } from '@/types';

export default function EmployerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: myJobs } = useQuery<JobWithCompany[]>({
    queryKey: ['/api/jobs', { employerId: user?.id }],
    enabled: !!user && user.role === 'employer',
  });

  const { data: applications } = useQuery({
    queryKey: ['/api/applications/employer'],
    enabled: !!user && user.role === 'employer',
  });

  if (user?.role !== 'employer') {
    return (
      <div className="min-h-screen bg-light-gray dark:bg-gray-800 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600 dark:text-gray-400">
              You need to be an employer to access this dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = {
    totalJobs: myJobs?.length || 0,
    activeJobs: myJobs?.filter(job => job.isActive && job.isApproved).length || 0,
    pendingJobs: myJobs?.filter(job => !job.isApproved).length || 0,
    totalApplications: applications?.length || 0,
  };

  const getStatusColor = (job: JobWithCompany) => {
    if (!job.isActive) return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    if (!job.isApproved) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  };

  const getStatusText = (job: JobWithCompany) => {
    if (!job.isActive) return 'Inactive';
    if (!job.isApproved) return 'Pending Approval';
    return 'Active';
  };

  const timeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  };

  return (
    <div className="min-h-screen bg-light-gray dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Employer Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage your job postings and applications
            </p>
          </div>
          <Link href="/post-job">
            <Button className="bg-linkedin-blue hover:bg-linkedin-dark">
              <Plus className="h-4 w-4 mr-2" />
              Post New Job
            </Button>
          </Link>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="jobs">My Jobs</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="company">Company Profile</TabsTrigger>
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
                        Total Jobs
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {stats.totalJobs}
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
                        Active Jobs
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {stats.activeJobs}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Pending Approval
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {stats.pendingJobs}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                      <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Total Applications
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {stats.totalApplications}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
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
                {myJobs && myJobs.length > 0 ? (
                  <div className="space-y-4">
                    {myJobs.slice(0, 5).map((job) => (
                      <div key={job.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-linkedin-blue rounded-lg flex items-center justify-center">
                            <Briefcase className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {job.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {job.location}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Posted {timeAgo(job.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge className={getStatusColor(job)}>
                            {getStatusText(job)}
                          </Badge>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {job._count?.applications || 0} applications
                          </span>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No jobs posted yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Start by posting your first job to attract candidates.
                    </p>
                    <Link href="/post-job">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Post Your First Job
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>My Job Postings</CardTitle>
                  <Link href="/post-job">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Post New Job
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {myJobs && myJobs.length > 0 ? (
                  <div className="space-y-6">
                    {myJobs.map((job) => (
                      <Card key={job.id} className="border border-gray-200 dark:border-gray-600">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-linkedin-blue rounded-lg flex items-center justify-center">
                                <Briefcase className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {job.title}
                                </h3>
                                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                                  <span className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    {job.location}
                                  </span>
                                  <span className="flex items-center">
                                    <Clock className="h-4 w-4 mr-1" />
                                    {job.jobType.replace('_', ' ')}
                                  </span>
                                  <span>{timeAgo(job.createdAt)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className={getStatusColor(job)}>
                                {getStatusText(job)}
                              </Badge>
                              <Button variant="ghost" size="sm">
                                <Settings className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                            {job.description}
                          </p>

                          {job.skills && job.skills.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {job.skills.slice(0, 5).map((skill, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {job.skills.length > 5 && (
                                <Badge variant="outline" className="text-xs">
                                  +{job.skills.length - 5} more
                                </Badge>
                              )}
                            </div>
                          )}

                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                              <span className="flex items-center">
                                <Users className="h-4 w-4 mr-1" />
                                {job._count?.applications || 0} applications
                              </span>
                              <span className="flex items-center">
                                <Eye className="h-4 w-4 mr-1" />
                                View details
                              </span>
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                              <Button variant="outline" size="sm">
                                View Applications
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No jobs posted
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      You haven't posted any jobs yet. Create your first job posting to start attracting candidates.
                    </p>
                    <Link href="/post-job">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Post Your First Job
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>Job Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Application Management
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Application management features will be implemented here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Company Profile Tab */}
          <TabsContent value="company">
            <Card>
              <CardHeader>
                <CardTitle>Company Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Company Profile Management
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Company profile management features will be implemented here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
