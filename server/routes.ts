import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertJobListingSchema, insertApplicationSchema, insertActivitySchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { sendApplicationConfirmation, sendStatusUpdateEmail } from "./email-service";

export async function registerRoutes(app: Express): Promise<Server> {
  console.log("Starting route registration...");
  
  // Simple test route
  app.get("/api/test", (req, res) => {
    console.log("Test route accessed");
    res.json({ message: "Test route working!" });
  });
  
  // Set up authentication routes (/api/register, /api/login, /api/logout, /api/user)
  setupAuth(app);

  // Job Listings Routes
  // Get all job listings (publicly accessible)
 // Get all job listings (publicly accessible)
app.get("/api/jobs", async (req, res) => {
  try {
    const jobs = await storage.getJobs();
    // Filter by active status for public view, excluding archived jobs
    const activeJobs = jobs.filter(job => job.status === "active");
    res.json(activeJobs);
  } catch (error) {
    console.error("Error getting jobs:", error);
    res.status(500).json({ error: "Failed to retrieve job listings" });
  }
});

// If you want a specific archive endpoint, add this:
app.post("/api/jobs/:id/archive", async (req, res) => {
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
    
    // Check if job is already archived
    if (job.status === "archived") {
      return res.status(400).json({ error: "Job is already archived" });
    }
    
    // Archive the job
    const updatedJob = await storage.updateJob(jobId, { status: "archived" });
    
    // Log the archive activity
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

      // Log the activity with debugging
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

      // Log the activity if status was updated
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
      } 
      // Log other updates
      else if (Object.keys(req.body).length > 0) {
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
      
      // Log the activity before deleting the job
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
      let emailResult = null;
      try {
        if (application.email) {
          // Make sure we have job details
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
        
        // Log activity for the job owner (franchisee)
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
        // Don't fail the request if email fails
      }
      
      // Include email status in response
      res.status(201).json({
        ...application,
        notificationSent: emailResult?.success || false
      });
      
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
        return res.json([]);
      }
      
      // Add job details to each application
      const applicationsWithJobDetails = await Promise.all(
        matchedApplications.map(async (app) => {
          const job = await storage.getJobById(app.jobId);
          return {
            ...app,
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

  // Get applications for a specific job (requires auth)
  app.get("/api/applications/job/:jobId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const jobId = parseInt(req.params.jobId);
      const job = await storage.getJobById(jobId);
      
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      
      // Check if the authenticated user owns this job
      if (job.userId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden: You do not own this job listing" });
      }
      
      // Get applications for this job
      const allApplications = await storage.getApplications();
      const jobApplications = allApplications.filter(app => {
        // Ensure jobId is a number for comparison
        const appJobId = typeof app.jobId === 'string' ? parseInt(app.jobId) : app.jobId;
        return appJobId === jobId;
      });
      
      console.log(`Found ${jobApplications.length} applications for job ${jobId}`);
      
      res.json(jobApplications);
    } catch (error) {
      console.error(`Error getting applications for job ${req.params.jobId}:`, error);
      res.status(500).json({ error: "Failed to retrieve applications" });
    }
  });

  // Get application by ID (requires auth)
  app.get("/api/applications/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const applicationId = parseInt(req.params.id);
      const application = await storage.getApplicationById(applicationId);
      
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      
      // Check if the authenticated user owns the job this application is for
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
      
      // Check if the authenticated user owns the job this application is for
      const job = await storage.getJobById(application.jobId);
      if (!job || job.userId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden: You do not own this job listing" });
      }
      
      console.log(`Updating application ${applicationId} with data:`, req.body);
      const { status } = req.body;
      
      // Validate status (only status updates supported for now)
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
      
      // Log the activity
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
      
      // Send status update email to applicant
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
        // Don't fail the request if email fails
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

  // Activities routes
  // Get activities for a franchisee (requires auth)
  app.get("/api/my-activities", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const userId = req.user.id;
      const activities = await storage.getActivitiesByUserId(userId);
      
      // Sort activities by createdAt descending (newest first)
      activities.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });
      
      res.json(activities);
    } catch (error) {
      console.error("Error getting activities:", error);
      res.status(500).json({ error: "Failed to retrieve activities" });
    }
  });

  // Create an activity log (requires auth)
  app.post("/api/activities", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      // Include the user ID from the authenticated user
      const activityData = { ...req.body, userId: req.user.id };
      
      // Validate the activity data
      const parseResult = insertActivitySchema.safeParse(activityData);
      if (!parseResult.success) {
        const validationError = fromZodError(parseResult.error);
        return res.status(400).json({ error: validationError.message });
      }
      
      const activity = await storage.createActivity(parseResult.data);
      res.status(201).json(activity);
    } catch (error) {
      console.error("Error creating activity:", error);
      res.status(500).json({ error: "Failed to create activity log" });
    }
  });

  // Start the server
  const server = createServer(app);
  return server;
}