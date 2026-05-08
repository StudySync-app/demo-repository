import { db } from "./client";
import { notes } from "./schema";
import { eq, sql } from "drizzle-orm";

export type Note = {
  id: number;
  title: string | null;
  content?: string | null;
  // UPDATE: Add these so TypeScript knows about the new columns
  audioList?: string | null; 
  imageList?: string | null;
  videoList?: string | null;
  createdAt?: string | null;
  synced?: boolean | null;
  folderId?: number | null;
};

export function addNote(
  title: string, 
  content: string, 
  audioList: any[], 
  imageList: any[], 
  videoList: any[]
) {
  return db.insert(notes).values({
    title,
    content,
    // Note: Ensure these keys match your schema.ts exactly
    audioList: JSON.stringify(audioList || []),
    imageList: JSON.stringify(imageList || []),
    videoList: JSON.stringify(videoList || []),
    synced: false,
    createdAt: new Date().toISOString()
  }).run();
}

export function getNotes(): Note[] {
  return db.select().from(notes).all() as Note[];
}

export function deleteNote(id: number) {
  db.delete(notes).where(eq(notes.id, id)).run();
}

// Professional "Migration" check
export async function migrateDb() {
  try {
    // SQLite requires these to be run as separate statements
    await db.run(sql`ALTER TABLE notes ADD COLUMN audio_list TEXT`);
    await db.run(sql`ALTER TABLE notes ADD COLUMN image_list TEXT`);
    await db.run(sql`ALTER TABLE notes ADD COLUMN video_list TEXT`);
    console.log("Migration successful: Columns added.");
  } catch (e) {
    console.log("Migration: Columns already exist or migration skipped.");
  }
}