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
  folderId?: number | null,
  extra?: { description?: string | null; status?: string | null }
) {
  const result = db.insert(tasks).values({
    title,
    priority,
    dueDate,
    folderId,
    status: extra?.status ?? "todo",
    description: extra?.description ?? null,
    completed: false,
    synced: false,
    createdAt: new Date().toISOString()
  }).run();

  return result.lastInsertRowId;
}

export function getTasks(): Task[] {
  const data = db.select().from(tasks).all();
  const priorityRank: Record<string, number> = { urgent: 0, important: 1, minor: 2 };
  return [...data].sort((a, b) => {
    const byPriority = (priorityRank[a.priority ?? "minor"] ?? 2) - (priorityRank[b.priority ?? "minor"] ?? 2);
    if (byPriority !== 0) return byPriority;

    const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
    const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
    if (aDue !== bDue) return aDue - bDue;

    const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bCreated - aCreated;
  });
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

export function updateTaskFull(
  id: number,
  payload: {
    title: string;
    priority: string;
    dueDate: string;
    description?: string | null;
    status?: string | null;
    folderId?: number | null;
  }
) {
  db.update(tasks)
    .set({
      title: payload.title,
      priority: payload.priority,
      dueDate: payload.dueDate,
      description: payload.description ?? null,
      status: payload.status ?? "todo",
      folderId: payload.folderId
    })
    .where(eq(tasks.id, id))
    .run();
}
