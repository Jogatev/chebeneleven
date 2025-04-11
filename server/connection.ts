import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Use the connection string directly here
export const DB_CONNECTION_STRING = process.env.DB_CONNECTION_STRING || 'postgresql://neondb_owner:npg_eFrPutD1n9dE@ep-aged-darkness-a1bh7bgl-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

// Create a PostgreSQL client
const queryClient = postgres(DB_CONNECTION_STRING, {
  ssl: 'require', // Needed for Neon.tech
  max: 10, // Connection pool size
  idle_timeout: 20, // How long a connection can be idle before being closed
  connect_timeout: 30, // Connection timeout in seconds
});

// Create a Drizzle client using the PostgreSQL client
export const db = drizzle(queryClient);