'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Mail, 
  Clock, 
  User, 
  Send, 
  Search,
  AlertTriangle,
  CheckCircle,
  MessageCircle,
  Sparkles,
  Copy,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  urgency: string;
  status: string;
  createdAt: string;
}

export default function AdminContactPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/admin/contact/messages');
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const generateAIReply = async () => {
    if (!selectedMessage) return;

    setIsGeneratingAI(true);
    setAiSuggestions([]);

    try {
      const response = await fetch('/api/ai/generate-reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId: selectedMessage.id,
          userName: selectedMessage.name,
          userMessage: selectedMessage.message,
          subject: selectedMessage.subject,
          urgency: selectedMessage.urgency,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate AI reply');
      }

      const data = await response.json();
      setAiSuggestions(data.suggestions || []);
      
      if (data.suggestions && data.suggestions.length > 0) {
        toast.success('AI reply generated successfully!');
      } else {
        toast.warning('No AI suggestions generated');
      }
    } catch (error) {
      console.error('Error generating AI reply:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate AI reply');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const useAISuggestion = (suggestion: string) => {
    setReplyContent(suggestion);
    toast.success('AI suggestion copied to reply box');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleSendReply = async () => {
    if (!selectedMessage || !replyContent.trim()) {
      toast.error('Please write a reply message');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/contact/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId: selectedMessage.id,
          replyContent: replyContent.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send reply');
      }

      toast.success('Reply sent successfully!');
      setReplyContent('');
      setSelectedMessage(null);
      setAiSuggestions([]);
      fetchMessages(); // Refresh the list
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send reply');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMessages = messages.filter(message =>
    message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'replied': return 'bg-green-100 text-green-800';
      case 'resolved': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Messages</h1>
        <p className="text-gray-600">Manage and respond to user inquiries with AI assistance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Messages</CardTitle>
            <CardDescription>
              {filteredMessages.length} message(s) found
            </CardDescription>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedMessage?.id === message.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    setSelectedMessage(message);
                    setReplyContent('');
                    setAiSuggestions([]);
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-sm">{message.name}</span>
                    </div>
                    <div className="flex space-x-1">
                      <Badge variant="outline" className={getUrgencyColor(message.urgency)}>
                        {message.urgency}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(message.status)}>
                        {message.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {message.subject}
                  </p>
                  
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {message.message}
                  </p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      {new Date(message.createdAt).toLocaleDateString()}
                    </span>
                    <Mail className="h-3 w-3 text-gray-400" />
                  </div>
                </div>
              ))}
              
              {filteredMessages.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  No messages found
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Reply Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedMessage ? 'Reply to Message' : 'Select a Message'}
            </CardTitle>
            <CardDescription>
              {selectedMessage 
                ? `Replying to ${selectedMessage.name} (${selectedMessage.email})`
                : 'Choose a message from the list to reply'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedMessage ? (
              <div className="space-y-6">
                {/* Original Message */}
                <div>
                  <Label className="text-sm font-medium">Original Message</Label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="font-medium">{selectedMessage.name}</span>
                        <span className="text-gray-500 ml-2">({selectedMessage.email})</span>
                      </div>
                      <Badge variant="outline" className={getUrgencyColor(selectedMessage.urgency)}>
                        {selectedMessage.urgency} urgency
                      </Badge>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
                    <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                      <span>Received: {new Date(selectedMessage.createdAt).toLocaleString()}</span>
                      <span>Status: {selectedMessage.status}</span>
                    </div>
                  </div>
                </div>

                {/* AI Reply Generation */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Sparkles className="h-5 w-5 text-purple-600 mr-2" />
                      <span className="font-medium text-purple-800">AI Reply Assistant</span>
                    </div>
                    <Button 
                      onClick={generateAIReply}
                      disabled={isGeneratingAI}
                      variant="outline"
                      size="sm"
                      className="border-purple-300 text-purple-700 hover:bg-purple-100"
                    >
                      {isGeneratingAI ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate AI Reply
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {aiSuggestions.length > 0 && (
                    <div className="space-y-3 mt-3">
                      <p className="text-sm text-purple-700 font-medium">AI Suggestions:</p>
                      {aiSuggestions.map((suggestion, index) => (
                        <div key={index} className="bg-white border border-purple-100 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant="outline" className="bg-purple-50 text-purple-700">
                              Suggestion {index + 1}
                            </Badge>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => useAISuggestion(suggestion)}
                                className="h-6 px-2 text-xs"
                              >
                                Use
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(suggestion)}
                                className="h-6 px-2 text-xs"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{suggestion}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {aiSuggestions.length === 0 && !isGeneratingAI && (
                    <p className="text-sm text-purple-600">
                      Click &quot;Generate AI Reply&quot; to get AI-powered response suggestions tailored to this message.
                    </p>
                  )}
                </div>

                {/* Reply Form */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="reply" className="text-sm font-medium">
                      Your Response
                    </Label>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{replyContent.length} characters</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(replyContent)}
                        disabled={!replyContent.trim()}
                        className="h-6 px-2"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    id="reply"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write your response here... or use AI suggestions above"
                    rows={8}
                    className="mt-1"
                  />
                </div>

                {/* Emergency Notice */}
                {selectedMessage.urgency === 'critical' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                      <span className="font-medium text-red-800">High Urgency Message</span>
                    </div>
                    <p className="text-red-700 text-sm">
                      This message has been marked as critical. Please respond promptly and consider 
                      including emergency contact information in your reply.
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <Button 
                    onClick={handleSendReply}
                    disabled={isLoading || !replyContent.trim()}
                    className="flex-1"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isLoading ? 'Sending...' : 'Send Manual Reply'}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedMessage(null);
                      setReplyContent('');
                      setAiSuggestions([]);
                    }}
                  >
                    Cancel
                  </Button>
                </div>

                {/* Response Time Guidance */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Clock className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-medium text-blue-800">Response Time Guidance</span>
                  </div>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li>• <strong>Critical:</strong> Respond within 1-2 hours</li>
                    <li>• <strong>High:</strong> Respond within 4-6 hours</li>
                    <li>• <strong>Normal:</strong> Respond within 24-48 hours</li>
                    <li>• <strong>Low:</strong> Respond within 72 hours</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Mail className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>Select a message from the list to view details and send a reply.</p>
                <p className="text-sm mt-2">Use the AI assistant to generate professional responses quickly.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}