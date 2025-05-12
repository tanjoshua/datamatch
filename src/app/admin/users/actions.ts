"use server";

import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const userSchema = z.object({
  name: z.string().min(2).max(100),
});

export async function addUser(data: { name: string }) {
  // Validate input data
  const validatedData = userSchema.parse(data);
  
  try {
    // Insert user into the database
    await sql`
      INSERT INTO users (name)
      VALUES (${validatedData.name})
    `;
    
    // Revalidate admin pages
    revalidatePath('/admin');
    revalidatePath('/admin/users');
    
    return { success: true };
  } catch (error) {
    console.error('Error adding user:', error);
    return { success: false, error: 'Failed to add user' };
  }
}
