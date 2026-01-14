# X Bookmarks Second Brain

A comprehensive system to organize, browse, and filter 1,915+ X (Twitter) bookmarks into a categorized knowledge system for builders.

## Quick Start

```bash
# Clone
git clone https://github.com/ehdahm/x-bookmarks-second-brain.git
cd x-bookmarks-second-brain

# Install dependencies
cd src/backend && npm install
cd ../frontend && npm install

# Start backend (Terminal 1)
cd ../backend
npm run dev   # Runs on port 3001

# Start frontend (Terminal 2)
cd ../frontend
npm run dev   # Runs on port 5173

# Open http://localhost:5173
```

## Adding New Bookmarks

1. Export bookmarks from X as JSON
2. Place the file in `data/exports/`
3. Run the import pipeline:

```bash
cd src/backend
# 1. Distill export (extracts essential fields)
python3 ../../scripts/distill_json.py ../../data/exports/your_export.json

# 2. Import to database
npx tsx src/scripts/import.ts
```

The app will automatically pick up new bookmarks on refresh.

## Features

- **Category Navigation**: Browse by 5 custom categories
- **Multi-Tag Filtering**: Filter within categories using tags (OR logic)
- **Full-Text Search**: Search across tweet content and notes
- **Link Previews**: OpenGraph metadata for external URLs
- **Media Support**: View images with lazy loading
- **Dark/Light Mode**: Theme toggle
- **Responsive Design**: Works on desktop and mobile

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js, Express, TypeScript |
| Database | SQLite (better-sqlite3) |
| Frontend | React, TypeScript, Vite |
| Styling | Tailwind CSS |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tweets` | List tweets with filters |
| GET | `/api/categories` | List categories |
| GET | `/api/subtags` | List all tags |
| GET | `/api/link-preview` | Fetch OpenGraph preview |
| DELETE | `/api/tweets/:id` | Delete a tweet |
| GET | `/api/stats` | Database statistics |

## Project Structure

```
x-bookmarks-second-brain/
├── README.md
├── .gitignore
├── data/
│   ├── exports/          # Raw X exports
│   └── distilled/        # Processed JSON
├── src/
│   ├── backend/          # Express API
│   └── frontend/         # React app
└── scripts/
    ├── distill_json.py
    └── split_into_batches.py
```

## Troubleshooting

- **Port in use**: `lsof -ti:3001 | xargs kill -9`
- **Database errors**: Delete `src/backend/data/bookmarks.db*` and re-import
- **Health check**: `curl http://localhost:3001/health`

## License

MIT
