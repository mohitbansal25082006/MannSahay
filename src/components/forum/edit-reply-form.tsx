'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  X, 
  Save, 
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

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
}

interface EditReplyFormProps {
  reply: Reply;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function EditReplyForm({ reply, onCancel, onSuccess }: EditReplyFormProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState(reply.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error('Content is required');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/forum/replies/${reply.id}/edit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error || 'Failed to update reply');
        return;
      }

      toast.success('Reply updated successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error updating reply:', error);
      toast.error('Failed to update reply. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAuthor = session?.user?.id === reply.author.id;

  if (!isAuthor && !isAdmin) {
    return (
      <Card className="border-l-4 border-l-red-500">
        <CardContent className="pt-4">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span>You can only edit your own replies.</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center text-sm text-blue-600">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Editing reply
            </div>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm"
              onClick={onCancel}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Edit your reply..."
            className="min-h-[100px] mb-3"
            required
          />
          
          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !content.trim()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}