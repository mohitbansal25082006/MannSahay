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
  FolderOpen,
  Archive,
  ArchiveRestore,
  Menu,
  X,
  ChevronDown,
  Languages
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import ReactMarkdown from 'react-markdown';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useChatSessions, type ChatSession } from '@/hooks/useChatSessions';
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
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';

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

const languageOptions = [
  { value: 'en', label: 'English', icon: '🇺🇸' },
  { value: 'hi', label: 'हिन्दी', icon: '🇮🇳' }
];

export default function ChatPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [archiveTitle, setArchiveTitle] = useState('');
  const [isArchiving, setIsArchiving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
    archivedSessions,
    currentSession,
    isLoading: isLoadingSessions,
    createSession,
    loadSession,
    updateSession,
    deleteSession,
    archiveSession,
    unarchiveSession,
    error: sessionsError
  } = useChatSessions();

  const { messages, input, handleInputChange, handleSubmit, isLoading, setInput, setMessages } = useChat({
    api: '/api/chat',
    body: {
      language: language,
      sessionId: currentSession?.id
    },
    onFinish: async (message: Message) => {
      if (message.content && message.content.includes('SESSION_ID:')) {
        const sessionId = message.content.split('SESSION_ID:')[1];
        if (sessionId) {
          setCurrentSessionId(sessionId);
        }
      }
    },
    onError: (error) => {
      console.error('Chat error:', error);
    }
  });

  useEffect(() => {
    if (currentSession) {
      loadSessionMessages(currentSession.id);
      setCurrentSessionId(currentSession.id);
      setArchiveTitle(currentSession.title || '');
    }
  }, [currentSession]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Scroll to bottom when audio player appears
  useEffect(() => {
    if (duration > 0) {
      scrollToBottom();
    }
  }, [duration, isPlaying]);

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
        const sessionMessages = data.session.chats.map((chat: { content: string; role: string; timestamp: string }) => ({
          id: chat.timestamp, // Use timestamp as a fallback id if needed
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
      setSidebarOpen(false);
    }
  };

  const handleSessionSelect = (session: ChatSession) => {
    loadSession(session.id);
    setCurrentSessionId(session.id);
    setShowHistory(false);
    setSidebarOpen(false);
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

  const handleArchiveSession = async () => {
    if (!currentSessionId) return;
    
    setIsArchiving(true);
    try {
      await archiveSession(currentSessionId);
      setArchiveDialogOpen(false);
      setMessages([]);
      setCurrentSessionId(null);
    } catch (error) {
      console.error('Error archiving session:', error);
    } finally {
      setIsArchiving(false);
    }
  };

  const handleUnarchiveSession = async (sessionId: string) => {
    try {
      await unarchiveSession(sessionId);
      const session = await loadSession(sessionId);
      if (session) {
        setCurrentSessionId(sessionId);
      }
    } catch (error) {
      console.error('Error unarchiving session:', error);
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
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  const customHandleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    handleSubmit(e);
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
        // Scroll to bottom after a short delay to ensure player renders
        setTimeout(() => scrollToBottom(), 100);
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

  const currentLanguage = languageOptions.find(opt => opt.value === language) || languageOptions[0];

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Desktop only */}
        <div className="hidden lg:block w-80 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-r border-gray-200/50 dark:border-gray-700/50">
          <ChatSessionSidebar 
            onSessionSelect={handleSessionSelect}
            language={language}
          />
        </div>
        
        {/* Chat Interface */}
        <div className="flex-1 flex flex-col min-w-0">
          <Card className="flex-1 flex flex-col m-0 border-0 rounded-none bg-transparent shadow-none">
            <CardHeader className="pb-3 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 min-w-0">
                  <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="lg:hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm flex-shrink-0">
                        <Menu className="h-4 w-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80 p-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                      <div className="h-full">
                        <ChatSessionSidebar 
                          onSessionSelect={handleSessionSelect}
                          language={language}
                        />
                      </div>
                    </SheetContent>
                  </Sheet>
                  <div className="flex items-center min-w-0 space-x-2 flex-1">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 shadow-md flex-shrink-0">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="flex items-center min-w-0 text-sm sm:text-base text-gray-900 dark:text-white">
                      <span className="truncate">
                        {currentSession?.title || 'New Conversation'}
                      </span>
                      {currentSession?.isArchived && (
                        <Badge variant="outline" className="ml-1 sm:ml-2 flex-shrink-0 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800">
                          <Archive className="h-3 w-3 mr-1" />
                          Archived
                        </Badge>
                      )}
                      <Badge className="ml-1 sm:ml-2 flex-shrink-0 text-xs bg-green-500 hover:bg-green-600 text-white">Online</Badge>
                    </CardTitle>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                  <Sheet open={rightSidebarOpen} onOpenChange={setRightSidebarOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="lg:hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                        <AlertTriangle className="h-4 w-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-80 p-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                      <ScrollArea className="h-full p-4">
                        <div className="space-y-4">
                          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
                            <CardHeader className="pb-3 pt-5">
                              <CardTitle className="flex items-center text-red-600">
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Crisis Support
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                If you&apos;re in crisis, please reach out immediately:
                              </p>
                              {emergencyContacts.map((contact, index) => (
                                <div key={index} className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800/30">
                                  <h4 className="font-medium text-sm text-red-800 dark:text-red-200">
                                    {contact.name}
                                  </h4>
                                  <p className="font-mono text-sm text-red-700 dark:text-red-300">
                                    {contact.number}
                                  </p>
                                  <p className="text-xs text-red-600 dark:text-red-400">
                                    {contact.description}
                                  </p>
                                </div>
                              ))}
                            </CardContent>
                          </Card>

                          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
                            <CardHeader className="pb-3 pt-5">
                              <CardTitle className="flex items-center text-green-600">
                                <Lightbulb className="h-4 w-4 mr-2" />
                                Quick Tips
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800/30">
                                  <h4 className="font-medium text-sm text-green-800 dark:text-green-200 mb-1">
                                    Breathing Exercise
                                  </h4>
                                  <p className="text-xs text-green-700 dark:text-green-300">
                                    4-7-8 technique: Inhale 4, hold 7, exhale 8
                                  </p>
                                </div>
                                
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30">
                                  <h4 className="font-medium text-sm text-blue-800 dark:text-blue-200 mb-1">
                                    Grounding
                                  </h4>
                                  <p className="text-xs text-blue-700 dark:text-blue-300">
                                    Name 5 things you can see, 4 you can hear, 3 you can touch
                                  </p>
                                </div>
                                
                                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800/30">
                                  <h4 className="font-medium text-sm text-purple-800 dark:text-purple-200 mb-1">
                                    Affirmation
                                  </h4>
                                  <p className="text-xs text-purple-700 dark:text-purple-300">
                                    &quot;This feeling is temporary. I am stronger than I know.&quot;
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                            <CardHeader className="pb-3 pt-5">
                              <CardTitle className="flex items-center text-blue-600">
                                <Heart className="h-4 w-4 mr-2" />
                                Need More Support?
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                                Consider booking a session with our professional counselors.
                              </p>
                              <Button 
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" 
                                size="sm"
                                onClick={() => router.push('/booking')}
                              >
                                <Phone className="h-4 w-4 mr-2" />
                                Book Counselor
                              </Button>
                            </CardContent>
                          </Card>
                        </div>
                      </ScrollArea>
                    </SheetContent>
                  </Sheet>

                  {/* Language Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                        <Languages className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">{currentLanguage.label}</span>
                        <span className="sm:hidden">{currentLanguage.icon}</span>
                        <ChevronDown className="h-3 w-3 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                      {languageOptions.map((option) => (
                        <DropdownMenuItem
                          key={option.value}
                          onClick={() => setLanguage(option.value as 'en' | 'hi')}
                          className="flex items-center space-x-2"
                        >
                          <span>{option.icon}</span>
                          <span>{option.label}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" disabled={!currentSessionId} className="hidden sm:flex bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                        <Save className="h-4 w-4 mr-1" />
                        <span className="hidden md:inline">Save</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md mx-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                      <DialogHeader>
                        <DialogTitle className="text-gray-900 dark:text-white">Save Conversation</DialogTitle>
                        <DialogDescription className="text-gray-600 dark:text-gray-300">
                          Give your conversation a name to save it for later.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="title" className="text-right text-gray-700 dark:text-gray-300">
                            Title
                          </Label>
                          <Input
                            id="title"
                            value={saveTitle}
                            onChange={(e) => setSaveTitle(e.target.value)}
                            placeholder="Enter conversation title"
                            className="col-span-3 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setSaveDialogOpen(false)} className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                          Cancel
                        </Button>
                        <Button onClick={handleSaveSession} disabled={isSaving || !saveTitle.trim()} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                          {isSaving ? 'Saving...' : 'Save'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Conditional Archive/Unarchive Button */}
                  {currentSession && (
                    currentSession.isArchived ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnarchiveSession(currentSession.id)}
                        className="hidden sm:flex bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
                      >
                        <ArchiveRestore className="h-4 w-4 mr-1" />
                        <span className="hidden md:inline">Unarchive</span>
                      </Button>
                    ) : (
                      <Dialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            disabled={!currentSessionId}
                            className="hidden sm:flex bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
                          >
                            <Archive className="h-4 w-4 mr-1" />
                            <span className="hidden md:inline">Archive</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md mx-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                          <DialogHeader>
                            <DialogTitle className="text-gray-900 dark:text-white">Archive Conversation</DialogTitle>
                            <DialogDescription className="text-gray-600 dark:text-gray-300">
                              This conversation will be moved to your archive and won&apos;t appear in the main list.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="archive-title" className="text-right text-gray-700 dark:text-gray-300">
                                Title
                              </Label>
                              <Input
                                id="archive-title"
                                value={archiveTitle}
                                onChange={(e) => setArchiveTitle(e.target.value)}
                                placeholder="Conversation title"
                                className="col-span-3 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setArchiveDialogOpen(false)} className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                              Cancel
                            </Button>
                            <Button 
                              onClick={handleArchiveSession} 
                              disabled={isArchiving || !archiveTitle.trim()}
                              variant="outline"
                              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                            >
                              {isArchiving ? 'Archiving...' : 'Archive'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNewSession}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
                  >
                    <Plus className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">New</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
              <ScrollArea className="flex-1 px-4 sm:px-6 py-4" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                <div className="space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center py-8 sm:py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg mb-4">
                        <Bot className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Welcome to MannSahay Chat! 🌟
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                        I&apos;m here to listen and support you. How are you feeling today?
                      </p>
                      
                      <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
                        {suggestedMessages.slice(0, isClient ? (window.innerWidth < 640 ? 4 : suggestedMessages.length) : 4).map((msg, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => handleSuggestedMessage(msg)}
                            className="text-xs max-w-xs truncate bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
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
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        {message.role === 'user' ? (
                          <>
                            <AvatarImage src={session?.user?.image || ''} />
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </>
                        ) : (
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        )}
                      </Avatar>
                      
                      <div
                        className={`flex-1 min-w-0 max-w-[85%] sm:max-w-[75%] ${
                          message.role === 'user' ? 'text-right' : 'text-left'
                        }`}
                      >
                        <div
                          className={`inline-block p-3 rounded-lg break-words shadow-sm ${
                            message.role === 'user'
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          {message.role === 'assistant' ? (
                            <div className="prose prose-sm max-w-none break-words overflow-wrap-anywhere dark:prose-invert">
                              <ReactMarkdown>
                                {message.content}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            <p className="text-sm break-words">{message.content}</p>
                          )}
                        </div>
                        
                        {message.role === 'assistant' && (
                          <div className="mt-2 flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTextToSpeech(message.content)}
                              disabled={isGeneratingSpeech}
                              className="text-xs bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-300 dark:border-gray-600"
                            >
                              <Volume2 className="h-3 w-3 mr-1" />
                              {isGeneratingSpeech ? 'Generating...' : 'Listen'}
                            </Button>
                          </div>
                        )}
                        
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date().toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Audio Player for Generated Speech - Appears at bottom of chat */}
                  {(duration > 0) && (
                    <div className="w-full p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800/30 shadow-sm">
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={isPlaying ? pause : play}
                          className="bg-white dark:bg-gray-800 border-green-300 dark:border-green-700"
                        >
                          {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                        </Button>
                        <div className="flex-1">
                          <div className="text-xs text-green-800 dark:text-green-200 mb-1">
                            Audio Response
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-green-600 dark:text-green-300">{formatTime(currentTime)}</span>
                            <input
                              type="range"
                              min="0"
                              max={duration}
                              value={currentTime}
                              onChange={(e) => seek(parseFloat(e.target.value))}
                              className="flex-1 h-1 bg-green-200 dark:bg-green-800 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="text-xs text-green-600 dark:text-green-300">{formatTime(duration)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {isLoading && (
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="inline-block p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>
              
              <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                {/* Recorded Audio Section - Only for user recordings before sending */}
                {audioBlob && (
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800/30 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-blue-800 dark:text-blue-200">Recorded audio</span>
                      <audio src={audioUrl!} controls className="h-8 max-w-[200px] sm:max-w-[300px]" />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={handleAudioSubmit}
                        disabled={isTranscribing}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      >
                        {isTranscribing ? 'Transcribing...' : 'Send Audio'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearRecording}
                        className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
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
                      className="flex-1 min-h-[44px] max-h-32 resize-none bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500"
                      disabled={isLoading || isRecording}
                    />
                    
                    <Button
                      type="button"
                      variant={isRecording ? "destructive" : "outline"}
                      onClick={isRecording ? stopRecording : startRecording}
                      disabled={isLoading}
                      className="flex-shrink-0 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
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
                      className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right Sidebar - Desktop only */}
        <div className="hidden lg:block w-80 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-l border-gray-200/50 dark:border-gray-700/50">
          <div className="h-full p-4 space-y-4 overflow-y-auto">
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
              <CardHeader className="pb-3 pt-5">
                <CardTitle className="flex items-center text-red-600">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Crisis Support
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  If you&apos;re in crisis, please reach out immediately:
                </p>
                {emergencyContacts.map((contact, index) => (
                  <div key={index} className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800/30">
                    <h4 className="font-medium text-sm text-red-800 dark:text-red-200">
                      {contact.name}
                    </h4>
                    <p className="font-mono text-sm text-red-700 dark:text-red-300">
                      {contact.number}
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {contact.description}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
            
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
              <CardHeader className="pb-3 pt-5">
                <CardTitle className="flex items-center text-green-600">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Quick Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800/30">
                    <h4 className="font-medium text-sm text-green-800 dark:text-green-200 mb-1">
                      Breathing Exercise
                    </h4>
                    <p className="text-xs text-green-700 dark:text-green-300">
                      4-7-8 technique: Inhale 4, hold 7, exhale 8
                    </p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30">
                    <h4 className="font-medium text-sm text-blue-800 dark:text-blue-200 mb-1">
                      Grounding
                    </h4>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Name 5 things you can see, 4 you can hear, 3 you can touch
                    </p>
                  </div>
                  
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800/30">
                    <h4 className="font-medium text-sm text-purple-800 dark:text-purple-200 mb-1">
                      Affirmation
                    </h4>
                    <p className="text-xs text-purple-700 dark:text-purple-300">
                      &quot;This feeling is temporary. I am stronger than I know.&quot;
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
              <CardHeader className="pb-3 pt-5">
                <CardTitle className="flex items-center text-blue-600">
                  <Heart className="h-4 w-4 mr-2" />
                  Need More Support?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Consider booking a session with our professional counselors.
                </p>
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" 
                  size="sm"
                  onClick={() => router.push('/dashboard/booking')}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Book Counselor
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}