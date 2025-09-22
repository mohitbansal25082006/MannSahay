'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageCircle,
  Heart,
  Share2,
  Flag,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Shield,
  AlertTriangle,
  FileText,
  Bot,
  Languages
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import BookmarkButton from './bookmark-button';
import TranslationToggle from '@/components/ui/translation-toggle';

// Define interfaces for complex types
interface WritingSuggestion {
  suggestion: string;
  reason?: string;
  [key: string]: unknown; // Allow additional properties
}

interface ToneAnalysis {
  tone: string;
  confidence: number;
  [key: string]: unknown; // Allow additional properties
}

interface PostItemProps {
  post: {
    id: string;
    title?: string;
    content: string;
    isAnonymous: boolean;
    flagged: boolean;
    riskLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
    category: string;
    views: number;
    createdAt: string;
    moderationStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';
    moderationReason?: string;
    moderationNote?: string;
    isHidden?: boolean;
    summary?: string;
    language: string;
    translatedContent?: string; // Changed from any to string
    writingSuggestions?: WritingSuggestion[]; // Changed from any to WritingSuggestion[]
    toneAnalysis?: ToneAnalysis; // Changed from any to ToneAnalysis
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
  };
  currentUserId?: string;
  isLiked?: boolean;
  isBookmarked?: boolean;
  onLike?: () => void;
  onBookmark?: () => void;
  onFlag?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  isDeleting?: boolean;
  onFlagSuccess?: () => void;
}

