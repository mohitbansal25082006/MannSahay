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
  Filter, 
  Plus,
  Grid,
  List,
  TrendingUp,
  Clock,
  Users,
  BookOpen,
  User,
  MessageSquare,
  Heart,
  ArrowUpRight
} from 'lucide-react';
import CreatePostForm from '@/components/forum/create-post-form';
import PostItem from '@/components/forum/post-item';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import Link from 'next/link';
import DebugSession from '@/components/debug-session';

interface Post {
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
}

interface ForumStats {
  totalPosts: number;
  activeUsers: number;
  todaysPosts: number;
  postsByCategory: {
    category: string;
    _count: {
      category: number;
    };
  }[];
  mostActiveUsers: {
    id: string;
    name?: string;
    image?: string;
    _count: {
      posts: number;
    };
  }[];
  trendingPosts: Post[];
}

export default function ForumPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [forumStats, setForumStats] = useState<ForumStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('latest');
  const [viewMode, setViewMode] = useState('list');
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Record<string, boolean>>({});

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '20',
        category,
        sort,
      });

      const response = await fetch(`/api/forum/posts?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
      } else {
        toast.error('Failed to fetch posts');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const fetchForumStats = async () => {
    setStatsLoading(true);
    try {
      const response = await fetch('/api/forum/stats');
      if (response.ok) {
        const data = await response.json();
        setForumStats(data);
      } else {
        toast.error('Failed to fetch forum statistics');
      }
    } catch (error) {
      console.error('Error fetching forum stats:', error);
      toast.error('Failed to fetch forum statistics');
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchForumStats();
  }, [category, sort]);

  const handleLike = async (postId: string) => {
    try {
      const response = await fetch('/api/forum/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId }),
      });

      if (response.ok) {
        const data = await response.json();
        setLikedPosts(prev => ({ ...prev, [postId]: data.liked }));
        
        // Update post like count
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                _count: { 
                  ...post._count, 
                  likes: data.liked 
                    ? post._count.likes + 1 
                    : post._count.likes - 1 
                } 
              } 
            : post
        ));
      } else {
        toast.error('Failed to like post');
      }
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Failed to like post');
    }
  };

  const handleBookmark = async (postId: string) => {
    try {
      const response = await fetch('/api/forum/bookmark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId }),
      });

      if (response.ok) {
        const data = await response.json();
        setBookmarkedPosts(prev => ({ ...prev, [postId]: data.bookmarked }));
        toast.success(data.bookmarked ? 'Post bookmarked' : 'Bookmark removed');
      } else {
        toast.error('Failed to bookmark post');
      }
    } catch (error) {
      console.error('Error bookmarking post:', error);
      toast.error('Failed to bookmark post');
    }
  };

  const handleFlag = async (postId: string) => {
    const reason = prompt('Please provide a reason for flagging this post:');
    if (!reason) return;

    try {
      const response = await fetch('/api/forum/flag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId, reason }),
      });

      if (response.ok) {
        toast.success('Post has been flagged for review');
      } else {
        toast.error('Failed to flag post');
      }
    } catch (error) {
      console.error('Error flagging post:', error);
      toast.error('Failed to flag post');
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`/api/forum/posts/${postId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPosts(prev => prev.filter(post => post.id !== postId));
        toast.success('Post deleted successfully');
        // Refresh stats after deletion
        fetchForumStats();
      } else {
        toast.error('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const filteredPosts = posts.filter(post => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      post.title?.toLowerCase().includes(searchLower) ||
      post.content.toLowerCase().includes(searchLower) ||
      post.category.toLowerCase().includes(searchLower)
    );
  });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'general', label: 'General' },
    { value: 'academic', label: 'Academic Stress' },
    { value: 'relationships', label: 'Relationships' },
    { value: 'mental-health', label: 'Mental Health' },
    { value: 'lifestyle', label: 'Lifestyle' },
  ];

  const sortOptions = [
    { value: 'latest', label: 'Latest' },
    { value: 'popular', label: 'Most Liked' },
    { value: 'discussed', label: 'Most Discussed' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Peer Support Forum
        </h1>
        <p className="text-gray-600">
          Connect with fellow students in a safe, anonymous environment
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Create Post Form */}
          <CreatePostForm onPostCreated={() => {
            fetchPosts();
            fetchForumStats();
          }} />

          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search posts..."
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
                
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="w-full sm:w-[160px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
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
              </div>
            </CardContent>
          </Card>

          {/* Posts List */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
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
                </Card>
              ))}
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
              {filteredPosts.map((post) => (
                <PostItem
                  key={post.id}
                  post={post}
                  currentUserId={session?.user?.id}
                  isLiked={likedPosts[post.id]}
                  isBookmarked={bookmarkedPosts[post.id]}
                  onLike={() => handleLike(post.id)}
                  onBookmark={() => handleBookmark(post.id)}
                  onFlag={() => handleFlag(post.id)}
                  onDelete={() => handleDelete(post.id)}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="py-12">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No posts found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || category !== 'all'
                      ? 'Try adjusting your search or filters'
                      : 'Be the first to share your thoughts'}
                  </p>
                  <Button onClick={() => {
                    setSearchTerm('');
                    setCategory('all');
                  }}>
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Forum Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Forum Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : forumStats ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Posts</span>
                    <Badge variant="secondary">{forumStats.totalPosts}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Active Users</span>
                    <Badge variant="secondary">{forumStats.activeUsers}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Today's Posts</span>
                    <Badge variant="secondary">{forumStats.todaysPosts}</Badge>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Failed to load statistics</p>
              )}
            </CardContent>
          </Card>

          {/* Trending Posts */}
          {forumStats?.trendingPosts && forumStats.trendingPosts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Trending Posts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {forumStats.trendingPosts.map((post) => (
                    <div key={post.id} className="pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                      <Link href={`/dashboard/forum/post/${post.id}`} className="block">
                        <h4 className="font-medium text-sm mb-1 line-clamp-2">
                          {post.title || post.content.substring(0, 60) + '...'}
                        </h4>
                        <div className="flex items-center text-xs text-gray-500">
                          <div className="flex items-center mr-3">
                            <Heart className="h-3 w-3 mr-1" />
                            {post._count.likes}
                          </div>
                          <div className="flex items-center">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            {post._count.replies}
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Popular Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Popular Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : forumStats?.postsByCategory ? (
                <div className="space-y-3">
                  {forumStats.postsByCategory.map((cat) => (
                    <div
                      key={cat.category}
                      className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-md"
                      onClick={() => setCategory(cat.category)}
                    >
                      <span className="text-sm capitalize">
                        {cat.category.replace('-', ' ')}
                      </span>
                      <Badge 
                        variant={category === cat.category ? "default" : "outline"}
                        className="text-xs"
                      >
                        {cat._count.category}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Failed to load categories</p>
              )}
            </CardContent>
          </Card>

          {/* Most Active Users */}
          {forumStats?.mostActiveUsers && forumStats.mostActiveUsers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Most Active Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {forumStats.mostActiveUsers.map((user, index) => (
                    <div key={user.id} className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {index + 1}
                        </div>
                        <div className="bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center">
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {user.name || 'Anonymous User'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {user._count.posts} {user._count.posts === 1 ? 'post' : 'posts'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Community Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle>Community Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Be respectful and supportive
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Protect everyone's privacy
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Share responsibly
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">✗</span>
                  No harassment or hate speech
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">✗</span>
                  No sharing of personal information
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}