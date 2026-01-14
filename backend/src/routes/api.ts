import { Router, Request, Response } from 'express';
import db, { getDb } from '../db';

const router = Router();

router.get('/categories', (req: Request, res: Response) => {
  try {
    const categories = db.prepare(`
      SELECT c.id, c.name, c.slug, COUNT(tc.tweet_id) as tweet_count
      FROM categories c
      LEFT JOIN tweet_categories tc ON c.id = tc.category_id
      GROUP BY c.id
      ORDER BY c.name
    `).all();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.get('/subtags', (req: Request, res: Response) => {
  try {
    const result = db.prepare(`
      SELECT DISTINCT subcategories
      FROM tweet_categories
      WHERE subcategories IS NOT NULL AND subcategories != ''
    `).all();

    const allTags = new Set<string>();
    result.forEach((row: any) => {
      if (row.subcategories) {
        row.subcategories.split(',').forEach((tag: string) => {
          const cleaned = tag.trim();
          if (cleaned) allTags.add(cleaned);
        });
      }
    });

    const sortedTags = Array.from(allTags).sort();
    res.json(sortedTags);
  } catch (error) {
    console.error('Error fetching subtags:', error);
    res.status(500).json({ error: 'Failed to fetch subtags' });
  }
});

router.get('/categories/:slug/tags', (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const result = db.prepare(`
      SELECT DISTINCT tc.subcategories
      FROM tweet_categories tc
      JOIN categories c ON tc.category_id = c.id
      WHERE c.slug = ? AND tc.subcategories IS NOT NULL AND tc.subcategories != ''
    `).all(slug);

    const allTags = new Set<string>();
    result.forEach((row: any) => {
      if (row.subcategories) {
        row.subcategories.split(',').forEach((tag: string) => {
          const cleaned = tag.trim();
          if (cleaned) allTags.add(cleaned);
        });
      }
    });

    const sortedTags = Array.from(allTags).sort();
    res.json(sortedTags);
  } catch (error) {
    console.error('Error fetching category tags:', error);
    res.status(500).json({ error: 'Failed to fetch category tags' });
  }
});

router.get('/tweets', (req: Request, res: Response) => {
  try {
    const { category, subtags, search, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT DISTINCT t.*, 
        GROUP_CONCAT(DISTINCT c.id || '-' || c.name || '-' || c.slug) as category_data,
        GROUP_CONCAT(DISTINCT tc.subcategories) as subtags_data
      FROM tweets t
      LEFT JOIN tweet_categories tc ON t.id = tc.tweet_id
      LEFT JOIN categories c ON tc.category_id = c.id
    `;

    const conditions: string[] = [];
    const params: any[] = [];

    if (category) {
      conditions.push('c.slug = ?');
      params.push(category);
    }

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

    if (search) {
      conditions.push('(t.full_text LIKE ? OR t.author LIKE ? OR t.note_tweet_text LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY t.id ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit as string), parseInt(offset as string));

    const tweets = db.prepare(query).all(...params);

    const formattedTweets = tweets.map((t: any) => {
      let subcategories: string[] = [];
      if (t.subtags_data) {
        const allTags = t.subtags_data.split(',').filter((s: string) => s.trim());
        subcategories = [...new Set(allTags)];
      }
      
      return {
        ...t,
        categories: t.category_data ? t.category_data.split(',').map((c: string) => {
          const [id, name, slug] = c.split('-');
          return { id: parseInt(id), name, slug };
        }) : [],
        subtags: subcategories,
        category_data: undefined,
        subtags_data: undefined
      };
    });

    res.json(formattedTweets);
  } catch (error) {
    console.error('Error fetching tweets:', error);
    res.status(500).json({ error: 'Failed to fetch tweets' });
  }
});

router.get('/tweets/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const tweet = db.prepare(`
      SELECT t.*, 
        GROUP_CONCAT(DISTINCT c.id || '-' || c.name || '-' || c.slug) as category_data,
        GROUP_CONCAT(DISTINCT tc.subcategories) as subtags_data
      FROM tweets t
      LEFT JOIN tweet_categories tc ON t.id = tc.tweet_id
      LEFT JOIN categories c ON tc.category_id = c.id
      WHERE t.id = ?
      GROUP BY t.id
    `).get(id);

    if (!tweet) {
      return res.status(404).json({ error: 'Tweet not found' });
    }

    const t = tweet as any;
    let subcategories: string[] = [];
    if (t.subtags_data) {
      const allTags = t.subtags_data.split(',').filter((s: string) => s.trim());
      subcategories = [...new Set(allTags)];
    }

    const formattedTweet = {
      ...t,
      categories: t.category_data ? t.category_data.split(',').map((c: string) => {
        const [id, name, slug] = c.split('-');
        return { id: parseInt(id), name, slug };
      }) : [],
      subtags: subcategories,
      category_data: undefined,
      subtags_data: undefined
    };

    res.json(formattedTweet);
  } catch (error) {
    console.error('Error fetching tweet:', error);
    res.status(500).json({ error: 'Failed to fetch tweet' });
  }
});

router.delete('/tweets/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = db.prepare('DELETE FROM tweets WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Tweet not found' });
    }

    res.json({ message: 'Tweet deleted successfully' });
  } catch (error) {
    console.error('Error deleting tweet:', error);
    res.status(500).json({ error: 'Failed to delete tweet' });
  }
});

router.get('/stats', (req: Request, res: Response) => {
  try {
    const totalTweets = db.prepare('SELECT COUNT(*) as count FROM tweets').get() as { count: number };
    const totalCategories = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
    const tweetsWithImages = db.prepare("SELECT COUNT(*) as count FROM tweets WHERE media_type = 'image'").get() as { count: number };
    const tweetsWithVideos = db.prepare("SELECT COUNT(*) as count FROM tweets WHERE media_type = 'video'").get() as { count: number };

    res.json({
      totalTweets: totalTweets.count,
      totalCategories: totalCategories.count,
      tweetsWithImages: tweetsWithImages.count,
      tweetsWithVideos: tweetsWithVideos.count
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

import { getLinkPreview, unshortenUrl } from '../lib/og-fetcher';

router.get('/link-preview', async (req: Request, res: Response) => {
  try {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL parameter required' });
    }

    let targetUrl = url;

    if (url.includes('t.co') || url.includes('bit.ly') || url.includes('tinyurl.com')) {
      targetUrl = await unshortenUrl(url);
    }

    const preview = await getLinkPreview(targetUrl);
    res.json(preview);
  } catch (error) {
    console.error('Error fetching link preview:', error);
    res.status(500).json({ error: 'Failed to fetch link preview' });
  }
});

export default router;
