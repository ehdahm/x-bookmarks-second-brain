import fs from 'fs';
import path from 'path';
import db from '../db';

const INPUT_FILE = '/home/adam/x-bookmarks-synthesis/bookmarks_distilled.json';
const IMAGES_DIR = path.join(process.cwd(), 'static', 'images');

const CATEGORIES = [
  { name: 'AI Orchestration & Agentics', slug: 'ai-orchestration-agentics' },
  { name: 'Technical Excellence', slug: 'technical-excellence' },
  { name: 'Product Sense & Market Dynamics', slug: 'product-sense-market-dynamics' },
  { name: 'Strategic Agency & Career Growth', slug: 'strategic-agency-career-growth' },
  { name: "The Builder's Toolbox", slug: 'builders-toolbox' }
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function main() {
  console.log('Starting import from distilled JSON...');

  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`Input file not found: ${INPUT_FILE}`);
    process.exit(1);
  }

  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }

  const insertCategory = db.prepare(`
    INSERT OR IGNORE INTO categories (name, slug) VALUES (?, ?)
  `);

  const getCategoryId = db.prepare(`
    SELECT id FROM categories WHERE name = ?
  `);

  const insertTweet = db.prepare(`
    INSERT INTO tweets (
      tweet_url, author, author_name, full_text, note_tweet_text,
      bookmark_date, tweet_date, media_type, image_path, video_url, cognitive_value
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertTweetCategory = db.prepare(`
    INSERT INTO tweet_categories (tweet_id, category_id, subcategories)
    VALUES (?, ?, ?)
  `);

  const checkTweetExists = db.prepare(`
    SELECT id FROM tweets WHERE tweet_url = ?
  `);

  db.prepare('PRAGMA journal_mode = WAL').run();

  console.log('Initializing categories...');
  for (const cat of CATEGORIES) {
    insertCategory.run(cat.name, cat.slug);
  }

  console.log('Loading bookmarks JSON...');
  const data = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'));
  console.log(`Found ${data.length} bookmarks`);

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < data.length; i++) {
    const bookmark = data[i];
    const tweetUrl = bookmark.tweet_url;

    const existing = checkTweetExists.get(tweetUrl);
    if (existing) {
      console.log(`  [${i + 1}/${data.length}] Skipping already imported: ${bookmark.author}`);
      skipped++;
      continue;
    }

    const result = insertTweet.run(
      tweetUrl,
      bookmark.author,
      bookmark.author_name || null,
      bookmark.full_text,
      bookmark.note_tweet_text || null,
      bookmark.bookmark_date || null,
      bookmark.tweet_date || null,
      bookmark.media_type || 'none',
      null,
      bookmark.video_url || null,
      bookmark.cognitive_value || null
    );

    const tweetId = result.lastInsertRowid as number;

    console.log(`  [${i + 1}/${data.length}] Importing: ${bookmark.author}...`);

    if (bookmark.primary_category && bookmark.subtags) {
      const categoryRow = getCategoryId.get(bookmark.primary_category);
      if (categoryRow) {
        insertTweetCategory.run(
          tweetId,
          (categoryRow as any).id,
          Array.isArray(bookmark.subtags) ? bookmark.subtags.join(', ') : (bookmark.subtags || '')
        );
      }
    }

    imported++;

    if (imported % 50 === 0) {
      console.log(`\n--- Progress: ${imported} imported, ${skipped} skipped, ${errors} errors ---\n`);
    }
  }

  console.log('\n=== Import Complete ===');
  console.log(`Total processed: ${data.length}`);
  console.log(`Imported: ${imported}`);
  console.log(`Skipped (duplicates): ${skipped}`);
  console.log(`Errors: ${errors}`);

  const totalTweets = db.prepare('SELECT COUNT(*) as count FROM tweets').get() as { count: number };
  console.log(`\nDatabase now contains ${totalTweets.count} tweets`);
}

main().catch(console.error);
