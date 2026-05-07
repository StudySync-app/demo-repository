// DUMMY FILE FOR UI TESTING - NO NETWORK CALLS
export const supabase = {
  auth: {
    signInWithPassword: async (p0: { email: string; password: string; }) => ({ error: null, user: {} }),
    signUp: async (p0: { email: string; password: string; options: { data: { full_name: string; role: string; }; }; }) => ({ error: null, user: {} }),
    signOut: async () => null,
    getUser: async () => ({ error: null, user: {} }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
  from: (table: string) => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ error: null, data: null }),
        order: () => ({ data: [], error: null })
      }),
      order: () => ({ data: [], error: null })
    }),
    insert: () => ({ error: null }),
    delete: () => ({ error: null }),
    update: () => ({ error: null }),
  }),
  rpc: () => ({ error: null, data: null })
};