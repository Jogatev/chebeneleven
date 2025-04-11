// server/index.ts
import express3 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import session from "express-session";
import createMemoryStore from "memorystore";
import { v4 as uuidv4 } from "uuid";
var MemoryStore = createMemoryStore(session);
var MemStorage = class {
  users;
  jobs;
  applications;
  activities;
  notes;
  // Store application notes
  currentUserId;
  currentJobId;
  currentApplicationId;
  currentActivityId;
  sessionStore;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.jobs = /* @__PURE__ */ new Map();
    this.applications = /* @__PURE__ */ new Map();
    this.activities = /* @__PURE__ */ new Map();
    this.notes = /* @__PURE__ */ new Map();
    this.currentUserId = 1;
    this.currentJobId = 1;
    this.currentApplicationId = 1;
    this.currentActivityId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 864e5
      // 24 hours
    });
  }
  // User methods
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = this.currentUserId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  async getUsers() {
    return Array.from(this.users.values());
  }
  // Job listing methods
  async getJobs() {
    return Array.from(this.jobs.values());
  }
  async getJobsByUserId(userId) {
    return Array.from(this.jobs.values()).filter(
      (job) => job.userId === userId
    );
  }
  async getJobById(id) {
    return this.jobs.get(id);
  }
  async createJob(insertJob) {
    const id = this.currentJobId++;
    const now = /* @__PURE__ */ new Date();
    const job = {
      ...insertJob,
      id,
      createdAt: now,
      tags: Array.isArray(insertJob.tags) ? insertJob.tags : []
    };
    this.jobs.set(id, job);
    return job;
  }
  async updateJob(id, updates) {
    const job = this.jobs.get(id);
    if (!job) return void 0;
    const updatedJob = { ...job, ...updates };
    this.jobs.set(id, updatedJob);
    return updatedJob;
  }
  async deleteJob(id) {
    return this.jobs.delete(id);
  }
  // Helper method to generate application reference IDs
  generateReferenceId() {
    const year = (/* @__PURE__ */ new Date()).getFullYear();
    const randomPart = uuidv4().substring(0, 5).toUpperCase();
    return `SEV-${year}-${randomPart}`;
  }
  // Application methods
  async getApplications() {
    return Array.from(this.applications.values());
  }
  async getApplicationsByJobId(jobId) {
    const allApplications = Array.from(this.applications.values());
    console.log(`Looking for applications for job ID ${jobId}, total applications: ${allApplications.length}`);
    const applications2 = allApplications.filter((app2) => {
      const appJobId = typeof app2.jobId === "string" ? parseInt(app2.jobId) : app2.jobId;
      const result = appJobId === jobId;
      console.log(`Comparing application jobId ${app2.jobId} (${typeof app2.jobId}) with requested jobId ${jobId}: ${result}`);
      return result;
    });
    console.log(`Found ${applications2.length} applications for job ID ${jobId}`);
    return applications2.map((app2) => {
      if (!app2.status) {
        return { ...app2, status: "submitted" };
      }
      return app2;
    });
  }
  async getApplicationsForUser(userId) {
    const userJobs = await this.getJobsByUserId(userId);
    if (userJobs.length === 0) {
      console.log(`User ${userId} has no jobs, returning empty applications array`);
      return [];
    }
    const userJobIds = userJobs.map((job) => job.id);
    console.log(`User ${userId} job IDs:`, userJobIds);
    const allApplications = Array.from(this.applications.values());
    console.log(`Total applications in system: ${allApplications.length}`);
    if (allApplications.length === 0) {
      console.log("No applications found in storage");
      return [];
    }
    allApplications.forEach((app2) => {
      const jobIdType = typeof app2.jobId;
      console.log(`Application ID: ${app2.id}, jobId: ${app2.jobId} (type: ${jobIdType}), status: ${app2.status || "submitted"}`);
    });
    const userApplications = allApplications.filter((app2) => {
      const appJobId = Number(app2.jobId);
      return userJobIds.includes(appJobId);
    });
    console.log(`Applications for user ${userId}'s jobs: ${userApplications.length}`);
    const normalizedApplications = userApplications.map((app2) => {
      if (!app2.status) {
        return { ...app2, status: "submitted" };
      }
      return app2;
    });
    return normalizedApplications;
  }
  async getApplicationById(id) {
    return this.applications.get(id);
  }
  async createApplication(insertApplication) {
    const id = this.currentApplicationId++;
    const now = /* @__PURE__ */ new Date();
    const jobId = typeof insertApplication.jobId === "string" ? parseInt(insertApplication.jobId) : insertApplication.jobId;
    const referenceId = insertApplication.referenceId || this.generateReferenceId();
    console.log(`Creating application with jobId: ${jobId}, referenceId: ${referenceId}`);
    const application = {
      ...insertApplication,
      id,
      jobId,
      // Make sure jobId is a number
      referenceId,
      // Add the reference ID
      submittedAt: now,
      availableShifts: Array.isArray(insertApplication.availableShifts) ? insertApplication.availableShifts : []
    };
    this.applications.set(id, application);
    const storedApp = this.applications.get(id);
    console.log(`Stored application jobId: ${storedApp?.jobId}, referenceId: ${storedApp?.referenceId}`);
    return application;
  }
  async updateApplication(id, updates) {
    const application = this.applications.get(id);
    if (!application) return void 0;
    const updatedApplication = { ...application, ...updates };
    this.applications.set(id, updatedApplication);
    return updatedApplication;
  }
  // Notes methods
  async saveApplicationNote(applicationId, note) {
    if (!this.applications.has(applicationId)) return false;
    this.notes.set(applicationId, note);
    return true;
  }
  async getApplicationNote(applicationId) {
    return this.notes.get(applicationId);
  }
  // Activity methods
  async getActivities() {
    return Array.from(this.activities.values());
  }
  async getActivitiesByUserId(userId) {
    return Array.from(this.activities.values()).filter((activity) => activity.userId === userId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  async createActivity(insertActivity) {
    const id = this.currentActivityId++;
    const now = /* @__PURE__ */ new Date();
    const activity = {
      ...insertActivity,
      id,
      timestamp: now
    };
    this.activities.set(id, activity);
    return activity;
  }
};
var storage = new MemStorage();

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session2 from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

// shared/schema.ts
import { pgTable, text, serial, integer, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  franchiseeName: text("franchise_name").notNull(),
  franchiseeId: text("franchisee_id").notNull().unique(),
  location: text("location").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  franchiseeName: true,
  franchiseeId: true,
  location: true
});
var jobListings = pgTable("job_listings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  // Franchisee ID
  title: text("title").notNull(),
  location: text("location").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements").notNull(),
  jobType: text("job_type").notNull(),
  // Full-time, Part-time, etc.
  department: text("department"),
  // Optional department
  payRange: text("pay_range"),
  benefits: text("benefits"),
  status: text("status").notNull().default("active"),
  // active, filled, closed, archived
  createdAt: timestamp("created_at").defaultNow().notNull(),
  closingDate: timestamp("closing_date"),
  tags: json("tags").$type().default([])
});
var baseJobSchema = createInsertSchema(jobListings);
var insertJobListingSchema = baseJobSchema.pick({
  userId: true,
  title: true,
  location: true,
  description: true,
  requirements: true,
  jobType: true,
  department: true,
  payRange: true,
  benefits: true,
  status: true,
  tags: true
}).extend({
  // Allow closingDate to be a Date or string and handle conversion
  closingDate: z.union([
    z.date().optional(),
    z.string().optional().transform((val) => val ? new Date(val) : void 0)
  ])
});
var applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull(),
  // Job listing ID
  referenceId: text("reference_id").notNull().unique(),
  // Unique reference ID for tracking
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address"),
  city: text("city"),
  zipCode: text("zip_code"),
  resumeUrl: text("resume_url"),
  // URL to uploaded resume
  experience: text("experience"),
  education: text("education"),
  coverLetter: text("cover_letter"),
  availableShifts: json("available_shifts").$type(),
  workAvailability: json("work_availability").$type(),
  startDate: timestamp("start_date"),
  status: text("status").notNull().default("submitted"),
  // submitted, under_review, interviewed, accepted, rejected
  submittedAt: timestamp("submitted_at").defaultNow().notNull()
});
var baseApplicationSchema = createInsertSchema(applications);
var insertApplicationSchema = baseApplicationSchema.pick({
  jobId: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  address: true,
  city: true,
  zipCode: true,
  resumeUrl: true,
  experience: true,
  education: true,
  coverLetter: true,
  availableShifts: true,
  workAvailability: true,
  status: true
}).extend({
  // Make referenceId optional for client submissions (will be generated on server)
  referenceId: z.string().optional(),
  // Allow startDate to be a Date or string and handle conversion
  startDate: z.union([
    z.date().optional(),
    z.string().optional().transform((val) => val ? new Date(val) : void 0)
  ])
});
var activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: integer("entity_id").notNull(),
  details: json("details").$type().default({}),
  timestamp: timestamp("timestamp").defaultNow().notNull()
});
var insertActivitySchema = createInsertSchema(activities);

