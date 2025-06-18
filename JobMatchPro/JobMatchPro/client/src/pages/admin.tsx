import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Activity,
  Calendar,
  Building
} from 'lucide-react';
import type { AdminStats, PendingJob } from '@/types';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: stats } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
    enabled: user?.role === 'admin',
  });

  const { data: pendingJobs } = useQuery<PendingJob[]>({
    queryKey: ['/api/admin/pending-jobs'],
    enabled: user?.role === 'admin',
  });

  const approveJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      const response = await apiRequest('PUT', `/api/admin/jobs/${jobId}/approve`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Job approved",
        description: "The job has been approved and is now live",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pending-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve job",
        variant: "destructive",
      });
    },
  });

  const rejectJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      const response = await apiRequest('PUT', `/api/admin/jobs/${jobId}/reject`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Job rejected",
        description: "The job has been rejected",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pending-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject job",
        variant: "destructive",
      });
    },
  });

  const handleApproveJob = (jobId: number) => {
    approveJobMutation.mutate(jobId);
  };

  const handleRejectJob = (jobId: number) => {
    rejectJobMutation.mutate(jobId);
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-light-gray dark:bg-gray-800 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600 dark:text-gray-400">
              You don't have permission to access the admin dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-gray dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage users, jobs, and platform analytics
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="pending-jobs">
              Pending Jobs 
              {pendingJobs && pendingJobs.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingJobs.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Total Users
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {stats?.totalUsers?.toLocaleString() || '0'}
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        <TrendingUp className="inline h-3 w-3 mr-1" />
                        12% from last month
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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
                        {stats?.activeJobs?.toLocaleString() || '0'}
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        <TrendingUp className="inline h-3 w-3 mr-1" />
                        8% from last month
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <Briefcase className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Applications Today
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {stats?.applicationsToday?.toLocaleString() || '0'}
                      </p>
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">
                        <Activity className="inline h-3 w-3 mr-1" />
                        2% from yesterday
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Monthly Revenue
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        ৳{stats?.revenue?.toLocaleString() || '0'}
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        <TrendingUp className="inline h-3 w-3 mr-1" />
                        18% from last month
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('pending-jobs')}
                  >
                    <Clock className="h-4 w-4 mr-3" />
                    Review Pending Jobs ({stats?.pendingJobApprovals || 0})
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-3" />
                    Manage Users
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Building className="h-4 w-4 mr-3" />
                    Verify Companies
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="h-4 w-4 mr-3" />
                    View Reports
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-white">
                          New user registered: <span className="font-medium">Ahmed Rahman</span>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">2 minutes ago</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <Briefcase className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-white">
                          New job posted: <span className="font-medium">Frontend Developer</span>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">5 minutes ago</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-white">
                          Job application submitted for: <span className="font-medium">Data Scientist</span>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">8 minutes ago</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                        <Building className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-white">
                          Company verified: <span className="font-medium">TechCorp Ltd</span>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">15 minutes ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Pending Jobs Tab */}
          <TabsContent value="pending-jobs">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Pending Job Approvals</CardTitle>
                  <Badge variant="secondary">
                    {pendingJobs?.length || 0} Pending
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {pendingJobs && pendingJobs.length > 0 ? (
                  <div className="space-y-4">
                    {pendingJobs.map((job) => (
                      <div key={job.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="w-12 h-12 bg-linkedin-blue rounded-lg flex items-center justify-center">
                            <Briefcase className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {job.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {job.company?.name || 'Unknown Company'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Posted by {job.employer.fullName} • {job.location}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              {job.category && (
                                <Badge variant="outline" className="text-xs">
                                  {job.category}
                                </Badge>
                              )}
                              {job.jobType && (
                                <Badge variant="outline" className="text-xs">
                                  {job.jobType.replace('_', ' ')}
                                </Badge>
                              )}
                              {job.experienceLevel && (
                                <Badge variant="outline" className="text-xs">
                                  {job.experienceLevel} level
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleApproveJob(job.id)}
                            disabled={approveJobMutation.isPending}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectJob(job.id)}
                            disabled={rejectJobMutation.isPending}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      All caught up!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      No pending job approvals at the moment.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    User Management
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    User management features will be implemented here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Platform Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Analytics Dashboard
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Detailed analytics and reporting features will be implemented here.
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
