import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from './info';

// Create a singleton Supabase client to avoid multiple instances
let supabaseClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient(
      `https://${projectId}.supabase.co`,
      publicAnonKey,
      {
        auth: {
          persistSession: true,
          storageKey: 'social-app-auth',
          storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        },
      }
    );
  }
  return supabaseClient;
}

// Export a default instance
export const supabase = getSupabaseClient();