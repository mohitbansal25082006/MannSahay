'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Sparkles, Brain } from 'lucide-react';

// Define the Resource type
interface Resource {
  id: string;
  title: string;
  description: string;
  type: string;
  averageRating?: number;
  aiReason?: string;
}

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiReasons, setAiReasons] = useState<Record<string, string>>({});

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/resources/recommendations');
      const data: Resource[] = await response.json();
      setRecommendations(data);
      
      // Extract AI reasons for each recommendation
      const reasons: Record<string, string> = {};
      data.forEach((rec: Resource) => {
        if (rec.aiReason) {
          reasons[rec.id] = rec.aiReason;
        }
      });
      setAiReasons(reasons);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  return (
    <Card className="sticky top-24">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-purple-600" />
            AI-Powered Recommendations
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchRecommendations}
            disabled={loading}
            className="p-1 h-8 w-8"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <Brain className="h-12 w-12 mx-auto" />
            </div>
            <p className="text-gray-500 text-sm">
              No recommendations yet. Explore some resources to get personalized suggestions!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.slice(0, 3).map((resource) => (
              <div key={resource.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-sm line-clamp-2 flex-1">
                    {resource.title}
                  </h4>
                  <Badge variant="outline" className="text-xs ml-2">
                    {resource.type.replace('_', ' ')}
                  </Badge>
                </div>
                
                <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                  {resource.description}
                </p>
                
                {aiReasons[resource.id] && (
                  <div className="flex items-start gap-1 mb-3">
                    <Sparkles className="h-3 w-3 text-purple-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-purple-600">
                      {aiReasons[resource.id]}
                    </p>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    {resource.averageRating && (
                      <>
                        <span className="text-xs font-medium">
                          {resource.averageRating}
                        </span>
                        <span className="text-xs text-gray-500">/5</span>
                      </>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7 px-2"
                    onClick={() => {
                      window.location.href = `/dashboard/resources/${resource.id}`;
                    }}
                  >
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}