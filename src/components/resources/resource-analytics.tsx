// E:\mannsahay\src\components\resources\resource-analytics.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  Download, 
  Star, 
  Clock,
  BookOpen,
  Target,
  Brain,
  Lightbulb,
  Award,
  CheckCircle,
  AlertTriangle,
  Info,
  Loader2,
  RefreshCw,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

interface ResourceAnalyticsProps {
  resourceId: string;
  resourceType: string;
  categories: string[];
}

interface AnalyticsData {
  viewCount: number;
  downloadCount: number;
  averageRating?: number;
  contentQuality?: {
    score: number;
    assessment: string;
    suggestions: string[];
  };
  moodBasedRecommendations: any[];
  userEngagement: {
    uniqueUsers: number;
    completionRate: number;
    bookmarks: number;
  };
  trending: boolean;
}

interface ContentQualityData {
  score: number;
  assessment: string;
  suggestions: string[];
}

export default function ResourceAnalytics({
  resourceId,
  resourceType,
  categories,
}: ResourceAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [qualityLoading, setQualityLoading] = useState(false);
  const [moodRecommendationsLoading, setMoodRecommendationsLoading] = useState(false);
  const [contentQuality, setContentQuality] = useState<ContentQualityData | null>(null);
  const [moodError, setMoodError] = useState<string | null>(null);
  const [moodRecommendations, setMoodRecommendations] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/resources/${resourceId}/analytics`);
        if (response.ok) {
          const data = await response.json();
          setAnalytics({
            ...data,
            moodBasedRecommendations: data.moodBasedRecommendations || []
          });
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [resourceId]);

  const analyzeContentQuality = async () => {
    if (!analytics) return;
    
    try {
      setQualityLoading(true);
      const response = await fetch(`/api/resources/${resourceId}/quality-analysis`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        setContentQuality(data);
        
        // Update analytics with quality data
        setAnalytics(prev => prev ? {
          ...prev,
          contentQuality: data
        } : null);
      }
    } catch (error) {
      console.error('Error analyzing content quality:', error);
    } finally {
      setQualityLoading(false);
    }
  };

  const getMoodBasedRecommendations = async () => {
    if (!analytics) return;
    
    try {
      setMoodRecommendationsLoading(true);
      setMoodError(null);
      
      const response = await fetch('/api/resources/mood-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resourceId,
          categories,
          mood: 5, // Default mood if not provided
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Mood recommendations response:', data); // Debug log
        
        if (data.recommendations && Array.isArray(data.recommendations)) {
          setMoodRecommendations(data.recommendations);
          if (data.recommendations.length === 0) {
            setMoodError(data.message || 'No similar resources found.');
          }
          setAnalytics(prev => prev ? {
            ...prev,
            moodBasedRecommendations: data.recommendations
          } : null);
        } else {
          setMoodError('No recommendations received');
        }
      } else {
        const errorData = await response.json();
        setMoodError(errorData.error || 'Failed to get recommendations');
      }
    } catch (error) {
      console.error('Error getting mood-based recommendations:', error);
      setMoodError('An error occurred while fetching recommendations');
    } finally {
      setMoodRecommendationsLoading(false);
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityIcon = (score: number) => {
    if (score >= 8) return <CheckCircle className="h-4 w-4" />;
    if (score >= 6) return <AlertTriangle className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  const getQualityBadgeVariant = (score: number) => {
    if (score >= 8) return 'default';
    if (score >= 6) return 'secondary';
    return 'destructive';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Resource Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Resource Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Analytics Unavailable
            </h3>
            <p className="text-gray-500">
              Unable to load analytics data at this time.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Engagement Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
              <Eye className="h-8 w-8 text-blue-600 mb-2" />
              <span className="text-2xl font-bold">{analytics.viewCount}</span>
              <span className="text-sm text-gray-600">Views</span>
            </div>
            
            <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg">
              <Download className="h-8 w-8 text-green-600 mb-2" />
              <span className="text-2xl font-bold">{analytics.downloadCount}</span>
              <span className="text-sm text-gray-600">Downloads</span>
            </div>
            
            {analytics.averageRating && (
              <div className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg">
                <Star className="h-8 w-8 text-yellow-600 mb-2" />
                <span className="text-2xl font-bold">{analytics.averageRating}</span>
                <span className="text-sm text-gray-600">Rating</span>
              </div>
            )}
            
            <div className="flex flex-col items-center p-4 bg-purple-50 rounded-lg">
              <Users className="h-8 w-8 text-purple-600 mb-2" />
              <span className="text-2xl font-bold">{analytics.userEngagement.uniqueUsers}</span>
              <span className="text-sm text-gray-600">Unique Users</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-600" />
            Content Quality Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          {contentQuality ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getQualityIcon(contentQuality.score)}
                  <span className="font-medium">Quality Score</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`text-2xl font-bold ${getQualityColor(contentQuality.score)}`}>
                    {contentQuality.score}/10
                  </span>
                  <Badge variant={getQualityBadgeVariant(contentQuality.score)}>
                    {contentQuality.score >= 8 ? 'Excellent' : contentQuality.score >= 6 ? 'Good' : 'Needs Improvement'}
                  </Badge>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">{contentQuality.assessment}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Improvement Suggestions</h4>
                <ul className="space-y-1">
                  {contentQuality.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <Button variant="outline" onClick={analyzeContentQuality} disabled={qualityLoading}>
                {qualityLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Analyze Content Quality
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            Mood-Based Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {moodRecommendationsLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : moodError ? (
            <div className="text-center py-4">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Error Loading Recommendations
              </h3>
              <p className="text-gray-500 mb-4">{moodError}</p>
              <Button variant="outline" onClick={getMoodBasedRecommendations}>
                Try Again
              </Button>
            </div>
          ) : moodRecommendations.length > 0 ? (
            <div className="space-y-3">
              {moodRecommendations.map((rec, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium">{rec.title}</h4>
                      <p className="text-sm text-gray-600">{rec.reason}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {rec.mood}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs h-6 px-2"
                          onClick={() => {
                            if (rec.resourceId) {
                              window.location.href = `/dashboard/resources/${rec.resourceId}`;
                            }
                          }}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View Resource
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-3">
                Get personalized recommendations based on your current mood
              </p>
              <Button variant="outline" onClick={getMoodBasedRecommendations}>
                Get Recommendations
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {analytics.trending && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <TrendingUp className="h-5 w-5" />
              Trending Resource
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700">
              This resource is trending in the {categories[0] || 'general'} category this week!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}