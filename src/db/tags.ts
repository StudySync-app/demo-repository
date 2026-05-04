import { db } from "./client";
import { tags, contentTags } from "./schema";
import { eq } from "drizzle-orm";

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