import { neon, neonConfig } from '@neondatabase/serverless';

// Configure Neon client
neonConfig.fetchConnectionCache = true;

// Create a SQL client
export const sql = neon(process.env.DATABASE_URL!);

// Define User type based on schema.sql
export type User = {
  id: number;
  name: string;
  has_completed_survey: boolean;
  created_at: string;
};

export async function getUser() {
  const response = await sql`SELECT * FROM users`;
  return response as User[];
}


