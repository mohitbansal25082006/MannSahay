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
    switch (resource.type) {
      case ResourceType.PDF:
        return (
          <div className="flex flex-col items-center justify-center min-h-[300px] md:min-h-[400px] lg:min-h-[500px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-md p-4 md:p-6">
            <div className="bg-red-100 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-4 md:mb-6">
              <FileText className="h-8 w-8 md:h-10 md:w-10 text-red-600" />
            </div>
            <p className="text-gray-600 mb-4 font-medium text-lg md:text-xl text-center">PDF Document</p>
            <p className="text-sm md:text-base text-gray-500 mb-4 md:mb-6 text-center">
              {resource.fileSize ? `${(resource.fileSize / 1024 / 1024).toFixed(2)} MB` : ''}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm md:max-w-md">
              <Button 
                onClick={handleDownload} 
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white flex-1 py-3 md:py-4 text-sm md:text-base"
                size="lg"
              >
                <Download className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                Download PDF
              </Button>
              {resource.fileUrl && (
                <Button 
                  variant="outline" 
                  className="border-red-200 text-red-700 hover:bg-red-50 flex-1 py-3 md:py-4 text-sm md:text-base"
                  size="lg"
                  asChild
                >
                  <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                    Open
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
              className="w-full h-auto max-h-[50vh] md:max-h-[60vh] lg:max-h-[70vh] rounded-lg shadow-lg"
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
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 md:p-8 shadow-md">
            <div className="flex items-center justify-center mb-4 md:mb-6">
              <div className="w-20 h-20 md:w-32 md:h-32 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center shadow-lg">
                <Headphones className="h-10 w-10 md:h-16 md:w-16 text-blue-600" />
              </div>
            </div>
            <h3 className="text-xl md:text-2xl font-semibold text-center text-gray-900 mb-4 px-2">
              {resource.title}
            </h3>
            <p className="text-gray-600 text-center max-w-2xl mb-6 text-base md:text-lg px-2">
              {resource.description}
            </p>
            <div className="flex justify-center mb-6 px-2">
              <audio
                src={resource.fileUrl || ''}
                controls
                className="w-full max-w-md bg-white rounded-lg shadow-sm"
                preload="metadata"
              >
                Your browser does not support the audio element.
              </audio>
            </div>
            <div className="flex justify-center px-2">
              <Button 
                onClick={handleDownload} 
                className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white w-full max-w-xs py-3 md:py-4 text-sm md:text-base"
                size="lg"
              >
                <Download className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                Download Audio
              </Button>
            </div>
          </div>
        );

      case ResourceType.INFOGRAPHIC:
        return (
          <div className="flex flex-col items-center justify-center min-h-[300px] md:min-h-[400px] lg:min-h-[500px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-md p-4 md:p-6">
            <div className="bg-purple-100 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-4 md:mb-6">
              <File className="h-8 w-8 md:h-10 md:w-10 text-purple-600" />
            </div>
            <p className="text-gray-600 mb-4 font-medium text-lg md:text-xl text-center">Infographic Image</p>
            <p className="text-sm md:text-base text-gray-500 mb-4 md:mb-6 text-center">
              {resource.fileSize ? `${(resource.fileSize / 1024 / 1024).toFixed(2)} MB` : ''}
            </p>
            {resource.fileUrl && (
              <div className="flex flex-col items-center w-full">
                <img
                  src={resource.fileUrl}
                  alt={resource.title}
                  className="max-w-full max-h-[40vh] md:max-h-[50vh] object-contain rounded-lg shadow-sm mb-4 md:mb-6"
                />
                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm md:max-w-md">
                  <Button 
                    onClick={handleDownload} 
                    className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white flex-1 py-3 md:py-4 text-sm md:text-base"
                    size="lg"
                  >
                    <Download className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                    Download
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-purple-200 text-purple-700 hover:bg-purple-50 flex-1 py-3 md:py-4 text-sm md:text-base"
                    size="lg"
                    asChild
                  >
                    <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                      View
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
          <div className="flex flex-col items-center justify-center min-h-[300px] md:min-h-[400px] lg:min-h-[500px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-md p-4 md:p-6">
            <div className="bg-green-100 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-4 md:mb-6">
              <FileText className="h-8 w-8 md:h-10 md:w-10 text-green-600" />
            </div>
            <p className="text-gray-600 mb-4 font-medium text-lg md:text-xl text-center">
              {resource.type === ResourceType.WORKSHEET ? 'Worksheet' : 'Guide'} Document
            </p>
            <p className="text-sm md:text-base text-gray-500 mb-4 md:mb-6 text-center">
              {resource.fileSize ? `${(resource.fileSize / 1024 / 1024).toFixed(2)} MB` : ''}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm md:max-w-md">
              <Button 
                onClick={handleDownload} 
                className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white flex-1 py-3 md:py-4 text-sm md:text-base"
                size="lg"
              >
                <Download className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                Download
              </Button>
              {resource.fileUrl && (
                <Button 
                  variant="outline" 
                  className="border-green-200 text-green-700 hover:bg-green-50 flex-1 py-3 md:py-4 text-sm md:text-base"
                  size="lg"
                  asChild
                >
                  <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                    Open
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
            <div className="prose prose-sm sm:prose-base md:prose-lg max-w-none bg-white p-4 md:p-6 rounded-lg shadow-sm">
              <ReactMarkdown>{resource.content}</ReactMarkdown>
            </div>
          );
        } else if (resource.fileUrl) {
          return (
            <div className="flex flex-col items-center justify-center min-h-[300px] md:min-h-[400px] lg:min-h-[500px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-md p-4 md:p-6">
              <div className="bg-blue-100 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-4 md:mb-6">
                <FileText className="h-8 w-8 md:h-10 md:w-10 text-blue-600" />
              </div>
              <p className="text-gray-600 mb-4 font-medium text-lg md:text-xl text-center">Document File</p>
              <p className="text-sm md:text-base text-gray-500 mb-4 md:mb-6 text-center">
                {resource.fileSize ? `${(resource.fileSize / 1024 / 1024).toFixed(2)} MB` : ''}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm md:max-w-md">
                <Button 
                  onClick={handleDownload} 
                  className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white flex-1 py-3 md:py-4 text-sm md:text-base"
                  size="lg"
                >
                  <Download className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  Download
                </Button>
                <Button 
                  variant="outline" 
                  className="border-blue-200 text-blue-700 hover:bg-blue-50 flex-1 py-3 md:py-4 text-sm md:text-base"
                  size="lg"
                  asChild
                >
                  <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                    Open
                  </a>
                </Button>
              </div>
            </div>
          );
        } else {
          return (
            <div className="text-center py-12 md:py-16 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500 text-lg md:text-xl">No content available for viewing</p>
            </div>
          );
        }
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8">
      <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 pb-4 md:pb-6 p-4 md:p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 md:gap-6">
            <div className="flex-1">
              <CardTitle className="text-2xl md:text-3xl lg:text-4xl text-gray-900 mb-2 md:mb-3">
                {resource.title}
              </CardTitle>
              <div className="flex flex-wrap gap-2 mb-3 md:mb-4">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs md:text-sm px-2 md:px-3 py-1">
                  {resource.type.replace('_', ' ')}
                </Badge>
                <Badge variant="outline" className="border-blue-200 text-blue-700 text-xs md:text-sm px-2 md:px-3 py-1">
                  {getLanguageName(resource.language)}
                </Badge>
                {resource.author && (
                  <Badge variant="outline" className="border-blue-200 text-blue-700 text-xs md:text-sm px-2 md:px-3 py-1">
                    By {resource.author}
                  </Badge>
                )}
              </div>
              
              {resource.description && (
                <p className="text-gray-600 text-base md:text-lg lg:text-xl mt-2 leading-relaxed">
                  {resource.description}
                </p>
              )}
            </div>
            
            {resource.fileUrl && (
              <div className="flex-shrink-0">
                <Button 
                  onClick={handleDownload} 
                  className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white w-full lg:w-auto py-3 md:py-4 px-6 md:px-8 text-base md:text-lg"
                  size="lg"
                >
                  <Download className="mr-2 h-5 w-5 md:h-6 md:w-6" />
                  Download
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 md:p-2 rounded-lg m-4 md:m-6 mt-4 md:mt-6">
              <TabsTrigger 
                value="content" 
                className="data-[state=active]:bg-white data-[state=active]:shadow rounded-md transition-all text-xs md:text-sm py-2 md:py-3"
              >
                Content
              </TabsTrigger>
              <TabsTrigger 
                value="details" 
                className="data-[state=active]:bg-white data-[state=active]:shadow rounded-md transition-all text-xs md:text-sm py-2 md:py-3"
              >
                Details
              </TabsTrigger>
              <TabsTrigger 
                value="summary" 
                className="data-[state=active]:bg-white data-[state=active]:shadow rounded-md transition-all text-xs md:text-sm py-2 md:py-3"
              >
                Summary
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="content" className="mt-2 md:mt-4 p-4 md:p-6">
              {renderContent()}
            </TabsContent>
            
            <TabsContent value="details" className="mt-2 md:mt-4 space-y-4 md:space-y-6 p-4 md:p-6">
              <div>
                <h3 className="font-medium text-lg md:text-xl mb-3 md:mb-4">Categories</h3>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {resource.categories.map((category) => (
                    <Badge 
                      key={category} 
                      variant="outline" 
                      className="border-blue-200 text-blue-700 text-xs md:text-sm px-3 py-1 md:px-4 md:py-2"
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <Separator className="my-4 md:my-6" />
              
              <div>
                <h3 className="font-medium text-lg md:text-xl mb-3 md:mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {resource.tags.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="outline" 
                      className="border-blue-200 text-blue-700 text-xs md:text-sm px-3 py-1 md:px-4 md:py-2"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <Separator className="my-4 md:my-6" />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                <div>
                  <h3 className="font-medium text-lg md:text-xl mb-3 md:mb-4">File Information</h3>
                  <div className="space-y-2 md:space-y-3 text-base md:text-lg">
                    {resource.fileSize && (
                      <p className="flex justify-between">
                        <span className="text-gray-600">Size:</span>
                        <span className="font-medium">{(resource.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                      </p>
                    )}
                    {resource.duration && (
                      <p className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">
                          {Math.floor(resource.duration / 60)}:{(resource.duration % 60).toString().padStart(2, '0')}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-lg md:text-xl mb-3 md:mb-4">Statistics</h3>
                  <div className="space-y-2 md:space-y-3 text-base md:text-lg">
                    <p className="flex justify-between">
                      <span className="text-gray-600">Views:</span>
                      <span className="font-medium">{resource.viewCount}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-600">Downloads:</span>
                      <span className="font-medium">{resource.downloadCount}</span>
                    </p>
                    {resource.averageRating && (
                      <p className="flex justify-between">
                        <span className="text-gray-600">Rating:</span>
                        <span className="font-medium">{resource.averageRating}/5</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="summary" className="mt-2 md:mt-4 p-4 md:p-6">
              {resource.summary ? (
                <div className="prose prose-sm sm:prose-base md:prose-lg max-w-none bg-blue-50 p-4 md:p-6 rounded-lg border border-blue-100">
                  <ReactMarkdown>{resource.summary}</ReactMarkdown>
                </div>
              ) : (
                <div className="text-center py-12 md:py-16 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-500 text-lg md:text-xl">No summary available</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}