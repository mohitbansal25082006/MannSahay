'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, TrendingUp, Star, Clock } from 'lucide-react';

interface Recommendation {
  counselorId: string;
  score: number;
  reason: string;
  counselor?: {
    id: string;
    name: string;
    email: string;
    bio?: string;
    specialties: string[];
    languages: string[];
    experience?: number;
  };
}

interface ClientInsight {
  userId: string;
  name: string;
  riskLevel: string;
  lastSession: string;
  recommendedAction: string;
}

export default function AIRecommendations() {
  const [counselorRecommendations, setCounselorRecommendations] = useState<Recommendation[]>([]);
  const [clientInsights, setClientInsights] = useState<ClientInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      // Fetch counselor recommendations
      const counselorResponse = await fetch('/api/counselors/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          needs: 'Anxiety and stress management',
          preferences: {
            language: 'en',
            specializations: ['Anxiety', 'Stress']
          }
        })
      });

      if (counselorResponse.ok) {
        const counselorData = await counselorResponse.json();
        setCounselorRecommendations(counselorData);
      }

      // Mock client insights (in a real app, this would come from an API)
      const mockClientInsights: ClientInsight[] = [
        {
          userId: '1',
          name: 'Alex Johnson',
          riskLevel: 'Medium',
          lastSession: '2 days ago',
          recommendedAction: 'Schedule follow-up session'
        },
        {
          userId: '2',
          name: 'Sam Smith',
          riskLevel: 'Low',
          lastSession: '1 week ago',
          recommendedAction: 'Send wellness resources'
        }
      ];
      setClientInsights(mockClientInsights);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading AI recommendations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="h-5 w-5 mr-2 text-purple-600" />
            AI-Powered Insights
          </CardTitle>
          <CardDescription>
            Intelligent recommendations based on session data and client patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="counselors" className="space-y-4">
            <TabsList>
              <TabsTrigger value="counselors">Counselor Matches</TabsTrigger>
              <TabsTrigger value="insights">Client Insights</TabsTrigger>
              <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
            </TabsList>
            
            <TabsContent value="counselors" className="space-y-4">
              {counselorRecommendations.length > 0 ? (
                <div className="space-y-4">
                  {counselorRecommendations.map((rec, index) => (
                    <Card key={index} className="border-l-4 border-l-purple-500">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar>
                              <AvatarImage src={`/api/placeholder/avatar/${rec.counselorId}`} />
                              <AvatarFallback>{rec.counselor?.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold">{rec.counselor?.name}</h3>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="secondary">
                                  <Star className="h-3 w-3 mr-1" />
                                  {Math.round(rec.score * 100)}% Match
                                </Badge>
                                <span className="text-sm text-gray-500">
                                  {rec.counselor?.experience} years experience
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-2">{rec.reason}</p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {rec.counselor?.specialties.map((spec, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {spec}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          <Button size="sm">View Profile</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Brain className="h-12 w-12 mx-auto mb-2" />
                  <p>No counselor recommendations available</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="insights" className="space-y-4">
              {clientInsights.length > 0 ? (
                <div className="space-y-4">
                  {clientInsights.map((insight, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{insight.name}</h3>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-sm text-gray-500">
                                <Clock className="h-3 w-3 inline mr-1" />
                                Last session: {insight.lastSession}
                              </span>
                              <Badge 
                                variant={insight.riskLevel === 'High' ? 'destructive' : 
                                        insight.riskLevel === 'Medium' ? 'default' : 'secondary'}
                              >
                                Risk: {insight.riskLevel}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-purple-600">
                              {insight.recommendedAction}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-2" />
                  <p>No client insights available</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="trends" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Session Trends</h3>
                      <p className="text-sm text-gray-600">
                        Based on recent data, there&apos;s a 15% increase in anxiety-related sessions 
                        compared to last month. Consider scheduling more stress management workshops.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Counselor Performance</h3>
                      <p className="text-sm text-gray-600">
                        Counselors specializing in cognitive behavioral therapy show 20% higher 
                        client satisfaction rates. Consider encouraging more counselors to get CBT training.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}