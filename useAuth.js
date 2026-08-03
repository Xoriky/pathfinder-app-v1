/**
 * src/hooks/useAuth.js
 * ─────────────────────────────────────────────────────────────
 * Provides session, profile, signIn, signOut, and updateProfile.
 * Extracted from pathfinder-supabase.jsx — full documentation there.
 * ─────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useAuth() {
  const [session,   setSession]   = useState(null);
  const [profile,   setProfile]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [authError, setAuthError] = useState(null);

  const fetchProfile = useCallback(async (userId) => {
    if (!userId) { setProfile(null); return; }

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      // PGRST116 = no rows — trigger may still be running on first sign-in
      if (error.code === "PGRST116") {
        await new Promise(r => setTimeout(r, 800));
        const retry = await supabase.from("users").select("*").eq("id", userId).single();
        setProfile(retry.data ?? null);
      } else {
        console.error("[useAuth] fetchProfile:", error.message);
      }
    } else {
      setProfile(data);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      fetchProfile(s?.user?.id).finally(() => setLoading(false));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          await fetchProfile(newSession?.user?.id);
        }
        if (event === "SIGNED_OUT") setProfile(null);
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signIn = useCallback(async (provider) => {
    setAuthError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: provider === "google" ? "openid email profile" : undefined,
      },
    });
    if (error) setAuthError(error.message);
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const updateProfile = useCallback(async (updates) => {
    if (!session?.user?.id) return { error: "Not authenticated" };
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", session.user.id)
      .select()
      .single();
    if (!error) setProfile(data);
    return { data, error };
  }, [session]);

  return {
    session,
    user:            session?.user ?? null,
    profile,
    loading,
    authError,
    isAuthenticated: !!session,
    signIn,
    signOut,
    updateProfile,
  };
}
