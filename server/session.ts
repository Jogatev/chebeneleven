import session from 'express-session';
import { Express } from 'express';
import ConnectPgSimple from 'connect-pg-simple';
import MemoryStore from 'memorystore';
import { config } from './config';

const sessionConfig: session.SessionOptions = {
  secret: config.auth.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: config.auth.sessionMaxAge,
  },
};

export default sessionConfig;

export async function setupSession(app: Express, db: any = null) {
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