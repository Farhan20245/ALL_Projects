import {
  users,
  companies,
  jobs,
  applications,
  bookmarks,
  messages,
  type User,
  type UpsertUser,
  type Company,
  type InsertCompany,
  type Job,
  type InsertJob,
  type JobWithCompany,
  type Application,
  type InsertApplication,
  type ApplicationWithJobAndCompany,
  type InsertBookmark,
  type CompanyWithJobs,
  type InsertMessage,
  type Message,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, like, and, or, sql, count, ilike } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Company operations
  createCompany(company: InsertCompany): Promise<Company>;
  getCompany(id: number): Promise<CompanyWithJobs | undefined>;
  getCompanies(): Promise<Company[]>;
  updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company>;
  
  // Job operations
  createJob(job: InsertJob): Promise<Job>;
  getJob(id: number): Promise<JobWithCompany | undefined>;
  getJobs(filters?: {
    search?: string;
    location?: string;
    jobType?: string;
    experienceLevel?: string;
    salaryMin?: number;
    salaryMax?: number;
    companyId?: number;
    limit?: number;
    offset?: number;
    sortBy?: string;
    userId?: string; // for bookmark status
  }): Promise<{ jobs: JobWithCompany[]; total: number }>;
  updateJob(id: number, job: Partial<InsertJob>): Promise<Job>;
  deleteJob(id: number): Promise<void>;
  incrementJobView(id: number): Promise<void>;
  
  // Application operations
  createApplication(application: InsertApplication): Promise<Application>;
  getApplicationsByJob(jobId: number): Promise<ApplicationWithJobAndCompany[]>;
  getApplicationsByUser(userId: string): Promise<ApplicationWithJobAndCompany[]>;
  updateApplicationStatus(id: number, status: string): Promise<Application>;
  checkExistingApplication(jobId: number, userId: string): Promise<boolean>;
  
  // Bookmark operations
  createBookmark(bookmark: InsertBookmark): Promise<void>;
  removeBookmark(userId: string, jobId: number): Promise<void>;
  getUserBookmarks(userId: string): Promise<JobWithCompany[]>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(userId1: string, userId2: string): Promise<Message[]>;
  
  // Admin operations
  getStats(): Promise<{
    totalUsers: number;
    totalJobs: number;
    totalApplications: number;
    totalCompanies: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Company operations
  async createCompany(company: InsertCompany): Promise<Company> {
    const [newCompany] = await db.insert(companies).values(company).returning();
    return newCompany;
  }

  async getCompany(id: number): Promise<CompanyWithJobs | undefined> {
    const [company] = await db
      .select({
        ...companies,
        jobs: sql`json_agg(${jobs}) filter (where ${jobs.id} is not null)`.as('jobs'),
        _count: sql`json_build_object('jobs', count(${jobs.id}))`.as('_count'),
      })
      .from(companies)
      .leftJoin(jobs, eq(companies.id, jobs.companyId))
      .where(eq(companies.id, id))
      .groupBy(companies.id);

    if (!company) return undefined;

    return {
      ...company,
      jobs: company.jobs || [],
      _count: company._count || { jobs: 0 },
    } as CompanyWithJobs;
  }

  async getCompanies(): Promise<Company[]> {
    return await db.select().from(companies).orderBy(desc(companies.createdAt));
  }

  async updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company> {
    const [updated] = await db
      .update(companies)
      .set({ ...company, updatedAt: new Date() })
      .where(eq(companies.id, id))
      .returning();
    return updated;
  }

  // Job operations
  async createJob(job: InsertJob): Promise<Job> {
    const [newJob] = await db.insert(jobs).values(job).returning();
    return newJob;
  }

  async getJob(id: number): Promise<JobWithCompany | undefined> {
    const [job] = await db
      .select({
        ...jobs,
        company: companies,
        postedBy: users,
      })
      .from(jobs)
      .leftJoin(companies, eq(jobs.companyId, companies.id))
      .leftJoin(users, eq(jobs.postedById, users.id))
      .where(eq(jobs.id, id));

    return job as JobWithCompany;
  }

  async getJobs(filters: {
    search?: string;
    location?: string;
    jobType?: string;
    experienceLevel?: string;
    salaryMin?: number;
    salaryMax?: number;
    companyId?: number;
    limit?: number;
    offset?: number;
    sortBy?: string;
    userId?: string;
  } = {}): Promise<{ jobs: JobWithCompany[]; total: number }> {
    const {
      search,
      location,
      jobType,
      experienceLevel,
      salaryMin,
      salaryMax,
      companyId,
      limit = 20,
      offset = 0,
      sortBy = 'latest',
      userId,
    } = filters;

    let whereConditions = [eq(jobs.isActive, true)];

    // Search functionality - case-insensitive partial matching
    if (search) {
      whereConditions.push(
        or(
          ilike(jobs.title, `%${search}%`),
          ilike(jobs.description, `%${search}%`),
          ilike(companies.name, `%${search}%`),
          sql`${jobs.skills} && ARRAY[${search}]::text[]`
        )
      );
    }

    if (location) {
      whereConditions.push(ilike(jobs.location, `%${location}%`));
    }

    if (jobType) {
      whereConditions.push(eq(jobs.jobType, jobType));
    }

    if (experienceLevel) {
      whereConditions.push(eq(jobs.experienceLevel, experienceLevel));
    }

    if (salaryMin) {
      whereConditions.push(sql`${jobs.salaryMin} >= ${salaryMin}`);
    }

    if (salaryMax) {
      whereConditions.push(sql`${jobs.salaryMax} <= ${salaryMax}`);
    }

    if (companyId) {
      whereConditions.push(eq(jobs.companyId, companyId));
    }

    // Sorting
    let orderBy;
    switch (sortBy) {
      case 'salary-high':
        orderBy = [desc(jobs.salaryMax), desc(jobs.createdAt)];
        break;
      case 'salary-low':
        orderBy = [asc(jobs.salaryMin), desc(jobs.createdAt)];
        break;
      case 'relevance':
        orderBy = [desc(jobs.viewCount), desc(jobs.createdAt)];
        break;
      default:
        orderBy = [desc(jobs.createdAt)];
    }

    // Get total count
    const [{ total }] = await db
      .select({ total: count() })
      .from(jobs)
      .leftJoin(companies, eq(jobs.companyId, companies.id))
      .where(and(...whereConditions));

    // Get jobs with company info and bookmark status
    const jobsQuery = db
      .select({
        ...jobs,
        company: companies,
        postedBy: users,
        isBookmarked: userId ? 
          sql`EXISTS(SELECT 1 FROM ${bookmarks} WHERE ${bookmarks.jobId} = ${jobs.id} AND ${bookmarks.userId} = ${userId})`.as('isBookmarked') : 
          sql`false`.as('isBookmarked'),
      })
      .from(jobs)
      .leftJoin(companies, eq(jobs.companyId, companies.id))
      .leftJoin(users, eq(jobs.postedById, users.id))
      .where(and(...whereConditions))
      .orderBy(...orderBy)
      .limit(limit)
      .offset(offset);

    const jobResults = await jobsQuery;

    return {
      jobs: jobResults as JobWithCompany[],
      total: Number(total),
    };
  }

  async updateJob(id: number, job: Partial<InsertJob>): Promise<Job> {
    const [updated] = await db
      .update(jobs)
      .set({ ...job, updatedAt: new Date() })
      .where(eq(jobs.id, id))
      .returning();
    return updated;
  }

  async deleteJob(id: number): Promise<void> {
    await db.update(jobs).set({ isActive: false }).where(eq(jobs.id, id));
  }

  async incrementJobView(id: number): Promise<void> {
    await db
      .update(jobs)
      .set({ viewCount: sql`${jobs.viewCount} + 1` })
      .where(eq(jobs.id, id));
  }

  // Application operations
  async createApplication(application: InsertApplication): Promise<Application> {
    const [newApplication] = await db.insert(applications).values(application).returning();
    
    // Increment job applicant count
    await db
      .update(jobs)
      .set({ applicantCount: sql`${jobs.applicantCount} + 1` })
      .where(eq(jobs.id, application.jobId));

    return newApplication;
  }

  async getApplicationsByJob(jobId: number): Promise<ApplicationWithJobAndCompany[]> {
    const results = await db
      .select({
        ...applications,
        job: {
          ...jobs,
          company: companies,
        },
        applicant: users,
      })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .leftJoin(companies, eq(jobs.companyId, companies.id))
      .innerJoin(users, eq(applications.applicantId, users.id))
      .where(eq(applications.jobId, jobId))
      .orderBy(desc(applications.appliedAt));

    return results.map(result => ({
      ...result,
      job: {
        ...result.job,
        company: result.job.company,
        postedBy: null,
      } as JobWithCompany,
    })) as ApplicationWithJobAndCompany[];
  }

  async getApplicationsByUser(userId: string): Promise<ApplicationWithJobAndCompany[]> {
    const results = await db
      .select({
        ...applications,
        job: {
          ...jobs,
          company: companies,
        },
      })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .leftJoin(companies, eq(jobs.companyId, companies.id))
      .where(eq(applications.applicantId, userId))
      .orderBy(desc(applications.appliedAt));

    return results.map(result => ({
      ...result,
      job: {
        ...result.job,
        company: result.job.company,
        postedBy: null,
      } as JobWithCompany,
    })) as ApplicationWithJobAndCompany[];
  }

  async updateApplicationStatus(id: number, status: string): Promise<Application> {
    const [updated] = await db
      .update(applications)
      .set({ status, updatedAt: new Date() })
      .where(eq(applications.id, id))
      .returning();
    return updated;
  }

  async checkExistingApplication(jobId: number, userId: string): Promise<boolean> {
    const [existing] = await db
      .select({ id: applications.id })
      .from(applications)
      .where(and(eq(applications.jobId, jobId), eq(applications.applicantId, userId)))
      .limit(1);
    
    return !!existing;
  }

  // Bookmark operations
  async createBookmark(bookmark: InsertBookmark): Promise<void> {
    await db.insert(bookmarks).values(bookmark).onConflictDoNothing();
  }

  async removeBookmark(userId: string, jobId: number): Promise<void> {
    await db
      .delete(bookmarks)
      .where(and(eq(bookmarks.userId, userId), eq(bookmarks.jobId, jobId)));
  }

  async getUserBookmarks(userId: string): Promise<JobWithCompany[]> {
    const results = await db
      .select({
        ...jobs,
        company: companies,
        postedBy: users,
      })
      .from(bookmarks)
      .innerJoin(jobs, eq(bookmarks.jobId, jobs.id))
      .leftJoin(companies, eq(jobs.companyId, companies.id))
      .leftJoin(users, eq(jobs.postedById, users.id))
      .where(eq(bookmarks.userId, userId))
      .orderBy(desc(bookmarks.createdAt));

    return results as JobWithCompany[];
  }

  // Message operations
  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async getMessages(userId1: string, userId2: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(
        or(
          and(eq(messages.senderId, userId1), eq(messages.receiverId, userId2)),
          and(eq(messages.senderId, userId2), eq(messages.receiverId, userId1))
        )
      )
      .orderBy(asc(messages.createdAt));
  }

  // Admin operations
  async getStats(): Promise<{
    totalUsers: number;
    totalJobs: number;
    totalApplications: number;
    totalCompanies: number;
  }> {
    const [userCount] = await db.select({ count: count() }).from(users);
    const [jobCount] = await db.select({ count: count() }).from(jobs);
    const [applicationCount] = await db.select({ count: count() }).from(applications);
    const [companyCount] = await db.select({ count: count() }).from(companies);

    return {
      totalUsers: Number(userCount.count),
      totalJobs: Number(jobCount.count),
      totalApplications: Number(applicationCount.count),
      totalCompanies: Number(companyCount.count),
    };
  }
}

export const storage = new DatabaseStorage();
