import { db } from "./client";
import { media } from "./schema";
import { eq } from "drizzle-orm";

export type MediaItem = {
  id: number;
  name?: string | null;
  uri?: string | null;
  type?: string | null;
  createdAt?: string | null;
};

export function addMedia(name: string, uri: string, type: string) {
  db.insert(media).values({
    name,
    uri,
    type,
    synced: false
  }).run();
}

export function getMedia(): MediaItem[] {
  return db.select().from(media).all() as MediaItem[];
}

export function deleteMedia(id: number) {
  db.delete(media).where(eq(media.id, id)).run();
}