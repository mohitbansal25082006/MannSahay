'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  Download, 
  Star, 
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
  categories: string[];
}

interface MoodRecommendation {
  resourceId?: string;
  title: string;
  reason: string;
  mood: string;
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
  moodBasedRecommendations: MoodRecommendation[];
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
  categories,
}: ResourceAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [qualityLoading, setQualityLoading] = useState(false);
  const [moodRecommendationsLoading, setMoodRecommendationsLoading] = useState(false);
  const [contentQuality, setContentQuality] = useState<ContentQualityData | null>(null);
  const [moodError, setMoodError] = useState<string | null>(null);
  const [moodRecommendations, setMoodRecommendations] = useState<MoodRecommendation[]>([]);

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
      <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl font-bold text-gray-900">
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
      <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl font-bold text-gray-900">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Resource Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Info className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-2">
              Analytics Unavailable
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Unable to load analytics data at this time.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl font-bold text-gray-900">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Engagement Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col items-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100 shadow-sm">
              <div className="bg-blue-100 p-2 rounded-full mb-2">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-2xl md:text-3xl font-bold text-blue-700">{analytics.viewCount}</span>
              <span className="text-sm text-gray-600">Views</span>
            </div>
            
            <div className="flex flex-col items-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100 shadow-sm">
              <div className="bg-green-100 p-2 rounded-full mb-2">
                <Download className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-2xl md:text-3xl font-bold text-green-700">{analytics.downloadCount}</span>
              <span className="text-sm text-gray-600">Downloads</span>
            </div>
            
            {analytics.averageRating && (
              <div className="flex flex-col items-center p-4 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg border border-yellow-100 shadow-sm">
                <div className="bg-yellow-100 p-2 rounded-full mb-2">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
                <span className="text-2xl md:text-3xl font-bold text-yellow-700">{analytics.averageRating}</span>
                <span className="text-sm text-gray-600">Rating</span>
              </div>
            )}
            
            <div className="flex flex-col items-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg border border-purple-100 shadow-sm">
              <div className="bg-purple-100 p-2 rounded-full mb-2">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-2xl md:text-3xl font-bold text-purple-700">{analytics.userEngagement.uniqueUsers}</span>
              <span className="text-sm text-gray-600">Unique Users</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50 border-b border-gray-100 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl font-bold text-gray-900">
            <Award className="h-5 w-5 text-yellow-600" />
            Content Quality Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          {contentQuality ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  {getQualityIcon(contentQuality.score)}
                  <span className="font-medium">Quality Score</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`text-2xl md:text-3xl font-bold ${getQualityColor(contentQuality.score)}`}>
                    {contentQuality.score}/10
                  </span>
                  <Badge variant={getQualityBadgeVariant(contentQuality.score)}>
                    {contentQuality.score >= 8 ? 'Excellent' : contentQuality.score >= 6 ? 'Good' : 'Needs Improvement'}
                  </Badge>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-700">{contentQuality.assessment}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Improvement Suggestions</h4>
                <ul className="space-y-1">
                  {contentQuality.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <div className="bg-yellow-100 p-1 rounded-full mt-0.5 flex-shrink-0">
                        <Lightbulb className="h-3 w-3 text-yellow-600" />
                      </div>
                      <span className="text-gray-700">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <Button 
                variant="outline" 
                onClick={analyzeContentQuality} 
                disabled={qualityLoading}
                className="border-yellow-200 text-yellow-700 hover:bg-yellow-50"
              >
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

      <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-gray-100 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl font-bold text-gray-900">
            <Target className="h-5 w-5 text-purple-600" />
            Mood-Based Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {moodRecommendationsLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
            </div>
          ) : moodError ? (
            <div className="text-center py-4">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-2">
                Error Loading Recommendations
              </h3>
              <p className="text-gray-500 mb-4 max-w-md mx-auto">{moodError}</p>
              <Button 
                variant="outline" 
                onClick={getMoodBasedRecommendations}
                className="border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                Try Again
              </Button>
            </div>
          ) : moodRecommendations.length > 0 ? (
            <div className="space-y-3">
              {moodRecommendations.map((rec, index) => (
                <div key={index} className="p-3 border border-purple-100 rounded-lg bg-white hover:bg-purple-50 transition-colors shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <Brain className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{rec.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{rec.reason}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs border-purple-200 text-purple-700">
                          {rec.mood}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs h-6 px-2 text-purple-700 hover:bg-purple-100"
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
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-gray-500 mb-3 max-w-md mx-auto">
                Get personalized recommendations based on your current mood
              </p>
              <Button 
                variant="outline" 
                onClick={getMoodBasedRecommendations}
                className="border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                Get Recommendations
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {analytics.trending && (
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-green-800">
              <TrendingUp className="h-5 w-5" />
              Trending Resource
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700 bg-green-100 p-3 rounded-lg">
              This resource is trending in the {categories[0] || 'general'} category this week!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}