import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

// For Supabase, we'll use the connection string approach
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error(
    "SUPABASE_URL and SUPABASE_ANON_KEY must be set. Please check your environment variables.",
  );
}

// Create Supabase client for auth and other features
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// For database operations, we'll use the direct PostgreSQL connection
// Extract the database URL from Supabase URL
const supabaseUrl = new URL(process.env.SUPABASE_URL);
const databaseUrl = `postgresql://postgres:[YOUR-PASSWORD]@${supabaseUrl.hostname}:5432/postgres`;

// Note: You'll need to replace [YOUR-PASSWORD] with your actual database password
// Or set DATABASE_URL environment variable with the full connection string
const connectionString = process.env.DATABASE_URL || databaseUrl;

const client = postgres(connectionString);
export const db = drizzle(client, { schema });