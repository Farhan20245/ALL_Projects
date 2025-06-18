export interface JobSearchFilters {
  search?: string;
  location?: string;
  category?: string;
  experienceLevel?: string;
  jobType?: string;
  salaryMin?: number;
  salaryMax?: number;
  page?: number;
  limit?: number;
}

export interface JobWithCompany {
  id: number;
  title: string;
  description: string;
  requirements?: string;
  benefits?: string;
  location: string;
  jobType: string;
  experienceLevel?: string;
  salaryMin?: string;
  salaryMax?: string;
  currency?: string;
  skills?: string[];
  category?: string;
  isActive: boolean;
  isApproved: boolean;
  expiryDate?: string;
  applicationDeadline?: string;
  createdAt: string;
  company?: {
    id: number;
    name: string;
    logo?: string;
    industry?: string;
    location?: string;
  };
  employer?: {
    id: number;
    fullName: string;
  };
  _count?: {
    applications: number;
  };
}

export interface ApplicationWithJob {
  id: number;
  jobId: number;
  applicantId: number;
  resumeUrl?: string;
  coverLetter?: string;
  status: string;
  appliedAt: string;
  updatedAt: string;
  job?: JobWithCompany;
}

export interface PortfolioProject {
  id: number;
  userId: number;
  title: string;
  description?: string;
  imageUrl?: string;
  projectUrl?: string;
  githubUrl?: string;
  technologies?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ResumeData {
  personalInfo?: {
    fullName?: string;
    email?: string;
    phone?: string;
    location?: string;
    summary?: string;
  };
  experience?: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  skills?: string[];
  certifications?: Array<{
    name: string;
    issuer: string;
    year: string;
  }>;
}

export interface SavedJobWithDetails {
  id: number;
  userId: number;
  jobId: number;
  savedAt: string;
  job: JobWithCompany;
}

export interface AdminStats {
  totalUsers: number;
  activeJobs: number;
  totalApplications: number;
  pendingJobApprovals: number;
  totalCompanies: number;
  applicationsToday: number;
  revenue: number;
}

export interface PendingJob extends JobWithCompany {
  employer: {
    id: number;
    fullName: string;
    email: string;
  };
}
