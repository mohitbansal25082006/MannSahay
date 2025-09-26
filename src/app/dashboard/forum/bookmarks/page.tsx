'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Bookmark,
  MessageCircle,
  Heart,
  Eye,
  Calendar,
  User,
  ArrowLeft,
  BookOpen,
  Grid,
  List,
  Filter,
  Trash2,
  MoreHorizontal,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { toast } from 'sonner';

interface BookmarkPost {
  id: string;
  title?: string;
  content: string;
  isAnonymous: boolean;
  flagged: boolean;
  riskLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
  category: string;
  views: number;
  createdAt: string;
  author: {
    id: string;
    name?: string;
    image?: string;
    hashedId?: string;
  };
  _count: {
    likes: number;
    replies: number;
    bookmarks: number;
  };
  bookmark: {
    createdAt: string;
  };
}

export default function BookmarksPage() {
  const { data: session } = useSession();
  const [bookmarks, setBookmarks] = useState<BookmarkPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedBookmarks, setSelectedBookmarks] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const fetchBookmarks = async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/forum/bookmarks?userId=${session.user.id}`);
      if (response.ok) {
        const data = await response.json();
        setBookmarks(data.bookmarks);
      } else {
        toast.error('Failed to fetch bookmarks');
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      toast.error('Failed to fetch bookmarks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, [session?.user?.id]);

  const handleRemoveBookmark = async (postId: string) => {
    try {
      const response = await fetch('/api/forum/bookmark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId }),
      });

      if (response.ok) {
        setBookmarks((prev) => prev.filter((post) => post.id !== postId));
        toast.success('Bookmark removed');
      } else {
        toast.error('Failed to remove bookmark');
      }
    } catch (error) {
      console.error('Error removing bookmark:', error);
      toast.error('Failed to remove bookmark');
    }
  };

  const handleBulkRemove = async () => {
    if (selectedBookmarks.length === 0) return;

    if (!confirm(`Are you sure you want to remove ${selectedBookmarks.length} bookmarks?`)) return;

    try {
      const promises = selectedBookmarks.map((postId) =>
        fetch('/api/forum/bookmark', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ postId }),
        }),
      );

      await Promise.all(promises);

      setBookmarks((prev) => prev.filter((post) => !selectedBookmarks.includes(post.id)));
      setSelectedBookmarks([]);
      setShowBulkActions(false);
      toast.success(`${selectedBookmarks.length} bookmarks removed`);
    } catch (error) {
      console.error('Error removing bookmarks:', error);
      toast.error('Failed to remove bookmarks');
    }
  };

  const handleSelectAll = () => {
    if (selectedBookmarks.length === filteredBookmarks.length) {
      setSelectedBookmarks([]);
    } else {
      setSelectedBookmarks(filteredBookmarks.map((post) => post.id));
    }
  };

  const handleSortChange = (value: 'newest' | 'oldest') => {
    setSortBy(value);
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'relationships':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'mental-health':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'lifestyle':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredBookmarks = bookmarks
    .filter((post) => {
      if (!searchTerm) return true;

      const searchLower = searchTerm.toLowerCase();
      return (
        post.title?.toLowerCase().includes(searchLower) ||
        post.content.toLowerCase().includes(searchLower) ||
        post.category.toLowerCase().includes(searchLower)
      );
    })
    .filter((post) => {
      if (category === 'all') return true;
      return post.category === category;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.bookmark.createdAt).getTime() - new Date(a.bookmark.createdAt).getTime();
      } else {
        return new Date(a.bookmark.createdAt).getTime() - new Date(b.bookmark.createdAt).getTime();
      }
    });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'general', label: 'General' },
    { value: 'academic', label: 'Academic Stress' },
    { value: 'relationships', label: 'Relationships' },
    { value: 'mental-health', label: 'Mental Health' },
    { value: 'lifestyle', label: 'Lifestyle' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 md:py-8">
        {loading ? (
          <div className="animate-pulse space-y-4">
            {/* Mobile Header Loading */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            {/* Loading Cards */}
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm p-4">
                  <div className="space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-4">
                        <div className="h-4 bg-gray-200 rounded w-8"></div>
                        <div className="h-4 bg-gray-200 rounded w-8"></div>
                        <div className="h-4 bg-gray-200 rounded w-8"></div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Header Section */}
            <div className="mb-6 sm:mb-8 md:mb-12">
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg">
                {/* Mobile Header */}
                <div className="flex flex-col space-y-4 lg:hidden">
                  <Link href="/dashboard/forum">
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600 self-start p-2">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                  </Link>
                  <div className="flex items-start space-x-3">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-lg">
                      <Bookmark className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                        Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700">Bookmarks</span>
                      </h1>
                      <p className="text-sm text-gray-600 mt-1">
                        Saved posts for later
                      </p>
                    </div>
                  </div>
                </div>

                {/* Desktop Header */}
                <div className="hidden lg:block">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center space-x-4">
                      <Link href="/dashboard/forum">
                        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600">
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Back to Forum
                        </Button>
                      </Link>
                      <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center">
                          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-lg mr-3">
                            <Bookmark className="h-6 w-6 text-white" />
                          </div>
                          Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700">Bookmarks</span>
                        </h1>
                        <p className="text-gray-600 mt-1 max-w-2xl">
                          Posts you&apos;ve saved for later reference
                        </p>
                      </div>
                    </div>

                    {selectedBookmarks.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleBulkRemove}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove Selected ({selectedBookmarks.length})
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedBookmarks([]);
                            setShowBulkActions(false);
                          }}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile Selected Actions */}
                {selectedBookmarks.length > 0 && (
                  <div className="lg:hidden mt-4 flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkRemove}
                      className="text-red-600 border-red-300 hover:bg-red-50 flex-1"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove ({selectedBookmarks.length})
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedBookmarks([]);
                        setShowBulkActions(false);
                      }}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Cancel
                    </Button>
                  </div>
                )}

                <div className="mt-4 h-1 w-16 sm:w-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
              </div>
            </div>

            {bookmarks.length === 0 ? (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-6 sm:p-8 md:p-12 text-center border border-gray-100">
                <CardContent className="pt-0">
                  <div className="bg-gradient-to-r from-blue-100 to-indigo-100 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <Bookmark className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">No bookmarks yet</h3>
                  <p className="text-gray-500 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base lg:text-lg">
                    Save posts that you find interesting or helpful by clicking the bookmark icon on any post.
                  </p>
                  <Link href="/dashboard/forum">
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-md hover:shadow-lg transition-all duration-300 w-full sm:w-auto">
                      Browse Forum
                    </Button>
                  </Link>
                </CardContent>
              </div>
            ) : (
              <>
                {/* Search and Filters */}
                <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4 sm:p-6 mb-4 sm:mb-6 border border-blue-100">
                  <CardContent className="pt-0">
                    {/* Mobile Filters */}
                    <div className="space-y-4 lg:hidden">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Search bookmarks..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Select value={category} onValueChange={setCategory}>
                          <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select value={sortBy} onValueChange={handleSortChange}>
                          <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Sort" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="newest">Newest</SelectItem>
                            <SelectItem value="oldest">Oldest</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowBulkActions(!showBulkActions)}
                        className="w-full flex items-center justify-center border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        <Filter className="h-4 w-4 mr-2" />
                        {showBulkActions ? 'Cancel Selection' : 'Select Multiple'}
                      </Button>
                    </div>

                    {/* Desktop Filters */}
                    <div className="hidden lg:flex lg:flex-col lg:gap-4">
                      <div className="flex gap-4">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            placeholder="Search bookmarks..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>

                        <Select value={category} onValueChange={setCategory}>
                          <SelectTrigger className="w-[180px] border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select value={sortBy} onValueChange={handleSortChange}>
                          <SelectTrigger className="w-[160px] border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="newest">Newest First</SelectItem>
                            <SelectItem value="oldest">Oldest First</SelectItem>
                          </SelectContent>
                        </Select>

                        {/* Grid/List toggle - Desktop only */}
                        <div className="flex border rounded-md overflow-hidden">
                          <Button
                            variant={viewMode === 'list' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('list')}
                            className="rounded-r-none"
                          >
                            <List className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={viewMode === 'grid' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('grid')}
                            className="rounded-l-none"
                          >
                            <Grid className="h-4 w-4" />
                          </Button>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowBulkActions(!showBulkActions)}
                          className="flex items-center border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          <Filter className="h-4 w-4 mr-2" />
                          Select
                        </Button>
                      </div>
                    </div>

                    {/* Bulk Actions Bar */}
                    {showBulkActions && (
                      <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 bg-blue-50 rounded-md border border-blue-100">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSelectAll}
                          className="text-sm border-blue-300 text-blue-700 hover:bg-blue-100 w-full sm:w-auto"
                        >
                          {selectedBookmarks.length === filteredBookmarks.length
                            ? 'Deselect All'
                            : 'Select All'}
                        </Button>
                        <span className="text-sm text-gray-600">
                          {selectedBookmarks.length} of {filteredBookmarks.length} selected
                        </span>
                      </div>
                    )}
                  </CardContent>
                </div>

                {/* Bookmarks Grid/List */}
                {filteredBookmarks.length > 0 ? (
                  <div className={`
                    ${viewMode === 'grid' && window.innerWidth >= 1024 
                      ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' 
                      : 'space-y-4 sm:space-y-6'
                    }
                  `}>
                    {filteredBookmarks.map((post) => (
                      <div key={post.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 relative overflow-hidden">
                        {showBulkActions && (
                          <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-10">
                            <input
                              type="checkbox"
                              checked={selectedBookmarks.includes(post.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedBookmarks((prev) => [...prev, post.id]);
                                } else {
                                  setSelectedBookmarks((prev) => prev.filter((id) => id !== post.id));
                                }
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </div>
                        )}

                        <CardHeader className="pb-3 p-4 sm:p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-2 sm:space-x-3 flex-1 min-w-0 pr-2">
                              <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-1.5 sm:p-2 rounded-full flex-shrink-0">
                                <Bookmark className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                                  <span className="font-medium text-xs sm:text-sm text-gray-900 truncate">
                                    {post.isAnonymous ? 'Anonymous' : post.author.name || 'User'}
                                  </span>
                                  <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                                    {post.flagged && (
                                      <Badge variant="destructive" className="text-xs bg-red-100 text-red-800 border-red-200">
                                        Flagged
                                      </Badge>
                                    )}
                                    <Badge className={`text-xs ${getRiskColor(post.riskLevel)}`}>
                                      {post.riskLevel}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs text-gray-500">
                                  <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                                    Saved {formatDistanceToNow(new Date(post.bookmark.createdAt), { addSuffix: true })}
                                  </span>
                                  <span className="hidden sm:inline">•</span>
                                  <span className="flex items-center">
                                    <Eye className="h-3 w-3 mr-1" />
                                    {post.views}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                              <Badge className={`text-xs ${getCategoryColor(post.category)}`}>
                                {post.category}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveBookmark(post.id)}
                                className="text-gray-500 hover:text-red-500 p-1"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="pt-0 p-4 sm:p-6">
                          <Link href={`/dashboard/forum/post/${post.id}`}>
                            <div className="cursor-pointer">
                              {post.title && (
                                <h3 className="font-semibold text-base sm:text-lg mb-2 text-gray-900 hover:text-blue-600 transition-colors line-clamp-2">
                                  {post.title}
                                </h3>
                              )}
                              <p className="text-gray-700 mb-4 line-clamp-3 bg-gray-50 p-3 rounded-lg text-sm sm:text-base">
                                {post.content}
                              </p>
                            </div>
                          </Link>

                          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            <div className="flex items-center space-x-3 sm:space-x-4">
                              <div className="flex items-center space-x-1 text-gray-500">
                                <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="text-xs sm:text-sm">{post._count.likes}</span>
                              </div>

                              <Link href={`/dashboard/forum/post/${post.id}`}>
                                <div className="flex items-center space-x-1 text-gray-500 hover:text-blue-500">
                                  <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                                  <span className="text-xs sm:text-sm">{post._count.replies}</span>
                                </div>
                              </Link>

                              <div className="flex items-center space-x-1 text-blue-500">
                                <Bookmark className="h-3 w-3 sm:h-4 sm:w-4 fill-current" />
                                <span className="text-xs sm:text-sm">{post._count.bookmarks}</span>
                              </div>
                            </div>

                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar className="h-3 w-3 mr-1" />
                              <span className="hidden sm:inline">
                                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                              </span>
                              <span className="sm:hidden">
                                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }).split(' ').slice(0, 2).join(' ')}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 md:p-12 text-center border border-gray-100">
                    <CardContent className="pt-0">
                      <div className="py-6">
                        <div className="bg-gradient-to-r from-gray-100 to-gray-200 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                          <Search className="h-8 w-8 sm:h-10 sm:w-10 text-gray-500" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">No bookmarks found</h3>
                        <p className="text-gray-500 mb-4 sm:mb-6 max-w-md mx-auto text-sm sm:text-base lg:text-lg">
                          {searchTerm || category !== 'all' || sortBy !== 'newest'
                            ? 'Try adjusting your search or filters'
                            : 'Your bookmarks will appear here'}
                        </p>
                        <Button
                          onClick={() => {
                            setSearchTerm('');
                            setCategory('all');
                            setSortBy('newest');
                          }}
                          className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-md hover:shadow-lg transition-all duration-300 w-full sm:w-auto"
                        >
                          Clear Filters
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      <style jsx global>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Mobile optimizations */
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
        }
        
        /* Desktop grid view adjustments */
        @media (min-width: 1024px) {
          .grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>
    </div>
  );
}