import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

export const DB_CONNECTION_STRING = process.env.DB_CONNECTION_STRING || 'postgresql://neondb_owner:npg_eFrPutD1n9dE@ep-aged-darkness-a1bh7bgl-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

const sql = postgres(DB_CONNECTION_STRING, {
  ssl: 'require',
  max: 10,
  idle_timeout: 20,
  connect_timeout: 30,
});

export const db = drizzle(sql);