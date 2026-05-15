import { db } from "./client";
import { tags, contentTags } from "./schema";
import { and, eq } from "drizzle-orm";

export type TaggedCounts = {
  tasks: number;
  notes: number;
  media: number;
};

/** Distinct content items per type that have at least one tag. */
export function getTaggedCountsByContentType(): TaggedCounts {
  const rows = db.select().from(contentTags).all() as {
    contentType?: string | null;
    contentId?: number | null;
  }[];

  const taskIds = new Set<number>();
  const noteIds = new Set<number>();
  const mediaIds = new Set<number>();

  for (const row of rows) {
    if (row.contentId == null) continue;
    const id = row.contentId;
    switch (row.contentType) {
      case "task":
        taskIds.add(id);
        break;
      case "note":
        noteIds.add(id);
        break;
      case "media":
        mediaIds.add(id);
        break;
      default:
        break;
    }
  }

  return {
    tasks: taskIds.size,
    notes: noteIds.size,
    media: mediaIds.size
  };
}

/** Distinct content ids that have a tag, for relative-time subtitles on the dashboard. */
export function getTaggedContentIds(
  contentType: "task" | "note" | "media"
): number[] {
  const rows = db
    .select({ contentId: contentTags.contentId })
    .from(contentTags)
    .where(eq(contentTags.contentType, contentType))
    .all();
  const ids = new Set<number>();
  for (const r of rows) {
    if (r.contentId != null) ids.add(r.contentId);
  }
  return [...ids];
}

export type Tag = {
  id: number;
  name: string;
};

export function addTag(name: string) {
  db.insert(tags).values({ name }).onConflictDoNothing().run();
}

export function getTags(): Tag[] {
  return db.select().from(tags).all() as Tag[];
}

export function attachTag(contentType: string, contentId: number, tagId: number) {
  const existing = db
    .select()
    .from(contentTags)
    .where(and(eq(contentTags.contentType, contentType), eq(contentTags.contentId, contentId), eq(contentTags.tagId, tagId)))
    .get();
  if (existing) return;

  db.insert(contentTags).values({
    contentType,
    contentId,
    tagId
  }).run();
}

export function getOrCreateTag(name: string) {
  const clean = name.trim() || "Tagged";
  const existing = db.select().from(tags).where(eq(tags.name, clean)).get() as Tag | undefined;
  if (existing) return existing.id;
  const result = db.insert(tags).values({ name: clean }).run();
  return Number(result.lastInsertRowId);
}

export function isContentTagged(contentType: string, contentId: number) {
  const row = db
    .select()
    .from(contentTags)
    .where(and(eq(contentTags.contentType, contentType), eq(contentTags.contentId, contentId)))
    .get();
  return !!row;
}

export function toggleContentTag(contentType: string, contentId: number, tagName = "Tagged") {
  const existing = db
    .select()
    .from(contentTags)
    .where(and(eq(contentTags.contentType, contentType), eq(contentTags.contentId, contentId)))
    .get();

  if (existing) {
    db.delete(contentTags).where(eq(contentTags.id, existing.id)).run();
    return false;
  }

  const tagId = getOrCreateTag(tagName);
  attachTag(contentType, contentId, tagId);
  return true;
}

export function getTagsForContent(contentType: string, contentId: number) {
  return db
    .select()
    .from(contentTags)
    .where(eq(contentTags.contentId, contentId))
    .all();
}
