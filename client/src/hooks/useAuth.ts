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
        if (session?.access_token) {
          localStorage.setItem('supabase_token', session.access_token);
        }
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

  // OTP authentication helpers
  const sendOTP = async (phone: string) => {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase.auth.signInWithOtp({ phone });
    return error;
  };

  const verifyOTP = async (phone: string, token: string) => {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms'
    });
    return { data, error };
  };

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      localStorage.removeItem('supabase_token');
    } else {
      // Replit Auth logout
      window.location.href = '/api/logout';
    }
  };

  const getSession = () => {
    if (supabase) {
      return supabase.auth.getSession();
    }
    return null;
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    supabase,
    hasSupabase: !!supabase,
    sendOTP,
    verifyOTP,
    signOut,
    getSession,
    authMethod: supabase && user ? 'supabase' : user ? 'replit' : null,
  };
}
