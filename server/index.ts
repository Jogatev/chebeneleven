import express, { type Express } from "express";
import cors from "cors";
import { createServer, type Server } from "http";
import { registerRoutes } from "./routes";
import { setupSession } from "./session";
import { setupFileUpload } from "./file-upload";
import { config, validateConfig } from "./config";
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { users, jobListings, applications, activities } from '@shared/schema';
import { storage, setDatabaseConnection, setSessionStore } from './unified-storage';
import createMemoryStore from "memorystore";
import session from "express-session";
import { Pool } from 'pg';

export const DB_TYPE = process.env.DB_TYPE || 'memory';

export const DB_CONNECTION_STRING = config.database.connectionString;

declare global {
  namespace Express {
    interface Request {
      db?: any;
      drizzle?: any;
      storage?: any;
    }
  }
}

export async function createApp(): Promise<{ app: Express; server: Server }> {
  const app = express();

  app.set('trust proxy', 1);

  let db: any = null;
  let drizzleDb: any = null;

  if (DB_TYPE === 'postgres') {
    const pool = new Pool({
      connectionString: DB_CONNECTION_STRING,
    });

    try {
      await pool.connect();
      console.log('PostgreSQL connection successful');

      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          franchise_name TEXT NOT NULL,
          franchisee_id TEXT NOT NULL UNIQUE,
          location TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS job_listings (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          location TEXT NOT NULL,
          description TEXT NOT NULL,
          requirements TEXT NOT NULL,
          job_type TEXT NOT NULL,
          department TEXT,
          pay_range TEXT,
          benefits TEXT,
          status TEXT NOT NULL DEFAULT 'active',
          created_at TIMESTAMP DEFAULT NOW() NOT NULL,
          closing_date TIMESTAMP,
          tags JSONB DEFAULT '[]'::jsonb
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS applications (
          id SERIAL PRIMARY KEY,
          job_id INTEGER NOT NULL,
          reference_id TEXT NOT NULL UNIQUE,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT NOT NULL,
          address TEXT,
          city TEXT,
          zip_code TEXT,
          resume_url TEXT,
          experience TEXT,
          education TEXT,
          cover_letter TEXT,
          available_shifts JSONB,
          work_availability JSONB,
          start_date TIMESTAMP,
          status TEXT NOT NULL DEFAULT 'submitted',
          submitted_at TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS activities (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          action TEXT NOT NULL,
          entity_type TEXT NOT NULL,
          entity_id INTEGER NOT NULL,
          details JSONB DEFAULT '{}'::jsonb,
          timestamp TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `);

      drizzleDb = drizzle(pool);
      db = { pool, drizzle: drizzleDb };
      setDatabaseConnection(db);

      const sessionConfig = {
        secret: config.auth.sessionSecret,
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: process.env.NODE_ENV === 'production',
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000,
        },
        store: new (require('connect-pg-simple')(session))({
          conString: DB_CONNECTION_STRING,
          tableName: 'sessions',
          createTableIfMissing: true,
        }),
      };

      setSessionStore(sessionConfig.store);
      await setupSession(app, { pool });
    } catch (error) {
      console.error('PostgreSQL connection failed:', error);
      console.log('Falling back to memory storage');
      
      const MemStore = createMemoryStore(session);
      const sessionConfig = {
        secret: config.auth.sessionSecret,
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: process.env.NODE_ENV === 'production',
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000,
        },
        store: new MemStore({
          checkPeriod: 86400000,
        }),
      };

      setSessionStore(sessionConfig.store);
      await setupSession(app, { pool: null });
    }
  } else {
    const MemStore = createMemoryStore(session);
    const sessionConfig = {
      secret: config.auth.sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      },
      store: new MemStore({
        checkPeriod: 86400000,
      }),
    };

    setSessionStore(sessionConfig.store);
    await setupSession(app, { pool: null });
  }

  app.use(cors(config.cors));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      const method = req.method;
      const url = req.url;
      const status = res.statusCode;
      const userAgent = req.get('User-Agent') || 'Unknown';
      const ip = req.ip || req.connection.remoteAddress || 'Unknown';
      
      console.log(`${method} ${url} ${status} ${duration}ms - ${ip} - ${userAgent}`);
    });
    next();
  });

  app.use((err: any, req: any, res: any, next: any) => {
    console.error('Error:', err);
    if (res.headersSent) {
      return next(err);
    }
    res.status(500).json({ error: 'Internal Server Error' });
  });

  app.use((req, res, next) => {
    req.db = db;
    req.drizzle = drizzleDb;
    next();
  });

  app.use((req, res, next) => {
    req.storage = storage;
    next();
  });

  setupFileUpload(app);

  app.use(config.api.basePath, await registerRoutes(app));

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  const server = await createServer(app);

  server.on('error', (error) => {
    console.error('Server error:', error);
  });

  return { app, server };
}