import { db } from "./client";
import { tasks } from "./schema";
import { eq } from "drizzle-orm";

export type Task = {
  id: number;
  title: string;
  description?: string | null;
  status?: string | null;
  priority?: string | null;
  dueDate?: string | null;
  completed?: boolean | null;
  synced?: boolean | null;
  createdAt?: string | null;
  folderId?: number | null;
};

export function addTask(
  title: string,
  priority: string,
  dueDate?: string,
  folderId?: number | null
) {
  const result = db.insert(tasks).values({
    title,
    priority,
    dueDate,
    folderId,
    status: "todo",
    completed: false,
    synced: false
  }).run();

  return result.lastInsertRowId;
}

export function getTasks(): Task[] {
  return db.select().from(tasks).all();
}

export function deleteTask(id: number) {
  db.delete(tasks).where(eq(tasks.id, id)).run();
}

export function toggleTaskCompleted(id: number, completed: boolean) {
  db.update(tasks)
    .set({ completed: completed ? true : false })
    .where(eq(tasks.id, id))
    .run();
}

export function updateTaskPriority(id: number, priority: string) {
  db.update(tasks)
    .set({ priority: priority })
    .where(eq(tasks.id, id))
    .run();
}

export function updateTaskStatus(id: number, status: string) {
  db.update(tasks)
    .set({ status })
    .where(eq(tasks.id, id))
    .run();
}

export function getTaskStats() {
  const allTasks = db.select().from(tasks).all();

  const total = allTasks.length;
  const completed = allTasks.filter((t: any) => t.completed).length;
  const pending = total - completed;

  const completionRate =
    total === 0 ? 0 : Math.round((completed / total) * 100);

  return {
    total,
    completed,
    pending,
    completionRate
  };
}

export function getTodaysTasks() {
  const today = new Date().toISOString().slice(0, 10);

  const allTasks = db.select().from(tasks).all();

  return allTasks.filter(
    (t: any) =>
      t.dueDate &&
      t.dueDate.startsWith(today)
  );
}

export function getOverdueTasks() {
  const today = new Date().toISOString().slice(0, 10);

  const allTasks = db.select().from(tasks).all();

  return allTasks.filter(
    (t: any) =>
      t.dueDate &&
      t.dueDate < today &&
      !t.completed
  );
}

export function getUpcomingTasks() {
  const today = new Date().toISOString().slice(0, 10);

  const allTasks = db.select().from(tasks).all();

  return allTasks.filter(
    (t: any) =>
      t.dueDate &&
      t.dueDate > today
  );
}

export function updateTask(
  id: number,
  title: string,
  priority: string,
  dueDate: string
) {
  db.update(tasks)
    .set({ title, priority, dueDate })
    .where(eq(tasks.id, id))
    .run();
}