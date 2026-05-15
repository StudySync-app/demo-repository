import { db } from "./client";
import { notes } from "./schema";
import { desc, eq, like, or, sql } from "drizzle-orm";

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
  videoList: any[],
  folderId?: number | null
) {
  return db.insert(notes).values({
    title,
    content,
    // Note: Ensure these keys match your schema.ts exactly
    audioList: JSON.stringify(audioList || []),
    imageList: JSON.stringify(imageList || []),
    videoList: JSON.stringify(videoList || []),
    folderId: folderId ?? null,
    synced: false,
    createdAt: new Date().toISOString()
  }).run();
}

export function getNotes(): Note[] {
  return db.select().from(notes).orderBy(desc(notes.createdAt)).all() as Note[];
}

export function searchNotes(query: string): Note[] {
  const term = `%${query.trim()}%`;
  return db
    .select()
    .from(notes)
    .where(or(like(notes.title, term), like(notes.content, term)))
    .orderBy(desc(notes.createdAt))
    .all() as Note[];
}

export function getNoteById(id: number): Note | undefined {
  return db.select().from(notes).where(eq(notes.id, id)).get() as Note | undefined;
}

export function updateNote(
  id: number,
  title: string,
  content: string,
  audioList: any[],
  imageList: any[],
  videoList: any[],
  folderId?: number | null
) {
  return db.update(notes).set({
    title,
    content,
    audioList: JSON.stringify(audioList || []),
    imageList: JSON.stringify(imageList || []),
    videoList: JSON.stringify(videoList || []),
    folderId: folderId ?? null,
    synced: false,
  }).where(eq(notes.id, id)).run();
}

export function updateNoteFolder(id: number, folderId: number | null) {
  return db.update(notes).set({ folderId, synced: false }).where(eq(notes.id, id)).run();
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
