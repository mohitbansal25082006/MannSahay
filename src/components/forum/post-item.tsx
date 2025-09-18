// E:\mannsahay\src\components\forum\post-item.tsx

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
  Bookmark, 
  Share2, 
  Flag, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Shield,
  AlertTriangle,
  FileText,
  Bot
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useSession } from 'next-auth/react';

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
  isDeleting = false
}: PostItemProps) {
  const { data: session } = useSession();
  const [showActions, setShowActions] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  
  const isAuthor = currentUserId === post.author.id;

  useEffect(() => {
    checkAdminStatus();
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

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    } else {
      // Navigate to edit page
      window.location.href = `/dashboard/forum/post/${post.id}/edit`;
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

  const getModerationStatusColor = (status?: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'UNDER_REVIEW': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
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
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/dashboard/forum/post/${post.id}`);
      alert('Link copied to clipboard!');
    }
  };

  // Don't render the post if it's hidden and user is not admin or author
  if (post.isHidden && !isAdmin && !isAuthor) {
    return null;
  }

  return (
    <Card className={`mb-4 overflow-hidden transition-all hover:shadow-md ${post.isHidden ? 'border-l-4 border-l-red-500 opacity-75' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
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
              onClick={() => setShowActions(!showActions)}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            
            {showActions && (
              <div className="absolute right-0 z-10 mt-1 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200">
                {(isAuthor || isAdmin) && (
                  <>
                    <button
                      onClick={() => {
                        handleEdit();
                        setShowActions(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Edit className="h-4 w-4 inline mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
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
                  onClick={() => {
                    onFlag?.();
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
          <Badge className={`text-xs ${getCategoryColor(post.category)}`}>
            {post.category}
          </Badge>
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
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
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
              <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
            )}
            <p className="text-gray-700 mb-4 line-clamp-3">{post.content}</p>
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
        
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onLike}
              className={`flex items-center space-x-1 ${isLiked ? 'text-red-500' : 'text-gray-500'}`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{post._count.likes}</span>
            </Button>
            
            <Link href={`/dashboard/forum/post/${post.id}`}>
              <Button variant="ghost" size="sm" className="flex items-center space-x-1 text-gray-500">
                <MessageCircle className="h-4 w-4" />
                <span>{post._count.replies}</span>
              </Button>
            </Link>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onBookmark}
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
  );
}