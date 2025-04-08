"use strict";
exports.__esModule = true;
exports.insertActivitySchema = exports.activities = exports.insertApplicationSchema = exports.applications = exports.insertJobListingSchema = exports.jobListings = exports.insertUserSchema = exports.users = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
var drizzle_zod_1 = require("drizzle-zod");
var zod_1 = require("zod");
// User (Franchisee) Schema
exports.users = pg_core_1.pgTable("users", {
    id: pg_core_1.serial("id").primaryKey(),
    username: pg_core_1.text("username").notNull().unique(),
    password: pg_core_1.text("password").notNull(),
    franchiseeName: pg_core_1.text("franchise_name").notNull(),
    franchiseeId: pg_core_1.text("franchisee_id").notNull().unique(),
    location: pg_core_1.text("location").notNull()
});
exports.insertUserSchema = drizzle_zod_1.createInsertSchema(exports.users).pick({
    username: true,
    password: true,
    franchiseeName: true,
    franchiseeId: true,
    location: true
});
// Job Listing Schema
exports.jobListings = pg_core_1.pgTable("job_listings", {
    id: pg_core_1.serial("id").primaryKey(),
    userId: pg_core_1.integer("user_id").notNull(),
    title: pg_core_1.text("title").notNull(),
    location: pg_core_1.text("location").notNull(),
    description: pg_core_1.text("description").notNull(),
    requirements: pg_core_1.text("requirements").notNull(),
    jobType: pg_core_1.text("job_type").notNull(),
    department: pg_core_1.text("department"),
    payRange: pg_core_1.text("pay_range"),
    benefits: pg_core_1.text("benefits"),
    status: pg_core_1.text("status").notNull()["default"]("active"),
    createdAt: pg_core_1.timestamp("created_at").defaultNow().notNull(),
    closingDate: pg_core_1.timestamp("closing_date"),
    // Store tags as JSON
    tags: pg_core_1.json("tags").$type()["default"]([])
});
// Create the base schema
var baseJobSchema = drizzle_zod_1.createInsertSchema(exports.jobListings);
// Create a modified schema with custom validation for closingDate
exports.insertJobListingSchema = baseJobSchema.pick({
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
    closingDate: zod_1.z.union([
        zod_1.z.date().optional(),
        zod_1.z.string().optional().transform(function (val) { return val ? new Date(val) : undefined; })
    ])
});
// Application Schema
exports.applications = pg_core_1.pgTable("applications", {
    id: pg_core_1.serial("id").primaryKey(),
    jobId: pg_core_1.integer("job_id").notNull(),
    referenceId: pg_core_1.text("reference_id").notNull().unique(),
    firstName: pg_core_1.text("first_name").notNull(),
    lastName: pg_core_1.text("last_name").notNull(),
    email: pg_core_1.text("email").notNull(),
    phone: pg_core_1.text("phone").notNull(),
    address: pg_core_1.text("address"),
    city: pg_core_1.text("city"),
    zipCode: pg_core_1.text("zip_code"),
    resumeUrl: pg_core_1.text("resume_url"),
    experience: pg_core_1.text("experience"),
    education: pg_core_1.text("education"),
    coverLetter: pg_core_1.text("cover_letter"),
    workAvailability: pg_core_1.json("work_availability").$type(),
    startDate: pg_core_1.timestamp("start_date"),
    status: pg_core_1.text("status").notNull()["default"]("submitted"),
    submittedAt: pg_core_1.timestamp("submitted_at").defaultNow().notNull()
});
// Create the base application schema
var baseApplicationSchema = drizzle_zod_1.createInsertSchema(exports.applications);
// Create a modified schema with custom validation for dates
exports.insertApplicationSchema = baseApplicationSchema.pick({
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
    status: true
}).extend({
    // Make referenceId optional for client submissions (will be generated on server)
    referenceId: zod_1.z.string().optional(),
    // Allow startDate to be a Date or string and handle conversion
    startDate: zod_1.z.union([
        zod_1.z.date().optional(),
        zod_1.z.string().optional().transform(function (val) { return val ? new Date(val) : undefined; })
    ])
});
exports.activities = pg_core_1.pgTable("activities", {
    id: pg_core_1.serial("id").primaryKey(),
    userId: pg_core_1.integer("user_id").notNull(),
    action: pg_core_1.text("action").notNull(),
    entityType: pg_core_1.text("entity_type").notNull(),
    entityId: pg_core_1.integer("entity_id").notNull(),
    details: pg_core_1.json("details").$type()["default"]({}),
    timestamp: pg_core_1.timestamp("timestamp").defaultNow().notNull()
});
// Create the schema for inserting activities
exports.insertActivitySchema = drizzle_zod_1.createInsertSchema(exports.activities);
