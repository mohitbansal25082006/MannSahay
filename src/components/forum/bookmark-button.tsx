// E:\mannsahay\src\components\forum\bookmark-button.tsx

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface BookmarkButtonProps {
  postId: string;
  initialBookmarked?: boolean;
  onBookmarkChange?: (bookmarked: boolean) => void;
  className?: string;
  showCount?: boolean;
  count?: number;
}

export default function BookmarkButton({
  postId,
  initialBookmarked = false,
  onBookmarkChange,
  className = "",
  showCount = false,
  count = 0
}: BookmarkButtonProps) {
  const { data: session } = useSession();
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [isLoading, setIsLoading] = useState(false);

  const handleBookmark = async () => {
    if (!session?.user?.id) {
      toast.error('Please sign in to bookmark posts');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/forum/bookmark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsBookmarked(data.bookmarked);
        onBookmarkChange?.(data.bookmarked);
        toast.success(data.bookmarked ? 'Post bookmarked' : 'Bookmark removed');
      } else {
        toast.error('Failed to bookmark post');
      }
    } catch (error) {
      console.error('Error bookmarking post:', error);
      toast.error('Failed to bookmark post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleBookmark}
      disabled={isLoading}
      className={`flex items-center space-x-1 transition-colors ${
        isBookmarked 
          ? 'text-blue-500 hover:text-blue-600' 
          : 'text-gray-500 hover:text-blue-500'
      } ${className}`}
    >
      <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
      {showCount && <span>{count}</span>}
    </Button>
  );
}