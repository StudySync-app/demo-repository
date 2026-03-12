import { db } from "./client";
import { folders } from "./schema";
import { eq } from "drizzle-orm";

export type Folder = {
  id: number;
  name: string;
  createdAt?: string | null;
};

export function addFolder(name: string) {
  db.insert(folders).values({
    name: name
  }).run();
}

export function getFolders(): Folder[] {
  return db.select().from(folders).all() as Folder[];
}

export function deleteFolder(id: number) {
  db.delete(folders).where(eq(folders.id, id)).run();
}