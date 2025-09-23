'use client';

import { useState, useEffect, useCallback } from 'react';
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
  Grid,
  List,
  TrendingUp,
  Clock,
  Users,
  BookOpen,
  MessageSquare,
  Heart,
  Shield,
  Bot,
  CheckCircle,
  XCircle,
  Bookmark,
  Globe
} from 'lucide-react';
import CreatePostForm from '@/components/forum/create-post-form';
import PostItem from '@/components/forum/post-item';
import UserPreferences from '@/components/dashboard/user-preferences';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import Link from 'next/link';

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
  language: string;
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

interface ModerationStats {
  totalPosts: number;
  moderatedPosts: number;
  autoRemovedPosts: number;
  pendingReviewPosts: number;
  totalReplies: number;
  moderatedReplies: number;
  autoRemovedReplies: number;
  pendingReviewReplies: number;
}

function getLanguageName(language: string): string {
  const languageMap: Record<string, string> = {
    en: 'English',
    hi: 'हिन्दी (Hindi)',
    ta: 'தமிழ் (Tamil)',
    bn: 'বাংলা (Bengali)',
    te: 'తెలుగు (Telugu)',
    mr: 'मराठी (Marathi)',
    gu: 'ગુજરાતી (Gujarati)',
    kn: 'ಕನ್ನಡ (Kannada)',
    ml: 'മലയാളം (Malayalam)',
    pa: 'ਪੰਜਾਬੀ (Punjabi)',
  };
  return languageMap[language] || language.toUpperCase();
}

function CommunityGuidelines() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-md overflow-hidden border border-blue-100 transition-all duration-300 hover:shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white pb-4">
        <CardTitle className="flex items-center text-lg md:text-xl">
          <Shield className="h-5 w-5 md:h-6 md:w-6 mr-2" />
          Community Guidelines
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-green-100">
            <h4 className="font-medium text-green-700 mb-2 flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Be Respectful and Supportive
            </h4>
            <p className="text-sm text-gray-600 ml-6">
              Treat everyone with respect and kindness. We&apos;re here to support each other through difficult times.
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-green-100">
            <h4 className="font-medium text-green-700 mb-2 flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Protect Privacy
            </h4>
            <p className="text-sm text-gray-600 ml-6">
              Never share personal information about yourself or others. This includes contact details, addresses, or private conversations.
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-green-100">
            <h4 className="font-medium text-green-700 mb-2 flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Share Responsibly
            </h4>
            <p className="text-sm text-gray-600 ml-6">
              Share accurate information and be mindful of how your words might affect others. If you&apos;re sharing resources, make sure they&apos;re from reliable sources.
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-green-100">
            <h4 className="font-medium text-green-700 mb-2 flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Be Honest and Authentic
            </h4>
            <p className="text-sm text-gray-600 ml-6">
              Share your genuine thoughts and feelings. Authentic conversations help build trust and meaningful connections.
            </p>
          </div>
          
          <div className="pt-2 border-t border-gray-100">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-red-100 mb-3">
              <h4 className="font-medium text-red-700 mb-2 flex items-center">
                <span className="text-red-500 mr-2">✗</span>
                No Harassment or Hate Speech
              </h4>
              <p className="text-sm text-gray-600 ml-6">
                Bullying, harassment, hate speech, or discrimination based on race, gender, religion, or any other characteristic is strictly prohibited.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border border-red-100 mb-3">
              <h4 className="font-medium text-red-700 mb-2 flex items-center">
                <span className="text-red-500 mr-2">✗</span>
                No Self-Harm Promotion
              </h4>
              <p className="text-sm text-gray-600 ml-6">
                While we encourage open discussion about mental health, content that promotes or glorifies self-harm, suicide, or violence is not allowed.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border border-red-100 mb-3">
              <h4 className="font-medium text-red-700 mb-2 flex items-center">
                <span className="text-red-500 mr-2">✗</span>
                No Spam or Misinformation
              </h4>
              <p className="text-sm text-gray-600 ml-6">
                Don&apos;t post spam, advertisements, or false information that could harm others. Always verify information before sharing.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border border-red-100">
              <h4 className="font-medium text-red-700 mb-2 flex items-center">
                <span className="text-red-500 mr-2">✗</span>
                No Explicit Content
              </h4>
              <p className="text-sm text-gray-600 ml-6">
                Explicit, violent, or sexually suggestive content is not appropriate for this supportive community forum.
              </p>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 shadow-sm">
            <h4 className="font-medium text-blue-800 mb-1 flex items-center">
              <Bot className="h-4 w-4 mr-2" />
              AI-Powered Moderation
            </h4>
            <p className="text-sm text-blue-700">
              Our community is monitored by AI to ensure these guidelines are followed. Content that violates these guidelines may be removed automatically, and repeat violations may result in account suspension.
            </p>
          </div>
        </div>
      </CardContent>
    </div>
  );
}

