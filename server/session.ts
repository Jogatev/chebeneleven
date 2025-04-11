import session from 'express-session';
import { Express } from 'express';
import ConnectPgSimple from 'connect-pg-simple';
import MemoryStore from 'memorystore';

export async function setupSession(app: Express, db: any = null) {
  const secret = process.env.SESSION_SECRET || 'seven-eleven-careers-secret';
  
  // Basic session configuration
  const sessionConfig: session.SessionOptions = {
    secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  };
  
  // If PostgreSQL is available, use it for session storage
  if (db) {
    const PgStore = ConnectPgSimple(session);
    sessionConfig.store = new PgStore({
      // The table needs to be created first - check connect-pg-simple docs
      pool: db.pool, // Use the connection pool from the db
      tableName: 'sessions',
      createTableIfMissing: true,
    });
  } else {
    // Otherwise use memory store
    const MemStore = MemoryStore(session);
    sessionConfig.store = new MemStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }
  
  // Apply session middleware
  app.use(session(sessionConfig));
}