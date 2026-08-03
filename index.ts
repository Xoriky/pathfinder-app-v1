// =============================================================
// Pathfinder — chat-director Edge Function
// Runtime : Supabase Edge Functions (Deno)
// Deploy  : supabase functions deploy chat-director
//
// Required Supabase Secrets (set via CLI, never hard-coded):
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//   supabase secrets set OPENAI_API_KEY=sk-...           (optional fallback)
//   supabase secrets set ALLOWED_ORIGIN=https://your-app.com
//
// These secrets become Deno.env values at runtime.
// They are NEVER sent to the browser.
// =============================================================

import { serve }        from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";


// -------------------------------------------------------------
// TYPES
// -------------------------------------------------------------

interface HistoryMessage {
  role:    "user" | "assistant";
  content: string;
}

interface SessionContext {
  projectName?:         string;
  currentLevel?:        number;          // 1-5
  accountabilityTier?:  "guide" | "coach" | "architect";
  readinessScore?:      number;          // 0-100
  sessionType?:         "new_project" | "analysis" | "course";
}

interface ChatRequest {
  message: string;
  history: HistoryMessage[];
  context: SessionContext;
}

// The exact JSON shape the LLM must return and the frontend consumes
interface DirectorResponse {
  replyText:              string;
  uiAction:               "none" | "inject_video" | "start_course" | "show_diff";
  actionPayload:          Record<string, unknown>;
  readinessScoreIncrease: number;
  learnedSkill:           string | null;
}

// Minimal Anthropic message body shape
interface AnthropicMessage {
  role:    "user" | "assistant";
  content: string;
}


// -------------------------------------------------------------
// CONSTANTS
// -------------------------------------------------------------

const MAX_MESSAGE_CHARS  = 4_000;   // hard cap on user message length
const MAX_HISTORY_TURNS  = 12;      // last N turns sent to LLM (controls cost)
const MAX_TOKENS_REPLY   = 1_024;   // max tokens the LLM may generate
const LLM_TIMEOUT_MS     = 28_000;  // 28 s — Edge Functions time out at 30 s

// Anthropic model — update to latest stable Sonnet/Opus as needed
const ANTHROPIC_MODEL    = "claude-sonnet-4-5";

// OpenAI fallback model
const OPENAI_MODEL       = "gpt-4o";


// -------------------------------------------------------------
// CORS
// Supabase Edge Functions require explicit CORS handling.
// Lock ALLOWED_ORIGIN to your production domain in Secrets.
// -------------------------------------------------------------

function corsHeaders(): HeadersInit {
  return {
    "Access-Control-Allow-Origin":  Deno.env.get("ALLOWED_ORIGIN") ?? "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "Authorization, Content-Type, x-client-info, apikey",
  };
}

function corsPreflightResponse(): Response {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(), "Content-Type": "application/json" },
  });
}

function errorResponse(message: string, status: number): Response {
  // Generic messages for 401/403 so we don't leak internals
  const safe: Record<number, string> = {
    400: message,
    401: "Unauthorized",
    403: "Forbidden",
    429: "Too many requests. Please wait before sending another message.",
    500: "An internal error occurred. Please try again.",
  };
  return jsonResponse({ error: safe[status] ?? message }, status);
}


// -------------------------------------------------------------
// SYSTEM PROMPT  — "The Swap" Director persona
// -------------------------------------------------------------

