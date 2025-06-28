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
exports.setSessionStore = exports.setDatabaseConnection = exports.storage = exports.PostgresStorage = void 0;
var connection_1 = require("./connection");
var schema_1 = require("@shared/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var memorystore_1 = require("memorystore");
var express_session_1 = require("express-session");
// Create the memory store for sessions
var MemoryStore = memorystore_1["default"](express_session_1["default"]);
// Export the storage class
var PostgresStorage = /** @class */ (function () {
    function PostgresStorage() {
        console.log('PostgresStorage constructor called');
        this.sessionStore = null; // This will be set from index.ts
    }
    PostgresStorage.prototype.setSessionStore = function (store) {
        console.log('Setting session store');
        this.sessionStore = store;
    };
    // User methods
    PostgresStorage.prototype.getUser = function (id) {
        return __awaiter(this, void 0, Promise, function () {
            var users, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log("Getting user " + id + " from PostgreSQL");
                        return [4 /*yield*/, connection_1.db.select().from(schema_1.users).where(drizzle_orm_1.eq(schema_1.users.id, id))];
                    case 1:
                        users = _a.sent();
                        console.log("User found: " + (users.length > 0));
                        return [2 /*return*/, users[0]];
                    case 2:
                        error_1 = _a.sent();
                        console.error('PostgreSQL error in getUser:', error_1);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    PostgresStorage.prototype.getUserByUsername = function (username) {
        return __awaiter(this, void 0, Promise, function () {
            var users, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log("Getting user by username " + username + " from PostgreSQL");
                        return [4 /*yield*/, connection_1.db.select().from(schema_1.users).where(drizzle_orm_1.eq(schema_1.users.username, username))];
                    case 1:
                        users = _a.sent();
                        console.log("User found: " + (users.length > 0));
                        return [2 /*return*/, users[0]];
                    case 2:
                        error_2 = _a.sent();
                        console.error('PostgreSQL error in getUserByUsername:', error_2);
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    PostgresStorage.prototype.createUser = function (insertUser) {
        return __awaiter(this, void 0, Promise, function () {
            var users, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log('Creating user in PostgreSQL');
                        return [4 /*yield*/, connection_1.db.insert(schema_1.users).values(insertUser).returning()];
                    case 1:
                        users = _a.sent();
                        console.log('User created in PostgreSQL');
                        return [2 /*return*/, users[0]];
                    case 2:
                        error_3 = _a.sent();
                        console.error('PostgreSQL error in createUser:', error_3);
                        throw error_3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    PostgresStorage.prototype.getUsers = function () {
        return __awaiter(this, void 0, Promise, function () {
            var users, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log('Getting all users from PostgreSQL');
                        return [4 /*yield*/, connection_1.db.select().from(schema_1.users)];
                    case 1:
                        users = _a.sent();
                        console.log("Retrieved " + users.length + " users from PostgreSQL");
                        return [2 /*return*/, users];
                    case 2:
                        error_4 = _a.sent();
                        console.error('PostgreSQL error in getUsers:', error_4);
                        throw error_4;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Job methods
    PostgresStorage.prototype.getJobs = function () {
        return __awaiter(this, void 0, Promise, function () {
            var jobs, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log('Getting all jobs from PostgreSQL');
                        return [4 /*yield*/, connection_1.db.select().from(schema_1.jobListings).orderBy(drizzle_orm_1.desc(schema_1.jobListings.createdAt))];
                    case 1:
                        jobs = _a.sent();
                        console.log("Retrieved " + jobs.length + " jobs from PostgreSQL");
                        return [2 /*return*/, jobs];
                    case 2:
                        error_5 = _a.sent();
                        console.error('PostgreSQL error in getJobs:', error_5);
                        throw error_5;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    PostgresStorage.prototype.getJobById = function (id) {
        return __awaiter(this, void 0, Promise, function () {
            var jobs, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log("Getting job " + id + " from PostgreSQL");
                        return [4 /*yield*/, connection_1.db.select().from(schema_1.jobListings).where(drizzle_orm_1.eq(schema_1.jobListings.id, id))];
                    case 1:
                        jobs = _a.sent();
                        console.log("Job found: " + (jobs.length > 0));
                        return [2 /*return*/, jobs[0]];
                    case 2:
                        error_6 = _a.sent();
                        console.error('PostgreSQL error in getJobById:', error_6);
                        throw error_6;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    PostgresStorage.prototype.getJobsByUserId = function (userId) {
        return __awaiter(this, void 0, Promise, function () {
            var jobs, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log("Getting jobs for user " + userId + " from PostgreSQL");
                        return [4 /*yield*/, connection_1.db.select().from(schema_1.jobListings).where(drizzle_orm_1.eq(schema_1.jobListings.userId, userId))];
                    case 1:
                        jobs = _a.sent();
                        console.log("Retrieved " + jobs.length + " jobs for user " + userId + " from PostgreSQL");
                        return [2 /*return*/, jobs];
                    case 2:
                        error_7 = _a.sent();
                        console.error('PostgreSQL error in getJobsByUserId:', error_7);
                        throw error_7;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    PostgresStorage.prototype.createJob = function (insertJob) {
        return __awaiter(this, void 0, Promise, function () {
            var jobs, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log('Creating job in PostgreSQL:', JSON.stringify(insertJob));
                        return [4 /*yield*/, connection_1.db.insert(schema_1.jobListings).values(insertJob).returning()];
                    case 1:
                        jobs = _a.sent();
                        console.log('Job created in PostgreSQL:', JSON.stringify(jobs[0]));
                        return [2 /*return*/, jobs[0]];
                    case 2:
                        error_8 = _a.sent();
                        console.error('PostgreSQL error in createJob:', error_8);
                        console.error('Error details:', error_8.message);
                        throw error_8;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    PostgresStorage.prototype.updateJob = function (id, updateData) {
        return __awaiter(this, void 0, Promise, function () {
            var jobs, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log("Updating job " + id + " in PostgreSQL:", JSON.stringify(updateData));
                        return [4 /*yield*/, connection_1.db
                                .update(schema_1.jobListings)
                                .set(updateData)
                                .where(drizzle_orm_1.eq(schema_1.jobListings.id, id))
                                .returning()];
                    case 1:
                        jobs = _a.sent();
                        console.log('Job updated in PostgreSQL');
                        return [2 /*return*/, jobs[0]];
                    case 2:
                        error_9 = _a.sent();
                        console.error('PostgreSQL error in updateJob:', error_9);
                        throw error_9;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    PostgresStorage.prototype.deleteJob = function (id) {
        return __awaiter(this, void 0, Promise, function () {
            var error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log("Deleting job " + id + " from PostgreSQL");
                        return [4 /*yield*/, connection_1.db["delete"](schema_1.jobListings).where(drizzle_orm_1.eq(schema_1.jobListings.id, id))];
                    case 1:
                        _a.sent();
                        console.log('Job deleted from PostgreSQL');
                        return [2 /*return*/, true];
                    case 2:
                        error_10 = _a.sent();
                        console.error('PostgreSQL error in deleteJob:', error_10);
                        throw error_10;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Application methods
    PostgresStorage.prototype.getApplications = function () {
        return __awaiter(this, void 0, Promise, function () {
            var applications, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log('Getting all applications from PostgreSQL');
                        return [4 /*yield*/, connection_1.db.select().from(schema_1.applications).orderBy(drizzle_orm_1.desc(schema_1.applications.submittedAt))];
                    case 1:
                        applications = _a.sent();
                        console.log("Retrieved " + applications.length + " applications from PostgreSQL");
                        return [2 /*return*/, applications];
                    case 2:
                        error_11 = _a.sent();
                        console.error('PostgreSQL error in getApplications:', error_11);
                        throw error_11;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    PostgresStorage.prototype.getApplicationById = function (id) {
        return __awaiter(this, void 0, Promise, function () {
            var applications, error_12;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log("Getting application " + id + " from PostgreSQL");
                        return [4 /*yield*/, connection_1.db.select().from(schema_1.applications).where(drizzle_orm_1.eq(schema_1.applications.id, id))];
                    case 1:
                        applications = _a.sent();
                        console.log("Application found: " + (applications.length > 0));
                        return [2 /*return*/, applications[0]];
                    case 2:
                        error_12 = _a.sent();
                        console.error('PostgreSQL error in getApplicationById:', error_12);
                        throw error_12;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    PostgresStorage.prototype.getApplicationsByJobId = function (jobId) {
        return __awaiter(this, void 0, Promise, function () {
            var applications, error_13;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log("Getting applications for job " + jobId + " from PostgreSQL");
                        return [4 /*yield*/, connection_1.db.select().from(schema_1.applications).where(drizzle_orm_1.eq(schema_1.applications.jobId, jobId))];
                    case 1:
                        applications = _a.sent();
                        console.log("Retrieved " + applications.length + " applications for job " + jobId + " from PostgreSQL");
                        return [2 /*return*/, applications];
                    case 2:
                        error_13 = _a.sent();
                        console.error('PostgreSQL error in getApplicationsByJobId:', error_13);
                        throw error_13;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    PostgresStorage.prototype.getApplicationsForUser = function (userId) {
        return __awaiter(this, void 0, Promise, function () {
            var jobs, jobIds, applications, error_14;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        // Get all jobs by this user
                        console.log("Getting applications for user " + userId + " from PostgreSQL");
                        return [4 /*yield*/, this.getJobsByUserId(userId)];
                    case 1:
                        jobs = _a.sent();
                        jobIds = jobs.map(function (job) { return job.id; });
                        if (jobIds.length === 0) {
                            console.log("User " + userId + " has no jobs, returning empty applications array");
                            return [2 /*return*/, []];
                        }
                        return [4 /*yield*/, connection_1.db.select().from(schema_1.applications).where(schema_1.applications.jobId["in"](jobIds))];
                    case 2:
                        applications = _a.sent();
                        console.log("Retrieved " + applications.length + " applications for user " + userId + " from PostgreSQL");
                        return [2 /*return*/, applications];
                    case 3:
                        error_14 = _a.sent();
                        console.error('PostgreSQL error in getApplicationsForUser:', error_14);
                        throw error_14;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    PostgresStorage.prototype.createApplication = function (insertApplication) {
        return __awaiter(this, void 0, Promise, function () {
            var referenceId, applications, error_15;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log('Creating application in PostgreSQL');
                        referenceId = this.generateReferenceId();
                        return [4 /*yield*/, connection_1.db
                                .insert(schema_1.applications)
                                .values(__assign(__assign({}, insertApplication), { referenceId: referenceId }))
                                .returning()];
                    case 1:
                        applications = _a.sent();
                        console.log('Application created in PostgreSQL');
                        return [2 /*return*/, applications[0]];
                    case 2:
                        error_15 = _a.sent();
                        console.error('PostgreSQL error in createApplication:', error_15);
                        throw error_15;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    PostgresStorage.prototype.updateApplication = function (id, updateData) {
        return __awaiter(this, void 0, Promise, function () {
            var applications, error_16;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log("Updating application " + id + " in PostgreSQL");
                        return [4 /*yield*/, connection_1.db
                                .update(schema_1.applications)
                                .set(updateData)
                                .where(drizzle_orm_1.eq(schema_1.applications.id, id))
                                .returning()];
                    case 1:
                        applications = _a.sent();
                        console.log('Application updated in PostgreSQL');
                        return [2 /*return*/, applications[0]];
                    case 2:
                        error_16 = _a.sent();
                        console.error('PostgreSQL error in updateApplication:', error_16);
                        throw error_16;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Notes methods
    PostgresStorage.prototype.saveApplicationNote = function (applicationId, note) {
        return __awaiter(this, void 0, Promise, function () {
            var error_17;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log("Saving note for application " + applicationId + " in PostgreSQL");
                        return [4 /*yield*/, connection_1.db
                                .update(schema_1.applications)
                                .set({ notes: note })
                                .where(drizzle_orm_1.eq(schema_1.applications.id, applicationId))];
                    case 1:
                        _a.sent();
                        console.log('Note saved in PostgreSQL');
                        return [2 /*return*/, true];
                    case 2:
                        error_17 = _a.sent();
                        console.error('PostgreSQL error in saveApplicationNote:', error_17);
                        throw error_17;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    PostgresStorage.prototype.getApplicationNote = function (applicationId) {
        return __awaiter(this, void 0, Promise, function () {
            var application, error_18;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log("Getting note for application " + applicationId + " from PostgreSQL");
                        return [4 /*yield*/, this.getApplicationById(applicationId)];
                    case 1:
                        application = _a.sent();
                        console.log("Note found: " + ((application === null || application === void 0 ? void 0 : application.notes) ? 'yes' : 'no'));
                        return [2 /*return*/, application === null || application === void 0 ? void 0 : application.notes];
                    case 2:
                        error_18 = _a.sent();
                        console.error('PostgreSQL error in getApplicationNote:', error_18);
                        throw error_18;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Activity methods
    PostgresStorage.prototype.getActivities = function () {
        return __awaiter(this, void 0, Promise, function () {
            var activities, error_19;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log('Getting all activities from PostgreSQL');
                        return [4 /*yield*/, connection_1.db.select().from(schema_1.activities)];
                    case 1:
                        activities = _a.sent();
                        console.log("Retrieved " + activities.length + " activities from PostgreSQL");
                        return [2 /*return*/, activities];
                    case 2:
                        error_19 = _a.sent();
                        console.error('PostgreSQL error in getActivities:', error_19);
                        throw error_19;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    PostgresStorage.prototype.getActivitiesByUserId = function (userId) {
        return __awaiter(this, void 0, Promise, function () {
            var activities, error_20;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log("Getting activities for user " + userId + " from PostgreSQL");
                        return [4 /*yield*/, connection_1.db.select().from(schema_1.activities)
                                .where(drizzle_orm_1.eq(schema_1.activities.userId, userId))
                                .orderBy(drizzle_orm_1.desc(schema_1.activities.timestamp))];
                    case 1:
                        activities = _a.sent();
                        console.log("Retrieved " + activities.length + " activities for user " + userId + " from PostgreSQL");
                        return [2 /*return*/, activities];
                    case 2:
                        error_20 = _a.sent();
                        console.error('PostgreSQL error in getActivitiesByUserId:', error_20);
                        throw error_20;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    PostgresStorage.prototype.createActivity = function (insertActivity) {
        return __awaiter(this, void 0, Promise, function () {
            var activities, error_21;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log('Creating activity in PostgreSQL');
                        return [4 /*yield*/, connection_1.db.insert(schema_1.activities).values(insertActivity).returning()];
                    case 1:
                        activities = _a.sent();
                        console.log('Activity created in PostgreSQL');
                        return [2 /*return*/, activities[0]];
                    case 2:
                        error_21 = _a.sent();
                        console.error('PostgreSQL error in createActivity:', error_21);
                        throw error_21;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Helper method
    PostgresStorage.prototype.generateReferenceId = function () {
        var year = new Date().getFullYear();
        var randomPart = uuid_1.v4().substring(0, 5).toUpperCase();
        return "SEV-" + year + "-" + randomPart;
    };
    return PostgresStorage;
}());
exports.PostgresStorage = PostgresStorage;
// Export a single instance of the storage
exports.storage = new PostgresStorage();
// Export functions to be called from index.ts
function setDatabaseConnection(dbConnection) {
    console.log('setDatabaseConnection called');
    // Nothing to do as we're using the imported 'db' directly
}
exports.setDatabaseConnection = setDatabaseConnection;
function setSessionStore(store) {
    console.log('setSessionStore called');
    exports.storage.setSessionStore(store);
}
exports.setSessionStore = setSessionStore;