export default function ForumPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [forumStats, setForumStats] = useState<ForumStats | null>(null);
  const [moderationStats, setModerationStats] = useState<ModerationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('latest');
  const [viewMode, setViewMode] = useState('list');
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Record<string, boolean>>({});

  const fetchUserLanguage = useCallback(async () => {
    if (session?.user?.id) {
      try {
        const response = await fetch(`/api/user/preferences?userId=${session.user.id}`);
        if (response.ok) {
          await response.json();
        }
      } catch (error) {
        console.error('Error fetching user language:', error);
      }
    }
  }, [session?.user?.id]);

  const fetchPosts = useCallback(async () => {
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
  }, [category, sort]);

  const fetchForumStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const [forumResponse, moderationResponse] = await Promise.all([
        fetch('/api/forum/stats'),
        fetch('/api/forum/moderation-stats')
      ]);
      
      if (forumResponse.ok) {
        const data = await forumResponse.json();
        setForumStats(data);
      } else {
        toast.error('Failed to fetch forum statistics');
      }
      
      if (moderationResponse.ok) {
        const data = await moderationResponse.json();
        setModerationStats(data);
      } else {
        toast.error('Failed to fetch moderation statistics');
      }
    } catch (error) {
      console.error('Error fetching forum stats:', error);
      toast.error('Failed to fetch forum statistics');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const handleLanguageChange = useCallback((language: string) => {
    fetchPosts();
  }, [fetchPosts]);

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
        const data = await response.json();
        toast.success(data.message);
        
        if (data.actionTaken) {
          fetchPosts();
        }
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
        fetchForumStats();
      } else {
        toast.error('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  useEffect(() => {
    fetchUserLanguage();
    fetchPosts();
    fetchForumStats();
  }, [fetchPosts, fetchForumStats, fetchUserLanguage]);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="mb-8 text-center fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700">
            Peer Support Forum
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-base md:text-lg">
            Connect with fellow students in a safe, anonymous environment
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg border border-blue-100">
              <CreatePostForm onPostCreated={() => {
                fetchPosts();
                fetchForumStats();
              }} />
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 md:p-6 transition-all duration-300 hover:shadow-lg border border-blue-100">
              <CardContent className="pt-0">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search posts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-full sm:w-[180px] border-gray-300 focus:border-blue-500 focus:ring-blue-500">
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
                    <SelectTrigger className="w-full sm:w-[160px] border-gray-300 focus:border-blue-500 focus:ring-blue-500">
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
                  
                  {/* Grid/List toggle - only visible on large screens (laptop and above) */}
                  <div className="hidden lg:flex border rounded-md overflow-hidden">
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
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-md animate-pulse p-6 border border-blue-100">
                    <CardHeader>
                      <div className="h-6 bg-gray-200 rounded w-3/4 skeleton"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded skeleton"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6 skeleton"></div>
                        <div className="h-4 bg-gray-200 rounded w-4/6 skeleton"></div>
                      </div>
                    </CardContent>
                  </div>
                ))}
              </div>
            ) : filteredPosts.length > 0 ? (
              <div className={viewMode === 'grid' && window?.innerWidth >= 1024 ? 'hidden lg:grid lg:grid-cols-1 xl:grid-cols-2 gap-4' : 'space-y-4'}>
                {filteredPosts.map((post) => (
                  <div key={post.id} className="bg-white rounded-xl shadow-md transition-all duration-300 hover:shadow-lg border border-blue-100 fade-in">
                    <PostItem
                      post={post}
                      currentUserId={session?.user?.id}
                      isLiked={likedPosts[post.id]}
                      isBookmarked={bookmarkedPosts[post.id]}
                      onLike={() => handleLike(post.id)}
                      onBookmark={() => handleBookmark(post.id)}
                      onFlag={() => handleFlag(post.id)}
                      onDelete={() => handleDelete(post.id)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-8 text-center transition-all duration-300 hover:shadow-lg border border-blue-100">
                <CardContent className="pt-0">
                  <div className="py-4 md:py-8">
                    <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-2">
                      No posts found
                    </h3>
                    <p className="text-gray-500 mb-4 max-w-md mx-auto">
                      {searchTerm || category !== 'all'
                        ? 'Try adjusting your search or filters'
                        : 'Be the first to share your thoughts'}
                    </p>
                    <Button onClick={() => {
                      setSearchTerm('');
                      setCategory('all');
                    }} className="bg-blue-600 hover:bg-blue-700">
                      Clear Filters
                    </Button>
                  </div>
                </CardContent>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-4 md:p-6 transition-all duration-300 hover:shadow-lg border border-blue-100">
              <CardContent className="pt-0">
                <UserPreferences onLanguageChange={handleLanguageChange} />
              </CardContent>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg border border-blue-100">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white pb-4">
                <CardTitle className="flex items-center text-lg md:text-xl">
                  <TrendingUp className="h-5 w-5 md:h-6 md:w-6 mr-2" />
                  Forum Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
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
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm text-gray-700 font-medium">Total Posts</span>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">{forumStats.totalPosts}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                      <span className="text-sm text-gray-700 font-medium">Active Users</span>
                      <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200">{forumStats.activeUsers}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm text-gray-700 font-medium">Today&apos;s Posts</span>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-200">{forumStats.todaysPosts}</Badge>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Failed to load statistics</p>
                )}
              </CardContent>
            </div>

            {forumStats?.trendingPosts && forumStats.trendingPosts.length > 0 && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg border border-blue-100">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white pb-4">
                  <CardTitle className="flex items-center text-lg md:text-xl">
                    <TrendingUp className="h-5 w-5 md:h-6 md:w-6 mr-2" />
                    Recommended For You
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                  <div className="space-y-3">
                    {forumStats.trendingPosts.map((post) => (
                      <div key={post.id} className="pb-3 border-b border-gray-100 last:border-0 last:pb-0 hover:bg-blue-50 p-2 rounded-md transition-colors">
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
                            <Badge variant="outline" className="ml-2 text-xs flex items-center">
                              <Globe className="h-3 w-3 mr-1" />
                              {getLanguageName(post.language)}
                            </Badge>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </div>
            )}

            {moderationStats && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg border border-blue-100">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white pb-4">
                  <CardTitle className="flex items-center text-lg md:text-xl">
                    <Shield className="h-5 w-5 md:h-6 md:w-6 mr-2" />
                    Moderation Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                  {statsLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <BookOpen className="h-4 w-4 mr-2 text-blue-600" />
                          Posts
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-2 bg-white rounded-lg shadow-sm">
                            <span className="text-xs text-gray-600">Total Moderated</span>
                            <Badge variant="outline" className="text-xs">
                              {moderationStats.moderatedPosts} / {moderationStats.totalPosts}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-white rounded-lg shadow-sm">
                            <span className="text-xs text-gray-600 flex items-center">
                              <XCircle className="h-3 w-3 mr-1 text-red-500" />
                              Auto Removed
                            </span>
                            <Badge variant="destructive" className="text-xs">
                              {moderationStats.autoRemovedPosts}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-white rounded-lg shadow-sm">
                            <span className="text-xs text-gray-600 flex items-center">
                              <Clock className="h-3 w-3 mr-1 text-yellow-500" />
                              Pending Review
                            </span>
                            <Badge variant="outline" className="text-xs border-yellow-300 text-yellow-700">
                              {moderationStats.pendingReviewPosts}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <MessageSquare className="h-4 w-4 mr-2 text-blue-600" />
                          Replies
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-2 bg-white rounded-lg shadow-sm">
                            <span className="text-xs text-gray-600">Total Moderated</span>
                            <Badge variant="outline" className="text-xs">
                              {moderationStats.moderatedReplies} / {moderationStats.totalReplies}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-white rounded-lg shadow-sm">
                            <span className="text-xs text-gray-600 flex items-center">
                              <XCircle className="h-3 w-3 mr-1 text-red-500" />
                              Auto Removed
                            </span>
                            <Badge variant="destructive" className="text-xs">
                              {moderationStats.autoRemovedReplies}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-white rounded-lg shadow-sm">
                            <span className="text-xs text-gray-600 flex items-center">
                              <Clock className="h-3 w-3 mr-1 text-yellow-500" />
                              Pending Review
                            </span>
                            <Badge variant="outline" className="text-xs border-yellow-300 text-yellow-700">
                              {moderationStats.pendingReviewReplies}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t border-gray-100">
                        <div className="flex items-center text-xs text-green-600 bg-green-50 p-2 rounded-lg">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          <span>AI-powered moderation active</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg border border-blue-100">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white pb-4">
                <CardTitle className="flex items-center text-lg md:text-xl">
                  <BookOpen className="h-5 w-5 md:h-6 md:w-6 mr-2" />
                  Popular Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
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
                        className="flex items-center justify-between cursor-pointer hover:bg-blue-50 p-3 rounded-lg transition-colors"
                        onClick={() => setCategory(cat.category)}
                      >
                        <span className="text-sm capitalize font-medium">
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
            </div>

            {forumStats?.mostActiveUsers && forumStats.mostActiveUsers.length > 0 && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg border border-blue-100">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white pb-4">
                  <CardTitle className="flex items-center text-lg md:text-xl">
                    <Users className="h-5 w-5 md:h-6 md:w-6 mr-2" />
                    Most Active Users
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                  <div className="space-y-3">
                    {forumStats.mostActiveUsers.map((user, index) => (
                      <div key={user.id} className="flex items-center space-x-3 p-2 hover:bg-blue-50 rounded-lg transition-colors">
                        <div className="relative">
                          <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {index + 1}
                          </div>
                          <div className="bg-gradient-to-r from-blue-200 to-indigo-200 rounded-full w-10 h-10 flex items-center justify-center text-blue-800 font-bold">
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
              </div>
            )}

            <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg border border-blue-100">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white pb-4">
                <CardTitle className="flex items-center text-lg md:text-xl">
                  <Bookmark className="h-5 w-5 md:h-6 md:w-6 mr-2" />
                  Quick Links
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <div className="space-y-2">
                  <Link
                    href="/dashboard/forum/bookmarks"
                    className="flex items-center p-3 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <Bookmark className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="text-sm font-medium">Your Bookmarks</span>
                  </Link>
                </div>
              </CardContent>
            </div>

            <CommunityGuidelines />
          </div>
        </div>
      </div>
    </div>
  );
}