import { openDatabaseSync } from "expo-sqlite";

const db = openDatabaseSync("app.db");

export function initDatabase() {
  db.execSync(`
    
    CREATE TABLE IF NOT EXISTS folders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'All',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'todo',
      priority TEXT DEFAULT 'normal',
      due_date TEXT,
      completed INTEGER DEFAULT 0,
      folder_id INTEGER,
      synced INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      content TEXT,
      audio_list TEXT,
      image_list TEXT,
      video_list TEXT,
      pdf_list TEXT,
      folder_id INTEGER,
      synced INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      uri TEXT,
      type TEXT,
      folder_id INTEGER,
      synced INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE
    );

    CREATE TABLE IF NOT EXISTS content_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content_type TEXT,
      content_id INTEGER,
      tag_id INTEGER
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

  `);

  for (const statement of [
    "ALTER TABLE notes ADD COLUMN audio_list TEXT",
    "ALTER TABLE notes ADD COLUMN image_list TEXT",
    "ALTER TABLE notes ADD COLUMN video_list TEXT",
    "ALTER TABLE notes ADD COLUMN pdf_list TEXT"
  ]) {
    try {
      db.execSync(statement);
    } catch {
      // Column already exists on previously-created local databases.
    }
  }
}
