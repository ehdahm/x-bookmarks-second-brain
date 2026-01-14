# X Bookmarks Second Brain - Context for LLMs

## What This Is

A comprehensive system to organize, browse, and filter 1,915+ X bookmarks with a 5-category classification system for builders. The project is organized as a single repository with data, application code, and processing scripts.

## Project Location

```
~/projects/x-bookmarks-second-brain/
```

## Tech Stack

| Layer | Technology | Justification |
|-------|------------|---------------|
| Backend | Node.js + Express + TypeScript | Simple, familiar, type-safe |
| Database | SQLite (better-sqlite3) | File-based, zero-config, fast |
| Frontend | React + TypeScript + Vite | Fast dev, strong typing |
| Styling | Tailwind CSS | Rapid UI development |
| State | React hooks | No external state library needed |
| Data Processing | Python | Batch processing scripts |

## Project Structure

```
x-bookmarks-second-brain/
├── README.md                    # Main documentation
├── agents.md                    # This file - context for LLMs
├── .env.example                 # Environment template
├── .gitignore
│
├── data/
│   ├── exports/                 # Original X exports
│   │   └── bookmarks_2026-01-13-1528.json
│   │
│   └── distilled/               # Processed data
│       ├── bookmarks_distilled.json   # Main data (1915 tweets)
│       └── batches/             # Processing batches (39 files)
│           ├── batch_01.json
│           └── ... (39 total)
│
├── src/
│   ├── backend/                 # Node.js API server
│   │   ├── src/
│   │   │   ├── index.ts         # Express entry point
│   │   │   ├── db/
│   │   │   │   ├── index.ts     # SQLite connection & schema
│   │   │   │   └── schema.sql
│   │   │   ├── routes/
│   │   │   │   └── api.ts       # REST API endpoints
│   │   │   ├── lib/
│   │   │   │   └── og-fetcher.ts # OpenGraph fetching & caching
│   │   │   └── scripts/
│   │   │       └── import.ts    # JSON import script
│   │   ├── static/images/       # Downloaded tweet images
│   │   ├── data/bookmarks.db    # SQLite database
│   │   └── package.json
│   │
│   └── frontend/                # React application
│       ├── src/
│       │   ├── App.tsx          # Main application component
│       │   ├── components/
│       │   │   ├── Sidebar.tsx     # Category + tag navigation
│       │   │   ├── TweetGrid.tsx   # Tweet card grid
│       │   │   ├── TweetModal.tsx  # Tweet detail modal
│       │   │   └── LinkPreview.tsx # External URL previews
│       │   ├── hooks/
│       │   │   └── useApi.ts    # Data fetching hooks
│       │   └── types/
│       │       └── index.ts     # TypeScript definitions
│       └── package.json
│
└── scripts/                     # Data processing
    ├── distill_json.py          # Distill original export
    └── split_into_batches.py    # Split into batches
```

## Architecture Decisions

### 1. SQLite Over PostgreSQL/MongoDB

**Decision**: Use SQLite with better-sqlite3 driver

**Tradeoffs**:
- ✅ No server setup required, portable, file-based
- ✅ Excellent read performance for this use case
- ✅ Type-safe bindings via better-sqlite3
- ❌ Single-writer (not an issue for single-user app)
- ❌ No advanced features (full-text search, JSON queries)

**Alternative Considered**: PostgreSQL with Prisma - rejected for complexity

### 2. React Without Router

**Decision**: Single-page app without React Router

**Tradeoffs**:
- ✅ Simpler state management
- ✅ No URL routing complexity
- ❌ No deep linking to specific tweets
- ❌ Browser back button doesn't work as expected

**Alternative Considered**: React Router - overkill for filtering UI

### 3. Custom Hooks for Data Fetching

**Decision**: Custom hooks (`useCategories`, `useTweets`, `useCategoryTags`) instead of React Query

**Tradeoffs**:
- ✅ No additional dependencies
- ✅ Explicit loading/error states
- ✅ Simple caching via React's built-in caching
- ❌ No automatic refetching on focus
- ❌ Manual cache invalidation

**Alternative Considered**: TanStack Query - rejected to minimize dependencies

### 4. Tags as Subfilter from Categories

**Decision**: Tags only show those relevant to the selected category

**Tradeoffs**:
- ✅ Reduced cognitive load (fewer tags to scan)
- ✅ Tags are contextually relevant
- ❌ Can't discover tags from other categories
- ❌ Need separate API endpoint for category-specific tags

**Alternative Considered**: Show all 142 tags always - rejected for UX clarity

### 5. Multi-Tag Selection with OR Logic

**Decision**: Multiple tags use OR logic (not AND)

**Tradeoffs**:
- ✅ More inclusive results (tweets matching ANY tag)
- ✅ Better for exploration
- ❌ Results can be broader than expected
- ❌ AND logic would be more restrictive

**Alternative Considered**: AND logic - rejected for exploration use case

