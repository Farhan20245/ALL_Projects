import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { enum: ["jobseeker", "employer", "admin"] }).notNull().default("jobseeker"),
  phone: varchar("phone"),
  location: varchar("location"),
  skills: text("skills").array(),
  experience: varchar("experience"),
  resumeUrl: varchar("resume_url"),
  portfolioUrl: varchar("portfolio_url"),
  bio: text("bio"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Companies table
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  industry: varchar("industry"),
  website: varchar("website"),
  logoUrl: varchar("logo_url"),
  location: varchar("location"),
  size: varchar("size"),
  foundedYear: integer("founded_year"),
  culture: text("culture"),
  benefits: text("benefits").array(),
  ownerId: varchar("owner_id").references(() => users.id),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Jobs table
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  requirements: text("requirements").array(),
  responsibilities: text("responsibilities").array(),
  skills: text("skills").array(),
  salaryMin: decimal("salary_min", { precision: 10, scale: 2 }),
  salaryMax: decimal("salary_max", { precision: 10, scale: 2 }),
  salaryType: varchar("salary_type", { enum: ["yearly", "monthly", "hourly"] }).default("yearly"),
  jobType: varchar("job_type", { enum: ["full-time", "part-time", "contract", "remote", "internship"] }).notNull(),
  experienceLevel: varchar("experience_level", { enum: ["entry", "mid", "senior", "executive"] }).notNull(),
  location: varchar("location"),
  isRemote: boolean("is_remote").default(false),
  companyId: integer("company_id").references(() => companies.id),
  postedById: varchar("posted_by_id").references(() => users.id),
  deadline: timestamp("deadline"),
  isActive: boolean("is_active").default(true),
  isAnonymous: boolean("is_anonymous").default(false),
  viewCount: integer("view_count").default(0),
  applicantCount: integer("applicant_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Applications table
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").references(() => jobs.id),
  applicantId: varchar("applicant_id").references(() => users.id),
  resumeUrl: varchar("resume_url"),
  coverLetter: text("cover_letter"),
  status: varchar("status", { 
    enum: ["applied", "viewed", "shortlisted", "interview", "rejected", "hired"] 
  }).default("applied"),
  appliedAt: timestamp("applied_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bookmarks table
export const bookmarks = pgTable("bookmarks", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  jobId: integer("job_id").references(() => jobs.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Messages table for basic chat
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: varchar("sender_id").references(() => users.id),
  receiverId: varchar("receiver_id").references(() => users.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  companies: many(companies),
  jobs: many(jobs),
  applications: many(applications),
  bookmarks: many(bookmarks),
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "receiver" }),
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
  owner: one(users, {
    fields: [companies.ownerId],
    references: [users.id],
  }),
  jobs: many(jobs),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  company: one(companies, {
    fields: [jobs.companyId],
    references: [companies.id],
  }),
  postedBy: one(users, {
    fields: [jobs.postedById],
    references: [users.id],
  }),
  applications: many(applications),
  bookmarks: many(bookmarks),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  job: one(jobs, {
    fields: [applications.jobId],
    references: [jobs.id],
  }),
  applicant: one(users, {
    fields: [applications.applicantId],
    references: [users.id],
  }),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, {
    fields: [bookmarks.userId],
    references: [users.id],
  }),
  job: one(jobs, {
    fields: [bookmarks.jobId],
    references: [jobs.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sender",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receiver",
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ 
  createdAt: true, 
  updatedAt: true 
});

export const insertCompanySchema = createInsertSchema(companies).omit({ 
  id: true,
  createdAt: true, 
  updatedAt: true 
});

export const insertJobSchema = createInsertSchema(jobs).omit({ 
  id: true,
  viewCount: true,
  applicantCount: true,
  createdAt: true, 
  updatedAt: true 
});

export const insertApplicationSchema = createInsertSchema(applications).omit({ 
  id: true,
  appliedAt: true,
  updatedAt: true 
});

export const insertBookmarkSchema = createInsertSchema(bookmarks).omit({ 
  id: true,
  createdAt: true 
});

export const insertMessageSchema = createInsertSchema(messages).omit({ 
  id: true,
  isRead: true,
  createdAt: true 
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;
export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;
export type Bookmark = typeof bookmarks.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Extended types for API responses
export type JobWithCompany = Job & {
  company: Company | null;
  postedBy: User | null;
  isBookmarked?: boolean;
  applicationStatus?: string;
};

export type ApplicationWithJobAndCompany = Application & {
  job: JobWithCompany;
};

export type CompanyWithJobs = Company & {
  jobs: Job[];
  _count: {
    jobs: number;
  };
};
