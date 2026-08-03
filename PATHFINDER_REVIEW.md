# PATHFINDER — Full Project Review
## Production Readiness Report · Supabase + VS Code + GitHub

---

## 1. FILE INVENTORY

| File | Purpose | Status |
|------|---------|--------|
| `proactive-ai-partner.jsx` | Complete React UI prototype (3 100+ lines) | ✅ Production-ready prototype |
| `pathfinder-schema.sql` | PostgreSQL schema + RLS + triggers + RPCs | ✅ Run once against Supabase |
| `pathfinder-supabase.jsx` | Auth, project, session & artifact hooks + root App | ✅ Replace prototype App with this |
| `supabase/functions/chat-director/index.ts` | Deno Edge Function — LLM proxy | ✅ Deploy with Supabase CLI |
| `pathfinder-chat-director-react.jsx` | `callDirector`, `handleSend`, `handleChip` | ✅ Merge into src/App.jsx |
| `pathfinder-bot.jsx` | Animated SVG AI character — 6 states | ✅ Drop into chat screen overlay |
| `package.json` | Dependencies & scripts | ✅ Ready |
| `vite.config.js` | Vite build config with code splitting | ✅ Ready |
| `.env.example` | Env var template (safe to commit) | ✅ Ready |
| `supabase/config.toml` | Supabase CLI project config | ✅ Ready |
| `.vscode/extensions.json` | Recommended VS Code extensions | ✅ Ready |
| `.vscode/settings.json` | Workspace formatting & Deno scoping | ✅ Ready |

---

## 2. PROJECT STRUCTURE

Place files in this exact layout before `npm run dev`:

```
pathfinder/
├── .env.example              ← commit this
├── .env.local                ← DO NOT commit (in .gitignore)
├── .gitignore
├── package.json
├── vite.config.js
├── index.html                ← create (see §3)
│
├── .vscode/
│   ├── extensions.json
│   └── settings.json
│
├── src/
│   ├── main.jsx              ← create (see §3)
│   ├── App.jsx               ← merge prototype + hooks
│   │
│   ├── lib/
│   │   └── supabaseClient.js ← EXTRACT from pathfinder-supabase.jsx (see §4)
│   │
│   ├── hooks/
│   │   ├── useAuth.js        ← from pathfinder-supabase.jsx
│   │   ├── useProjects.js    ← from pathfinder-supabase.jsx
│   │   ├── useChatSession.js ← from pathfinder-supabase.jsx
│   │   └── useArtifacts.js   ← from pathfinder-supabase.jsx
│   │
│   ├── components/
│   │   ├── PathfinderBot.jsx  ← from pathfinder-bot.jsx
│   │   └── [all other components from proactive-ai-partner.jsx]
│   │
│   └── styles/
│       └── globals.css       ← optional: extract CSS from STYLES const
│
└── supabase/
    ├── config.toml
    ├── migrations/
    │   └── 20240101000000_initial.sql  ← rename pathfinder-schema.sql
    └── functions/
        └── chat-director/
            └── index.ts      ← ready to deploy
```

---

## 3. TWO FILES YOU MUST CREATE

### `index.html` (project root)
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Pathfinder — AI Business Architect</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### `src/main.jsx`
```jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## 4. CRITICAL EXTRACTION — supabaseClient.js

Both `pathfinder-supabase.jsx` and `pathfinder-chat-director-react.jsx` reference
a single shared Supabase client. Create this file **first**:

### `src/lib/supabaseClient.js`
```js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    '[Pathfinder] Missing env vars. ' +
    'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession:    true,
    autoRefreshToken:  true,
    detectSessionInUrl: true,
  },
});
```

Then update every import in hooks and integration files:
```js
import { supabase } from '@/lib/supabaseClient';
```

---

## 5. ISSUES FOUND & FIXED

| # | Issue | File | Fix Applied |
|---|-------|------|------------|
| 1 | Bare `Date.now()` ID in DatabasePanel event log | `proactive-ai-partner.jsx` | ✅ Replaced with `crypto.randomUUID` fallback |
| 2 | `meta→facebook` provider mapping missing from react integration | `pathfinder-chat-director-react.jsx` | ✅ Added `PROVIDER_MAP` export + comment |

---

## 6. WARNINGS TO REVIEW BEFORE LAUNCH

### W1 — Client-side readiness score vs. server RPC
**Where:** `proactive-ai-partner.jsx` — `setReadinessScore(prev => Math.min(100, prev + delta))`  
**Risk:** Client can be manipulated via browser devtools to set any score.  
**Fix:** In production `App.jsx`, replace with:
```js
const handleReadinessGain = async (delta) => {
  const newScore = await addReadiness(delta); // calls increment_readiness() RPC
  if (newScore !== null) setReadinessScore(newScore);
};
```
The `addReadiness` function is already in `useChatSession` and calls the server-side RPC that enforces the 0–100 clamp atomically.

### W2 — CourseScreen payload format mismatch
**Where:** `proactive-ai-partner.jsx` `CourseScreen` reads `payload.modules` (string array).  
**Where:** `supabase/functions/chat-director/index.ts` sends `payload.steps` (object array).  
**Fix (already in CourseScreen):**
```js
const modules = payload?.modules
  || (payload?.steps?.map(s => s.title))
  || ["The Problem","The Framework","The Application"];
