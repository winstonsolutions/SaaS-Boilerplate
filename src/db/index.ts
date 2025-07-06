import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { Env } from '@/libs/Env';

import * as schema from './schema';

// Initialize the database connection
const connectionString = Env.DATABASE_URL;

// Make sure the connection string is defined
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not defined');
}

const client = postgres(connectionString);
export const db = drizzle(client, { schema });

// Export the connection for use in API routes
export { client };
