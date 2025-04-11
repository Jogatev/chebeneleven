"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.DB_CONNECTION_STRING = exports.DB_TYPE = void 0;
var express_1 = require("express");
var routes_1 = require("./routes");
var vite_1 = require("./vite");
var file_upload_1 = require("./file-upload");
var express_session_1 = require("express-session");
var memorystore_1 = require("memorystore");
var connect_pg_simple_1 = require("connect-pg-simple");
var postgres_js_1 = require("drizzle-orm/postgres-js");
var postgres_1 = require("postgres");
var unified_storage_1 = require("./unified-storage");
var drizzle_orm_1 = require("drizzle-orm");
var schema_1 = require("@shared/schema");
// Export DB_TYPE so it can be imported in other files
exports.DB_TYPE = process.env.DB_TYPE || 'postgres';
exports.DB_CONNECTION_STRING = process.env.DB_CONNECTION_STRING || 'postgresql://neondb_owner:npg_eFrPutD1n9dE@ep-aged-darkness-a1bh7bgl-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
var SESSION_SECRET = process.env.SESSION_SECRET || 'seven-eleven-careers-secret';
var app = express_1["default"]();
app.use(express_1["default"].json());
app.use(express_1["default"].urlencoded({ extended: false }));
// Initialize database connection if using PostgreSQL
var db = null;
if (exports.DB_TYPE === 'postgres') {
    try {
        // Create connection pool
        console.log('Attempting to connect to PostgreSQL...');
        var queryClient = postgres_1["default"](exports.DB_CONNECTION_STRING, {
            ssl: 'require',
            max: 10,
            idle_timeout: 20,
            connect_timeout: 30
        });
        // Test the connection
        queryClient(templateObject_1 || (templateObject_1 = __makeTemplateObject(["SELECT 1"], ["SELECT 1"]))).then(function () {
            console.log('PostgreSQL connection test successful');
            // Test database tables after successful connection
            if (db) {
                console.log('Testing database tables...');
                db.select({ count: drizzle_orm_1.sql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["count(*)"], ["count(*)"]))) }).from(schema_1.users)
                    .then(function (result) { return console.log('Users table count:', result); })["catch"](function (error) { return console.error('Users table test failed:', error); });
                db.select({ count: drizzle_orm_1.sql(templateObject_3 || (templateObject_3 = __makeTemplateObject(["count(*)"], ["count(*)"]))) }).from(schema_1.jobListings)
                    .then(function (result) { return console.log('Jobs table count:', result); })["catch"](function (error) { return console.error('Jobs table test failed:', error); });
            }
        })["catch"](function (error) {
            console.error('PostgreSQL connection test failed:', error);
        });
        // Create a drizzle instance
        db = postgres_js_1.drizzle(queryClient);
        vite_1.log('PostgreSQL database connection initialized');
    }
    catch (error) {
        console.error('Failed to initialize PostgreSQL connection:', error);
        vite_1.log('Falling back to in-memory storage');
    }
}
// Setup session with appropriate store
var sessionConfig = {
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
};
if (exports.DB_TYPE === 'postgres') {
    // Use PostgreSQL for session storage
    var PgStore = connect_pg_simple_1["default"](express_session_1["default"]);
    sessionConfig.store = new PgStore({
        conString: exports.DB_CONNECTION_STRING,
        tableName: 'sessions',
        createTableIfMissing: true,
        ssl: true
    });
    vite_1.log('Using PostgreSQL for session storage');
    // Set the session store in the unified storage
    unified_storage_1.setSessionStore(sessionConfig.store);
}
else {
    // Use memory store
    var MemStore = memorystore_1["default"](express_session_1["default"]);
    sessionConfig.store = new MemStore({
        checkPeriod: 86400000
    });
    vite_1.log('Using in-memory session storage');
}
app.use(express_session_1["default"](sessionConfig));
// Add request/response logging middleware
app.use(function (req, res, next) {
    var start = Date.now();
    var path = req.path;
    var capturedJsonResponse = undefined;
    var originalResJson = res.json;
    res.json = function (bodyJson) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        capturedJsonResponse = bodyJson;
        return originalResJson.apply(res, __spreadArrays([bodyJson], args));
    };
    res.on("finish", function () {
        var duration = Date.now() - start;
        if (path.startsWith("/api")) {
            var logLine = req.method + " " + path + " " + res.statusCode + " in " + duration + "ms";
            if (capturedJsonResponse) {
                logLine += " :: " + JSON.stringify(capturedJsonResponse);
            }
            if (logLine.length > 80) {
                logLine = logLine.slice(0, 79) + "…";
            }
            vite_1.log(logLine);
        }
    });
    next();
});
// Add error handling middleware for HTML responses
app.use(function (req, res, next) {
    var originalSend = res.send;
    res.send = function (body) {
        // Log all API responses for debugging
        if (req.path.startsWith('/api')) {
            console.log("API Response for " + req.method + " " + req.path + ":");
            try {
                // If it's a string that starts with <!DOCTYPE, it's HTML
                if (typeof body === 'string' && body.startsWith('<!DOCTYPE')) {
                    console.error('HTML response being sent instead of JSON for', req.path);
                    console.error(body.substring(0, 200) + '...');
                }
            }
            catch (e) {
                console.error('Error logging response:', e);
            }
        }
        return originalSend.call(this, body);
    };
    next();
});
// Add the database to the request object
app.use(function (req, res, next) {
    if (db) {
        req.db = db;
    }
    next();
});
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var server, port;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                // Set up file upload middleware
                file_upload_1.setupFileUpload(app);
                return [4 /*yield*/, routes_1.registerRoutes(app)];
            case 1:
                server = _a.sent();
                // Global error handler
                app.use(function (err, _req, res, _next) {
                    var status = err.status || err.statusCode || 500;
                    var message = err.message || "Internal Server Error";
                    res.status(status).json({ message: message });
                    throw err;
                });
                if (!(app.get("env") === "development")) return [3 /*break*/, 3];
                return [4 /*yield*/, vite_1.setupVite(app, server)];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                vite_1.serveStatic(app);
                _a.label = 4;
            case 4:
                port = 5000;
                server.listen({
                    port: port,
                    host: "0.0.0.0",
                    reusePort: true
                }, function () {
                    vite_1.log("Server running on port " + port);
                    vite_1.log("Database type: " + exports.DB_TYPE);
                    vite_1.log("Environment: " + app.get("env"));
                });
                return [2 /*return*/];
        }
    });
}); })();
var templateObject_1, templateObject_2, templateObject_3;