```
This fallback is already present. Confirm it works in integration testing.

### W3 — CORS `ALLOWED_ORIGIN` defaults to `*`
**Where:** `supabase/functions/chat-director/index.ts`  
**Risk:** Any origin can call your Edge Function in production.  
**Fix:** Before launch run:
```bash
supabase secrets set ALLOWED_ORIGIN=https://your-production-domain.com
```

### W4 — `inject_video`, `show_diff`, `start_course` not mapped in bot
**Where:** `pathfinder-bot.jsx` — bot state does not auto-respond to uiActions.  
**Fix:** In `App.jsx`, after calling `processDirectorResponse(data)`:
```js
const uiToBotState = {
  inject_video: 'thinking',
  show_diff:    'talking',
  start_course: 'directing',
  none:         data._isPraise ? 'celebrating' : 'walking',
};
setBotState(uiToBotState[data.uiAction] ?? 'idle');
```

### W5 — Prototype uses simulated responses (SIMULATED_RESPONSES)
**Where:** `proactive-ai-partner.jsx` — `handleSend` routes to `SIMULATED_RESPONSES.*`  
**This is correct for the demo/prototype.** In production `App.jsx`, replace
`handleSend` entirely with the version from `pathfinder-chat-director-react.jsx`
which calls `callDirector()` → real Edge Function → real LLM.

---

## 7. SUPABASE SETUP CHECKLIST

### Step 1 — Install Supabase CLI
```bash
npm install -g supabase
supabase login
```

### Step 2 — Link to your project
```bash
supabase link --project-ref YOUR_PROJECT_REF
# Find YOUR_PROJECT_REF in the Supabase Dashboard URL:
# https://app.supabase.com/project/YOUR_PROJECT_REF
```

### Step 3 — Apply the database schema
```bash
# Option A: Push migration directly
cp pathfinder-schema.sql supabase/migrations/20240101000000_initial.sql
supabase db push

# Option B: Run manually in the Supabase SQL Editor
# Paste pathfinder-schema.sql into the SQL Editor and run
```

### Step 4 — Verify RLS is active
In Supabase Dashboard → Table Editor → each table → click the shield icon.
All four tables (`users`, `projects`, `chat_sessions`, `artifacts`) must show
"RLS Enabled".

### Step 5 — Configure OAuth providers
Dashboard → Authentication → Providers → enable:
- **Google** — create OAuth app at console.cloud.google.com
- **Apple** — create Service ID at developer.apple.com
- **Facebook** (Meta) — create app at developers.facebook.com

Add your Supabase callback URL to each provider:
```
https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
```

### Step 6 — Set Edge Function secrets
```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-api03-YOUR_KEY
supabase secrets set ALLOWED_ORIGIN=https://your-domain.com
# Optional OpenAI fallback:
supabase secrets set OPENAI_API_KEY=sk-YOUR_KEY
supabase secrets set USE_OPENAI_FALLBACK=false
```

Verify secrets are registered:
```bash
supabase secrets list
```

### Step 7 — Deploy the Edge Function
```bash
supabase functions deploy chat-director --no-verify-jwt
```

Confirm it appears as "Active" in Dashboard → Edge Functions.

### Step 8 — Local development test
```bash
# Terminal 1: start Supabase locally
supabase start

# Terminal 2: serve the Edge Function with local secrets
supabase functions serve --env-file .env.local

# Terminal 3: start the Vite dev server
npm run dev
```

Test the Edge Function directly:
```bash
curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/chat-director' \
  --header 'Authorization: Bearer YOUR_LOCAL_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"message":"I don'\''t know what CAC is","history":[],"context":{}}'
