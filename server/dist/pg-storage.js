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
exports.PostgresStorage = void 0;
var connection_1 = require("../db/connection");
var schema_1 = require("../../shared/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var PostgresStorage = /** @class */ (function () {
    function PostgresStorage() {
    }
    // User methods
    PostgresStorage.prototype.getUser = function (id) {
        return __awaiter(this, void 0, Promise, function () {
            var users;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, connection_1.db.select().from(schema_1.usersTable).where(drizzle_orm_1.eq(schema_1.usersTable.id, id))];
                    case 1:
                        users = _a.sent();
                        return [2 /*return*/, users[0]];
                }
            });
        });
    };
    PostgresStorage.prototype.getUserByUsername = function (username) {
        return __awaiter(this, void 0, Promise, function () {
            var users;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, connection_1.db.select().from(schema_1.usersTable).where(drizzle_orm_1.eq(schema_1.usersTable.username, username))];
                    case 1:
                        users = _a.sent();
                        return [2 /*return*/, users[0]];
                }
            });
        });
    };
    PostgresStorage.prototype.createUser = function (insertUser) {
        return __awaiter(this, void 0, Promise, function () {
            var users;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, connection_1.db.insert(schema_1.usersTable).values(insertUser).returning()];
                    case 1:
                        users = _a.sent();
                        return [2 /*return*/, users[0]];
                }
            });
        });
    };
    // Job methods
    PostgresStorage.prototype.getJobs = function () {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, connection_1.db.select().from(schema_1.jobListingsTable).orderBy(drizzle_orm_1.desc(schema_1.jobListingsTable.createdAt))];
            });
        });
    };
    PostgresStorage.prototype.getJobById = function (id) {
        return __awaiter(this, void 0, Promise, function () {
            var jobs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, connection_1.db.select().from(schema_1.jobListingsTable).where(drizzle_orm_1.eq(schema_1.jobListingsTable.id, id))];
                    case 1:
                        jobs = _a.sent();
                        return [2 /*return*/, jobs[0]];
                }
            });
        });
    };
    PostgresStorage.prototype.getJobsByUserId = function (userId) {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, connection_1.db.select().from(schema_1.jobListingsTable).where(drizzle_orm_1.eq(schema_1.jobListingsTable.userId, userId))];
            });
        });
    };
    PostgresStorage.prototype.createJob = function (insertJob) {
        return __awaiter(this, void 0, Promise, function () {
            var jobs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, connection_1.db.insert(schema_1.jobListingsTable).values(insertJob).returning()];
                    case 1:
                        jobs = _a.sent();
                        return [2 /*return*/, jobs[0]];
                }
            });
        });
    };
    PostgresStorage.prototype.updateJob = function (id, updateData) {
        return __awaiter(this, void 0, Promise, function () {
            var jobs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, connection_1.db
                            .update(schema_1.jobListingsTable)
                            .set(updateData)
                            .where(drizzle_orm_1.eq(schema_1.jobListingsTable.id, id))
                            .returning()];
                    case 1:
                        jobs = _a.sent();
                        return [2 /*return*/, jobs[0]];
                }
            });
        });
    };
    PostgresStorage.prototype.deleteJob = function (id) {
        return __awaiter(this, void 0, Promise, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, connection_1.db["delete"](schema_1.jobListingsTable).where(drizzle_orm_1.eq(schema_1.jobListingsTable.id, id))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, true]; // Postgres doesn't return the deleted records by default
                }
            });
        });
    };
    // Application methods
    PostgresStorage.prototype.getApplications = function () {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, connection_1.db.select().from(schema_1.applicationsTable).orderBy(drizzle_orm_1.desc(schema_1.applicationsTable.submittedAt))];
            });
        });
    };
    PostgresStorage.prototype.getApplicationById = function (id) {
        return __awaiter(this, void 0, Promise, function () {
            var applications;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, connection_1.db.select().from(schema_1.applicationsTable).where(drizzle_orm_1.eq(schema_1.applicationsTable.id, id))];
                    case 1:
                        applications = _a.sent();
                        return [2 /*return*/, applications[0]];
                }
            });
        });
    };
    PostgresStorage.prototype.getApplicationsByJobId = function (jobId) {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, connection_1.db.select().from(schema_1.applicationsTable).where(drizzle_orm_1.eq(schema_1.applicationsTable.jobId, jobId))];
            });
        });
    };
    PostgresStorage.prototype.getApplicationsByUserId = function (userId) {
        return __awaiter(this, void 0, Promise, function () {
            var jobs, jobIds;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getJobsByUserId(userId)];
                    case 1:
                        jobs = _a.sent();
                        jobIds = jobs.map(function (job) { return job.id; });
                        if (jobIds.length === 0)
                            return [2 /*return*/, []];
                        // Get applications for these jobs
                        return [2 /*return*/, connection_1.db.select().from(schema_1.applicationsTable).where(schema_1.applicationsTable.jobId["in"](jobIds))];
                }
            });
        });
    };
    PostgresStorage.prototype.createApplication = function (insertApplication) {
        return __awaiter(this, void 0, Promise, function () {
            var referenceId, applications;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        referenceId = this.generateReferenceId();
                        return [4 /*yield*/, connection_1.db
                                .insert(schema_1.applicationsTable)
                                .values(__assign(__assign({}, insertApplication), { referenceId: referenceId }))
                                .returning()];
                    case 1:
                        applications = _a.sent();
                        return [2 /*return*/, applications[0]];
                }
            });
        });
    };
    PostgresStorage.prototype.updateApplication = function (id, updateData) {
        return __awaiter(this, void 0, Promise, function () {
            var applications;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, connection_1.db
                            .update(schema_1.applicationsTable)
                            .set(updateData)
                            .where(drizzle_orm_1.eq(schema_1.applicationsTable.id, id))
                            .returning()];
                    case 1:
                        applications = _a.sent();
                        return [2 /*return*/, applications[0]];
                }
            });
        });
    };
    // Activity methods
    PostgresStorage.prototype.createActivity = function (insertActivity) {
        return __awaiter(this, void 0, Promise, function () {
            var activities;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, connection_1.db.insert(schema_1.activitiesTable).values(insertActivity).returning()];
                    case 1:
                        activities = _a.sent();
                        return [2 /*return*/, activities[0]];
                }
            });
        });
    };
    PostgresStorage.prototype.getActivitiesByUserId = function (userId) {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, connection_1.db.select().from(schema_1.activitiesTable)
                        .where(drizzle_orm_1.eq(schema_1.activitiesTable.userId, userId))
                        .orderBy(drizzle_orm_1.desc(schema_1.activitiesTable.timestamp))];
            });
        });
    };
    // Helper methods
    PostgresStorage.prototype.generateReferenceId = function () {
        var year = new Date().getFullYear();
        var randomPart = uuid_1.v4().substring(0, 5).toUpperCase();
        return "SEV-" + year + "-" + randomPart;
    };
    return PostgresStorage;
}());
exports.PostgresStorage = PostgresStorage;
