# Scaler Personabot

A persona chatbot built for a prompt-engineering assignment. Switch between three Scaler voices and have a conversation with each:

- **Kshitij Mishra** — Instructor at Scaler. Hinglish, Socratic, first-principles.
- **Anshuman Singh** — Co-founder of Scaler. Frameworks-first founder voice.
- **Abhimanyu Saxena** — Co-founder of Scaler. Macro-first founder + investor voice.

Each persona has its own deeply-crafted system prompt with a persona description, few-shot examples, chain-of-thought reasoning instruction, output format spec, and constraints — see [`prompts.md`](./prompts.md). Switching personas resets the conversation so you always start clean.

> The replies are AI-generated impressions for an academic exercise — not the actual people speaking. Read the [reflection](./reflection.md) for what worked, what didn't, and what GIGO taught us.

---

## Live demo

**Deployed:** https://personabot-scaler.vercel.app *(replace with your actual deployment URL)*

---

## Screenshots

| Mobile chat | Persona switcher | Active-persona banner |
| --- | --- | --- |
| ![mobile](./public/screens/mobile.png) | ![switcher](./public/screens/switcher.png) | ![banner](./public/screens/banner.png) |

*(Add your screenshots to `public/screens/` after first run; the README references them so the evaluator sees them on GitHub.)*

---

## Stack

- **Next.js 16** (App Router, Route Handlers, React 19, React Compiler enabled)
- **Tailwind CSS v4**
- **Google Gemini API** (`gemini-2.5-flash` by default — free tier, no credit card)
- **TypeScript + Biome**
- Deploys to Vercel out of the box.

Why Gemini? Free tier, no payment friction for an evaluator who wants to fork-and-run, and `2.5-flash` quality is more than sufficient for persona impressions. The provider is isolated to a single file (`src/app/api/chat/route.ts`) — swap to OpenAI / Anthropic / OpenRouter by replacing one fetch call.

---

## Setup

```bash
# 1. Clone & install
git clone https://github.com/marvelxcodes/personabot.git
cd personabot
bun install     # or: pnpm i / npm i / yarn

# 2. Configure your API key
cp .env.example .env.local
# Open .env.local and paste your Gemini API key.
# Get one free at https://aistudio.google.com/app/apikey

# 3. Run
bun dev         # or: npm run dev
# → http://localhost:3000
```

That's it — three env-prep commands, no other infra.

---

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import the repo at [vercel.com/new](https://vercel.com/new).
3. Add an environment variable: `GEMINI_API_KEY = <your key>`.
4. Deploy.

Persona switching, chat, and error states all work in production identically to local — no extra config.

---

## Project structure

```
src/
├── app/
│   ├── api/chat/route.ts     # POST /api/chat — calls Gemini with persona system prompt
│   ├── globals.css           # Dark gradient theme + animations
│   ├── layout.tsx
│   └── page.tsx              # Mounts <ChatInterface />
├── components/
│   ├── ChatInterface.tsx     # Stateful container (messages, send, switch, retry)
│   ├── PersonaSwitcher.tsx   # Tab-bar of 3 personas
│   ├── PersonaAvatar.tsx     # Gradient avatar with active-state halo
│   ├── MessageBubble.tsx
│   ├── SuggestionChips.tsx   # Quick-start questions per persona
│   └── TypingIndicator.tsx
├── data/
│   └── personas.ts           # Source of truth: 3 personas + system prompts + chips
└── lib/
    └── types.ts              # Shared chat types
.env.example
prompts.md                    # All three system prompts annotated
reflection.md                 # 300–500 word reflection on what worked + GIGO
```

---

## Feature checklist (assignment requirements)

- [x] Three personas with distinct, well-researched system prompts
- [x] Each system prompt contains: persona description, ≥3 few-shot examples, chain-of-thought instruction, output instruction, constraints
- [x] Clean chat UI with persona switcher (tabs/cards)
- [x] Switching persona resets the conversation
- [x] Active persona is clearly visible at all times (avatar + banner + colored accent)
- [x] Suggestion chips per persona (4 each)
- [x] Typing indicator while waiting for the API
- [x] Mobile + desktop responsive
- [x] API key only in `process.env.GEMINI_API_KEY` — never in source
- [x] Each persona's system prompt is passed to the API correctly
- [x] Graceful error handling (network, upstream, safety-blocked, missing key) with a retry button
- [x] `.env.example` present, `.env*` gitignored
- [x] `prompts.md` with all three prompts annotated
- [x] `reflection.md` (300–500 words)
- [x] Public GitHub repo + live Vercel deployment

---

## License

MIT — feel free to fork, adapt, and submit your own variation. Just credit the original repo if you republish.
