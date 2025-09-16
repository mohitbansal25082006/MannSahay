'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  MessageCircle, 
  MoreVertical, 
  Edit, 
  Archive, 
  ArchiveRestore,
  Trash2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  FolderOpen,
  Inbox
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useChatSessions, ChatSession } from '@/hooks/useChatSessions';
import { formatDistanceToNow } from 'date-fns';

interface ChatSessionSidebarProps {
  onSessionSelect?: (session: ChatSession) => void;
  language: 'en' | 'hi';
}

export const ChatSessionSidebar: React.FC<ChatSessionSidebarProps> = ({
  onSessionSelect,
  language
}) => {
  const {
    sessions,
    archivedSessions,
    currentSession,
    isLoading,
    error,
    createSession,
    loadSession,
    updateSession,
    deleteSession,
    archiveSession,
    unarchiveSession,
    loadArchivedSessions,
    clearError
  } = useChatSessions();

  const [searchQuery, setSearchQuery] = useState('');
  const [editingSession, setEditingSession] = useState<ChatSession | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [filterRisk, setFilterRisk] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE'>('ALL');
  const [showArchived, setShowArchived] = useState(false);

  // Filter sessions based on search, risk level, and archived status
  const filteredSessions = (showArchived ? archivedSessions : sessions).filter(session => {
    const sessionTitle = session.title || '';
    const firstChatContent = session.chats?.[0]?.content || '';
    
    const matchesSearch = searchQuery === '' || 
      sessionTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      firstChatContent.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRisk = filterRisk === 'ALL' || session.riskLevel === filterRisk;
    
    return matchesSearch && matchesRisk;
  });

  const handleNewSession = async () => {
    const newSession = await createSession(
      language === 'hi' ? 'नई बातचीत' : 'New Conversation',
      language
    );
    if (newSession && onSessionSelect) {
      onSessionSelect(newSession);
    }
  };

  const handleSessionClick = async (session: ChatSession) => {
    const loadedSession = await loadSession(session.id);
    if (loadedSession && onSessionSelect) {
      onSessionSelect(loadedSession);
    }
  };

  const handleRenameSession = async (sessionId: string) => {
    if (newTitle.trim()) {
      await updateSession(sessionId, { title: newTitle.trim() });
      setEditingSession(null);
      setNewTitle('');
    }
  };

  const handleArchiveSession = async (sessionId: string) => {
    await archiveSession(sessionId);
  };

  const handleUnarchiveSession = async (sessionId: string) => {
    await unarchiveSession(sessionId);
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (window.confirm(language === 'hi' 
      ? 'क्या आप वाकई इस बातचीत को हटाना चाहते हैं?' 
      : 'Are you sure you want to delete this conversation?'
    )) {
      await deleteSession(sessionId);
    }
  };

  const toggleArchivedView = () => {
    setShowArchived(!showArchived);
    if (!showArchived && archivedSessions.length === 0) {
      loadArchivedSessions();
    }
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'HIGH': return 'destructive';
      case 'MEDIUM': return 'secondary';
      case 'LOW': return 'outline';
      default: return 'outline';
    }
  };

  const formatLastMessage = (session: ChatSession) => {
    if (!session.chats || session.chats.length === 0) return '';
    const message = session.chats[0].content || '';
    return message.length > 50 ? message.substring(0, 47) + '...' : message;
  };

  const getChatCount = (session: ChatSession) => {
    return session._count?.chats || (session.chats?.length || 0);
  };

  const getLastMessageTime = (session: ChatSession) => {
    return session.lastMessageAt || session.createdAt || new Date();
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            {showArchived ? (
              <>
                <FolderOpen className="h-5 w-5 mr-2 text-orange-600" />
                {language === 'hi' ? 'संग्रहीत बातचीत' : 'Archived'}
              </>
            ) : (
              <>
                <Inbox className="h-5 w-5 mr-2 text-blue-600" />
                {language === 'hi' ? 'बातचीत' : 'Conversations'}
              </>
            )}
            <Badge variant="secondary" className="ml-2">
              {showArchived ? archivedSessions.length : sessions.length}
            </Badge>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button 
              variant={showArchived ? "default" : "outline"}
              size="sm"
              onClick={toggleArchivedView}
            >
              {showArchived ? (
                <>
                  <Inbox className="h-4 w-4 mr-1" />
                  Active
                </>
              ) : (
                <>
                  <FolderOpen className="h-4 w-4 mr-1" />
                  Archive
                </>
              )}
            </Button>
            <Button 
              size="sm" 
              onClick={handleNewSession}
              disabled={isLoading}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={language === 'hi' ? 'खोजें...' : 'Search...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>

          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-3 w-3 mr-1" />
                  {filterRisk === 'ALL' 
                    ? (language === 'hi' ? 'सभी' : 'All')
                    : filterRisk
                  }
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterRisk('ALL')}>
                  {language === 'hi' ? 'सभी रिस्क लेवल' : 'All Risk Levels'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilterRisk('HIGH')}>
                  <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                  High Risk
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterRisk('MEDIUM')}>
                  Medium Risk
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterRisk('LOW')}>
                  Low Risk
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterRisk('NONE')}>
                  No Risk
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full px-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={clearError}
              >
                {language === 'hi' ? 'बंद करें' : 'Dismiss'}
              </Button>
            </div>
          )}

          {filteredSessions.length === 0 && !isLoading ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-sm text-gray-500">
                {showArchived 
                  ? (language === 'hi' ? 'कोई संग्रहीत बातचीत नहीं मिली' : 'No archived conversations')
                  : (language === 'hi' ? 'कोई बातचीत नहीं मिली' : 'No conversations found')
                }
              </p>
            </div>
          ) : (
            <div className="space-y-2 pb-4">
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  className={`group p-3 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50 ${
                    currentSession?.id === session.id ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
                  }`}
                  onClick={() => handleSessionClick(session)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-medium truncate">
                          {session.title || (language === 'hi' ? 'बिना शीर्षक' : 'Untitled')}
                        </h4>
                        {session.riskLevel && session.riskLevel !== 'NONE' && (
                          <Badge variant={getRiskBadgeColor(session.riskLevel)} className="text-xs">
                            {session.riskLevel}
                          </Badge>
                        )}
                        {session.isArchived && (
                          <Badge variant="outline" className="text-xs">
                            <Archive className="h-3 w-3 mr-1" />
                            {language === 'hi' ? 'संग्रहीत' : 'Archived'}
                          </Badge>
                        )}
                      </div>
                      
                      {session.chats && session.chats.length > 0 && (
                        <p className="text-xs text-gray-500 truncate mb-2">
                          {formatLastMessage(session)}
                        </p>
                      )}

                      <div className="flex items-center space-x-3 text-xs text-gray-400">
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="h-3 w-3" />
                          <span>{getChatCount(session)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {formatDistanceToNow(new Date(getLastMessageTime(session)), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Session Actions Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingSession(session);
                            setNewTitle(session.title || '');
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          {language === 'hi' ? 'नाम बदलें' : 'Rename'}
                        </DropdownMenuItem>
                        
                        {session.isArchived ? (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnarchiveSession(session.id);
                            }}
                          >
                            <ArchiveRestore className="h-4 w-4 mr-2" />
                            {language === 'hi' ? 'अनसंग्रहीत करें' : 'Unarchive'}
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleArchiveSession(session.id);
                            }}
                          >
                            <Archive className="h-4 w-4 mr-2" />
                            {language === 'hi' ? 'संग्रहीत करें' : 'Archive'}
                          </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSession(session.id);
                          }}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {language === 'hi' ? 'हटाएं' : 'Delete'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Rename Dialog */}
      <Dialog 
        open={!!editingSession} 
        onOpenChange={(open) => {
          if (!open) {
            setEditingSession(null);
            setNewTitle('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === 'hi' ? 'बातचीत का नाम बदलें' : 'Rename Conversation'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder={language === 'hi' ? 'नया नाम दर्ज करें' : 'Enter new name'}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && editingSession) {
                  handleRenameSession(editingSession.id);
                }
              }}
            />
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setEditingSession(null);
                  setNewTitle('');
                }}
              >
                {language === 'hi' ? 'रद्द करें' : 'Cancel'}
              </Button>
              <Button 
                onClick={() => editingSession && handleRenameSession(editingSession.id)}
                disabled={!newTitle.trim()}
              >
                {language === 'hi' ? 'सहेजें' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};