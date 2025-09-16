'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat, type Message } from 'ai/react';
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
  Phone,
  Mic,
  Square,
  Play,
  Pause,
  Volume2,
  MessageSquare,
  Plus,
  Trash2,
  Edit,
  Save,
  FolderOpen
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import ReactMarkdown from 'react-markdown';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useChatSessions } from '@/hooks/useChatSessions';
import { ChatSessionSidebar } from '@/components/chat/ChatSessionSidebar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ChatSession {
  id: string;
  title: string | null;
  isActive: boolean;
  isArchived: boolean;
  language: string;
  riskLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
  totalMessages: number;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    chats: number;
  };
  chats: Array<{
    content: string;
    role: string;
    timestamp: string;
  }>;
}

const suggestedMessages = [
  "I'm feeling really stressed about my exams",
  "How can I manage anxiety?",
  "I feel lonely at college",
  "Help me with sleep issues",
  "I'm overwhelmed with assignments",
  // Hindi suggestions
  "मैं अपनी परीक्षाओं को लेकर बहुत तनाव में हूं",
  "चिंता को कैसे प्रबंधित कर सकता हूं?",
  "मैं कॉलेज में अकेला महसूस करता हूं",
  "नींद की समस्याओं में मदद करें",
  "मैं असाइनमेंट्स से अभिभूत हूं"
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
  },
  {
    name: "Vandrevala Foundation",
    number: "9999666555",
    description: "Mental health support in India"
  }
];

