export interface SearchFilters {
  search: string;
  location: string;
  jobType: string;
  experienceLevel: string;
  salaryMin: number | null;
  salaryMax: number | null;
  sortBy: string;
}

export interface JobSearchParams extends Partial<SearchFilters> {
  page?: number;
  limit?: number;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export type UserRole = 'jobseeker' | 'employer' | 'admin';

export interface ApplicationFormData {
  jobId: number;
  resumeUrl?: string;
  coverLetter?: string;
}

export interface CompanyFormData {
  name: string;
  description?: string;
  industry?: string;
  website?: string;
  location?: string;
  size?: string;
  foundedYear?: number;
  culture?: string;
  benefits?: string[];
}

export interface JobFormData {
  title: string;
  description: string;
  requirements?: string[];
  responsibilities?: string[];
  skills?: string[];
  salaryMin?: number;
  salaryMax?: number;
  salaryType?: 'yearly' | 'monthly' | 'hourly';
  jobType: 'full-time' | 'part-time' | 'contract' | 'remote' | 'internship';
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
  location?: string;
  isRemote?: boolean;
  companyId?: number;
  deadline?: Date;
  isAnonymous?: boolean;
}
