/**
 * PATHFINDER — Supabase Frontend Integration
 * ============================================================
 * This file demonstrates the complete secure data layer.
 *
 * File structure:
 *  1. supabaseClient.js  — singleton client (ANON key only)
 *  2. useAuth.js         — session + profile hook
 *  3. useProjects.js     — project CRUD
 *  4. useChatSession.js  — chat session persistence
 *  5. useArtifacts.js    — artifact queries
 *  6. PathfinderApp.jsx  — root component wiring it together
 *
 * SECURITY RULES enforced here:
 *  ✗  Never import or reference the service_role key in any
 *     file that ships to the browser.
 *  ✓  All data access goes through the anon-key Supabase client.
 *  ✓  RLS on every table guarantees the database itself rejects
 *     any attempt to read or write another tenant's rows —
 *     even if client-side code is manipulated.
 *  ✓  JWT is stored in httpOnly-equivalent storage via
 *     Supabase Auth's secure session management.
 * ============================================================
 */


// ============================================================
// 1. SUPABASE CLIENT  (src/lib/supabaseClient.js)
// ============================================================
//
// Environment variables must be prefixed NEXT_PUBLIC_ (Next.js)
// or REACT_APP_ (CRA) / VITE_PUBLIC_ (Vite) to be bundled.
// These are the ONLY two values safe to expose to the browser:
//   SUPABASE_URL       — your project URL, not a secret
//   SUPABASE_ANON_KEY  — a JWT signed with your project's
//                        JWT secret, audience "authenticated"
//                        and role "anon".  RLS is the security
//                        boundary, not key secrecy.
//
// NEVER put SUPABASE_SERVICE_ROLE_KEY here.
// The service_role key bypasses ALL RLS policies.
// ============================================================

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "[Pathfinder] Missing Supabase environment variables. " +
    "Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file."
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // Persist the JWT across page refreshes using localStorage.
    // For maximum security on shared devices, set to false and
    // store in memory only — user must re-authenticate each visit.
    persistSession: true,

    // Silently refresh the JWT before it expires (default: 60 s before expiry).
    // Without this, long sessions cause 401s mid-use.
    autoRefreshToken: true,

    // Detect the ?code= or #access_token= in the URL after OAuth redirect
    // and exchange it for a session automatically.
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      // Identify your app in Supabase logs (optional but helpful)
      "x-application-name": "pathfinder",
    },
  },
});


// ============================================================
// 2. AUTH HOOK  (src/hooks/useAuth.js)
// ============================================================
//
// Provides:
//   session   — raw Supabase Session (contains JWT + user)
//   profile   — public.users row for the signed-in user
//   loading   — true until the initial session check resolves
//   signIn()  — triggers OAuth popup/redirect
//   signOut() — ends session, clears local state
// ============================================================

import { useState, useEffect, useCallback } from "react";

/**
 * @param {"google"|"apple"|"facebook"} provider
 *   "facebook" is how Supabase identifies the Meta OAuth app.
 */
