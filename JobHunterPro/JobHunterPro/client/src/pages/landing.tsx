import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import JobCard from "@/components/JobCard";
import JobFilters from "@/components/JobFilters";
import ApplicationModal from "@/components/ApplicationModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ArrowRight, CheckCircle, Users, Building, Briefcase } from "lucide-react";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { JobWithCompany, Company } from "@shared/schema";
import type { SearchFilters } from "@/types";

export default function Landing() {
  const [searchFilters, setSearchFilters] = useState<Partial<SearchFilters>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobWithCompany | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ['/api/jobs', { ...searchFilters, page: currentPage }],
  });

  const { data: companies, isLoading: companiesLoading } = useQuery({
    queryKey: ['/api/companies'],
  });

  const handleSearch = (filters: Partial<SearchFilters>) => {
    setSearchFilters(filters);
    setCurrentPage(1);
  };

  const handleApply = (job: JobWithCompany) => {
    setSelectedJob(job);
    setShowApplicationModal(true);
  };

  const demoLoginMutation = useMutation({
    mutationFn: async (role: string) => {
      const response = await fetch('/api/auth/demo-login', {
        method: 'POST',
        body: JSON.stringify({ role }),
        headers: { 'Content-Type': 'application/json' }
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      window.location.reload(); // Refresh to show authenticated state
    }
  });

  const totalPages = jobsData?.total ? Math.ceil(jobsData.total / 20) : 1;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="gradient-primary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Find Your Dream Job</h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              Connect with top employers and advance your career
            </p>
            
            {/* Demo Login Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <p className="w-full text-blue-100 mb-4">Try the demo as:</p>
              <Button 
                onClick={() => demoLoginMutation.mutate('jobseeker')}
                disabled={demoLoginMutation.isPending}
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                Job Seeker
              </Button>
              <Button 
                onClick={() => demoLoginMutation.mutate('employer')}
                disabled={demoLoginMutation.isPending}
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                Employer
              </Button>
              <Button 
                onClick={() => demoLoginMutation.mutate('admin')}
                disabled={demoLoginMutation.isPending}
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                Admin
              </Button>
            </div>
          </div>
          
          <SearchBar
            onSearch={handleSearch}
            onToggleFilters={() => setShowFilters(!showFilters)}
            initialFilters={searchFilters}
          />
        </div>
      </section>

      {/* Job Listings */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            {showFilters && (
              <div className="lg:w-1/4">
                <JobFilters
                  onFiltersChange={handleSearch}
                  initialFilters={searchFilters}
                />
              </div>
            )}

            {/* Job Results */}
            <div className={showFilters ? "lg:w-3/4" : "w-full"}>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {searchFilters.search ? `Search Results for "${searchFilters.search}"` : 'Featured Jobs'}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Showing {jobsData?.jobs?.length || 0} of {jobsData?.total || 0} jobs
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</label>
                  <select 
                    className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                    value={searchFilters.sortBy || 'latest'}
                    onChange={(e) => handleSearch({ ...searchFilters, sortBy: e.target.value })}
                  >
                    <option value="latest">Most Recent</option>
                    <option value="salary-high">Salary: High to Low</option>
                    <option value="salary-low">Salary: Low to High</option>
                    <option value="relevance">Relevance</option>
                  </select>
                </div>
              </div>

              {jobsLoading ? (
                <div className="space-y-6">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-card rounded-lg p-6 animate-pulse">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="space-y-6">
                    {jobsData?.jobs?.map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        onApply={handleApply}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-12">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious 
                              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                          
                          {[...Array(Math.min(5, totalPages))].map((_, i) => {
                            const page = i + 1;
                            return (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  onClick={() => setCurrentPage(page)}
                                  isActive={currentPage === page}
                                  className="cursor-pointer"
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          })}
                          
                          <PaginationItem>
                            <PaginationNext 
                              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Company Showcase */}
      <section className="py-16 bg-white dark:bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Top Companies Hiring Now
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Join industry leaders and innovative startups
            </p>
          </div>
          
          {companiesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {companies?.slice(0, 6).map((company: Company) => (
                <Card key={company.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-4">
                        <Building className="text-white h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {company.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {company.industry}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm line-clamp-2">
                      {company.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-primary font-medium">
                        View openings
                      </span>
                      <Link href={`/companies/${company.id}`}>
                        <Button variant="ghost" size="sm" className="text-primary hover:text-secondary">
                          View Company <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50 dark:bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Powerful Dashboard Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Everything you need to manage your career or hiring process
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Job Seeker Features */}
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mr-4">
                    <Users className="text-primary h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">For Job Seekers</h3>
                    <p className="text-gray-600 dark:text-gray-400">Find your dream job faster</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      title: "Smart Job Matching",
                      description: "AI-powered recommendations based on your skills and preferences"
                    },
                    {
                      title: "Application Tracking",
                      description: "Monitor your application status in real-time"
                    },
                    {
                      title: "Resume Builder",
                      description: "Create professional resumes with AI-powered feedback"
                    },
                    {
                      title: "Salary Insights",
                      description: "View transparent salary ranges for all positions"
                    }
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="text-green-500 h-5 w-5 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">{feature.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Employer Features */}
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center mr-4">
                    <Building className="text-green-600 h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">For Employers</h3>
                    <p className="text-gray-600 dark:text-gray-400">Hire the best talent efficiently</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      title: "Candidate Management",
                      description: "Advanced filtering and screening tools"
                    },
                    {
                      title: "Interview Scheduling",
                      description: "Integrated calendar with automated reminders"
                    },
                    {
                      title: "Analytics Dashboard",
                      description: "Track hiring metrics and optimize your process"
                    },
                    {
                      title: "Company Branding",
                      description: "Showcase your culture and attract top talent"
                    }
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="text-green-500 h-5 w-5 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">{feature.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button 
              size="lg" 
              className="btn-primary"
              onClick={() => window.location.href = '/api/login'}
            >
              Get Started Today
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <Briefcase className="text-accent text-2xl mr-2" />
                <span className="text-2xl font-bold">JobHub</span>
              </div>
              <p className="text-blue-100 mb-4 max-w-md">
                Connecting talented professionals with innovative companies. Find your next opportunity or hire exceptional talent with our comprehensive job portal.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">For Job Seekers</h3>
              <ul className="space-y-2 text-blue-100">
                <li><Link href="/" className="hover:text-white transition-colors">Browse Jobs</Link></li>
                <li><Link href="/career-advice" className="hover:text-white transition-colors">Career Advice</Link></li>
                <li><Link href="/resume-builder" className="hover:text-white transition-colors">Resume Builder</Link></li>
                <li><Link href="/salary-guide" className="hover:text-white transition-colors">Salary Guide</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">For Employers</h3>
              <ul className="space-y-2 text-blue-100">
                <li><Link href="/post-job" className="hover:text-white transition-colors">Post a Job</Link></li>
                <li><Link href="/search-resumes" className="hover:text-white transition-colors">Search Resumes</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing Plans</Link></li>
                <li><Link href="/hiring-solutions" className="hover:text-white transition-colors">Hiring Solutions</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-blue-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-blue-100 text-sm">
              © 2024 JobHub. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-blue-100 hover:text-white text-sm transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-blue-100 hover:text-white text-sm transition-colors">Terms of Service</Link>
              <Link href="/contact" className="text-blue-100 hover:text-white text-sm transition-colors">Contact Us</Link>
            </div>
          </div>
        </div>
      </footer>

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
