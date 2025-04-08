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
exports.storage = exports.MemStorage = void 0;
var express_session_1 = require("express-session");
var memorystore_1 = require("memorystore");
var uuid_1 = require("uuid");
// Create the memory store
var MemoryStore = memorystore_1["default"](express_session_1["default"]);
// In-memory implementation of the storage interface
var MemStorage = /** @class */ (function () {
    function MemStorage() {
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
            checkPeriod: 86400000
        });
    }
    // User methods
    MemStorage.prototype.getUser = function (id) {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.users.get(id)];
            });
        });
    };
    MemStorage.prototype.getUserByUsername = function (username) {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.users.values()).find(function (user) { return user.username === username; })];
            });
        });
    };
    MemStorage.prototype.createUser = function (insertUser) {
        return __awaiter(this, void 0, Promise, function () {
            var id, user;
            return __generator(this, function (_a) {
                id = this.currentUserId++;
                user = __assign(__assign({}, insertUser), { id: id });
                this.users.set(id, user);
                return [2 /*return*/, user];
            });
        });
    };
    MemStorage.prototype.getUsers = function () {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.users.values())];
            });
        });
    };
    // Job listing methods
    MemStorage.prototype.getJobs = function () {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.jobs.values())];
            });
        });
    };
    MemStorage.prototype.getJobsByUserId = function (userId) {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.jobs.values()).filter(function (job) { return job.userId === userId; })];
            });
        });
    };
    MemStorage.prototype.getJobById = function (id) {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.jobs.get(id)];
            });
        });
    };
    MemStorage.prototype.createJob = function (insertJob) {
        return __awaiter(this, void 0, Promise, function () {
            var id, now, job;
            return __generator(this, function (_a) {
                id = this.currentJobId++;
                now = new Date();
                job = __assign(__assign({}, insertJob), { id: id, createdAt: now, tags: Array.isArray(insertJob.tags) ? insertJob.tags : [] });
                this.jobs.set(id, job);
                return [2 /*return*/, job];
            });
        });
    };
    MemStorage.prototype.updateJob = function (id, updates) {
        return __awaiter(this, void 0, Promise, function () {
            var job, updatedJob;
            return __generator(this, function (_a) {
                job = this.jobs.get(id);
                if (!job)
                    return [2 /*return*/, undefined];
                updatedJob = __assign(__assign({}, job), updates);
                this.jobs.set(id, updatedJob);
                return [2 /*return*/, updatedJob];
            });
        });
    };
    MemStorage.prototype.deleteJob = function (id) {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.jobs["delete"](id)];
            });
        });
    };
    // Helper method to generate application reference IDs
    MemStorage.prototype.generateReferenceId = function () {
        // Format: SEV-YYYY-XXXXX, where YYYY is the current year and XXXXX is a random string
        var year = new Date().getFullYear();
        var randomPart = uuid_1.v4().substring(0, 5).toUpperCase();
        return "SEV-" + year + "-" + randomPart;
    };
    // Application methods
    MemStorage.prototype.getApplications = function () {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.applications.values())];
            });
        });
    };
    MemStorage.prototype.getApplicationsByJobId = function (jobId) {
        return __awaiter(this, void 0, Promise, function () {
            var allApplications, applications;
            return __generator(this, function (_a) {
                allApplications = Array.from(this.applications.values());
                console.log("Looking for applications for job ID " + jobId + ", total applications: " + allApplications.length);
                applications = allApplications.filter(function (app) {
                    var appJobId = typeof app.jobId === 'string' ? parseInt(app.jobId) : app.jobId;
                    var result = appJobId === jobId;
                    console.log("Comparing application jobId " + app.jobId + " (" + typeof app.jobId + ") with requested jobId " + jobId + ": " + result);
                    return result;
                });
                console.log("Found " + applications.length + " applications for job ID " + jobId);
                // Ensure all applications have a status field
                return [2 /*return*/, applications.map(function (app) {
                        if (!app.status) {
                            return __assign(__assign({}, app), { status: 'submitted' });
                        }
                        return app;
                    })];
            });
        });
    };
    MemStorage.prototype.getApplicationsForUser = function (userId) {
        return __awaiter(this, void 0, Promise, function () {
            var userJobs, userJobIds, allApplications, userApplications, normalizedApplications;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getJobsByUserId(userId)];
                    case 1:
                        userJobs = _a.sent();
                        if (userJobs.length === 0) {
                            console.log("User " + userId + " has no jobs, returning empty applications array");
                            return [2 /*return*/, []];
                        }
                        userJobIds = userJobs.map(function (job) { return job.id; });
                        console.log("User " + userId + " job IDs:", userJobIds);
                        allApplications = Array.from(this.applications.values());
                        console.log("Total applications in system: " + allApplications.length);
                        if (allApplications.length === 0) {
                            console.log("No applications found in storage");
                            return [2 /*return*/, []];
                        }
                        // Debug each application in the system
                        allApplications.forEach(function (app) {
                            var jobIdType = typeof app.jobId;
                            console.log("Application ID: " + app.id + ", jobId: " + app.jobId + " (type: " + jobIdType + "), status: " + (app.status || 'submitted'));
                        });
                        userApplications = allApplications.filter(function (app) {
                            // Convert both to numbers to ensure consistent comparison
                            var appJobId = Number(app.jobId);
                            return userJobIds.includes(appJobId);
                        });
                        console.log("Applications for user " + userId + "'s jobs: " + userApplications.length);
                        normalizedApplications = userApplications.map(function (app) {
                            if (!app.status) {
                                return __assign(__assign({}, app), { status: 'submitted' });
                            }
                            return app;
                        });
                        return [2 /*return*/, normalizedApplications];
                }
            });
        });
    };
    MemStorage.prototype.getApplicationById = function (id) {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.applications.get(id)];
            });
        });
    };
    MemStorage.prototype.createApplication = function (insertApplication) {
        return __awaiter(this, void 0, Promise, function () {
            var id, now, jobId, referenceId, application, storedApp;
            return __generator(this, function (_a) {
                id = this.currentApplicationId++;
                now = new Date();
                jobId = typeof insertApplication.jobId === 'string'
                    ? parseInt(insertApplication.jobId)
                    : insertApplication.jobId;
                referenceId = insertApplication.referenceId || this.generateReferenceId();
                console.log("Creating application with jobId: " + jobId + ", referenceId: " + referenceId);
                application = __assign(__assign({}, insertApplication), { id: id,
                    jobId: jobId,
                    referenceId: referenceId, submittedAt: now, availableShifts: Array.isArray(insertApplication.availableShifts) ? insertApplication.availableShifts : [] });
                this.applications.set(id, application);
                storedApp = this.applications.get(id);
                console.log("Stored application jobId: " + (storedApp === null || storedApp === void 0 ? void 0 : storedApp.jobId) + ", referenceId: " + (storedApp === null || storedApp === void 0 ? void 0 : storedApp.referenceId));
                return [2 /*return*/, application];
            });
        });
    };
    MemStorage.prototype.updateApplication = function (id, updates) {
        return __awaiter(this, void 0, Promise, function () {
            var application, updatedApplication;
            return __generator(this, function (_a) {
                application = this.applications.get(id);
                if (!application)
                    return [2 /*return*/, undefined];
                updatedApplication = __assign(__assign({}, application), updates);
                this.applications.set(id, updatedApplication);
                return [2 /*return*/, updatedApplication];
            });
        });
    };
    // Notes methods
    MemStorage.prototype.saveApplicationNote = function (applicationId, note) {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                if (!this.applications.has(applicationId))
                    return [2 /*return*/, false];
                this.notes.set(applicationId, note);
                return [2 /*return*/, true];
            });
        });
    };
    MemStorage.prototype.getApplicationNote = function (applicationId) {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.notes.get(applicationId)];
            });
        });
    };
    // Activity methods
    MemStorage.prototype.getActivities = function () {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.activities.values())];
            });
        });
    };
    MemStorage.prototype.getActivitiesByUserId = function (userId) {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.activities.values())
                        .filter(function (activity) { return activity.userId === userId; })
                        .sort(function (a, b) { return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(); })];
            });
        });
    };
    MemStorage.prototype.createActivity = function (insertActivity) {
        return __awaiter(this, void 0, Promise, function () {
            var id, now, activity;
            return __generator(this, function (_a) {
                id = this.currentActivityId++;
                now = new Date();
                activity = __assign(__assign({}, insertActivity), { id: id, timestamp: now });
                this.activities.set(id, activity);
                return [2 /*return*/, activity];
            });
        });
    };
    return MemStorage;
}());
exports.MemStorage = MemStorage;
exports.storage = new MemStorage();
