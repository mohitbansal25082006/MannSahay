'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Check, 
  AlertTriangle, 
  Info, 
  Shield, 
  RefreshCw,
  MessageCircle,
  Eye,
  XCircle,
  Trash2,
  BookOpen
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import Link from 'next/link';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  metadata?: {
    postId?: string;
  };
}

interface ApiResponse {
  notifications: Notification[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  const fetchNotifications = async (showRefreshing = false, append = false) => {
    if (!session?.user?.id) return;
    
    if (showRefreshing) {
      setRefreshing(true);
    } else if (!append) {
      setLoading(true);
    }
    
    setError(null);
    
    try {
      const response = await fetch(`/api/user/notifications?limit=10&offset=${append ? offset : 0}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch notifications');
      }
      
      const data: ApiResponse = await response.json();
      
      if (append) {
        setNotifications(prev => [...prev, ...data.notifications]);
      } else {
        setNotifications(data.notifications);
      }
      
      setHasMore(data.pagination.hasMore);
      setOffset(data.pagination.offset + data.pagination.limit);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch notifications');
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [session?.user?.id]);

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const response = await fetch('/api/user/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationIds, isRead: true }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark notifications as read');
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          notificationIds.includes(n.id) ? { ...n, isRead: true } : n
        )
      );
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      toast.error('Failed to mark notifications as read');
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications
      .filter(n => !n.isRead)
      .map(n => n.id);
    
    if (unreadIds.length > 0) {
      await markAsRead(unreadIds);
      toast.success('All notifications marked as read');
    }
  };

  const clearAllNotifications = async () => {
    try {
      const response = await fetch('/api/user/notifications', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          notificationIds: notifications.map(n => n.id) 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to clear notifications');
      }

      setNotifications([]);
      toast.success('All notifications cleared');
    } catch (error) {
      console.error('Error clearing notifications:', error);
      toast.error('Failed to clear notifications');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'flagged_content':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'content_moderated':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'reply':
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationAction = (notification: Notification) => {
    switch (notification.type) {
      case 'content_moderated':
        return (
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            asChild
          >
            <Link href="/dashboard/guidelines">
              <BookOpen className="h-4 w-4 mr-2" />
              View Guidelines
            </Link>
          </Button>
        );
      case 'reply':
        // Check if we have post ID in metadata
        const postId = notification.metadata?.postId;
        if (postId) {
          return (
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              asChild
            >
              <Link href={`/dashboard/forum/post/${postId}`}>
                <Eye className="h-4 w-4 mr-2" />
                View Reply
              </Link>
            </Button>
          );
        } else {
          // Fallback if no post ID
          return (
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              asChild
            >
              <Link href="/dashboard/forum">
                <Eye className="h-4 w-4 mr-2" />
                View Forum
              </Link>
            </Button>
          );
        }
      default:
        return null;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Notifications</h1>
        <p className="text-gray-600">
          Stay updated with replies to your posts and moderation actions
        </p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-medium">
            All Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} unread
              </Badge>
            )}
          </h2>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fetchNotifications(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={markAllAsRead}
            >
              <Check className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
          
          {notifications.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearAllNotifications}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear all
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="py-8">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Error loading notifications
              </h3>
              <p className="text-gray-500 mb-4">{error}</p>
              <Button onClick={() => fetchNotifications()}>
                Try again
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="py-12">
              <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No notifications
              </h3>
              <p className="text-gray-500">
                You don&apos;t have any notifications yet.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card key={notification.id} className={`transition-all ${notification.isRead ? 'bg-white' : 'bg-blue-50 border-blue-200'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getNotificationIcon(notification.type)}
                    <div>
                      <CardTitle className={`text-base ${notification.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                        {notification.title}
                      </CardTitle>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  
                  {!notification.isRead && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => markAsRead([notification.id])}
                      className="h-8 w-8 p-0"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className={`text-sm ${notification.isRead ? 'text-gray-600' : 'text-gray-800'}`}>
                  {notification.message}
                </p>
                {getNotificationAction(notification)}
              </CardContent>
            </Card>
          ))}
          
          {hasMore && (
            <div className="text-center pt-4">
              <Button 
                variant="outline" 
                onClick={() => fetchNotifications(false, true)}
                disabled={refreshing}
              >
                {refreshing ? 'Loading...' : 'Load more'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}