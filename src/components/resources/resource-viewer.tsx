// E:\mannsahay\src\components\resources\resource-viewer.tsx
'use client';

import { useState } from 'react';
import { Resource, ResourceType } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, FileText, ExternalLink, Video, Music, Headphones, File } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ResourceViewerProps {
  resource: Resource;
}

export default function ResourceViewer({ resource }: ResourceViewerProps) {
  const [activeTab, setActiveTab] = useState('content');

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

  const handleDownload = async () => {
    try {
      await fetch(`/api/resources/${resource.id}/download`, {
        method: 'POST',
      });
      
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

  const renderContent = () => {
    // Handle different resource types
    switch (resource.type) {
      case ResourceType.PDF:
        return (
          <div className="flex flex-col items-center justify-center h-[70vh] bg-gray-50 rounded-lg">
            <FileText className="h-16 w-16 text-blue-600 mb-4" />
            <p className="text-gray-600 mb-4">PDF Document</p>
            <p className="text-sm text-gray-500 mb-4">
              {resource.fileSize ? `${(resource.fileSize / 1024 / 1024).toFixed(2)} MB` : ''}
            </p>
            <div className="flex gap-2">
              <Button onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
              {resource.fileUrl && (
                <Button variant="outline" asChild>
                  <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open in New Tab
                  </a>
                </Button>
              )}
            </div>
          </div>
        );

      case ResourceType.VIDEO:
        return (
          <div className="w-full">
            <video
              src={resource.fileUrl || ''}
              controls
              className="w-full max-h-[70vh] rounded-lg"
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        );

      case ResourceType.AUDIO:
      case ResourceType.MUSIC:
      case ResourceType.MEDITATION:
        return (
          <div className="bg-gray-50 rounded-lg p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center">
                <Headphones className="h-16 w-16 text-blue-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-center mb-4">
              {resource.title}
            </h3>
            <p className="text-gray-600 text-center max-w-md mb-6">
              {resource.description}
            </p>
            <div className="flex justify-center">
              <audio
                src={resource.fileUrl || ''}
                controls
                className="w-full max-w-md"
                preload="metadata"
              >
                Your browser does not support the audio element.
              </audio>
            </div>
            <div className="flex justify-center mt-6">
              <Button onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download Audio
              </Button>
            </div>
          </div>
        );

      case ResourceType.INFOGRAPHIC:
        return (
          <div className="flex flex-col items-center justify-center h-[70vh] bg-gray-50 rounded-lg">
            <File className="h-16 w-16 text-blue-600 mb-4" />
            <p className="text-gray-600 mb-4">Infographic Image</p>
            <p className="text-sm text-gray-500 mb-4">
              {resource.fileSize ? `${(resource.fileSize / 1024 / 1024).toFixed(2)} MB` : ''}
            </p>
            {resource.fileUrl && (
              <div className="flex flex-col items-center">
                <img
                  src={resource.fileUrl}
                  alt={resource.title}
                  className="max-w-full max-h-[50vh] object-contain rounded-lg mb-4"
                />
                <div className="flex gap-2">
                  <Button onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Image
                  </Button>
                  <Button variant="outline" asChild>
                    <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Full Size
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </div>
        );

      case ResourceType.WORKSHEET:
      case ResourceType.GUIDE:
        return (
          <div className="flex flex-col items-center justify-center h-[70vh] bg-gray-50 rounded-lg">
            <FileText className="h-16 w-16 text-blue-600 mb-4" />
            <p className="text-gray-600 mb-4">
              {resource.type === ResourceType.WORKSHEET ? 'Worksheet' : 'Guide'} Document
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {resource.fileSize ? `${(resource.fileSize / 1024 / 1024).toFixed(2)} MB` : ''}
            </p>
            <div className="flex gap-2">
              <Button onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download {resource.type === ResourceType.WORKSHEET ? 'Worksheet' : 'Guide'}
              </Button>
              {resource.fileUrl && (
                <Button variant="outline" asChild>
                  <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open in New Tab
                  </a>
                </Button>
              )}
            </div>
          </div>
        );

      case ResourceType.ARTICLE:
      case ResourceType.EXERCISE:
      default:
        if (resource.content) {
          return (
            <div className="prose max-w-none">
              <ReactMarkdown>{resource.content}</ReactMarkdown>
            </div>
          );
        } else if (resource.fileUrl) {
          return (
            <div className="flex flex-col items-center justify-center h-[70vh] bg-gray-50 rounded-lg">
              <FileText className="h-16 w-16 text-blue-600 mb-4" />
              <p className="text-gray-600 mb-4">Document File</p>
              <p className="text-sm text-gray-500 mb-4">
                {resource.fileSize ? `${(resource.fileSize / 1024 / 1024).toFixed(2)} MB` : ''}
              </p>
              <div className="flex gap-2">
                <Button onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download File
                </Button>
                <Button variant="outline" asChild>
                  <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open in New Tab
                  </a>
                </Button>
              </div>
            </div>
          );
        } else {
          return (
            <div className="text-center py-12">
              <p className="text-gray-500">No content available for viewing</p>
            </div>
          );
        }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{resource.title}</CardTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="secondary">
                  {resource.type.replace('_', ' ')}
                </Badge>
                <Badge variant="outline">
                  {getLanguageName(resource.language)}
                </Badge>
                {resource.author && (
                  <Badge variant="outline">By {resource.author}</Badge>
                )}
              </div>
            </div>
            
            {resource.fileUrl && (
              <Button onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            )}
          </div>
          
          {resource.description && (
            <p className="text-gray-600 mt-2">{resource.description}</p>
          )}
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
            </TabsList>
            
            <TabsContent value="content" className="mt-4">
              {renderContent()}
            </TabsContent>
            
            <TabsContent value="details" className="mt-4 space-y-4">
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
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">File Information</h3>
                  <div className="space-y-1 text-sm">
                    {resource.fileSize && (
                      <p>Size: {(resource.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                    )}
                    {resource.duration && (
                      <p>Duration: {Math.floor(resource.duration / 60)}:{(resource.duration % 60).toString().padStart(2, '0')}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Statistics</h3>
                  <div className="space-y-1 text-sm">
                    <p>Views: {resource.viewCount}</p>
                    <p>Downloads: {resource.downloadCount}</p>
                    {resource.averageRating && (
                      <p>Rating: {resource.averageRating}/5</p>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="summary" className="mt-4">
              {resource.summary ? (
                <div className="prose max-w-none">
                  <ReactMarkdown>{resource.summary}</ReactMarkdown>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No summary available</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}