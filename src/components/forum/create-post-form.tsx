'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Send, 
  Eye, 
  EyeOff, 
  AlertTriangle,
  Plus
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

const categories = [
  { value: 'general', label: 'General' },
  { value: 'academic', label: 'Academic Stress' },
  { value: 'relationships', label: 'Relationships' },
  { value: 'mental-health', label: 'Mental Health' },
  { value: 'lifestyle', label: 'Lifestyle' },
];

export default function CreatePostForm({ onPostCreated }: { onPostCreated?: () => void }) {
  const { data: session, status } = useSession();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [category, setCategory] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (status !== 'authenticated' || !session?.user?.id) {
      toast.error('You must be signed in to create a post');
      return;
    }
    
    if (!content.trim()) {
      toast.error('Content is required');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/forum/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          isAnonymous,
          category,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error messages from the API
        if (data.error) {
          toast.error(data.error);
          if (data.debug) {
            console.error('Debug info:', data.debug);
          }
        } else {
          toast.error('Failed to create post. Please try again.');
        }
        return;
      }
      
      // Reset form
      setTitle('');
      setContent('');
      setIsAnonymous(true);
      setCategory('general');
      
      toast.success('Post created successfully!');
      
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user is not authenticated, show a sign-in prompt
  if (status !== 'authenticated') {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6 text-center">
          <div className="py-4">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Sign In Required
            </h3>
            <p className="text-gray-500 mb-4">
              You need to be signed in to create posts in the forum.
            </p>
            <Button onClick={() => window.location.href = '/api/auth/signin'}>
              Sign In
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          Create New Post
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title (Optional)</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your post a title..."
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts, feelings, or questions..."
                className="mt-1 min-h-[120px]"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="anonymous"
                  checked={isAnonymous}
                  onCheckedChange={setIsAnonymous}
                />
                <Label htmlFor="anonymous" className="flex items-center">
                  {isAnonymous ? (
                    <EyeOff className="h-4 w-4 mr-1" />
                  ) : (
                    <Eye className="h-4 w-4 mr-1" />
                  )}
                  {isAnonymous ? 'Post Anonymously' : 'Show My Name'}
                </Label>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center text-sm text-gray-500">
                <AlertTriangle className="h-4 w-4 mr-1" />
                All posts are moderated for safety
              </div>
              
              <Button type="submit" disabled={isSubmitting || !content.trim()}>
                {isSubmitting ? 'Posting...' : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Post
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}