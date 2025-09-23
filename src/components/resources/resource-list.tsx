'use client';

import { useState, useEffect } from 'react';
import { Resource, ResourceType } from '@/types';
import ResourceCard from './resource-card';
import { Button } from '@/components/ui/button';
import { Loader2, Grid, List } from 'lucide-react';

interface ResourceListProps {
  selectedCategory: string;
  selectedType: ResourceType | 'all';
  selectedLanguage: string;
  searchQuery: string;
  sortBy: string;
  sortOrder: string;
  setSelectedCategory: (category: string) => void;
  setSelectedType: (type: ResourceType | 'all') => void;
  setSelectedLanguage: (language: string) => void;
  setSearchQuery: (query: string) => void;
}

export default function ResourceList({
  selectedCategory,
  selectedType,
  selectedLanguage,
  searchQuery,
  sortBy,
  sortOrder,
  setSelectedCategory,
  setSelectedType,
  setSelectedLanguage,
  setSearchQuery,
}: ResourceListProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fetchResources = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '12',
        category: selectedCategory,
        type: selectedType,
        language: selectedLanguage,
        search: searchQuery,
        sortBy,
        sortOrder,
      });
      
      const response = await fetch(`/api/resources?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch resources');
      }
      
      const data = await response.json();
      
      if (pageNum === 1) {
        setResources(data.resources || []);
      } else {
        setResources((prev) => [...prev, ...(data.resources || [])]);
      }
      
      // Make sure pagination data exists before accessing it
      if (data.pagination) {
        setHasMore(pageNum < data.pagination.pages);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch resources');
      setResources([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchResources(1);
  }, [selectedCategory, selectedType, selectedLanguage, searchQuery, sortBy, sortOrder]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchResources(nextPage);
  };

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 md:p-12 text-center border border-red-100">
        <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-2">
          Error Loading Resources
        </h3>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          {error}
        </p>
        <Button onClick={() => fetchResources(1)} className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <p className="text-gray-600">
          <span className="font-medium">{resources.length}</span> {resources.length === 1 ? 'resource' : 'resources'} found
        </p>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="border-gray-300"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="border-gray-300"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {loading && resources.length === 0 ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm border border-gray-100">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : resources.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 md:p-12 text-center border border-gray-100">
          <div className="text-gray-300 mb-6">
            <svg
              className="mx-auto h-16 w-16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-2">
            No resources found
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Try adjusting your filters or search terms
          </p>
          <Button 
            onClick={() => {
              setSelectedCategory('all');
              setSelectedType('all');
              setSelectedLanguage('all');
              setSearchQuery('');
            }}
            className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white"
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <>
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }
          >
            {resources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                viewMode={viewMode}
                showAiScore={true}
              />
            ))}
          </div>
          
          {hasMore && (
            <div className="flex justify-center mt-8">
              <Button
                onClick={loadMore}
                disabled={loading}
                variant="outline"
                className="w-full sm:w-auto border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}