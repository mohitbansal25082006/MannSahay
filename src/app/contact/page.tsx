'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Mail, 
  Phone, 
  Clock, 
  Send, 
  CheckCircle, 
  AlertTriangle,
  Heart,
  Shield,
  Users,
  MapPin,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';

export default function ContactPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    urgency: 'normal'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit contact form');
      }
      
      setIsSubmitted(true);
      toast.success('Your message has been sent successfully. We&apos;ll get back to you soon!');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        urgency: 'normal'
      });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast.error('Failed to send your message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const emergencyContacts = [
    {
      name: "National Mental Health Helpline",
      number: "1800-599-0019",
      description: "24/7 free mental health support",
      icon: Phone
    },
    {
      name: "iCall",
      number: "9152987821",
      description: "Psychological support by TISS",
      icon: Phone
    },
    {
      name: "Snehi",
      number: "91-22-2772-6551",
      description: "Emotional support helpline",
      icon: Phone
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
        
        <div className="text-center mb-12 md:mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 w-16 h-16 rounded-full flex items-center justify-center shadow-lg">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700">24/7 Emergency Support</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            We&apos;re here for you around the clock. Reach out anytime for support, guidance, or just someone to talk to.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 md:mb-16">
          <Card className="lg:col-span-2 bg-white shadow-md hover:shadow-lg transition-all duration-300 border border-blue-100 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 pb-4">
              <CardTitle className="flex items-center text-lg md:text-xl font-bold text-gray-900">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <Send className="h-5 w-5 text-blue-600" />
                </div>
                Send us a Message
              </CardTitle>
              <CardDescription className="text-gray-600 ml-11">
                Fill out the form below and we&apos;ll get back to you as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">Message Sent Successfully!</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Thank you for reaching out. We&apos;ve received your message and will respond within 24 hours.
                  </p>
                  <Button 
                    onClick={() => setIsSubmitted(false)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name" className="text-gray-700 font-medium">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Enter your full name"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="Enter your email"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="subject" className="text-gray-700 font-medium">Subject</Label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      placeholder="What is this regarding?"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="urgency" className="text-gray-700 font-medium">Urgency Level</Label>
                    <select
                      id="urgency"
                      name="urgency"
                      value={formData.urgency}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low - General Inquiry</option>
                      <option value="normal">Normal - Standard Support</option>
                      <option value="high">High - Urgent Assistance</option>
                      <option value="critical">Critical - Emergency</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="message" className="text-gray-700 font-medium">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      placeholder="Tell us how we can help you..."
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-md hover:shadow-lg transition-all duration-300" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      'Send Message'
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border border-blue-100 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 pb-4">
                <CardTitle className="flex items-center text-lg md:text-xl font-bold text-gray-900">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  Response Times
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">General Inquiries</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">24-48 hours</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Support Requests</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">12-24 hours</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Urgent Matters</span>
                  <Badge variant="destructive" className="bg-red-100 text-red-800">2-4 hours</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Emergencies</span>
                  <Badge variant="outline" className="text-red-600 border-red-600 bg-red-50">Immediate</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border border-blue-100 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 pb-4">
                <CardTitle className="flex items-center text-lg md:text-xl font-bold text-gray-900">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  Direct Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Mail className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-gray-600">mohitbansal25082006@gmail.com</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Phone className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-gray-600">+91 8080808080</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <MapPin className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-gray-600">Jaipur, India</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border border-red-100 overflow-hidden mb-12 md:mb-16">
          <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-100 pb-4">
            <CardTitle className="flex items-center text-lg md:text-xl font-bold text-gray-900">
              <div className="bg-red-100 p-2 rounded-lg mr-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              Emergency Helplines
            </CardTitle>
            <CardDescription className="text-gray-600 ml-11">
              If you&apos;re in immediate crisis, please reach out to these 24/7 emergency helplines.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {emergencyContacts.map((contact, index) => {
                const Icon = contact.icon;
                return (
                  <div key={index} className="p-5 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg border border-red-200 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center mb-4">
                      <div className="bg-red-100 p-2 rounded-full">
                        <Icon className="h-6 w-6 text-red-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 ml-3">{contact.name}</h3>
                    </div>
                    <p className="text-2xl font-bold text-red-700 mb-3">{contact.number}</p>
                    <p className="text-sm text-gray-600 bg-white p-2 rounded border border-red-100">
                      {contact.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border border-blue-100 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 pb-4">
              <CardTitle className="flex items-center text-lg md:text-xl font-bold text-gray-900">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <Heart className="h-5 w-5 text-blue-600" />
                </div>
                Compassionate Support
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-600">
                Our team is trained to provide empathetic, non-judgmental support for all your mental health concerns.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border border-blue-100 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 pb-4">
              <CardTitle className="flex items-center text-lg md:text-xl font-bold text-gray-900">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                Confidential & Secure
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-600">
                All conversations are kept strictly confidential. Your privacy and security are our top priorities.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border border-blue-100 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 pb-4">
              <CardTitle className="flex items-center text-lg md:text-xl font-bold text-gray-900">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                Professional Team
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-600">
                Our support team includes licensed mental health professionals and trained counselors.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}