// server/auth.ts
import { fromZodError } from "zod-validation-error";
var scryptAsync = promisify(scrypt);
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
function setupAuth(app2) {
  const sessionSecret = process.env.SESSION_SECRET || randomBytes(32).toString("hex");
  const sessionSettings = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1e3
      // 1 week
    }
  };
  app2.set("trust proxy", 1);
  app2.use(session2(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !await comparePasswords(password, user.password)) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    })
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  app2.post("/api/register", async (req, res, next) => {
    try {
      const parseResult = insertUserSchema.safeParse(req.body);
      if (!parseResult.success) {
        const validationError = fromZodError(parseResult.error);
        return res.status(400).json({ error: validationError.message });
      }
      const existingUser = await storage.getUserByUsername(parseResult.data.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
      const allUsers = await storage.getUsers();
      const existingFranchiseeId = allUsers.find(
        (u) => u.franchiseeId === parseResult.data.franchiseeId
      );
      if (existingFranchiseeId) {
        return res.status(400).json({ error: "Franchisee ID already exists" });
      }
      const user = await storage.createUser({
        ...parseResult.data,
        password: await hashPassword(parseResult.data.password)
      });
      req.login(user, (err) => {
        if (err) return next(err);
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });
  app2.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }
      req.login(user, (err2) => {
        if (err2) return next(err2);
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
}

// server/routes.ts
import { fromZodError as fromZodError2 } from "zod-validation-error";

// server/email-service.ts
import { Resend } from "resend";
var resend = new Resend(process.env.RESEND_API_KEY || "re_Hywa1czp_PV64Ygb6F5o43CmUjSoMnmxc");
var SENDER_EMAIL = "chiiibiiiniliiibinn@resend.dev";
async function sendApplicationConfirmation(application, job, referenceId) {
  try {
    const applicantName = `${application.firstName} ${application.lastName}`;
    const subject = `Your Application for ${job.title} at 7-Eleven has been received`;
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="font-size: 24px; font-weight: bold;">
            <span style="color: #008c48;">7-ELEVEN</span>
            <span style="color: #ff7a00; margin-left: 5px;">PHILIPPINES</span>
          </div>
        </div>
        
        <h2 style="color: #333; text-align: center;">Application Confirmation</h2>
        
        <p>Dear ${applicantName},</p>
        
        <p>Thank you for applying to the <strong>${job.title}</strong> position at 7-Eleven ${job.location}. We have received your application and our team will review it shortly.</p>
        
        <div style="background-color: #f9f9f9; border-left: 4px solid #008c48; padding: 15px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Application Reference ID:</strong> ${referenceId}</p>
          <p style="margin: 10px 0 0;"><strong>Position:</strong> ${job.title}</p>
          <p style="margin: 10px 0 0;"><strong>Location:</strong> ${job.location}</p>
          <p style="margin: 10px 0 0;"><strong>Date Applied:</strong> ${(/* @__PURE__ */ new Date()).toLocaleDateString()}</p>
        </div>
        
        <p>What happens next?</p>
        <ol>
          <li>Our hiring team will review your application</li>
          <li>If your qualifications match our requirements, we'll contact you for an interview</li>
          <li>You will receive updates on your application status via email</li>
        </ol>
        
        <p>Please save your application reference ID for future correspondence.</p>
        
        <p>If you have any questions about your application, please contact our HR department.</p>
        
        <p>Best regards,<br>
        7-Eleven Philippines Recruitment Team</p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #777; font-size: 12px;">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `;
    const { data, error } = await resend.emails.send({
      from: SENDER_EMAIL,
      to: application.email,
      subject,
      html: htmlBody
    });
    if (error) {
      console.error("Resend API error:", error);
      throw new Error(`Email sending failed: ${error.message}`);
    }
    console.log("Email sent successfully, ID:", data?.id);
    return {
      success: true,
      messageId: data?.id || "unknown"
    };
  } catch (error) {
    console.error("Error sending application confirmation email:", error);
    return {
      success: false,
      error: error.message
    };
  }
}
async function sendStatusUpdateEmail(application, job, status, referenceId) {
  try {
    const applicantName = `${application.firstName} ${application.lastName}`;
    const statusMap = {
      submitted: "Submitted",
      under_review: "Under Review",
      interview: "Selected for Interview",
      interviewed: "Interviewed",
      accepted: "Accepted",
      rejected: "Not Selected"
    };
    const statusText = statusMap[status] || status;
    const subject = `Your 7-Eleven Job Application Status: ${statusText}`;
    let statusMessage = "";
    let nextSteps = "";
    if (status === "under_review") {
      statusMessage = "Your application is currently under review by our hiring team.";
      nextSteps = "If your qualifications match our requirements, we will contact you for an interview.";
    } else if (status === "interview") {
      statusMessage = "Congratulations! Your application has been selected for an interview.";
      nextSteps = "Our HR team will contact you shortly to schedule an interview.";
    } else if (status === "interviewed") {
      statusMessage = "Thank you for attending the interview for this position.";
      nextSteps = "Our team is currently evaluating all candidates and we will inform you of our decision soon.";
    } else if (status === "accepted") {
      statusMessage = "Congratulations! We are pleased to inform you that your application has been accepted.";
      nextSteps = "Our HR team will contact you shortly with more details about the next steps.";
    } else if (status === "rejected") {
      statusMessage = "Thank you for your interest in the position. After careful consideration, we have decided to proceed with other candidates whose qualifications more closely match our current needs.";
      nextSteps = "We encourage you to apply for future positions that match your skills and experience.";
    } else {
      statusMessage = `Your application status has been updated to: ${statusText}`;
      nextSteps = "Please continue to monitor your email for further updates.";
    }
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="font-size: 24px; font-weight: bold;">
            <span style="color: #008c48;">7-ELEVEN</span>
            <span style="color: #ff7a00; margin-left: 5px;">PHILIPPINES</span>
          </div>
        </div>
        
        <h2 style="color: #333; text-align: center;">Application Status Update</h2>
        
        <p>Dear ${applicantName},</p>
        
        <p>${statusMessage}</p>
        
        <div style="background-color: #f9f9f9; border-left: 4px solid #008c48; padding: 15px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Application Reference ID:</strong> ${referenceId}</p>
          <p style="margin: 10px 0 0;"><strong>Position:</strong> ${job.title}</p>
          <p style="margin: 10px 0 0;"><strong>Location:</strong> ${job.location}</p>
          <p style="margin: 10px 0 0;"><strong>Current Status:</strong> ${statusText}</p>
        </div>
        
        <p>${nextSteps}</p>
        
        <p>If you have any questions, please contact our HR department and reference your Application ID.</p>
        
        <p>Best regards,<br>
        7-Eleven Philippines Recruitment Team</p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #777; font-size: 12px;">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `;
    const { data, error } = await resend.emails.send({
      from: SENDER_EMAIL,
      to: application.email,
      subject,
      html: htmlBody
    });
    if (error) {
      console.error("Resend API error:", error);
      throw new Error(`Email sending failed: ${error.message}`);
    }
    console.log("Status update email sent successfully, ID:", data?.id);
    return {
      success: true,
      messageId: data?.id || "unknown"
    };
  } catch (error) {
    console.error("Error sending status update email:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

// server/routes.ts
async function registerRoutes(app2) {
  console.log("Starting route registration...");
  app2.get("/api/test", (req, res) => {
    console.log("Test route accessed");
    res.json({ message: "Test route working!" });
  });
  setupAuth(app2);
  app2.get("/api/jobs", async (req, res) => {
    try {
      const jobs = await storage.getJobs();
      const activeJobs = jobs.filter((job) => job.status === "active");
      res.json(activeJobs);
    } catch (error) {
      console.error("Error getting jobs:", error);
      res.status(500).json({ error: "Failed to retrieve job listings" });
    }
  });
  app2.post("/api/jobs/:id/archive", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const jobId = parseInt(req.params.id);
      const job = await storage.getJobById(jobId);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      if (job.userId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden: You do not own this job listing" });
      }
      if (job.status === "archived") {
        return res.status(400).json({ error: "Job is already archived" });
      }
      const updatedJob = await storage.updateJob(jobId, { status: "archived" });
      await storage.createActivity({
        userId: req.user.id,
        action: "updated_job_status",
        entityType: "job",
        entityId: jobId,
        details: {
          jobTitle: updatedJob.title,
          previousStatus: job.status,
          newStatus: "archived"
        }
      });
      res.json(updatedJob);
    } catch (error) {
      console.error("Error archiving job:", error);
      res.status(500).json({ error: "Failed to archive job listing" });
    }
  });
  app2.get("/api/jobs/:id", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const job = await storage.getJobById(jobId);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      console.error("Error getting job:", error);
      res.status(500).json({ error: "Failed to retrieve job" });
    }
  });
  app2.get("/api/my-jobs", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const userId = req.user.id;
      const jobs = await storage.getJobsByUserId(userId);
      res.json(jobs);
    } catch (error) {
      console.error("Error getting user jobs:", error);
      res.status(500).json({ error: "Failed to retrieve your job listings" });
    }
  });
  app2.post("/api/jobs", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      let jobData = { ...req.body, userId: req.user.id };
      if (jobData.closingDate && typeof jobData.closingDate === "string") {
        try {
          jobData.closingDate = new Date(jobData.closingDate);
        } catch (error) {
          return res.status(400).json({ error: "Invalid closing date format" });
        }
      }
      const parseResult = insertJobListingSchema.safeParse(jobData);
      if (!parseResult.success) {
        const validationError = fromZodError2(parseResult.error);
        return res.status(400).json({ error: validationError.message });
      }
      const job = await storage.createJob(parseResult.data);
      console.log(`Logging job creation activity for user ${req.user.id}, job ${job.id}`);
      try {
        const activity = await storage.createActivity({
          userId: req.user.id,
          action: "created_job",
          entityType: "job",
          entityId: job.id,
          details: { jobTitle: job.title, location: job.location }
        });
        console.log("Activity logged:", activity);
      } catch (activityError) {
        console.error("Error logging activity:", activityError);
      }
      res.status(201).json(job);
    } catch (error) {
      console.error("Error creating job:", error);
      res.status(500).json({ error: "Failed to create job listing" });
    }
  });
  app2.patch("/api/jobs/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const jobId = parseInt(req.params.id);
      const job = await storage.getJobById(jobId);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      if (job.userId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden: You do not own this job listing" });
      }
      const updatedJob = await storage.updateJob(jobId, req.body);
      if (req.body.status) {
        console.log(`Logging job status update activity: ${job.status} -> ${req.body.status}`);
        try {
          await storage.createActivity({
            userId: req.user.id,
            action: "updated_job_status",
            entityType: "job",
            entityId: jobId,
            details: {
              jobTitle: updatedJob.title,
              newStatus: req.body.status,
              previousStatus: job.status
            }
          });
        } catch (activityError) {
          console.error("Error logging status update activity:", activityError);
        }
      } else if (Object.keys(req.body).length > 0) {
        console.log(`Logging job update activity for fields: ${Object.keys(req.body).join(", ")}`);
        try {
          await storage.createActivity({
            userId: req.user.id,
            action: "updated_job",
            entityType: "job",
            entityId: jobId,
            details: {
              jobTitle: updatedJob.title,
              updatedFields: Object.keys(req.body).join(", ")
            }
          });
        } catch (activityError) {
          console.error("Error logging job update activity:", activityError);
        }
      }
      res.json(updatedJob);
    } catch (error) {
      console.error("Error updating job:", error);
      res.status(500).json({ error: "Failed to update job listing" });
    }
  });
  app2.delete("/api/jobs/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const jobId = parseInt(req.params.id);
      const job = await storage.getJobById(jobId);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      if (job.userId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden: You do not own this job listing" });
      }
      console.log(`Logging job deletion activity for job ${jobId}`);
      try {
        await storage.createActivity({
          userId: req.user.id,
          action: "deleted_job",
          entityType: "job",
          entityId: jobId,
          details: {
            jobTitle: job.title,
            location: job.location
          }
        });
      } catch (activityError) {
        console.error("Error logging job deletion activity:", activityError);
      }
      await storage.deleteJob(jobId);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting job:", error);
      res.status(500).json({ error: "Failed to delete job listing" });
    }
  });
  app2.post("/api/applications", async (req, res) => {
    try {
      const parseResult = insertApplicationSchema.safeParse(req.body);
      if (!parseResult.success) {
        const validationError = fromZodError2(parseResult.error);
        return res.status(400).json({ error: validationError.message });
      }
      const job = await storage.getJobById(parseResult.data.jobId);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      if (job.status !== "active") {
        return res.status(400).json({ error: "This job is no longer accepting applications" });
      }
      const application = await storage.createApplication(parseResult.data);
      console.log("Application created successfully:", application);
      const allApplications = await storage.getApplications();
      console.log(`Total applications in storage: ${allApplications.length}`);
      let emailResult = null;
      try {
        if (application.email) {
          const jobDetails = await storage.getJobById(application.jobId);
          if (jobDetails) {
            emailResult = await sendApplicationConfirmation(
              application,
              jobDetails,
              application.referenceId
            );
            console.log("Application confirmation email sent:", emailResult);
          }
        } else {
          console.log("No email provided for application, skipping confirmation email");
        }
        console.log(`Logging application received activity for user ${job.userId}`);
        try {
          await storage.createActivity({
            userId: job.userId,
            action: "received_application",
            entityType: "application",
            entityId: application.id,
            details: {
              applicantName: `${application.firstName} ${application.lastName}`,
              jobTitle: job.title
            }
          });
        } catch (activityError) {
          console.error("Error logging application received activity:", activityError);
        }
      } catch (emailError) {
        console.error("Error sending confirmation email:", emailError);
      }
      res.status(201).json({
        ...application,
        notificationSent: emailResult?.success || false
      });
    } catch (error) {
      console.error("Error creating application:", error);
      res.status(500).json({ error: "Failed to submit application" });
    }
  });
  app2.get("/api/my-applications", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const userId = req.user.id;
      console.log(`Getting applications for user ${userId}`);
      const userJobs = await storage.getJobsByUserId(userId);
      console.log(`User has ${userJobs.length} job listings:`, userJobs.map((j) => j.id));
      if (userJobs.length === 0) {
        console.log("User has no jobs, returning empty applications array");
        return res.json([]);
      }
      const userJobIds = userJobs.map((job) => job.id);
      const allApplications = await storage.getApplications();
      console.log(`Total applications in system: ${allApplications.length}`);
      if (allApplications.length === 0) {
        console.log("No applications found in storage");
        return res.json([]);
      }
      const matchedApplications = [];
      for (const app3 of allApplications) {
        const appJobId = typeof app3.jobId === "string" ? parseInt(app3.jobId) : app3.jobId;
        console.log(`Checking application ${app3.id} for job ${appJobId}, user jobs: [${userJobIds.join(",")}]`);
        if (userJobIds.includes(appJobId)) {
          console.log(`Match found: Application ${app3.id} matches job ${appJobId}`);
          if (!app3.status) {
            app3.status = "submitted";
          }
          matchedApplications.push({
            ...app3,
            jobId: appJobId
            // Ensure jobId is a number
          });
        }
      }
      console.log(`Found ${matchedApplications.length} applications for user's jobs`);
      if (matchedApplications.length === 0) {
        return res.json([]);
      }
      const applicationsWithJobDetails = await Promise.all(
        matchedApplications.map(async (app3) => {
          const job = await storage.getJobById(app3.jobId);
          return {
            ...app3,
            jobTitle: job ? job.title : "Unknown Job",
            jobLocation: job ? job.location : "Unknown Location"
          };
        })
      );
      res.json(applicationsWithJobDetails);
    } catch (error) {
      console.error("Error getting applications:", error);
      res.status(500).json({ error: "Failed to retrieve applications" });
    }
  });
  app2.get("/api/applications/job/:jobId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const jobId = parseInt(req.params.jobId);
      const job = await storage.getJobById(jobId);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      if (job.userId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden: You do not own this job listing" });
      }
      const allApplications = await storage.getApplications();
      const jobApplications = allApplications.filter((app3) => {
        const appJobId = typeof app3.jobId === "string" ? parseInt(app3.jobId) : app3.jobId;
        return appJobId === jobId;
      });
      console.log(`Found ${jobApplications.length} applications for job ${jobId}`);
      res.json(jobApplications);
    } catch (error) {
      console.error(`Error getting applications for job ${req.params.jobId}:`, error);
      res.status(500).json({ error: "Failed to retrieve applications" });
    }
  });
  app2.get("/api/applications/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const applicationId = parseInt(req.params.id);
      const application = await storage.getApplicationById(applicationId);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      const job = await storage.getJobById(application.jobId);
      if (!job || job.userId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden: You do not own this job listing" });
      }
      res.json(application);
    } catch (error) {
      console.error("Error getting application:", error);
      res.status(500).json({ error: "Failed to retrieve application" });
    }
  });
  app2.patch("/api/applications/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const applicationId = parseInt(req.params.id);
      const application = await storage.getApplicationById(applicationId);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      const job = await storage.getJobById(application.jobId);
      if (!job || job.userId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden: You do not own this job listing" });
      }
      console.log(`Updating application ${applicationId} with data:`, req.body);
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }
      const allowedStatuses = ["submitted", "under_review", "interview", "interviewed", "accepted", "rejected"];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          error: `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`
        });
      }
      const previousStatus = application.status || "submitted";
      const updatedApplication = await storage.updateApplication(applicationId, { status });
      console.log(`Logging application status update activity: ${previousStatus} -> ${status}`);
      try {
        await storage.createActivity({
          userId: req.user.id,
          action: "updated_application_status",
          entityType: "application",
          entityId: applicationId,
          details: {
            applicantName: `${application.firstName} ${application.lastName}`,
            jobTitle: job.title,
            previousStatus,
            newStatus: status
          }
        });
      } catch (activityError) {
        console.error("Error logging status update activity:", activityError);
      }
      let emailResult = null;
      try {
        if (application.email) {
          emailResult = await sendStatusUpdateEmail(
            application,
            job,
            status,
            application.referenceId
          );
          console.log("Status update email sent:", emailResult);
        }
      } catch (emailError) {
        console.error("Error sending status update email:", emailError);
      }
      res.json({
        ...updatedApplication,
        notificationSent: emailResult?.success || false
      });
    } catch (error) {
      console.error("Error updating application:", error);
      res.status(500).json({ error: "Failed to update application" });
    }
  });
  app2.get("/api/my-activities", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const userId = req.user.id;
      const activities2 = await storage.getActivitiesByUserId(userId);
      activities2.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });
      res.json(activities2);
    } catch (error) {
      console.error("Error getting activities:", error);
      res.status(500).json({ error: "Failed to retrieve activities" });
    }
  });
  app2.post("/api/activities", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const activityData = { ...req.body, userId: req.user.id };
      const parseResult = insertActivitySchema.safeParse(activityData);
      if (!parseResult.success) {
        const validationError = fromZodError2(parseResult.error);
        return res.status(400).json({ error: validationError.message });
      }
      const activity = await storage.createActivity(parseResult.data);
      res.status(201).json(activity);
    } catch (error) {
      console.error("Error creating activity:", error);
      res.status(500).json({ error: "Failed to create activity log" });
    }
  });
  const server = createServer(app2);
  return server;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname2, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/file-upload.ts
