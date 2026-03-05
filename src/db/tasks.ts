import { db } from "./database";

export function addTask(title: string) {
  db.execSync(`
    INSERT INTO tasks (title, completed)
    VALUES ('${title}', 0);
  `);
}

export function getTasks() {
  const result = db.getAllSync("SELECT * FROM tasks;");
  return result;
}

export function deleteTask(id: number) {
  db.execSync(`DELETE FROM tasks WHERE id = ${id};`);
}