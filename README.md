# Pathfinder AI - Proactive Business Architect

Pathfinder is a mobile-first, proactive AI application designed to cure founder execution paralysis through Accountability as a Service.

## Tech Stack
* **Frontend:** React, Vite, Tailwind/Inline CSS
* **Backend:** Supabase (PostgreSQL), Row-Level Security (RLS)
* **AI Routing:** Supabase Deno Edge Functions (Serverless)
* **Voice:** Native Web Speech API

## Architecture Notes
* **Security:** All critical state changes (like the 90-minute sprint lockout and readiness scores) are enforced via server-side RPCs to prevent client-side bypass exploits.
* **Edge Functions:** The Anthropic API keys are kept entirely off the client. All LLM requests route through the `chat-director` Deno function, which also handles custom JWT authentication.

## Local Setup
1. Clone the repository.
2. Run `npm install`.
3. Create a `.env.local` file in the root directory and add:
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
4. Run `npm run dev`.
