import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

// For development, allow fallback to Replit's PostgreSQL if Supabase not configured
const useSupabase = process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY;

if (!useSupabase && !process.env.DATABASE_URL) {
  throw new Error(
    "Either SUPABASE_URL + SUPABASE_ANON_KEY or DATABASE_URL must be set.",
  );
}

// Create Supabase client for auth and other features (if configured)
export const supabase = useSupabase ? createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
) : null;

// For database operations, use the connection string
let connectionString: string;

if (useSupabase) {
  // Extract the database URL from Supabase URL or use provided DATABASE_URL
  if (process.env.DATABASE_URL) {
    connectionString = process.env.DATABASE_URL;
  } else {
    const supabaseUrl = new URL(process.env.SUPABASE_URL!);
    connectionString = `postgresql://postgres:[YOUR-PASSWORD]@${supabaseUrl.hostname}:5432/postgres`;
  }
} else {
  // Fallback to Replit's DATABASE_URL
  connectionString = process.env.DATABASE_URL!;
}

const client = postgres(connectionString);
export const db = drizzle(client, { schema });