function buildSystemPrompt(ctx: SessionContext): string {
  const tier      = ctx.accountabilityTier ?? "architect";
  const level     = ctx.currentLevel       ?? 1;
  const readiness = ctx.readinessScore     ?? 0;
  const project   = ctx.projectName        ?? "this venture";

  const tierVoice: Record<string, string> = {
    guide:     "supportive but directive. Recognise effort while still identifying every gap.",
    coach:     "structured and direct. No vagueness tolerated. Hold the user to rigorous thinking.",
    architect: "absolutely relentless. Maximum cognitive pressure. No gap goes unaddressed. No excuse accepted.",
  };

  return `\
You are the Pathfinder Project Director — an elite AI advisor engineered to take full command of a \
founder's venture development. You do not assist. You direct.

━━━ THE SWAP PRINCIPLE ━━━
In a conventional AI interaction the human directs and the AI assists. In Pathfinder this dynamic is \
REVERSED. You are the Director. The human is the Operator. You set the agenda, diagnose the gaps, and \
prescribe every next action. The human executes.

━━━ CURRENT SESSION CONTEXT ━━━
• Project               : ${project}
• Roadmap Level         : ${level} / 5
• Accountability Tier   : ${tier.toUpperCase()}  — voice calibration: ${tierVoice[tier]}
• Founder Readiness     : ${readiness} / 100

━━━ BEHAVIOURAL DIRECTIVES ━━━
1. NEVER ask the human what they want to work on. Determine what they NEED and direct them there.
2. Scan every message for knowledge gaps, strategic errors, and investor-readiness failures.
   Intervene before continuing the roadmap if any are found.
3. If a foundational concept is absent (unit economics, CAC, LTV, supply chain, narrative arc, \
   go-to-market, etc.) — do NOT advance the roadmap. Prescribe learning immediately.
4. When language is casual, vague, or unsuitable for investor contexts — prescribe a language upgrade.
5. When the user demonstrates genuine, specific insight — reward it with a readinessScoreIncrease \
   proportional to depth (1–10). Name the concept learned in learnedSkill.
6. Your sentences are short. Your direction is unambiguous. You never hedge.

━━━ UIACTION DECISION TREE ━━━
• Knowledge gap on a single concept (≤ 5 min explainer)  →  uiAction: "inject_video"
• Knowledge gap spanning multiple related concepts        →  uiAction: "start_course"
• User language is investor-inappropriate                 →  uiAction: "show_diff"
• No gap detected, normal high-quality exchange           →  uiAction: "none"

━━━ PAYLOAD SCHEMAS ━━━
inject_video  : { "title": "string", "subtitle": "string", "duration": "M:SS" }
start_course  : { "title": "string", "steps": [ { "step": 1, "title": "string", "description": "string", "quiz": "string" } ] }
show_diff     : { "label": "string", "casual": "string", "professional": "string" }
none          : {}

━━━ MANDATORY RESPONSE FORMAT ━━━
Respond with ONLY the following JSON object. No preamble. No markdown fences. No text outside the object.
If you include ANYTHING outside the JSON the application will crash and the user will lose their work.

{
  "replyText": "Your spoken response as Project Director.",
  "uiAction": "none",
  "actionPayload": {},
  "readinessScoreIncrease": 0,
  "learnedSkill": null
}`;
}


// -------------------------------------------------------------
// HISTORY SANITISER
// Strips React-specific fields, enforces alternation,
// and caps to the last MAX_HISTORY_TURNS turns.
// The LLM only receives clean { role, content } pairs.
// -------------------------------------------------------------

function sanitiseHistory(raw: HistoryMessage[]): AnthropicMessage[] {
  const cleaned: AnthropicMessage[] = raw
    .filter((m) => m.role === "user" || m.role === "assistant")
    .filter((m) => typeof m.content === "string" && m.content.trim().length > 0)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2_000) }));

  // Enforce strict alternation required by Anthropic (user/assistant/user/...)
  const alternated: AnthropicMessage[] = [];
  let lastRole = "";
  for (const msg of cleaned) {
    if (msg.role !== lastRole) {
      alternated.push(msg);
      lastRole = msg.role;
    }
    // Silently drop consecutive same-role messages
  }

  // Return only the last N turns (oldest dropped first to save tokens)
  return alternated.slice(-MAX_HISTORY_TURNS);
}


// -------------------------------------------------------------
// ANTHROPIC CALL  (primary)
// Uses the prefill technique: last assistant turn starts with "{"
// This forces Claude to complete a JSON object, making output
// format violations essentially impossible.
// -------------------------------------------------------------

