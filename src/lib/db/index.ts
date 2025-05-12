import { neon, neonConfig } from '@neondatabase/serverless';

// Configure Neon client
neonConfig.fetchConnectionCache = true;

// Create a SQL client
export const sql = neon(process.env.DATABASE_URL!);

export async function getUser() {
  const response = await sql`SELECT * FROM users`;
  return response;
}


