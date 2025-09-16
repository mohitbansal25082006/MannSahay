'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from 'ai/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Send, 
  Bot, 
  User, 
  AlertTriangle,
  Lightbulb,
  Heart,
  Phone
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import ReactMarkdown from 'react-markdown';

const suggestedMessages = [
  "I'm feeling really stressed about my exams",
  "How can I manage anxiety?",
  "I feel lonely at college",
  "Help me with sleep issues",
  "I'm overwhelmed with assignments"
];

const emergencyContacts = [
  {
    name: "National Suicide Prevention Lifeline",
    number: "1-800-273-8255",
    description: "24/7 crisis support"
  },
  {
    name: "Crisis Text Line",
    number: "Text HOME to 741741",
    description: "Free 24/7 crisis support"
  },
  {
    name: "Indian Emergency",
    number: "108 or 112",
    description: "Emergency services in India"
  }
];

export default function ChatPage() {
  const { data: session } = useSession();
  const [language, setLanguage] = useState('en');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, setInput, setMessages } = useChat({
    api: '/api/chat',
    body: {
      language: language
    },
    onError: (error) => {
      console.error('Chat error:', error);
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSuggestedMessage = (message: string) => {
    setInput(message);
    // Auto-submit after a short delay
    setTimeout(() => {
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      const form = document.querySelector('form');
      form?.dispatchEvent(submitEvent);
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const customHandleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    handleSubmit(e as any);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AI Chat Companion
        </h1>
        <p className="text-gray-600">
          Share your thoughts and feelings. I'm here to listen and support you.
        </p>
        
        {/* Language Toggle */}
        <div className="flex items-center space-x-2 mt-4">
          <span className="text-sm text-gray-500">Language:</span>
          <Button
            variant={language === 'en' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLanguage('en')}
          >
            English
          </Button>
          <Button
            variant={language === 'hi' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLanguage('hi')}
          >
            हिंदी
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <Bot className="h-5 w-5 mr-2 text-blue-600" />
                MannSahay AI
                <Badge variant="secondary" className="ml-2">Online</Badge>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages Area */}
              <ScrollArea className="flex-1 px-6 py-4">
                <div className="space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center py-8">
                      <Bot className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Welcome to MannSahay Chat! 🌟
                      </h3>
                      <p className="text-gray-500 mb-4">
                        I'm here to listen and support you. How are you feeling today?
                      </p>
                      
                      {/* Suggested Messages */}
                      <div className="flex flex-wrap justify-center gap-2">
                        {suggestedMessages.map((msg, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => handleSuggestedMessage(msg)}
                            className="text-xs"
                          >
                            {msg}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex items-start space-x-3 ${
                        message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                      }`}
                    >
                      <Avatar className="h-8 w-8">
                        {message.role === 'user' ? (
                          <>
                            <AvatarImage src={session?.user?.image || ''} />
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </>
                        ) : (
                          <AvatarFallback className="bg-blue-100">
                            <Bot className="h-4 w-4 text-blue-600" />
                          </AvatarFallback>
                        )}
                      </Avatar>
                      
                      <div
                        className={`flex-1 max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl ${
                          message.role === 'user' ? 'text-right' : 'text-left'
                        }`}
                      >
                        <div
                          className={`inline-block p-3 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          {message.role === 'assistant' ? (
                            <div className="prose prose-sm max-w-none">
                              <ReactMarkdown>
                                {message.content}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            <p className="text-sm">{message.content}</p>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date().toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-100">
                          <Bot className="h-4 w-4 text-blue-600" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="inline-block p-3 rounded-lg bg-gray-100">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>
              
              {/* Input Area */}
              <div className="p-4 border-t">
                <form onSubmit={customHandleSubmit}>
                  <div className="flex space-x-2">
                    <Textarea
                      value={input}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      placeholder={language === 'hi' ? 'अपने विचार साझा करें...' : 'Share your thoughts...'}
                      className="flex-1 min-h-[44px] max-h-32 resize-none"
                      disabled={isLoading}
                    />
                    <Button 
                      type="submit" 
                      disabled={!input.trim() || isLoading}
                      size="lg"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Crisis Support */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-red-600">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Crisis Support
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">
                If you're in crisis, please reach out immediately:
              </p>
              {emergencyContacts.map((contact, index) => (
                <div key={index} className="p-3 bg-red-50 rounded-lg">
                  <h4 className="font-medium text-sm text-red-800">
                    {contact.name}
                  </h4>
                  <p className="font-mono text-sm text-red-700">
                    {contact.number}
                  </p>
                  <p className="text-xs text-red-600">
                    {contact.description}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
          
          {/* Quick Tips */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-green-600">
                <Lightbulb className="h-4 w-4 mr-2" />
                Quick Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-sm text-green-800 mb-1">
                    Breathing Exercise
                  </h4>
                  <p className="text-xs text-green-700">
                    4-7-8 technique: Inhale 4, hold 7, exhale 8
                  </p>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-sm text-blue-800 mb-1">
                    Grounding
                  </h4>
                  <p className="text-xs text-blue-700">
                    Name 5 things you can see, 4 you can hear, 3 you can touch
                  </p>
                </div>
                
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-sm text-purple-800 mb-1">
                    Affirmation
                  </h4>
                  <p className="text-xs text-purple-700">
                    "This feeling is temporary. I am stronger than I know."
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Professional Help */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-blue-600">
                <Heart className="h-4 w-4 mr-2" />
                Need More Support?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Consider booking a session with our professional counselors.
              </p>
              <Button className="w-full" size="sm">
                <Phone className="h-4 w-4 mr-2" />
                Book Counselor
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}