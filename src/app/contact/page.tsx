// E:\mannsahay\src\app\contact\page.tsx
'use client';

import { useState } from 'react';
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
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';

export default function ContactPage() {
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
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <MessageCircle className="h-16 w-16 text-blue-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">24/7 Emergency Support</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          We&apos;re here for you around the clock. Reach out anytime for support, guidance, or just someone to talk to.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Send className="h-5 w-5 mr-2 text-blue-600" />
              Send us a Message
            </CardTitle>
            <CardDescription>
              Fill out the form below and we&apos;ll get back to you as soon as possible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSubmitted ? (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Message Sent Successfully!</h3>
                <p className="text-gray-600 mb-4">
                  Thank you for reaching out. We&apos;ve received your message and will respond within 24 hours.
                </p>
                <Button onClick={() => setIsSubmitted(false)}>
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="What is this regarding?"
                  />
                </div>
                
                <div>
                  <Label htmlFor="urgency">Urgency Level</Label>
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
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Tell us how we can help you..."
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-600" />
                Response Times
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">General Inquiries</span>
                <Badge variant="secondary">24-48 hours</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Support Requests</span>
                <Badge variant="secondary">12-24 hours</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Urgent Matters</span>
                <Badge variant="destructive">2-4 hours</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Emergencies</span>
                <Badge variant="outline" className="text-red-600 border-red-600">Immediate</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-blue-600" />
                Direct Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-500" />
                <span className="text-gray-600">mohitbansal25082006@gmail.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-500" />
                <span className="text-gray-600">+91 8080808080</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-gray-500" />
                <span className="text-gray-600">Jaipur, India</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="mb-12">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
            Emergency Helplines
          </CardTitle>
          <CardDescription>
            If you&apos;re in immediate crisis, please reach out to these 24/7 emergency helplines.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {emergencyContacts.map((contact, index) => {
              const Icon = contact.icon;
              return (
                <div key={index} className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center mb-3">
                    <Icon className="h-6 w-6 text-red-600 mr-2" />
                    <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                  </div>
                  <p className="text-2xl font-bold text-red-700 mb-2">{contact.number}</p>
                  <p className="text-sm text-gray-600">{contact.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="h-5 w-5 mr-2 text-blue-600" />
              Compassionate Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Our team is trained to provide empathetic, non-judgmental support for all your mental health concerns.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-blue-600" />
              Confidential & Secure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              All conversations are kept strictly confidential. Your privacy and security are our top priorities.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              Professional Team
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Our support team includes licensed mental health professionals and trained counselors.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}