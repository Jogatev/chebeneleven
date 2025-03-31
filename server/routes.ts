import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertJobListingSchema, insertApplicationSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { sendApplicationConfirmation, sendStatusUpdateEmail } from "./email-service";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes (/api/register, /api/login, /api/logout, /api/user)
  setupAuth(app);

  // Job Listings Routes
  // Get all job listings (publicly accessible)
  app.get("/api/jobs", async (req, res) => {
    try {
      const jobs = await storage.getJobs();
      // Filter by active status for public view
      const activeJobs = jobs.filter(job => job.status === "active");
      res.json(activeJobs);
    } catch (error) {
      console.error("Error getting jobs:", error);
      res.status(500).json({ error: "Failed to retrieve job listings" });
    }
  });

  // Get job by ID (publicly accessible)
  app.get("/api/jobs/:id", async (req, res) => {
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

  // Get jobs by franchisee (requires auth)
  app.get("/api/my-jobs", async (req, res) => {
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

  // Create job listing (requires auth)
  app.post("/api/jobs", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      // Include the user ID from the authenticated user
      let jobData = { ...req.body, userId: req.user.id };
      
      // Manual date conversion for closingDate if it's a string
      if (jobData.closingDate && typeof jobData.closingDate === 'string') {
        try {
          jobData.closingDate = new Date(jobData.closingDate);
        } catch (error) {
          return res.status(400).json({ error: "Invalid closing date format" });
        }
      }
      
      // Validate the job data
      const parseResult = insertJobListingSchema.safeParse(jobData);
      if (!parseResult.success) {
        const validationError = fromZodError(parseResult.error);
        return res.status(400).json({ error: validationError.message });
      }
      
      const job = await storage.createJob(parseResult.data);
      res.status(201).json(job);
    } catch (error) {
      console.error("Error creating job:", error);
      res.status(500).json({ error: "Failed to create job listing" });
    }
  });

  // Update job listing (requires auth)
  app.patch("/api/jobs/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const jobId = parseInt(req.params.id);
      const job = await storage.getJobById(jobId);
      
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      
      // Check if the authenticated user owns this job
      if (job.userId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden: You do not own this job listing" });
      }
      
      const updatedJob = await storage.updateJob(jobId, req.body);
      res.json(updatedJob);
    } catch (error) {
      console.error("Error updating job:", error);
      res.status(500).json({ error: "Failed to update job listing" });
    }
  });

  // Delete job listing (requires auth)
  app.delete("/api/jobs/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const jobId = parseInt(req.params.id);
      const job = await storage.getJobById(jobId);
      
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      
      // Check if the authenticated user owns this job
      if (job.userId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden: You do not own this job listing" });
      }
      
      await storage.deleteJob(jobId);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting job:", error);
      res.status(500).json({ error: "Failed to delete job listing" });
    }
  });

  // Applications Routes
  // Submit a job application (publicly accessible)
  app.post("/api/applications", async (req, res) => {
    try {
      // Validate the application data
      const parseResult = insertApplicationSchema.safeParse(req.body);
      if (!parseResult.success) {
        const validationError = fromZodError(parseResult.error);
        return res.status(400).json({ error: validationError.message });
      }
      
      // Check if the job exists
      const job = await storage.getJobById(parseResult.data.jobId);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      
      // Check if the job is still active
      if (job.status !== "active") {
        return res.status(400).json({ error: "This job is no longer accepting applications" });
      }
      
      // Application will automatically get a reference ID in storage.createApplication
      const application = await storage.createApplication(parseResult.data);
      console.log("Application created successfully:", application);
      
      // Double check that the application was stored properly
      const allApplications = await storage.getApplications();
      console.log(`Total applications in storage: ${allApplications.length}`);
      
      // Send confirmation email with the reference ID
      try {
        const jobDetails = await storage.getJobById(application.jobId);
        if (jobDetails) {
          const emailResult = await sendApplicationConfirmation(
            application,
            jobDetails,
            application.referenceId
          );
          console.log("Application confirmation email sent:", emailResult);
        }
      } catch (emailError) {
        console.error("Error sending confirmation email:", emailError);
        // Don't fail the request if email fails
      }
      
      res.status(201).json(application);
    } catch (error) {
      console.error("Error creating application:", error);
      res.status(500).json({ error: "Failed to submit application" });
    }
  });

  // Get applications for a franchisee (requires auth)
  app.get("/api/my-applications", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const userId = req.user.id;
      console.log(`Getting applications for user ${userId}`);
      
      // Get all jobs for this user
      const userJobs = await storage.getJobsByUserId(userId);
      console.log(`User has ${userJobs.length} job listings:`, userJobs.map(j => j.id));
      
      if (userJobs.length === 0) {
        console.log("User has no jobs, returning empty applications array");
        return res.json([]);
      }
      
      const userJobIds = userJobs.map(job => job.id);
      
      // Get all applications directly
      const allApplications = await storage.getApplications();
      console.log(`Total applications in system: ${allApplications.length}`);
      
      if (allApplications.length === 0) {
        console.log("No applications found in storage");
        return res.json([]);
      }
      
      // Direct matching algorithm instead of using getApplicationsForUser
      const matchedApplications = [];
      
      for (const app of allApplications) {
        // Ensure jobId is a number for comparison
        const appJobId = typeof app.jobId === 'string' ? parseInt(app.jobId) : app.jobId;
        
        console.log(`Checking application ${app.id} for job ${appJobId}, user jobs: [${userJobIds.join(',')}]`);
        
        if (userJobIds.includes(appJobId)) {
          console.log(`Match found: Application ${app.id} matches job ${appJobId}`);
          // Ensure application has a status
          if (!app.status) {
            app.status = 'submitted';
          }
          matchedApplications.push({
            ...app,
            jobId: appJobId // Ensure jobId is a number
          });
        }
      }
      
      console.log(`Found ${matchedApplications.length} applications for user's jobs`);
      
      if (matchedApplications.length === 0) {
        console.log("No applications found for user's jobs after direct matching");
        return res.json([]);
      }
      
      // Return with job information joined
      const applicationsWithJobInfo = await Promise.all(
        matchedApplications.map(async (app) => {
          const job = await storage.getJobById(app.jobId);
          
          return {
            ...app,
            jobTitle: job ? job.title : 'Unknown Job',
            jobLocation: job ? job.location : 'Unknown Location',
            status: app.status || 'submitted' // Ensure status exists
          };
        })
      );
      
      console.log(`Returning ${applicationsWithJobInfo.length} applications with job info`);
      res.json(applicationsWithJobInfo);
    } catch (error) {
      console.error("Error getting applications:", error);
      res.status(500).json({ error: "Failed to retrieve applications" });
    }
  });
  
  // For debugging - get all applications in the system
  app.get("/api/debug/all-applications", async (req, res) => {
    try {
      const allApplications = await storage.getApplications();
      
      // Debug each application's jobId and type
      const appsWithTypes = allApplications.map(app => ({
        ...app,
        jobId_type: typeof app.jobId
      }));
      
      res.json({
        count: allApplications.length,
        applications: appsWithTypes
      });
    } catch (error) {
      console.error("Error getting all applications:", error);
      res.status(500).json({ error: "Failed to retrieve applications" });
    }
  });
  
  // Special debug endpoint for franchisee applications
  app.get("/api/debug/my-applications/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      // First get all jobs for this user
      const userJobs = await storage.getJobsByUserId(userId);
      const userJobIds = userJobs.map(job => job.id);
      
      // Get all applications
      const allApplications = await storage.getApplications();
      
      // Debug info about applications and matching
      const debugInfo: {
        userId: number;
        userJobs: any[];
        userJobIds: number[];
        allApplications: any[];
        matchedApplications: any[];
      } = {
        userId: userId,
        userJobs: userJobs,
        userJobIds: userJobIds,
        allApplications: allApplications,
        matchedApplications: []
      };
      
      // Manual matching to debug the issue
      const matchedApps: any[] = [];
      
      for (const app of allApplications) {
        const appJobId = typeof app.jobId === 'string' ? parseInt(app.jobId) : app.jobId;
        
        console.log(`Checking application ${app.id} for job ${appJobId}, user jobs are: ${userJobIds.join(',')}`);
        
        if (userJobIds.includes(appJobId)) {
          console.log(`Match found: Application ${app.id} matches job ${appJobId}`);
          matchedApps.push({
            ...app,
            matched: true,
            appJobId_type: typeof app.jobId,
            appJobId_converted: appJobId
          });
        } else {
          console.log(`No match: Application ${app.id} with job ${appJobId} doesn't match user jobs`);
        }
      }
      
      debugInfo.matchedApplications = matchedApps;
      
      res.json(debugInfo);
    } catch (error) {
      console.error("Error in debug endpoint:", error);
      res.status(500).json({ error: "Debug operation failed" });
    }
  });
  
  // For debugging - create a test application
  app.get("/api/debug/create-test-application/:jobId", async (req, res) => {
    try {
      const jobId = parseInt(req.params.jobId);
      
      // Verify the job exists
      const job = await storage.getJobById(jobId);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      
      // Create a test application
      const testApplication = {
        jobId: jobId,
        referenceId: `TEST-${Date.now()}`, // Add a reference ID for testing
        firstName: "Test",
        lastName: "Applicant",
        email: "test@example.com",
        phone: "123-456-7890",
        address: "123 Test St",
        city: "Test City",
        zipCode: "12345",
        resumeUrl: "",
        experience: "3 years of experience in test applications",
        education: "Bachelor's in Testing",
        coverLetter: "This is a test application created for debugging",
        availableShifts: ["morning", "evening"],
        status: "submitted"
      };
      
      const createdApplication = await storage.createApplication(testApplication);
      
      // Check that the application was linked to the job correctly
      const jobApplications = await storage.getApplicationsByJobId(jobId);
      const userApplications = await storage.getApplicationsForUser(job.userId);
      
      res.json({
        createdApplication,
        jobApplicationsCount: jobApplications.length,
        userApplicationsCount: userApplications.length,
        jobOwner: job.userId
      });
    } catch (error) {
      console.error("Error creating test application:", error);
      res.status(500).json({ error: "Failed to create test application" });
    }
  });

  // Get applications for a specific job (requires auth)
  app.get("/api/jobs/:id/applications", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const jobId = parseInt(req.params.id);
      const job = await storage.getJobById(jobId);
      
      // Check if job exists
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      
      // Check if the authenticated user owns this job
      if (job.userId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden: You do not own this job listing" });
      }
      
      const applications = await storage.getApplicationsByJobId(jobId);
      res.json(applications);
    } catch (error) {
      console.error("Error getting job applications:", error);
      res.status(500).json({ error: "Failed to retrieve applications for this job" });
    }
  });

  // Update application status (requires auth)
  app.patch("/api/applications/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const applicationId = parseInt(req.params.id);
      const application = await storage.getApplicationById(applicationId);
      
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      
      // Get the job to check ownership
      const job = await storage.getJobById(application.jobId);
      
      if (!job) {
        return res.status(404).json({ error: "Associated job not found" });
      }
      
      // Check if the authenticated user owns the job this application is for
      if (job.userId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden: You do not own this job listing" });
      }
      
      // Only allow status updates
      if (!req.body.status) {
        return res.status(400).json({ error: "Status field is required" });
      }
      
      // Validate status value
      const validStatuses = ["submitted", "under_review", "interviewed", "accepted", "rejected"];
      if (!validStatuses.includes(req.body.status)) {
        return res.status(400).json({ error: "Invalid status value" });
      }
      
      const updatedApplication = await storage.updateApplication(applicationId, { status: req.body.status });
      
      if (!updatedApplication) {
        return res.status(404).json({ error: "Failed to update application" });
      }
      
      // Send status update email notification
      try {
        // Only send emails for significant status changes (not every review status)
        const significantStatuses = ["under_review", "interviewed", "accepted", "rejected"];
        if (significantStatuses.includes(req.body.status)) {
          const emailResult = await sendStatusUpdateEmail(
            updatedApplication,
            job,
            updatedApplication.referenceId,
            req.body.status
          );
          console.log(`Status update email sent for application ${applicationId}:`, emailResult);
        }
      } catch (emailError) {
        console.error("Error sending status update email:", emailError);
        // Don't fail the request if email fails
      }
      
      res.json(updatedApplication);
    } catch (error) {
      console.error("Error updating application:", error);
      res.status(500).json({ error: "Failed to update application" });
    }
  });
  
  // Application notes
  app.post("/api/applications/:id/notes", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const applicationId = parseInt(req.params.id);
      const { note } = req.body;
      
      if (!note) {
        return res.status(400).json({ error: "Note content is required" });
      }
      
      // Check if application exists and user has permission
      const application = await storage.getApplicationById(applicationId);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      
      // Get the job to check ownership
      const job = await storage.getJobById(application.jobId);
      if (!job) {
        return res.status(404).json({ error: "Associated job not found" });
      }
      
      // Check if the authenticated user owns the job this application is for
      if (job.userId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden: You do not own this job listing" });
      }
      
      const success = await storage.saveApplicationNote(applicationId, note);
      if (!success) {
        return res.status(404).json({ error: "Failed to save note" });
      }
      
      res.status(201).json({ message: "Note saved successfully" });
    } catch (error) {
      console.error("Error saving application note:", error);
      res.status(500).json({ error: "Failed to save note" });
    }
  });

  app.get("/api/applications/:id/notes", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const applicationId = parseInt(req.params.id);
      
      // Check if application exists and user has permission
      const application = await storage.getApplicationById(applicationId);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      
      // Get the job to check ownership
      const job = await storage.getJobById(application.jobId);
      if (!job) {
        return res.status(404).json({ error: "Associated job not found" });
      }
      
      // Check if the authenticated user owns the job this application is for
      if (job.userId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden: You do not own this job listing" });
      }
      
      const note = await storage.getApplicationNote(applicationId);
      res.json({ note: note || "" });
    } catch (error) {
      console.error("Error getting application note:", error);
      res.status(500).json({ error: "Failed to retrieve note" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