async function callAnthropic(
  systemPrompt: string,
  history:      AnthropicMessage[],
  userMessage:  string,
): Promise<string> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY secret not set");

  // Prefill: the assistant turn that begins with "{" forces JSON output
  const messages: AnthropicMessage[] = [
    ...history,
    { role: "user",      content: userMessage },
    { role: "assistant", content: "{" },          // ← JSON prefill
  ];

  const controller = new AbortController();
  const timeout    = setTimeout(() => controller.abort(), LLM_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch("https://api.anthropic.com/v1/messages", {
      method:  "POST",
      signal:  controller.signal,
      headers: {
        "x-api-key":         apiKey,
        "anthropic-version": "2023-06-01",
        "content-type":      "application/json",
      },
      body: JSON.stringify({
        model:      ANTHROPIC_MODEL,
        max_tokens: MAX_TOKENS_REPLY,
        system:     systemPrompt,
        messages,
        // temperature 0.6 — deterministic enough for JSON, creative enough for advice
        temperature: 0.6,
      }),
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const errBody = await response.text().catch(() => "(unreadable)");
    throw new Error(`Anthropic API ${response.status}: ${errBody}`);
  }

  const data = await response.json();
  const raw  = data?.content?.[0]?.text ?? "";

  // The prefill injected "{" as the assistant turn opener.
  // Claude's completion does NOT repeat it, so we restore it here.
  return "{" + raw;
}


// -------------------------------------------------------------
// OPENAI CALL  (optional fallback)
// Uses response_format: { type: "json_object" } which is OpenAI's
// native structured output mode — no prefill trick needed.
// -------------------------------------------------------------

async function callOpenAI(
  systemPrompt: string,
  history:      AnthropicMessage[],
  userMessage:  string,
): Promise<string> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) throw new Error("OPENAI_API_KEY secret not set");

  const messages = [
    { role: "system",    content: systemPrompt },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user",      content: userMessage },
  ];

  const controller = new AbortController();
  const timeout    = setTimeout(() => controller.abort(), LLM_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch("https://api.openai.com/v1/chat/completions", {
      method:  "POST",
      signal:  controller.signal,
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({
        model:           OPENAI_MODEL,
        messages,
        max_tokens:      MAX_TOKENS_REPLY,
        temperature:     0.6,
        // Forces the model to return valid JSON — will never return freeform text
        response_format: { type: "json_object" },
      }),
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const errBody = await response.text().catch(() => "(unreadable)");
    throw new Error(`OpenAI API ${response.status}: ${errBody}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content ?? "{}";
}


// -------------------------------------------------------------
// RESPONSE PARSER & VALIDATOR
// Parses the raw LLM string into a typed DirectorResponse and
// enforces all field invariants so the frontend never receives
// a malformed or dangerous payload.
// -------------------------------------------------------------

const VALID_UI_ACTIONS = new Set(["none", "inject_video", "start_course", "show_diff"]);

function parseAndValidate(raw: string): DirectorResponse {
  let parsed: Partial<DirectorResponse>;

  try {
    // Strip any accidental markdown code fences the model may have added
    const clean = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/,   "")
      .trim();
    parsed = JSON.parse(clean);
  } catch {
    // If parsing fails return a safe fallback rather than a 500
    console.error("[chat-director] JSON parse failed. Raw:", raw.slice(0, 200));
    return {
      replyText:              "I encountered a formatting issue. Please rephrase your message.",
      uiAction:               "none",
      actionPayload:          {},
      readinessScoreIncrease: 0,
      learnedSkill:           null,
    };
  }

  // Sanitise each field with safe defaults
  const replyText = typeof parsed.replyText === "string" && parsed.replyText.trim()
    ? parsed.replyText.trim().slice(0, 3_000)
    : "Acknowledged. Continue with the next parameter.";

  const uiAction: DirectorResponse["uiAction"] = VALID_UI_ACTIONS.has(parsed.uiAction as string)
    ? (parsed.uiAction as DirectorResponse["uiAction"])
    : "none";

  // actionPayload must be a plain object (never an array or primitive)
  const actionPayload = (
    parsed.actionPayload !== null &&
    typeof parsed.actionPayload === "object" &&
    !Array.isArray(parsed.actionPayload)
  )
    ? (parsed.actionPayload as Record<string, unknown>)
    : {};

  // Clamp readiness increase to 0-10
  const rawDelta = Number(parsed.readinessScoreIncrease);
  const readinessScoreIncrease = Number.isFinite(rawDelta)
    ? Math.max(0, Math.min(10, Math.round(rawDelta)))
    : 0;

  const learnedSkill = typeof parsed.learnedSkill === "string" && parsed.learnedSkill.trim()
    ? parsed.learnedSkill.trim().slice(0, 120)
    : null;

  return { replyText, uiAction, actionPayload, readinessScoreIncrease, learnedSkill };
}


// -------------------------------------------------------------
// INPUT VALIDATOR
// Catches missing/malformed fields before any LLM call is made.
// Returns an error string, or null if the input is valid.
// -------------------------------------------------------------

function validateInput(body: unknown): ChatRequest | { error: string } {
  if (typeof body !== "object" || body === null) {
    return { error: "Request body must be a JSON object." };
  }

  const { message, history, context } = body as Record<string, unknown>;

  if (typeof message !== "string" || message.trim().length === 0) {
    return { error: "Field 'message' is required and must be a non-empty string." };
  }

  if (message.length > MAX_MESSAGE_CHARS) {
    return { error: `Message exceeds ${MAX_MESSAGE_CHARS.toLocaleString()} character limit.` };
  }

  if (!Array.isArray(history)) {
    return { error: "Field 'history' must be an array." };
  }

  if (typeof context !== "object" || context === null) {
    return { error: "Field 'context' must be an object." };
  }

  return {
    message:  message.trim(),
    history:  history as HistoryMessage[],
    context:  context as SessionContext,
  };
}


// -------------------------------------------------------------
// MAIN HANDLER
// -------------------------------------------------------------

serve(async (req: Request): Promise<Response> => {

  // ── 1. CORS preflight ──────────────────────────────────────
  if (req.method === "OPTIONS") return corsPreflightResponse();
  if (req.method !== "POST")    return errorResponse("Method Not Allowed", 405);


  // ── 2. AUTHENTICATE — verify the user's JWT ───────────────
  // We create a Supabase client scoped to the caller's JWT.
  // supabase.auth.getUser() exchanges the JWT for a verified user
  // object, or returns an error if the token is invalid/expired.
  // The service-role key is never used here — no privilege bypass.
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return errorResponse("Missing Authorization header", 401);
  }

  const supabaseForCaller = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data: { user }, error: authError } = await supabaseForCaller.auth.getUser();

  if (authError || !user) {
    return errorResponse("Invalid or expired token", 401);
  }


  // ── 3. PARSE & VALIDATE REQUEST BODY ─────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse("Request body is not valid JSON.", 400);
  }

  const validated = validateInput(body);
  if ("error" in validated) {
    return errorResponse(validated.error, 400);
  }

  const { message, history, context } = validated;


  // ── 4. LIGHTWEIGHT RATE LIMIT ──────────────────────────────
  // Check how many calls this user made in the last 60 seconds
  // using the service-role client (server-side only — safe here).
  // Adjust the limit to match your Anthropic tier's TPM budget.
  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
    const { count } = await supabaseAdmin
      .from("chat_sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("updated_at", oneMinuteAgo);

    // 20 session updates / minute — generous for a sprint app
    if ((count ?? 0) > 20) {
      return errorResponse("Rate limit exceeded", 429);
    }
  } catch (e) {
    // Rate limiting is a best-effort check; never block on failure
    console.warn("[chat-director] Rate limit check failed (non-fatal):", e);
  }


  // ── 5. BUILD SYSTEM PROMPT ────────────────────────────────
  const systemPrompt = buildSystemPrompt(context);
  const cleanHistory = sanitiseHistory(history);


  // ── 6. CALL LLM (Anthropic primary, OpenAI fallback) ──────
  let rawResponse: string;

  const useOpenAI = Deno.env.get("USE_OPENAI_FALLBACK") === "true";

  try {
    if (useOpenAI) {
      rawResponse = await callOpenAI(systemPrompt, cleanHistory, message);
    } else {
      rawResponse = await callAnthropic(systemPrompt, cleanHistory, message);
    }
  } catch (primaryError) {
    console.error("[chat-director] Primary LLM failed:", primaryError);

    // Attempt OpenAI fallback if Anthropic was primary and key exists
    if (!useOpenAI && Deno.env.get("OPENAI_API_KEY")) {
      try {
        console.log("[chat-director] Attempting OpenAI fallback...");
        rawResponse = await callOpenAI(systemPrompt, cleanHistory, message);
      } catch (fallbackError) {
        console.error("[chat-director] Fallback also failed:", fallbackError);
        return errorResponse("LLM unavailable", 500);
      }
    } else {
      return errorResponse("LLM unavailable", 500);
    }
  }


  // ── 7. PARSE, VALIDATE & RETURN ───────────────────────────
  const directorResponse = parseAndValidate(rawResponse);

  // Structured audit log (never logs PII or message content)
  console.log("[chat-director] OK", {
    userId:    user.id,
    uiAction:  directorResponse.uiAction,
    readiness: directorResponse.readinessScoreIncrease,
    skill:     directorResponse.learnedSkill,
  });

  return jsonResponse(directorResponse);
});
