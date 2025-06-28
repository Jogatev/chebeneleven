"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.registerRoutes = void 0;
var http_1 = require("http");
var unified_storage_1 = require("./unified-storage");
var auth_1 = require("./auth");
var schema_1 = require("@shared/schema");
var zod_validation_error_1 = require("zod-validation-error");
var email_service_1 = require("./email-service");
function registerRoutes(app) {
    return __awaiter(this, void 0, Promise, function () {
        var server;
        var _this = this;
        return __generator(this, function (_a) {
            console.log("Starting route registration...");
            app.get("/api/test", function (req, res) {
                console.log("Test route accessed");
                res.json({ message: "Test route working!" });
            });
            auth_1.setupAuth(app);
            app.get("/api/jobs", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var jobs, activeJobs, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, unified_storage_1.storage.getJobs()];
                        case 1:
                            jobs = _a.sent();
                            activeJobs = jobs.filter(function (job) { return job.status === "active"; });
                            res.json(activeJobs);
                            return [3 /*break*/, 3];
                        case 2:
                            error_1 = _a.sent();
                            console.error("Error getting jobs:", error_1);
                            res.status(500).json({ error: "Failed to retrieve job listings" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            app.post("/api/jobs/:id/archive", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var jobId, job, updatedJob, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!req.isAuthenticated()) {
                                return [2 /*return*/, res.status(401).json({ error: "Unauthorized" })];
                            }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 5, , 6]);
                            jobId = parseInt(req.params.id);
                            return [4 /*yield*/, unified_storage_1.storage.getJobById(jobId)];
                        case 2:
                            job = _a.sent();
                            if (!job) {
                                return [2 /*return*/, res.status(404).json({ error: "Job not found" })];
                            }
                            // Check if the authenticated user owns this job
                            if (job.userId !== req.user.id) {
                                return [2 /*return*/, res.status(403).json({ error: "Forbidden: You do not own this job listing" })];
                            }
                            // Check if job is already archived
                            if (job.status === "archived") {
                                return [2 /*return*/, res.status(400).json({ error: "Job is already archived" })];
                            }
                            return [4 /*yield*/, unified_storage_1.storage.updateJob(jobId, { status: "archived" })];
                        case 3:
                            updatedJob = _a.sent();
                            // Log the archive activity
                            return [4 /*yield*/, unified_storage_1.storage.createActivity({
                                    userId: req.user.id,
                                    action: "updated_job_status",
                                    entityType: "job",
                                    entityId: jobId,
                                    details: {
                                        jobTitle: updatedJob.title,
                                        previousStatus: job.status,
                                        newStatus: "archived"
                                    }
                                })];
                        case 4:
                            // Log the archive activity
                            _a.sent();
                            res.json(updatedJob);
                            return [3 /*break*/, 6];
                        case 5:
                            error_2 = _a.sent();
                            console.error("Error archiving job:", error_2);
                            res.status(500).json({ error: "Failed to archive job listing" });
                            return [3 /*break*/, 6];
                        case 6: return [2 /*return*/];
                    }
                });
            }); });
            // Get job by ID (publicly accessible)
            app.get("/api/jobs/:id", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var jobId, job, error_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            jobId = parseInt(req.params.id);
                            return [4 /*yield*/, unified_storage_1.storage.getJobById(jobId)];
                        case 1:
                            job = _a.sent();
                            if (!job) {
                                return [2 /*return*/, res.status(404).json({ error: "Job not found" })];
                            }
                            res.json(job);
                            return [3 /*break*/, 3];
                        case 2:
                            error_3 = _a.sent();
                            console.error("Error getting job:", error_3);
                            res.status(500).json({ error: "Failed to retrieve job" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Get jobs by franchisee (requires auth)
            app.get("/api/my-jobs", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var userId, jobs, error_4;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!req.isAuthenticated()) {
                                return [2 /*return*/, res.status(401).json({ error: "Unauthorized" })];
                            }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            userId = req.user.id;
                            return [4 /*yield*/, unified_storage_1.storage.getJobsByUserId(userId)];
                        case 2:
                            jobs = _a.sent();
                            res.json(jobs);
                            return [3 /*break*/, 4];
                        case 3:
                            error_4 = _a.sent();
                            console.error("Error getting user jobs:", error_4);
                            res.status(500).json({ error: "Failed to retrieve your job listings" });
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
            // Create job listing (requires auth)
            app.post("/api/jobs", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var jobData, parseResult, validationError, job, activity, activityError_1, error_5;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!req.isAuthenticated()) {
                                return [2 /*return*/, res.status(401).json({ error: "Unauthorized" })];
                            }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 7, , 8]);
                            jobData = __assign(__assign({}, req.body), { userId: req.user.id });
                            // Manual date conversion for closingDate if it's a string
                            if (jobData.closingDate && typeof jobData.closingDate === 'string') {
                                try {
                                    jobData.closingDate = new Date(jobData.closingDate);
                                }
                                catch (error) {
                                    return [2 /*return*/, res.status(400).json({ error: "Invalid closing date format" })];
                                }
                            }
                            parseResult = schema_1.insertJobListingSchema.safeParse(jobData);
                            if (!parseResult.success) {
                                validationError = zod_validation_error_1.fromZodError(parseResult.error);
                                return [2 /*return*/, res.status(400).json({ error: validationError.message })];
                            }
                            return [4 /*yield*/, unified_storage_1.storage.createJob(parseResult.data)];
                        case 2:
                            job = _a.sent();
                            // Log the activity with debugging
                            console.log("Logging job creation activity for user " + req.user.id + ", job " + job.id);
                            _a.label = 3;
                        case 3:
                            _a.trys.push([3, 5, , 6]);
                            return [4 /*yield*/, unified_storage_1.storage.createActivity({
                                    userId: req.user.id,
                                    action: "created_job",
                                    entityType: "job",
                                    entityId: job.id,
                                    details: { jobTitle: job.title, location: job.location }
                                })];
                        case 4:
                            activity = _a.sent();
                            console.log("Activity logged:", activity);
                            return [3 /*break*/, 6];
                        case 5:
                            activityError_1 = _a.sent();
                            console.error("Error logging activity:", activityError_1);
                            return [3 /*break*/, 6];
                        case 6:
                            res.status(201).json(job);
                            return [3 /*break*/, 8];
                        case 7:
                            error_5 = _a.sent();
                            console.error("Error creating job:", error_5);
                            res.status(500).json({ error: "Failed to create job listing" });
                            return [3 /*break*/, 8];
                        case 8: return [2 /*return*/];
                    }
                });
            }); });
            // Update job listing (requires auth)
            app.patch("/api/jobs/:id", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var jobId, job, updatedJob, activityError_2, activityError_3, error_6;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!req.isAuthenticated()) {
                                return [2 /*return*/, res.status(401).json({ error: "Unauthorized" })];
                            }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 13, , 14]);
                            jobId = parseInt(req.params.id);
                            return [4 /*yield*/, unified_storage_1.storage.getJobById(jobId)];
                        case 2:
                            job = _a.sent();
                            if (!job) {
                                return [2 /*return*/, res.status(404).json({ error: "Job not found" })];
                            }
                            // Check if the authenticated user owns this job
                            if (job.userId !== req.user.id) {
                                return [2 /*return*/, res.status(403).json({ error: "Forbidden: You do not own this job listing" })];
                            }
                            return [4 /*yield*/, unified_storage_1.storage.updateJob(jobId, req.body)];
                        case 3:
                            updatedJob = _a.sent();
                            if (!req.body.status) return [3 /*break*/, 8];
                            console.log("Logging job status update activity: " + job.status + " -> " + req.body.status);
                            _a.label = 4;
                        case 4:
                            _a.trys.push([4, 6, , 7]);
                            return [4 /*yield*/, unified_storage_1.storage.createActivity({
                                    userId: req.user.id,
                                    action: "updated_job_status",
                                    entityType: "job",
                                    entityId: jobId,
                                    details: {
                                        jobTitle: updatedJob.title,
                                        newStatus: req.body.status,
                                        previousStatus: job.status
                                    }
                                })];
                        case 5:
                            _a.sent();
                            return [3 /*break*/, 7];
                        case 6:
                            activityError_2 = _a.sent();
                            console.error("Error logging status update activity:", activityError_2);
                            return [3 /*break*/, 7];
                        case 7: return [3 /*break*/, 12];
                        case 8:
                            if (!(Object.keys(req.body).length > 0)) return [3 /*break*/, 12];
                            console.log("Logging job update activity for fields: " + Object.keys(req.body).join(", "));
                            _a.label = 9;
                        case 9:
                            _a.trys.push([9, 11, , 12]);
                            return [4 /*yield*/, unified_storage_1.storage.createActivity({
                                    userId: req.user.id,
                                    action: "updated_job",
                                    entityType: "job",
                                    entityId: jobId,
                                    details: {
                                        jobTitle: updatedJob.title,
                                        updatedFields: Object.keys(req.body).join(", ")
                                    }
                                })];
                        case 10:
                            _a.sent();
                            return [3 /*break*/, 12];
                        case 11:
                            activityError_3 = _a.sent();
                            console.error("Error logging job update activity:", activityError_3);
                            return [3 /*break*/, 12];
                        case 12:
                            res.json(updatedJob);
                            return [3 /*break*/, 14];
                        case 13:
                            error_6 = _a.sent();
                            console.error("Error updating job:", error_6);
                            res.status(500).json({ error: "Failed to update job listing" });
                            return [3 /*break*/, 14];
                        case 14: return [2 /*return*/];
                    }
                });
            }); });
            // Delete job listing (requires auth)
            app["delete"]("/api/jobs/:id", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var jobId, job, activityError_4, error_7;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!req.isAuthenticated()) {
                                return [2 /*return*/, res.status(401).json({ error: "Unauthorized" })];
                            }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 8, , 9]);
                            jobId = parseInt(req.params.id);
                            return [4 /*yield*/, unified_storage_1.storage.getJobById(jobId)];
                        case 2:
                            job = _a.sent();
                            if (!job) {
                                return [2 /*return*/, res.status(404).json({ error: "Job not found" })];
                            }
                            // Check if the authenticated user owns this job
                            if (job.userId !== req.user.id) {
                                return [2 /*return*/, res.status(403).json({ error: "Forbidden: You do not own this job listing" })];
                            }
                            // Log the activity before deleting the job
                            console.log("Logging job deletion activity for job " + jobId);
                            _a.label = 3;
                        case 3:
                            _a.trys.push([3, 5, , 6]);
                            return [4 /*yield*/, unified_storage_1.storage.createActivity({
                                    userId: req.user.id,
                                    action: "deleted_job",
                                    entityType: "job",
                                    entityId: jobId,
                                    details: {
                                        jobTitle: job.title,
                                        location: job.location
                                    }
                                })];
                        case 4:
                            _a.sent();
                            return [3 /*break*/, 6];
                        case 5:
                            activityError_4 = _a.sent();
                            console.error("Error logging job deletion activity:", activityError_4);
                            return [3 /*break*/, 6];
                        case 6: return [4 /*yield*/, unified_storage_1.storage.deleteJob(jobId)];
                        case 7:
                            _a.sent();
                            res.status(204).end();
                            return [3 /*break*/, 9];
                        case 8:
                            error_7 = _a.sent();
                            console.error("Error deleting job:", error_7);
                            res.status(500).json({ error: "Failed to delete job listing" });
                            return [3 /*break*/, 9];
                        case 9: return [2 /*return*/];
                    }
                });
            }); });
            // Applications Routes
            // Submit a job application (publicly accessible)
            app.post("/api/applications", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var parseResult, validationError, job, application, allApplications, emailResult, jobDetails, activityError_5, emailError_1, error_8;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 16, , 17]);
                            parseResult = schema_1.insertApplicationSchema.safeParse(req.body);
                            if (!parseResult.success) {
                                validationError = zod_validation_error_1.fromZodError(parseResult.error);
                                return [2 /*return*/, res.status(400).json({ error: validationError.message })];
                            }
                            return [4 /*yield*/, unified_storage_1.storage.getJobById(parseResult.data.jobId)];
                        case 1:
                            job = _a.sent();
                            if (!job) {
                                return [2 /*return*/, res.status(404).json({ error: "Job not found" })];
                            }
                            // Check if the job is still active
                            if (job.status !== "active") {
                                return [2 /*return*/, res.status(400).json({ error: "This job is no longer accepting applications" })];
                            }
                            return [4 /*yield*/, unified_storage_1.storage.createApplication(parseResult.data)];
                        case 2:
                            application = _a.sent();
                            console.log("Application created successfully:", application);
                            return [4 /*yield*/, unified_storage_1.storage.getApplications()];
                        case 3:
                            allApplications = _a.sent();
                            console.log("Total applications in storage: " + allApplications.length);
                            emailResult = null;
                            _a.label = 4;
                        case 4:
                            _a.trys.push([4, 14, , 15]);
                            if (!application.email) return [3 /*break*/, 8];
                            return [4 /*yield*/, unified_storage_1.storage.getJobById(application.jobId)];
                        case 5:
                            jobDetails = _a.sent();
                            if (!jobDetails) return [3 /*break*/, 7];
                            return [4 /*yield*/, email_service_1.sendApplicationConfirmation(application, jobDetails, application.referenceId)];
                        case 6:
                            emailResult = _a.sent();
                            console.log("Application confirmation email sent:", emailResult);
                            _a.label = 7;
                        case 7: return [3 /*break*/, 9];
                        case 8:
                            console.log("No email provided for application, skipping confirmation email");
                            _a.label = 9;
                        case 9:
                            // Log activity for the job owner (franchisee)
                            console.log("Logging application received activity for user " + job.userId);
                            _a.label = 10;
                        case 10:
                            _a.trys.push([10, 12, , 13]);
                            return [4 /*yield*/, unified_storage_1.storage.createActivity({
                                    userId: job.userId,
                                    action: "received_application",
                                    entityType: "application",
                                    entityId: application.id,
                                    details: {
                                        applicantName: application.firstName + " " + application.lastName,
                                        jobTitle: job.title
                                    }
                                })];
                        case 11:
                            _a.sent();
                            return [3 /*break*/, 13];
                        case 12:
                            activityError_5 = _a.sent();
                            console.error("Error logging application received activity:", activityError_5);
                            return [3 /*break*/, 13];
                        case 13: return [3 /*break*/, 15];
                        case 14:
                            emailError_1 = _a.sent();
                            console.error("Error sending confirmation email:", emailError_1);
                            return [3 /*break*/, 15];
                        case 15:
                            // Include email status in response
                            res.status(201).json(__assign(__assign({}, application), { notificationSent: (emailResult === null || emailResult === void 0 ? void 0 : emailResult.success) || false }));
                            return [3 /*break*/, 17];
                        case 16:
                            error_8 = _a.sent();
                            console.error("Error creating application:", error_8);
                            res.status(500).json({ error: "Failed to submit application" });
                            return [3 /*break*/, 17];
                        case 17: return [2 /*return*/];
                    }
                });
            }); });
            // Get applications for a franchisee (requires auth)
            app.get("/api/my-applications", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var userId, userJobs, userJobIds, allApplications, matchedApplications, _i, allApplications_1, app_1, appJobId, applicationsWithJobDetails, error_9;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!req.isAuthenticated()) {
                                return [2 /*return*/, res.status(401).json({ error: "Unauthorized" })];
                            }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 5, , 6]);
                            userId = req.user.id;
                            console.log("Getting applications for user " + userId);
                            return [4 /*yield*/, unified_storage_1.storage.getJobsByUserId(userId)];
                        case 2:
                            userJobs = _a.sent();
                            console.log("User has " + userJobs.length + " job listings:", userJobs.map(function (j) { return j.id; }));
                            if (userJobs.length === 0) {
                                console.log("User has no jobs, returning empty applications array");
                                return [2 /*return*/, res.json([])];
                            }
                            userJobIds = userJobs.map(function (job) { return job.id; });
                            return [4 /*yield*/, unified_storage_1.storage.getApplications()];
                        case 3:
                            allApplications = _a.sent();
                            console.log("Total applications in system: " + allApplications.length);
                            if (allApplications.length === 0) {
                                console.log("No applications found in storage");
                                return [2 /*return*/, res.json([])];
                            }
                            matchedApplications = [];
                            for (_i = 0, allApplications_1 = allApplications; _i < allApplications_1.length; _i++) {
                                app_1 = allApplications_1[_i];
                                appJobId = typeof app_1.jobId === 'string' ? parseInt(app_1.jobId) : app_1.jobId;
                                console.log("Checking application " + app_1.id + " for job " + appJobId + ", user jobs: [" + userJobIds.join(',') + "]");
                                if (userJobIds.includes(appJobId)) {
                                    console.log("Match found: Application " + app_1.id + " matches job " + appJobId);
                                    // Ensure application has a status
                                    if (!app_1.status) {
                                        app_1.status = 'submitted';
                                    }
                                    matchedApplications.push(__assign(__assign({}, app_1), { jobId: appJobId // Ensure jobId is a number
                                     }));
                                }
                            }
                            console.log("Found " + matchedApplications.length + " applications for user's jobs");
                            if (matchedApplications.length === 0) {
                                return [2 /*return*/, res.json([])];
                            }
                            return [4 /*yield*/, Promise.all(matchedApplications.map(function (app) { return __awaiter(_this, void 0, void 0, function () {
                                    var job;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, unified_storage_1.storage.getJobById(app.jobId)];
                                            case 1:
                                                job = _a.sent();
                                                return [2 /*return*/, __assign(__assign({}, app), { jobTitle: job ? job.title : "Unknown Job", jobLocation: job ? job.location : "Unknown Location" })];
                                        }
                                    });
                                }); }))];
                        case 4:
                            applicationsWithJobDetails = _a.sent();
                            res.json(applicationsWithJobDetails);
                            return [3 /*break*/, 6];
                        case 5:
                            error_9 = _a.sent();
                            console.error("Error getting applications:", error_9);
                            res.status(500).json({ error: "Failed to retrieve applications" });
                            return [3 /*break*/, 6];
                        case 6: return [2 /*return*/];
                    }
                });
            }); });
            // Get applications for a specific job (requires auth)
            app.get("/api/applications/job/:jobId", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var jobId_1, job, allApplications, jobApplications, error_10;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!req.isAuthenticated()) {
                                return [2 /*return*/, res.status(401).json({ error: "Unauthorized" })];
                            }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 4, , 5]);
                            jobId_1 = parseInt(req.params.jobId);
                            return [4 /*yield*/, unified_storage_1.storage.getJobById(jobId_1)];
                        case 2:
                            job = _a.sent();
                            if (!job) {
                                return [2 /*return*/, res.status(404).json({ error: "Job not found" })];
                            }
                            // Check if the authenticated user owns this job
                            if (job.userId !== req.user.id) {
                                return [2 /*return*/, res.status(403).json({ error: "Forbidden: You do not own this job listing" })];
                            }
                            return [4 /*yield*/, unified_storage_1.storage.getApplications()];
                        case 3:
                            allApplications = _a.sent();
                            jobApplications = allApplications.filter(function (app) {
                                // Ensure jobId is a number for comparison
                                var appJobId = typeof app.jobId === 'string' ? parseInt(app.jobId) : app.jobId;
                                return appJobId === jobId_1;
                            });
                            console.log("Found " + jobApplications.length + " applications for job " + jobId_1);
                            res.json(jobApplications);
                            return [3 /*break*/, 5];
                        case 4:
                            error_10 = _a.sent();
                            console.error("Error getting applications for job " + req.params.jobId + ":", error_10);
                            res.status(500).json({ error: "Failed to retrieve applications" });
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/];
                    }
                });
            }); });
            // Get application by ID (requires auth)
            app.get("/api/applications/:id", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var applicationId, application, job, error_11;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!req.isAuthenticated()) {
                                return [2 /*return*/, res.status(401).json({ error: "Unauthorized" })];
                            }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 4, , 5]);
                            applicationId = parseInt(req.params.id);
                            return [4 /*yield*/, unified_storage_1.storage.getApplicationById(applicationId)];
                        case 2:
                            application = _a.sent();
                            if (!application) {
                                return [2 /*return*/, res.status(404).json({ error: "Application not found" })];
                            }
                            return [4 /*yield*/, unified_storage_1.storage.getJobById(application.jobId)];
                        case 3:
                            job = _a.sent();
                            if (!job || job.userId !== req.user.id) {
                                return [2 /*return*/, res.status(403).json({ error: "Forbidden: You do not own this job listing" })];
                            }
                            res.json(application);
                            return [3 /*break*/, 5];
                        case 4:
                            error_11 = _a.sent();
                            console.error("Error getting application:", error_11);
                            res.status(500).json({ error: "Failed to retrieve application" });
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/];
                    }
                });
            }); });
            // Update application status (requires auth)
            app.patch("/api/applications/:id", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var applicationId, application, job, status, allowedStatuses, previousStatus, updatedApplication, activityError_6, emailResult, emailError_2, error_12;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!req.isAuthenticated()) {
                                return [2 /*return*/, res.status(401).json({ error: "Unauthorized" })];
                            }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 14, , 15]);
                            applicationId = parseInt(req.params.id);
                            return [4 /*yield*/, unified_storage_1.storage.getApplicationById(applicationId)];
                        case 2:
                            application = _a.sent();
                            if (!application) {
                                return [2 /*return*/, res.status(404).json({ error: "Application not found" })];
                            }
                            return [4 /*yield*/, unified_storage_1.storage.getJobById(application.jobId)];
                        case 3:
                            job = _a.sent();
                            if (!job || job.userId !== req.user.id) {
                                return [2 /*return*/, res.status(403).json({ error: "Forbidden: You do not own this job listing" })];
                            }
                            console.log("Updating application " + applicationId + " with data:", req.body);
                            status = req.body.status;
                            // Validate status (only status updates supported for now)
                            if (!status) {
                                return [2 /*return*/, res.status(400).json({ error: "Status is required" })];
                            }
                            allowedStatuses = ["submitted", "under_review", "interview", "interviewed", "accepted", "rejected"];
                            if (!allowedStatuses.includes(status)) {
                                return [2 /*return*/, res.status(400).json({
                                        error: "Invalid status. Allowed values: " + allowedStatuses.join(", ")
                                    })];
                            }
                            previousStatus = application.status || "submitted";
                            return [4 /*yield*/, unified_storage_1.storage.updateApplication(applicationId, { status: status })];
                        case 4:
                            updatedApplication = _a.sent();
                            // Log the activity
                            console.log("Logging application status update activity: " + previousStatus + " -> " + status);
                            _a.label = 5;
                        case 5:
                            _a.trys.push([5, 7, , 8]);
                            return [4 /*yield*/, unified_storage_1.storage.createActivity({
                                    userId: req.user.id,
                                    action: "updated_application_status",
                                    entityType: "application",
                                    entityId: applicationId,
                                    details: {
                                        applicantName: application.firstName + " " + application.lastName,
                                        jobTitle: job.title,
                                        previousStatus: previousStatus,
                                        newStatus: status
                                    }
                                })];
                        case 6:
                            _a.sent();
                            return [3 /*break*/, 8];
                        case 7:
                            activityError_6 = _a.sent();
                            console.error("Error logging status update activity:", activityError_6);
                            return [3 /*break*/, 8];
                        case 8:
                            emailResult = null;
                            _a.label = 9;
                        case 9:
                            _a.trys.push([9, 12, , 13]);
                            if (!application.email) return [3 /*break*/, 11];
                            return [4 /*yield*/, email_service_1.sendStatusUpdateEmail(application, job, status, application.referenceId)];
                        case 10:
                            emailResult = _a.sent();
                            console.log("Status update email sent:", emailResult);
                            _a.label = 11;
                        case 11: return [3 /*break*/, 13];
                        case 12:
                            emailError_2 = _a.sent();
                            console.error("Error sending status update email:", emailError_2);
                            return [3 /*break*/, 13];
                        case 13:
                            res.json(__assign(__assign({}, updatedApplication), { notificationSent: (emailResult === null || emailResult === void 0 ? void 0 : emailResult.success) || false }));
                            return [3 /*break*/, 15];
                        case 14:
                            error_12 = _a.sent();
                            console.error("Error updating application:", error_12);
                            res.status(500).json({ error: "Failed to update application" });
                            return [3 /*break*/, 15];
                        case 15: return [2 /*return*/];
                    }
                });
            }); });
            // Activities routes
            // Get activities for a franchisee (requires auth)
            app.get("/api/my-activities", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var userId, activities, error_13;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!req.isAuthenticated()) {
                                return [2 /*return*/, res.status(401).json({ error: "Unauthorized" })];
                            }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            userId = req.user.id;
                            return [4 /*yield*/, unified_storage_1.storage.getActivitiesByUserId(userId)];
                        case 2:
                            activities = _a.sent();
                            // Sort activities by createdAt descending (newest first)
                            activities.sort(function (a, b) {
                                var dateA = new Date(a.createdAt || 0).getTime();
                                var dateB = new Date(b.createdAt || 0).getTime();
                                return dateB - dateA;
                            });
                            res.json(activities);
                            return [3 /*break*/, 4];
                        case 3:
                            error_13 = _a.sent();
                            console.error("Error getting activities:", error_13);
                            res.status(500).json({ error: "Failed to retrieve activities" });
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
            // Create an activity log (requires auth)
            app.post("/api/activities", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var activityData, parseResult, validationError, activity, error_14;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!req.isAuthenticated()) {
                                return [2 /*return*/, res.status(401).json({ error: "Unauthorized" })];
                            }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            activityData = __assign(__assign({}, req.body), { userId: req.user.id });
                            parseResult = schema_1.insertActivitySchema.safeParse(activityData);
                            if (!parseResult.success) {
                                validationError = zod_validation_error_1.fromZodError(parseResult.error);
                                return [2 /*return*/, res.status(400).json({ error: validationError.message })];
                            }
                            return [4 /*yield*/, unified_storage_1.storage.createActivity(parseResult.data)];
                        case 2:
                            activity = _a.sent();
                            res.status(201).json(activity);
                            return [3 /*break*/, 4];
                        case 3:
                            error_14 = _a.sent();
                            console.error("Error creating activity:", error_14);
                            res.status(500).json({ error: "Failed to create activity log" });
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
            server = http_1.createServer(app);
            return [2 /*return*/, server];
        });
    });
}
exports.registerRoutes = registerRoutes;