export default function PostItem({
  post,
  currentUserId,
  isLiked = false,
  isBookmarked = false,
  onLike,
  onBookmark,
  onFlag,
  onDelete,
  onEdit,
  isDeleting = false,
  onFlagSuccess,
}: PostItemProps) {
  const { data: session } = useSession();
  const [showActions, setShowActions] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showToneAnalysis, setShowToneAnalysis] = useState(false);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<{ [key: string]: boolean }>({});
  const [translatedTitle, setTranslatedTitle] = useState('');
  const [translatedContent, setTranslatedContent] = useState('');
  const [isTranslated, setIsTranslated] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [userLanguage, setUserLanguage] = useState('en');

  const isAuthor = currentUserId === post.author.id;

  useEffect(() => {
    checkAdminStatus();
    // Get user's preferred language
    if (session?.user?.id) {
      fetchUserLanguage();
    }
  }, [session?.user?.id]);

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

  const handleTranslate = async () => {
    if (isTranslated) {
      // If already translated, toggle back to original
      setIsTranslated(false);
      return;
    }

    setIsTranslating(true);
    try {
      // Translate both title and content
      const translationPromises = [];
      
      if (post.title) {
        translationPromises.push(
          fetch('/api/forum/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              text: post.title, 
              targetLanguage: userLanguage,
              sourceLanguage: post.language 
            }),
          }).then(res => res.ok ? res.json() : Promise.resolve(null))
        );
      }
      
      translationPromises.push(
        fetch('/api/forum/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            text: post.content, 
            targetLanguage: userLanguage,
            sourceLanguage: post.language 
          }),
        }).then(res => res.ok ? res.json() : Promise.resolve(null))
      );

      const results = await Promise.all(translationPromises);
      
      // Process results
      if (post.title && results[0]?.translation) {
        setTranslatedTitle(results[0].translation);
      }
      
      if (results[post.title ? 1 : 0]?.translation) {
        setTranslatedContent(results[post.title ? 1 : 0].translation);
      }
      
      setIsTranslated(true);
    } catch (error) {
      console.error('Error translating content:', error);
      toast.error('Failed to translate content');
    } finally {
      setIsTranslating(false);
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

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    } else {
      // Navigate to edit page
      window.location.href = `/dashboard/forum/post/${post.id}/edit`;
    }
  };

  const handleFlag = async () => {
    const reason = prompt('Please provide a reason for flagging this post:');
    if (!reason) return;

    try {
      console.log('Attempting to flag post:', post.id, 'with reason:', reason);

      const response = await fetch('/api/forum/flag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: post.id,
          reason: reason,
        }),
      });

      console.log('Flag response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Flag response data:', data);
        toast.success(data.message);

        // If action was taken, refresh the posts list
        if (data.actionTaken && onFlagSuccess) {
          onFlagSuccess();
        }
      } else {
        // Check if response has content before trying to parse it
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
              toast.error(errorData.error || 'Failed to flag post');
            }
          } catch (jsonError) {
            console.error('Error parsing JSON response:', jsonError);
            toast.error('Failed to flag post: Invalid response from server');
          }
        } else {
          // If response is not JSON, get the text
          try {
            const errorText = await response.text();
            console.error('Flag error text:', errorText);
            toast.error('Failed to flag post: ' + errorText);
          } catch (textError) {
            console.error('Error getting response text:', textError);
            toast.error('Failed to flag post: Unknown error');
          }
        }
      }
    } catch (error) {
      console.error('Error flagging post:', error);
      toast.error('Failed to flag post');
    }
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

  const getModerationStatusColor = (status?: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'UNDER_REVIEW':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title || 'Forum Post',
          text: post.content.substring(0, 100) + '...',
          url: `${window.location.origin}/dashboard/forum/post/${post.id}`,
        });
      } catch (err) {
        console.error('Error sharing:', err);
        toast.error('Failed to share post');
      }
    } else {
      // Fallback - copy to clipboard
      try {
        await navigator.clipboard.writeText(`${window.location.origin}/dashboard/forum/post/${post.id}`);
        toast.success('Link copied to clipboard!');
      } catch (err) {
        console.error('Error copying to clipboard:', err);
        toast.error('Failed to copy link');
      }
    }
  };

  // Close actions dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowActions(false);
    };

    if (showActions) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showActions]);

  // Don't render the post if it's hidden and user is not admin or author
  if (post.isHidden && !isAdmin && !isAuthor) {
    return null;
  }

  return (
    <Card
      className={`mb-4 overflow-hidden transition-all hover:shadow-md ${
        post.isHidden ? 'border-l-4 border-l-red-500 opacity-75' : ''
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              {post.isAnonymous ? (
                <AvatarFallback className="bg-gray-200">A</AvatarFallback>
              ) : (
                <>
                  <AvatarImage src={post.author.image || ''} alt={post.author.name || ''} />
                  <AvatarFallback>{post.author.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                </>
              )}
            </Avatar>
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
                <Badge className={`text-xs ${getRiskColor(post.riskLevel)}`}>{post.riskLevel}</Badge>
                {post.moderationStatus && post.moderationStatus !== 'APPROVED' && (
                  <Badge className={`text-xs ${getModerationStatusColor(post.moderationStatus)}`}>
                    {post.moderationStatus === 'REJECTED' ? 'Removed' : post.moderationStatus}
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
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
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>

            {showActions && (
              <div className="absolute right-0 z-10 mt-1 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200">
                {(isAuthor || isAdmin) && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit();
                        setShowActions(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Edit className="h-4 w-4 inline mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.();
                        setShowActions(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 disabled:opacity-50"
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4 inline mr-2" />
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                  </>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFlag();
                    setShowActions(false);
                  }}
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
          <Badge className={`text-xs ${getCategoryColor(post.category)}`}>{post.category}</Badge>
          {post.summary && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSummary(!showSummary)}
              className="text-xs h-6 px-2"
            >
              <FileText className="h-3 w-3 mr-1" />
              Summary
            </Button>
          )}
          {(post.writingSuggestions || post.toneAnalysis) && (
            <>
              {post.writingSuggestions && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  className="text-xs h-6 px-2"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Suggestions
                </Button>
              )}
              {post.toneAnalysis && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowToneAnalysis(!showToneAnalysis)}
                  className="text-xs h-6 px-2"
                >
                  <Shield className="h-3 w-3 mr-1" />
                  Tone
                </Button>
              )}
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Show flagged status to the author even if the post is hidden */}
        {post.flagged && isAuthor && (
          <div className="mb-3 p-3 bg-yellow-50 rounded-md border border-yellow-200 flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
            <div>
              <span className="text-sm font-medium text-yellow-800">Your post has been flagged</span>
              <p className="text-xs text-yellow-700 mt-1">
                {post.moderationNote || 'Our moderators are reviewing this content for compliance with community guidelines.'}
              </p>
            </div>
          </div>
        )}

        {post.isHidden && (
          <div className="mb-3 p-2 bg-yellow-50 rounded-md border border-yellow-200 flex items-center">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
            <span className="text-sm text-yellow-700">
              This content has been {post.moderationStatus === 'REJECTED' ? 'removed' : 'hidden'} by our moderation system.
              {post.moderationNote && ` Reason: ${post.moderationNote}`}
            </span>
          </div>
        )}

        <Link href={`/dashboard/forum/post/${post.id}`}>
          <div className="cursor-pointer">
            {post.title && (
              <h3 className="font-semibold text-lg mb-2 hover:text-blue-600 transition-colors">
                {isTranslated && translatedTitle ? translatedTitle : post.title}
              </h3>
            )}
            <p className="text-gray-700 mb-4 line-clamp-3">
              {isTranslated && translatedContent ? translatedContent : post.content}
            </p>
          </div>
        </Link>

        {showSummary && post.summary && (
          <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-200">
            <div className="flex items-center mb-2">
              <Bot className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-800">AI Summary</span>
            </div>
            <p className="text-sm text-blue-700">{post.summary}</p>
          </div>
        )}

        {showSuggestions && post.writingSuggestions && (
          <div className="mb-4 p-3 bg-purple-50 rounded-md border border-purple-200">
            <div className="flex items-center mb-2">
              <Edit className="h-4 w-4 text-purple-600 mr-2" />
              <span className="text-sm font-medium text-purple-800">Writing Suggestions</span>
            </div>
            <ul className="text-sm text-purple-700">
              {post.writingSuggestions.map((suggestion, index) => (
                <li key={index} className="mb-1">
                  - {suggestion.suggestion}
                  {suggestion.reason && <span className="text-xs"> ({suggestion.reason})</span>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {showToneAnalysis && post.toneAnalysis && (
          <div className="mb-4 p-3 bg-green-50 rounded-md border border-green-200">
            <div className="flex items-center mb-2">
              <Shield className="h-4 w-4 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-800">Tone Analysis</span>
            </div>
            <p className="text-sm text-green-700">
              Tone: {post.toneAnalysis.tone} (Confidence: {(post.toneAnalysis.confidence * 100).toFixed(2)}%)
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onLike}
              className={`flex items-center space-x-1 transition-colors ${
                isLiked ? 'text-red-500 hover:text-red-600' : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{post._count.likes}</span>
            </Button>

            <Link href={`/dashboard/forum/post/${post.id}`}>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{post._count.replies}</span>
              </Button>
            </Link>

            <BookmarkButton
              postId={post.id}
              initialBookmarked={isBookmarked}
              onBookmarkChange={(bookmarked) => {
                setBookmarkedPosts((prev) => ({ ...prev, [post.id]: bookmarked }));
              }}
              showCount={true}
              count={post._count.bookmarks}
            />

            <TranslationToggle
              onTranslate={handleTranslate}
              isTranslated={isTranslated}
              isLoading={isTranslating}
            />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="text-gray-500 hover:text-blue-500 transition-colors"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}