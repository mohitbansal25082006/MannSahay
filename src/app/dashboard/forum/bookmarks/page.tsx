// E:\mannsahay\src\app\dashboard\forum\bookmarks\page.tsx

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
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic':
        return 'bg-purple-100 text-purple-800';
      case 'relationships':
        return 'bg-pink-100 text-pink-800';
      case 'mental-health':
        return 'bg-green-100 text-green-800';
      case 'lifestyle':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 forum-gradient min-h-screen">
      {loading ? (
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="forum-card">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                  </div>
                </CardContent>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="mb-8 fade-in">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-4">
                  <Link href="/dashboard/forum">
                    <Button variant="ghost" size="sm">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Forum
                    </Button>
                  </Link>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                      <Bookmark className="h-8 w-8 mr-3 text-blue-600" />
                      Your Bookmarks
                    </h1>
                    <p className="text-gray-600 mt-1">
                      Posts you've saved for later reference
                    </p>
                  </div>
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
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>

          {bookmarks.length === 0 ? (
            <div className="forum-card card-hover text-center py-16">
              <CardContent>
                <Bookmark className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookmarks yet</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Save posts that you find interesting or helpful by clicking the bookmark icon on any post.
                </p>
                <Link href="/dashboard/forum">
                  <Button>Browse Forum</Button>
                </Link>
              </CardContent>
            </div>
          ) : (
            <>
              {/* Search and Filters */}
              <div className="forum-card card-hover mb-6">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"
                      />
                      <Input
                        placeholder="Search bookmarks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="w-full sm:w-[180px]">
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
                      <SelectTrigger className="w-full sm:w-[160px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex border rounded-md">
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
                      className="flex items-center"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Select
                    </Button>
                  </div>

                  {showBulkActions && (
                    <div className="mt-4 flex items-center space-x-4 p-3 bg-gray-50 rounded-md">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAll}
                        className="text-sm"
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
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
                  {filteredBookmarks.map((post) => (
                    <div key={post.id} className="forum-card card-hover fade-in relative">
                      {showBulkActions && (
                        <div className="absolute top-4 left-4 z-10">
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

                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="bg-blue-100 p-2 rounded-full">
                              <Bookmark className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-sm">
                                  {post.isAnonymous ? 'Anonymous' : post.author.name || 'User'}
                                </span>
                                {post.flagged && (
                                  <Badge variant="destructive" className="text-xs">
                                    Flagged
                                  </Badge>
                                )}
                                <Badge className={`text-xs ${getRiskColor(post.riskLevel)}`}>
                                  {post.riskLevel}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <span>
                                  Bookmarked {formatDistanceToNow(new Date(post.bookmark.createdAt), { addSuffix: true })}
                                </span>
                                <span>•</span>
                                <span className="flex items-center">
                                  <Eye className="h-3 w-3 mr-1" />
                                  {post.views}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Badge className={`text-xs ${getCategoryColor(post.category)}`}>{post.category}</Badge>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveBookmark(post.id)}
                          className="text-gray-500 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <Link href={`/dashboard/forum/post/${post.id}`}>
                          <div className="cursor-pointer">
                            {post.title && (
                              <h3 className="font-semibold text-lg mb-2 hover:text-blue-600 transition-colors">
                                {post.title}
                              </h3>
                            )}
                            <p className="text-gray-700 mb-4 line-clamp-3">{post.content}</p>
                          </div>
                        </Link>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1 text-gray-500">
                              <Heart className="h-4 w-4" />
                              <span>{post._count.likes}</span>
                            </div>

                            <Link href={`/dashboard/forum/post/${post.id}`}>
                              <div className="flex items-center space-x-1 text-gray-500 hover:text-blue-500">
                                <MessageCircle className="h-4 w-4" />
                                <span>{post._count.replies}</span>
                              </div>
                            </Link>

                            <div className="flex items-center space-x-1 text-blue-500">
                              <Bookmark className="h-4 w-4 fill-current" />
                              <span>{post._count.bookmarks}</span>
                            </div>
                          </div>

                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="forum-card card-hover">
                  <CardContent className="pt-6 text-center">
                    <div className="py-12">
                      <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No bookmarks found</h3>
                      <p className="text-gray-500 mb-4">
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
  );
}