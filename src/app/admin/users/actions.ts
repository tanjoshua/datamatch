"use server";

import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const userSchema = z.object({
  name: z.string().min(2).max(100),
});

const userUpdateSchema = z.object({
  id: z.number(),
  name: z.string().min(2).max(100),
});

const bulkUsersSchema = z.object({
  names: z.string().transform(val => {
    return val
      .split('\n')
      .map(name => name.trim())
      .filter(name => name.length >= 2 && name.length <= 100);
  }),
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
  } catch (error: unknown) {
    console.error('Error adding user:', error);
    
    // Check for unique constraint violation
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return { 
        success: false, 
        error: `User with name "${validatedData.name}" already exists` 
      };
    }
    
    return { success: false, error: 'Failed to add user' };
  }
}

export async function addBulkUsers(data: { names: string }) {
  // Validate input data
  const validatedData = bulkUsersSchema.parse(data);
  const names = validatedData.names;
  
  if (names.length === 0) {
    return { success: false, error: 'No valid names provided' };
  }
  
  try {
    const addedUsers: string[] = [];
    const failedUsers: {name: string, reason: string}[] = [];
    
    // Insert users one by one to track which ones succeeded and which failed
    for (const name of names) {
      try {
        await sql`INSERT INTO users (name) VALUES (${name})`;
        addedUsers.push(name);
      } catch (error: unknown) {
        // Check for unique constraint violation
        if (error instanceof Error && error.message.includes('duplicate key')) {
          failedUsers.push({ name, reason: 'already exists' });
        } else {
          failedUsers.push({ name, reason: 'unknown error' });
        }
      }
    }
    
    // Revalidate admin pages
    revalidatePath('/admin');
    revalidatePath('/admin/users');
    
    if (addedUsers.length === 0) {
      return { 
        success: false, 
        error: 'Failed to add any users', 
        failedUsers 
      };
    }
    
    return { 
      success: true, 
      count: addedUsers.length,
      addedUsers,
      failedUsers: failedUsers.length > 0 ? failedUsers : undefined
    };
  } catch (error: unknown) {
    console.error('Error adding bulk users:', error);
    return { success: false, error: 'Failed to add users' };
  }
}

export async function updateUser(data: { id: number; name: string }) {
  // Validate input data
  const validatedData = userUpdateSchema.parse(data);
  
  try {
    // Update user in the database
    await sql`
      UPDATE users 
      SET name = ${validatedData.name}
      WHERE id = ${validatedData.id}
    `;
    
    // Revalidate admin pages
    revalidatePath('/admin');
    revalidatePath('/admin/users');
    
    return { success: true };
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, error: 'Failed to update user' };
  }
}

export async function deleteUser(id: number) {
  try {
    // Delete user from the database
    await sql`DELETE FROM users WHERE id = ${id}`;
    
    // Revalidate admin pages
    revalidatePath('/admin');
    revalidatePath('/admin/users');
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: 'Failed to delete user' };
  }
}
