// E:\mannsahay\src\components\forum\reply-item.tsx

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Heart, 
  Flag, 
  MoreHorizontal,
  Edit,
  Trash2,
  Reply,
  AlertTriangle,
  Bot
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useSession } from 'next-auth/react';
import EditReplyForm from './edit-reply-form';
import CreateReplyForm from './create-reply-form';
import { toast } from 'sonner';

interface ReplyItemProps {
  reply: {
    id: string;
    content: string;
    flagged: boolean;
    riskLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
    createdAt: string;
    moderationStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';
    moderationReason?: string;
    moderationNote?: string;
    isHidden?: boolean;
    author: {
      id: string;
      name?: string;
      image?: string;
      hashedId?: string;
    };
    _count: {
      likes: number;
    };
  };
  postId: string;
  currentUserId?: string;
  isLiked?: boolean;
  onLike?: () => void;
  onFlag?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onReply?: () => void;
  isNested?: boolean;
  isDeleting?: boolean; // Add this prop
}

export default function ReplyItem({
  reply,
  postId,
  currentUserId,
  isLiked = false,
  onLike,
  onFlag,
  onDelete,
  onEdit,
  onReply,
  isNested = false,
  isDeleting = false // Add this prop with default value
}: ReplyItemProps) {
  const { data: session } = useSession();
  const [showActions, setShowActions] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replies, setReplies] = useState<any[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [localIsDeleting, setLocalIsDeleting] = useState(false); // Local state for this component
  
  const isAuthor = currentUserId === reply.author.id;

  useEffect(() => {
    checkAdminStatus();
  }, []);

  useEffect(() => {
    // Update local state when prop changes
    setLocalIsDeleting(isDeleting);
  }, [isDeleting]);

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

  const fetchReplies = async () => {
    setLoadingReplies(true);
    try {
      const response = await fetch(`/api/forum/replies/by-parent?parentId=${reply.id}`);
      if (response.ok) {
        const data = await response.json();
        setReplies(data.replies);
      }
    } catch (error) {
      console.error('Error fetching replies:', error);
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleLike = async () => {
    try {
      const response = await fetch('/api/forum/replies/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ replyId: reply.id }),
      });

      if (response.ok) {
        const data = await response.json();
        if (onLike) onLike();
        toast.success(data.liked ? 'Liked reply' : 'Unliked reply');
      } else {
        toast.error('Failed to like reply');
      }
    } catch (error) {
      console.error('Error liking reply:', error);
      toast.error('Failed to like reply');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this reply?')) return;
    
    // Prevent multiple deletion attempts
    if (localIsDeleting) return;
    
    setLocalIsDeleting(true);
    
    try {
      const response = await fetch(`/api/forum/replies/${reply.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Reply deleted successfully');
        if (onDelete) onDelete();
      } else {
        const errorData = await response.json();
        // If the reply was already deleted, treat it as success
        if (errorData.alreadyDeleted) {
          toast.success('Reply deleted successfully');
          if (onDelete) onDelete();
        } else {
          toast.error(errorData.error || 'Failed to delete reply');
        }
      }
    } catch (error) {
      console.error('Error deleting reply:', error);
      toast.error('Failed to delete reply');
    } finally {
      setLocalIsDeleting(false);
    }
  };

  const handleFlag = async () => {
    const reason = prompt('Please provide a reason for flagging this reply:');
    if (!reason) return;

    try {
      const response = await fetch('/api/forum/flag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ replyId: reply.id, reason }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || 'Reply has been flagged for review');
      } else {
        toast.error('Failed to flag reply');
      }
    } catch (error) {
      console.error('Error flagging reply:', error);
      toast.error('Failed to flag reply');
    }
  };

  const handleReplyClick = () => {
    setShowReplyForm(!showReplyForm);
    if (!showReplyForm && replies.length === 0) {
      fetchReplies();
    }
    if (onReply) onReply();
  };
  
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'HIGH': return 'bg-red-100 text-red-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-blue-100 text-blue-800';
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

  // Don't render the reply if it's hidden and user is not admin or author
  if (reply.isHidden && !isAdmin && !isAuthor) {
    return null;
  }

  if (isEditing) {
    return (
      <EditReplyForm
        reply={reply}
        onCancel={() => setIsEditing(false)}
        onSuccess={() => {
          setIsEditing(false);
          if (onEdit) onEdit();
        }}
      />
    );
  }

  return (
    <div className={`${isNested ? 'ml-8' : ''}`}>
      <Card className={`${isNested ? 'mt-2' : 'mt-4'} border-l-4 ${reply.flagged ? 'border-l-red-500' : 'border-l-gray-200'} ${reply.isHidden ? 'opacity-75' : ''}`}>
        <CardContent className="pt-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={reply.author.image || ''} alt={reply.author.name || ''} />
                <AvatarFallback>
                  {reply.author.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm">
                    {reply.author.name || 'User'}
                  </span>
                  {reply.flagged && (
                    <Badge variant="destructive" className="text-xs">
                      Flagged
                    </Badge>
                  )}
                  <Badge className={`text-xs ${getRiskColor(reply.riskLevel)}`}>
                    {reply.riskLevel}
                  </Badge>
                  {reply.moderationStatus && reply.moderationStatus !== 'APPROVED' && (
                    <Badge className={`text-xs ${getModerationStatusColor(reply.moderationStatus)}`}>
                      {reply.moderationStatus === 'REJECTED' ? 'Removed' : reply.moderationStatus}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                </p>
                
                {reply.isHidden && (
                  <div className="mb-2 p-2 bg-yellow-50 rounded-md border border-yellow-200 flex items-center">
                    <AlertTriangle className="h-3 w-3 text-yellow-600 mr-2" />
                    <span className="text-xs text-yellow-700">
                      This reply has been {reply.moderationStatus === 'REJECTED' ? 'removed' : 'hidden'} by our moderation system.
                      {reply.moderationNote && ` Reason: ${reply.moderationNote}`}
                    </span>
                  </div>
                )}
                
                <p className="text-gray-700">{reply.content}</p>
                
                <div className="flex items-center space-x-3 mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLike}
                    className={`flex items-center space-x-1 ${isLiked ? 'text-red-500' : 'text-gray-500'}`}
                  >
                    <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                    <span>{reply._count.likes}</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReplyClick}
                    className="flex items-center space-x-1 text-gray-500"
                  >
                    <Reply className="h-4 w-4" />
                    <span>Reply</span>
                  </Button>
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
                          setIsEditing(true);
                          setShowActions(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Edit className="h-4 w-4 inline mr-2" />
                        Edit
                      </button>
                      <button
                        onClick={handleDelete}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 disabled:opacity-50"
                        disabled={localIsDeleting}
                      >
                        <Trash2 className="h-4 w-4 inline mr-2" />
                        {localIsDeleting ? 'Deleting...' : 'Delete'}
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
        </CardContent>
      </Card>

      {/* Reply Form */}
      {showReplyForm && (
        <CreateReplyForm
          postId={postId}
          replyId={reply.id}
          onReplyCreated={() => {
            fetchReplies();
            setShowReplyForm(false);
          }}
          placeholder="Reply to this comment..."
          isNested={true}
        />
      )}

      {/* Nested Replies */}
      {replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {replies.map((nestedReply) => (
            <ReplyItem
              key={nestedReply.id}
              reply={nestedReply}
              postId={postId}
              currentUserId={currentUserId}
              isLiked={false} // You would need to track this separately
              onLike={() => {}} // Implement this
              onFlag={() => handleFlagReply(nestedReply.id)}
              onDelete={() => handleDeleteReply(nestedReply.id)}
              onEdit={() => {}} // Implement this
              onReply={() => {}} // Implement this
              isNested={true}
              isDeleting={false} // Pass false for nested replies since we're not tracking them
            />
          ))}
        </div>
      )}

      {/* Loading indicator for nested replies */}
      {loadingReplies && (
        <div className="mt-2 text-center text-sm text-gray-500">
          Loading replies...
        </div>
      )}
    </div>
  );
}

// Helper functions for nested replies
function handleFlagReply(replyId: string) {
  // Implementation similar to handleFlag
}

function handleDeleteReply(replyId: string) {
  // Implementation similar to handleDelete
}