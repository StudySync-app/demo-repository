import { create } from "zustand";
import { Session } from "@supabase/supabase-js";

interface UserStore {
  session: Session | null;
  setSession: (session: Session | null) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  session: null,
  setSession: (session) => set({ session }),
}));