### 6. Note as Primary Content

**Decision**: Display `note_tweet_text` as main content, fallback to `full_text`

**Tradeoffs**:
- ✅ Users see expanded content instead of truncated tweets
- ✅ 50% of tweets have notes with better content
- ❌ Some notes are marginally different from full_text
- ❌ No way to toggle between original and expanded

**Implementation**:
```typescript
// frontend/src/components/TweetModal.tsx
const displayText = tweet.note_tweet_text || tweet.full_text;
```

### 7. Image Path Inference

**Decision**: Infer image path from tweet ID instead of database column

**Tradeoffs**:
- ✅ Quick fix for missing image paths
- ✅ No database migration needed
- ❌ Assumes naming convention `{tweet_id}/{tweet_id}_1.jpg`
- ❌ Database backfill still needed for consistency

**Root Cause**: Images were downloaded but `image_path` column wasn't updated during import. Created backfill script to fix existing data.

### 8. Link Previews with Lazy Loading

**Decision**: Fetch OpenGraph metadata for external URLs with client-side caching

**Tradeoffs**:
- ✅ Rich preview of article content before clicking
- ✅ Cached in database to avoid repeated fetches
- ✅ Lazy loading doesn't block modal display
- ❌ Requires server-side fetching (CORS blocks client-side)
- ❌ Some sites block bots or don't have OG tags
- ❌ t.co URLs need unshortening first

**Implementation Details**:

Backend (`backend/src/lib/og-fetcher.ts`):
```typescript
export async function getLinkPreview(url: string) {
  const cached = getCachedPreview(url);
  if (cached) return cached;

  const og = await fetchOpenGraph(url);
  cachePreview(url, og.title, og.description, og.image, og.siteName);

  return { url, ...og, cachedAt: new Date().toISOString() };
}

async function fetchOpenGraph(url: string) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; X-Bookmarks-Bot/1.0)' }
  });
  const html = await response.text();

  return {
    title: extractMeta(html, 'og:title') || extractTitle(html),
    description: extractMeta(html, 'og:description'),
    image: extractMeta(html, 'og:image'),
    siteName: extractMeta(html, 'og:site_name')
  };
}
```

Frontend (`frontend/src/components/LinkPreview.tsx`):
```typescript
export function LinkPreviewCard({ url }: { url: string }) {
  const { preview, loading, error } = useLinkPreview(url);

  if (loading) return <Skeleton />;
  if (error || !preview) return <SimpleLink url={url} />;

  return (
    <a href={url} className="preview-card">
      {preview.image && <img src={preview.image} alt="" />}
      <div>
        <p className="site-name">{preview.siteName}</p>
        <p className="title">{preview.title}</p>
        <p className="description">{preview.description}</p>
      </div>
    </a>
  );
}
```

**URL Unshortening**: Shortened URLs (t.co, bit.ly) are automatically unshortened before fetching OG tags. This requires an HTTP HEAD request with redirect following.

**Learnings**:
1. CORS prevents client-side OG fetching - must use server-side proxy
2. Some sites (e.g., X) return minimal OG data for shortened URLs
3. URL unshortening adds ~200-500ms latency per new URL
4. HTML entity decoding is required for proper text rendering
5. Error handling is critical - many sites block or return 403

