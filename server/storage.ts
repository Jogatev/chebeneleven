import { 
  users, 
  type User, 
  type InsertUser, 
  jobListings, 
  type JobListing, 
  type InsertJobListing,
  applications,
  type Application,
  type InsertApplication,
  activities,
  type Activity,
  type InsertActivity
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { v4 as uuidv4 } from 'uuid';

// Create the memory store
const MemoryStore = createMemoryStore(session);

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  
  // Job listing operations
  getJobs(): Promise<JobListing[]>;
  getJobsByUserId(userId: number): Promise<JobListing[]>;
  getJobById(id: number): Promise<JobListing | undefined>;
  createJob(job: InsertJobListing): Promise<JobListing>;
  updateJob(id: number, job: Partial<JobListing>): Promise<JobListing | undefined>;
  deleteJob(id: number): Promise<boolean>;
  
  // Application operations
  getApplications(): Promise<Application[]>;
  getApplicationsByJobId(jobId: number): Promise<Application[]>;
  getApplicationsForUser(userId: number): Promise<Application[]>;
  getApplicationById(id: number): Promise<Application | undefined>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplication(id: number, application: Partial<Application>): Promise<Application | undefined>;
  
  // Application notes operations
  saveApplicationNote(applicationId: number, note: string): Promise<boolean>;
  getApplicationNote(applicationId: number): Promise<string | undefined>;
  
  // Activity operations
  getActivities(): Promise<Activity[]>;
  getActivitiesByUserId(userId: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Session store for authentication
  sessionStore: any;
}

// In-memory implementation of the storage interface
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private jobs: Map<number, JobListing>;
  private applications: Map<number, Application>;
  private activities: Map<number, Activity>;
  private notes: Map<number, string>; // Store application notes
  currentUserId: number;
  currentJobId: number;
  currentApplicationId: number;
  currentActivityId: number;
  sessionStore: any;

  constructor() {
    this.users = new Map();
    this.jobs = new Map();
    this.applications = new Map();
    this.activities = new Map();
    this.notes = new Map(); // Initialize notes map
    this.currentUserId = 1;
    this.currentJobId = 1;
    this.currentApplicationId = 1;
    this.currentActivityId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Job listing methods
  async getJobs(): Promise<JobListing[]> {
    return Array.from(this.jobs.values());
  }

  async getJobsByUserId(userId: number): Promise<JobListing[]> {
    return Array.from(this.jobs.values()).filter(
      (job) => job.userId === userId,
    );
  }

  async getJobById(id: number): Promise<JobListing | undefined> {
    return this.jobs.get(id);
  }

  async createJob(insertJob: InsertJobListing): Promise<JobListing> {
    const id = this.currentJobId++;
    const now = new Date();
    const job: JobListing = { 
      ...insertJob, 
      id, 
      createdAt: now,
      tags: Array.isArray(insertJob.tags) ? insertJob.tags : [] as string[]
    };
    this.jobs.set(id, job);
    return job;
  }

  async updateJob(id: number, updates: Partial<JobListing>): Promise<JobListing | undefined> {
    const job = this.jobs.get(id);
    if (!job) return undefined;
    
    const updatedJob = { ...job, ...updates };
    this.jobs.set(id, updatedJob);
    return updatedJob;
  }

  async deleteJob(id: number): Promise<boolean> {
    return this.jobs.delete(id);
  }

  // Helper method to generate application reference IDs
  private generateReferenceId(): string {
    // Format: SEV-YYYY-XXXXX, where YYYY is the current year and XXXXX is a random string
    const year = new Date().getFullYear();
    const randomPart = uuidv4().substring(0, 5).toUpperCase();
    return `SEV-${year}-${randomPart}`;
  }

  // Application methods
  async getApplications(): Promise<Application[]> {
    return Array.from(this.applications.values());
  }

  async getApplicationsByJobId(jobId: number): Promise<Application[]> {
    // Get all applications
    const allApplications = Array.from(this.applications.values());
    
    console.log(`Looking for applications for job ID ${jobId}, total applications: ${allApplications.length}`);
    
    // Filter to only applications for this job, with type conversion safety
    const applications = allApplications.filter(app => {
      const appJobId = typeof app.jobId === 'string' ? parseInt(app.jobId) : app.jobId;
      const result = appJobId === jobId;
      console.log(`Comparing application jobId ${app.jobId} (${typeof app.jobId}) with requested jobId ${jobId}: ${result}`);
      return result;
    });
    
    console.log(`Found ${applications.length} applications for job ID ${jobId}`);
    
    // Ensure all applications have a status field
    return applications.map(app => {
      if (!app.status) {
        return { ...app, status: 'submitted' };
      }
      return app;
    });
  }

  async getApplicationsForUser(userId: number): Promise<Application[]> {
    // Get jobs owned by this user
    const userJobs = await this.getJobsByUserId(userId);
    
    if (userJobs.length === 0) {
      console.log(`User ${userId} has no jobs, returning empty applications array`);
      return [];
    }
    
    const userJobIds = userJobs.map(job => job.id);
    console.log(`User ${userId} job IDs:`, userJobIds);
    
    // Get all applications
    const allApplications = Array.from(this.applications.values());
    console.log(`Total applications in system: ${allApplications.length}`);
    
    if (allApplications.length === 0) {
      console.log("No applications found in storage");
      return [];
    }
    
    // Debug each application in the system
    allApplications.forEach(app => {
      const jobIdType = typeof app.jobId;
      console.log(`Application ID: ${app.id}, jobId: ${app.jobId} (type: ${jobIdType}), status: ${app.status || 'submitted'}`);
    });
    
    // Get applications for those jobs - ensure consistent type checking for jobId
    const userApplications = allApplications.filter(app => {
      // Convert both to numbers to ensure consistent comparison
      const appJobId = Number(app.jobId);
      return userJobIds.includes(appJobId);
    });
    
    console.log(`Applications for user ${userId}'s jobs: ${userApplications.length}`);
    
    // Ensure all applications have a status
    const normalizedApplications = userApplications.map(app => {
      if (!app.status) {
        return { ...app, status: 'submitted' };
      }
      return app;
    });
    
    return normalizedApplications;
  }

  async getApplicationById(id: number): Promise<Application | undefined> {
    return this.applications.get(id);
  }

  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const id = this.currentApplicationId++;
    const now = new Date();
    
    // Ensure jobId is a number
    const jobId = typeof insertApplication.jobId === 'string' 
      ? parseInt(insertApplication.jobId) 
      : insertApplication.jobId;
    
    // Generate a unique reference ID for the application
    const referenceId = insertApplication.referenceId || this.generateReferenceId();
    
    console.log(`Creating application with jobId: ${jobId}, referenceId: ${referenceId}`);
    
    const application: Application = { 
      ...insertApplication, 
      id, 
      jobId, // Make sure jobId is a number
      referenceId, // Add the reference ID
      submittedAt: now,
      availableShifts: Array.isArray(insertApplication.availableShifts) ? insertApplication.availableShifts : [] as string[]
    };
    
    this.applications.set(id, application);
    
    // Double-check what's stored
    const storedApp = this.applications.get(id);
    console.log(`Stored application jobId: ${storedApp?.jobId}, referenceId: ${storedApp?.referenceId}`);
    
    return application;
  }

  async updateApplication(id: number, updates: Partial<Application>): Promise<Application | undefined> {
    const application = this.applications.get(id);
    if (!application) return undefined;
    
    const updatedApplication = { ...application, ...updates };
    this.applications.set(id, updatedApplication);
    return updatedApplication;
  }
  
  // Notes methods
  async saveApplicationNote(applicationId: number, note: string): Promise<boolean> {
    if (!this.applications.has(applicationId)) return false;
    this.notes.set(applicationId, note);
    return true;
  }
  
  async getApplicationNote(applicationId: number): Promise<string | undefined> {
    return this.notes.get(applicationId);
  }

  // Activity methods
  async getActivities(): Promise<Activity[]> {
    return Array.from(this.activities.values());
  }

  async getActivitiesByUserId(userId: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.currentActivityId++;
    const now = new Date();
    const activity: Activity = { 
      ...insertActivity, 
      id, 
      timestamp: now
    };
    this.activities.set(id, activity);
    return activity;
  }
}

export const storage = new MemStorage();