import express2 from "express";
import fileUpload from "express-fileupload";
import path3 from "path";
import fs2 from "fs";
var UPLOAD_DIR = path3.join(process.cwd(), "uploads");
if (!fs2.existsSync(UPLOAD_DIR)) {
  fs2.mkdirSync(UPLOAD_DIR, { recursive: true });
}
function setupFileUpload(app2) {
  app2.use(fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 },
    // 10MB limit
    abortOnLimit: true,
    useTempFiles: true,
    tempFileDir: path3.join(UPLOAD_DIR, "temp"),
    createParentPath: true
  }));
  app2.post("/api/upload-resume", (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: "No files were uploaded." });
    }
    const resumeFile = req.files.resume;
    const timestamp2 = Date.now();
    const ext = path3.extname(resumeFile.name);
    const filename = `resume_${timestamp2}${ext}`;
    const filePath = path3.join(UPLOAD_DIR, filename);
    resumeFile.mv(filePath, (err) => {
      if (err) {
        console.error("File upload error:", err);
        return res.status(500).json({ error: "Error uploading file", details: err.message });
      }
      const relativePath = path3.join("/uploads", filename);
      return res.status(200).json({
        path: relativePath,
        filename: resumeFile.name,
        size: resumeFile.size
      });
    });
  });
  app2.use("/uploads", (req, res, next) => {
    res.setHeader("Cache-Control", "public, max-age=86400");
    next();
  }, express2.static(UPLOAD_DIR));
}

