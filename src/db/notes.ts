import { db } from "./database";

export function addNote(title: string, content: string) {
  db.execSync(`
    INSERT INTO notes (title, content, created_at)
    VALUES ('${title}', '${content}', datetime('now'));
  `);
}

export function getNotes() {
  const result = db.getAllSync("SELECT * FROM notes;");
  return result;
}

export function deleteNote(id: number) {
  db.execSync(`DELETE FROM notes WHERE id = ${id};`);
}