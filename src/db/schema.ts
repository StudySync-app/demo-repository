import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const items = sqliteTable("items", {
  id: text("id").primaryKey(), // We use strings for easier UUID sync with Supabase
  title: text("title").notNull(),
  content: text("content"),
  isSynced: integer("is_synced", { mode: "boolean" }).default(false),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});
