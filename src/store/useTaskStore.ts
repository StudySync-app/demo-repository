import { create } from "zustand";
import { db } from "../db/client";
import { tasks } from "../db/schema";

type Task = {
  id: number;
  title: string;
  description: string | null;
  priority: string | null;
  status: string | null;
  dueDate: string | null;
  completed?: boolean | null;
  folderId?: number | null;
};

type TaskStore = {
  tasks: Task[];
  loadTasks: () => Promise<void>;
};

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],

  loadTasks: async () => {
    const data = await db.select().from(tasks);
    const priorityRank: Record<string, number> = { urgent: 0, important: 1, minor: 2 };
    const sorted = [...data].sort((a, b) => {
      const byPriority = (priorityRank[a.priority ?? "minor"] ?? 2) - (priorityRank[b.priority ?? "minor"] ?? 2);
      if (byPriority !== 0) return byPriority;

      const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      if (aDue !== bDue) return aDue - bDue;

      const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bCreated - aCreated;
    });
    set({ tasks: sorted });
  },
}));
