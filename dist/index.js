// server/index.ts
import express3 from "express";

// server/routes.ts
import { createServer } from "http";

// server/connection.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
var DB_CONNECTION_STRING = process.env.DB_CONNECTION_STRING || "postgresql://neondb_owner:npg_eFrPutD1n9dE@ep-aged-darkness-a1bh7bgl-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
var queryClient = postgres(DB_CONNECTION_STRING, {
  ssl: "require",
  // Needed for Neon.tech
  max: 10,
  // Connection pool size
  idle_timeout: 20,
  // How long a connection can be idle before being closed
  connect_timeout: 30
  // Connection timeout in seconds
});
var db = drizzle(queryClient);

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

// server/unified-storage.ts
import { eq, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import createMemoryStore from "memorystore";
import session from "express-session";
var MemoryStore = createMemoryStore(session);
var PostgresStorage = class {
  sessionStore;
  constructor() {
    console.log("PostgresStorage constructor called");
    this.sessionStore = null;
  }
  setSessionStore(store) {
    console.log("Setting session store");
    this.sessionStore = store;
  }
  // User methods
  async getUser(id) {
    try {
      console.log(`Getting user ${id} from PostgreSQL`);
      const users2 = await db.select().from(users).where(eq(users.id, id));
      console.log(`User found: ${users2.length > 0}`);
      return users2[0];
    } catch (error) {
      console.error("PostgreSQL error in getUser:", error);
      throw error;
    }
  }
  async getUserByUsername(username) {
    try {
      console.log(`Getting user by username ${username} from PostgreSQL`);
      const users2 = await db.select().from(users).where(eq(users.username, username));
      console.log(`User found: ${users2.length > 0}`);
      return users2[0];
    } catch (error) {
      console.error("PostgreSQL error in getUserByUsername:", error);
      throw error;
    }
  }
  async createUser(insertUser) {
    try {
      console.log("Creating user in PostgreSQL");
      const users2 = await db.insert(users).values(insertUser).returning();
      console.log("User created in PostgreSQL");
      return users2[0];
    } catch (error) {
      console.error("PostgreSQL error in createUser:", error);
      throw error;
    }
  }
  async getUsers() {
    try {
      console.log("Getting all users from PostgreSQL");
      const users2 = await db.select().from(users);
      console.log(`Retrieved ${users2.length} users from PostgreSQL`);
      return users2;
    } catch (error) {
      console.error("PostgreSQL error in getUsers:", error);
      throw error;
    }
  }
  // Job methods
  async getJobs() {
    try {
      console.log("Getting all jobs from PostgreSQL");
      const jobs = await db.select().from(jobListings).orderBy(desc(jobListings.createdAt));
      console.log(`Retrieved ${jobs.length} jobs from PostgreSQL`);
      return jobs;
    } catch (error) {
      console.error("PostgreSQL error in getJobs:", error);
      throw error;
    }
  }
  async getJobById(id) {
    try {
      console.log(`Getting job ${id} from PostgreSQL`);
      const jobs = await db.select().from(jobListings).where(eq(jobListings.id, id));
      console.log(`Job found: ${jobs.length > 0}`);
      return jobs[0];
    } catch (error) {
      console.error("PostgreSQL error in getJobById:", error);
      throw error;
    }
  }
  async getJobsByUserId(userId) {
    try {
      console.log(`Getting jobs for user ${userId} from PostgreSQL`);
      const jobs = await db.select().from(jobListings).where(eq(jobListings.userId, userId));
      console.log(`Retrieved ${jobs.length} jobs for user ${userId} from PostgreSQL`);
      return jobs;
    } catch (error) {
      console.error("PostgreSQL error in getJobsByUserId:", error);
      throw error;
    }
  }
  async createJob(insertJob) {
    try {
      console.log("Creating job in PostgreSQL:", JSON.stringify(insertJob));
      const jobs = await db.insert(jobListings).values(insertJob).returning();
      console.log("Job created in PostgreSQL:", JSON.stringify(jobs[0]));
      return jobs[0];
    } catch (error) {
      console.error("PostgreSQL error in createJob:", error);
      console.error("Error details:", error.message);
      throw error;
    }
  }
  async updateJob(id, updateData) {
    try {
      console.log(`Updating job ${id} in PostgreSQL:`, JSON.stringify(updateData));
      const jobs = await db.update(jobListings).set(updateData).where(eq(jobListings.id, id)).returning();
      console.log("Job updated in PostgreSQL");
      return jobs[0];
    } catch (error) {
      console.error("PostgreSQL error in updateJob:", error);
      throw error;
    }
  }
  async deleteJob(id) {
    try {
      console.log(`Deleting job ${id} from PostgreSQL`);
      await db.delete(jobListings).where(eq(jobListings.id, id));
      console.log("Job deleted from PostgreSQL");
      return true;
    } catch (error) {
      console.error("PostgreSQL error in deleteJob:", error);
      throw error;
    }
  }
  // Application methods
  async getApplications() {
    try {
      console.log("Getting all applications from PostgreSQL");
      const applications2 = await db.select().from(applications).orderBy(desc(applications.submittedAt));
      console.log(`Retrieved ${applications2.length} applications from PostgreSQL`);
      return applications2;
    } catch (error) {
      console.error("PostgreSQL error in getApplications:", error);
      throw error;
    }
  }
  async getApplicationById(id) {
    try {
      console.log(`Getting application ${id} from PostgreSQL`);
      const applications2 = await db.select().from(applications).where(eq(applications.id, id));
      console.log(`Application found: ${applications2.length > 0}`);
      return applications2[0];
    } catch (error) {
      console.error("PostgreSQL error in getApplicationById:", error);
      throw error;
    }
  }
  async getApplicationsByJobId(jobId) {
    try {
      console.log(`Getting applications for job ${jobId} from PostgreSQL`);
      const applications2 = await db.select().from(applications).where(eq(applications.jobId, jobId));
      console.log(`Retrieved ${applications2.length} applications for job ${jobId} from PostgreSQL`);
      return applications2;
    } catch (error) {
      console.error("PostgreSQL error in getApplicationsByJobId:", error);
      throw error;
    }
  }
  async getApplicationsForUser(userId) {
    try {
      console.log(`Getting applications for user ${userId} from PostgreSQL`);
      const jobs = await this.getJobsByUserId(userId);
      const jobIds = jobs.map((job) => job.id);
      if (jobIds.length === 0) {
        console.log(`User ${userId} has no jobs, returning empty applications array`);
        return [];
      }
      const applications2 = await db.select().from(applications).where(
        applications.jobId.in(jobIds)
      );
      console.log(`Retrieved ${applications2.length} applications for user ${userId} from PostgreSQL`);
      return applications2;
    } catch (error) {
      console.error("PostgreSQL error in getApplicationsForUser:", error);
      throw error;
    }
  }
  async createApplication(insertApplication) {
    try {
      console.log("Creating application in PostgreSQL");
      const referenceId = this.generateReferenceId();
      const applications2 = await db.insert(applications).values({ ...insertApplication, referenceId }).returning();
      console.log("Application created in PostgreSQL");
      return applications2[0];
    } catch (error) {
      console.error("PostgreSQL error in createApplication:", error);
      throw error;
    }
  }
  async updateApplication(id, updateData) {
    try {
      console.log(`Updating application ${id} in PostgreSQL`);
      const applications2 = await db.update(applications).set(updateData).where(eq(applications.id, id)).returning();
      console.log("Application updated in PostgreSQL");
      return applications2[0];
    } catch (error) {
      console.error("PostgreSQL error in updateApplication:", error);
      throw error;
    }
  }
  // Notes methods
  async saveApplicationNote(applicationId, note) {
    try {
      console.log(`Saving note for application ${applicationId} in PostgreSQL`);
      await db.update(applications).set({ notes: note }).where(eq(applications.id, applicationId));
      console.log("Note saved in PostgreSQL");
      return true;
    } catch (error) {
      console.error("PostgreSQL error in saveApplicationNote:", error);
      throw error;
    }
  }
  async getApplicationNote(applicationId) {
    try {
      console.log(`Getting note for application ${applicationId} from PostgreSQL`);
      const application = await this.getApplicationById(applicationId);
      console.log(`Note found: ${application?.notes ? "yes" : "no"}`);
      return application?.notes;
    } catch (error) {
      console.error("PostgreSQL error in getApplicationNote:", error);
      throw error;
    }
  }
  // Activity methods
  async getActivities() {
    try {
      console.log("Getting all activities from PostgreSQL");
      const activities2 = await db.select().from(activities);
      console.log(`Retrieved ${activities2.length} activities from PostgreSQL`);
      return activities2;
    } catch (error) {
      console.error("PostgreSQL error in getActivities:", error);
      throw error;
    }
  }
  async getActivitiesByUserId(userId) {
    try {
      console.log(`Getting activities for user ${userId} from PostgreSQL`);
      const activities2 = await db.select().from(activities).where(eq(activities.userId, userId)).orderBy(desc(activities.timestamp));
      console.log(`Retrieved ${activities2.length} activities for user ${userId} from PostgreSQL`);
      return activities2;
    } catch (error) {
      console.error("PostgreSQL error in getActivitiesByUserId:", error);
      throw error;
    }
  }
  async createActivity(insertActivity) {
    try {
      console.log("Creating activity in PostgreSQL");
      const activities2 = await db.insert(activities).values(insertActivity).returning();
      console.log("Activity created in PostgreSQL");
      return activities2[0];
    } catch (error) {
      console.error("PostgreSQL error in createActivity:", error);
      throw error;
    }
  }
  // Helper method
  generateReferenceId() {
    const year = (/* @__PURE__ */ new Date()).getFullYear();
    const randomPart = uuidv4().substring(0, 5).toUpperCase();
    return `SEV-${year}-${randomPart}`;
  }
};
var storage = new PostgresStorage();
function setSessionStore(store) {
  console.log("setSessionStore called");
  storage.setSessionStore(store);
}

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { fromZodError } from "zod-validation-error";
import { eq as eq2 } from "drizzle-orm";
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
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(
      { passReqToCallback: true },
      // This is the key change
      async (req, username, password, done) => {
        try {
          let user;
          if (req.db) {
            try {
              const result = await req.db.select().from(users).where(eq2(users.username, username));
              user = result.length > 0 ? result[0] : null;
            } catch (err) {
              console.error("Error querying PostgreSQL:", err);
              user = await storage.getUserByUsername(username);
            }
          } else {
            user = await storage.getUserByUsername(username);
          }
          if (!user || !await comparePasswords(password, user.password)) {
            return done(null, false);
          } else {
            return done(null, user);
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      try {
        const user = await storage.getUser(id);
        if (user) {
          return done(null, user);
        }
      } catch (err) {
        console.log("In-memory storage lookup failed:", err.message);
      }
      return done(null, { id });
    } catch (error) {
      console.error("Error deserializing user:", error);
      done(error);
    }
  });
  app2.use(async (req, res, next) => {
    if (req.user && req.db && Object.keys(req.user).length === 1 && req.user.id) {
      try {
        const result = await req.db.select().from(users).where(eq2(users.id, req.user.id));
        if (result.length > 0) {
          req.user = result[0];
        }
      } catch (error) {
        console.error("Error fetching full user from PostgreSQL:", error);
      }
    }
    next();
  });
  app2.post("/api/register", async (req, res, next) => {
    try {
      const parseResult = insertUserSchema.safeParse(req.body);
      if (!parseResult.success) {
        const validationError = fromZodError(parseResult.error);
        return res.status(400).json({ error: validationError.message });
      }
      let existingUser;
      let allUsers;
      if (req.db) {
        try {
          const result = await req.db.select().from(users).where(eq2(users.username, parseResult.data.username));
          existingUser = result.length > 0 ? result[0] : null;
          allUsers = await req.db.select().from(users);
        } catch (error) {
          console.error("Error checking existing users in PostgreSQL:", error);
          existingUser = await storage.getUserByUsername(parseResult.data.username);
          allUsers = await storage.getUsers();
        }
      } else {
        existingUser = await storage.getUserByUsername(parseResult.data.username);
        allUsers = await storage.getUsers();
      }
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
      const existingFranchiseeId = allUsers.find(
        (u) => u.franchiseeId === parseResult.data.franchiseeId
      );
      if (existingFranchiseeId) {
        return res.status(400).json({ error: "Franchisee ID already exists" });
      }
      const userData = {
        ...parseResult.data,
        password: await hashPassword(parseResult.data.password)
      };
      let user;
      if (req.db) {
        try {
          const result = await req.db.insert(users).values(userData).returning();
          user = result.length > 0 ? result[0] : null;
        } catch (error) {
          console.error("Error creating user in PostgreSQL:", error);
          return res.status(500).json({ error: "Failed to create user in database" });
        }
      } else {
        user = await storage.createUser(userData);
      }
      if (!user) {
        throw new Error("Failed to create user");
      }
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
import session2 from "express-session";
import MemoryStore2 from "memorystore";
import ConnectPgSimple from "connect-pg-simple";
import { drizzle as drizzle2 } from "drizzle-orm/postgres-js";
import postgres2 from "postgres";
import { sql } from "drizzle-orm";
var DB_TYPE = process.env.DB_TYPE || "postgres";
var DB_CONNECTION_STRING2 = process.env.DB_CONNECTION_STRING || "postgresql://neondb_owner:npg_eFrPutD1n9dE@ep-aged-darkness-a1bh7bgl-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
var SESSION_SECRET = process.env.SESSION_SECRET || "seven-eleven-careers-secret";
var app = express3();
app.use(express3.json());
app.use(express3.urlencoded({ extended: false }));
var db2 = null;
if (DB_TYPE === "postgres") {
  try {
    console.log("Attempting to connect to PostgreSQL...");
    const queryClient2 = postgres2(DB_CONNECTION_STRING2, {
      ssl: "require",
      // Needed for Neon.tech
      max: 10,
      // Connection pool size
      idle_timeout: 20,
      // How long a connection can be idle before being closed
      connect_timeout: 30
      // Connection timeout in seconds
    });
    queryClient2`SELECT 1`.then(() => {
      console.log("PostgreSQL connection test successful");
      if (db2) {
        console.log("Testing database tables...");
        db2.select({ count: sql`count(*)` }).from(users).then((result) => console.log("Users table count:", result)).catch((error) => console.error("Users table test failed:", error));
        db2.select({ count: sql`count(*)` }).from(jobListings).then((result) => console.log("Jobs table count:", result)).catch((error) => console.error("Jobs table test failed:", error));
      }
    }).catch((error) => {
      console.error("PostgreSQL connection test failed:", error);
    });
    db2 = drizzle2(queryClient2);
    log("PostgreSQL database connection initialized");
  } catch (error) {
    console.error("Failed to initialize PostgreSQL connection:", error);
    log("Falling back to in-memory storage");
  }
}
var sessionConfig = {
  secret: SESSION_SECRET,
  resave: false,
  // proxy: true,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1e3
    // 24 hours
    //sameSite: 'lax'
  }
};
if (DB_TYPE === "postgres") {
  const PgStore = ConnectPgSimple(session2);
  sessionConfig.store = new PgStore({
    conString: DB_CONNECTION_STRING2,
    // Use the connection string directly
    tableName: "sessions",
    createTableIfMissing: true,
    ssl: true
  });
  log("Using PostgreSQL for session storage");
  setSessionStore(sessionConfig.store);
} else {
  const MemStore = MemoryStore2(session2);
  sessionConfig.store = new MemStore({
    checkPeriod: 864e5
    // prune expired entries every 24h
  });
  log("Using in-memory session storage");
}
app.use(session2(sessionConfig));
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
  if (db2) {
    req.db = db2;
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
export {
  DB_CONNECTION_STRING2 as DB_CONNECTION_STRING,
  DB_TYPE
};