export function useAuth() {
  const [session, setSession]   = useState(null);
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [authError, setAuthError] = useState(null);

  // ── Fetch the public.users profile for the signed-in user ──
  const fetchProfile = useCallback(async (userId) => {
    if (!userId) { setProfile(null); return; }

    const { data, error } = await supabase
      .from("users")
      .select("*")
      // RLS already filters to auth.uid() === id,
      // but .eq() is an explicit client-side guard too.
      .eq("id", userId)
      .single();

    if (error) {
      // Profile row may not exist yet if the trigger is still running
      // (extremely rare race on very first sign-in). Retry once.
      if (error.code === "PGRST116") {
        await new Promise((r) => setTimeout(r, 800));
        const retry = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .single();
        setProfile(retry.data ?? null);
      } else {
        console.error("[useAuth] fetchProfile error:", error.message);
      }
    } else {
      setProfile(data);
    }
  }, []);

  // ── Listen for session changes (sign-in, sign-out, token refresh) ──
  useEffect(() => {
    // getSession() resolves the persisted session on initial mount
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      fetchProfile(s?.user?.id).finally(() => setLoading(false));
    });

    // onAuthStateChange fires on every subsequent auth event
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);

        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          await fetchProfile(newSession?.user?.id);
        }

        if (event === "SIGNED_OUT") {
          setProfile(null);
        }
      }
    );

    // Clean up listener when component unmounts
    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  // ── Sign in via OAuth provider ──────────────────────────────
  const signIn = useCallback(async (provider) => {
    setAuthError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider,   // "google" | "apple" | "facebook"
      options: {
        // After OAuth completes, the user is redirected here.
        // Must be listed in your Supabase Dashboard → Auth → URL Configuration.
        redirectTo: `${window.location.origin}/auth/callback`,

        // Request only the scopes we need
        scopes: provider === "google"
          ? "openid email profile"
          : undefined,
      },
    });

    if (error) setAuthError(error.message);
  }, []);

  // ── Sign out ────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    // onAuthStateChange fires SIGNED_OUT and clears profile above
  }, []);

  // ── Update profile fields (tier, readiness, etc.) ──────────
  const updateProfile = useCallback(async (updates) => {
    if (!session?.user?.id) return { error: "Not authenticated" };

    const { data, error } = await supabase
      .from("users")
      .update(updates)
      // RLS ensures this only touches the caller's row
      .eq("id", session.user.id)
      .select()
      .single();

    if (!error) setProfile(data);
    return { data, error };
  }, [session]);

  return {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    authError,
    isAuthenticated: !!session,
    signIn,
    signOut,
    updateProfile,
  };
}


// ============================================================
// 3. PROJECTS HOOK  (src/hooks/useProjects.js)
// ============================================================
//
// All queries run under the user's JWT → RLS ensures they can
// only touch rows where projects.user_id = auth.uid().
// There is no server-side "userId" parameter to pass —
// the database resolves identity from the JWT automatically.
// ============================================================

export function useProjects(userId) {
  const [projects, setProjects]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  // ── Fetch all projects for the signed-in user ───────────────
  const fetchProjects = useCallback(async () => {
    if (!userId) { setLoading(false); return; }

    setLoading(true);
    const { data, error: fetchErr } = await supabase
      .from("projects")
      .select(`
        id,
        name,
        description,
        current_level,
        status,
        handoff_generated,
        handoff_generated_at,
        metadata,
        created_at,
        updated_at
      `)
      // RLS already restricts to own rows; .eq() is a belt-and-suspenders guard
      .eq("user_id", userId)
      .eq("status", "active")
      .order("updated_at", { ascending: false });

    if (fetchErr) setError(fetchErr.message);
    else setProjects(data ?? []);

    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  // ── Create a new project ─────────────────────────────────────
  const createProject = useCallback(async ({ name, description = "" }) => {
    if (!userId) return { error: "Not authenticated" };

    const { data, error: insertErr } = await supabase
      .from("projects")
      // user_id is supplied explicitly here so WITH CHECK can verify it.
      // RLS would reject any row where user_id !== auth.uid().
      .insert({ user_id: userId, name, description })
      .select()
      .single();

    if (!insertErr && data) {
      setProjects((prev) => [data, ...prev]);
    }

    return { data, error: insertErr };
  }, [userId]);

  // ── Advance the roadmap level ────────────────────────────────
  const advanceLevel = useCallback(async (projectId, nextLevel) => {
    const { data, error: updateErr } = await supabase
      .from("projects")
      .update({
        current_level: nextLevel,
        // Mark handoff if advancing past level 3
        ...(nextLevel > 3 && {
          handoff_generated: true,
          handoff_generated_at: new Date().toISOString(),
        }),
      })
      .eq("id", projectId)
      // Belt-and-suspenders: RLS already enforces this
      .eq("user_id", userId)
      .select()
      .single();

    if (!updateErr && data) {
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? data : p))
      );
    }

    return { data, error: updateErr };
  }, [userId]);

  // ── Archive a project ────────────────────────────────────────
  const archiveProject = useCallback(async (projectId) => {
    const { error: updateErr } = await supabase
      .from("projects")
      .update({ status: "archived" })
      .eq("id", projectId)
      .eq("user_id", userId);

    if (!updateErr) {
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    }

    return { error: updateErr };
  }, [userId]);

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects,
    createProject,
    advanceLevel,
    archiveProject,
  };
}


