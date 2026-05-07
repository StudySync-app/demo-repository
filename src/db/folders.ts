import { db } from "./client";
import { folders } from "./schema";
import { eq } from "drizzle-orm";

export type Folder = typeof folders.$inferSelect; // Automatically matches schema

export const addFolder = async (name: string, category: string): Promise<number> => { 
  const result = await db.insert(folders).values({
    name: name,
    category: category, // This will now be accepted
  }); 
  
  // Return the ID to satisfy TasksScreen.tsx
  return (result as any).lastInsertRowId || (result as any).insertId; 
};

export function getFolders(): Folder[] {
  return db.select().from(folders).all();
}

export function deleteFolder(id: number) {
  db.delete(folders).where(eq(folders.id, id)).run();
}