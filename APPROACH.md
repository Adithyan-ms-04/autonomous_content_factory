# Approach Document — Autonomous Content Factory

**Author:** Adithyan M S

---

## 1. Solution Design

The Autonomous Content Factory is a **multi-agent AI system** that converts raw source material into a complete, multi-channel marketing campaign. The core idea is to replicate a real-world content marketing team using three specialized AI agents that communicate and collaborate autonomously:

| Agent | Role | Responsibility |
|---|---|---|
| **Researcher** | Fact Extraction | Parses raw input to produce a structured Fact Sheet (core features, technical specs, target audience, value proposition, ambiguous statements). |
| **Copywriter** | Content Generation | Consumes the Fact Sheet and generates three content formats: a long-form Blog Post, a punchy Social Media Thread, and a concise Email Teaser. |
| **Editor** | Quality Assurance | Reviews every piece against the original Fact Sheet for accuracy, tone, and completeness. Rejects sub-standard pieces with actionable correction notes, triggering automatic regeneration. |

The workflow is fully automated: once the user submits source material, the agents execute sequentially (Research → Copywrite → Review), with an automatic feedback loop where rejected content is regenerated up to 5 times. The frontend polls the backend every 2 seconds for real-time status updates.

An **LLM-powered content validation gate** at the API entry-point prevents meaningless or gibberish input from triggering the expensive multi-step workflow.

---

## 2. Tech Stack Choices & Rationale

| Choice | Why |
|---|---|
| **Next.js 16 (App Router)** | Unified full-stack framework — API routes and frontend in one codebase. Server Components and the App Router simplify data fetching and layout composition. |
| **TypeScript** | Strong typing across agents, API contracts, and UI components catches errors at compile time and improves maintainability. |
| **Vercel AI SDK + Groq** | The AI SDK provides a clean `generateText` / `generateObject` abstraction. Groq delivers extremely fast inference (~200ms per call) on open-weight models, keeping the entire workflow under 60 seconds. |
| **SQLite + Prisma** | Zero-config local database. Prisma provides type-safe queries and easy schema migrations. SQLite is ideal for a self-contained demo that runs anywhere without external database setup. |
| **Tailwind CSS 4** | Utility-first styling enables rapid, consistent UI development with dark mode, responsive layouts, and custom animations without writing verbose CSS. |

---

## 3. Key Features Implemented

- Multi-agent orchestration with real-time dashboard and live agent chat logs
- Three distinct content outputs: Blog Post, Social Thread, Email Teaser
- Automated quality-control feedback loop (Editor → Copywriter regeneration)
- Content preview with realistic mockups (blog layout, X/Twitter thread, email)
- Export Center with direct "Post on X" / "Compose in Gmail" integration
- LLM-powered input validation to block spam/gibberish before workflow starts
- Drag-and-drop file upload support (.txt, .md, .html)
- Full dark mode with premium glassmorphic UI and micro-animations
- In-app documentation page at `/docs`

---

## 4. What I Would Improve With More Time

- **Streaming responses** — Use the AI SDK's streaming capabilities to show content being generated token-by-token in the UI, rather than waiting for full completion.
- **Persistent campaign history** — Allow users to revisit, compare, and iterate on past campaigns from a dashboard view.
- **URL scraping agent** — Add a fourth agent that can fetch and parse live web pages when a URL is provided, rather than requiring pasted text.
- **User authentication** — Add login/signup so multiple users can manage their own campaigns independently.
- **Deployment to production** — Migrate from SQLite to PostgreSQL and deploy on Vercel or a similar platform for public access.
- **A/B variant generation** — Generate multiple tone variants (formal, casual, witty) for each content piece and let the user choose.

---

© 2026 Adithyan M S
