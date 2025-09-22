'use client';

import { useState, useEffect } from 'react';
import { Resource } from '@/types';
import ResourceCard from '@/components/resources/resource-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Grid, List, BookOpen } from 'lucide-react';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/resources?limit=100');
        const data = await response.json();
        
        // Filter to only show bookmarked resources
        const bookmarkedResources = data.resources.filter(
          (resource: Resource) => resource.isBookmarked
        );
        
        setBookmarks(bookmarkedResources);
        
        // Extract unique categories - Fix the type issue here
        const allCategories = bookmarkedResources.flatMap(
          (resource: Resource) => resource.categories
        ) as string[];
        const uniqueCategories = [...new Set(allCategories)];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching bookmarks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, []);

  const filteredBookmarks = bookmarks.filter((bookmark) => {
    const matchesSearch =
      searchQuery === '' ||
      bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory =
      selectedCategory === 'all' || bookmark.categories.includes(selectedCategory);
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Bookmarked Resources</h1>
          </div>
          <p className="text-gray-600">
            Resources you&apos;ve saved for later reference
          </p>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Filters & Search</span>
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
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search bookmarked resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedCategory('all')}
              >
                All ({bookmarks.length})
              </Badge>
              {categories.map((category) => {
                const count = bookmarks.filter((bookmark) =>
                  bookmark.categories.includes(category)
                ).length;
                return (
                  <Badge
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category} ({count})
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : bookmarks.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <BookOpen className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No bookmarks yet
              </h3>
              <p className="text-gray-500 mb-6">
                Save resources by clicking the bookmark icon on any resource
              </p>
              <Button onClick={() => window.location.href = '/dashboard/resources'}>
                Browse Resources
              </Button>
            </CardContent>
          </Card>
        ) : filteredBookmarks.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No matching bookmarks
              </h3>
              <p className="text-gray-500 mb-6">
                Try adjusting your search or filter criteria
              </p>
              <Button variant="outline" onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }
          >
            {filteredBookmarks.map((bookmark) => (
              <ResourceCard
                key={bookmark.id}
                resource={bookmark}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}