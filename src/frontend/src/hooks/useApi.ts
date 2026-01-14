import { useState, useEffect, useCallback } from 'react';
import { Tweet, Category, TweetStats } from '../types';

const API_BASE = '/api';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/categories`)
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { categories, loading, error };
}

export function useSubtags() {
  const [subtags, setSubtags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/subtags`)
      .then(res => res.json())
      .then(data => {
        setSubtags(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { subtags, loading, error };
}

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
          ? `${API_BASE}/categories/${categorySlug}/tags`
          : `${API_BASE}/subtags`;
        const res = await fetch(url);
        const data = await res.json();
        if (isMounted && currentSlug === categorySlug) {
          setSubtags(data);
        }
      } catch (err) {
        console.error('Error fetching tags:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTags();

    return () => {
      isMounted = false;
    };
  }, [categorySlug]);

  return { subtags, loading };
}

export function useTweets(params: {
  category?: string;
  subtags?: string[];
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchTweets = useCallback(() => {
    const queryParams = new URLSearchParams();
    if (params.category) queryParams.set('category', params.category);
    if (params.subtags && params.subtags.length > 0) {
      queryParams.set('subtags', params.subtags.join(','));
    }
    if (params.search) queryParams.set('search', params.search);
    if (params.limit) queryParams.set('limit', params.limit.toString());
    if (params.offset) queryParams.set('offset', params.offset.toString());

    setLoading(true);
    fetch(`${API_BASE}/tweets?${queryParams}`)
      .then(res => res.json())
      .then(data => {
        setTweets(data);
        setHasMore(data.length === params.limit);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [params.category, params.subtags, params.search, params.limit, params.offset]);

  useEffect(() => {
    fetchTweets();
  }, [fetchTweets]);

  return { tweets, loading, error, hasMore, refetch: fetchTweets };
}

export function useTweet(id: number) {
  const [tweet, setTweet] = useState<Tweet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/tweets/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Tweet not found');
        return res.json();
      })
      .then(data => {
        setTweet(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  return { tweet, loading, error };
}

export function useStats() {
  const [stats, setStats] = useState<TweetStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/stats`)
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { stats, loading, error };
}

export function useDeleteTweet() {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteTweet = useCallback(async (id: number) => {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/tweets/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete');
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setDeleting(false);
    }
  }, []);

  return { deleteTweet, deleting, error };
}

export interface LinkPreview {
  url: string;
  title: string | null;
  description: string | null;
  image: string | null;
  siteName: string | null;
  cachedAt: string;
}

export function useLinkPreview(url: string | null) {
  const [preview, setPreview] = useState<LinkPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setPreview(null);
      return;
    }

    let isMounted = true;

    const fetchPreview = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/link-preview?url=${encodeURIComponent(url)}`);
        if (!res.ok) throw new Error('Failed to fetch preview');
        const data = await res.json();
        if (isMounted) {
          setPreview(data);
        }
      } catch (err: any) {
        setError(err.message);
        if (isMounted) {
          setPreview(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPreview();

    return () => {
      isMounted = false;
    };
  }, [url]);

  return { preview, loading, error };
}
