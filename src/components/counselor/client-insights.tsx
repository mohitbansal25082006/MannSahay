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
  PieChart,
  Users,
  ChartBar,
  Share2
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
  const [activeTab, setActiveTab] = useState('insights');

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
      case 'IMPROVING': return <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />;
      case 'DECLINING': return <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 rotate-180" />;
      default: return <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />;
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'HIGH': return 'border-l-4 border-red-500 bg-red-50/50';
      case 'MEDIUM': return 'border-l-4 border-yellow-500 bg-yellow-50/50';
      default: return 'border-l-4 border-green-500 bg-green-50/50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Loading client insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Client Insights Dashboard
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Deep analysis of client progress, trends, and risk factors
          </p>
        </div>

        <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-0 overflow-hidden rounded-2xl">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-gray-100 pb-4 sm:pb-6">
            <CardTitle className="flex items-center text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
              <div className="bg-purple-100 p-2 sm:p-3 rounded-xl mr-3 sm:mr-4">
                <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
              Advanced Client Insights
            </CardTitle>
            <CardDescription className="text-gray-600 ml-11 sm:ml-14 text-sm sm:text-base">
              Comprehensive analytics and monitoring for better client care
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
              {/* Enhanced Responsive Tabs */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 sm:p-2">
                <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-2 bg-transparent p-0 h-auto">
                  <TabsTrigger 
                    value="insights" 
                    className="
                      relative flex items-center justify-center sm:justify-start 
                      text-xs sm:text-sm font-medium 
                      data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 
                      data-[state=active]:text-white data-[state=active]:shadow-sm
                      data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900
                      rounded-lg sm:rounded-xl 
                      p-2 sm:p-3 
                      transition-all duration-200 
                      group
                      min-h-[48px] sm:min-h-[56px]
                    "
                  >
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <div className="
                        p-1 sm:p-2 rounded-lg 
                        bg-blue-100 group-data-[state=active]:bg-white/20 
                        transition-colors duration-200
                      ">
                        <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                      </div>
                      <span className="whitespace-nowrap">Client Insights</span>
                    </div>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="trends" 
                    className="
                      relative flex items-center justify-center sm:justify-start 
                      text-xs sm:text-sm font-medium 
                      data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 
                      data-[state=active]:text-white data-[state=active]:shadow-sm
                      data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900
                      rounded-lg sm:rounded-xl 
                      p-2 sm:p-3 
                      transition-all duration-200 
                      group
                      min-h-[48px] sm:min-h-[56px]
                    "
                  >
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <div className="
                        p-1 sm:p-2 rounded-lg 
                        bg-green-100 group-data-[state=active]:bg-white/20 
                        transition-colors duration-200
                      ">
                        <ChartBar className="h-3 w-3 sm:h-4 sm:w-4" />
                      </div>
                      <span className="whitespace-nowrap">Trend Analysis</span>
                    </div>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="distribution" 
                    className="
                      relative flex items-center justify-center sm:justify-start 
                      text-xs sm:text-sm font-medium 
                      data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 
                      data-[state=active]:text-white data-[state=active]:shadow-sm
                      data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900
                      rounded-lg sm:rounded-xl 
                      p-2 sm:p-3 
                      transition-all duration-200 
                      group
                      min-h-[48px] sm:min-h-[56px]
                    "
                  >
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <div className="
                        p-1 sm:p-2 rounded-lg 
                        bg-purple-100 group-data-[state=active]:bg-white/20 
                        transition-colors duration-200
                      ">
                        <PieChart className="h-3 w-3 sm:h-4 sm:w-4" />
                      </div>
                      <span className="whitespace-nowrap">Issue Distribution</span>
                    </div>
                  </TabsTrigger>
                </TabsList>
              </div>
              
              {/* Client Insights Tab */}
              <TabsContent value="insights" className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Client Overview</h3>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                      <Share2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Export Report
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {clientInsights.map((insight, index) => (
                    <Card key={index} className={`${getRiskColor(insight.riskLevel)} shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden rounded-xl`}>
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col lg:flex-row items-start justify-between gap-4 sm:gap-6">
                          <div className="flex items-start space-x-3 sm:space-x-4 flex-1">
                            <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                              <AvatarImage src={`/api/placeholder/avatar/${insight.userId}`} />
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm sm:text-base">
                                {insight.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                <h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate">
                                  {insight.name}
                                </h3>
                                <Badge 
                                  variant={insight.riskLevel === 'HIGH' ? 'destructive' : 
                                          insight.riskLevel === 'MEDIUM' ? 'default' : 'secondary'}
                                  className="w-fit text-xs sm:text-sm"
                                >
                                  {insight.riskLevel} RISK
                                </Badge>
                              </div>
                              
                              <p className="text-xs sm:text-sm text-gray-500 mb-3 truncate">{insight.email}</p>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-3">
                                <div className="flex items-center space-x-2 text-xs sm:text-sm">
                                  <Clock className="h-3 w-3 text-gray-400" />
                                  <span>Last: {insight.lastSession}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-xs sm:text-sm">
                                  <MessageSquare className="h-3 w-3 text-gray-400" />
                                  <span>{insight.sessionCount} sessions</span>
                                </div>
                                <div className="flex items-center space-x-2 text-xs sm:text-sm">
                                  <Heart className="h-3 w-3 text-gray-400" />
                                  <span>Mood: {insight.avgMood}/10</span>
                                </div>
                                <div className="flex items-center space-x-2 text-xs sm:text-sm">
                                  {getTrendIcon(insight.moodTrend)}
                                  <span className="capitalize">{insight.moodTrend.toLowerCase()}</span>
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap gap-1 mb-3">
                                {insight.keyIssues.map((issue, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {issue}
                                  </Badge>
                                ))}
                              </div>
                              
                              {insight.recentFeedback && (
                                <p className="text-xs sm:text-sm text-gray-600 italic bg-white/50 p-2 sm:p-3 rounded-lg border">
                                  &ldquo;{insight.recentFeedback}&rdquo;
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-end lg:items-start justify-between lg:justify-start gap-3 w-full lg:w-auto">
                            <div className="text-center lg:text-right space-y-1">
                              <div className="text-xl sm:text-2xl font-bold text-purple-600">
                                {insight.progressScore}%
                              </div>
                              <div className="text-xs text-gray-500">Progress Score</div>
                              <div className="h-2 w-16 sm:w-24 bg-gray-200 rounded-full overflow-hidden mt-1 mx-auto lg:mx-0">
                                <div 
                                  className="h-full bg-gradient-to-r from-purple-500 to-violet-600 rounded-full transition-all duration-500" 
                                  style={{ width: `${insight.progressScore}%` }}
                                ></div>
                              </div>
                            </div>
                            <Button size="sm" className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white text-xs sm:text-sm">
                              View Details
                            </Button>
                          </div>
                        </div>
                        
                        <div className="mt-4 p-3 bg-white/50 rounded-lg border">
                          <div className="flex items-center space-x-2 mb-1">
                            <Target className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                            <span className="font-medium text-xs sm:text-sm">Recommended Action:</span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-700">{insight.recommendedAction}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              {/* Trend Analysis Tab */}
              <TabsContent value="trends" className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                  <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border-0 overflow-hidden rounded-xl">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 pb-4">
                      <CardTitle className="flex items-center text-base sm:text-lg font-bold text-gray-900">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                          <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                        </div>
                        Session & Mood Trends
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                      <div className="space-y-3 sm:space-y-4">
                        {sessionTrends.map((trend, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex items-center space-x-3">
                              <div className="text-sm font-medium text-gray-900">{trend.month}</div>
                              <div className="text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded">{trend.sessions} sessions</div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-12 sm:w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500" 
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
                  
                  <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border-0 overflow-hidden rounded-xl">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100 pb-4">
                      <CardTitle className="flex items-center text-base sm:text-lg font-bold text-gray-900">
                        <div className="bg-green-100 p-2 rounded-lg mr-3">
                          <PieChart className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                        </div>
                        Key Insights & Analytics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                      <div className="space-y-3 sm:space-y-4">
                        <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                          <div className="flex items-center space-x-2 mb-1">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="font-medium text-green-800 text-sm sm:text-base">Positive Trend</span>
                          </div>
                          <p className="text-xs sm:text-sm text-green-700">
                            Average mood improved by 34% over the last 6 months
                          </p>
                        </div>
                        
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <div className="flex items-center space-x-2 mb-1">
                            <Activity className="h-4 w-4 text-blue-500" />
                            <span className="font-medium text-blue-800 text-sm sm:text-base">Engagement Up</span>
                          </div>
                          <p className="text-xs sm:text-sm text-blue-700">
                            Session attendance increased by 133% since January
                          </p>
                        </div>
                        
                        <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                          <div className="flex items-center space-x-2 mb-1">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            <span className="font-medium text-yellow-800 text-sm sm:text-base">Focus Area</span>
                          </div>
                          <p className="text-xs sm:text-sm text-yellow-700">
                            Anxiety remains the primary concern (35% of cases)
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              {/* Issue Distribution Tab */}
              <TabsContent value="distribution" className="space-y-4 sm:space-y-6">
                <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border-0 overflow-hidden rounded-xl">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-gray-100 pb-4">
                    <CardTitle className="flex items-center text-base sm:text-lg font-bold text-gray-900">
                      <div className="bg-purple-100 p-2 rounded-lg mr-3">
                        <PieChart className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                      </div>
                      Mental Health Issues Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-4 sm:space-y-6">
                      {issueDistribution.map((issue, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-900 text-sm sm:text-base">{issue.issue}</span>
                            <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">{issue.percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-violet-600 h-2 sm:h-3 rounded-full transition-all duration-500" 
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
    </div>
  );
}