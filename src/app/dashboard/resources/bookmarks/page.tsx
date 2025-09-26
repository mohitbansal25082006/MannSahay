'use client';

import { useState, useEffect } from 'react';
import { Resource } from '@/types';
import ResourceCard from '@/components/resources/resource-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Grid, List, BookOpen, Filter, X, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 md:py-8">
        
        {/* Header Section */}
        <div className="mb-6 sm:mb-8 md:mb-12">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg">
            
            {/* Mobile Header */}
            <div className="flex flex-col space-y-4 lg:hidden">
              <Link href="/dashboard/resources">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600 self-start p-2">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700">
                      Bookmarked Resources
                    </span>
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Saved resources for later
                  </p>
                </div>
              </div>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:block">
              <div className="flex items-start justify-between mb-4">
                <Link href="/dashboard/resources">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Resources
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700">
                    Bookmarked Resources
                  </span>
                </h1>
              </div>
              <p className="text-gray-600 max-w-2xl">
                Resources you&apos;ve saved for later reference
              </p>
            </div>

            <div className="mt-4 sm:mt-6 h-1 w-16 sm:w-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
          </div>
        </div>
        
        {/* Filters Card */}
        <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 mb-4 sm:mb-6 border border-blue-100 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 pb-3 sm:pb-4 p-4 sm:p-6">
            <CardTitle className="flex items-center justify-between text-base sm:text-lg md:text-xl font-bold text-gray-900">
              <div className="flex items-center">
                <Filter className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" />
                Filters & Search
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="border-blue-200 text-blue-700 hover:bg-blue-50 text-xs sm:text-sm"
              >
                {showFilters ? 'Hide' : 'Show'}
              </Button>
            </CardTitle>
          </CardHeader>
          
          {showFilters && (
            <CardContent className="p-4 sm:p-6 bg-blue-50">
              <div className="space-y-4">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search bookmarked resources..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                {/* Categories */}
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-700">Categories:</span>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant={selectedCategory === 'all' ? 'default' : 'outline'}
                      className="cursor-pointer transition-colors text-xs sm:text-sm"
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
                          className="cursor-pointer transition-colors text-xs sm:text-sm"
                          onClick={() => setSelectedCategory(category)}
                        >
                          {category} ({count})
                        </Badge>
                      );
                    })}
                  </div>
                </div>
                
                {/* Clear Filters */}
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="border-red-200 text-red-700 hover:bg-red-50 flex items-center w-full sm:w-auto"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardContent>
          )}
        </Card>
        
        {/* View Mode Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-1.5 sm:p-2 rounded-lg">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Your Bookmarks</h2>
          </div>
          
          {/* Grid/List Toggle - Hidden on mobile */}
          <div className="hidden lg:flex items-center gap-2">
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
        
        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-48 sm:h-64 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="text-center">
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-blue-600 mx-auto mb-3" />
              <p className="text-gray-600 text-sm sm:text-base">Loading your bookmarks...</p>
            </div>
          </div>
        
        /* No Bookmarks State */
        ) : bookmarks.length === 0 ? (
          <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border border-blue-100 overflow-hidden">
            <CardContent className="text-center py-8 sm:py-12 p-4 sm:p-6">
              <div className="bg-blue-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-medium text-gray-900 mb-2">
                No bookmarks yet
              </h3>
              <p className="text-gray-500 mb-4 sm:mb-6 max-w-md mx-auto text-sm sm:text-base">
                Save resources by clicking the bookmark icon on any resource
              </p>
              <Button 
                onClick={() => window.location.href = '/dashboard/resources'}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white w-full sm:w-auto"
              >
                Browse Resources
              </Button>
            </CardContent>
          </Card>
        
        /* No Filtered Results */
        ) : filteredBookmarks.length === 0 ? (
          <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border border-blue-100 overflow-hidden">
            <CardContent className="text-center py-8 sm:py-12 p-4 sm:p-6">
              <div className="bg-gray-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-6 w-6 sm:h-8 sm:w-8 text-gray-500" />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-medium text-gray-900 mb-2">
                No matching bookmarks
              </h3>
              <p className="text-gray-500 mb-4 sm:mb-6 max-w-md mx-auto text-sm sm:text-base">
                Try adjusting your search or filter criteria
              </p>
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="border-blue-200 text-blue-700 hover:bg-blue-50 w-full sm:w-auto"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        
        /* Bookmarks Results */
        ) : (
          <>
            {/* Results Summary */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2 sm:gap-4 bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
              <p className="text-gray-600 text-sm sm:text-base">
                <span className="font-medium">{filteredBookmarks.length}</span>{' '}
                {filteredBookmarks.length === 1 ? 'bookmark' : 'bookmarks'} found
              </p>
              <p className="text-xs sm:text-sm text-gray-500">
                {selectedCategory === 'all' ? 'All categories' : selectedCategory}
              </p>
            </div>
            
            {/* Bookmarks Grid/List */}
            <div className={`
              ${viewMode === 'grid' && typeof window !== 'undefined' && window.innerWidth >= 1024
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6' 
                : 'space-y-4 sm:space-y-6'
              }
            `}>
              {filteredBookmarks.map((bookmark) => (
                <div 
                  key={bookmark.id}
                  className="transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                >
                  <ResourceCard
                    resource={bookmark}
                    viewMode={typeof window !== 'undefined' && window.innerWidth < 1024 ? 'list' : viewMode}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        /* Mobile-first responsive utilities */
        @media (max-width: 640px) {
          .min-w-0 {
            min-width: 0;
          }
          
          .truncate {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
        
        /* Ensure proper spacing on mobile */
        @media (max-width: 768px) {
          .space-y-4 > :not([hidden]) ~ :not([hidden]) {
            margin-top: 1rem;
          }
          
          .space-y-6 > :not([hidden]) ~ :not([hidden]) {
            margin-top: 1rem;
          }
        }
        
        /* Desktop spacing */
        @media (min-width: 768px) {
          .space-y-6 > :not([hidden]) ~ :not([hidden]) {
            margin-top: 1.5rem;
          }
        }
        
        /* Grid responsiveness */
        @media (min-width: 1024px) {
          .lg\\:grid-cols-3 {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
        
        @media (min-width: 768px) and (max-width: 1023px) {
          .md\\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        
        /* Smooth transitions */
        .transition-all {
          transition-property: all;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 200ms;
        }
        
        /* Loading animation improvements */
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        
        /* Hover effects */
        .hover\\:scale-\\[1\\.02\\]:hover {
          transform: scale(1.02);
        }
        
        /* Focus states for accessibility */
        .focus\\:ring-blue-500:focus {
          --tw-ring-color: rgb(59 130 246 / 1);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .focus\\:border-blue-500:focus {
          border-color: rgb(59 130 246 / 1);
        }
        
        /* Badge hover effects */
        .cursor-pointer:hover {
          opacity: 0.8;
        }
        
        /* Card hover improvements */
        .hover\\:shadow-lg:hover {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        
        /* Gradient text effects */
        .bg-clip-text {
          background-clip: text;
          -webkit-background-clip: text;
        }
        
        .text-transparent {
          color: transparent;
        }
        
        /* Mobile touch improvements */
        @media (max-width: 768px) {
          button {
            min-height: 44px;
            min-width: 44px;
          }
          
          .cursor-pointer {
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
          }
        }
      `}</style>
    </div>
  );
}