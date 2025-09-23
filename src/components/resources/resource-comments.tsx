'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, Send, User, Clock, Heart, Reply, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name?: string;
    image?: string;
  };
  _count: {
    likes: number;
    replies: number;
  };
  replies?: Comment[];
  isLiked?: boolean;
}

interface ResourceCommentsProps {
  resourceId: string;
}

export default function ResourceComments({ resourceId }: ResourceCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [resourceId, page]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/resources/${resourceId}/comments?page=${page}&limit=5`);
      if (response.ok) {
        const data = await response.json();
        if (page === 1) {
          setComments(data.comments);
        } else {
          setComments(prev => [...prev, ...data.comments]);
        }
        setHasMore(data.pagination.hasMore);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/resources/${resourceId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (response.ok) {
        const comment = await response.json();
        setComments(prev => [comment, ...prev]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (commentId: string) => {
    if (!replyContent.trim()) return;

    try {
      const response = await fetch(`/api/resources/${resourceId}/comments/${commentId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: replyContent }),
      });

      if (response.ok) {
        const reply = await response.json();
        setComments(prev => 
          prev.map(comment => 
            comment.id === commentId 
              ? { 
                  ...comment, 
                  replies: [...(comment.replies || []), reply],
                  _count: { 
                    ...comment._count, 
                    replies: comment._count.replies + 1 
                  }
                }
              : comment
          )
        );
        setReplyContent('');
        setReplyingTo(null);
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
    }
  };

  const handleLike = async (commentId: string) => {
    try {
      const response = await fetch(`/api/resources/${resourceId}/comments/${commentId}/like`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setComments(prev => 
          prev.map(comment => 
            comment.id === commentId 
              ? { 
                  ...comment, 
                  isLiked: data.liked,
                  _count: { 
                    ...comment._count, 
                    likes: data.likeCount 
                  }
                }
              : comment
          )
        );
      }
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`flex gap-3 ${isReply ? 'ml-12' : ''}`}>
      <Avatar className="h-10 w-10">
        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          {comment.user.name?.charAt(0) || <User className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm text-gray-900">
            {comment.user.name || 'Anonymous User'}
          </span>
          <span className="text-xs text-gray-500 flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </span>
        </div>
        <p className="text-sm text-gray-700 mb-2 bg-gray-50 p-3 rounded-lg">{comment.content}</p>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleLike(comment.id)}
            className={`h-6 px-2 text-xs ${comment.isLiked ? 'text-red-600' : 'text-gray-500'} hover:bg-gray-100`}
          >
            <Heart className={`h-3 w-3 mr-1 ${comment.isLiked ? 'fill-current' : ''}`} />
            {comment._count.likes}
          </Button>
          
          {!isReply && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
              className="h-6 px-2 text-xs text-gray-500 hover:bg-gray-100"
            >
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>
          )}
        </div>
        
        {replyingTo === comment.id && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              rows={2}
              className="mb-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReplyingTo(null)}
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => handleReply(comment.id)}
                disabled={!replyContent.trim()}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white"
              >
                Reply
              </Button>
            </div>
          </div>
        )}
        
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {comment.replies.map(reply => renderComment(reply, true))}
            {comment._count.replies > comment.replies!.length && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-gray-500 hover:bg-gray-100"
                onClick={() => window.location.href = `/dashboard/resources/${resourceId}`}
              >
                View all {comment._count.replies} replies
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border-0 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl font-bold text-gray-900">
          <MessageCircle className="h-5 w-5 text-blue-600" />
          Comments {comments.length > 0 && `(${comments.reduce((acc, comment) => acc + 1 + (comment.replies?.length || 0), 0)})`}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-4 md:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts about this resource..."
            rows={3}
            disabled={isSubmitting}
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isSubmitting || !newComment.trim()}
              className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white"
            >
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </form>

        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-2">
                No comments yet
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Be the first to share your thoughts on this resource.
              </p>
            </div>
          ) : (
            <>
              {comments.map(comment => renderComment(comment))}
              {hasMore && (
                <div className="text-center pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setPage(prev => prev + 1)}
                    disabled={isLoading}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    {isLoading ? 'Loading...' : 'Load More Comments'}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}