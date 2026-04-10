# Approach Document — Autonomous Content Factory

**Author:** Adithyan M S

---

## 1. Solution Design

The Autonomous Content Factory is a **multi-agent AI system** that converts raw source material into a complete, multi-channel marketing campaign. The core idea is to replicate a real-world content marketing team using four specialized AI agents that communicate and collaborate autonomously:

| Agent | Role | Responsibility |
|---|---|---|
| **Scraper** | Web Extraction | When a URL is provided, fetches the page, strips HTML boilerplate (nav, ads, footers), and uses LLM to extract the main article content. Runs as an optional Step 0 before research. |
| **Researcher** | Fact Extraction | Parses raw input to produce a structured Fact Sheet (core features, technical specs, target audience, value proposition, ambiguous statements). |
| **Copywriter** | Content Generation | Consumes the Fact Sheet and generates three content formats: a long-form Blog Post, a punchy Social Media Thread, and a concise Email Teaser. Respects user-selected tones and output language. |
| **Editor** | Quality Assurance | Reviews every piece against the original Fact Sheet for accuracy, tone, and completeness. Rejects sub-standard pieces with actionable correction notes, triggering automatic regeneration. |

### Workflow Pipeline

```
URL (optional) → Scraper → Researcher → Copywriter → Editor → Dashboard
                                ↑              ↓
                                └── Rejected ──┘ (auto-loop, max 5 retries)
```

The workflow is fully automated: once the user submits source material, the agents execute sequentially (Scrape → Research → Copywrite → Review), with an automatic feedback loop where rejected content is regenerated up to 5 times. The frontend uses **Server-Sent Events (SSE)** for real-time updates, with an automatic polling fallback.

An **LLM-powered content validation gate** at the API entry-point prevents meaningless or gibberish input from triggering the expensive multi-step workflow.

---

## 2. Tech Stack Choices & Rationale

| Choice | Why |
|---|---|
| **Next.js 16 (App Router)** | Unified full-stack framework — API routes and frontend in one codebase. Server Components and the App Router simplify data fetching and layout composition. |
| **TypeScript** | Strong typing across agents, API contracts, and UI components catches errors at compile time and improves maintainability. |
| **Vercel AI SDK + Groq** | The AI SDK provides a clean `generateText` / `generateObject` abstraction. Groq delivers extremely fast inference on open-weight models, keeping the entire workflow under 60 seconds. |
| **SQLite + Prisma** | Zero-config local database. Prisma provides type-safe queries and easy schema migrations. SQLite is ideal for a self-contained demo that runs anywhere without external database setup. |
| **Tailwind CSS 4** | Utility-first styling enables rapid, consistent UI development with dark mode, responsive layouts, and custom animations without writing verbose CSS. |

---

## 3. Key Features Implemented

### Core Platform
- Multi-agent orchestration with real-time dashboard and live agent chat logs
- Three distinct content outputs: Blog Post, Social Thread, Email Teaser
- Automated quality-control feedback loop (Editor → Copywriter regeneration)
- Content preview with realistic mockups (blog layout, X/Twitter thread, email)
- Export Center with direct "Post on X" / "Compose in Gmail" integration
- LLM-powered input validation to block spam/gibberish before workflow starts
- Drag-and-drop file upload support (.txt, .md, .html)
- Campaign history dashboard to browse and resume past campaigns

### Advanced Features
- **URL Scraping Agent** — Fetches web page content, strips boilerplate, and uses LLM to extract the main article when a reference URL is provided.
- **Multi-Language Support** — 10 languages (English, Spanish, French, German, Italian, Portuguese, Hindi, Japanese, Korean, Chinese). Language instruction is injected into copywriter prompts and preserved across content regeneration.
- **Tone Selection** — Users choose distinct tones per content type (6 options each for Blog, Social, and Email) before campaign generation. Tones are passed directly to the copywriter agent's prompt builder.
- **Content Analytics Dashboard** — Computes reading level (grade), word count, estimated read time, and extracts top SEO keywords for each content piece.
- **Inline Content Editor** — Edit generated content directly within the Content Studio using a raw text editor with Save/Cancel controls.
- **Browser Notifications** — Desktop notification fires when campaign completes while the tab is in the background (uses the Notifications API with user permission).

### Security & Architecture
- In-memory sliding window rate limiting (10 requests/minute per IP)
- Request body size validation (500 KB cap)
- Prisma singleton pattern to prevent connection exhaustion
- ARIA roles, labels, and keyboard navigation for accessibility
- Next.js App Router error and loading boundaries

---

## 4. Architecture Decisions

### Language & Tone Persistence
Language and tone selections are stored in an **in-memory map** alongside the Prisma database. This avoids requiring a database migration while ensuring these values persist for the duration of a campaign's lifecycle. The tradeoff is that these values are lost on server restart, which is acceptable for a demo/development context.

### SSE with Polling Fallback
Real-time updates use Server-Sent Events (SSE) via `/api/campaign/stream`, with an automatic fallback to 2-second polling if the SSE connection drops. This ensures reliable updates across all environments.

### Scraper as Optional Step
The URL scraper runs as a non-blocking Step 0. If scraping fails (CORS, network error, etc.), the pipeline gracefully falls back to using the user's pasted content directly.

---

## 5. What I Would Improve With More Time

- **Streaming responses** — Use the AI SDK's streaming capabilities to show content being generated token-by-token in the UI.
- **PDF Export** — Add a "Download as PDF" option in the Export Center using `jspdf` or `@react-pdf/renderer`.
- **User authentication** — Add login/signup so multiple users can manage their own campaigns independently.
- **Deployment to production** — Migrate from SQLite to PostgreSQL and deploy on Vercel or a similar platform for public access.
- **Persistent language/tone storage** — Add `language` and `tones` columns to the Prisma schema so these values survive server restarts.

---

© 2026 Adithyan M S
