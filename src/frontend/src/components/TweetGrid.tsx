import { Tweet } from '../types';

interface TweetGridProps {
  tweets: Tweet[];
  loading: boolean;
  onSelectTweet: (tweet: Tweet) => void;
}

function TweetGrid({ tweets, loading, onSelectTweet }: TweetGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 animate-pulse">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-1"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tweets.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tweets found</h3>
        <p className="text-gray-500 dark:text-gray-400">
          Try adjusting your filters or search query
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tweets.map((tweet) => (
        <article
          key={tweet.id}
          onClick={() => onSelectTweet(tweet)}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
              {tweet.author[0].toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                @{tweet.author}
              </p>
              {tweet.tweet_date && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {tweet.tweet_date}
                </p>
              )}
            </div>
          </div>

          <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 mb-3">
            {tweet.full_text}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {tweet.categories.slice(0, 2).map((cat) => (
                <span
                  key={cat.id}
                  className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs"
                >
                  {cat.name}
                </span>
              ))}
              {tweet.subtags && tweet.subtags.slice(0, 2).map((tag, i) => (
                <span
                  key={`tag-${i}`}
                  className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full text-xs"
                >
                  #{tag.replace('#', '')}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {tweet.media_type === 'image' && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  IMG
                </span>
              )}
              {tweet.media_type === 'video' && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  VID
                </span>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export default TweetGrid;