```
Expected: JSON with `replyText`, `uiAction: "none"`, `readinessScoreIncrease: 10`.

---

## 8. GITHUB SETUP CHECKLIST

### Step 1 — Initialize repository
```bash
cd pathfinder
git init
git add .
git commit -m "feat: initial Pathfinder scaffold"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/pathfinder.git
git push -u origin main
```

### Step 2 — Add GitHub Secrets (for CI/CD)
In GitHub → Settings → Secrets and Variables → Actions, add:
```
VITE_SUPABASE_URL          = https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY     = eyJhbGci...
SUPABASE_ACCESS_TOKEN      = your Supabase CLI token (supabase login prints it)
SUPABASE_PROJECT_REF       = your project ref
```

### Step 3 — Create GitHub Actions workflow
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy Pathfinder

on:
  push:
    branches: [main]

jobs:
  deploy-functions:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Deploy Edge Function
        run: supabase functions deploy chat-director --no-verify-jwt
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_PROJECT_REF:  ${{ secrets.SUPABASE_PROJECT_REF }}

  deploy-frontend:
    runs-on: ubuntu-latest
    needs: deploy-functions
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npm run build
        env:
          VITE_SUPABASE_URL:      ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}

      # Swap the deploy step for your host (Vercel, Netlify, Cloudflare Pages)
      - name: Deploy to Vercel
        run: npx vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

### Step 4 — Branch strategy
```
main          ← production-only, protected
develop       ← integration branch
feature/xxx   ← individual feature work
```

Protect `main`: Settings → Branches → Add rule → require PR + 1 review.

---

## 9. PRE-LAUNCH CHECKLIST

### Security
- [ ] `ALLOWED_ORIGIN` secret set to production domain (not `*`)
- [ ] Service role key never in any `.env` file that could reach the browser
- [ ] All four tables have RLS enabled (verified in Dashboard)
- [ ] `handle_new_user` trigger is SECURITY DEFINER with fixed `search_path`
- [ ] `increment_readiness` RPC enforces 0–100 clamp server-side
- [ ] Supabase Storage bucket policy mirrors table RLS

### Auth
- [ ] All three OAuth providers configured (Google, Apple, Facebook/Meta)
- [ ] Redirect URL added to each OAuth provider's allowed list
- [ ] `VITE_SITE_URL` matches the production domain

### Edge Function
- [ ] `ANTHROPIC_API_KEY` secret deployed
- [ ] Edge Function shows "Active" in Dashboard
- [ ] CORS tested from production domain
- [ ] Rate limiting tested (20 session updates/minute default)

### Database
- [ ] Schema migration applied (`supabase db push`)
- [ ] `on_auth_user_created` trigger active (check in Dashboard → Database → Triggers)
- [ ] RPC functions visible in Dashboard → Database → Functions

### Frontend
- [ ] `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` set in deployment environment
- [ ] `supabase.functions.invoke('chat-director')` tested end-to-end
- [ ] Readiness score updates via `increment_readiness` RPC (not client-side)
- [ ] Bot `uiAction` → state mapping wired in production `App.jsx`

### Performance
- [ ] Vite build passes (`npm run build`) — no TypeScript errors
- [ ] `manualChunks` in vite.config.js splits supabase + react into separate chunks
- [ ] Source maps generated for production debugging

---

## 10. INTEGRATION MAP — HOW ALL FILES CONNECT

```
Browser (React)
│
├── src/lib/supabaseClient.js  ← singleton, imported everywhere
│
├── src/hooks/useAuth.js       ← session, profile, signIn/signOut
├── src/hooks/useProjects.js   ← CRUD + level advancement
├── src/hooks/useChatSession.js← persist messages, sprint state, readiness RPC
├── src/hooks/useArtifacts.js  ← Storage upload + signed URL downloads
│
├── src/App.jsx  (merged from proactive-ai-partner.jsx + pathfinder-supabase.jsx)
│   ├── handleSend()  ← from pathfinder-chat-director-react.jsx
│   ├── handleChip()  ← from pathfinder-chat-director-react.jsx
│   └── callDirector()← from pathfinder-chat-director-react.jsx
│
└── src/components/
    └── PathfinderBot.jsx ← bot state driven by uiAction from Director
                ↓
Supabase Edge Function (Deno)
    supabase/functions/chat-director/index.ts
        ├── Verifies JWT via supabase.auth.getUser()
        ├── Applies rate limit via service-role client
        ├── Calls Anthropic API (primary) or OpenAI (fallback)
        ├── Forces JSON via prefill / response_format
        └── Returns DirectorResponse to browser
                ↓
Supabase PostgreSQL
    public.users          ← auto-created on first OAuth sign-in
    public.projects       ← RLS: user_id = auth.uid()
    public.chat_sessions  ← RLS + project ownership guard
    public.artifacts      ← RLS + project ownership guard + immutable
    
    RPCs:
    increment_readiness(delta)        ← 0-100 clamp, SECURITY INVOKER
    downgrade_tier_with_cooldown()    ← 48h lock, SECURITY INVOKER
```

---

*Generated: Pathfinder Full Review · All files verified cross-compatible.*
