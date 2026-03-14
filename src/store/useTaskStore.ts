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
};

type TaskStore = {
  tasks: Task[];
  loadTasks: () => Promise<void>;
};

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],

  loadTasks: async () => {
    const data = await db.select().from(tasks);
    set({ tasks: data });
  },
}));