'use client';

import { cn } from '@/lib/utils';
import { useDebounce } from '@corn12138/hooks';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  initialValue?: string;
  onSearch?: (query: string) => void;
}

export default function SearchBar({
  className,
  placeholder = "搜索文章、标签或作者...",
  initialValue = '',
  onSearch
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const debouncedQuery = useDebounce(query, 300);

  // 当防抖后的查询变更时调用onSearch
  useEffect(() => {
    if (onSearch) {
      onSearch(debouncedQuery);
    }
  }, [debouncedQuery, onSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      if (onSearch) {
        onSearch(query);
      } else {
        // 如果没有提供onSearch函数，则导航到搜索页
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  const clearSearch = () => {
    setQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("w-full relative group", className)}>
      <div
        className={cn(
          "relative flex items-center transition-all duration-200 rounded-full overflow-hidden",
          isFocused
            ? "ring-2 ring-primary-500 bg-white dark:bg-gray-800"
            : "ring-1 ring-gray-300 dark:ring-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:ring-gray-400 dark:hover:ring-gray-600"
        )}
      >
        <div className="pointer-events-none absolute left-3 flex items-center text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={cn(
            "w-full py-3 pl-10 pr-12 focus:outline-none rounded-full",
            "bg-transparent text-gray-900 dark:text-gray-100",
            "placeholder:text-gray-500 dark:placeholder:text-gray-400 text-base"
          )}
        />

        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-12 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}

        <button
          type="submit"
          className="absolute right-3 flex items-center justify-center h-7 w-7 rounded-full bg-primary-600 text-white hover:bg-primary-700 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </button>
      </div>
    </form>
  );
}
