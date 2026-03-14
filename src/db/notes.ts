import { db } from "./client";
import { notes } from "./schema";
import { eq } from "drizzle-orm";

export type Note = {
  id: number;
  title: string;
  content?: string | null;
  createdAt?: string | null;
  synced?: boolean | null;
};

export function addNote(title: string, content: string) {
  db.insert(notes).values({
    title: title,
    content: content,
    synced: false
  }).run();
}

export function getNotes(): Note[] {
  return db.select().from(notes).all() as Note[];
}

export function deleteNote(id: number) {
  db.delete(notes).where(eq(notes.id, id)).run();
}