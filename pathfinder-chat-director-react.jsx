/**
 * PATHFINDER — React ↔ chat-director Edge Function integration
 * =============================================================
 * Drop these three pieces into the existing Pathfinder App:
 *
 *  1. callDirector()   — typed wrapper around functions.invoke()
 *  2. handleSend()     — replaces the old slot-machine handleSend
 *  3. handleChip()     — updated to route chips through the Director
 *
 * The supabase client imported here is the SAME singleton from
 * pathfinder-supabase.jsx — anon key only, never service_role.
 * =============================================================
 */

import { supabase } from "./lib/supabaseClient";   // adjust path as needed


// -------------------------------------------------------------
// TYPES — mirror the Edge Function's DirectorResponse interface
// -------------------------------------------------------------

/** The exact JSON shape the chat-director Edge Function returns. */
interface DirectorResponse {
  replyText:              string;
  uiAction:               "none" | "inject_video" | "start_course" | "show_diff";
  actionPayload:          Record<string, unknown>;
  readinessScoreIncrease: number;
  learnedSkill:           string | null;
}

/** The message shape stored in React state (superset of history entry). */
interface ChatMessage {
  id:            string;
  type:          "user" | "ai";
  text:          string;
  uiAction?:     DirectorResponse["uiAction"];
  actionPayload?: Record<string, unknown>;
  isPraise?:     boolean;
  isWarning?:    boolean;
  hasChips?:     boolean;
  hasHubBtn?:    boolean;
  learnedSkill?: string | null;
}


// -------------------------------------------------------------
// callDirector()
// -------------------------------------------------------------
// Thin, typed wrapper around supabase.functions.invoke().
//
// Why functions.invoke() instead of fetch()?
//  • Automatically attaches the user's active JWT as the
//    Authorization: Bearer header — no manual token handling.
//  • Uses the project URL from your Supabase client config,
//    so the Edge Function URL never appears in your source code.
//  • Handles non-2xx responses by surfacing them as { error }.
// -------------------------------------------------------------

async function callDirector(
  message:  string,
  history:  ChatMessage[],
  context: {
    projectName?:        string;
    currentLevel?:       number;
    accountabilityTier?: string;
    readinessScore?:     number;
    sessionType?:        string;
  },
): Promise<{ data: DirectorResponse | null; error: string | null }> {

  // Convert internal ChatMessage[] to the { role, content }[]
  // shape the Edge Function expects.  We only send the last 12
  // turns to keep the payload small and reduce LLM token cost.
  const historyPayload = history
    .filter((m) => m.type === "user" || m.type === "ai")
    .slice(-12)
    .map((m) => ({
      role:    m.type === "ai" ? "assistant" : "user",
      content: m.text,
    }));

  const { data, error } = await supabase.functions.invoke<DirectorResponse>(
    "chat-director",          // must match the deployed function name
    {
      body: {
        message,
        history: historyPayload,
        context,
      },
      // functions.invoke() injects the JWT automatically from the
      // active Supabase session — no manual auth header needed here.
    },
  );

  if (error) {
    // FunctionsHttpError gives us the HTTP status + body
    const msg = error?.message ?? "Edge Function call failed";
    console.error("[callDirector] Error:", msg);
    return { data: null, error: msg };
  }

  return { data: data ?? null, error: null };
}


// -------------------------------------------------------------
// processDirectorResponse()
// -------------------------------------------------------------
// Shared handler that applies a DirectorResponse to React state.
// Called by both handleSend and handleChip so the logic lives
// in one place.
// -------------------------------------------------------------

