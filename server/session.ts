import session from 'express-session';
import { Express } from 'express';
import ConnectPgSimple from 'connect-pg-simple';
import MemoryStore from 'memorystore';

export async function setupSession(app: Express, db: any = null) {
  const secret = process.env.SESSION_SECRET || 'seven-eleven-careers-secret';
  
  const sessionConfig: session.SessionOptions = {
    secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  };
  
  if (db) {
    const PgStore = ConnectPgSimple(session);
    sessionConfig.store = new PgStore({
      pool: db.pool,
      tableName: 'sessions',
      createTableIfMissing: true,
    });
  } else {
    const MemStore = MemoryStore(session);
    sessionConfig.store = new MemStore({
      checkPeriod: 86400000,
    });
  }
  
  app.use(session(sessionConfig));
}