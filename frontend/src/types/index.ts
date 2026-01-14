export interface Category {
  id: number;
  name: string;
  slug: string;
  tweet_count: number;
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
  media_type: 'image' | 'video' | 'gif' | 'none';
  image_path: string | null;
  video_url: string | null;
  cognitive_value: string | null;
  created_at: string;
  categories: Category[];
  subtags: string[];
}

export interface TweetStats {
  totalTweets: number;
  totalCategories: number;
  tweetsWithImages: number;
  tweetsWithVideos: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
