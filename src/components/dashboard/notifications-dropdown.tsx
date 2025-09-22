// E:\mannsahay\src\components\dashboard\notifications-dropdown.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Calendar, 
  MessageSquare, 
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle,
  BookOpen,
  Flag,
  Eye,
  Check,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface ModerationResult {
  violatesPolicy: boolean;
  reason?: string;
  actionTaken?: string;
}

interface NotificationMetadata {
  bookingId?: string;
  postId?: string;
  moderationResult?: ModerationResult;
  [key: string]: unknown; // For any additional metadata properties
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  metadata?: NotificationMetadata;
}

interface ApiResponse {
  notifications: Notification[];
  unreadCount: number;
  totalCount: number;
  hasMore: boolean;
}

export default function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
    
    // Set up periodic refresh every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    setError(null);
    
    try {
      const response = await fetch('/api/user/notifications?limit=5');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch notifications');
      }
      
      const data: ApiResponse = await response.json();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch notifications');
      if (!silent) {
        toast.error('Failed to load notifications');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/user/notifications/${notificationId}/read`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
    
    if (unreadIds.length === 0) return;
    
    try {
      const promises = unreadIds.map(id => 
        fetch(`/api/user/notifications/${id}/read`, { method: 'POST' })
      );
      
      await Promise.all(promises);
      
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'BOOKING_CONFIRMED':
      case 'BOOKING_REMINDER':
      case 'BOOKING_CANCELLED':
        return <Calendar className="h-4 w-4 text-green-500" />;
      case 'MESSAGE':
      case 'reply':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'flagged_content':
      case 'content_flagged':
        return <Flag className="h-4 w-4 text-orange-500" />;
      case 'content_moderated':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'flag_reviewed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationAction = (notification: Notification) => {
    switch (notification.type) {
      case 'BOOKING_CONFIRMED':
      case 'BOOKING_REMINDER':
        const bookingId = notification.metadata?.bookingId;
        if (bookingId) {
          return (
            <Button variant="outline" size="sm" className="mt-2 h-7 text-xs" asChild>
              <Link href={`/dashboard/booking/${bookingId}`}>
                <Calendar className="h-3 w-3 mr-1" />
                View Booking
              </Link>
            </Button>
          );
        }
        break;
        
      case 'reply':
        const postId = notification.metadata?.postId;
        if (postId) {
          return (
            <Button variant="outline" size="sm" className="mt-2 h-7 text-xs" asChild>
              <Link href={`/dashboard/forum/post/${postId}`}>
                <Eye className="h-3 w-3 mr-1" />
                View Reply
              </Link>
            </Button>
          );
        } else {
          return (
            <Button variant="outline" size="sm" className="mt-2 h-7 text-xs" asChild>
              <Link href="/dashboard/forum">
                <MessageSquare className="h-3 w-3 mr-1" />
                View Forum
              </Link>
            </Button>
          );
        }
        
      case 'content_moderated':
        return (
          <Button variant="outline" size="sm" className="mt-2 h-7 text-xs" asChild>
            <Link href="/dashboard/guidelines">
              <BookOpen className="h-3 w-3 mr-1" />
              View Guidelines
            </Link>
          </Button>
        );
        
      case 'content_flagged':
        const moderationResult = notification.metadata?.moderationResult;
        if (moderationResult) {
          return (
            <div className="mt-2 p-2 bg-orange-50 rounded border border-orange-200">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-3 w-3 text-orange-600" />
                <span className="font-medium text-xs">Under Review</span>
              </div>
              <p className="text-xs text-gray-600">
                {moderationResult.violatesPolicy 
                  ? "Content is being reviewed for policy violations."
                  : "Content has been flagged for review."
                }
              </p>
            </div>
          );
        }
        break;
        
      case 'flag_reviewed':
        const reviewResult = notification.metadata?.moderationResult;
        if (reviewResult) {
          return (
            <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span className="font-medium text-xs">Review Complete</span>
              </div>
              <p className="text-xs text-gray-600">
                {reviewResult.violatesPolicy 
                  ? "Content was found to violate our policies."
                  : "Content complies with our policies."
                }
              </p>
            </div>
          );
        }
        break;
        
      default:
        return null;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80 p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <DropdownMenuLabel className="p-0">
            <div className="flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {unreadCount} new
                </Badge>
              )}
            </div>
          </DropdownMenuLabel>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchNotifications(true)}
              disabled={refreshing}
              className="h-6 w-6 p-0"
              title="Refresh"
            >
              <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-6 w-6 p-0"
                title="Mark all as read"
              >
                <Check className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Content */}
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-3">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fetchNotifications()}
              >
                Try Again
              </Button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 hover:bg-gray-50 transition-colors ${
                    notification.isRead ? '' : 'bg-blue-50/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`text-sm font-medium leading-tight ${
                          notification.isRead ? 'text-gray-700' : 'text-gray-900'
                        }`}>
                          {notification.title}
                        </h4>
                        
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {formatDistanceToNow(new Date(notification.createdAt), { 
                              addSuffix: true 
                            })}
                          </span>
                          
                          {!notification.isRead && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                className="h-5 w-5 p-0"
                                title="Mark as read"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <p className={`text-sm mt-1 leading-snug ${
                        notification.isRead ? 'text-gray-600' : 'text-gray-800'
                      }`}>
                        {notification.message.length > 100 
                          ? `${notification.message.substring(0, 100)}...` 
                          : notification.message
                        }
                      </p>
                      
                      {getNotificationAction(notification)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <DropdownMenuItem asChild className="justify-center">
                <Link href="/dashboard/notifications" className="w-full text-center">
                  View all notifications
                </Link>
              </DropdownMenuItem>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}