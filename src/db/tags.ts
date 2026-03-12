import { db } from "./client";
import { tags, contentTags } from "./schema";
import { eq } from "drizzle-orm";

export type Tag = {
  id: number;
  name: string;
};

export function addTag(name: string) {
  db.insert(tags).values({ name }).run();
}

export function getTags(): Tag[] {
  return db.select().from(tags).all() as Tag[];
}

export function attachTag(contentType: string, contentId: number, tagId: number) {
  db.insert(contentTags).values({
    contentType,
    contentId,
    tagId
  }).run();
}

export function getTagsForContent(contentType: string, contentId: number) {
  return db
    .select()
    .from(contentTags)
    .where(eq(contentTags.contentId, contentId))
    .all();
}