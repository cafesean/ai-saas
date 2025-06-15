import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Configure postgres-js with connection pooling
const client = postgres(connectionString, {
  // Connection pool configuration
  max: 10, // Maximum number of connections in the pool
  idle_timeout: 20, // Close idle connections after 20 seconds
  max_lifetime: 60 * 30, // Close connections after 30 minutes
  connect_timeout: 30, // Connection timeout in seconds
  
  // Additional configuration for better connection management
  prepare: false, // Disable prepared statements for better compatibility
  transform: {
    undefined: null, // Transform undefined to null for PostgreSQL
  },
  
  // Enable connection debugging in development
  debug: process.env.NODE_ENV === 'development' ? false : false,
});

export const db = drizzle(client, { schema }); 