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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
exports.setupAuth = void 0;
var passport_1 = require("passport");
var passport_local_1 = require("passport-local");
var express_session_1 = require("express-session");
var crypto_1 = require("crypto");
var util_1 = require("util");
var unified_storage_1 = require("./unified-storage");
var schema_1 = require("@shared/schema");
var zod_validation_error_1 = require("zod-validation-error");
var drizzle_orm_1 = require("drizzle-orm");
var scryptAsync = util_1.promisify(crypto_1.scrypt);
function hashPassword(password) {
    return __awaiter(this, void 0, void 0, function () {
        var salt, buf;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    salt = crypto_1.randomBytes(16).toString("hex");
                    return [4 /*yield*/, scryptAsync(password, salt, 64)];
                case 1:
                    buf = (_a.sent());
                    return [2 /*return*/, buf.toString("hex") + "." + salt];
            }
        });
    });
}
function comparePasswords(supplied, stored) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, hashed, salt, hashedBuf, suppliedBuf;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = stored.split("."), hashed = _a[0], salt = _a[1];
                    hashedBuf = Buffer.from(hashed, "hex");
                    return [4 /*yield*/, scryptAsync(supplied, salt, 64)];
                case 1:
                    suppliedBuf = (_b.sent());
                    return [2 /*return*/, crypto_1.timingSafeEqual(hashedBuf, suppliedBuf)];
            }
        });
    });
}
function setupAuth(app) {
    var _this = this;
    // If no SESSION_SECRET is set, create a random one
    var sessionSecret = process.env.SESSION_SECRET || crypto_1.randomBytes(32).toString("hex");
    var sessionSettings = {
        secret: sessionSecret,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 7 * 24 * 60 * 60 * 1000
        }
    };
    app.set("trust proxy", 1);
    app.use(express_session_1["default"](sessionSettings));
    app.use(passport_1["default"].initialize());
    app.use(passport_1["default"].session());
    // Define the local strategy with explicit access to request
    passport_1["default"].use(new passport_local_1.Strategy({ passReqToCallback: true }, // This is the key change
    function (req, username, password, done) { return __awaiter(_this, void 0, void 0, function () {
        var user, result, err_1, _a, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 11, , 12]);
                    user = void 0;
                    if (!req.db) return [3 /*break*/, 6];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 5]);
                    return [4 /*yield*/, req.db.select().from(schema_1.users).where(drizzle_orm_1.eq(schema_1.users.username, username))];
                case 2:
                    result = _b.sent();
                    user = result.length > 0 ? result[0] : null;
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _b.sent();
                    console.error('Error querying PostgreSQL:', err_1);
                    return [4 /*yield*/, unified_storage_1.storage.getUserByUsername(username)];
                case 4:
                    // Fall back to in-memory storage if PostgreSQL query fails
                    user = _b.sent();
                    return [3 /*break*/, 5];
                case 5: return [3 /*break*/, 8];
                case 6: return [4 /*yield*/, unified_storage_1.storage.getUserByUsername(username)];
                case 7:
                    // Use in-memory storage
                    user = _b.sent();
                    _b.label = 8;
                case 8:
                    _a = !user;
                    if (_a) return [3 /*break*/, 10];
                    return [4 /*yield*/, comparePasswords(password, user.password)];
                case 9:
                    _a = !(_b.sent());
                    _b.label = 10;
                case 10:
                    if (_a) {
                        return [2 /*return*/, done(null, false)];
                    }
                    else {
                        return [2 /*return*/, done(null, user)];
                    }
                    return [3 /*break*/, 12];
                case 11:
                    error_1 = _b.sent();
                    return [2 /*return*/, done(error_1)];
                case 12: return [2 /*return*/];
            }
        });
    }); }));
    passport_1["default"].serializeUser(function (user, done) { return done(null, user.id); });
    passport_1["default"].deserializeUser(function (id, done) { return __awaiter(_this, void 0, void 0, function () {
        var user, err_2, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, unified_storage_1.storage.getUser(id)];
                case 2:
                    user = _a.sent();
                    if (user) {
                        return [2 /*return*/, done(null, user)];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_2 = _a.sent();
                    // Ignore errors from in-memory storage and try DB next
                    console.log('In-memory storage lookup failed:', err_2.message);
                    return [3 /*break*/, 4];
                case 4: 
                // If we're here, either in-memory failed or user wasn't found
                // The req.db check will happen in subsequent middleware
                return [2 /*return*/, done(null, { id: id })]; // Pass minimal user with ID for later PostgreSQL lookup
                case 5:
                    error_2 = _a.sent();
                    console.error('Error deserializing user:', error_2);
                    done(error_2);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); });
    // Middleware to fully load user from PostgreSQL if needed
    app.use(function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
        var result, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(req.user && req.db && Object.keys(req.user).length === 1 && req.user.id)) return [3 /*break*/, 4];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, req.db.select().from(schema_1.users).where(drizzle_orm_1.eq(schema_1.users.id, req.user.id))];
                case 2:
                    result = _a.sent();
                    if (result.length > 0) {
                        req.user = result[0];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    console.error('Error fetching full user from PostgreSQL:', error_3);
                    return [3 /*break*/, 4];
                case 4:
                    next();
                    return [2 /*return*/];
            }
        });
    }); });
    // Register a new franchisee
    app.post("/api/register", function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
        var parseResult_1, validationError, existingUser, allUsers, result, error_4, existingFranchiseeId, userData, _a, _b, user_1, result, error_5, error_6;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 20, , 21]);
                    parseResult_1 = schema_1.insertUserSchema.safeParse(req.body);
                    if (!parseResult_1.success) {
                        validationError = zod_validation_error_1.fromZodError(parseResult_1.error);
                        return [2 /*return*/, res.status(400).json({ error: validationError.message })];
                    }
                    existingUser = void 0;
                    allUsers = void 0;
                    if (!req.db) return [3 /*break*/, 8];
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 4, , 7]);
                    return [4 /*yield*/, req.db.select().from(schema_1.users).where(drizzle_orm_1.eq(schema_1.users.username, parseResult_1.data.username))];
                case 2:
                    result = _c.sent();
                    existingUser = result.length > 0 ? result[0] : null;
                    return [4 /*yield*/, req.db.select().from(schema_1.users)];
                case 3:
                    allUsers = _c.sent();
                    return [3 /*break*/, 7];
                case 4:
                    error_4 = _c.sent();
                    console.error('Error checking existing users in PostgreSQL:', error_4);
                    return [4 /*yield*/, unified_storage_1.storage.getUserByUsername(parseResult_1.data.username)];
                case 5:
                    // Fall back to in-memory
                    existingUser = _c.sent();
                    return [4 /*yield*/, unified_storage_1.storage.getUsers()];
                case 6:
                    allUsers = _c.sent();
                    return [3 /*break*/, 7];
                case 7: return [3 /*break*/, 11];
                case 8: return [4 /*yield*/, unified_storage_1.storage.getUserByUsername(parseResult_1.data.username)];
                case 9:
                    // Fall back to in-memory storage
                    existingUser = _c.sent();
                    return [4 /*yield*/, unified_storage_1.storage.getUsers()];
                case 10:
                    allUsers = _c.sent();
                    _c.label = 11;
                case 11:
                    // Check if username already exists
                    if (existingUser) {
                        return [2 /*return*/, res.status(400).json({ error: "Username already exists" })];
                    }
                    existingFranchiseeId = allUsers.find(function (u) { return u.franchiseeId === parseResult_1.data.franchiseeId; });
                    if (existingFranchiseeId) {
                        return [2 /*return*/, res.status(400).json({ error: "Franchisee ID already exists" })];
                    }
                    _a = [__assign({}, parseResult_1.data)];
                    _b = {};
                    return [4 /*yield*/, hashPassword(parseResult_1.data.password)];
                case 12:
                    userData = __assign.apply(void 0, _a.concat([(_b.password = _c.sent(), _b)]));
                    if (!req.db) return [3 /*break*/, 17];
                    _c.label = 13;
                case 13:
                    _c.trys.push([13, 15, , 16]);
                    return [4 /*yield*/, req.db.insert(schema_1.users).values(userData).returning()];
                case 14:
                    result = _c.sent();
                    user_1 = result.length > 0 ? result[0] : null;
                    return [3 /*break*/, 16];
                case 15:
                    error_5 = _c.sent();
                    console.error('Error creating user in PostgreSQL:', error_5);
                    // Don't fall back to in-memory here - if PostgreSQL fails, we should return an error
                    return [2 /*return*/, res.status(500).json({ error: "Failed to create user in database" })];
                case 16: return [3 /*break*/, 19];
                case 17: return [4 /*yield*/, unified_storage_1.storage.createUser(userData)];
                case 18:
                    user_1 = _c.sent();
                    _c.label = 19;
                case 19:
                    if (!user_1) {
                        throw new Error("Failed to create user");
                    }
                    // Log the user in
                    req.login(user_1, function (err) {
                        if (err)
                            return next(err);
                        // Return user without password
                        var password = user_1.password, userWithoutPassword = __rest(user_1, ["password"]);
                        res.status(201).json(userWithoutPassword);
                    });
                    return [3 /*break*/, 21];
                case 20:
                    error_6 = _c.sent();
                    console.error("Registration error:", error_6);
                    res.status(500).json({ error: "Registration failed" });
                    return [3 /*break*/, 21];
                case 21: return [2 /*return*/];
            }
        });
    }); });
    // Login endpoint
    app.post("/api/login", function (req, res, next) {
        passport_1["default"].authenticate("local", function (err, user, info) {
            if (err)
                return next(err);
            if (!user) {
                return res.status(401).json({ error: "Invalid username or password" });
            }
            req.login(user, function (err) {
                if (err)
                    return next(err);
                // Return user without password
                var password = user.password, userWithoutPassword = __rest(user, ["password"]);
                res.status(200).json(userWithoutPassword);
            });
        })(req, res, next);
    });
    // Logout endpoint
    app.post("/api/logout", function (req, res, next) {
        req.logout(function (err) {
            if (err)
                return next(err);
            res.sendStatus(200);
        });
    });
    // Get current user endpoint
    app.get("/api/user", function (req, res) {
        if (!req.isAuthenticated()) {
            return res.status(401).json({ error: "Not authenticated" });
        }
        // Return user without password
        var _a = req.user, password = _a.password, userWithoutPassword = __rest(_a, ["password"]);
        res.json(userWithoutPassword);
    });
}
exports.setupAuth = setupAuth;
