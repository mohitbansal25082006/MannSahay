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
  Reply
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useSession } from 'next-auth/react';

interface ReplyItemProps {
  reply: {
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
  };
  currentUserId?: string;
  isLiked?: boolean;
  onLike?: () => void;
  onFlag?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onReply?: () => void;
  isNested?: boolean;
}

export default function ReplyItem({
  reply,
  currentUserId,
  isLiked = false,
  onLike,
  onFlag,
  onDelete,
  onEdit,
  onReply,
  isNested = false
}: ReplyItemProps) {
  const { data: session } = useSession();
  const [showActions, setShowActions] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const isAuthor = currentUserId === reply.author.id;

  useEffect(() => {
    checkAdminStatus();
  }, []);

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
  
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'HIGH': return 'bg-red-100 text-red-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className={`${isNested ? 'ml-8 mt-2' : 'mt-4'} border-l-4 ${reply.flagged ? 'border-l-red-500' : 'border-l-gray-200'}`}>
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
              </div>
              <p className="text-xs text-gray-500 mb-2">
                {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
              </p>
              <p className="text-gray-700">{reply.content}</p>
              
              <div className="flex items-center space-x-3 mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLike}
                  className={`flex items-center space-x-1 ${isLiked ? 'text-red-500' : 'text-gray-500'}`}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{reply._count.likes}</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onReply}
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
                      onClick={onEdit}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Edit className="h-4 w-4 inline mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={onDelete}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <Trash2 className="h-4 w-4 inline mr-2" />
                      Delete
                    </button>
                  </>
                )}
                <button
                  onClick={onFlag}
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
  );
}