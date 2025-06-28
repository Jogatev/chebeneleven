import type { User, InsertUser, JobListing, InsertJobListing, Application, InsertApplication, Activity, InsertActivity } from '@shared/schema';
import session from "express-session";
import createMemoryStore from "memorystore";
import { v4 as uuidv4 } from 'uuid';

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  
  getJobs(): Promise<JobListing[]>;
  getJobsByUserId(userId: number): Promise<JobListing[]>;
  getJobById(id: number): Promise<JobListing | undefined>;
  createJob(job: InsertJobListing): Promise<JobListing>;
  updateJob(id: number, job: Partial<JobListing>): Promise<JobListing | undefined>;
  deleteJob(id: number): Promise<boolean>;
  
  getApplications(): Promise<Application[]>;
  getApplicationsByJobId(jobId: number): Promise<Application[]>;
  getApplicationsForUser(userId: number): Promise<Application[]>;
  getApplicationById(id: number): Promise<Application | undefined>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplication(id: number, application: Partial<Application>): Promise<Application | undefined>;
  
  saveApplicationNote(applicationId: number, note: string): Promise<boolean>;
  getApplicationNote(applicationId: number): Promise<string | undefined>;
  
  getActivities(): Promise<Activity[]>;
  getActivitiesByUserId(userId: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  sessionStore: any;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private jobs: Map<number, JobListing>;
  private applications: Map<number, Application>;
  private activities: Map<number, Activity>;
  private notes: Map<number, string>;
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
    this.notes = new Map();
    this.currentUserId = 1;
    this.currentJobId = 1;
    this.currentApplicationId = 1;
    this.currentActivityId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

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

  private generateReferenceId(): string {
    const year = new Date().getFullYear();
    const randomPart = uuidv4().substring(0, 5).toUpperCase();
    return `SEV-${year}-${randomPart}`;
  }

  async getApplications(): Promise<Application[]> {
    return Array.from(this.applications.values());
  }

  async getApplicationsByJobId(jobId: number): Promise<Application[]> {
    const allApplications = Array.from(this.applications.values());
    
    console.log(`Looking for applications for job ID ${jobId}, total applications: ${allApplications.length}`);
    
    const applications = allApplications.filter(app => {
      const appJobId = typeof app.jobId === 'string' ? parseInt(app.jobId) : app.jobId;
      const result = appJobId === jobId;
      console.log(`Comparing application jobId ${app.jobId} (${typeof app.jobId}) with requested jobId ${jobId}: ${result}`);
      return result;
    });
    
    console.log(`Found ${applications.length} applications for job ID ${jobId}`);
    
    return applications.map(app => {
      if (!app.status) {
        return { ...app, status: 'submitted' };
      }
      return app;
    });
  }

  async getApplicationsForUser(userId: number): Promise<Application[]> {
    const userJobs = await this.getJobsByUserId(userId);
    
    if (userJobs.length === 0) {
      console.log(`User ${userId} has no jobs, returning empty applications array`);
      return [];
    }
    
    const userJobIds = userJobs.map(job => job.id);
    console.log(`User ${userId} job IDs:`, userJobIds);
    
    const allApplications = Array.from(this.applications.values());
    console.log(`Total applications in system: ${allApplications.length}`);
    
    if (allApplications.length === 0) {
      console.log("No applications found in storage");
      return [];
    }
    
    allApplications.forEach(app => {
      const jobIdType = typeof app.jobId;
      console.log(`Application ID: ${app.id}, jobId: ${app.jobId} (type: ${jobIdType}), status: ${app.status || 'submitted'}`);
    });
    
    const matchedApplications = [];
    
    for (const app of allApplications) {
      const appJobId = typeof app.jobId === 'string' ? parseInt(app.jobId) : app.jobId;
      
      if (userJobIds.includes(appJobId)) {
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
    return matchedApplications;
  }

  async getApplicationById(id: number): Promise<Application | undefined> {
    return this.applications.get(id);
  }

  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const id = this.currentApplicationId++;
    const now = new Date();
    const referenceId = this.generateReferenceId();
    
    const application: Application = {
      ...insertApplication,
      id,
      jobId: typeof insertApplication.jobId === 'string' ? parseInt(insertApplication.jobId) : insertApplication.jobId,
      referenceId,
      submittedAt: now,
      status: insertApplication.status || 'submitted',
      availableShifts: Array.isArray(insertApplication.availableShifts) ? insertApplication.availableShifts : [],
      workAvailability: insertApplication.workAvailability || {
        holidayWork: false,
        weekdayWork: false,
        weekendWork: false,
        morningShift: false,
        afternoonShift: false,
        nightShift: false,
      }
    };
    
    this.applications.set(id, application);
    console.log(`Application created with ID ${id}, reference ID ${referenceId}`);
    return application;
  }

  async updateApplication(id: number, updates: Partial<Application>): Promise<Application | undefined> {
    const application = this.applications.get(id);
    if (!application) return undefined;
    
    const updatedApplication = { ...application, ...updates };
    this.applications.set(id, updatedApplication);
    return updatedApplication;
  }

  async saveApplicationNote(applicationId: number, note: string): Promise<boolean> {
    this.notes.set(applicationId, note);
    return true;
  }

  async getApplicationNote(applicationId: number): Promise<string | undefined> {
    return this.notes.get(applicationId);
  }

  async getActivities(): Promise<Activity[]> {
    return Array.from(this.activities.values());
  }

  async getActivitiesByUserId(userId: number): Promise<Activity[]> {
    return Array.from(this.activities.values()).filter(
      (activity) => activity.userId === userId,
    );
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.currentActivityId++;
    const now = new Date();
    const activity: Activity = { ...insertActivity, id, timestamp: now };
    this.activities.set(id, activity);
    return activity;
  }
} 