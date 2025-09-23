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
          <div className="flex flex-col items-center justify-center h-[70vh] bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-md">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-gray-600 mb-4 font-medium">PDF Document</p>
            <p className="text-sm text-gray-500 mb-4">
              {resource.fileSize ? `${(resource.fileSize / 1024 / 1024).toFixed(2)} MB` : ''}
            </p>
            <div className="flex gap-2">
              <Button onClick={handleDownload} className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white">
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
              {resource.fileUrl && (
                <Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-50" asChild>
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
              className="w-full max-h-[70vh] rounded-lg shadow-lg"
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
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-8 shadow-md">
            <div className="flex items-center justify-center mb-6">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center shadow-lg">
                <Headphones className="h-16 w-16 text-blue-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-center text-gray-900 mb-4">
              {resource.title}
            </h3>
            <p className="text-gray-600 text-center max-w-md mb-6">
              {resource.description}
            </p>
            <div className="flex justify-center">
              <audio
                src={resource.fileUrl || ''}
                controls
                className="w-full max-w-md bg-white rounded-lg shadow-sm"
                preload="metadata"
              >
                Your browser does not support the audio element.
              </audio>
            </div>
            <div className="flex justify-center mt-6">
              <Button onClick={handleDownload} className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white">
                <Download className="mr-2 h-4 w-4" />
                Download Audio
              </Button>
            </div>
          </div>
        );

      case ResourceType.INFOGRAPHIC:
        return (
          <div className="flex flex-col items-center justify-center h-[70vh] bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-md">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <File className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-gray-600 mb-4 font-medium">Infographic Image</p>
            <p className="text-sm text-gray-500 mb-4">
              {resource.fileSize ? `${(resource.fileSize / 1024 / 1024).toFixed(2)} MB` : ''}
            </p>
            {resource.fileUrl && (
              <div className="flex flex-col items-center">
                <img
                  src={resource.fileUrl}
                  alt={resource.title}
                  className="max-w-full max-h-[50vh] object-contain rounded-lg shadow-sm mb-4"
                />
                <div className="flex gap-2">
                  <Button onClick={handleDownload} className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white">
                    <Download className="mr-2 h-4 w-4" />
                    Download Image
                  </Button>
                  <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50" asChild>
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
          <div className="flex flex-col items-center justify-center h-[70vh] bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-md">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-gray-600 mb-4 font-medium">
              {resource.type === ResourceType.WORKSHEET ? 'Worksheet' : 'Guide'} Document
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {resource.fileSize ? `${(resource.fileSize / 1024 / 1024).toFixed(2)} MB` : ''}
            </p>
            <div className="flex gap-2">
              <Button onClick={handleDownload} className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white">
                <Download className="mr-2 h-4 w-4" />
                Download {resource.type === ResourceType.WORKSHEET ? 'Worksheet' : 'Guide'}
              </Button>
              {resource.fileUrl && (
                <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50" asChild>
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
            <div className="prose max-w-none bg-white p-6 rounded-lg shadow-sm">
              <ReactMarkdown>{resource.content}</ReactMarkdown>
            </div>
          );
        } else if (resource.fileUrl) {
          return (
            <div className="flex flex-col items-center justify-center h-[70vh] bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-md">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-gray-600 mb-4 font-medium">Document File</p>
              <p className="text-sm text-gray-500 mb-4">
                {resource.fileSize ? `${(resource.fileSize / 1024 / 1024).toFixed(2)} MB` : ''}
              </p>
              <div className="flex gap-2">
                <Button onClick={handleDownload} className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white">
                  <Download className="mr-2 h-4 w-4" />
                  Download File
                </Button>
                <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50" asChild>
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
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500">No content available for viewing</p>
            </div>
          );
        }
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl text-gray-900">{resource.title}</CardTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {resource.type.replace('_', ' ')}
                </Badge>
                <Badge variant="outline" className="border-blue-200 text-blue-700">
                  {getLanguageName(resource.language)}
                </Badge>
                {resource.author && (
                  <Badge variant="outline" className="border-blue-200 text-blue-700">
                    By {resource.author}
                  </Badge>
                )}
              </div>
            </div>
            
            {resource.fileUrl && (
              <Button onClick={handleDownload} className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white">
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
            <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="content" className="data-[state=active]:bg-white data-[state=active]:shadow rounded-md transition-all">
                Content
              </TabsTrigger>
              <TabsTrigger value="details" className="data-[state=active]:bg-white data-[state=active]:shadow rounded-md transition-all">
                Details
              </TabsTrigger>
              <TabsTrigger value="summary" className="data-[state=active]:bg-white data-[state=active]:shadow rounded-md transition-all">
                Summary
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="content" className="mt-4">
              {renderContent()}
            </TabsContent>
            
            <TabsContent value="details" className="mt-4 space-y-4">
              <div>
                <h3 className="font-medium mb-2">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {resource.categories.map((category) => (
                    <Badge key={category} variant="outline" className="border-blue-200 text-blue-700">
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
                    <Badge key={tag} variant="outline" className="border-blue-200 text-blue-700">
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
                <div className="prose max-w-none bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <ReactMarkdown>{resource.summary}</ReactMarkdown>
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
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