// server/index.ts
import session3 from "express-session";
import MemoryStore2 from "memorystore";
import ConnectPgSimple from "connect-pg-simple";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
var DB_TYPE = process.env.DB_TYPE || "postgres";
var DB_CONNECTION_STRING = process.env.DB_CONNECTION_STRING || "postgresql://neondb_owner:npg_eFrPutD1n9dE@ep-aged-darkness-a1bh7bgl-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
var SESSION_SECRET = process.env.SESSION_SECRET || "seven-eleven-careers-secret";
var app = express3();
app.use(express3.json());
app.use(express3.urlencoded({ extended: false }));
var db = null;
if (DB_TYPE === "postgres") {
  try {
    console.log("Attempting to connect to PostgreSQL...");
    const queryClient = postgres(DB_CONNECTION_STRING, {
      ssl: "require",
      // Needed for Neon.tech
      max: 10,
      // Connection pool size
      idle_timeout: 20,
      // How long a connection can be idle before being closed
      connect_timeout: 30
      // Connection timeout in seconds
    });
    queryClient`SELECT 1`.then(() => {
      console.log("PostgreSQL connection test successful");
    }).catch((error) => {
      console.error("PostgreSQL connection test failed:", error);
    });
    db = drizzle(queryClient);
    log("PostgreSQL database connection initialized");
  } catch (error) {
    console.error("Failed to initialize PostgreSQL connection:", error);
    log("Falling back to in-memory storage");
  }
}
var sessionConfig = {
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1e3
    // 24 hours
  }
};
if (DB_TYPE === "postgres") {
  const PgStore = ConnectPgSimple(session3);
  sessionConfig.store = new PgStore({
    conString: DB_CONNECTION_STRING,
    // Use the connection string directly
    tableName: "sessions",
    createTableIfMissing: true,
    ssl: true
  });
  log("Using PostgreSQL for session storage");
} else {
  const MemStore = MemoryStore2(session3);
  sessionConfig.store = new MemStore({
    checkPeriod: 864e5
    // prune expired entries every 24h
  });
  log("Using in-memory session storage");
}
app.use(session3(sessionConfig));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function(body) {
    if (req.path.startsWith("/api")) {
      console.log(`API Response for ${req.method} ${req.path}:`);
      try {
        if (typeof body === "string" && body.startsWith("<!DOCTYPE")) {
          console.error("HTML response being sent instead of JSON for", req.path);
          console.error(body.substring(0, 200) + "...");
        }
      } catch (e) {
        console.error("Error logging response:", e);
      }
    }
    return originalSend.call(this, body);
  };
  next();
});
app.use((req, res, next) => {
  if (db) {
    req.db = db;
  }
  next();
});
(async () => {
  setupFileUpload(app);
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`Server running on port ${port}`);
    log(`Database type: ${DB_TYPE}`);
    log(`Environment: ${app.get("env")}`);
  });
})();