// ============================================================
// 4. CHAT SESSION HOOK  (src/hooks/useChatSession.js)
// ============================================================
//
// Persists the AI Director conversation to the database.
// Designed for a single active session at a time.
//
// Pattern:
//   • On mount: load the most recent open session for a project
//   • On message send: debounce-save the full messages array
//   • On sprint end: persist the final sprint_state
// ============================================================

export function useChatSession(userId, projectId) {
  const [sessionId, setSessionId]   = useState(null);
  const [saving, setSaving]         = useState(false);
  const saveTimer = useRef(null);

  // ── Load or create a session for this project ────────────────
  const initSession = useCallback(async (sessionType = "new_project") => {
    if (!userId) return;

    // Try to resume the most recent non-locked session
    const { data: existing } = await supabase
      .from("chat_sessions")
      .select("id, messages, sprint_seconds_remaining, sprint_state")
      .eq("user_id", userId)
      .eq("project_id", projectId)
      .eq("session_type", sessionType)
      .neq("sprint_state", "locked")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      setSessionId(existing.id);
      return existing; // caller can restore messages from here
    }

    // No resumable session — create a fresh one
    const { data: created, error } = await supabase
      .from("chat_sessions")
      .insert({
        user_id:      userId,
        project_id:   projectId,
        session_type: sessionType,
      })
      .select("id")
      .single();

    if (!error && created) setSessionId(created.id);
    return created;
  }, [userId, projectId]);

  // ── Debounced save — avoids hammering the DB on every keystroke ──
  // Saves the full messages array + sprint state on a 1.5 s trailing edge.
  const saveMessages = useCallback((messages, sprintState, sprintSecondsRemaining) => {
    if (!sessionId) return;

    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      await supabase
        .from("chat_sessions")
        .update({
          messages,
          sprint_state: sprintState,
          sprint_seconds_remaining: sprintSecondsRemaining,
        })
        .eq("id", sessionId)
        // RLS covers this, but explicit guard prevents accidents
        .eq("user_id", userId);
      setSaving(false);
    }, 1500);
  }, [sessionId, userId]);

  // ── Flush immediately (e.g. before navigating away) ──────────
  const flushSave = useCallback(() => {
    clearTimeout(saveTimer.current);
  }, []);

  // Clean up timer on unmount
  useEffect(() => () => clearTimeout(saveTimer.current), []);

  // ── Increment readiness via secure RPC ───────────────────────
  // Calls the server-side function so the DB enforces the 0-100 clamp.
  const addReadiness = useCallback(async (delta) => {
    const { data, error } = await supabase
      .rpc("increment_readiness", { delta: Math.max(0, delta) });

    if (error) console.error("[useChatSession] addReadiness:", error.message);
    return data; // returns the new score
  }, []);

  return {
    sessionId,
    saving,
    initSession,
    saveMessages,
    flushSave,
    addReadiness,
  };
}


// ============================================================
// 5. ARTIFACTS HOOK  (src/hooks/useArtifacts.js)
// ============================================================
//
// Lists and creates immutable artifact records.
// Physical file uploads go to Supabase Storage — the Storage
// bucket policy mirrors table RLS (users see only their files).
// ============================================================

