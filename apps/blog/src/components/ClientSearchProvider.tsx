'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SearchBar from '@/components/SearchBar';

interface ClientSearchProviderProps {
  initialSearch?: string;
}

export function ClientSearchProvider({ initialSearch = '' }: ClientSearchProviderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    const params = new URLSearchParams(searchParams.toString());
    
    if (query) {
      params.set('search', query);
    } else {
      params.delete('search');
    }
    
    // 重置页码
    params.delete('page');
    
    router.push(`/blog?${params.toString()}`);
  };
  
  return (
    <SearchBar 
      onSearch={handleSearch} 
      initialValue={searchQuery} 
      placeholder="搜索文章..." 
    />
  );
}
