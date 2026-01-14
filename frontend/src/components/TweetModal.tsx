import { useState } from 'react';
import { Tweet } from '../types';
import { useDeleteTweet } from '../hooks/useApi';
import { LinkPreviewList } from './LinkPreview';

interface TweetModalProps {
  tweet: Tweet;
  onClose: () => void;
}

function TweetModal({ tweet, onClose }: TweetModalProps) {
  const [imageError, setImageError] = useState(false);
  const { deleteTweet, deleting } = useDeleteTweet();

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this tweet?')) {
      const success = await deleteTweet(tweet.id);
      if (success) {
        onClose();
      }
    }
  };

  const hasImage = tweet.media_type === 'image';
  const imageUrl = hasImage ? `/static/images/${tweet.id}/${tweet.id}_1.jpg` : null;
  const displayText = tweet.note_tweet_text || tweet.full_text;

  const formatText = (text: string) => {
    return text.split(/(https?:\/\/[^\s]+)/g).map((part, i) => {
      if (part.match(/^https?:\/\//)) {
        return (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
              {tweet.author[0].toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                @{tweet.author}
              </p>
              {tweet.tweet_date && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {tweet.tweet_date}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {tweet.tweet_url && (
              <a
                href={tweet.tweet_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Open on X"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            )}
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 disabled:opacity-50"
              title="Delete tweet"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-base text-gray-800 dark:text-gray-200 mb-4 whitespace-pre-wrap">
            {formatText(displayText)}
          </div>

          {hasImage && imageUrl && !imageError && (
            <div className="mb-4">
              <div className="relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                <img
                  src={imageUrl}
                  alt="Tweet media"
                  className="w-full h-auto max-h-96 object-contain"
                  onError={() => setImageError(true)}
                />
              </div>
            </div>
          )}

          {tweet.media_type === 'video' && tweet.video_url && (
            <div className="mb-4">
              <a
                href={tweet.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Watch Video
              </a>
            </div>
          )}

          <LinkPreviewList text={displayText} />

          <div className="flex flex-wrap gap-2 mb-4">
            {tweet.categories.map((cat) => (
              <span
                key={cat.id}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm"
              >
                {cat.name}
              </span>
            ))}
          </div>

          {tweet.subtags && tweet.subtags.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Tags:</p>
              <div className="flex flex-wrap gap-2">
                {tweet.subtags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs"
                  >
                    #{tag.replace('#', '')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {tweet.cognitive_value && (
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Why this matters:</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{tweet.cognitive_value}</p>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Bookmarked: {tweet.bookmark_date || 'Unknown'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TweetModal;
