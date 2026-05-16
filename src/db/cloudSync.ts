import { db } from "./client";
import { appSettings, contentTags, folders, media, notes, tags, tasks } from "./schema";
import { getSettingsSnapshot } from "./settings";

export type StudySyncCloudSnapshot = {
  version: 1;
  syncedAt: string;
  folders: (typeof folders.$inferSelect)[];
  tasks: (typeof tasks.$inferSelect)[];
  notes: (typeof notes.$inferSelect)[];
  media: (typeof media.$inferSelect)[];
  tags: (typeof tags.$inferSelect)[];
  contentTags: (typeof contentTags.$inferSelect)[];
  settings: Record<string, unknown>;
};

function normalizeBoolean(value: unknown) {
  return value === true || value === 1;
}

export function createCloudSnapshot(): StudySyncCloudSnapshot {
  return {
    version: 1,
    syncedAt: new Date().toISOString(),
    folders: db.select().from(folders).all(),
    tasks: db.select().from(tasks).all(),
    notes: db.select().from(notes).all(),
    media: db.select().from(media).all(),
    tags: db.select().from(tags).all(),
    contentTags: db.select().from(contentTags).all(),
    settings: getSettingsSnapshot(),
  };
}

export function restoreCloudSnapshot(snapshot: StudySyncCloudSnapshot) {
  if (!snapshot || snapshot.version !== 1) {
    throw new Error("This cloud backup format is not supported.");
  }

  db.delete(contentTags).run();
  db.delete(tags).run();
  db.delete(media).run();
  db.delete(notes).run();
  db.delete(tasks).run();
  db.delete(folders).run();
  db.delete(appSettings).run();

  if (snapshot.folders?.length) {
    db.insert(folders).values(snapshot.folders.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category || "All",
      createdAt: item.createdAt,
    }))).run();
  }

  if (snapshot.tasks?.length) {
    db.insert(tasks).values(snapshot.tasks.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description ?? null,
      status: item.status ?? "todo",
      priority: item.priority ?? "normal",
      dueDate: item.dueDate ?? null,
      completed: normalizeBoolean(item.completed),
      folderId: item.folderId ?? null,
      synced: true,
      createdAt: item.createdAt ?? new Date().toISOString(),
    }))).run();
  }

  if (snapshot.notes?.length) {
    db.insert(notes).values(snapshot.notes.map((item) => ({
      id: item.id,
      title: item.title ?? null,
      content: item.content ?? null,
      audioList: item.audioList ?? "[]",
      imageList: item.imageList ?? "[]",
      videoList: item.videoList ?? "[]",
      pdfList: item.pdfList ?? "[]",
      folderId: item.folderId ?? null,
      synced: true,
      createdAt: item.createdAt ?? new Date().toISOString(),
    }))).run();
  }

  if (snapshot.media?.length) {
    db.insert(media).values(snapshot.media.map((item) => ({
      id: item.id,
      name: item.name ?? null,
      uri: item.uri ?? null,
      type: item.type ?? null,
      folderId: item.folderId ?? null,
      synced: true,
      createdAt: item.createdAt ?? new Date().toISOString(),
    }))).run();
  }

  if (snapshot.tags?.length) {
    db.insert(tags).values(snapshot.tags.map((item) => ({
      id: item.id,
      name: item.name,
    }))).run();
  }

  if (snapshot.contentTags?.length) {
    db.insert(contentTags).values(snapshot.contentTags.map((item) => ({
      id: item.id,
      contentType: item.contentType,
      contentId: item.contentId,
      tagId: item.tagId,
    }))).run();
  }

  for (const [key, value] of Object.entries(snapshot.settings || {})) {
    db.insert(appSettings)
      .values({
        key,
        value: JSON.stringify(value),
        updatedAt: new Date().toISOString(),
      })
      .onConflictDoUpdate({
        target: appSettings.key,
        set: {
          value: JSON.stringify(value),
          updatedAt: new Date().toISOString(),
        },
      })
      .run();
  }
}
