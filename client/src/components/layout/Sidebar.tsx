import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, TrendingUp, Bookmark, Plus } from 'lucide-react';
import { POPULAR_TAGS } from '../../utils/constants';

interface SidebarProps {
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
  onCreatePost: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedTag, onTagSelect, onCreatePost }) => {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home Feed', path: '/' },
    { icon: TrendingUp, label: 'Trending', path: '/?sort=trending' },
    { icon: Bookmark, label: 'Saved', path: '/?saved=true' },
  ];

  return (
    <aside className="hidden lg:block w-64 shrink-0">
      <div className="sticky top-20 space-y-4">
        {/* Navigation */}
        <div className="glass-card p-3">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === '/' && item.path === '/';
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive
                      ? 'bg-primary-500/15 text-primary-400'
                      : 'text-surface-400 hover:text-surface-100 hover:bg-surface-700/50'
                    }`}
                  id={`sidebar-${item.label.toLowerCase().replace(' ', '-')}`}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Create Post Button */}
        <button
          onClick={onCreatePost}
          className="w-full btn-primary flex items-center justify-center gap-2 py-3"
          id="sidebar-create-post"
        >
          <Plus size={18} />
          Create Post
        </button>

        {/* Topic Tags */}
        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-3">
            Topics
          </h3>
          <div className="flex flex-wrap gap-2">
            {POPULAR_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => onTagSelect(selectedTag === tag ? null : tag)}
                className={`tag-chip ${selectedTag === tag ? 'tag-chip-active' : ''}`}
                id={`tag-${tag}`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="px-3 text-xs text-surface-500 space-y-1">
          <p>© 2026 DevXGen.in</p>
          <p>Built for developers, by developers.</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
