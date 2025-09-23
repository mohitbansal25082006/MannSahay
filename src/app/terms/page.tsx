import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, AlertTriangle, XCircle, Users, Heart, Shield, ArrowLeft, MessageSquare, BookOpen } from "lucide-react";
import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="text-center mb-12 md:mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 w-16 h-16 rounded-full flex items-center justify-center shadow-lg">
              <FileText className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700">Terms of Service</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            By using MannSahay, you agree to these terms. Please read them carefully.
          </p>
          <div className="mt-6 h-1 w-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mx-auto"></div>
        </div>

        <div className="space-y-8">
          <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border border-blue-100 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 pb-4">
              <CardTitle className="flex items-center text-lg md:text-xl font-bold text-gray-900">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                Acceptance of Terms
              </CardTitle>
              <CardDescription className="text-gray-600 ml-11">
                By accessing or using MannSahay, you agree to be bound by these Terms of Service.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-600">
                MannSahay is a mental health support platform designed for Indian students. By creating an account or using our services, 
                you agree to comply with and be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, 
                please do not use our services.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border border-blue-100 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 pb-4">
              <CardTitle className="flex items-center text-lg md:text-xl font-bold text-gray-900">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <Heart className="h-5 w-5 text-blue-600" />
                </div>
                Description of Service
              </CardTitle>
              <CardDescription className="text-gray-600 ml-11">
                MannSahay provides AI-powered mental health support and resources.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300">
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                    <div className="bg-blue-100 p-1 rounded mr-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    AI Chat Companion
                  </h3>
                  <p className="text-gray-600 text-sm">
                    24/7 empathetic AI support with cultural understanding for Indian students.
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300">
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                    <div className="bg-blue-100 p-1 rounded mr-2">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    Professional Counseling
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Connect with licensed mental health professionals for one-on-one sessions.
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300">
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                    <div className="bg-blue-100 p-1 rounded mr-2">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                    </div>
                    Peer Support Forum
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Anonymous community support with moderation and safety features.
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300">
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                    <div className="bg-blue-100 p-1 rounded mr-2">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                    </div>
                    Resource Library
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Curated mental health resources in multiple Indian languages.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border border-blue-100 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 pb-4">
              <CardTitle className="flex items-center text-lg md:text-xl font-bold text-gray-900">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                </div>
                User Responsibilities
              </CardTitle>
              <CardDescription className="text-gray-600 ml-11">
                As a user of MannSahay, you agree to the following responsibilities.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-start p-3 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex-shrink-0 h-5 w-5 text-green-600 mt-0.5">•</div>
                  <p className="ml-3 text-gray-600">
                    <span className="font-medium text-gray-900">Honest Communication:</span> Provide accurate information when creating your account and using our services.
                  </p>
                </div>
                <div className="flex items-start p-3 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex-shrink-0 h-5 w-5 text-green-600 mt-0.5">•</div>
                  <p className="ml-3 text-gray-600">
                    <span className="font-medium text-gray-900">Respectful Interaction:</span> Treat other users, counselors, and staff with respect and dignity.
                  </p>
                </div>
                <div className="flex items-start p-3 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex-shrink-0 h-5 w-5 text-green-600 mt-0.5">•</div>
                  <p className="ml-3 text-gray-600">
                    <span className="font-medium text-gray-900">Confidentiality:</span> Respect the privacy and confidentiality of other users.
                  </p>
                </div>
                <div className="flex items-start p-3 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex-shrink-0 h-5 w-5 text-green-600 mt-0.5">•</div>
                  <p className="ml-3 text-gray-600">
                    <span className="font-medium text-gray-900">Appropriate Use:</span> Use the service for its intended purpose and not for any illegal or harmful activities.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border border-blue-100 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 pb-4">
              <CardTitle className="flex items-center text-lg md:text-xl font-bold text-gray-900">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <AlertTriangle className="h-5 w-5 text-blue-600" />
                </div>
                Prohibited Activities
              </CardTitle>
              <CardDescription className="text-gray-600 ml-11">
                The following activities are strictly prohibited on MannSahay.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg border border-red-100 shadow-sm hover:shadow-md transition-all duration-300">
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                    <div className="bg-red-100 p-1 rounded mr-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                    </div>
                    Harmful Content
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Posting content that promotes self-harm, violence, or discrimination.
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg border border-red-100 shadow-sm hover:shadow-md transition-all duration-300">
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                    <div className="bg-red-100 p-1 rounded mr-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                    </div>
                    Harassment
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Bullying, stalking, or intimidating other users.
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg border border-red-100 shadow-sm hover:shadow-md transition-all duration-300">
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                    <div className="bg-red-100 p-1 rounded mr-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                    </div>
                    Impersonation
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Pretending to be someone else or creating fake accounts.
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg border border-red-100 shadow-sm hover:shadow-md transition-all duration-300">
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                    <div className="bg-red-100 p-1 rounded mr-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                    </div>
                    Spam
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Sending unsolicited messages or promotional content.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border border-blue-100 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 pb-4">
              <CardTitle className="flex items-center text-lg md:text-xl font-bold text-gray-900">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <XCircle className="h-5 w-5 text-blue-600" />
                </div>
                Termination
              </CardTitle>
              <CardDescription className="text-gray-600 ml-11">
                We may terminate or suspend your account for violations of these terms.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <p className="text-gray-600 mb-4">
                We reserve the right to terminate or suspend your account immediately, without prior notice or liability, 
                for any reason whatsoever, including without limitation if you breach the Terms of Service.
              </p>
              <p className="text-gray-600">
                Upon termination, your right to use the service will cease immediately. If you wish to terminate your account, 
                you may simply discontinue using the service and contact us for account deletion.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border border-blue-100 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 pb-4">
              <CardTitle className="flex items-center text-lg md:text-xl font-bold text-gray-900">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                Disclaimer
              </CardTitle>
              <CardDescription className="text-gray-600 ml-11">
                Important information about our services and limitations.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-start p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex-shrink-0 h-5 w-5 text-blue-600 mt-0.5">•</div>
                  <p className="ml-3 text-gray-600">
                    <span className="font-medium text-gray-900">Not a Replacement for Professional Help:</span> MannSahay is not a substitute for professional medical advice, diagnosis, or treatment.
                  </p>
                </div>
                <div className="flex items-start p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex-shrink-0 h-5 w-5 text-blue-600 mt-0.5">•</div>
                  <p className="ml-3 text-gray-600">
                    <span className="font-medium text-gray-900">No Guarantee of Results:</span> We do not guarantee specific outcomes from using our services.
                  </p>
                </div>
                <div className="flex items-start p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex-shrink-0 h-5 w-5 text-blue-600 mt-0.5">•</div>
                  <p className="ml-3 text-gray-600">
                    <span className="font-medium text-gray-900">Emergency Situations:</span> If you are in crisis or experiencing a medical emergency, please contact emergency services immediately.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border border-blue-100 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 pb-4">
              <CardTitle className="text-lg md:text-xl font-bold text-gray-900">
                Changes to Terms
              </CardTitle>
              <CardDescription className="text-gray-600 ml-11">
                We may update these terms from time to time.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-600">
                We reserve the right, at our sole discretion, to modify or replace these Terms of Service at any time. 
                If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect. 
                What constitutes a material change will be determined at our sole discretion.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border border-blue-100 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 pb-4">
              <CardTitle className="text-lg md:text-xl font-bold text-gray-900">
                Contact Information
              </CardTitle>
              <CardDescription className="text-gray-600 ml-11">
                If you have any questions about these Terms of Service, please contact us.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="bg-blue-100 p-2 rounded-full">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-gray-600">mohitbansal25082006@gmail.com</span>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center mt-12">
            <Link href="/">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-md hover:shadow-lg transition-all duration-300 flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}