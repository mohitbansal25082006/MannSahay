import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Eye, Database, Trash2, Mail, Globe, ArrowLeft, MessagesSquare, HeartPulse } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="text-center mb-12 md:mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 w-16 h-16 rounded-full flex items-center justify-center shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700">Privacy Policy</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Your privacy is our top priority. This policy explains how we collect, use, and protect your personal information.
          </p>
          <div className="mt-6 h-1 w-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mx-auto"></div>
        </div>

        <div className="space-y-8">
          <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border border-blue-100 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 pb-4">
              <CardTitle className="flex items-center text-lg md:text-xl font-bold text-gray-900">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <Eye className="h-5 w-5 text-blue-600" />
                </div>
                Information We Collect
              </CardTitle>
              <CardDescription className="text-gray-600 ml-11">
                We only collect information that is necessary to provide our services.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300">
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                    <div className="bg-blue-100 p-1 rounded mr-2">
                      <Mail className="h-4 w-4 text-blue-600" />
                    </div>
                    Personal Information
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Email address, name (optional), and profile picture (optional) when you create an account.
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300">
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                    <div className="bg-blue-100 p-1 rounded mr-2">
                      <MessagesSquare className="h-4 w-4 text-blue-600" />
                    </div>
                    Usage Data
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Information about how you use our services, such as chat history, forum posts, and resource views.
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300">
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                    <div className="bg-blue-100 p-1 rounded mr-2">
                      <Globe className="h-4 w-4 text-blue-600" />
                    </div>
                    Device Information
                  </h3>
                  <p className="text-gray-600 text-sm">
                    IP address, browser type, and device information for security and service improvement.
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300">
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                    <div className="bg-blue-100 p-1 rounded mr-2">
                      <HeartPulse className="h-4 w-4 text-blue-600" />
                    </div>
                    Health Information
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Mental health data you voluntarily provide through chats, mood tracking, and counselor sessions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border border-blue-100 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 pb-4">
              <CardTitle className="flex items-center text-lg md:text-xl font-bold text-gray-900">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <Lock className="h-5 w-5 text-blue-600" />
                </div>
                How We Protect Your Information
              </CardTitle>
              <CardDescription className="text-gray-600 ml-11">
                We implement industry-standard security measures to protect your data.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100 shadow-sm hover:shadow-md transition-all duration-300 text-center">
                  <div className="flex justify-center mb-3">
                    <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center">
                      <Database className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">Encryption</h3>
                  <p className="text-gray-600 text-sm">
                    All data is encrypted in transit and at rest using industry-standard encryption protocols.
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100 shadow-sm hover:shadow-md transition-all duration-300 text-center">
                  <div className="flex justify-center mb-3">
                    <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center">
                      <Shield className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">Anonymization</h3>
                  <p className="text-gray-600 text-sm">
                    We use hashed identifiers instead of personal information wherever possible.
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100 shadow-sm hover:shadow-md transition-all duration-300 text-center">
                  <div className="flex justify-center mb-3">
                    <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center">
                      <Globe className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">Access Control</h3>
                  <p className="text-gray-600 text-sm">
                    Strict access controls ensure only authorized personnel can access your data.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border border-blue-100 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 pb-4">
              <CardTitle className="flex items-center text-lg md:text-xl font-bold text-gray-900">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <Trash2 className="h-5 w-5 text-blue-600" />
                </div>
                Data Retention and Deletion
              </CardTitle>
              <CardDescription className="text-gray-600 ml-11">
                We only retain your data for as long as necessary to provide our services.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-start p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex-shrink-0 h-5 w-5 text-blue-600 mt-0.5">•</div>
                  <p className="ml-3 text-gray-600">
                    <span className="font-medium text-gray-900">Chat History:</span> Automatically deleted after 30 days unless you choose to save it.
                  </p>
                </div>
                <div className="flex items-start p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex-shrink-0 h-5 w-5 text-blue-600 mt-0.5">•</div>
                  <p className="ml-3 text-gray-600">
                    <span className="font-medium text-gray-900">Account Data:</span> Retained as long as your account is active. You can request deletion at any time.
                  </p>
                </div>
                <div className="flex items-start p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex-shrink-0 h-5 w-5 text-blue-600 mt-0.5">•</div>
                  <p className="ml-3 text-gray-600">
                    <span className="font-medium text-gray-900">Counselor Sessions:</span> Session notes are retained for 7 years as required by professional standards.
                  </p>
                </div>
                <div className="flex items-start p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex-shrink-0 h-5 w-5 text-blue-600 mt-0.5">•</div>
                  <p className="ml-3 text-gray-600">
                    <span className="font-medium text-gray-900">Forum Posts:</span> Retained indefinitely unless you delete them or they violate our policies.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border border-blue-100 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 pb-4">
              <CardTitle className="flex items-center text-lg md:text-xl font-bold text-gray-900">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                Your Rights and Choices
              </CardTitle>
              <CardDescription className="text-gray-600 ml-11">
                You have control over your personal information.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-100 shadow-sm hover:shadow-md transition-all duration-300">
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                    <div className="bg-purple-100 p-1 rounded mr-2">
                      <Eye className="h-4 w-4 text-purple-600" />
                    </div>
                    Access and Update
                  </h3>
                  <p className="text-gray-600 text-sm">
                    You can access, update, or correct your personal information at any time through your account settings.
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-100 shadow-sm hover:shadow-md transition-all duration-300">
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                    <div className="bg-purple-100 p-1 rounded mr-2">
                      <Database className="h-4 w-4 text-purple-600" />
                    </div>
                    Data Portability
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Request a copy of your data in a machine-readable format.
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-100 shadow-sm hover:shadow-md transition-all duration-300">
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                    <div className="bg-purple-100 p-1 rounded mr-2">
                      <Trash2 className="h-4 w-4 text-purple-600" />
                    </div>
                    Deletion
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Request deletion of your account and associated data, subject to legal obligations.
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-100 shadow-sm hover:shadow-md transition-all duration-300">
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                    <div className="bg-purple-100 p-1 rounded mr-2">
                      <Shield className="h-4 w-4 text-purple-600" />
                    </div>
                    Opt-Out
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Opt-out of non-essential communications and data collection.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border border-blue-100 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 pb-4">
              <CardTitle className="text-lg md:text-xl font-bold text-gray-900">
                Contact Us
              </CardTitle>
              <CardDescription className="text-gray-600 ml-11">
                If you have any questions about this Privacy Policy, please contact us.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Mail className="h-5 w-5 text-blue-600" />
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