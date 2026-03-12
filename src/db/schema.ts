import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const folders = sqliteTable("folders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  createdAt: text("created_at"),
});

export const tasks = sqliteTable("tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").default("todo"),
  priority: text("priority").default("normal"),
  dueDate: text("due_date"),
  completed: integer("completed", { mode: "boolean" }).default(false),
  folderId: integer("folder_id"),
  synced: integer("synced", { mode: "boolean" }).default(false),
  createdAt: text("created_at"),
});

export const notes = sqliteTable("notes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title"),
  content: text("content"),
  folderId: integer("folder_id"),
  synced: integer("synced", { mode: "boolean" }).default(false),
  createdAt: text("created_at"),
});

export const media = sqliteTable("media", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name"),
  uri: text("uri"),
  type: text("type"),
  folderId: integer("folder_id"),
  synced: integer("synced", { mode: "boolean" }).default(false),
  createdAt: text("created_at"),
});

export const tags = sqliteTable("tags", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").unique(),
});

export const contentTags = sqliteTable("content_tags", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  contentType: text("content_type"),
  contentId: integer("content_id"),
  tagId: integer("tag_id"),
});