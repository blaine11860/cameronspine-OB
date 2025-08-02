import { useQuery } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import type { User } from "@shared/schema";

// Only create Supabase client if environment variables are available
const supabase = (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) 
  ? createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)
  : null;

export function useAuth() {
  // If Supabase is not configured, check for Replit auth session
  const { data: user, isLoading } = useQuery<User>({
    queryKey: supabase ? ["supabase-auth-session"] : ["/api/auth/user"],
    queryFn: async () => {
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        return session?.user || null;
      } else {
        // Fallback to original Replit auth endpoint
        const response = await fetch("/api/auth/user");
        if (!response.ok) return null;
        return response.json();
      }
    },
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    supabase,
    hasSupabase: !!supabase,
  };
}
