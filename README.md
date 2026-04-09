# Autonomous Content Factory

An AI-powered multi-agent platform that transforms raw source material (articles, product specs, notes) into production-ready, multi-channel marketing campaigns — including blog posts, social media threads, and email teasers — all in one automated workflow.

**Creator:** Adithyan M S

---

## Features

- **Multi-Agent Architecture** — Three specialized AI agents (Researcher, Copywriter, Editor) collaborate autonomously.
- **Intelligent Content Validation** — LLM-powered gate prevents gibberish/spam from triggering expensive workflows.
- **Real-Time Dashboard** — Live agent status tracking, chat logs, and campaign overview.
- **Content Studio** — View, review, and regenerate individual content pieces with correction notes.
- **Export Center** — Download approved content or post directly to X / compose in Gmail.
- **Documentation Page** — In-app `/docs` route with full usage guide.
- **Drag & Drop Upload** — Supports `.txt`, `.md`, `.html` file uploads or direct text paste.
- **Dark Mode** — Full dark mode support with premium glassmorphic UI.

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
- A **Groq API Key** (free at [console.groq.com](https://console.groq.com))

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

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
DATABASE_URL="file:./prisma/dev.db"
GROQ_API_KEY=your_groq_api_key_here
```

### 4. Initialize the database

```bash
npx prisma generate
npx prisma db push
```

### 5. Start the development server

```bash
npm run dev
```

### 6. Open in browser

Navigate to [http://localhost:3000](http://localhost:3000)

---

## How to Use

1. **Paste or upload** your source material (product description, article, technical notes).
2. Optionally add a **Campaign Title** and a **Reference URL**.
3. Click **"Generate Campaign"** to launch the multi-agent pipeline.
4. Monitor progress on the **Overview** tab and agent chat on the **Live Logs** tab.
5. Review generated content (Blog Post, Social Thread, Email Teaser) in **Content Studio**.
6. Export or share finished content from the **Export Center**.

---

## Project Structure

```
content-factory/
├── prisma/              # Database schema & SQLite file
├── src/app/
│   ├── agents/          # AI agent logic (researcher, copywriter, editor)
│   ├── api/campaign/    # REST API routes for workflow management
│   ├── components/      # React UI components
│   ├── docs/            # Documentation page
│   ├── lib/             # AI client, store, utilities
│   ├── preview/         # Content preview routes
│   ├── types/           # TypeScript type definitions
│   ├── layout.tsx       # Root layout with navigation
│   ├── page.tsx         # Main application page
│   └── globals.css      # Global styles & animations
├── .env.local           # Environment variables (not committed)
├── APPROACH.md          # Solution design document
└── package.json
```

---

## License

This project was built as part of the 2-Week AI Sprint.
© 2026 Adithyan M S. All rights reserved.
