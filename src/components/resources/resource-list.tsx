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
}

export default function ResourceList({
  selectedCategory,
  selectedType,
  selectedLanguage,
  searchQuery,
  sortBy,
  sortOrder,
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
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Error Loading Resources
        </h3>
        <p className="text-gray-500 mb-6">
          {error}
        </p>
        <Button onClick={() => fetchResources(1)}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-gray-600">
          {resources.length} {resources.length === 1 ? 'resource' : 'resources'} found
        </p>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {loading && resources.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : resources.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg
              className="mx-auto h-12 w-12"
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No resources found
          </h3>
          <p className="text-gray-500 mb-4">
            Try adjusting your filters or search terms
          </p>
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
                className="w-full sm:w-auto"
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