function makeProcessDirectorResponse(
  // These are the relevant setters from the App component
  setMessages:          React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  setIsTyping:          React.Dispatch<React.SetStateAction<boolean>>,
  setVideoLockedMsgId:  React.Dispatch<React.SetStateAction<string | null>>,
  setReadinessScore:    React.Dispatch<React.SetStateAction<number>>,
  setReadinessToast:    React.Dispatch<React.SetStateAction<{ skill: string; amount: number } | null>>,
  setCoursePayload:     React.Dispatch<React.SetStateAction<unknown>>,
  setScreen:            React.Dispatch<React.SetStateAction<string>>,
) {
  return function processDirectorResponse(response: DirectorResponse): void {
    const { replyText, uiAction, actionPayload, readinessScoreIncrease, learnedSkill } = response;

    // start_course transitions the screen instead of adding a bubble
    if (uiAction === "start_course") {
      setMessages((prev) => [
        ...prev,
        {
          id:   crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
          type: "ai",
          text: replyText,
        },
      ]);
      setCoursePayload(actionPayload);
      // Brief delay so the user sees the transition message first
      setTimeout(() => setScreen("course"), 1_300);
      return;
    }

    const msgId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

    setMessages((prev) => [
      ...prev,
      {
        id:            msgId,
        type:          "ai",
        text:          replyText,
        uiAction,
        actionPayload,
        learnedSkill,
      },
    ]);

    if (uiAction === "inject_video") {
      setVideoLockedMsgId(msgId);
    }

    if (readinessScoreIncrease > 0) {
      setReadinessScore((prev) => Math.min(100, prev + readinessScoreIncrease));
      if (learnedSkill) {
        setReadinessToast({ skill: learnedSkill, amount: readinessScoreIncrease });
        setTimeout(() => setReadinessToast(null), 3_500);
      }
    }
  };
}


// -------------------------------------------------------------
// handleSend()  — replaces the old slot-machine version
// -------------------------------------------------------------
// Paste this function inside the App component, replacing the
// old handleSend that used Math.random() / CLINICAL / PRAISE.
//
// Dependencies from App state that must already exist:
//   input, setInput, sprintState, videoLockedMsgId,
//   messages, setMessages, setIsTyping, typingTimeoutRef,
//   setVideoLockedMsgId, setReadinessScore, setReadinessToast,
//   setCoursePayload, setScreen,
//   activeProject (from useProjects), profile (from useAuth)
// -------------------------------------------------------------

/*

const handleSend = useCallback(async () => {
  // ── Guards ────────────────────────────────────────────────
  if (!input.trim())            return;   // empty message
  if (sprintState === "locked") return;   // sprint lockout active
  if (messages.some(m => m.uiAction === "inject_video" && !m.actionPayload?.watched)) return;

  const raw = input.trim();
  setInput("");

  // ── Add user message to state immediately ─────────────────
  setMessages((prev) => [
    ...prev,
    {
      id:   crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      type: "user",
      text: raw,
    },
  ]);

  setIsTyping(true);

  // ── Invoke the Edge Function — try/catch/finally ──────────
  // CRITICAL: setIsTyping(false) lives in `finally` so the
  // bouncing dots ALWAYS stop, even if the network is down or
  // both Anthropic and OpenAI return errors simultaneously.
  try {
    const { data, error } = await callDirector(
      raw,
      messages,
      {
        projectName:        activeProject?.name,
        currentLevel:       activeProject?.current_level,
        accountabilityTier: profile?.accountability_tier,
        readinessScore,
        sessionType:        "new_project",
      },
    );

    if (error || !data) {
      // Edge Function returned a non-2xx or empty body
      setMessages((prev) => [
        ...prev,
        {
          id:   crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
          type: "ai",
          text: "I'm having trouble connecting right now. Please check your connection.",
        },
      ]);
      return;
    }

    // ── Route the structured JSON response to UI state ──────
    processDirectorResponse(data);

  } catch (error) {
    // Unhandled exception: network timeout, JSON parse crash, etc.
    // The user sees a graceful in-chat message instead of a frozen UI.
    console.error("[handleSend] Unexpected error:", error);
    setMessages((prev) => [
      ...prev,
      {
        id:   crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
        type: "ai",
        text: "I'm having trouble connecting to my neural network. Your work is saved — please try again.",
      },
    ]);
  } finally {
    // Runs after both the try block AND the catch block.
    // Guaranteed to execute even if the try block returns early
    // via the `return` statement inside the `if (error || !data)` check.
    setIsTyping(false);
  }

}, [
  input, sprintState, messages,
  activeProject, profile, readinessScore,
  setInput, setMessages, setIsTyping,
  setVideoLockedMsgId, setReadinessScore, setReadinessToast,
  setCoursePayload, setScreen,
]);

*/


