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

// Component for individual AI suggestion items
interface AISuggestionItemProps {
  suggestion: string;
  index: number;
  onUseSuggestion: (suggestion: string) => void;
  onCopyToClipboard: (text: string) => void;
}

function AISuggestionItem({ suggestion, index, onUseSuggestion, onCopyToClipboard }: AISuggestionItemProps) {
  return (
    <div className="bg-white border border-purple-100 rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex justify-between items-start mb-2">
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          Suggestion {index + 1}
        </Badge>
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onUseSuggestion(suggestion)}
            className="h-6 px-2 text-xs bg-purple-100 text-purple-700 hover:bg-purple-200"
          >
            Use
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCopyToClipboard(suggestion)}
            className="h-6 px-2 text-xs bg-purple-100 text-purple-700 hover:bg-purple-200"
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <p className="text-sm text-gray-700 whitespace-pre-wrap">{suggestion}</p>
    </div>
  );
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
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'replied': return 'bg-green-100 text-green-800 border-green-200';
      case 'resolved': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="mb-8 md:mb-12">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700">Contact Messages</span>
            </h1>
            <p className="text-gray-600 max-w-2xl">
              Manage and respond to user inquiries with AI assistance
            </p>
            <div className="mt-6 h-1 w-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <Card className="lg:col-span-1 bg-white shadow-md hover:shadow-lg transition-all duration-300 border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 pb-4">
              <CardTitle className="flex items-center text-lg md:text-xl font-bold text-gray-900">
                <MessageCircle className="h-5 w-5 mr-2 text-blue-600" />
                Messages
              </CardTitle>
              <CardDescription className="text-gray-600 ml-7">
                {filteredMessages.length} message(s) found
              </CardDescription>
              <div className="relative mt-4">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-300 ${
                      selectedMessage?.id === message.id
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setSelectedMessage(message);
                      setReplyContent('');
                      setAiSuggestions([]);
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="bg-blue-100 p-1 rounded-full">
                          <User className="h-3 w-3 text-blue-600" />
                        </div>
                        <span className="font-medium text-sm text-gray-900">{message.name}</span>
                      </div>
                      <div className="flex space-x-1">
                        <Badge variant="outline" className={`text-xs ${getUrgencyColor(message.urgency)}`}>
                          {message.urgency}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${getStatusColor(message.status)}`}>
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
                  <div className="text-center py-8">
                    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MessageCircle className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-700 font-medium mb-1">No messages found</p>
                    <p className="text-gray-500 text-sm">Try adjusting your search</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Reply Section */}
          <Card className="lg:col-span-2 bg-white shadow-md hover:shadow-lg transition-all duration-300 border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-100 pb-4">
              <CardTitle className="flex items-center text-lg md:text-xl font-bold text-gray-900">
                <Send className="h-5 w-5 mr-2 text-purple-600" />
                {selectedMessage ? 'Reply to Message' : 'Select a Message'}
              </CardTitle>
              <CardDescription className="text-gray-600 ml-7">
                {selectedMessage 
                  ? `Replying to ${selectedMessage.name} (${selectedMessage.email})`
                  : 'Choose a message from the list to reply'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              {selectedMessage ? (
                <div className="space-y-6">
                  {/* Original Message */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-blue-500" />
                      Original Message
                    </Label>
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="font-medium text-gray-900">{selectedMessage.name}</span>
                          <span className="text-gray-500 ml-2">({selectedMessage.email})</span>
                        </div>
                        <Badge variant="outline" className={`text-xs ${getUrgencyColor(selectedMessage.urgency)}`}>
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
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 md:p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="bg-purple-100 p-2 rounded-lg mr-3">
                          <Sparkles className="h-5 w-5 text-purple-600" />
                        </div>
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
                      <div className="space-y-3 mt-4">
                        <p className="text-sm text-purple-700 font-medium">AI Suggestions:</p>
                        {aiSuggestions.map((suggestion, index) => (
                          <AISuggestionItem
                            key={index}
                            suggestion={suggestion}
                            index={index}
                            onUseSuggestion={useAISuggestion}
                            onCopyToClipboard={copyToClipboard}
                          />
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
                      <Label htmlFor="reply" className="text-sm font-medium text-gray-700 flex items-center">
                        <Send className="h-4 w-4 mr-2 text-blue-500" />
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
                      className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  {/* Emergency Notice */}
                  {selectedMessage.urgency === 'critical' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <div className="bg-red-100 p-1 rounded-full mr-2">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        </div>
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
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-md hover:shadow-lg transition-all duration-300"
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
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                  </div>

                  {/* Response Time Guidance */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <div className="bg-blue-100 p-1 rounded-full mr-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                      </div>
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
                <div className="text-center py-12">
                  <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-700 font-medium mb-1">Select a message to reply</p>
                  <p className="text-gray-500 text-sm max-w-md mx-auto">
                    Choose a message from the list to view details and send a reply. Use the AI assistant to generate professional responses quickly.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}