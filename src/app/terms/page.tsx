// E:\mannsahay\src\app\terms\page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle, AlertTriangle, XCircle, Users, Heart, Shield } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <FileText className="h-16 w-16 text-blue-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          By using MannSahay, you agree to these terms. Please read them carefully.
        </p>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              Acceptance of Terms
            </CardTitle>
            <CardDescription>
              By accessing or using MannSahay, you agree to be bound by these Terms of Service.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              MannSahay is a mental health support platform designed for Indian students. By creating an account or using our services, 
              you agree to comply with and be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, 
              please do not use our services.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="h-5 w-5 mr-2 text-blue-600" />
              Description of Service
            </CardTitle>
            <CardDescription>
              MannSahay provides AI-powered mental health support and resources.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">AI Chat Companion</h3>
                <p className="text-gray-600 text-sm">
                  24/7 empathetic AI support with cultural understanding for Indian students.
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Professional Counseling</h3>
                <p className="text-gray-600 text-sm">
                  Connect with licensed mental health professionals for one-on-one sessions.
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Peer Support Forum</h3>
                <p className="text-gray-600 text-sm">
                  Anonymous community support with moderation and safety features.
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Resource Library</h3>
                <p className="text-gray-600 text-sm">
                  Curated mental health resources in multiple Indian languages.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-blue-600" />
              User Responsibilities
            </CardTitle>
            <CardDescription>
              As a user of MannSahay, you agree to the following responsibilities.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-green-600 mt-0.5">•</div>
                <p className="ml-3 text-gray-600">
                  <span className="font-medium">Honest Communication:</span> Provide accurate information when creating your account and using our services.
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-green-600 mt-0.5">•</div>
                <p className="ml-3 text-gray-600">
                  <span className="font-medium">Respectful Interaction:</span> Treat other users, counselors, and staff with respect and dignity.
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-green-600 mt-0.5">•</div>
                <p className="ml-3 text-gray-600">
                  <span className="font-medium">Confidentiality:</span> Respect the privacy and confidentiality of other users.
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-green-600 mt-0.5">•</div>
                <p className="ml-3 text-gray-600">
                  <span className="font-medium">Appropriate Use:</span> Use the service for its intended purpose and not for any illegal or harmful activities.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-blue-600" />
              Prohibited Activities
            </CardTitle>
            <CardDescription>
              The following activities are strictly prohibited on MannSahay.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-red-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Harmful Content</h3>
                <p className="text-gray-600 text-sm">
                  Posting content that promotes self-harm, violence, or discrimination.
                </p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Harassment</h3>
                <p className="text-gray-600 text-sm">
                  Bullying, stalking, or intimidating other users.
                </p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Impersonation</h3>
                <p className="text-gray-600 text-sm">
                  Pretending to be someone else or creating fake accounts.
                </p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Spam</h3>
                <p className="text-gray-600 text-sm">
                  Sending unsolicited messages or promotional content.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <XCircle className="h-5 w-5 mr-2 text-blue-600" />
              Termination
            </CardTitle>
            <CardDescription>
              We may terminate or suspend your account for violations of these terms.
            </CardDescription>
          </CardHeader>
          <CardContent>
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-blue-600" />
              Disclaimer
            </CardTitle>
            <CardDescription>
              Important information about our services and limitations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-blue-600 mt-0.5">•</div>
                <p className="ml-3 text-gray-600">
                  <span className="font-medium">Not a Replacement for Professional Help:</span> MannSahay is not a substitute for professional medical advice, diagnosis, or treatment.
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-blue-600 mt-0.5">•</div>
                <p className="ml-3 text-gray-600">
                  <span className="font-medium">No Guarantee of Results:</span> We do not guarantee specific outcomes from using our services.
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-blue-600 mt-0.5">•</div>
                <p className="ml-3 text-gray-600">
                  <span className="font-medium">Emergency Situations:</span> If you are in crisis or experiencing a medical emergency, please contact emergency services immediately.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Changes to Terms</CardTitle>
            <CardDescription>
              We may update these terms from time to time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              We reserve the right, at our sole discretion, to modify or replace these Terms of Service at any time. 
              If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect. 
              What constitutes a material change will be determined at our sole discretion.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>
              If you have any questions about these Terms of Service, please contact us.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <FileText className="h-5 w-5 text-gray-500" />
              <span className="text-gray-600">mohitbansal25082006@gmail.com</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}