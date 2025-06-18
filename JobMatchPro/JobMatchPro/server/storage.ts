import { 
  users, 
  companies, 
  jobs, 
  applications, 
  resumes, 
  portfolios, 
  savedJobs,
  interviews,
  skillTests,
  type User, 
  type InsertUser,
  type Company,
  type InsertCompany,
  type Job,
  type InsertJob,
  type Application,
  type InsertApplication,
  type Resume,
  type InsertResume,
  type Portfolio,
  type InsertPortfolio,
  type SavedJob,
  type InsertSavedJob,
  type Interview,
  type InsertInterview,
  type SkillTest,
  type InsertSkillTest
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, like, desc, count, sql } from "drizzle-orm";
import type { JobSearchFilters } from "../client/src/types";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;

  // Company methods
  createCompany(company: InsertCompany): Promise<Company>;
  getCompany(id: number): Promise<Company | undefined>;
  getCompanies(): Promise<Company[]>;
  updateCompany(id: number, updates: Partial<InsertCompany>): Promise<Company>;

  // Job methods
  createJob(job: InsertJob): Promise<Job>;
  getJob(id: number): Promise<Job | undefined>;
  getJobWithDetails(id: number): Promise<any>;
  getJobs(filters: JobSearchFilters): Promise<{ jobs: any[]; total: number }>;
  updateJob(id: number, updates: Partial<InsertJob>): Promise<Job>;
  deleteJob(id: number): Promise<void>;
  getPendingJobs(): Promise<any[]>;
  getJobRecommendations(userId: number): Promise<any[]>;

  // Application methods
  createApplication(application: InsertApplication): Promise<Application>;
  getApplication(id: number): Promise<Application | undefined>;
  getApplicationWithJob(id: number): Promise<any>;
  getApplicationByJobAndUser(jobId: number, userId: number): Promise<Application | undefined>;
  getApplicationsByUser(userId: number): Promise<any[]>;
  getApplicationsByJob(jobId: number): Promise<any[]>;
  updateApplicationStatus(id: number, status: string): Promise<Application>;

  // Resume methods
  createResume(resume: InsertResume): Promise<Resume>;
  getResume(id: number): Promise<Resume | undefined>;
  getResumesByUser(userId: number): Promise<Resume[]>;
  updateResume(id: number, updates: Partial<InsertResume>): Promise<Resume>;
  deleteResume(id: number): Promise<void>;

  // Portfolio methods
  createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio>;
  getPortfolio(id: number): Promise<Portfolio | undefined>;
  getPortfoliosByUser(userId: number): Promise<Portfolio[]>;
  updatePortfolio(id: number, updates: Partial<InsertPortfolio>): Promise<Portfolio>;
  deletePortfolio(id: number): Promise<void>;

  // Saved jobs methods
  createSavedJob(savedJob: InsertSavedJob): Promise<SavedJob>;
  getSavedJob(id: number): Promise<SavedJob | undefined>;
  getSavedJobByUserAndJob(userId: number, jobId: number): Promise<SavedJob | undefined>;
  getSavedJobsByUser(userId: number): Promise<any[]>;
  deleteSavedJob(userId: number, jobId: number): Promise<void>;

  // Admin methods
  getAdminStats(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Company methods
  async createCompany(company: InsertCompany): Promise<Company> {
    const [newCompany] = await db
      .insert(companies)
      .values({
        ...company,
        createdAt: new Date(),
      })
      .returning();
    return newCompany;
  }

  async getCompany(id: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company || undefined;
  }

  async getCompanies(): Promise<Company[]> {
    return await db.select().from(companies);
  }

  async updateCompany(id: number, updates: Partial<InsertCompany>): Promise<Company> {
    const [company] = await db
      .update(companies)
      .set(updates)
      .where(eq(companies.id, id))
      .returning();
    return company;
  }

  // Job methods
  async createJob(job: InsertJob): Promise<Job> {
    const [newJob] = await db
      .insert(jobs)
      .values({
        ...job,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return newJob;
  }

  async getJob(id: number): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job || undefined;
  }

  async getJobWithDetails(id: number): Promise<any> {
    const result = await db
      .select({
        job: jobs,
        company: companies,
        employer: {
          id: users.id,
          fullName: users.fullName,
          email: users.email,
        },
      })
      .from(jobs)
      .leftJoin(companies, eq(jobs.companyId, companies.id))
      .leftJoin(users, eq(jobs.employerId, users.id))
      .where(eq(jobs.id, id));

    if (result.length === 0) return undefined;

    const { job, company, employer } = result[0];
    return {
      ...job,
      company,
      employer,
    };
  }

  async getJobs(filters: JobSearchFilters): Promise<{ jobs: any[]; total: number }> {
    const { 
      search, 
      location, 
      category, 
      experienceLevel, 
      jobType, 
      salaryMin, 
      salaryMax,
      page = 1, 
      limit = 10 
    } = filters;

    let query = db
      .select({
        job: jobs,
        company: {
          id: companies.id,
          name: companies.name,
          logo: companies.logo,
          industry: companies.industry,
          location: companies.location,
        },
        employer: {
          id: users.id,
          fullName: users.fullName,
        },
        applicationCount: count(applications.id),
      })
      .from(jobs)
      .leftJoin(companies, eq(jobs.companyId, companies.id))
      .leftJoin(users, eq(jobs.employerId, users.id))
      .leftJoin(applications, eq(applications.jobId, jobs.id))
      .where(and(
        eq(jobs.isActive, true),
        eq(jobs.isApproved, true)
      ))
      .groupBy(jobs.id, companies.id, users.id);

    const conditions = [
      eq(jobs.isActive, true),
      eq(jobs.isApproved, true)
    ];

    if (search) {
      conditions.push(
        or(
          like(jobs.title, `%${search}%`),
          like(jobs.description, `%${search}%`),
          like(companies.name, `%${search}%`)
        )!
      );
    }

    if (location) {
      conditions.push(like(jobs.location, `%${location}%`));
    }

    if (category) {
      conditions.push(eq(jobs.category, category));
    }

    if (experienceLevel) {
      conditions.push(eq(jobs.experienceLevel, experienceLevel));
    }

    if (jobType) {
      conditions.push(eq(jobs.jobType, jobType));
    }

    if (salaryMin) {
      conditions.push(sql`CAST(${jobs.salaryMin} AS INTEGER) >= ${salaryMin}`);
    }

    if (salaryMax) {
      conditions.push(sql`CAST(${jobs.salaryMax} AS INTEGER) <= ${salaryMax}`);
    }

    const whereCondition = and(...conditions);

    const jobsResult = await db
      .select({
        job: jobs,
        company: {
          id: companies.id,
          name: companies.name,
          logo: companies.logo,
          industry: companies.industry,
          location: companies.location,
        },
        employer: {
          id: users.id,
          fullName: users.fullName,
        },
      })
      .from(jobs)
      .leftJoin(companies, eq(jobs.companyId, companies.id))
      .leftJoin(users, eq(jobs.employerId, users.id))
      .where(whereCondition)
      .orderBy(desc(jobs.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    const totalResult = await db
      .select({ count: count() })
      .from(jobs)
      .leftJoin(companies, eq(jobs.companyId, companies.id))
      .where(whereCondition);

    const total = totalResult[0]?.count || 0;

    const formattedJobs = jobsResult.map(({ job, company, employer }) => ({
      ...job,
      company,
      employer,
    }));

    return { jobs: formattedJobs, total };
  }

  async updateJob(id: number, updates: Partial<InsertJob>): Promise<Job> {
    const [job] = await db
      .update(jobs)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(jobs.id, id))
      .returning();
    return job;
  }

  async deleteJob(id: number): Promise<void> {
    await db.delete(jobs).where(eq(jobs.id, id));
  }

  async getPendingJobs(): Promise<any[]> {
    const result = await db
      .select({
        job: jobs,
        company: companies,
        employer: {
          id: users.id,
          fullName: users.fullName,
          email: users.email,
        },
      })
      .from(jobs)
      .leftJoin(companies, eq(jobs.companyId, companies.id))
      .leftJoin(users, eq(jobs.employerId, users.id))
      .where(eq(jobs.isApproved, false))
      .orderBy(desc(jobs.createdAt));

    return result.map(({ job, company, employer }) => ({
      ...job,
      company,
      employer,
    }));
  }

  async getJobRecommendations(userId: number): Promise<any[]> {
    // Simple recommendation based on user's application history
    const userApplications = await db
      .select({ jobId: applications.jobId })
      .from(applications)
      .where(eq(applications.applicantId, userId));

    const appliedJobIds = userApplications.map(app => app.jobId);

    const recommendations = await db
      .select({
        job: jobs,
        company: companies,
      })
      .from(jobs)
      .leftJoin(companies, eq(jobs.companyId, companies.id))
      .where(
        and(
          eq(jobs.isActive, true),
          eq(jobs.isApproved, true),
          appliedJobIds.length > 0 ? sql`${jobs.id} NOT IN (${appliedJobIds.join(',')})` : sql`1=1`
        )
      )
      .orderBy(desc(jobs.createdAt))
      .limit(10);

    return recommendations.map(({ job, company }) => ({
      ...job,
      company,
    }));
  }

  // Application methods
  async createApplication(application: InsertApplication): Promise<Application> {
    const [newApplication] = await db
      .insert(applications)
      .values({
        ...application,
        appliedAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return newApplication;
  }

  async getApplication(id: number): Promise<Application | undefined> {
    const [application] = await db.select().from(applications).where(eq(applications.id, id));
    return application || undefined;
  }

  async getApplicationWithJob(id: number): Promise<any> {
    const result = await db
      .select({
        application: applications,
        job: jobs,
      })
      .from(applications)
      .leftJoin(jobs, eq(applications.jobId, jobs.id))
      .where(eq(applications.id, id));

    if (result.length === 0) return undefined;

    const { application, job } = result[0];
    return {
      ...application,
      job,
    };
  }

  async getApplicationByJobAndUser(jobId: number, userId: number): Promise<Application | undefined> {
    const [application] = await db
      .select()
      .from(applications)
      .where(and(
        eq(applications.jobId, jobId),
        eq(applications.applicantId, userId)
      ));
    return application || undefined;
  }

  async getApplicationsByUser(userId: number): Promise<any[]> {
    const result = await db
      .select({
        application: applications,
        job: jobs,
        company: companies,
      })
      .from(applications)
      .leftJoin(jobs, eq(applications.jobId, jobs.id))
      .leftJoin(companies, eq(jobs.companyId, companies.id))
      .where(eq(applications.applicantId, userId))
      .orderBy(desc(applications.appliedAt));

    return result.map(({ application, job, company }) => ({
      ...application,
      job: job ? { ...job, company } : null,
    }));
  }

  async getApplicationsByJob(jobId: number): Promise<any[]> {
    const result = await db
      .select({
        application: applications,
        applicant: {
          id: users.id,
          fullName: users.fullName,
          email: users.email,
          profilePicture: users.profilePicture,
        },
      })
      .from(applications)
      .leftJoin(users, eq(applications.applicantId, users.id))
      .where(eq(applications.jobId, jobId))
      .orderBy(desc(applications.appliedAt));

    return result.map(({ application, applicant }) => ({
      ...application,
      applicant,
    }));
  }

  async updateApplicationStatus(id: number, status: string): Promise<Application> {
    const [application] = await db
      .update(applications)
      .set({ status, updatedAt: new Date() })
      .where(eq(applications.id, id))
      .returning();
    return application;
  }

  // Resume methods
  async createResume(resume: InsertResume): Promise<Resume> {
    const [newResume] = await db
      .insert(resumes)
      .values({
        ...resume,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return newResume;
  }

  async getResume(id: number): Promise<Resume | undefined> {
    const [resume] = await db.select().from(resumes).where(eq(resumes.id, id));
    return resume || undefined;
  }

  async getResumesByUser(userId: number): Promise<Resume[]> {
    return await db
      .select()
      .from(resumes)
      .where(eq(resumes.userId, userId))
      .orderBy(desc(resumes.createdAt));
  }

  async updateResume(id: number, updates: Partial<InsertResume>): Promise<Resume> {
    const [resume] = await db
      .update(resumes)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(resumes.id, id))
      .returning();
    return resume;
  }

  async deleteResume(id: number): Promise<void> {
    await db.delete(resumes).where(eq(resumes.id, id));
  }

  // Portfolio methods
  async createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio> {
    const [newPortfolio] = await db
      .insert(portfolios)
      .values({
        ...portfolio,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return newPortfolio;
  }

  async getPortfolio(id: number): Promise<Portfolio | undefined> {
    const [portfolio] = await db.select().from(portfolios).where(eq(portfolios.id, id));
    return portfolio || undefined;
  }

  async getPortfoliosByUser(userId: number): Promise<Portfolio[]> {
    return await db
      .select()
      .from(portfolios)
      .where(eq(portfolios.userId, userId))
      .orderBy(desc(portfolios.createdAt));
  }

  async updatePortfolio(id: number, updates: Partial<InsertPortfolio>): Promise<Portfolio> {
    const [portfolio] = await db
      .update(portfolios)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(portfolios.id, id))
      .returning();
    return portfolio;
  }

  async deletePortfolio(id: number): Promise<void> {
    await db.delete(portfolios).where(eq(portfolios.id, id));
  }

  // Saved jobs methods
  async createSavedJob(savedJob: InsertSavedJob): Promise<SavedJob> {
    const [newSavedJob] = await db
      .insert(savedJobs)
      .values({
        ...savedJob,
        savedAt: new Date(),
      })
      .returning();
    return newSavedJob;
  }

  async getSavedJob(id: number): Promise<SavedJob | undefined> {
    const [savedJob] = await db.select().from(savedJobs).where(eq(savedJobs.id, id));
    return savedJob || undefined;
  }

  async getSavedJobByUserAndJob(userId: number, jobId: number): Promise<SavedJob | undefined> {
    const [savedJob] = await db
      .select()
      .from(savedJobs)
      .where(and(
        eq(savedJobs.userId, userId),
        eq(savedJobs.jobId, jobId)
      ));
    return savedJob || undefined;
  }

  async getSavedJobsByUser(userId: number): Promise<any[]> {
    const result = await db
      .select({
        savedJob: savedJobs,
        job: jobs,
        company: companies,
      })
      .from(savedJobs)
      .leftJoin(jobs, eq(savedJobs.jobId, jobs.id))
      .leftJoin(companies, eq(jobs.companyId, companies.id))
      .where(eq(savedJobs.userId, userId))
      .orderBy(desc(savedJobs.savedAt));

    return result.map(({ savedJob, job, company }) => ({
      ...savedJob,
      job: job ? { ...job, company } : null,
    }));
  }

  async deleteSavedJob(userId: number, jobId: number): Promise<void> {
    await db
      .delete(savedJobs)
      .where(and(
        eq(savedJobs.userId, userId),
        eq(savedJobs.jobId, jobId)
      ));
  }

  // Admin methods
  async getAdminStats(): Promise<any> {
    const [userCount] = await db.select({ count: count() }).from(users);
    const [jobCount] = await db.select({ count: count() }).from(jobs).where(eq(jobs.isActive, true));
    const [applicationCount] = await db.select({ count: count() }).from(applications);
    const [pendingJobCount] = await db.select({ count: count() }).from(jobs).where(eq(jobs.isApproved, false));
    const [companyCount] = await db.select({ count: count() }).from(companies);

    // Applications today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [applicationsToday] = await db
      .select({ count: count() })
      .from(applications)
      .where(sql`${applications.appliedAt} >= ${today}`);

    return {
      totalUsers: userCount.count,
      activeJobs: jobCount.count,
      totalApplications: applicationCount.count,
      pendingJobApprovals: pendingJobCount.count,
      totalCompanies: companyCount.count,
      applicationsToday: applicationsToday.count,
      revenue: 245000, // Mock revenue data
    };
  }
}

export const storage = new DatabaseStorage();
