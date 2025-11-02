import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { ChapterPath, SearchResult, Topic } from '../types';
import { useTranslation } from '../i18n';

interface SearchBarProps {
  onSelectChapter: (path: ChapterPath) => void;
  courseStructure: Topic[];
}

const SearchBar: React.FC<SearchBarProps> = ({ onSelectChapter, courseStructure }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const allChapters = useMemo(() => {
    const chapters: SearchResult[] = [];
    courseStructure.forEach((topic, topicIdx) => {
      topic.subtopics.forEach((subtopic, subtopicIdx) => {
        subtopic.chapters.forEach((chapter, chapterIdx) => {
          chapters.push({
            path: { topicIdx, subtopicIdx, chapterIdx },
            topicTitle: topic.title,
            subtopicTitle: subtopic.title,
            chapterTitle: chapter.title,
          });
        });
      });
    });
    return chapters;
  }, [courseStructure]);

  useEffect(() => {
    if (query.length > 2) {
      const lowerCaseQuery = query.toLowerCase();
      const filteredResults = allChapters.filter(
        (chapter) =>
          chapter.chapterTitle.toLowerCase().includes(lowerCaseQuery) ||
          chapter.subtopicTitle.toLowerCase().includes(lowerCaseQuery) ||
          chapter.topicTitle.toLowerCase().includes(lowerCaseQuery)
      );
      setResults(filteredResults);
      setIsOpen(filteredResults.length > 0);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query, allChapters]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (path: ChapterPath) => {
    onSelectChapter(path);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={searchContainerRef} className="relative w-full max-w-lg mx-auto">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('search_placeholder')}
          className="w-full bg-surface p-3 pl-10 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      {isOpen && (
        <ul className="absolute z-10 mt-2 w-full bg-surface border border-gray-600 rounded-lg shadow-xl max-h-80 overflow-y-auto">
          {results.map(({ path, topicTitle, subtopicTitle, chapterTitle }) => (
            <li key={`${path.topicIdx}-${path.subtopicIdx}-${path.chapterIdx}`}>
              <button
                onClick={() => handleSelect(path)}
                className="w-full text-left px-4 py-3 hover:bg-gray-700/50 transition-colors"
              >
                <p className="font-semibold text-text-primary">{chapterTitle}</p>
                <p className="text-sm text-text-secondary">{topicTitle} > {subtopicTitle}</p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;