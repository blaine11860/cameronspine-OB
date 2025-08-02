import { useQuery } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import type { User } from "@shared/schema";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

export function useAuth() {
  const { data: session, isLoading } = useQuery({
    queryKey: ["auth-session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
    retry: false,
  });

  return {
    user: session?.user || null,
    session,
    isLoading,
    isAuthenticated: !!session?.user,
    supabase,
  };
}
