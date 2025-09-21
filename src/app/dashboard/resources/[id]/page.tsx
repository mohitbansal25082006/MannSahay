'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Resource, ResourceType } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ResourcePlayer from '@/components/resources/resource-player';
import ResourceViewer from '@/components/resources/resource-viewer';
import ResourceRating from '@/components/resources/resource-rating';
import AIAssistant from '@/components/resources/ai-assistant';
import ResourceAnalytics from '@/components/resources/resource-analytics';
import ResourceComments from '@/components/resources/resource-comments';
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
  Loader2,
  Sparkles,
  RefreshCw,
  Volume2,
  VolumeX,
  MessageSquare,
  BarChart3,
  Accessibility,
  TrendingUp,
  Brain,
  BookOpen,
  Headphones,
  Mic,
  Maximize,
  Settings,
  Lightbulb,
  Award,
  Target,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import Link from 'next/link';

export default function ResourceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const resourceId = params.id as string;
  
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [summary, setSummary] = useState<string>('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryCached, setSummaryCached] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [contentQuality, setContentQuality] = useState<{
    score: number;
    assessment: string;
    suggestions: string[];
  } | null>(null);
  const [readingTime, setReadingTime] = useState(0);
  const [moodBasedRecommendations, setMoodBasedRecommendations] = useState<any[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [recommendationsError, setRecommendationsError] = useState<string | null>(null);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/resources/${resourceId}`);
        const data = await response.json();
        setResource(data);
        setIsBookmarked(data.isBookmarked || false);
        
        // Calculate reading time
        if (data.content) {
          const wordsPerMinute = 200;
          const words = data.content.split(/\s+/).length;
          setReadingTime(Math.ceil(words / wordsPerMinute));
        }
        
        // If summary exists, set it
        if (data.summary) {
          setSummary(data.summary);
          setSummaryCached(data.cached || false);
        }
      } catch (error) {
        console.error('Error fetching resource:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResource();
  }, [resourceId]);

  const generateSummary = async () => {
    if (!resource) return;
    
    try {
      setSummaryLoading(true);
      const response = await fetch(`/api/resources/${resourceId}/summarize`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary);
        setSummaryCached(data.cached || false);
        
        // Update the resource in state
        setResource(prev => prev ? { ...prev, summary: data.summary } : null);
      } else {
        const error = await response.json();
        console.error('Error generating summary:', error);
      }
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setSummaryLoading(false);
    }
  };

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

  const handleShare = async () => {
    if (!resource) return;

    try {
      // Track the share action
      await fetch(`/api/resources/${resourceId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ platform: 'web_share' }),
      });

      // Use Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: resource.title,
          text: resource.description || `Check out this resource: ${resource.title}`,
          url: window.location.href,
        });
      } else {
        // Fallback to copying the link
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing resource:', error);
      // Fallback to copying the link if sharing fails
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
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

  const handleTextToSpeech = async () => {
    if (!resource) return;
    
    try {
      const text = resource.content || '';
      if (!text) return;
      
      const response = await fetch('/api/resources/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          language: resource.language,
        }),
      });
      
      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
        setIsPlaying(true);
        
        audio.onended = () => {
          setIsPlaying(false);
        };
      } else {
        console.error('Error generating speech:', await response.text());
      }
    } catch (error) {
      console.error('Error generating speech:', error);
    }
  };

  const analyzeContentQuality = async () => {
    if (!resource) return;
    
    try {
      const response = await fetch(`/api/resources/${resourceId}/quality-analysis`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        setContentQuality(data);
      }
    } catch (error) {
      console.error('Error analyzing content quality:', error);
    }
  };

  const getMoodBasedRecommendations = async () => {
    if (!resource) return;
    
    try {
      setRecommendationsLoading(true);
      setRecommendationsError(null);
      
      const response = await fetch('/api/resources/mood-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resourceId: resource.id,
          categories: resource.categories,
          mood: 5, // Added default mood
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.recommendations && Array.isArray(data.recommendations)) {
          setMoodBasedRecommendations(data.recommendations);
          if (data.recommendations.length === 0) {
            setRecommendationsError(data.message || 'No similar resources found.');
          }
        } else {
          setRecommendationsError('No recommendations received');
        }
      } else {
        const errorData = await response.json();
        setRecommendationsError(errorData.error || 'Failed to get recommendations');
      }
    } catch (error) {
      console.error('Error getting mood-based recommendations:', error);
      setRecommendationsError('An error occurred while fetching recommendations');
    } finally {
      setRecommendationsLoading(false);
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

  return (
    <div className={`min-h-screen py-8 ${highContrastMode ? 'bg-black text-white' : 'bg-gradient-to-br from-blue-50 to-indigo-50'}`}>
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
            <Card className={highContrastMode ? 'bg-gray-900 border-gray-700' : ''}>
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
                    <CardTitle className={`text-2xl ${highContrastMode ? 'text-white' : ''}`}>
                      {resource.title}
                    </CardTitle>
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
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {readingTime} min read
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
                
                {resource.description && (
                  <p className={highContrastMode ? 'text-gray-300' : 'text-gray-600'}>
                    {resource.description}
                  </p>
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
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="summary">AI Summary</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="comments">Comments</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="content" className="mt-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {getLanguageName(resource.language)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleTextToSpeech}
                            disabled={!resource.content}
                            className="p-2 h-8 w-8"
                            title="Read Aloud"
                          >
                            {isPlaying ? (
                              <VolumeX className="h-4 w-4" />
                            ) : (
                              <Volume2 className="h-4 w-4" />
                            )}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleBookmark}
                            className={`p-2 h-8 w-8 ${
                              isBookmarked ? 'text-blue-600' : 'text-gray-500'
                            }`}
                            title={isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
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
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleShare}
                            className="p-2 h-8 w-8 text-gray-500"
                            title="Share"
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setHighContrastMode(!highContrastMode)}
                            className="p-2 h-8 w-8 text-gray-500"
                            title={highContrastMode ? 'Normal Mode' : 'High Contrast'}
                          >
                            <Accessibility className="h-4 w-4" />
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
                      
                      {resource.content && (
                        <div className={`prose max-w-none ${highContrastMode ? 'prose-invert' : ''}`}>
                          <div dangerouslySetInnerHTML={{ __html: resource.content }} />
                        </div>
                      )}
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
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-yellow-500" />
                          AI-Generated Summary
                        </h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={generateSummary}
                          disabled={summaryLoading}
                          className="flex items-center gap-2"
                        >
                          {summaryLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                          {summaryCached ? 'Regenerate' : 'Generate'}
                        </Button>
                      </div>
                      
                      {summaryLoading ? (
                        <div className="flex justify-center items-center py-12">
                          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                      ) : summary ? (
                        <div className={`p-6 rounded-lg border ${highContrastMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-100'}`}>
                          <div className="prose max-w-none">
                            <p className={highContrastMode ? 'text-gray-300' : 'text-gray-700'}>
                              {summary}
                            </p>
                          </div>
                          {summaryCached && resource.summaryGeneratedAt && (
                            <div className="mt-4 text-sm text-gray-500 flex items-center gap-1">
                              <Sparkles className="h-3 w-3" />
                              Cached summary generated on {new Date(resource.summaryGeneratedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className={`text-center py-12 rounded-lg border ${highContrastMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                          <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No Summary Available
                          </h3>
                          <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            Generate an AI-powered summary of this resource to get key insights and takeaways at a glance.
                          </p>
                          <Button onClick={generateSummary}>
                            Generate Summary
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="analytics" className="mt-4">
                    <ResourceAnalytics 
                      resourceId={resource.id}
                      resourceType={resource.type}
                      categories={resource.categories}
                    />
                  </TabsContent>
                  
                  <TabsContent value="comments" className="mt-4">
                    <ResourceComments resourceId={resource.id} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-1 space-y-6">
            <Card className={highContrastMode ? 'bg-gray-900 border-gray-700' : ''}>
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
                  onClick={handleShare}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleTextToSpeech}
                  disabled={!resource.content}
                >
                  {isPlaying ? (
                    <>
                      <VolumeX className="mr-2 h-4 w-4" />
                      Stop Audio
                    </>
                  ) : (
                    <>
                      <Volume2 className="mr-2 h-4 w-4" />
                      Read Aloud
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setHighContrastMode(!highContrastMode)}
                >
                  <Accessibility className="mr-2 h-4 w-4" />
                  {highContrastMode ? 'Normal Mode' : 'High Contrast'}
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setAiAssistantOpen(true)}
                >
                  <Brain className="mr-2 h-4 w-4" />
                  AI Assistant
                </Button>
              </CardContent>
            </Card>
            
            <Card className={highContrastMode ? 'bg-gray-900 border-gray-700' : ''}>
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
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Reading Time</span>
                  <span className="font-medium">{readingTime} min</span>
                </div>
              </CardContent>
            </Card>
            
            {summary && (
              <Card className={highContrastMode ? 'bg-gray-900 border-gray-700' : ''}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-yellow-500" />
                    Summary Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-sm line-clamp-4 ${highContrastMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {summary}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={() => setActiveTab('summary')}
                  >
                    View Full Summary
                  </Button>
                </CardContent>
              </Card>
            )}
            
            <Card className={highContrastMode ? 'bg-gray-900 border-gray-700' : ''}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  Mood-Based Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recommendationsLoading ? (
                  <div className="flex justify-center items-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  </div>
                ) : recommendationsError ? (
                  <div className="text-center py-4">
                    <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">{recommendationsError}</p>
                    <Button variant="outline" size="sm" onClick={getMoodBasedRecommendations}>
                      Try Again
                    </Button>
                  </div>
                ) : moodBasedRecommendations.length > 0 ? (
                  <div className="space-y-3">
                    {moodBasedRecommendations.map((rec, index) => (
                      <div key={index} className="p-2 border rounded-lg">
                        <h4 className="font-medium text-sm">{rec.title}</h4>
                        <p className="text-xs text-gray-600">{rec.reason}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {rec.mood}
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs h-5 px-1"
                            onClick={() => {
                              if (rec.resourceId) {
                                window.location.href = `/dashboard/resources/${rec.resourceId}`;
                              }
                            }}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <p className={`text-sm mb-4 ${highContrastMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Resources recommended based on your current mood and interests
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={getMoodBasedRecommendations}
                    >
                      Get Recommendations
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card className={highContrastMode ? 'bg-gray-900 border-gray-700' : ''}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-600" />
                  Content Quality
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-sm mb-4 ${highContrastMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  AI-powered assessment of this resource's quality and accuracy
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={analyzeContentQuality}
                >
                  Analyze Quality
                </Button>
                
                {contentQuality && (
                  <div className="mt-4 p-3 rounded-lg bg-blue-50">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${
                        contentQuality.score > 8 ? 'bg-green-500' : 
                        contentQuality.score > 6 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <span className="font-medium">
                        Quality Score: {contentQuality.score}/10
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">
                      {contentQuality.assessment}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {aiAssistantOpen && (
        <AIAssistant
          resourceId={resource.id}
          resourceTitle={resource.title}
          resourceContent={resource.content || undefined}
          onClose={() => setAiAssistantOpen(false)}
        />
      )}
    </div>
  );
}