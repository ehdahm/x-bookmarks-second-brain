import { useLinkPreview } from '../hooks/useApi';

interface LinkPreviewCardProps {
  url: string;
}

export function LinkPreviewCard({ url }: LinkPreviewCardProps) {
  const { preview, loading, error } = useLinkPreview(url);

  if (loading) {
    return (
      <div className="mt-4 bg-gray-100 dark:bg-gray-700 rounded-lg p-4 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !preview) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 block bg-gray-100 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      >
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          <span className="text-sm truncate">{url}</span>
        </div>
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-4 block bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all"
    >
      {preview.image && (
        <div className="aspect-video bg-gray-200 dark:bg-gray-600 overflow-hidden">
          <img
            src={preview.image}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}
      <div className="p-3">
        {preview.siteName && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            {preview.siteName}
          </p>
        )}
        {preview.title && (
          <p className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 mb-1">
            {preview.title}
          </p>
        )}
        {preview.description && (
          <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
            {preview.description}
          </p>
        )}
        <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-2">
          {new URL(url).hostname}
        </p>
      </div>
    </a>
  );
}

export function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlRegex);
  return matches || [];
}

export function LinkPreviewList({ text }: { text: string }) {
  const urls = extractUrls(text);

  if (urls.length === 0) {
    return null;
  }

  return (
    <div>
      {urls.map((url, index) => (
        <LinkPreviewCard key={index} url={url} />
      ))}
    </div>
  );
}
