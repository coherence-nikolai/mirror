# Mirror — Phase 3

A state translation instrument. Not a journaling app. Not a chatbot.

## Structure

```
app/                     Next.js App Router pages + API routes
components/              UI components by domain
lib/mirror/              Core engine — pure logic, no DOM
  engine/                Safety scan, classifier, state compiler
  ai/                    Prompt builder, provider, repair layer
  schema.ts              Zod schema — canonical law of the system
  types.ts               All TypeScript types
  constants.ts           Visual/breath profiles, pattern library
  storage/               localStorage abstraction
  personalization/       Phrase memory, pattern frequency, tone prefs
  eval/                  Eval cases and scoring
styles/                  Design tokens, typography, motion, globals
tests/                   Unit, integration, eval harness
```

## Run

```bash
cp .env.local.example .env.local
# Add your Anthropic API key to .env.local

npm install
npm run dev
# → http://localhost:3000 (redirects to /mirror)
```

## Test

```bash
npm test
```

## Screens

- `/mirror`   — Home: input, orb, reflect
- `/return`   — Return mode: amber/red states, stronger grounding
- `/saved`    — Saved shifts, pattern frequency, effective phrases
- `/settings` — Privacy controls, toggles, export, delete
- `/eval`     — Internal eval harness (dev only)

## API

```
POST /api/mirror/reflect     — full pipeline, returns MirrorState
POST /api/mirror/feedback    — mark helped/not helped
GET  /api/mirror/eval        — run eval suite
POST /api/mirror/eval        — test single input
```

## AI

AI is optional. Without `ANTHROPIC_API_KEY`, the deterministic engine runs.
The AI adapter is proxy-ready — change `AI_ENDPOINT` in `lib/mirror/ai/provider.ts`.

## Privacy

All data stored in `localStorage` by default. No server-side persistence in MVP.
Export and delete controls in `/settings`.