**Cache Strategy**: SQLite table with 24-hour TTL
```sql
CREATE TABLE link_previews (
  url TEXT PRIMARY KEY,
  title TEXT,
  description TEXT,
  image TEXT,
  site_name TEXT,
  cached_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

## Key Design Patterns

### Hook Pattern for Tags

```typescript
// frontend/src/hooks/useApi.ts
export function useCategoryTags(categorySlug: string | undefined) {
  const [subtags, setSubtags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const currentSlug = categorySlug;

    const fetchTags = async () => {
      setLoading(true);
      try {
        const url = categorySlug
          ? `/api/categories/${categorySlug}/tags`
          : `/api/subtags`;
        const res = await fetch(url);
        const data = await res.json();
        if (isMounted && currentSlug === categorySlug) {
          setSubtags(data);
        }
      } catch (err) {
        console.error('Error fetching tags:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTags();
    return () => { isMounted = false; };
  }, [categorySlug]);

  return { subtags, loading };
}
```

**Why the isMounted pattern?** Prevents race conditions when rapidly changing categories - stale API responses don't overwrite newer ones.

### API Filter Pattern

```typescript
// backend/src/routes/api.ts
if (subtags) {
  const tagList = (subtags as string).split(',').map(t => t.trim());
  if (tagList.length === 1) {
    conditions.push('tc.subcategories LIKE ?');
    params.push(`%${tagList[0]}%`);
  } else {
    const tagConditions = tagList.map(() => 'tc.subcategories LIKE ?').join(' OR ');
    conditions.push(`(${tagConditions})`);
    tagList.forEach(tag => params.push(`%${tag}%`));
  }
}
```

**Why LIKE instead of JSON contains?** The database stores tags as comma-separated string (e.g., `#ai-ml, #upskilling-map`), so LIKE patterns are necessary.

## Database Schema

```sql
CREATE TABLE tweets (
  id INTEGER PRIMARY KEY,
  tweet_url TEXT,
  author TEXT,
  author_name TEXT,
  full_text TEXT,
  note_tweet_text TEXT,
  bookmark_date TEXT,
  tweet_date TEXT,
  media_type TEXT,
  image_path TEXT,
  video_url TEXT,
  cognitive_value TEXT,
  created_at TEXT
);

CREATE TABLE categories (
  id INTEGER PRIMARY KEY,
  name TEXT,
  slug TEXT UNIQUE
);

CREATE TABLE tweet_categories (
  tweet_id INTEGER REFERENCES tweets(id),
  category_id INTEGER REFERENCES categories(id),
  subcategories TEXT,  -- Comma-separated: "#tag1, #tag2"
  PRIMARY KEY (tweet_id, category_id)
);

CREATE TABLE link_previews (
  url TEXT PRIMARY KEY,
  title TEXT,
  description TEXT,
  image TEXT,
  site_name TEXT,
  cached_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_link_previews_cached_at ON link_previews(cached_at);
```

**Tradeoff**: Storing subcategories as comma-separated string instead of normalized table. Easier to query but less type-safe.

## Classification System

Five categories based on builder mental models:

| Category | Slug | Mental Model | Example Tags |
|----------|------|--------------|--------------|
| AI Orchestration & Agentics | `ai-orchestration-agentics` | The "Brain" | #agent-architecture, #prompt-engineering, #ai-tools |
| Technical Excellence | `technical-excellence` | The "Hands" | #system-design, #optimization, #devops-infra |
| Product Sense & Market Dynamics | `product-sense-market-dynamics` | The "Eyes" | #pmf, #ux-psychology, #growth-loops |
| Strategic Agency & Career Growth | `strategic-agency-career-growth` | The "Compass" | #upskilling-map, #agency-building, #productivity |
| The Builder's Toolbox | `builders-toolbox` | The "Belt" | #free-apis, #saas-templates, #reference-library |

## Known Limitations

1. **Import requires MiniMax API key** - Without it, tweets go to uncategorized
2. **No deep linking** - Can't share URLs to specific tweets/filters
3. **Single-user only** - SQLite doesn't support concurrent writes
4. **No full-text search optimization** - Uses simple LIKE queries
5. **Images not re-downloaded** - Skip if already exists
6. **No link previews** - Shortened URLs don't show article previews

## Commands

```bash
# Kill processes on ports
lsof -ti:3001 | xargs kill -9
lsof -ti:5173 | xargs kill -9

# Start backend
cd /home/adam/x-bookmarks-app/backend
nohup npx tsx src/index.ts > /tmp/backend.log 2>&1 &

# Start frontend
cd /home/adam/x-bookmarks-app/frontend
nohup npm run dev -- --port 5173 > /tmp/frontend.log 2>&1 &

# Health check
curl http://localhost:3001/health

# Test API
curl "http://localhost:3001/api/tweets?category=ai-orchestration-agentics&subtags=%23agent-architecture&limit=5"
```

## If Continuing Development

### Priority Features

1. ✅ **Link previews** - Fetch and display OpenGraph metadata for external URLs
2. **URL-based filtering** - Add query params for shareable links
3. **Search optimization** - Consider full-text search extension
4. **Bulk operations** - Select and delete multiple tweets
5. **Tag management** - Add/remove tags from tweet view

### Files to Modify

| Feature | Files |
|---------|-------|
| API changes | `backend/src/routes/api.ts` |
| OG fetching | `backend/src/lib/og-fetcher.ts` |
| Database schema | `backend/src/db/index.ts` |
| Link preview hook | `frontend/src/hooks/useApi.ts` |
| Link preview component | `frontend/src/components/LinkPreview.tsx` |
| TweetModal integration | `frontend/src/components/TweetModal.tsx` |
| Frontend state | `frontend/src/App.tsx` |
| Data hooks | `frontend/src/hooks/useApi.ts` |
| UI components | `frontend/src/components/` |

### Testing Checklist

When making changes:
1. ✅ Backend builds: `cd backend && npx tsx --check src/index.ts`
2. ✅ Frontend builds: `cd frontend && npm run build`
3. ✅ API works: `curl http://localhost:3001/health`
4. ✅ Filters work: Test category + tag combinations
5. ✅ Multi-tag: Select 2+ tags, verify OR logic

## Data Source

- **Input**: `/home/adam/Downloads/bookmarks_2026-01-13-1528.json`
- **Image storage**: `backend/static/images/{tweet_id}/`
- **Database**: `backend/data/bookmarks.db`
- **Stats**: 1,915 tweets, 142 unique tags, 5 categories
