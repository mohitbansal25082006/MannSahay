'use client';

import { useState, useEffect } from 'react';
import { Resource } from '@/types';
import ResourceCard from '@/components/resources/resource-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Grid, List, BookOpen, Filter, X } from 'lucide-react';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [categories, setCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

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

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
  };

  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'all';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-6 md:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-12">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700">Bookmarked Resources</span>
              </h1>
            </div>
            <p className="text-gray-600 max-w-2xl">
              Resources you&apos;ve saved for later reference
            </p>
            <div className="mt-6 h-1 w-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
          </div>
        </div>
        
        <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 mb-6 border border-blue-100 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 pb-4">
            <CardTitle className="flex items-center justify-between text-lg md:text-xl font-bold text-gray-900">
              <div className="flex items-center">
                <Filter className="h-5 w-5 mr-2 text-blue-600" />
                Filters & Search
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </CardTitle>
          </CardHeader>
          {showFilters && (
            <CardContent className="p-4 md:p-6 bg-blue-50">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search bookmarked resources..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm font-medium text-gray-700">Categories:</span>
                  <Badge
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    className="cursor-pointer transition-colors"
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
                        className="cursor-pointer transition-colors"
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category} ({count})
                      </Badge>
                    );
                  })}
                </div>
                
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="border-red-200 text-red-700 hover:bg-red-50 flex items-center"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardContent>
          )}
        </Card>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Your Bookmarks</h2>
          </div>
          
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
        
        {loading ? (
          <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
              <p className="text-gray-600">Loading your bookmarks...</p>
            </div>
          </div>
        ) : bookmarks.length === 0 ? (
          <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border border-blue-100 overflow-hidden">
            <CardContent className="text-center py-12">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-2">
                No bookmarks yet
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Save resources by clicking the bookmark icon on any resource
              </p>
              <Button 
                onClick={() => window.location.href = '/dashboard/resources'}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white"
              >
                Browse Resources
              </Button>
            </CardContent>
          </Card>
        ) : filteredBookmarks.length === 0 ? (
          <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border border-blue-100 overflow-hidden">
            <CardContent className="text-center py-12">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-2">
                No matching bookmarks
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Try adjusting your search or filter criteria
              </p>
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-gray-600">
                <span className="font-medium">{filteredBookmarks.length}</span> {filteredBookmarks.length === 1 ? 'bookmark' : 'bookmarks'} found
              </p>
              <p className="text-sm text-gray-500">
                {selectedCategory === 'all' ? 'All categories' : selectedCategory}
              </p>
            </div>
            
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
          </>
        )}
      </div>
    </div>
  );
}