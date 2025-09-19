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
  Eye,
  FileText,
  RefreshCw,
  Bot,
  Lightbulb,
  MessageSquare,
  TrendingUp,
  Languages,
  SpellCheck, // Changed from Spellcheck to SpellCheck
  AlertTriangle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useSession } from 'next-auth/react';
import CreateReplyForm from '@/components/forum/create-reply-form';
import ReplyItem from '@/components/forum/reply-item';
import { toast } from 'sonner';
import BookmarkButton from '@/components/forum/bookmark-button';
import TranslationToggle from '@/components/ui/translation-toggle';

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
  language: string;
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
  language: string;
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
  const [summary, setSummary] = useState<any>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [deletingReplyId, setDeletingReplyId] = useState<string | null>(null);
  
  // Translation states
  const [translatedTitle, setTranslatedTitle] = useState('');
  const [translatedContent, setTranslatedContent] = useState('');
  const [isTranslated, setIsTranslated] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [userLanguage, setUserLanguage] = useState('en');
  
  // Writing suggestions and tone analysis states
  const [suggestions, setSuggestions] = useState<any>(null);
  const [toneAnalysis, setToneAnalysis] = useState<any>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showToneAnalysis, setShowToneAnalysis] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isLoadingToneAnalysis, setIsLoadingToneAnalysis] = useState(false);

  useEffect(() => {
    fetchPost();
    fetchReplies();
    checkAdminStatus();
    fetchUserLanguage();
    
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

  const fetchUserLanguage = async () => {
    if (session?.user?.id) {
      try {
        const response = await fetch(`/api/user/preferences?userId=${session.user.id}`);
        if (response.ok) {
          const data = await response.json();
          setUserLanguage(data.preferredLanguage || 'en');
        }
      } catch (error) {
        console.error('Error fetching user language:', error);
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

  const fetchSummary = async () => {
    setLoadingSummary(true);
    try {
      const response = await fetch(`/api/forum/posts/${id}/summarize`);
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      } else {
        toast.error('Failed to generate summary');
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
      toast.error('Failed to generate summary');
    } finally {
      setLoadingSummary(false);
    }
  };

  const fetchSuggestions = async () => {
    if (!post) return;
    
    setIsLoadingSuggestions(true);
    try {
      const response = await fetch('/api/forum/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: post.content, 
          language: post.language 
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } else {
        toast.error('Failed to get writing suggestions');
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      toast.error('Failed to get writing suggestions');
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const fetchToneAnalysis = async () => {
    if (!post) return;
    
    setIsLoadingToneAnalysis(true);
    try {
      const response = await fetch('/api/forum/tone-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: post.content, 
          language: post.language 
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setToneAnalysis(data);
        setShowToneAnalysis(true);
      } else {
        toast.error('Failed to analyze tone');
      }
    } catch (error) {
      console.error('Error analyzing tone:', error);
      toast.error('Failed to analyze tone');
    } finally {
      setIsLoadingToneAnalysis(false);
    }
  };

  const handleTranslate = async () => {
    if (isTranslated) {
      // If already translated, toggle back to original
      setIsTranslated(false);
      return;
    }

    setIsTranslating(true);
    try {
      // Translate title if it exists
      const titlePromise = post?.title 
        ? fetch('/api/forum/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              text: post.title, 
              targetLanguage: userLanguage,
              sourceLanguage: post.language 
            })
          }).then(res => res.ok ? res.json() : Promise.resolve(null))
        : Promise.resolve(null);

      // Translate content
      const contentPromise = fetch('/api/forum/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: post?.content || '', 
          targetLanguage: userLanguage,
          sourceLanguage: post?.language 
        })
      }).then(res => res.ok ? res.json() : Promise.resolve(null));

      const [titleResult, contentResult] = await Promise.all([titlePromise, contentPromise]);

      if (titleResult?.translation) setTranslatedTitle(titleResult.translation);
      if (contentResult?.translation) setTranslatedContent(contentResult.translation);
      
      setIsTranslated(true);
    } catch (error) {
      console.error('Error translating content:', error);
      toast.error('Failed to translate content');
    } finally {
      setIsTranslating(false);
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
        
        // Update the post bookmark count
        setPost(prev => prev ? {
          ...prev,
          _count: {
            ...prev._count,
            bookmarks: data.bookmarked ? prev._count.bookmarks + 1 : prev._count.bookmarks - 1
          }
        } : null);
        
        toast.success(data.bookmarked ? 'Post bookmarked' : 'Bookmark removed');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to bookmark post');
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
        const data = await response.json();
        toast.success(data.message);
        
        // If action was taken, refresh the post data
        if (data.actionTaken) {
          fetchPost();
        }
      } else {
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          
          if (errorData.alreadyFlagged) {
            toast.error('You have already flagged this content');
          } else if (errorData.recentFlag) {
            toast.error('You have recently flagged this content. Please wait 24 hours before flagging the same content again.');
          } else {
            toast.error(errorData.error || 'Failed to flag post');
          }
        } else {
          toast.error('Failed to flag post');
        }
      }
    } catch (error) {
      console.error('Error flagging post:', error);
      toast.error('Failed to flag post');
    }
  };

  const handleFlagReply = async (replyId: string) => {
    const reason = prompt('Please provide a reason for flagging this reply:');
    if (!reason) return;

    try {
      console.log('Attempting to flag reply:', replyId, 'with reason:', reason);
      
      const response = await fetch('/api/forum/flag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ replyId, reason }),
      });

      console.log('Flag response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Flag response data:', data);
        toast.success(data.message);
        
        // If action was taken, refresh the replies
        if (data.actionTaken) {
          fetchReplies();
        }
      } else {
        const contentType = response.headers.get('content-type');
        console.log('Response content-type:', contentType);
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            console.error('Flag error response:', errorData);
            
            // Handle different flag error cases
            if (errorData.alreadyFlagged) {
              toast.error('You have already flagged this content');
            } else if (errorData.recentFlag) {
              toast.error('You have recently flagged this content. Please wait 24 hours before flagging the same content again.');
            } else {
              toast.error(errorData.error || 'Failed to flag reply');
            }
          } catch (jsonError) {
            console.error('Error parsing JSON response:', jsonError);
            toast.error('Failed to flag reply: Invalid response from server');
          }
        } else {
          // If response is not JSON, get the text
          try {
            const errorText = await response.text();
            console.error('Flag error text:', errorText);
            toast.error('Failed to flag reply: ' + errorText);
          } catch (textError) {
            console.error('Error getting response text:', textError);
            toast.error('Failed to flag reply: Unknown error');
          }
        }
      }
    } catch (error) {
      console.error('Error flagging reply:', error);
      toast.error('Failed to flag reply');
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
        toast.error('Failed to share post');
      }
    } else {
      // Fallback - copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      } catch (err) {
        console.error('Error copying to clipboard:', err);
        toast.error('Failed to copy link');
      }
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

  const getLanguageName = (code: string) => {
    const languages: Record<string, string> = {
      'en': 'English',
      'hi': 'हिन्दी (Hindi)',
      'ta': 'தமிழ் (Tamil)',
      'bn': 'বাংলা (Bengali)',
      'te': 'తెలుగు (Telugu)',
      'mr': 'मराठी (Marathi)',
      'gu': 'ગુજરાતી (Gujarati)',
      'kn': 'ಕನ್ನಡ (Kannada)',
      'ml': 'മലയാളം (Malayalam)',
      'pa': 'ਪੰਜਾਬੀ (Punjabi)',
    };
    return languages[code] || code.toUpperCase();
  };

  const renderReplies = (replyList: Reply[], isNested = false) => {
    return replyList.map(reply => (
      <div key={reply.id}>
        <ReplyItem
          reply={reply}
          postId={id || ''}
          currentUserId={session?.user?.id}
          onReply={() => setReplyingTo(reply.id)}
          onFlag={() => handleFlagReply(reply.id)}
          onDelete={() => handleDeleteReply(reply.id)}
          onFlagSuccess={fetchReplies}
          isNested={isNested}
          isDeleting={deletingReplyId === reply.id}
        />
        {reply.replies && reply.replies.length > 0 && (
          <div className="ml-8">
            {renderReplies(reply.replies, true)}
          </div>
        )}
      </div>
    ));
  };

  const handleDeleteReply = async (replyId: string) => {
    if (!confirm('Are you sure you want to delete this reply?')) return;
    
    // Prevent multiple deletion attempts
    if (deletingReplyId === replyId) return;
    
    setDeletingReplyId(replyId);

    try {
      const response = await fetch(`/api/forum/replies/${replyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Reply deleted successfully');
        fetchReplies(); // Refresh the replies list
      } else {
        const errorData = await response.json();
        // If the reply was already deleted, treat it as success
        if (errorData.alreadyDeleted) {
          toast.success('Reply deleted successfully');
          fetchReplies();
        } else {
          toast.error(errorData.error || 'Failed to delete reply');
        }
      }
    } catch (error) {
      console.error('Error deleting reply:', error);
      toast.error('Failed to delete reply');
    } finally {
      setDeletingReplyId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 forum-gradient min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="forum-card card-hover mb-8 fade-in">
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
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 forum-gradient min-h-screen text-center">
        <h2 className="text-2xl font-semibold mb-4">Post not found</h2>
        <Button onClick={() => router.push('/dashboard/forum')}>
          Back to Forum
        </Button>
      </div>
    );
  }

  const isAuthor = session?.user?.id === post.author.id;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 forum-gradient min-h-screen">
      <Button 
        variant="ghost" 
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      {/* Post */}
      <div className="forum-card card-hover mb-8 fade-in">
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
                  <Badge variant="outline" className="text-xs">
                    {getLanguageName(post.language)}
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
            
            <div className="flex space-x-2 ml-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchSuggestions}
                disabled={isLoadingSuggestions || !post.content}
                className="text-xs h-7 px-2"
              >
                <SpellCheck className="h-3 w-3 mr-1" />
                {isLoadingSuggestions ? 'Checking...' : 'Check Writing'}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchToneAnalysis}
                disabled={isLoadingToneAnalysis || !post.content}
                className="text-xs h-7 px-2"
              >
                <AlertTriangle className="h-3 w-3 mr-1" />
                {isLoadingToneAnalysis ? 'Analyzing...' : 'Analyze Tone'}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Writing Suggestions */}
          {showSuggestions && suggestions && (
            <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-200">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-blue-800 flex items-center">
                  <SpellCheck className="h-4 w-4 mr-1" />
                  Writing Suggestions
                </h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowSuggestions(false)}
                  className="h-6 w-6 p-0"
                >
                  ×
                </Button>
              </div>
              
              {suggestions.grammar && suggestions.grammar.length > 0 && (
                <div className="mb-2">
                  <p className="text-sm font-medium text-blue-700">Grammar:</p>
                  <ul className="text-xs text-blue-600 list-disc pl-5">
                    {suggestions.grammar.map((item: string, index: number) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {suggestions.clarity && suggestions.clarity.length > 0 && (
                <div className="mb-2">
                  <p className="text-sm font-medium text-blue-700">Clarity:</p>
                  <ul className="text-xs text-blue-600 list-disc pl-5">
                    {suggestions.clarity.map((item: string, index: number) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {suggestions.tone && suggestions.tone.length > 0 && (
                <div className="mb-2">
                  <p className="text-sm font-medium text-blue-700">Tone:</p>
                  <ul className="text-xs text-blue-600 list-disc pl-5">
                    {suggestions.tone.map((item: string, index: number) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {suggestions.suggestedText && (
                <div className="mt-2 p-2 bg-white rounded border border-blue-200">
                  <p className="text-xs font-medium text-blue-700 mb-1">Suggested Text:</p>
                  <p className="text-xs text-blue-800">{suggestions.suggestedText}</p>
                </div>
              )}
            </div>
          )}
          
          {/* Tone Analysis */}
          {showToneAnalysis && toneAnalysis && (
            <div className="mb-4 p-3 bg-purple-50 rounded-md border border-purple-200">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-purple-800 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Tone Analysis
                </h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowToneAnalysis(false)}
                  className="h-6 w-6 p-0"
                >
                  ×
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <p className="text-sm font-medium text-purple-700">Overall Tone:</p>
                  <p className="text-xs text-purple-800">{toneAnalysis.overallTone}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-purple-700">Respectfulness:</p>
                  <p className="text-xs text-purple-800">{toneAnalysis.respectfulness}</p>
                </div>
              </div>
              
              {toneAnalysis.emotions && toneAnalysis.emotions.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-purple-700">Detected Emotions:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {toneAnalysis.emotions.map((emotion: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs border-purple-300 text-purple-700">
                        {emotion}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {toneAnalysis.suggestions && toneAnalysis.suggestions.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-purple-700">Suggestions:</p>
                  <ul className="text-xs text-purple-600 list-disc pl-5">
                    {toneAnalysis.suggestions.map((item: string, index: number) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {post.title && (
            <h1 className="text-2xl font-bold mb-4">
              {isTranslated && translatedTitle ? translatedTitle : post.title}
            </h1>
          )}
          <div className="prose max-w-none mb-6">
            <p className="text-gray-700 whitespace-pre-line">
              {isTranslated && translatedContent ? translatedContent : post.content}
            </p>
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
              
              <TranslationToggle
                onTranslate={handleTranslate}
                isTranslated={isTranslated}
                isLoading={isTranslating}
              />
            </div>
            
            <Button variant="ghost" size="sm" onClick={handleShare} className="text-gray-500">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </div>

      {/* AI Summary Section */}
      <div className="summary-card card-hover mb-6 fade-in">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-blue-800">
            <Bot className="h-5 w-5 mr-2" />
            AI Thread Summary
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={fetchSummary}
              disabled={loadingSummary}
              className="ml-auto text-blue-600 hover:text-blue-800 hover:bg-blue-100"
            >
              <RefreshCw className={`h-4 w-4 ${loadingSummary ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingSummary ? (
            <div className="flex items-center justify-center py-4">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-500 mr-2" />
              <span className="text-blue-700">Generating summary...</span>
            </div>
          ) : summary ? (
            <div className="space-y-3">
              <div className="p-3 bg-white rounded-md border border-blue-200">
                <p className="text-blue-800">{summary.summary}</p>
              </div>
              
              {summary.keyPoints && summary.keyPoints.length > 0 && (
                <div>
                  <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Key Points
                  </h4>
                  <ul className="space-y-1">
                    {summary.keyPoints.map((point: string, index: number) => (
                      <li key={index} className="text-blue-700 text-sm flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="flex items-center space-x-4 pt-2">
                {summary.sentiment && (
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 text-blue-600 mr-1" />
                    <span className="text-sm text-blue-700">
                      Sentiment: <Badge variant="outline" className="ml-1 text-blue-700 border-blue-300">
                        {summary.sentiment}
                      </Badge>
                    </span>
                  </div>
                )}
                
                {summary.topics && summary.topics.length > 0 && (
                  <div className="flex items-center">
                    <MessageSquare className="h-4 w-4 text-blue-600 mr-1" />
                    <span className="text-sm text-blue-700">
                      Topics: {summary.topics.slice(0, 3).map((topic: string) => (
                        <Badge key={topic} variant="outline" className="ml-1 text-blue-700 border-blue-300">
                          {topic}
                        </Badge>
                      ))}
                    </span>
                  </div>
                )}
                
                {summary.isCached && (
                  <div className="text-xs text-blue-500 italic">
                    Cached from {new Date(summary.generatedAt).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <FileText className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <p className="text-blue-700 mb-3">No summary available for this thread</p>
              <Button 
                onClick={fetchSummary} 
                variant="outline" 
                className="text-blue-700 border-blue-300 hover:bg-blue-100"
              >
                Generate AI Summary
              </Button>
            </div>
          )}
        </CardContent>
      </div>

      {/* Reply Form */}
      <div className="forum-card card-hover mb-6 fade-in">
        <CreateReplyForm 
          postId={id || ''} 
          onReplyCreated={fetchReplies}
          placeholder="Share your thoughts on this post..."
        />
      </div>

      {/* Replies Section */}
      <div className="mt-8 fade-in">
        <h2 className="text-xl font-semibold mb-4">
          Replies ({replies.length})
        </h2>
        
        {replies.length > 0 ? (
          <div className="space-y-4">
            {renderReplies(replies)}
          </div>
        ) : (
          <div className="forum-card card-hover">
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
          </div>
        )}
      </div>
    </div>
  );
}