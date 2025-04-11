import { db } from './connection';
import { 
  users as usersTable, 
  jobListings as jobListingsTable, 
  applications as applicationsTable, 
  activities as activitiesTable,
  type User, 
  type JobListing, 
  type Application, 
  type Activity, 
  type InsertUser, 
  type InsertJobListing, 
  type InsertApplication, 
  type InsertActivity 
} from "@shared/schema";
import { eq, and, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { sql } from 'drizzle-orm';

import { IStorage } from './storage';
import createMemoryStore from "memorystore";
import session from "express-session";

// Create the memory store for sessions
const MemoryStore = createMemoryStore(session);

// Export the storage class
export class PostgresStorage implements IStorage {
  sessionStore: any;

  constructor() {
    console.log('PostgresStorage constructor called');
    this.sessionStore = null; // This will be set from index.ts
  }

  setSessionStore(store: any) {
    console.log('Setting session store');
    this.sessionStore = store;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    try {
      console.log(`Getting user ${id} from PostgreSQL`);
      const users = await db.select().from(usersTable).where(eq(usersTable.id, id));
      console.log(`User found: ${users.length > 0}`);
      return users[0];
    } catch (error) {
      console.error('PostgreSQL error in getUser:', error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      console.log(`Getting user by username ${username} from PostgreSQL`);
      const users = await db.select().from(usersTable).where(eq(usersTable.username, username));
      console.log(`User found: ${users.length > 0}`);
      return users[0];
    } catch (error) {
      console.error('PostgreSQL error in getUserByUsername:', error);
      throw error;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      console.log('Creating user in PostgreSQL');
      const users = await db.insert(usersTable).values(insertUser).returning();
      console.log('User created in PostgreSQL');
      return users[0];
    } catch (error) {
      console.error('PostgreSQL error in createUser:', error);
      throw error;
    }
  }

  async getUsers(): Promise<User[]> {
    try {
      console.log('Getting all users from PostgreSQL');
      const users = await db.select().from(usersTable);
      console.log(`Retrieved ${users.length} users from PostgreSQL`);
      return users;
    } catch (error) {
      console.error('PostgreSQL error in getUsers:', error);
      throw error;
    }
  }

  // Job methods
  async getJobs(): Promise<JobListing[]> {
    try {
      console.log('Getting all jobs from PostgreSQL');
      const jobs = await db.select().from(jobListingsTable).orderBy(desc(jobListingsTable.createdAt));
      console.log(`Retrieved ${jobs.length} jobs from PostgreSQL`);
      return jobs;
    } catch (error) {
      console.error('PostgreSQL error in getJobs:', error);
      throw error;
    }
  }

  async getJobById(id: number): Promise<JobListing | undefined> {
    try {
      console.log(`Getting job ${id} from PostgreSQL`);
      const jobs = await db.select().from(jobListingsTable).where(eq(jobListingsTable.id, id));
      console.log(`Job found: ${jobs.length > 0}`);
      return jobs[0];
    } catch (error) {
      console.error('PostgreSQL error in getJobById:', error);
      throw error;
    }
  }

  async getJobsByUserId(userId: number): Promise<JobListing[]> {
    try {
      console.log(`Getting jobs for user ${userId} from PostgreSQL`);
      const jobs = await db.select().from(jobListingsTable).where(eq(jobListingsTable.userId, userId));
      console.log(`Retrieved ${jobs.length} jobs for user ${userId} from PostgreSQL`);
      return jobs;
    } catch (error) {
      console.error('PostgreSQL error in getJobsByUserId:', error);
      throw error;
    }
  }

  async createJob(insertJob: InsertJobListing): Promise<JobListing> {
    try {
      console.log('Creating job in PostgreSQL:', JSON.stringify(insertJob));
      const jobs = await db.insert(jobListingsTable).values(insertJob).returning();
      console.log('Job created in PostgreSQL:', JSON.stringify(jobs[0]));
      return jobs[0];
    } catch (error) {
      console.error('PostgreSQL error in createJob:', error);
      console.error('Error details:', error.message);
      throw error;
    }
  }

  async updateJob(id: number, updateData: Partial<JobListing>): Promise<JobListing | undefined> {
    try {
      console.log(`Updating job ${id} in PostgreSQL:`, JSON.stringify(updateData));
      const jobs = await db
        .update(jobListingsTable)
        .set(updateData)
        .where(eq(jobListingsTable.id, id))
        .returning();
      console.log('Job updated in PostgreSQL');
      return jobs[0];
    } catch (error) {
      console.error('PostgreSQL error in updateJob:', error);
      throw error;
    }
  }

  async deleteJob(id: number): Promise<boolean> {
    try {
      console.log(`Deleting job ${id} from PostgreSQL`);
      await db.delete(jobListingsTable).where(eq(jobListingsTable.id, id));
      console.log('Job deleted from PostgreSQL');
      return true;
    } catch (error) {
      console.error('PostgreSQL error in deleteJob:', error);
      throw error;
    }
  }

  // Application methods
  async getApplications(): Promise<Application[]> {
    try {
      console.log('Getting all applications from PostgreSQL');
      const applications = await db.select().from(applicationsTable).orderBy(desc(applicationsTable.submittedAt));
      console.log(`Retrieved ${applications.length} applications from PostgreSQL`);
      return applications;
    } catch (error) {
      console.error('PostgreSQL error in getApplications:', error);
      throw error;
    }
  }

  async getApplicationById(id: number): Promise<Application | undefined> {
    try {
      console.log(`Getting application ${id} from PostgreSQL`);
      const applications = await db.select().from(applicationsTable).where(eq(applicationsTable.id, id));
      console.log(`Application found: ${applications.length > 0}`);
      return applications[0];
    } catch (error) {
      console.error('PostgreSQL error in getApplicationById:', error);
      throw error;
    }
  }

  async getApplicationsByJobId(jobId: number): Promise<Application[]> {
    try {
      console.log(`Getting applications for job ${jobId} from PostgreSQL`);
      const applications = await db.select().from(applicationsTable).where(eq(applicationsTable.jobId, jobId));
      console.log(`Retrieved ${applications.length} applications for job ${jobId} from PostgreSQL`);
      return applications;
    } catch (error) {
      console.error('PostgreSQL error in getApplicationsByJobId:', error);
      throw error;
    }
  }

  async getApplicationsForUser(userId: number): Promise<Application[]> {
    try {
      // Get all jobs by this user
      console.log(`Getting applications for user ${userId} from PostgreSQL`);
      const jobs = await this.getJobsByUserId(userId);
      const jobIds = jobs.map(job => job.id);
      
      if (jobIds.length === 0) {
        console.log(`User ${userId} has no jobs, returning empty applications array`);
        return [];
      }
      
      // Get applications for these jobs
      const applications = await db.select().from(applicationsTable).where(
        applicationsTable.jobId.in(jobIds)
      );
      console.log(`Retrieved ${applications.length} applications for user ${userId} from PostgreSQL`);
      return applications;
    } catch (error) {
      console.error('PostgreSQL error in getApplicationsForUser:', error);
      throw error;
    }
  }

  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    try {
      console.log('Creating application in PostgreSQL');
      const referenceId = this.generateReferenceId();
      const applications = await db
        .insert(applicationsTable)
        .values({ ...insertApplication, referenceId })
        .returning();
      console.log('Application created in PostgreSQL');
      return applications[0];
    } catch (error) {
      console.error('PostgreSQL error in createApplication:', error);
      throw error;
    }
  }

  async updateApplication(id: number, updateData: Partial<Application>): Promise<Application | undefined> {
    try {
      console.log(`Updating application ${id} in PostgreSQL`);
      const applications = await db
        .update(applicationsTable)
        .set(updateData)
        .where(eq(applicationsTable.id, id))
        .returning();
      console.log('Application updated in PostgreSQL');
      return applications[0];
    } catch (error) {
      console.error('PostgreSQL error in updateApplication:', error);
      throw error;
    }
  }

  // Notes methods
  async saveApplicationNote(applicationId: number, note: string): Promise<boolean> {
    try {
      console.log(`Saving note for application ${applicationId} in PostgreSQL`);
      await db
        .update(applicationsTable)
        .set({ notes: note })
        .where(eq(applicationsTable.id, applicationId));
      console.log('Note saved in PostgreSQL');
      return true;
    } catch (error) {
      console.error('PostgreSQL error in saveApplicationNote:', error);
      throw error;
    }
  }
  
  async getApplicationNote(applicationId: number): Promise<string | undefined> {
    try {
      console.log(`Getting note for application ${applicationId} from PostgreSQL`);
      const application = await this.getApplicationById(applicationId);
      console.log(`Note found: ${application?.notes ? 'yes' : 'no'}`);
      return application?.notes;
    } catch (error) {
      console.error('PostgreSQL error in getApplicationNote:', error);
      throw error;
    }
  }

  // Activity methods
  async getActivities(): Promise<Activity[]> {
    try {
      console.log('Getting all activities from PostgreSQL');
      const activities = await db.select().from(activitiesTable);
      console.log(`Retrieved ${activities.length} activities from PostgreSQL`);
      return activities;
    } catch (error) {
      console.error('PostgreSQL error in getActivities:', error);
      throw error;
    }
  }

  async getActivitiesByUserId(userId: number): Promise<Activity[]> {
    try {
      console.log(`Getting activities for user ${userId} from PostgreSQL`);
      const activities = await db.select().from(activitiesTable)
        .where(eq(activitiesTable.userId, userId))
        .orderBy(desc(activitiesTable.timestamp));
      console.log(`Retrieved ${activities.length} activities for user ${userId} from PostgreSQL`);
      return activities;
    } catch (error) {
      console.error('PostgreSQL error in getActivitiesByUserId:', error);
      throw error;
    }
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    try {
      console.log('Creating activity in PostgreSQL');
      const activities = await db.insert(activitiesTable).values(insertActivity).returning();
      console.log('Activity created in PostgreSQL');
      return activities[0];
    } catch (error) {
      console.error('PostgreSQL error in createActivity:', error);
      throw error;
    }
  }

  // Helper method
  private generateReferenceId(): string {
    const year = new Date().getFullYear();
    const randomPart = uuidv4().substring(0, 5).toUpperCase();
    return `SEV-${year}-${randomPart}`;
  }
}

// Export a single instance of the storage
export const storage = new PostgresStorage();

// Export functions to be called from index.ts
export function setDatabaseConnection(dbConnection: any) {
  console.log('setDatabaseConnection called');
  // Nothing to do as we're using the imported 'db' directly
}

export function setSessionStore(store: any) {
  console.log('setSessionStore called');
  storage.setSessionStore(store);
}