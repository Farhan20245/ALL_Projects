import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/Header";
import JobCard from "@/components/JobCard";
import ApplicationModal from "@/components/ApplicationModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Briefcase, 
  Heart, 
  FileText, 
  Settings, 
  MapPin, 
  Mail, 
  Phone,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";
import type { JobWithCompany, ApplicationWithJobAndCompany } from "@shared/schema";

export default function JobSeekerDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedJob, setSelectedJob] = useState<JobWithCompany | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
    skills: user?.skills?.join(', ') || '',
    experience: user?.experience || '',
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

  // Fetch user applications
  const { data: applications, isLoading: applicationsLoading } = useQuery({
    queryKey: ["/api/applications/my"],
    retry: false,
  });

  // Fetch bookmarked jobs
  const { data: bookmarks, isLoading: bookmarksLoading } = useQuery({
    queryKey: ["/api/bookmarks"],
    retry: false,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const updateData = {
        ...data,
        skills: data.skills ? data.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      };
      return await apiRequest('PATCH', '/api/auth/user', updateData);
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsEditing(false);
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
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleApply = (job: JobWithCompany) => {
    setSelectedJob(job);
    setShowApplicationModal(true);
  };

  const handleProfileSave = () => {
    updateProfileMutation.mutate(profileData);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied':
        return <Clock className="h-4 w-4" />;
      case 'viewed':
        return <CheckCircle className="h-4 w-4" />;
      case 'shortlisted':
        return <TrendingUp className="h-4 w-4" />;
      case 'interview':
        return <Calendar className="h-4 w-4" />;
      case 'hired':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied':
        return 'status-applied';
      case 'viewed':
        return 'status-viewed';
      case 'shortlisted':
        return 'status-shortlisted';
      case 'interview':
        return 'status-interview';
      case 'hired':
        return 'status-hired';
      case 'rejected':
        return 'status-rejected';
      default:
        return 'status-applied';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome back, {user?.firstName}! Manage your job search and applications.
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="bookmarks">Saved Jobs</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
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
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Applications</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {applications?.length || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Review</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {applications?.filter((app: ApplicationWithJobAndCompany) => 
                          ['viewed', 'shortlisted', 'interview'].includes(app.status)
                        ).length || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <Calendar className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Interviews</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {applications?.filter((app: ApplicationWithJobAndCompany) => 
                          app.status === 'interview'
                        ).length || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                      <Heart className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Saved Jobs</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {bookmarks?.length || 0}
                      </p>
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
                {applicationsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : applications?.length > 0 ? (
                  <div className="space-y-4">
                    {applications.slice(0, 5).map((application: ApplicationWithJobAndCompany) => (
                      <div key={application.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Briefcase className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                              {application.job.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {application.job.company?.name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className={`px-3 py-1 rounded-full text-sm ${getStatusColor(application.status)}`}>
                            <span className="flex items-center">
                              {getStatusIcon(application.status)}
                              <span className="ml-1">
                                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                              </span>
                            </span>
                          </Badge>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(application.appliedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No applications yet</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Start applying to jobs to see them here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Applications</CardTitle>
              </CardHeader>
              <CardContent>
                {applicationsLoading ? (
                  <div className="space-y-6">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                      </div>
                    ))}
                  </div>
                ) : applications?.length > 0 ? (
                  <div className="space-y-6">
                    {applications.map((application: ApplicationWithJobAndCompany) => (
                      <div key={application.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-start space-x-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <Briefcase className="h-8 w-8 text-white" />
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                {application.job.title}
                              </h3>
                              <p className="text-lg text-gray-700 dark:text-gray-300">
                                {application.job.company?.name}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-2">
                                <span className="flex items-center">
                                  <MapPin className="mr-1 h-4 w-4" />
                                  {application.job.location}
                                </span>
                                <span>Applied {new Date(application.appliedAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <Badge className={`px-3 py-1 rounded-full ${getStatusColor(application.status)}`}>
                            <span className="flex items-center">
                              {getStatusIcon(application.status)}
                              <span className="ml-1">
                                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                              </span>
                            </span>
                          </Badge>
                        </div>
                        
                        {application.coverLetter && (
                          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Cover Letter</h4>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                              {application.coverLetter}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      No applications yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Start applying to jobs to track your applications here
                    </p>
                    <Button className="btn-primary">
                      Browse Jobs
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookmarks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Saved Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                {bookmarksLoading ? (
                  <div className="space-y-6">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                      </div>
                    ))}
                  </div>
                ) : bookmarks?.length > 0 ? (
                  <div className="space-y-6">
                    {bookmarks.map((job: JobWithCompany) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        onApply={handleApply}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      No saved jobs yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Save jobs you're interested in to find them easily later
                    </p>
                    <Button className="btn-primary">
                      Browse Jobs
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Profile Information</CardTitle>
                <Button 
                  variant={isEditing ? "default" : "outline"}
                  onClick={() => isEditing ? handleProfileSave() : setIsEditing(true)}
                  disabled={updateProfileMutation.isPending}
                >
                  {isEditing ? (updateProfileMutation.isPending ? "Saving..." : "Save") : "Edit"}
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Header */}
                <div className="flex items-center space-x-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user?.profileImageUrl} />
                    <AvatarFallback className="text-lg">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {user?.firstName} {user?.lastName}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
                    <Badge variant="secondary" className="mt-2">Job Seeker</Badge>
                  </div>
                </div>

                {/* Profile Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profileData.location}
                      onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="experience">Experience Level</Label>
                    <select
                      id="experience"
                      value={profileData.experience}
                      onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                    >
                      <option value="">Select Experience</option>
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
                    value={profileData.skills}
                    onChange={(e) => setProfileData({ ...profileData, skills: e.target.value })}
                    disabled={!isEditing}
                    placeholder="e.g. JavaScript, React, Node.js"
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    rows={4}
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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
