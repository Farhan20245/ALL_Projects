import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import JobCard from '@/components/job-card';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Search, TrendingUp, Users, Building, MapPin, Clock, DollarSign, Briefcase } from 'lucide-react';
import type { JobWithCompany } from '@/types';

export default function Home() {
  const [heroSearch, setHeroSearch] = useState({
    title: '',
    location: '',
    experience: '',
  });

  const { data: jobsResponse, isLoading } = useQuery<{jobs: JobWithCompany[], total: number}>({
    queryKey: ['/api/jobs', { limit: 6, isApproved: true }],
  });

  const featuredJobs = jobsResponse?.jobs || [];

  const { data: stats } = useQuery<{
    activeJobs: number;
    totalCompanies: number;
    totalUsers: number;
    totalApplications: number;
    pendingJobApprovals: number;
    applicationsToday: number;
    revenue: number;
  }>({
    queryKey: ['/api/admin/stats'],
    retry: false,
  });

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const searchParams = new URLSearchParams();
    if (heroSearch.title) searchParams.set('search', heroSearch.title);
    if (heroSearch.location) searchParams.set('location', heroSearch.location);
    if (heroSearch.experience) searchParams.set('experienceLevel', heroSearch.experience);
    
    window.location.href = `/jobs?${searchParams.toString()}`;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-6">
              Find Your Dream Career
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Connect with top employers, showcase your skills, and take the next step in your professional journey
            </p>
            
            {/* Hero Search */}
            <Card className="max-w-4xl mx-auto mb-8">
              <CardContent className="p-6">
                <form onSubmit={handleHeroSearch}>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Job Title
                      </label>
                      <Input
                        type="text"
                        placeholder="e.g. Software Engineer"
                        value={heroSearch.title}
                        onChange={(e) => setHeroSearch(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <Input
                        type="text"
                        placeholder="e.g. Dhaka, Bangladesh"
                        value={heroSearch.location}
                        onChange={(e) => setHeroSearch(prev => ({ ...prev, location: e.target.value }))}
                      />
                    </div>
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Experience
                      </label>
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-linkedin-blue focus:border-transparent"
                        value={heroSearch.experience}
                        onChange={(e) => setHeroSearch(prev => ({ ...prev, experience: e.target.value }))}
                      >
                        <option value="">Any Experience</option>
                        <option value="entry">0-1 years</option>
                        <option value="mid">2-5 years</option>
                        <option value="senior">5+ years</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        <Search className="h-4 w-4 mr-2" />
                        Search Jobs
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">
                  {stats ? stats.activeJobs?.toLocaleString() : '15,000+'}
                </div>
                <div className="text-blue-100">Active Jobs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">
                  {stats ? stats.totalCompanies?.toLocaleString() : '2,500+'}
                </div>
                <div className="text-blue-100">Companies</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">
                  {stats ? stats.totalUsers?.toLocaleString() : '50,000+'}
                </div>
                <div className="text-blue-100">Professionals</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-16 bg-light-gray dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Featured Jobs
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Discover opportunities from top companies
              </p>
            </div>
            <Link href="/jobs">
              <Button variant="outline">
                View All Jobs
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredJobs?.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}

          {(!featuredJobs || featuredJobs.length === 0) && !isLoading && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No featured jobs available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose JobPortal?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              We provide the tools and opportunities you need to advance your career
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Career Growth</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Access opportunities that match your skills and career aspirations
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Top Companies</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Connect with leading employers and startups across Bangladesh
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Building className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Easy Application</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Apply to jobs with one click using your professional profile
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Briefcase className="text-white h-6 w-6" />
                </div>
                <div className="text-2xl font-bold">JobPortal</div>
              </div>
              <p className="text-gray-300 mb-6 max-w-md">
                Connecting talented professionals with amazing opportunities. Build your career with Bangladesh's leading job portal platform.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">For Job Seekers</h3>
              <ul className="space-y-2">
                <li><Link href="/jobs" className="text-gray-300 hover:text-white transition-colors">Browse Jobs</Link></li>
                <li><Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">Resume Builder</Link></li>
                <li><Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">Career Advice</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">For Employers</h3>
              <ul className="space-y-2">
                <li><Link href="/post-job" className="text-gray-300 hover:text-white transition-colors">Post Jobs</Link></li>
                <li><Link href="/employer" className="text-gray-300 hover:text-white transition-colors">Find Candidates</Link></li>
                <li><Link href="/employer" className="text-gray-300 hover:text-white transition-colors">Employer Tools</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm">
              © 2024 JobPortal. All rights reserved.
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-gray-400 text-sm">Available in:</span>
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                English
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                বাংলা
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
