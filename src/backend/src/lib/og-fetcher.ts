import db from '../db';

const CACHE_TTL_HOURS = 24;

export interface LinkPreview {
  url: string;
  title: string | null;
  description: string | null;
  image: string | null;
  siteName: string | null;
  cachedAt: string;
}

export function getCachedPreview(url: string): LinkPreview | null {
  const result = db.prepare(`
    SELECT * FROM link_previews
    WHERE url = ?
    AND cached_at > datetime('now', '-${CACHE_TTL_HOURS} hours')
  `).get(url) as any;

  return result || null;
}

export function cachePreview(
  url: string,
  title: string | null,
  description: string | null,
  image: string | null,
  siteName: string | null
): void {
  db.prepare(`
    INSERT OR REPLACE INTO link_previews (url, title, description, image, site_name, cached_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
  `).run(url, title, description, image, siteName);
}

export async function fetchOpenGraph(url: string): Promise<{
  title: string | null;
  description: string | null;
  image: string | null;
  siteName: string | null;
}> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; X-Bookmarks-Bot/1.0)'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();

    const title = extractMeta(html, 'og:title') ||
                  extractMeta(html, 'twitter:title') ||
                  extractTitle(html);

    const description = extractMeta(html, 'og:description') ||
                        extractMeta(html, 'twitter:description') ||
                        extractMeta(html, 'description');

    const image = extractMeta(html, 'og:image') ||
                  extractMeta(html, 'twitter:image') ||
                  extractMeta(html, 'twitter:image:src');

    const siteName = extractMeta(html, 'og:site_name');

    return { title, description, image, siteName };
  } catch (error) {
    console.error(`Failed to fetch OG tags for ${url}:`, error);
    return { title: null, description: null, image: null, siteName: null };
  }
}

function extractMeta(html: string, property: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']${property}["']`, 'i'),
    new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']+)["']`, 'i'),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      return decodeHtmlEntities(match[1].trim());
    }
  }

  return null;
}

function extractTitle(html: string): string | null {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? decodeHtmlEntities(match[1].trim()) : null;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

export async function getLinkPreview(url: string): Promise<LinkPreview> {
  const cached = getCachedPreview(url);
  if (cached) {
    return cached;
  }

  const og = await fetchOpenGraph(url);
  cachePreview(url, og.title, og.description, og.image, og.siteName);

  return {
    url,
    title: og.title,
    description: og.description,
    image: og.image,
    siteName: og.siteName,
    cachedAt: new Date().toISOString()
  };
}

export async function unshortenUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; X-Bookmarks-Bot/1.0)'
      }
    });

    return response.url;
  } catch (error) {
    console.error(`Failed to unshorten URL ${url}:`, error);
    return url;
  }
}
