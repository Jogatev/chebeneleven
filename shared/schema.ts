import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User (Franchisee) Schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  franchiseeName: text("franchise_name").notNull(),
  franchiseeId: text("franchisee_id").notNull().unique(),
  location: text("location").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  franchiseeName: true,
  franchiseeId: true,
  location: true,
});

// Job Listing Schema
export const jobListings = pgTable("job_listings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Franchisee ID
  title: text("title").notNull(),
  location: text("location").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements").notNull(),
  jobType: text("job_type").notNull(), // Full-time, Part-time, etc.
  department: text("department"), // Optional department
  payRange: text("pay_range"),
  benefits: text("benefits"),
  status: text("status").notNull().default("active"), // active, filled, closed, archived
  createdAt: timestamp("created_at").defaultNow().notNull(),
  closingDate: timestamp("closing_date"),
  // Store tags as JSON
  tags: json("tags").$type<string[]>().default([]),
});

// Create the base schema
const baseJobSchema = createInsertSchema(jobListings);

// Create a modified schema with custom validation for closingDate
export const insertJobListingSchema = baseJobSchema.pick({
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
  tags: true,
}).extend({
  // Allow closingDate to be a Date or string and handle conversion
  closingDate: z.union([
    z.date().optional(),
    z.string().optional().transform(val => val ? new Date(val) : undefined)
  ])
});

// Application Schema
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull(), // Job listing ID
  referenceId: text("reference_id").notNull().unique(), // Unique reference ID for tracking the application
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address"),
  city: text("city"),
  zipCode: text("zip_code"),
  resumeUrl: text("resume_url"), // We'll store file URLs (in real app would be linked to cloud storage)
  experience: text("experience"),
  education: text("education"),
  coverLetter: text("cover_letter"),
  workAvailability: json("work_availability").$type<{
    holidayWork: boolean;
    weekdayWork: boolean;
    weekendWork: boolean;
    morningShift: boolean;
    afternoonShift: boolean;
    nightShift: boolean;
  }>(),
  startDate: timestamp("start_date"),
  status: text("status").notNull().default("submitted"), // submitted, under_review, interviewed, accepted, rejected
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

// Create the base application schema
const baseApplicationSchema = createInsertSchema(applications);

// Create a modified schema with custom validation for dates
export const insertApplicationSchema = baseApplicationSchema.pick({
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
  status: true,
}).extend({
  // Make referenceId optional for client submissions (will be generated on server)
  referenceId: z.string().optional(),
  // Allow startDate to be a Date or string and handle conversion
  startDate: z.union([
    z.date().optional(),
    z.string().optional().transform(val => val ? new Date(val) : undefined)
  ])
});

// Types for Insert and Select
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertJobListing = z.infer<typeof insertJobListingSchema>;
export type JobListing = typeof jobListings.$inferSelect;

export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: integer("entity_id").notNull(),
  details: json("details").$type<Record<string, any>>().default({}),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = typeof activities.$inferInsert;

// Create the schema for inserting activities
export const insertActivitySchema = createInsertSchema(activities);