// -------------------------------------------------------------
// handleChip()  — routes analysis chips through the Director
// -------------------------------------------------------------
// Replace the existing handleChip that used hard-coded
// SIMULATED_RESPONSES.  Chip labels are sent as user messages.
//
// The only change: instead of calling processJsonResponse(json)
// with a local object, we call callDirector() and let the real
// LLM decide what to return.
// -------------------------------------------------------------

/*

const handleChip = useCallback(async (label: string) => {
  setShowChips(false);
  typingTimeoutRef.current && clearTimeout(typingTimeoutRef.current);

  setMessages((prev) => [
    ...prev,
    {
      id:   crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      type: "user",
      text: label,
    },
  ]);

  setIsTyping(true);

  const { data, error } = await callDirector(
    label,
    messages,
    {
      projectName:        activeProject?.name,
      currentLevel:       activeProject?.current_level,
      accountabilityTier: profile?.accountability_tier,
      readinessScore,
      sessionType:        "analysis",
    },
  );

  setIsTyping(false);

  if (error || !data) {
    setMessages((prev) => [
      ...prev,
      {
        id:   crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
        type: "ai",
        text: "The Director encountered an error processing that selection. Please try again.",
      },
    ]);
    return;
  }

  processDirectorResponse(data);

  // If the chip was "Tell me about Idea 2" and the LLM returned
  // a normal reply, add the Hub CTA as a follow-up after a delay
  if (label === "Tell me about Idea 2" && data.uiAction === "none") {
    typingTimeoutRef.current = setTimeout(async () => {
      setIsTyping(true);
      const { data: follow } = await callDirector(
        "Should we map this idea to the Project Hub?",
        messages,
        { projectName: activeProject?.name, currentLevel: activeProject?.current_level,
          accountabilityTier: profile?.accountability_tier, readinessScore },
      );
      setIsTyping(false);
      if (follow) {
        setMessages((prev) => [
          ...prev,
          {
            id:       crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
            type:     "ai",
            text:     follow.replyText,
            hasHubBtn: true,
          },
        ]);
      }
    }, 2_000);
  }

}, [
  messages, activeProject, profile, readinessScore, showChips,
  setShowChips, setMessages, setIsTyping, typingTimeoutRef,
  setVideoLockedMsgId, setReadinessScore, setReadinessToast,
  setCoursePayload, setScreen,
]);

*/


// -------------------------------------------------------------
// DEPLOYMENT CHECKLIST
// -------------------------------------------------------------
//
//  1. Deploy the Edge Function:
//       supabase functions deploy chat-director --no-verify-jwt
//     (JWT is verified manually inside the function for fine
//      control; --no-verify-jwt skips the auto-check wrapper.)
//
//  2. Set required secrets:
//       supabase secrets set ANTHROPIC_API_KEY=sk-ant-api03-...
//       supabase secrets set ALLOWED_ORIGIN=https://your-app.com
//
//  3. Optional secrets:
//       supabase secrets set OPENAI_API_KEY=sk-...
//       supabase secrets set USE_OPENAI_FALLBACK=false
//
//  4. Verify the function appears in your Supabase dashboard
//     under Edge Functions and shows status "Active".
//
//  5. Test locally before deploying:
//       supabase functions serve chat-director --env-file .env.local
//     Then POST to http://localhost:54321/functions/v1/chat-director
//
//  6. Never commit any of the above keys to version control.
//     Add .env* and supabase/.temp to your .gitignore.
//
// -------------------------------------------------------------

export { callDirector, makeProcessDirectorResponse };
export type { DirectorResponse, ChatMessage };

// ── Provider mapping note (referenced in PathfinderApp) ────────
// Supabase Auth uses "facebook" for Meta's OAuth provider.
// The Pathfinder UI exposes the button as "meta" — bridge with:
//
//   const PROVIDER_MAP = { google:"google", apple:"apple", meta:"facebook" };
//   const handleSignIn = (provider) => signIn(PROVIDER_MAP[provider] ?? provider);
//
// This ensures signInWithOAuth receives the correct provider string.
// Without this mapping, signInWithOAuth({ provider: "meta" }) returns
// a "Provider not found" 400 error from Supabase Auth.
export const PROVIDER_MAP = { google: "google", apple: "apple", meta: "facebook" };