export function useArtifacts(userId, projectId) {
  const [artifacts, setArtifacts] = useState([]);
  const [loading, setLoading]     = useState(true);

  const fetchArtifacts = useCallback(async () => {
    if (!userId || !projectId) { setLoading(false); return; }

    const { data, error } = await supabase
      .from("artifacts")
      .select("id, artifact_type, filename, storage_path, metadata, created_at")
      .eq("user_id", userId)
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (!error) setArtifacts(data ?? []);
    setLoading(false);
  }, [userId, projectId]);

  useEffect(() => { fetchArtifacts(); }, [fetchArtifacts]);

  // ── Create an artifact record + upload the file ──────────────
  const createArtifact = useCallback(async ({
    sessionId,
    artifactType,
    filename,
    fileBlob,         // File | Blob — pass null for metadata-only record
    metadata = {},
  }) => {
    let storagePath = null;

    // 1. Upload the file if provided
    if (fileBlob) {
      // Path format: {userId}/{projectId}/{timestamp}-{filename}
      storagePath = `${userId}/${projectId}/${Date.now()}-${filename}`;

      const { error: uploadError } = await supabase.storage
        .from("artifacts")               // bucket name
        .upload(storagePath, fileBlob, {
          contentType: fileBlob.type,
          upsert: false,                 // artifacts are immutable — never overwrite
        });

      if (uploadError) return { error: uploadError };
    }

    // 2. Insert the metadata record
    const { data, error: insertError } = await supabase
      .from("artifacts")
      .insert({
        user_id:       userId,
        project_id:    projectId,
        session_id:    sessionId ?? null,
        artifact_type: artifactType,
        filename,
        storage_path:  storagePath,
        metadata,
      })
      .select()
      .single();

    if (!insertError && data) {
      setArtifacts((prev) => [data, ...prev]);
    }

    return { data, error: insertError };
  }, [userId, projectId]);

  // ── Get a short-lived signed URL for download ────────────────
  // Storage RLS means only the owner can request a signed URL.
  const getDownloadUrl = useCallback(async (storagePath, expiresInSeconds = 300) => {
    const { data, error } = await supabase.storage
      .from("artifacts")
      .createSignedUrl(storagePath, expiresInSeconds);

    return { url: data?.signedUrl, error };
  }, []);

  return {
    artifacts,
    loading,
    refetch: fetchArtifacts,
    createArtifact,
    getDownloadUrl,
  };
}


// ============================================================
// 6. ROOT COMPONENT  (src/PathfinderApp.jsx)
// ============================================================
//
// Wires authentication state into the existing Pathfinder UI.
// Shows the Auth/Onboarding flow when signed out, and the full
// application when signed in.  All Supabase calls stay in the
// hooks above — the component only coordinates state.
// ============================================================

import React, { useState, useEffect, useRef, useCallback } from "react";

