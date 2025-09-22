// E:\mannsahay\src\app\privacy\page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Eye, Database, Trash2, Mail, Globe } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <Shield className="h-16 w-16 text-blue-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Your privacy is our top priority. This policy explains how we collect, use, and protect your personal information.
        </p>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="h-5 w-5 mr-2 text-blue-600" />
              Information We Collect
            </CardTitle>
            <CardDescription>
              We only collect information that is necessary to provide our services.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Personal Information</h3>
                <p className="text-gray-600 text-sm">
                  Email address, name (optional), and profile picture (optional) when you create an account.
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Usage Data</h3>
                <p className="text-gray-600 text-sm">
                  Information about how you use our services, such as chat history, forum posts, and resource views.
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Device Information</h3>
                <p className="text-gray-600 text-sm">
                  IP address, browser type, and device information for security and service improvement.
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Health Information</h3>
                <p className="text-gray-600 text-sm">
                  Mental health data you voluntarily provide through chats, mood tracking, and counselor sessions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="h-5 w-5 mr-2 text-blue-600" />
              How We Protect Your Information
            </CardTitle>
            <CardDescription>
              We implement industry-standard security measures to protect your data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <div className="flex justify-center mb-2">
                  <Database className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Encryption</h3>
                <p className="text-gray-600 text-sm">
                  All data is encrypted in transit and at rest using industry-standard encryption protocols.
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <div className="flex justify-center mb-2">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Anonymization</h3>
                <p className="text-gray-600 text-sm">
                  We use hashed identifiers instead of personal information wherever possible.
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <div className="flex justify-center mb-2">
                  <Globe className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Access Control</h3>
                <p className="text-gray-600 text-sm">
                  Strict access controls ensure only authorized personnel can access your data.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trash2 className="h-5 w-5 mr-2 text-blue-600" />
              Data Retention and Deletion
            </CardTitle>
            <CardDescription>
              We only retain your data for as long as necessary to provide our services.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-blue-600 mt-0.5">•</div>
                <p className="ml-3 text-gray-600">
                  <span className="font-medium">Chat History:</span> Automatically deleted after 30 days unless you choose to save it.
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-blue-600 mt-0.5">•</div>
                <p className="ml-3 text-gray-600">
                  <span className="font-medium">Account Data:</span> Retained as long as your account is active. You can request deletion at any time.
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-blue-600 mt-0.5">•</div>
                <p className="ml-3 text-gray-600">
                  <span className="font-medium">Counselor Sessions:</span> Session notes are retained for 7 years as required by professional standards.
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-blue-600 mt-0.5">•</div>
                <p className="ml-3 text-gray-600">
                  <span className="font-medium">Forum Posts:</span> Retained indefinitely unless you delete them or they violate our policies.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2 text-blue-600" />
              Your Rights and Choices
            </CardTitle>
            <CardDescription>
              You have control over your personal information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Access and Update</h3>
                <p className="text-gray-600 text-sm">
                  You can access, update, or correct your personal information at any time through your account settings.
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Data Portability</h3>
                <p className="text-gray-600 text-sm">
                  Request a copy of your data in a machine-readable format.
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Deletion</h3>
                <p className="text-gray-600 text-sm">
                  Request deletion of your account and associated data, subject to legal obligations.
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Opt-Out</h3>
                <p className="text-gray-600 text-sm">
                  Opt-out of non-essential communications and data collection.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
            <CardDescription>
              If you have any questions about this Privacy Policy, please contact us.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Mail className="h-5 w-5 text-gray-500" />
              <span className="text-gray-600">mohitbansal25082006@gmail.com</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}