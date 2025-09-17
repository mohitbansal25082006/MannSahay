'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Heart, 
  Bookmark, 
  Share2, 
  Flag, 
  MoreHorizontal,
  Edit,
  Trash2,
  ArrowLeft,
  MessageCircle,
  Eye
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useSession } from 'next-auth/react';
import CreateReplyForm from '@/components/forum/create-reply-form';
import ReplyItem from '@/components/forum/reply-item';
import { toast } from 'sonner';

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

interface Reply {
  id: string;
  content: string;
  flagged: boolean;
  riskLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
  author: {
    id: string;
    name?: string;
    image?: string;
    hashedId?: string;
  };
  _count: {
    likes: number;
  };
  parentId?: string;
  replies?: Reply[];
}

export default function PostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const [post, setPost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchPost();
    fetchReplies();
    checkAdminStatus();
    
    // Increment view count
    fetch(`/api/forum/posts/${id}/view`, { method: 'POST' }).catch(console.error);
  }, [id]);

  const checkAdminStatus = async () => {
    if (session?.user?.id) {
      try {
        const response = await fetch(`/api/user/admin-status?userId=${session.user.id}`);
        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data.isAdmin);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    }
  };

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/forum/posts/${id}`);
      if (response.ok) {
        const data = await response.json();
        setPost(data);
        
        // Check if user has liked or bookmarked
        if (session?.user?.id) {
          const [likeRes, bookmarkRes] = await Promise.all([
            fetch(`/api/forum/like/check?postId=${id}&userId=${session.user.id}`),
            fetch(`/api/forum/bookmark/check?postId=${id}&userId=${session.user.id}`)
          ]);
          
          if (likeRes.ok) setIsLiked((await likeRes.json()).liked);
          if (bookmarkRes.ok) setIsBookmarked((await bookmarkRes.json()).bookmarked);
        }
      } else {
        toast.error('Failed to fetch post');
        router.push('/dashboard/forum');
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      toast.error('Failed to fetch post');
      router.push('/dashboard/forum');
    } finally {
      setLoading(false);
    }
  };

  const fetchReplies = async () => {
    try {
      const response = await fetch(`/api/forum/posts/${id}/replies`);
      if (response.ok) {
        const data = await response.json();
        setReplies(data.replies);
      }
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  };

  const handleLike = async () => {
    try {
      const response = await fetch('/api/forum/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId: id }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.liked);
        setPost(prev => prev ? {
          ...prev,
          _count: {
            ...prev._count,
            likes: data.liked ? prev._count.likes + 1 : prev._count.likes - 1
          }
        } : null);
      } else {
        toast.error('Failed to like post');
      }
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Failed to like post');
    }
  };

  const handleBookmark = async () => {
    try {
      const response = await fetch('/api/forum/bookmark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId: id }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsBookmarked(data.bookmarked);
        toast.success(data.bookmarked ? 'Post bookmarked' : 'Bookmark removed');
      } else {
        toast.error('Failed to bookmark post');
      }
    } catch (error) {
      console.error('Error bookmarking post:', error);
      toast.error('Failed to bookmark post');
    }
  };

  const handleFlag = async () => {
    const reason = prompt('Please provide a reason for flagging this post:');
    if (!reason) return;

    try {
      const response = await fetch('/api/forum/flag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId: id, reason }),
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

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`/api/forum/posts/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Post deleted successfully');
        router.push('/dashboard/forum');
      } else {
        toast.error('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title || 'Forum Post',
          text: post?.content.substring(0, 100) + '...',
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'HIGH': return 'bg-red-100 text-red-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic': return 'bg-purple-100 text-purple-800';
      case 'relationships': return 'bg-pink-100 text-pink-800';
      case 'mental-health': return 'bg-green-100 text-green-800';
      case 'lifestyle': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderReplies = (replyList: Reply[], isNested = false) => {
    return replyList.map(reply => (
      <div key={reply.id}>
        <ReplyItem
          reply={reply}
          currentUserId={session?.user?.id}
          onReply={() => setReplyingTo(reply.id)}
          onFlag={() => handleFlagReply(reply.id)}
          onDelete={() => handleDeleteReply(reply.id)}
          isNested={isNested}
        />
        {reply.replies && reply.replies.length > 0 && (
          <div className="ml-8">
            {renderReplies(reply.replies, true)}
          </div>
        )}
      </div>
    ));
  };

  const handleFlagReply = async (replyId: string) => {
    const reason = prompt('Please provide a reason for flagging this reply:');
    if (!reason) return;

    try {
      const response = await fetch('/api/forum/flag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ replyId, reason }),
      });

      if (response.ok) {
        toast.success('Reply has been flagged for review');
      } else {
        toast.error('Failed to flag reply');
      }
    } catch (error) {
      console.error('Error flagging reply:', error);
      toast.error('Failed to flag reply');
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    if (!confirm('Are you sure you want to delete this reply?')) return;

    try {
      const response = await fetch(`/api/forum/replies/${replyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Reply deleted successfully');
        fetchReplies();
      } else {
        toast.error('Failed to delete reply');
      }
    } catch (error) {
      console.error('Error deleting reply:', error);
      toast.error('Failed to delete reply');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <Card>
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
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <h2 className="text-2xl font-semibold mb-4">Post not found</h2>
        <Button onClick={() => router.push('/dashboard/forum')}>
          Back to Forum
        </Button>
      </div>
    );
  }

  const isAuthor = session?.user?.id === post.author.id;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button 
        variant="ghost" 
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      {/* Post */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                {post.isAnonymous ? (
                  <AvatarFallback className="bg-gray-200">
                    A
                  </AvatarFallback>
                ) : (
                  <>
                    <AvatarImage src={post.author.image || ''} alt={post.author.name || ''} />
                    <AvatarFallback>
                      {post.author.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </>
                )}
              </Avatar>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">
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
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                  <span>•</span>
                  <span className="flex items-center">
                    <Eye className="h-3 w-3 mr-1" />
                    {post.views}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowActions(!showActions)}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
              
              {showActions && (
                <div className="absolute right-0 z-10 mt-1 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200">
                  {(isAuthor || isAdmin) && (
                    <>
                      <button
                        onClick={() => router.push(`/dashboard/forum/post/${id}/edit`)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Edit className="h-4 w-4 inline mr-2" />
                        Edit
                      </button>
                      <button
                        onClick={handleDelete}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <Trash2 className="h-4 w-4 inline mr-2" />
                        Delete
                      </button>
                    </>
                  )}
                  <button
                    onClick={handleFlag}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Flag className="h-4 w-4 inline mr-2" />
                    Report
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2 mt-2">
            <Badge className={`text-xs ${getCategoryColor(post.category)}`}>
              {post.category}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          {post.title && (
            <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
          )}
          <div className="prose max-w-none mb-6">
            <p className="text-gray-700 whitespace-pre-line">{post.content}</p>
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`flex items-center space-x-1 ${isLiked ? 'text-red-500' : 'text-gray-500'}`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                <span>{post._count.likes}</span>
              </Button>
              
              <Button variant="ghost" size="sm" className="flex items-center space-x-1 text-gray-500">
                <MessageCircle className="h-4 w-4" />
                <span>{post._count.replies}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBookmark}
                className={`flex items-center space-x-1 ${isBookmarked ? 'text-blue-500' : 'text-gray-500'}`}
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                <span>{post._count.bookmarks}</span>
              </Button>
            </div>
            
            <Button variant="ghost" size="sm" onClick={handleShare} className="text-gray-500">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reply Form */}
      <CreateReplyForm 
        postId={id || ''} 
        onReplyCreated={fetchReplies}
        placeholder="Share your thoughts on this post..."
      />

      {/* Replies Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">
          Replies ({replies.length})
        </h2>
        
        {replies.length > 0 ? (
          <div className="space-y-4">
            {renderReplies(replies)}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="py-8">
                <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No replies yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Be the first to share your thoughts
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}