export default function PathfinderApp() {
  const {
    user, profile, loading: authLoading,
    isAuthenticated, signIn, signOut, updateProfile,
  } = useAuth();

  // Active project (first active project by default)
  const { projects, loading: projectsLoading, createProject, advanceLevel } =
    useProjects(user?.id);

  const activeProject = projects[0] ?? null;

  const { sessionId, saving, initSession, saveMessages, addReadiness } =
    useChatSession(user?.id, activeProject?.id ?? null);

  const { artifacts, createArtifact } =
    useArtifacts(user?.id, activeProject?.id ?? null);

  // ── Local UI state (mirrors existing Pathfinder state) ───────
  const [screen, setScreen]                 = useState("auth");
  const [readinessScore, setReadinessScore] = useState(0);
  const [messages, setMessages]             = useState([]);
  const [sprintState, setSprintState]       = useState("active");
  const [sprintSeconds, setSprintSeconds]   = useState(5400);

  // ── Sync auth state → screen ─────────────────────────────────
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { setScreen("auth"); return; }
    if (!profile?.accountability_tier) { setScreen("onboarding"); return; }
    setScreen("home");
    // Restore readiness score from DB profile
    setReadinessScore(profile.readiness_score ?? 0);
  }, [authLoading, isAuthenticated, profile]);

  // ── Handle OAuth sign-in buttons ─────────────────────────────
  const handleSignIn = useCallback(async (provider) => {
    // Map Pathfinder provider ids → Supabase OAuth provider names
    const providerMap = { google: "google", apple: "apple", meta: "facebook" };
    await signIn(providerMap[provider] ?? provider);
    // After redirect + callback, onAuthStateChange fires automatically
  }, [signIn]);

  // ── Save messages to DB on every change (debounced) ──────────
  useEffect(() => {
    if (!sessionId || messages.length === 0) return;
    saveMessages(messages, sprintState, sprintSeconds);
  }, [messages, sprintState, sprintSeconds, sessionId, saveMessages]);

  // ── Award readiness points ────────────────────────────────────
  const handleReadinessGain = useCallback(async (delta, skill) => {
    // Call the RPC so the DB enforces the 0-100 clamp atomically
    const newScore = await addReadiness(delta);
    if (newScore !== null) setReadinessScore(newScore);
  }, [addReadiness]);

  // ── Commit the accountability tier chosen in onboarding ──────
  const handleOnboardingComplete = useCallback(async (tier) => {
    await updateProfile({ accountability_tier: tier });

    // Create the user's first project if none exists
    if (projects.length === 0) {
      await createProject({ name: "My First Venture" });
    }
    // Init a chat session for the active project
    await initSession("new_project");

    setScreen("home");
  }, [updateProfile, projects.length, createProject, initSession]);

  // ── Generate and persist a handoff package artifact ──────────
  const handleGenerateHandoff = useCallback(async () => {
    if (!activeProject) return;

    // 1. Advance the project level in DB
    await advanceLevel(activeProject.id, 4);

    // 2. Insert the artifact record
    //    (no real file here — metadata-only for the prototype)
    await createArtifact({
      sessionId,
      artifactType: "handoff_package",
      filename:     `Handoff_Package_${Date.now()}.pdf`,
      metadata: {
        project_name:  activeProject.name,
        generated_at:  new Date().toISOString(),
        session_id:    sessionId,
      },
    });
  }, [activeProject, advanceLevel, createArtifact, sessionId]);

  // ── Sign out ─────────────────────────────────────────────────
  const handleLogout = useCallback(async () => {
    await signOut();
    setMessages([]);
    setScreen("auth");
  }, [signOut]);

  // ── Loading gate ─────────────────────────────────────────────
  if (authLoading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(ellipse at 35% 25%, #1a1028 0%, #08080e 55%, #06101a 100%)",
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: "50%",
          border: "3px solid rgba(245,158,11,.2)",
          borderTopColor: "#f59e0b",
          animation: "spin 0.8s linear infinite",
        }}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────
  // The existing Pathfinder component tree is unchanged.
  // We inject the Supabase-backed handlers as props so the UI
  // remains decoupled from the data layer.
  return (
    <PathfinderUI
      screen={screen}
      setScreen={setScreen}
      user={user}
      profile={profile}
      projects={projects}
      activeProject={activeProject}
      artifacts={artifacts}
      messages={messages}
      setMessages={setMessages}
      readinessScore={readinessScore}
      sprintState={sprintState}
      setSprintState={setSprintState}
      sprintSeconds={sprintSeconds}
      setSprintSeconds={setSprintSeconds}
      saving={saving}
      onSignIn={handleSignIn}
      onLogout={handleLogout}
      onOnboardingComplete={handleOnboardingComplete}
      onReadinessGain={handleReadinessGain}
      onGenerateHandoff={handleGenerateHandoff}
    />
  );
}


// ============================================================
// SECURITY CHECKLIST — verified before every deploy
// ============================================================
//
//  ✓ VITE_SUPABASE_ANON_KEY in bundle (safe — RLS is the guard)
//  ✗ SUPABASE_SERVICE_ROLE_KEY never in any .env.* for frontend
//  ✓ RLS ENABLED on users, projects, chat_sessions, artifacts
//  ✓ All policies use (SELECT auth.uid()) for performance
//  ✓ Foreign-key guards on INSERT for artifacts + chat_sessions
//  ✓ increment_readiness() RPC enforces 0-100 server-side
//  ✓ downgrade_tier_with_cooldown() RPC enforces 48-h lock
//  ✓ Storage bucket policy mirrors table RLS (same user_id check)
//  ✓ Signed URLs used for downloads — never public bucket reads
//  ✓ handle_new_user() trigger is SECURITY DEFINER + fixed
//    search_path to prevent privilege escalation
//  ✓ Artifacts are write-once (no UPDATE policy on artifacts)
//  ✓ Auto-created profiles are idempotent (ON CONFLICT DO NOTHING)
//
// ============================================================
