// E:\mannsahay\src\components\resources\resource-actions.tsx
'use client';

import { useState } from 'react';
import { Resource } from '@/types';
import { Button } from '@/components/ui/button';
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
import { Share2, Download, Bookmark, MoreHorizontal } from 'lucide-react';

interface ResourceActionsProps {
  resource: Resource;
  isBookmarked: boolean;
  onBookmark: () => void;
  onDownload: () => void;
  onShare: (platform: string) => void;
}

export default function ResourceActions({
  resource,
  isBookmarked,
  onBookmark,
  onDownload,
  onShare,
}: ResourceActionsProps) {
  const [showShareDialog, setShowShareDialog] = useState(false);

  const shareOptions = [
    { platform: 'copy_link', label: 'Copy Link' },
    { platform: 'whatsapp', label: 'WhatsApp' },
    { platform: 'facebook', label: 'Facebook' },
    { platform: 'twitter', label: 'Twitter' },
    { platform: 'linkedin', label: 'LinkedIn' },
  ];

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBookmark}
        className={`p-2 h-8 w-8 ${
          isBookmarked ? 'text-blue-600' : 'text-gray-500'
        }`}
      >
        <Bookmark
          className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`}
        />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onDownload}
        className="p-2 h-8 w-8 text-gray-500"
      >
        <Download className="h-4 w-4" />
      </Button>
      
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="p-2 h-8 w-8 text-gray-500"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Resource</DialogTitle>
            <DialogDescription>
              Share &ldquo;{resource.title}&rdquo; with others
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {shareOptions.map((option) => (
              <Button
                key={option.platform}
                variant="outline"
                onClick={() => {
                  onShare(option.platform);
                  setShowShareDialog(false);
                }}
                className="justify-start"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="p-2 h-8 w-8 text-gray-500"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onBookmark}>
            <Bookmark className="mr-2 h-4 w-4" />
            {isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowShareDialog(true)}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}