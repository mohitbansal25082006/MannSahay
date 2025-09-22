'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Check, 
  X, 
  AlertTriangle,
  BookOpen,
  Users,
  Bot,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function CommunityGuidelinesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/dashboard/forum" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Forum
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Guidelines</h1>
        <p className="text-gray-600">
          Our community guidelines help keep MannSahay a safe and supportive space for everyone.
        </p>
      </div>

      <div className="space-y-6">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center text-green-700">
              <Check className="h-5 w-5 mr-2" />
              Be Respectful and Supportive
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              Treat everyone with respect and kindness. We&apos;re here to support each other through difficult times.
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center text-green-700">
              <Check className="h-5 w-5 mr-2" />
              Protect Privacy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              Never share personal information about yourself or others. This includes contact details, addresses, or private conversations.
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center text-green-700">
              <Check className="h-5 w-5 mr-2" />
              Share Responsibly
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              Share accurate information and be mindful of how your words might affect others. If you&apos;re sharing resources, make sure they&apos;re from reliable sources.
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center text-green-700">
              <Check className="h-5 w-5 mr-2" />
              Be Honest and Authentic
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              Share your genuine thoughts and feelings. Authentic conversations help build trust and meaningful connections.
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="flex items-center text-red-700">
              <X className="h-5 w-5 mr-2" />
              No Harassment or Hate Speech
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              Bullying, harassment, hate speech, or discrimination based on race, gender, religion, or any other characteristic is strictly prohibited.
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="flex items-center text-red-700">
              <X className="h-5 w-5 mr-2" />
              No Self-Harm Promotion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              While we encourage open discussion about mental health, content that promotes or glorifies self-harm, suicide, or violence is not allowed.
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="flex items-center text-red-700">
              <X className="h-5 w-5 mr-2" />
              No Spam or Misinformation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              Don&apos;t post spam, advertisements, or false information that could harm others. Always verify information before sharing.
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="flex items-center text-red-700">
              <X className="h-5 w-5 mr-2" />
              No Explicit Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              Explicit, violent, or sexually suggestive content is not appropriate for this supportive community forum.
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-700">
              <Bot className="h-5 w-5 mr-2" />
              AI-Powered Moderation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              Our community is monitored by AI to ensure these guidelines are followed. Content that violates these guidelines may be removed automatically, and repeat violations may result in account suspension.
            </p>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-blue-700 border-blue-300">
                <Shield className="h-3 w-3 mr-1" />
                Active Moderation
              </Badge>
              <Badge variant="outline" className="text-blue-700 border-blue-300">
                <AlertTriangle className="h-3 w-3 mr-1" />
                24/7 Monitoring
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              What Happens If You Violate These Guidelines?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="bg-yellow-100 text-yellow-800 rounded-full h-6 w-6 flex items-center justify-center mr-3 flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-medium">First Violation</h4>
                  <p className="text-sm text-gray-600">Your content will be removed and you&apos;ll receive a notification explaining why.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-orange-100 text-orange-800 rounded-full h-6 w-6 flex items-center justify-center mr-3 flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-medium">Second Violation</h4>
                  <p className="text-sm text-gray-600">Temporary restriction from posting for 7 days.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-red-100 text-red-800 rounded-full h-6 w-6 flex items-center justify-center mr-3 flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-medium">Third Violation</h4>
                  <p className="text-sm text-gray-600">Permanent account suspension.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Reporting Violations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              If you see content that violates these guidelines, please report it using the &quot;Report&quot; button on posts and replies. Our moderation team will review it promptly.
            </p>
            <Button asChild>
              <Link href="/dashboard/forum">
                Go to Forum to Report Content
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}