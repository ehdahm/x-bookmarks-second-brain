# X Bookmarks Second Brain

A comprehensive system to organize, browse, and filter 1,915+ X (Twitter) bookmarks into a categorized knowledge system for builders.

## Features

- **Category Navigation**: Browse tweets organized by 5 custom categories
- **Multi-Tag Filtering**: Filter within categories using multiple tags (OR logic)
- **Dynamic Tags**: Tags automatically filter to only show those relevant to selected category
- **Full-Text Search**: Search across tweet content, authors, and notes
- **Link Previews**: OpenGraph metadata fetched and displayed for external URLs
- **Media Support**: View images directly in the app with lazy loading
- **Note Content**: Expanded note content shown as primary (when available)
- **Dark/Light Mode**: Theme toggle for comfortable viewing
- **Responsive Design**: Works on desktop and mobile
- **Delete Tweets**: Remove outdated or unwanted bookmarks

## Quick Start

```bash
# Terminal 1 - Backend (port 3001)
cd src/backend
npm install
lsof -ti:3001 | xargs kill -9 2>/dev/null
nohup npx tsx src/index.ts > /tmp/backend.log 2>&1 &
sleep 2
curl -s http://localhost:3001/health  # Should return {"status":"ok"}

# Terminal 2 - Frontend (port 5173)
cd src/frontend
npm install
lsof -ti:5173 | xargs kill -9 2>/dev/null
nohup npm run dev > /tmp/frontend.log 2>&1 &
sleep 3
# Open http://localhost:5173
```

## User Flow

1. Open http://localhost:5173
2. **Browse**: Scroll through tweets in the grid
3. **Filter by Category**: Click a category in the sidebar
4. **Filter by Tags**: Click tags (multi-select, OR logic)
5. **Search**: Type in the search bar
6. **View Details**: Click any tweet for full content + images + link previews
7. **Delete**: Click trash icon in modal to remove

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js, Express, TypeScript |
| Database | SQLite (better-sqlite3) |
| Frontend | React, TypeScript, Vite |
| Styling | Tailwind CSS |
| State | React hooks |

## Project Structure

```
x-bookmarks-second-brain/
├── README.md
├── agents.md
├── .env.example
├── .gitignore
│
├── data/
│   ├── exports/
│   │   └── bookmarks_2026-01-13-1528.json  # Original X export
│   │
│   └── distilled/
│       ├── bookmarks_distilled.json         # Main data (1915 tweets)
│       └── batches/
│           ├── batch_01.json
│           ├── batch_02.json
│           └── ... (39 total)
│
├── src/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── index.ts            # Express server entry
│   │   │   ├── db/
│   │   │   │   ├── index.ts        # SQLite schema & connection
│   │   │   │   └── schema.sql
│   │   │   ├── routes/
│   │   │   │   └── api.ts          # REST API endpoints
│   │   │   ├── lib/
│   │   │   │   └── og-fetcher.ts   # OpenGraph metadata fetcher
│   │   │   └── scripts/
│   │   │       └── import.ts       # JSON import script
│   │   ├── static/images/          # Downloaded tweet images
│   │   ├── data/                   # SQLite database
│   │   └── package.json
│   │
│   └── frontend/
│       ├── src/
│       │   ├── App.tsx             # Main app component
│       │   ├── components/
│       │   │   ├── Sidebar.tsx     # Category + tag navigation
│       │   │   ├── TweetGrid.tsx   # Tweet card grid
│       │   │   ├── TweetModal.tsx  # Tweet detail modal
│       │   │   └── LinkPreview.tsx # External URL preview cards
│       │   ├── hooks/
│       │   │   └── useApi.ts       # Data fetching hooks
│       │   └── types/
│       │       └── index.ts        # TypeScript definitions
│       └── package.json
│
└── scripts/
    ├── distill_json.py             # Distill original export
    └── split_into_batches.py       # Split into batches
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List all categories with tweet counts |
| GET | `/api/categories/:slug/tags` | Get tags for a specific category |
| GET | `/api/subtags` | Get all tags (142 total) |
| GET | `/api/link-preview` | Fetch OpenGraph preview for URL |
| GET | `/api/tweets` | List tweets with filters |
| GET | `/api/tweets/:id` | Get single tweet |
| DELETE | `/api/tweets/:id` | Delete a tweet |
| GET | `/api/stats` | Database statistics |

### Tweet List Filters

```
GET /api/tweets?category=slug&subtags=tag1,tag2&search=query&limit=50
```

- **category**: Filter by primary category slug
- **subtags**: Comma-separated list of tags (OR logic)
- **search**: Full-text search across content, author, notes
- **limit**: Pagination limit (default 50)
- **offset**: Pagination offset

## Classification System

Five categories for a Full-Stack Founder/Architect:

| Category | Mental Model | Focus |
|----------|--------------|-------|
| AI Orchestration & Agentics | The "Brain" | AI prompting, agents, orchestration |
| Technical Excellence | The "Hands" | System design, optimization, building |
| Product Sense & Market Dynamics | The "Eyes" | PMF, UX, growth, design |
| Strategic Agency & Career Growth | The "Compass" | Career, productivity, personal growth |
| The Builder's Toolbox | The "Belt" | Tools, templates, resources |

Each tweet also has:
- **Subtags**: 2-4 generic tags (e.g., `#prompt-engineering`, `#learning`)
- **Cognitive Value**: One sentence explaining why it matters to a builder

## Data Pipeline

```
1. Export bookmarks from X as JSON
        ↓
2. distill_json.py - Extract 13 essential fields
        ↓
3. split_into_batches.py - Split into 39 batches
        ↓
4. Categorize via MiniMax (categories, subtags, cognitive_value)
        ↓
5. bookmarks_distilled.json (1915 tweets with classifications)
        ↓
6. import.ts - Import to SQLite database
        ↓
7. Frontend displays with filtering & link previews
```

## Configuration

Copy `.env.example` to `.env` and configure:

```bash
DATA_DIR=./data/distilled
PORT=3001
VITE_API_URL=http://localhost:3001/api
```

## License

MIT
