import fs from 'fs';
import path from 'path';
import db from '../db';

const IMAGES_DIR = path.join(process.cwd(), 'static', 'images');

async function main() {
  console.log('Backfilling image paths from folder structure...\n');

  if (!fs.existsSync(IMAGES_DIR)) {
    console.error(`Images directory not found: ${IMAGES_DIR}`);
    process.exit(1);
  }

  const updateImagePath = db.prepare(`
    UPDATE tweets SET image_path = ? WHERE id = ?
  `);

  const getTweet = db.prepare(`
    SELECT id, media_type FROM tweets WHERE id = ?
  `);

  const folders = fs.readdirSync(IMAGES_DIR);
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  console.log(`Found ${folders.length} image folders\n`);

  for (const folder of folders) {
    const folderPath = path.join(IMAGES_DIR, folder);
    
    if (!fs.statSync(folderPath).isDirectory()) {
      continue;
    }

    const tweetId = parseInt(folder);
    if (isNaN(tweetId)) {
      console.log(`  Skipping invalid folder: ${folder}`);
      skipped++;
      continue;
    }

    const imageFile = `${tweetId}_1.jpg`;
    const imagePath = path.join(folder, imageFile);

    if (fs.existsSync(path.join(folderPath, imageFile))) {
      try {
        updateImagePath.run(imagePath, tweetId);
        updated++;
        if (updated % 100 === 0) {
          process.stdout.write('.');
        }
      } catch (err) {
        errors++;
        console.log(`\n  Error updating tweet ${tweetId}:`, err);
      }
    } else {
      skipped++;
    }
  }

  console.log(`\n\nDone!`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Errors: ${errors}`);

  const stats = db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN image_path IS NOT NULL AND image_path != '' THEN 1 ELSE 0 END) as with_images
    FROM tweets
  `).get() as { total: number; with_images: number };

  console.log(`\nDatabase status:`);
  console.log(`  Total tweets: ${stats.total}`);
  console.log(`  Tweets with images: ${stats.with_images}`);
}

main().catch(console.error);
