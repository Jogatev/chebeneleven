import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db } from './connection';

async function runMigration() {
  console.log('Running migrations...');
  
  try {
    await migrate(db, { migrationsFolder: './server/db/migrations' });
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();