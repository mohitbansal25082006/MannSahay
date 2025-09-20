'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Resource, ResourceType } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ResourcePlayer from '@/components/resources/resource-player';
import ResourceViewer from '@/components/resources/resource-viewer';
import ResourceRating from '@/components/resources/resource-rating';
import TranslationToggle from '@/components/resources/translation-toggle';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Bookmark, 
  Star, 
  Eye, 
  Clock,
  FileText,
  Calendar,
  User,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

export default function ResourceDetailPage() {
  const params = useParams();
  const resourceId = params.id as string;
  
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<string>('');
  const [translatedDescription, setTranslatedDescription] = useState<string>('');
  const [showTranslation, setShowTranslation] = useState(false);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const response = await fetch(`/api/resources/${resourceId}`);
        const data = await response.json();
        setResource(data);
        setIsBookmarked(data.isBookmarked || false);
      } catch (error) {
        console.error('Error fetching resource:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResource();
  }, [resourceId]);

  const handleBookmark = async () => {
    try {
      const response = await fetch(`/api/resources/${resourceId}/bookmark`, {
        method: 'POST',
      });
      const data = await response.json();
      setIsBookmarked(data.bookmarked);
    } catch (error) {
      console.error('Error bookmarking resource:', error);
    }
  };

  const handleDownload = async () => {
    try {
      await fetch(`/api/resources/${resourceId}/download`, {
        method: 'POST',
      });
      
      if (resource?.fileUrl) {
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

  const handleShare = async (platform: string) => {
    try {
      await fetch(`/api/resources/${resourceId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ platform }),
      });
      
      if (platform === 'copy_link') {
        navigator.clipboard.writeText(window.location.href);
      }
    } catch (error) {
      console.error('Error sharing resource:', error);
    }
  };

  const handleRate = (rating: number, comment?: string) => {
    if (resource) {
      setResource({
        ...resource,
        userRating: rating,
        averageRating: resource.averageRating,
      });
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

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Resource Not Found</h1>
            <p className="text-gray-600 mb-6">
              The resource you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/dashboard/resources">
              <Button>Back to Resources</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const displayContent = showTranslation && translatedContent 
    ? translatedContent 
    : resource.content || '';
    
  const displayDescription = showTranslation && translatedDescription 
    ? translatedDescription 
    : resource.description || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/dashboard/resources">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Resources
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        {resource.type.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline">
                        {getLanguageName(resource.language)}
                      </Badge>
                      {resource.isFeatured && (
                        <Badge variant="default">Featured</Badge>
                      )}
                    </div>
                    <CardTitle className="text-2xl">{resource.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {resource.author && (
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {resource.author}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(resource.createdAt)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <ResourceRating
                      resourceId={resource.id}
                      currentRating={resource.userRating || null}
                      onRated={handleRate}
                    />
                  </div>
                </div>
                
                {displayDescription && (
                  <p className="text-gray-600">{displayDescription}</p>
                )}
                
                <div className="flex flex-wrap gap-2">
                  {resource.categories.map((category) => (
                    <Badge key={category} variant="outline">
                      {category}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue="content" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="content" className="mt-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <TranslationToggle
                          originalText={resource.content || ''}
                          targetLanguage="hi"
                          onTranslated={setTranslatedContent}
                        />
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleBookmark}
                            className={`p-2 h-8 w-8 ${
                              isBookmarked ? 'text-blue-600' : 'text-gray-500'
                            }`}
                          >
                            <Bookmark
                              className={`h-4 w-4 ${
                                isBookmarked ? 'fill-current' : ''
                              }`}
                            />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDownload}
                            className="p-2 h-8 w-8 text-gray-500"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShare('copy_link')}
                            className="p-2 h-8 w-8 text-gray-500"
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg overflow-hidden">
                        {resource.fileUrl ? (
                          resource.type === ResourceType.VIDEO ||
                          resource.type === ResourceType.AUDIO ||
                          resource.type === ResourceType.MUSIC ||
                          resource.type === ResourceType.MEDITATION ? (
                            <ResourcePlayer resource={resource} />
                          ) : (
                            <ResourceViewer resource={resource} />
                          )
                        ) : (
                          <ResourceViewer resource={resource} />
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="details" className="mt-4 space-y-6">
                    <div>
                      <h3 className="font-medium mb-2">Resource Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Eye className="h-4 w-4 text-gray-500" />
                            <span>{resource.viewCount} views</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Download className="h-4 w-4 text-gray-500" />
                            <span>{resource.downloadCount} downloads</span>
                          </div>
                          {resource.duration && (
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span>{formatDuration(resource.duration)}</span>
                            </div>
                          )}
                          {resource.fileSize && (
                            <div className="flex items-center gap-2 text-sm">
                              <FileText className="h-4 w-4 text-gray-500" />
                              <span>{formatFileSize(resource.fileSize)}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          {resource.averageRating && (
                            <div className="flex items-center gap-2 text-sm">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span>{resource.averageRating} out of 5</span>
                            </div>
                          )}
                          <div className="text-sm">
                            <span className="text-gray-500">Language: </span>
                            <span>{getLanguageName(resource.language)}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-500">Type: </span>
                            <span>{resource.type.replace('_', ' ')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="font-medium mb-2">Categories</h3>
                      <div className="flex flex-wrap gap-2">
                        {resource.categories.map((category) => (
                          <Badge key={category} variant="outline">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="font-medium mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {resource.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="summary" className="mt-4">
                    {resource.summary ? (
                      <div className="prose max-w-none">
                        <p>{resource.summary}</p>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No summary available for this resource.</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resource Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleBookmark}
                >
                  <Bookmark className={`mr-2 h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                  {isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleDownload}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleShare('copy_link')}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Copy Link
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Views</span>
                  <span className="font-medium">{resource.viewCount}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Downloads</span>
                  <span className="font-medium">{resource.downloadCount}</span>
                </div>
                
                {resource.averageRating && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="font-medium">{resource.averageRating}</span>
                      <span className="text-gray-500">/5</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {resource.summary && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{resource.summary}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}