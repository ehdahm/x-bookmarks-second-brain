import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TweetGrid from './components/TweetGrid';
import TweetModal from './components/TweetModal';
import { useCategories, useTweets, useStats } from './hooks/useApi';
import { Tweet } from './types';

function App() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [selectedSubtags, setSelectedSubtags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTweet, setSelectedTweet] = useState<Tweet | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { categories, loading: categoriesLoading } = useCategories();
  const { tweets, loading: tweetsLoading, refetch } = useTweets({
    category: selectedCategory,
    subtags: selectedSubtags.length > 0 ? selectedSubtags : undefined,
    search: searchQuery || undefined,
    limit: 50
  });
  const { stats } = useStats();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleSubtag = (tag: string) => {
    setSelectedSubtags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  const hasActiveFilters = selectedCategory !== undefined || selectedSubtags.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Sidebar
        categories={categories}
        loading={categoriesLoading}
        selectedCategory={selectedCategory}
        selectedSubtags={selectedSubtags}
        onSelectCategory={setSelectedCategory}
        onToggleSubtag={toggleSubtag}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                X Bookmarks
              </h1>
              {stats && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {stats.totalTweets} tweets
                </span>
              )}
            </div>

            <div className="flex items-center gap-4">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search tweets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 px-4 py-2 pl-10 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </form>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {darkMode ? (
                  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </header>

        <div className="p-6">
          {hasActiveFilters && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Filtering by:</span>
              {selectedCategory && (
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                  {categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}
                  <button
                    onClick={() => setSelectedCategory(undefined)}
                    className="ml-2 hover:text-blue-900 dark:hover:text-blue-100"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedSubtags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium">
                  #{tag.replace('#', '')}
                  <button
                    onClick={() => toggleSubtag(tag)}
                    className="ml-2 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    ×
                  </button>
                </span>
              ))}
              <button
                onClick={() => {
                  setSelectedCategory(undefined);
                  setSelectedSubtags([]);
                }}
                className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Clear all
              </button>
            </div>
          )}

          <TweetGrid
            tweets={tweets}
            loading={tweetsLoading}
            onSelectTweet={setSelectedTweet}
          />
        </div>
      </main>

      {selectedTweet && (
        <TweetModal
          tweet={selectedTweet}
          onClose={() => setSelectedTweet(null)}
        />
      )}
    </div>
  );
}

export default App;
