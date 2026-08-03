/**
 * src/hooks/useLanguage.js
 * ─────────────────────────────────────────────────────────────
 * Manages the user's language preference.
 * Detects from browser → persists to Supabase profile → provides
 * a `setLanguage` function that updates both local state and DB.
 *
 * The `lang` value is passed to:
 *  1. The `t(key, lang)` function from i18n.js  → static UI strings
 *  2. callDirector(…, context: { language })     → LLM system prompt
 * ─────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { detectLanguage, SUPPORTED_LANGUAGES } from "@/lib/i18n";

/**
 * @param {Object|null} profile   - from useAuth().profile
 * @param {Function}    updateProfile - from useAuth().updateProfile
 */
export function useLanguage(profile, updateProfile) {
  const [lang,    setLangState] = useState("en");
  const [loading, setLoading]   = useState(true);

  // Detect and set language on profile load
  useEffect(() => {
    const detected = detectLanguage(profile?.language);
    setLangState(detected);
    setLoading(false);

    // If the profile exists but has no language saved yet, persist detection
    if (profile && !profile.language) {
      updateProfile({ language: detected }).catch(() => {});
    }
  }, [profile, updateProfile]);

  /**
   * Change language: updates state immediately (instant UI feedback)
   * then persists to Supabase profile in the background.
   */
  const setLanguage = useCallback(async (code) => {
    const valid = SUPPORTED_LANGUAGES.find(l => l.code === code);
    if (!valid) return;

    setLangState(code);

    // Set document direction for RTL languages (Arabic)
    document.documentElement.setAttribute("dir", valid.dir || "ltr");
    document.documentElement.setAttribute("lang", code);

    if (profile) {
      await updateProfile({ language: code });
    }
  }, [profile, updateProfile]);

  // Apply direction on mount
  useEffect(() => {
    const langObj = SUPPORTED_LANGUAGES.find(l => l.code === lang);
    if (langObj) {
      document.documentElement.setAttribute("dir", langObj.dir || "ltr");
      document.documentElement.setAttribute("lang", lang);
    }
  }, [lang]);

  return { lang, setLanguage, loading };
}
