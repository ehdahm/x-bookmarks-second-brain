import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'bookmarks.db');

const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS tweets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tweet_url TEXT NOT NULL,
    author TEXT NOT NULL,
    author_name TEXT,
    full_text TEXT NOT NULL,
    note_tweet_text TEXT,
    bookmark_date TEXT,
    tweet_date TEXT,
    media_type TEXT DEFAULT 'none',
    image_path TEXT,
    video_url TEXT,
    cognitive_value TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tweet_categories (
    tweet_id INTEGER NOT NULL REFERENCES tweets(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    subcategories TEXT,
    PRIMARY KEY (tweet_id, category_id)
  );

  CREATE INDEX IF NOT EXISTS idx_tweets_author ON tweets(author);
  CREATE INDEX IF NOT EXISTS idx_tweets_media_type ON tweets(media_type);
  CREATE INDEX IF NOT EXISTS idx_tweets_created_at ON tweets(created_at);
  CREATE INDEX IF NOT EXISTS idx_tweet_categories_tweet_id ON tweet_categories(tweet_id);
  CREATE INDEX IF NOT EXISTS idx_tweet_categories_category_id ON tweet_categories(category_id);

  CREATE TABLE IF NOT EXISTS link_previews (
    url TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    image TEXT,
    site_name TEXT,
    cached_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_link_previews_cached_at ON link_previews(cached_at);
`);

export default db;

export function getDb() {
  return db;
}

export interface Tweet {
  id: number;
  tweet_url: string;
  author: string;
  author_name: string | null;
  full_text: string;
  note_tweet_text: string | null;
  bookmark_date: string | null;
  tweet_date: string | null;
  media_type: string;
  image_path: string | null;
  video_url: string | null;
  cognitive_value: string | null;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface TweetWithCategories extends Tweet {
  categories: { id: number; name: string; slug: string }[];
  subcategories: string[];
}
