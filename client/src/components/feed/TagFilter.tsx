import React from 'react';
import { POPULAR_TAGS } from '../../utils/constants';

interface TagFilterProps {
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
}

const TagFilter: React.FC<TagFilterProps> = ({ selectedTag, onTagSelect }) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 px-1 lg:hidden">
      <button
        onClick={() => onTagSelect(null)}
        className={`shrink-0 tag-chip ${!selectedTag ? 'tag-chip-active' : ''}`}
        id="tag-filter-all"
      >
        All
      </button>
      {POPULAR_TAGS.map((tag) => (
        <button
          key={tag}
          onClick={() => onTagSelect(selectedTag === tag ? null : tag)}
          className={`shrink-0 tag-chip ${selectedTag === tag ? 'tag-chip-active' : ''}`}
          id={`tag-filter-${tag}`}
        >
          #{tag}
        </button>
      ))}
    </div>
  );
};

export default TagFilter;
