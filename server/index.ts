import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { setupFileUpload } from "./file-upload";
import session from "express-session";
import MemoryStore from "memorystore";
import ConnectPgSimple from "connect-pg-simple";
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { storage, setSessionStore } from "./unified-storage";
import { sql } from 'drizzle-orm';
import { 
  users as usersTable, 
  jobListings as jobListingsTable, 
  applications as applicationsTable, 
  activities as activitiesTable 
} from "@shared/schema";

// Export DB_TYPE so it can be imported in other files
export const DB_TYPE = process.env.DB_TYPE || 'postgres';
export const DB_CONNECTION_STRING = process.env.DB_CONNECTION_STRING || 'postgresql://neondb_owner:npg_eFrPutD1n9dE@ep-aged-darkness-a1bh7bgl-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
const SESSION_SECRET = process.env.SESSION_SECRET || 'seven-eleven-careers-secret';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize database connection if using PostgreSQL
let db = null;
if (DB_TYPE === 'postgres') {
  try {
    // Create connection pool
    console.log('Attempting to connect to PostgreSQL...');
    const queryClient = postgres(DB_CONNECTION_STRING, {
      ssl: 'require', // Needed for Neon.tech
      max: 10, // Connection pool size
      idle_timeout: 20, // How long a connection can be idle before being closed
      connect_timeout: 30, // Connection timeout in seconds
    });
    
    // Test the connection
    queryClient`SELECT 1`.then(() => {
      console.log('PostgreSQL connection test successful');
      
      // Test database tables after successful connection
      if (db) {
        console.log('Testing database tables...');
        db.select({ count: sql`count(*)` }).from(usersTable)
          .then(result => console.log('Users table count:', result))
          .catch(error => console.error('Users table test failed:', error));
        
        db.select({ count: sql`count(*)` }).from(jobListingsTable)
          .then(result => console.log('Jobs table count:', result))
          .catch(error => console.error('Jobs table test failed:', error));
      }
    }).catch(error => {
      console.error('PostgreSQL connection test failed:', error);
    });
    
    // Create a drizzle instance
    db = drizzle(queryClient);
    log('PostgreSQL database connection initialized');
  } catch (error) {
    console.error('Failed to initialize PostgreSQL connection:', error);
    log('Falling back to in-memory storage');
  }
}

// Setup session with appropriate store
const sessionConfig: session.SessionOptions = {
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
};

if (DB_TYPE === 'postgres') {
  // Use PostgreSQL for session storage
  const PgStore = ConnectPgSimple(session);
  sessionConfig.store = new PgStore({
    conString: DB_CONNECTION_STRING, // Use the connection string directly
    tableName: 'sessions',
    createTableIfMissing: true,
    ssl: true
  });
  log('Using PostgreSQL for session storage');
  
  // Set the session store in the unified storage
  setSessionStore(sessionConfig.store);
} else {
  // Use memory store
  const MemStore = MemoryStore(session);
  sessionConfig.store = new MemStore({
    checkPeriod: 86400000, // prune expired entries every 24h
  });
  log('Using in-memory session storage');
}

app.use(session(sessionConfig));

// Add request/response logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Add error handling middleware for HTML responses
app.use((req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(body) {
    // Log all API responses for debugging
    if (req.path.startsWith('/api')) {
      console.log(`API Response for ${req.method} ${req.path}:`);
      try {
        // If it's a string that starts with <!DOCTYPE, it's HTML
        if (typeof body === 'string' && body.startsWith('<!DOCTYPE')) {
          console.error('HTML response being sent instead of JSON for', req.path);
          console.error(body.substring(0, 200) + '...');
        }
      } catch (e) {
        console.error('Error logging response:', e);
      }
    }
    
    return originalSend.call(this, body);
  };
  
  next();
});

// Make DB available in the request object
declare global {
  namespace Express {
    interface Request {
      db?: any;
    }
  }
}

// Add the database to the request object
app.use((req, res, next) => {
  if (db) {
    req.db = db;
  }
  next();
});

(async () => {
  // Set up file upload middleware
  setupFileUpload(app);
  
  const server = await registerRoutes(app);

  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`Server running on port ${port}`);
    log(`Database type: ${DB_TYPE}`);
    log(`Environment: ${app.get("env")}`);
  });
})();