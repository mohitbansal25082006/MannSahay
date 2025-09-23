'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Clock, 
  MessageSquare, 
  AlertTriangle,
  Heart,
  Brain,
  Target,
  Activity,
  BarChart3,
  PieChart
} from 'lucide-react';

interface ClientInsight {
  userId: string;
  name: string;
  email: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  lastSession: string;
  sessionCount: number;
  avgMood: number;
  progressScore: number;
  recommendedAction: string;
  moodTrend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  keyIssues: string[];
  recentFeedback?: string;
}

interface SessionTrend {
  month: string;
  sessions: number;
  mood: number;
}

interface IssueDistribution {
  issue: string;
  count: number;
  percentage: number;
}

export default function ClientInsights() {
  const [clientInsights, setClientInsights] = useState<ClientInsight[]>([]);
  const [sessionTrends, setSessionTrends] = useState<SessionTrend[]>([]);
  const [issueDistribution, setIssueDistribution] = useState<IssueDistribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      // Mock data - in real implementation, this would come from API
      const mockClientInsights: ClientInsight[] = [
        {
          userId: '1',
          name: 'Alex Johnson',
          email: 'alex@example.com',
          riskLevel: 'MEDIUM',
          lastSession: '2 days ago',
          sessionCount: 5,
          avgMood: 6.2,
          progressScore: 75,
          recommendedAction: 'Schedule follow-up session focusing on anxiety management',
          moodTrend: 'IMPROVING',
          keyIssues: ['Anxiety', 'Academic Stress'],
          recentFeedback: 'Sessions are helping me manage my anxiety better'
        },
        {
          userId: '2',
          name: 'Sam Smith',
          email: 'sam@example.com',
          riskLevel: 'LOW',
          lastSession: '1 week ago',
          sessionCount: 3,
          avgMood: 7.5,
          progressScore: 85,
          recommendedAction: 'Send wellness resources and check in next week',
          moodTrend: 'STABLE',
          keyIssues: ['Self-Esteem'],
          recentFeedback: 'Feeling more confident after our sessions'
        },
        {
          userId: '3',
          name: 'Taylor Brown',
          email: 'taylor@example.com',
          riskLevel: 'HIGH',
          lastSession: '3 days ago',
          sessionCount: 7,
          avgMood: 4.1,
          progressScore: 45,
          recommendedAction: 'Immediate intervention required - schedule emergency session',
          moodTrend: 'DECLINING',
          keyIssues: ['Depression', 'Social Isolation'],
          recentFeedback: 'Still struggling with daily activities'
        }
      ];

      const mockSessionTrends: SessionTrend[] = [
        { month: 'Jan', sessions: 12, mood: 5.2 },
        { month: 'Feb', sessions: 15, mood: 5.8 },
        { month: 'Mar', sessions: 18, mood: 6.1 },
        { month: 'Apr', sessions: 22, mood: 6.5 },
        { month: 'May', sessions: 25, mood: 6.8 },
        { month: 'Jun', sessions: 28, mood: 7.0 }
      ];

      const mockIssueDistribution: IssueDistribution[] = [
        { issue: 'Anxiety', count: 45, percentage: 35 },
        { issue: 'Depression', count: 32, percentage: 25 },
        { issue: 'Academic Stress', count: 28, percentage: 22 },
        { issue: 'Relationship Issues', count: 15, percentage: 12 },
        { issue: 'Self-Esteem', count: 8, percentage: 6 }
      ];

      setClientInsights(mockClientInsights);
      setSessionTrends(mockSessionTrends);
      setIssueDistribution(mockIssueDistribution);
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'IMPROVING': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'DECLINING': return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default: return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'HIGH': return 'border-red-500 bg-red-50';
      case 'MEDIUM': return 'border-yellow-500 bg-yellow-50';
      default: return 'border-green-500 bg-green-50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading client insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-gray-100 pb-4">
          <CardTitle className="flex items-center text-lg md:text-xl font-bold text-gray-900">
            <div className="bg-purple-100 p-2 rounded-lg mr-3">
              <Brain className="h-5 w-5 text-purple-600" />
            </div>
            Advanced Client Insights
          </CardTitle>
          <CardDescription className="text-gray-600 ml-11">
            Deep analysis of client progress, trends, and risk factors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="insights" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 bg-white p-1 rounded-lg shadow-sm">
              <TabsTrigger value="insights" className="text-sm font-medium data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 rounded-md transition-all">
                Client Insights
              </TabsTrigger>
              <TabsTrigger value="trends" className="text-sm font-medium data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 rounded-md transition-all">
                Trend Analysis
              </TabsTrigger>
              <TabsTrigger value="distribution" className="text-sm font-medium data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 rounded-md transition-all">
                Issue Distribution
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="insights" className="space-y-4">
              {clientInsights.map((insight, index) => (
                <Card key={index} className={`border-l-4 ${getRiskColor(insight.riskLevel)} shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden`}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={`/api/placeholder/avatar/${insight.userId}`} />
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                            {insight.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{insight.name}</h3>
                            <Badge variant={insight.riskLevel === 'HIGH' ? 'destructive' : 
                                          insight.riskLevel === 'MEDIUM' ? 'default' : 'secondary'}>
                              {insight.riskLevel} RISK
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 mb-2">{insight.email}</p>
                          
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-3 w-3 text-gray-400" />
                              <span className="text-sm">Last session: {insight.lastSession}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MessageSquare className="h-3 w-3 text-gray-400" />
                              <span className="text-sm">{insight.sessionCount} sessions</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Heart className="h-3 w-3 text-gray-400" />
                              <span className="text-sm">Avg mood: {insight.avgMood}/10</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getTrendIcon(insight.moodTrend)}
                              <span className="text-sm capitalize">{insight.moodTrend.toLowerCase()}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-1 mb-2">
                            {insight.keyIssues.map((issue, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {issue}
                              </Badge>
                            ))}
                          </div>
                          
                          {insight.recentFeedback && (
                            <p className="text-sm text-gray-600 italic bg-gray-50 p-3 rounded-lg">&ldquo;{insight.recentFeedback}&rdquo;</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="text-2xl font-bold text-purple-600">
                          {insight.progressScore}%
                        </div>
                        <div className="text-xs text-gray-500">Progress Score</div>
                        <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden mt-1">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-violet-600 rounded-full" 
                            style={{ width: `${insight.progressScore}%` }}
                          ></div>
                        </div>
                        <Button size="sm" className="mt-2 bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white">
                          View Details
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center space-x-2 mb-1">
                        <Target className="h-4 w-4 text-blue-500" />
                        <span className="font-medium text-sm">Recommended Action:</span>
                      </div>
                      <p className="text-sm text-gray-700">{insight.recommendedAction}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="trends" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border-0 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 pb-4">
                    <CardTitle className="flex items-center text-lg md:text-xl font-bold text-gray-900">
                      <div className="bg-blue-100 p-2 rounded-lg mr-3">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                      </div>
                      Session & Mood Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6">
                    <div className="space-y-4">
                      {sessionTrends.map((trend, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className="text-sm font-medium text-gray-900">{trend.month}</div>
                            <div className="text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded">{trend.sessions} sessions</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full" 
                                style={{ width: `${(trend.mood / 10) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{trend.mood}/10</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border-0 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100 pb-4">
                    <CardTitle className="flex items-center text-lg md:text-xl font-bold text-gray-900">
                      <div className="bg-green-100 p-2 rounded-lg mr-3">
                        <PieChart className="h-5 w-5 text-green-600" />
                      </div>
                      Key Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6">
                    <div className="space-y-4">
                      <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                        <div className="flex items-center space-x-2 mb-1">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="font-medium text-green-800">Positive Trend</span>
                        </div>
                        <p className="text-sm text-green-700">
                          Average mood improved by 34% over the last 6 months
                        </p>
                      </div>
                      
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex items-center space-x-2 mb-1">
                          <Activity className="h-4 w-4 text-blue-500" />
                          <span className="font-medium text-blue-800">Engagement Up</span>
                        </div>
                        <p className="text-sm text-blue-700">
                          Session attendance increased by 133% since January
                        </p>
                      </div>
                      
                      <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                        <div className="flex items-center space-x-2 mb-1">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium text-yellow-800">Focus Area</span>
                        </div>
                        <p className="text-sm text-yellow-700">
                          Anxiety remains the primary concern (35% of cases)
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="distribution" className="space-y-4">
              <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border-0 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-gray-100 pb-4">
                  <CardTitle className="flex items-center text-lg md:text-xl font-bold text-gray-900">
                    <div className="bg-purple-100 p-2 rounded-lg mr-3">
                      <PieChart className="h-5 w-5 text-purple-600" />
                    </div>
                    Mental Health Issues Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                  <div className="space-y-4">
                    {issueDistribution.map((issue, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-900">{issue.issue}</span>
                          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">{issue.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-violet-600 h-3 rounded-full transition-all duration-500" 
                            style={{ width: `${issue.percentage}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500">{issue.count} cases</div>
                      </div>
                    ))}
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