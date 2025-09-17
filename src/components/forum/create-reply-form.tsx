'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface CreateReplyFormProps {
  postId: string;
  parentId?: string;
  onReplyCreated?: () => void;
  placeholder?: string;
  className?: string;
}

export default function CreateReplyForm({
  postId,
  parentId,
  onReplyCreated,
  placeholder = "Write your reply...",
  className = ""
}: CreateReplyFormProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error('Reply content is required');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/forum/replies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          postId,
          parentId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create reply');
      }

      setContent('');
      toast.success('Reply posted successfully!');
      
      if (onReplyCreated) {
        onReplyCreated();
      }
    } catch (error) {
      console.error('Error creating reply:', error);
      toast.error('Failed to post reply. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={className}>
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit}>
          <div className="flex space-x-3">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={session?.user?.image || undefined} alt={session?.user?.name || undefined} />
              <AvatarFallback>
                {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={placeholder}
                className="min-h-[80px]"
                required
              />
              
              <div className="flex justify-end mt-2">
                <Button type="submit" disabled={isSubmitting || !content.trim()}>
                  {isSubmitting ? 'Posting...' : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Reply
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}