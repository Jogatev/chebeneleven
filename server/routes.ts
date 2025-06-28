import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./unified-storage";
import { setupAuth } from "./auth";
import { insertJobListingSchema, insertApplicationSchema, insertActivitySchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { sendApplicationConfirmation, sendStatusUpdateEmail } from "./email-service";
import { config, getApiPath } from "./config";
import { API_ENDPOINTS } from "@shared/api-endpoints";

export async function registerRoutes(app: Express): Promise<Server> {
  console.log("Starting route registration...");
  
  app.get(getApiPath(API_ENDPOINTS.TEST), (req, res) => {
    console.log("Test route accessed");
    res.json({ message: "Test route working!" });
  });
  setupAuth(app);

app.get(getApiPath(API_ENDPOINTS.JOBS.LIST), async (req, res) => {
  try {
    const jobs = await storage.getJobs();
    const activeJobs = jobs.filter(job => job.status === "active");
    res.json(activeJobs);
  } catch (error) {
    console.error("Error getting jobs:", error);
    res.status(500).json({ error: "Failed to retrieve job listings" });
  }
});

app.post(getApiPath(API_ENDPOINTS.JOBS.ARCHIVE(":id")), async (req, res) => {
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

  app.get(getApiPath(API_ENDPOINTS.JOBS.GET_BY_ID(":id")), async (req, res) => {
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

  app.get(getApiPath(API_ENDPOINTS.JOBS.MY_JOBS), async (req, res) => {
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

  app.post(getApiPath(API_ENDPOINTS.JOBS.CREATE), async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      let jobData = { ...req.body, userId: req.user.id };
      
      if (jobData.closingDate && typeof jobData.closingDate === 'string') {
        try {
          jobData.closingDate = new Date(jobData.closingDate);
        } catch (error) {
          return res.status(400).json({ error: "Invalid closing date format" });
        }
      }
      
      const parseResult = insertJobListingSchema.safeParse(jobData);
      if (!parseResult.success) {
        const validationError = fromZodError(parseResult.error);
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

  app.patch(getApiPath(API_ENDPOINTS.JOBS.UPDATE(":id")), async (req, res) => {
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
      } 
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
              updatedFields: Object.keys(req.body)
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

  app.delete(getApiPath(API_ENDPOINTS.JOBS.DELETE(":id")), async (req, res) => {
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

  app.post(getApiPath(API_ENDPOINTS.APPLICATIONS.CREATE), async (req, res) => {
    try {
      const parseResult = insertApplicationSchema.safeParse(req.body);
      if (!parseResult.success) {
        const validationError = fromZodError(parseResult.error);
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

  app.get(getApiPath(API_ENDPOINTS.APPLICATIONS.MY_APPLICATIONS), async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const userId = req.user.id;
      console.log(`Getting applications for user ${userId}`);
      
      const userJobs = await storage.getJobsByUserId(userId);
      console.log(`User has ${userJobs.length} job listings:`, userJobs.map(j => j.id));
      
      if (userJobs.length === 0) {
        console.log("User has no jobs, returning empty applications array");
        return res.json([]);
      }
      
      const userJobIds = userJobs.map(job => job.id);
      
      const allApplications = await storage.getApplications();
      console.log(`Total applications in system: ${allApplications.length}`);
      
      if (allApplications.length === 0) {
        console.log("No applications found in storage");
        return res.json([]);
      }
      
      const matchedApplications = [];
      
      for (const app of allApplications) {
        const appJobId = typeof app.jobId === 'string' ? parseInt(app.jobId) : app.jobId;
        
        console.log(`Checking application ${app.id} for job ${appJobId}, user jobs: [${userJobIds.join(',')}]`);
        
        if (userJobIds.includes(appJobId)) {
          console.log(`Match found: Application ${app.id} matches job ${appJobId}`);
          if (!app.status) {
            app.status = 'submitted';
          }
          matchedApplications.push({
            ...app,
            jobId: appJobId
          });
        }
      }
      
      console.log(`Found ${matchedApplications.length} applications for user's jobs`);
      
      if (matchedApplications.length === 0) {
        return res.json([]);
      }
      
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

  app.get(getApiPath(API_ENDPOINTS.APPLICATIONS.JOB(":jobId")), async (req, res) => {
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
      const jobApplications = allApplications.filter(app => {
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

  app.get(getApiPath(API_ENDPOINTS.APPLICATIONS.GET(":id")), async (req, res) => {
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

  app.patch(getApiPath(API_ENDPOINTS.APPLICATIONS.UPDATE(":id")), async (req, res) => {
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

  app.get(getApiPath(API_ENDPOINTS.ACTIVITIES.MY_ACTIVITIES), async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const userId = req.user.id;
      const activities = await storage.getActivitiesByUserId(userId);
      
      activities.sort((a, b) => {
        const dateA = new Date(a.timestamp || 0).getTime();
        const dateB = new Date(b.timestamp || 0).getTime();
        return dateB - dateA;
      });
      
      res.json(activities);
    } catch (error) {
      console.error("Error getting activities:", error);
      res.status(500).json({ error: "Failed to retrieve activities" });
    }
  });

  app.post(getApiPath(API_ENDPOINTS.ACTIVITIES.CREATE), async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const activityData = { ...req.body, userId: req.user.id };
      
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

  const server = createServer(app);
  return server;
} 