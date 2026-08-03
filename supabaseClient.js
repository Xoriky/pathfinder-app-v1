/**
 * src/lib/supabaseClient.js
 * ─────────────────────────────────────────────────────────────
 * Single Supabase client instance for the entire Pathfinder app.
 *
 * RULES:
 *  ✓  Import this file wherever you need Supabase.
 *  ✓  Only VITE_SUPABASE_ANON_KEY is ever used here.
 *  ✗  Never create a second client with createClient() elsewhere.
 *  ✗  Never pass SUPABASE_SERVICE_ROLE_KEY to this client.
 *     The service role key belongs in Supabase Edge Functions only.
 *
 * The anon key is safe to expose in the browser because Row-Level
 * Security (RLS) on every table enforces tenant isolation at the
 * database level — not at the key level.
 * ─────────────────────────────────────────────────────────────
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "[Pathfinder] Missing Supabase environment variables.\n" +
    "  1. Copy .env.example → .env.local\n" +
    "  2. Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY\n" +
    "  3. Restart the dev server (npm run dev)"
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // Keep the user signed in across page refreshes.
    persistSession: true,

    // Silently exchange the JWT for a fresh one before it expires.
    // Without this, an hour-long sprint session gets a 401 mid-use.
    autoRefreshToken: true,

    // Detect the ?code= query param after OAuth redirect and
    // exchange it for a session automatically.
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      "x-application-name": "pathfinder",
    },
  },
});
