import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { config } from './config';

export const pool = new Pool({
  connectionString: config.database.connectionString,
});

export const db = drizzle(pool);