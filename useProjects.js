/**
 * src/hooks/useProjects.js
 * ─────────────────────────────────────────────────────────────
 * Provides project CRUD and level advancement tied to the
 * authenticated user. RLS on the DB ensures data isolation.
 * ─────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useProjects(userId) {
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const fetchProjects = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    const { data, error: fetchErr } = await supabase
      .from("projects")
      .select("id,name,description,current_level,status,handoff_generated,handoff_generated_at,metadata,created_at,updated_at")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("updated_at", { ascending: false });

    if (fetchErr) setError(fetchErr.message);
    else setProjects(data ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const createProject = useCallback(async ({ name, description = "" }) => {
    if (!userId) return { error: "Not authenticated" };
    const { data, error: insertErr } = await supabase
      .from("projects")
      .insert({ user_id: userId, name, description })
      .select()
      .single();
    if (!insertErr && data) setProjects(p => [data, ...p]);
    return { data, error: insertErr };
  }, [userId]);

  const advanceLevel = useCallback(async (projectId, nextLevel) => {
    const { data, error: updateErr } = await supabase
      .from("projects")
      .update({
        current_level: nextLevel,
        ...(nextLevel > 3 && {
          handoff_generated: true,
          handoff_generated_at: new Date().toISOString(),
        }),
      })
      .eq("id", projectId)
      .eq("user_id", userId)
      .select()
      .single();
    if (!updateErr && data) setProjects(p => p.map(pr => pr.id === projectId ? data : pr));
    return { data, error: updateErr };
  }, [userId]);

  const archiveProject = useCallback(async (projectId) => {
    const { error: updateErr } = await supabase
      .from("projects")
      .update({ status: "archived" })
      .eq("id", projectId)
      .eq("user_id", userId);
    if (!updateErr) setProjects(p => p.filter(pr => pr.id !== projectId));
    return { error: updateErr };
  }, [userId]);

  return { projects, loading, error, refetch: fetchProjects, createProject, advanceLevel, archiveProject };
}
