# Autonomous Content Factory

An AI-powered multi-agent platform that transforms raw source material (articles, product specs, notes) into production-ready, multi-channel marketing campaigns — including blog posts, social media threads, and email teasers — all in one automated workflow.

**Creator:** Adithyan M S

---

## Features

### Core
- **Multi-Agent Architecture** — Three specialized AI agents (Researcher, Copywriter, Editor) collaborate autonomously.
- **URL Scraping Utility** — Automated preprocessing step that extracts clean content from reference URLs.
- **Intelligent Content Validation** — LLM-powered gate prevents gibberish/spam from triggering expensive workflows.
- **Real-Time Dashboard** — Live agent status tracking, chat logs, and campaign overview with SSE + polling fallback.
- **Content Studio** — View, review, inline-edit, and regenerate individual content pieces with correction notes.
- **Export Center** — Download approved content or post directly to X / compose in Gmail.

### Advanced
- **Automated URL Scraping** — Provide a URL and the system fetches, cleans, and extracts the main content before the research phase begins.
- **Multi-Language Support** — Generate content in 10 languages: English, Spanish, French, German, Italian, Portuguese, Hindi, Japanese, Korean, and Chinese.
- **Tone Selection** — Choose distinct tones for each content type before generation:
  - **Blog**: Professional, Conversational, Academic, Storytelling, Technical, Inspirational
  - **Social**: Punchy & Viral, Witty & Humorous, Bold & Provocative, Casual & Friendly, Motivational, Informative
  - **Email**: Formal & Corporate, Friendly & Warm, Urgent & Action-Driven, Persuasive & Sales, Newsletter Style, Minimalist & Direct
- **Content Analytics Dashboard** — Reading level, word count, estimated read time, and SEO keyword extraction for each content piece.
- **Inline Content Editor** — Edit generated content directly in the Content Studio with Save/Cancel controls.
- **Campaign History** — Browse and resume past campaigns from a persistent dashboard.
- **Browser Notifications** — Get notified when campaign generation completes while working in another tab.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| AI SDK | Vercel AI SDK + Groq (LLaMA-based `openai/gpt-oss-120b`) |
| Database | SQLite via Prisma ORM |
| Styling | Tailwind CSS 4 |
| Icons | Lucide React |

---

## Prerequisites

- **Node.js** v18 or later
- **npm** v9 or later

---

## Setup & Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/content-factory.git
cd content-factory
```

### 2. Install dependencies

```bash
npm install
```

### 3. Initialize the database

```bash
npx prisma generate
npx prisma db push
```

### 4. Start the development server

```bash
npm run dev
```

### 5. Open in browser

Navigate to [http://localhost:3000](http://localhost:3000)

---

## How to Use

1. **Paste or upload** your source material (product description, article, technical notes).
2. Optionally add a **Campaign Title** and a **Reference URL** (the scraper agent will extract the page content automatically).
3. Select the **Output Language** (default: English).
4. Choose the **Content Tone** for Blog, Social, and Email independently.
5. Click **"Generate Campaign"** to launch the multi-agent pipeline.
6. Monitor progress on the **Overview** tab and agent chat on the **Live Logs** tab.
7. Review generated content (Blog Post, Social Thread, Email Teaser) in **Content Studio**.
8. Check content quality metrics on the **Analytics** tab.
9. **Inline-edit** any content piece directly, or request regeneration with correction notes.
10. Export or share finished content from the **Export Center**.

---

## Project Structure

```
content-factory/
├── prisma/                # Database schema & SQLite file
├── src/app/
│   ├── agents/            # AI agent logic (scraper, researcher, copywriter, editor)
│   ├── api/campaign/      # REST API routes for workflow management
│   │   ├── step/          # Individual step routes (scrape, research, copywrite, review)
│   │   ├── list/          # Campaign history listing endpoint
│   │   └── stream/        # SSE real-time update endpoint
│   ├── components/        # React UI components
│   │   ├── UploadZone     # Input form with language & tone selectors
│   │   ├── AgentRoom      # Real-time agent status cards
│   │   ├── CampaignView   # Content Studio with inline editor
│   │   ├── AnalyticsDashboard  # Content analytics & metrics
│   │   ├── ChatFeed       # Live agent communication logs
│   │   ├── ExportPanel    # Download & share center
│   │   └── CampaignHistory    # Past campaigns dashboard
│   ├── lib/               # AI client, store, analytics, notifications, utilities
│   ├── types/             # TypeScript type definitions
│   ├── page.tsx           # Main application page (5-tab dashboard)
│   └── globals.css        # Global styles & animations
├── .env                   # Database URL (required by Prisma)
├── APPROACH.md            # Solution design document
└── package.json
```

---

