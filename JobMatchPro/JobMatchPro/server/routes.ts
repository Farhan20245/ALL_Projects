import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import { insertUserSchema, insertJobSchema, insertApplicationSchema, insertCompanySchema, insertPortfolioSchema, insertResumeSchema, insertSavedJobSchema } from "@shared/schema";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Configure multer for file uploads
const storage_config = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage_config });

// Authentication middleware
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Role-based access middleware
function requireRole(roles: string[]) {
  return (req: any, res: any, next: any) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const newUser = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Generate JWT token
      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, role: newUser.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        user: { ...newUser, password: undefined },
        token
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        user: { ...user, password: undefined },
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Job routes
  app.get("/api/jobs", async (req, res) => {
    try {
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
      } = req.query;

      const jobs = await storage.getJobs({
        search: search as string,
        location: location as string,
        category: category as string,
        experienceLevel: experienceLevel as string,
        jobType: jobType as string,
        salaryMin: salaryMin ? parseInt(salaryMin as string) : undefined,
        salaryMax: salaryMax ? parseInt(salaryMax as string) : undefined,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      });

      res.json(jobs);
    } catch (error) {
      console.error('Get jobs error:', error);
      res.status(500).json({ message: "Failed to get jobs" });
    }
  });

  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const job = await storage.getJobWithDetails(parseInt(req.params.id));
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      res.status(500).json({ message: "Failed to get job" });
    }
  });

  app.post("/api/jobs", authenticateToken, requireRole(['employer', 'admin']), async (req: any, res) => {
    try {
      const jobData = insertJobSchema.parse(req.body);
      const newJob = await storage.createJob({
        ...jobData,
        employerId: req.user.id,
      });
      res.status(201).json(newJob);
    } catch (error) {
      console.error('Create job error:', error);
      res.status(400).json({ message: "Failed to create job" });
    }
  });

  app.put("/api/jobs/:id", authenticateToken, requireRole(['employer', 'admin']), async (req: any, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const jobData = insertJobSchema.partial().parse(req.body);
      
      const job = await storage.getJob(jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      // Check if user owns the job or is admin
      if (job.employerId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized to edit this job" });
      }

      const updatedJob = await storage.updateJob(jobId, jobData);
      res.json(updatedJob);
    } catch (error) {
      res.status(400).json({ message: "Failed to update job" });
    }
  });

  app.delete("/api/jobs/:id", authenticateToken, requireRole(['employer', 'admin']), async (req: any, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const job = await storage.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      if (job.employerId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized to delete this job" });
      }

      await storage.deleteJob(jobId);
      res.json({ message: "Job deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete job" });
    }
  });

  // Application routes
  app.post("/api/applications", authenticateToken, requireRole(['job_seeker']), async (req: any, res) => {
    try {
      const applicationData = insertApplicationSchema.parse(req.body);
      
      // Check if user already applied to this job
      const existingApplication = await storage.getApplicationByJobAndUser(
        applicationData.jobId!,
        req.user.id
      );
      
      if (existingApplication) {
        return res.status(400).json({ message: "Already applied to this job" });
      }

      const newApplication = await storage.createApplication({
        ...applicationData,
        applicantId: req.user.id,
      });
      
      res.status(201).json(newApplication);
    } catch (error) {
      console.error('Apply job error:', error);
      res.status(400).json({ message: "Failed to apply for job" });
    }
  });

  app.get("/api/applications", authenticateToken, async (req: any, res) => {
    try {
      const applications = await storage.getApplicationsByUser(req.user.id);
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "Failed to get applications" });
    }
  });

  app.put("/api/applications/:id/status", authenticateToken, requireRole(['employer', 'admin']), async (req: any, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const { status } = req.body;
      
      const application = await storage.getApplicationWithJob(applicationId);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      // Check if user owns the job or is admin
      if (application.job?.employerId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized to update this application" });
      }

      const updatedApplication = await storage.updateApplicationStatus(applicationId, status);
      res.json(updatedApplication);
    } catch (error) {
      res.status(400).json({ message: "Failed to update application status" });
    }
  });

  // Saved jobs routes
  app.post("/api/saved-jobs", authenticateToken, requireRole(['job_seeker']), async (req: any, res) => {
    try {
      const { jobId } = req.body;
      
      const existingSave = await storage.getSavedJobByUserAndJob(req.user.id, jobId);
      if (existingSave) {
        return res.status(400).json({ message: "Job already saved" });
      }

      const savedJob = await storage.createSavedJob({
        userId: req.user.id,
        jobId: jobId,
      });
      
      res.status(201).json(savedJob);
    } catch (error) {
      res.status(400).json({ message: "Failed to save job" });
    }
  });

  app.delete("/api/saved-jobs/:jobId", authenticateToken, requireRole(['job_seeker']), async (req: any, res) => {
    try {
      const jobId = parseInt(req.params.jobId);
      await storage.deleteSavedJob(req.user.id, jobId);
      res.json({ message: "Job removed from saved list" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove saved job" });
    }
  });

  app.get("/api/saved-jobs", authenticateToken, requireRole(['job_seeker']), async (req: any, res) => {
    try {
      const savedJobs = await storage.getSavedJobsByUser(req.user.id);
      res.json(savedJobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to get saved jobs" });
    }
  });

  // Portfolio routes
  app.get("/api/portfolios", authenticateToken, async (req: any, res) => {
    try {
      const portfolios = await storage.getPortfoliosByUser(req.user.id);
      res.json(portfolios);
    } catch (error) {
      res.status(500).json({ message: "Failed to get portfolios" });
    }
  });

  app.post("/api/portfolios", authenticateToken, requireRole(['job_seeker']), async (req: any, res) => {
    try {
      const portfolioData = insertPortfolioSchema.parse(req.body);
      const newPortfolio = await storage.createPortfolio({
        ...portfolioData,
        userId: req.user.id,
      });
      res.status(201).json(newPortfolio);
    } catch (error) {
      res.status(400).json({ message: "Failed to create portfolio" });
    }
  });

  app.delete("/api/portfolios/:id", authenticateToken, requireRole(['job_seeker']), async (req: any, res) => {
    try {
      const portfolioId = parseInt(req.params.id);
      const portfolio = await storage.getPortfolio(portfolioId);
      
      if (!portfolio || portfolio.userId !== req.user.id) {
        return res.status(404).json({ message: "Portfolio not found" });
      }

      await storage.deletePortfolio(portfolioId);
      res.json({ message: "Portfolio deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete portfolio" });
    }
  });

  // Resume routes
  app.post("/api/resumes/upload", authenticateToken, requireRole(['job_seeker']), upload.single('resume'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const resume = await storage.createResume({
        userId: req.user.id,
        fileName: req.file.originalname,
        fileUrl: `/uploads/${req.file.filename}`,
        isBuiltWithBuilder: false,
      });

      res.status(201).json(resume);
    } catch (error) {
      res.status(400).json({ message: "Failed to upload resume" });
    }
  });

  app.get("/api/resumes", authenticateToken, async (req: any, res) => {
    try {
      const resumes = await storage.getResumesByUser(req.user.id);
      res.json(resumes);
    } catch (error) {
      res.status(500).json({ message: "Failed to get resumes" });
    }
  });

  // Company routes
  app.post("/api/companies", authenticateToken, requireRole(['employer', 'admin']), async (req: any, res) => {
    try {
      const companyData = insertCompanySchema.parse(req.body);
      const newCompany = await storage.createCompany({
        ...companyData,
        ownerId: req.user.id,
      });
      res.status(201).json(newCompany);
    } catch (error) {
      res.status(400).json({ message: "Failed to create company" });
    }
  });

  app.get("/api/companies", async (req, res) => {
    try {
      const companies = await storage.getCompanies();
      res.json(companies);
    } catch (error) {
      res.status(500).json({ message: "Failed to get companies" });
    }
  });

  // Admin routes
  app.get("/api/admin/stats", authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to get admin stats" });
    }
  });

  app.get("/api/admin/pending-jobs", authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
      const pendingJobs = await storage.getPendingJobs();
      res.json(pendingJobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to get pending jobs" });
    }
  });

  app.put("/api/admin/jobs/:id/approve", authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const updatedJob = await storage.updateJob(jobId, { isApproved: true });
      res.json(updatedJob);
    } catch (error) {
      res.status(400).json({ message: "Failed to approve job" });
    }
  });

  app.put("/api/admin/jobs/:id/reject", authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const updatedJob = await storage.updateJob(jobId, { isApproved: false, isActive: false });
      res.json(updatedJob);
    } catch (error) {
      res.status(400).json({ message: "Failed to reject job" });
    }
  });

  // Job recommendations (basic keyword matching)
  app.get("/api/recommendations", authenticateToken, requireRole(['job_seeker']), async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get user's skills from their applications and profile
      const recommendations = await storage.getJobRecommendations(req.user.id);
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ message: "Failed to get recommendations" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
