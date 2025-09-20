// E:\mannsahay\src\components\resources\resource-card.tsx
'use client';

import { useState } from 'react';
import { Resource, ResourceType } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import ResourceActions from './resource-actions';
import ResourcePlayer from './resource-player';
import ResourceViewer from './resource-viewer';
import {
  FileText,
  Video,
  Music,
  Headphones,
  File,
  Dumbbell,
  MoreHorizontal,
  Star,
  Eye,
  Download,
  Clock,
  Bookmark,
  Share,
} from 'lucide-react';
import Link from 'next/link';

interface ResourceCardProps {
  resource: Resource;
  viewMode: 'grid' | 'list';
}

export default function ResourceCard({ resource, viewMode }: ResourceCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(resource.isBookmarked || false);
  const [userRating, setUserRating] = useState(resource.userRating || null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [showViewer, setShowViewer] = useState(false);

  const getResourceIcon = (type: ResourceType) => {
    switch (type) {
      case ResourceType.ARTICLE:
        return <FileText className="h-5 w-5" />;
      case ResourceType.VIDEO:
        return <Video className="h-5 w-5" />;
      case ResourceType.AUDIO:
        return <Headphones className="h-5 w-5" />;
      case ResourceType.MUSIC:
        return <Music className="h-5 w-5" />;
      case ResourceType.MEDITATION:
        return <Headphones className="h-5 w-5" />;
      case ResourceType.PDF:
        return <File className="h-5 w-5" />;
      case ResourceType.EXERCISE:
        return <Dumbbell className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleBookmark = async () => {
    try {
      const response = await fetch(`/api/resources/${resource.id}/bookmark`, {
        method: 'POST',
      });
      const data = await response.json();
      setIsBookmarked(data.bookmarked);
    } catch (error) {
      console.error('Error bookmarking resource:', error);
    }
  };

  const handleRate = async (rating: number) => {
    try {
      const response = await fetch(`/api/resources/${resource.id}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating }),
      });
      const data = await response.json();
      setUserRating(data.rating);
    } catch (error) {
      console.error('Error rating resource:', error);
    }
  };

  const handleShare = async (platform: string) => {
    try {
      await fetch(`/api/resources/${resource.id}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ platform }),
      });
      
      // Implement actual sharing logic
      if (platform === 'copy_link') {
        navigator.clipboard.writeText(window.location.origin + `/dashboard/resources/${resource.id}`);
      }
    } catch (error) {
      console.error('Error sharing resource:', error);
    }
  };

  const handleDownload = async () => {
    try {
      await fetch(`/api/resources/${resource.id}/download`, {
        method: 'POST',
      });
      
      // Trigger actual download
      if (resource.fileUrl) {
        const link = document.createElement('a');
        link.href = resource.fileUrl;
        link.download = resource.title;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error downloading resource:', error);
    }
  };

  const getLanguageName = (code: string) => {
    const languages: Record<string, string> = {
      en: 'English',
      hi: 'Hindi',
      ta: 'Tamil',
      bn: 'Bengali',
      te: 'Telugu',
      mr: 'Marathi',
      gu: 'Gujarati',
      kn: 'Kannada',
      ml: 'Malayalam',
      pa: 'Punjabi',
    };
    return languages[code] || code;
  };

  const cardContent = (
    <>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="text-blue-600">
              {getResourceIcon(resource.type)}
            </div>
            <Badge variant="secondary" className="text-xs">
              {resource.type.replace('_', ' ')}
            </Badge>
          </div>
          
          <Badge variant="outline" className="text-xs">
            {getLanguageName(resource.language)}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900 line-clamp-2">
            {resource.title}
          </h3>
          {resource.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {resource.description}
            </p>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-1 mb-3">
          {resource.categories.slice(0, 3).map((category) => (
            <Badge key={category} variant="outline" className="text-xs">
              {category}
            </Badge>
          ))}
          {resource.categories.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{resource.categories.length - 3} more
            </Badge>
          )}
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            {resource.duration && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(resource.duration)}
              </div>
            )}
            
            {resource.fileSize && (
              <div className="flex items-center gap-1">
                <Download className="h-3 w-3" />
                {formatFileSize(resource.fileSize)}
              </div>
            )}
            
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {resource.viewCount}
            </div>
          </div>
          
          {resource.averageRating && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {resource.averageRating}
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-3">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 cursor-pointer ${
                  star <= (userRating || 0)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
                onClick={() => handleRate(star)}
              />
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmark}
              className="p-1 h-8 w-8"
            >
              <Bookmark
                className={`h-4 w-4 ${
                  isBookmarked ? 'fill-blue-600 text-blue-600' : ''
                }`}
              />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowPlayer(true)}>
                  Play/View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownload}>
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare('copy_link')}>
                  Copy Link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare('whatsapp')}>
                  Share on WhatsApp
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardFooter>
    </>
  );

  if (viewMode === 'list') {
    return (
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <Link href={`/dashboard/resources/${resource.id}`}>
          <div className="flex">
            <div className="w-48 flex-shrink-0 bg-gray-100 flex items-center justify-center">
              <div className="text-blue-600">
                {getResourceIcon(resource.type)}
              </div>
            </div>
            <div className="flex-1 p-4">
              {cardContent}
            </div>
          </div>
        </Link>
        
        <Dialog open={showPlayer} onOpenChange={setShowPlayer}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{resource.title}</DialogTitle>
              <DialogDescription>
                {resource.description}
              </DialogDescription>
            </DialogHeader>
            {resource.type === ResourceType.VIDEO ||
            resource.type === ResourceType.AUDIO ||
            resource.type === ResourceType.MUSIC ||
            resource.type === ResourceType.MEDITATION ? (
              <ResourcePlayer resource={resource} />
            ) : (
              <ResourceViewer resource={resource} />
            )}
          </DialogContent>
        </Dialog>
      </Card>
    );
  }

  return (
    <>
      <Card className="overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
        <Link href={`/dashboard/resources/${resource.id}`} className="flex-1">
          {cardContent}
        </Link>
      </Card>
      
      <Dialog open={showPlayer} onOpenChange={setShowPlayer}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{resource.title}</DialogTitle>
            <DialogDescription>
              {resource.description}
            </DialogDescription>
          </DialogHeader>
          {resource.type === ResourceType.VIDEO ||
          resource.type === ResourceType.AUDIO ||
          resource.type === ResourceType.MUSIC ||
          resource.type === ResourceType.MEDITATION ? (
            <ResourcePlayer resource={resource} />
          ) : (
            <ResourceViewer resource={resource} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}