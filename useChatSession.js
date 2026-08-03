/**
 * src/hooks/useChatSession.js
 * ─────────────────────────────────────────────────────────────
 * Persists conversation messages, sprint state, and readiness
 * score to Supabase. Debounced to avoid hammering the DB on
 * every keystroke. addReadiness calls the server-side RPC so
 * the 0–100 clamp is enforced atomically in the database.
 * ─────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useChatSession(userId, projectId) {
  const [sessionId, setSessionId] = useState(null);
  const [saving,    setSaving]    = useState(false);
  const saveTimer = useRef(null);

  const initSession = useCallback(async (sessionType = "new_project") => {
    if (!userId) return;

    const { data: existing } = await supabase
      .from("chat_sessions")
      .select("id,messages,sprint_seconds_remaining,sprint_state")
      .eq("user_id", userId)
      .eq("project_id", projectId)
      .eq("session_type", sessionType)
      .neq("sprint_state", "locked")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) { setSessionId(existing.id); return existing; }

    const { data: created, error } = await supabase
      .from("chat_sessions")
      .insert({ user_id: userId, project_id: projectId, session_type: sessionType })
      .select("id")
      .single();

    if (!error && created) setSessionId(created.id);
    return created;
  }, [userId, projectId]);

  // Debounced save — 1.5 s trailing edge
  const saveMessages = useCallback((messages, sprintState, sprintSecondsRemaining) => {
    if (!sessionId) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      await supabase.from("chat_sessions").update({
        messages, sprint_state: sprintState,
        sprint_seconds_remaining: sprintSecondsRemaining,
      }).eq("id", sessionId).eq("user_id", userId);
      setSaving(false);
    }, 1500);
  }, [sessionId, userId]);

  const flushSave = useCallback(() => clearTimeout(saveTimer.current), []);

  useEffect(() => () => clearTimeout(saveTimer.current), []);

  // Server-side RPC — enforces 0-100 clamp atomically
  const addReadiness = useCallback(async (delta) => {
    const { data, error } = await supabase
      .rpc("increment_readiness", { delta: Math.max(0, delta) });
    if (error) console.error("[useChatSession] addReadiness:", error.message);
    return data; // returns new score
  }, []);

  return { sessionId, saving, initSession, saveMessages, flushSave, addReadiness };
}


/**
 * src/hooks/useArtifacts.js
 * ─────────────────────────────────────────────────────────────
 * Lists and creates immutable artifact records. Physical files
 * go to Supabase Storage — bucket policy mirrors table RLS.
 * ─────────────────────────────────────────────────────────────
 */

export function useArtifacts(userId, projectId) {
  const [artifacts, setArtifacts] = useState([]);
  const [loading,   setLoading]   = useState(true);

  const fetchArtifacts = useCallback(async () => {
    if (!userId || !projectId) { setLoading(false); return; }
    const { data, error } = await supabase
      .from("artifacts")
      .select("id,artifact_type,filename,storage_path,metadata,created_at")
      .eq("user_id", userId)
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });
    if (!error) setArtifacts(data ?? []);
    setLoading(false);
  }, [userId, projectId]);

  useEffect(() => { fetchArtifacts(); }, [fetchArtifacts]);

  const createArtifact = useCallback(async ({ sessionId, artifactType, filename, fileBlob, metadata = {} }) => {
    let storagePath = null;

    if (fileBlob) {
      storagePath = `${userId}/${projectId}/${Date.now()}-${filename}`;
      const { error: uploadError } = await supabase.storage
        .from("artifacts")
        .upload(storagePath, fileBlob, { contentType: fileBlob.type, upsert: false });
      if (uploadError) return { error: uploadError };
    }

    const { data, error: insertError } = await supabase
      .from("artifacts")
      .insert({ user_id: userId, project_id: projectId, session_id: sessionId ?? null,
        artifact_type: artifactType, filename, storage_path: storagePath, metadata })
      .select()
      .single();

    if (!insertError && data) setArtifacts(p => [data, ...p]);
    return { data, error: insertError };
  }, [userId, projectId]);

  const getDownloadUrl = useCallback(async (storagePath, expiresInSeconds = 300) => {
    const { data, error } = await supabase.storage
      .from("artifacts")
      .createSignedUrl(storagePath, expiresInSeconds);
    return { url: data?.signedUrl, error };
  }, []);

  return { artifacts, loading, refetch: fetchArtifacts, createArtifact, getDownloadUrl };
}
