import { Category } from '../types';
import { useCategoryTags } from '../hooks/useApi';

interface SidebarProps {
  categories: Category[];
  loading: boolean;
  selectedCategory: string | undefined;
  selectedSubtags: string[];
  onSelectCategory: (slug: string | undefined) => void;
  onToggleSubtag: (tag: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

function Sidebar({ categories, loading, selectedCategory, selectedSubtags, onSelectCategory, onToggleSubtag, isOpen }: SidebarProps) {
  const { subtags, loading: tagsLoading } = useCategoryTags(selectedCategory);

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-20 overflow-y-auto ${
        isOpen ? 'w-64' : 'w-0'
      }`}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Categories</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {categories.length} categories
        </p>
      </div>

      <nav className="p-2 pb-0">
        <button
          onClick={() => {
            onSelectCategory(undefined);
          }}
          className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
            selectedCategory === undefined && selectedSubtags.length === 0
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <span className="font-medium">All Tweets</span>
        </button>

        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading...</div>
        ) : (
          <ul className="mt-2 space-y-1">
            {categories.map((category) => (
              <li key={category.id}>
                <button
                  onClick={() => {
                    onSelectCategory(category.slug);
                  }}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center justify-between ${
                    selectedCategory === category.slug
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="font-medium truncate">{category.name}</span>
                  <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded-full">
                    {category.tweet_count}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </nav>

      <div className="border-t border-gray-200 dark:border-gray-700 mt-4">
        <div className="px-4 py-3 flex items-center justify-between">
          <h3 className="font-medium text-gray-900 dark:text-white">Tags</h3>
          {tagsLoading && (
            <svg className="animate-spin h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
        </div>

        <div className="px-2 pb-2">
          {tagsLoading ? (
            <div className="flex items-center justify-center py-4">
              <span className="text-sm text-gray-500">Loading tags...</span>
            </div>
          ) : subtags.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 p-2">No tags available</p>
          ) : (
            <div className="flex flex-wrap gap-1 max-h-[calc(100vh-400px)] overflow-y-auto">
              {subtags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => onToggleSubtag(tag)}
                  className={`px-2 py-1 text-xs rounded-full transition-colors ${
                    selectedSubtags.includes(tag)
                      ? 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  #{tag.replace('#', '')}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          X Bookmarks App v1.0
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;