export default function ChatPage() {
  const { data: session } = useSession();
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    isRecording,
    audioBlob,
    audioUrl,
    startRecording,
    stopRecording,
    clearRecording,
    error: recordingError
  } = useAudioRecorder();

  const {
    isPlaying,
    currentTime,
    duration,
    play,
    pause,
    seek,
    loadAudio,
    error: playbackError
  } = useAudioPlayer();

  const {
    sessions,
    currentSession,
    isLoading: isLoadingSessions,
    createSession,
    loadSession,
    updateSession,
    deleteSession,
    error: sessionsError
  } = useChatSessions();

  const { messages, input, handleInputChange, handleSubmit, isLoading, setInput, setMessages } = useChat({
    api: '/api/chat',
    body: {
      language: language,
      sessionId: currentSession?.id
    },
    onFinish: async (message: Message) => {
      // Extract session ID from the streamed response
      if (message.content && message.content.includes('SESSION_ID:')) {
        const sessionId = message.content.split('SESSION_ID:')[1];
        if (sessionId) {
          setCurrentSessionId(sessionId);
          // Refresh the sessions list to show the new/updated session
          // This will be handled by the useChatSessions hook
        }
      }
    },
    onError: (error) => {
      console.error('Chat error:', error);
    }
  });

  // Load messages when a session is selected
  useEffect(() => {
    if (currentSession) {
      loadSessionMessages(currentSession.id);
      setCurrentSessionId(currentSession.id);
    }
  }, [currentSession]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (recordingError) {
      console.error('Recording error:', recordingError);
    }
    if (playbackError) {
      console.error('Playback error:', playbackError);
    }
    if (sessionsError) {
      console.error('Sessions error:', sessionsError);
    }
  }, [recordingError, playbackError, sessionsError]);

  const loadSessionMessages = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        const sessionMessages = data.session.chats.map((chat: any) => ({
          id: chat.id,
          content: chat.content,
          role: chat.role,
          createdAt: new Date(chat.timestamp)
        }));
        
        setMessages(sessionMessages);
      }
    } catch (error) {
      console.error('Error loading session messages:', error);
    }
  };

  const handleNewSession = async () => {
    const newSession = await createSession(
      language === 'hi' ? 'नई बातचीत' : 'New Conversation',
      language
    );
    if (newSession) {
      setMessages([]);
      setCurrentSessionId(newSession.id);
      setShowHistory(false);
    }
  };

  const handleSessionSelect = (session: ChatSession) => {
    loadSession(session.id);
    setCurrentSessionId(session.id);
    setShowHistory(false);
  };

  const handleSaveSession = async () => {
    if (!currentSessionId || !saveTitle.trim()) return;
    
    setIsSaving(true);
    try {
      await updateSession(currentSessionId, { title: saveTitle.trim() });
      setSaveDialogOpen(false);
      setSaveTitle('');
    } catch (error) {
      console.error('Error saving session:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSuggestedMessage = (message: string) => {
    setInput(message);
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

  const handleAudioSubmit = async () => {
    if (!audioBlob) return;

    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('language', language);

      const response = await fetch('/api/audio/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const { text } = await response.json();
        setInput(text);
        // Auto-submit after transcription
        setTimeout(() => {
          const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
          const form = document.querySelector('form');
          form?.dispatchEvent(submitEvent);
          clearRecording();
        }, 100);
      } else {
        console.error('Transcription failed');
      }
    } catch (error) {
      console.error('Transcription error:', error);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleTextToSpeech = async (text: string) => {
    setIsGeneratingSpeech(true);
    try {
      const response = await fetch('/api/audio/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          language: language,
        }),
      });

      if (response.ok) {
        const audioBuffer = await response.arrayBuffer();
        loadAudio(audioBuffer);
        play();
      } else {
        console.error('Speech generation failed');
      }
    } catch (error) {
      console.error('Speech generation error:', error);
    } finally {
      setIsGeneratingSpeech(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Chat History Sidebar */}
        <div className="lg:col-span-1">
          <ChatSessionSidebar 
            onSessionSelect={handleSessionSelect}
            language={language}
          />
        </div>
        
        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bot className="h-5 w-5 mr-2 text-blue-600" />
                  <CardTitle className="flex items-center">
                    {currentSession?.title || 'New Conversation'}
                    <Badge variant="secondary" className="ml-2">Online</Badge>
                  </CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  {/* Save Button */}
                  <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" disabled={!currentSessionId}>
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Save Conversation</DialogTitle>
                        <DialogDescription>
                          Give your conversation a name to save it for later.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="title" className="text-right">
                            Title
                          </Label>
                          <Input
                            id="title"
                            value={saveTitle}
                            onChange={(e) => setSaveTitle(e.target.value)}
                            placeholder="Enter conversation title"
                            className="col-span-3"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSaveSession} disabled={isSaving || !saveTitle.trim()}>
                          {isSaving ? 'Saving...' : 'Save'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNewSession}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    New
                  </Button>
                </div>
              </div>
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
                        
                        {/* Audio playback for assistant messages */}
                        {message.role === 'assistant' && (
                          <div className="mt-2 flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTextToSpeech(message.content)}
                              disabled={isGeneratingSpeech}
                              className="text-xs"
                            >
                              <Volume2 className="h-3 w-3 mr-1" />
                              {isGeneratingSpeech ? 'Generating...' : 'Listen'}
                            </Button>
                          </div>
                        )}
                        
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
                {/* Audio Recording Section */}
                {audioBlob && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-blue-800">Recorded audio</span>
                      <audio src={audioUrl!} controls className="h-8" />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={handleAudioSubmit}
                        disabled={isTranscribing}
                      >
                        {isTranscribing ? 'Transcribing...' : 'Send Audio'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearRecording}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                <form onSubmit={customHandleSubmit}>
                  <div className="flex space-x-2">
                    <Textarea
                      value={input}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      placeholder={
                        language === 'hi' 
                          ? 'अपने विचार साझा करें या माइक्रोफोन बटन दबाएं...' 
                          : 'Share your thoughts or press the microphone button...'
                      }
                      className="flex-1 min-h-[44px] max-h-32 resize-none"
                      disabled={isLoading || isRecording}
                    />
                    
                    {/* Voice Recording Button */}
                    <Button
                      type="button"
                      variant={isRecording ? "destructive" : "outline"}
                      onClick={isRecording ? stopRecording : startRecording}
                      disabled={isLoading}
                      className="flex-shrink-0"
                    >
                      {isRecording ? (
                        <Square className="h-4 w-4" />
                      ) : (
                        <Mic className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Button 
                      type="submit" 
                      disabled={!input.trim() || isLoading}
                      size="lg"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </form>

                {/* Audio Player */}
                {isPlaying && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={isPlaying ? pause : play}
                      >
                        {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                      </Button>
                      <div className="flex-1">
                        <div className="text-xs text-green-800 mb-1">
                          Playing response...
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-green-600">{formatTime(currentTime)}</span>
                          <input
                            type="range"
                            min="0"
                            max={duration}
                            value={currentTime}
                            onChange={(e) => seek(parseFloat(e.target.value))}
                            className="flex-1 h-1 bg-green-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <span className="text-xs text-green-600">{formatTime(duration)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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