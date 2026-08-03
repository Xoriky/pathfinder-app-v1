/**
 * src/lib/chatDirector.js
 * ─────────────────────────────────────────────────────────────
 * Typed wrapper around supabase.functions.invoke("chat-director").
 * Imported by App.jsx → handleSend and handleChip.
 *
 * The supabase client automatically attaches the active JWT as
 * Authorization: Bearer — no manual token handling needed.
 * ─────────────────────────────────────────────────────────────
 */

import { supabase } from "@/lib/supabaseClient";

/**
 * Maps Pathfinder UI provider IDs → Supabase Auth OAuth provider names.
 * Supabase uses "facebook" for Meta's OAuth app — NOT "meta".
 * Without this, signInWithOAuth({ provider: "meta" }) returns a 400.
 */
export const PROVIDER_MAP = {
  google: "google",
  apple:  "apple",
  meta:   "facebook",   // ← critical: Supabase name for Meta OAuth
};

/**
 * Calls the chat-director Supabase Edge Function.
 *
 * @param {string}   message   - The user's current message
 * @param {Array}    history   - Full ChatMessage[] from React state
 * @param {Object}   context   - Session context (project, tier, readiness…)
 * @returns {{ data: DirectorResponse|null, error: string|null }}
 */
export async function callDirector(message, history, context = {}) {
  // Convert internal ChatMessage[] → { role, content }[]
  // Send only the last 12 turns to cap token cost
  const historyPayload = history
    .filter(m => m.type === "user" || m.type === "ai")
    .slice(-12)
    .map(m => ({
      role:    m.type === "ai" ? "assistant" : "user",
      content: m.text,
    }));

  const { data, error } = await supabase.functions.invoke("chat-director", {
    body: {
      message,
      history: historyPayload,
      context,
    },
    // The Supabase client injects Authorization: Bearer <JWT> automatically
    // from the active session managed by onAuthStateChange.
  });

  if (error) {
    const msg = error?.message ?? "Edge Function call failed";
    console.error("[callDirector]", msg);
    return { data: null, error: msg };
  }

  return { data: data ?? null, error: null };
}
