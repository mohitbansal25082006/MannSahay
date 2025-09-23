'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, MessageSquare, Calendar, Star, FileText, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Client {
  id: string;
  name: string;
  email?: string;
  lastSession?: string;
  sessionCount: number;
  avgRating?: number;
  notes?: string;
}

interface SessionNote {
  id: string;
  content: string;
  createdAt: string;
  isPrivate: boolean;
}

export default function ClientList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [sessionNotes, setSessionNotes] = useState<SessionNote[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      fetchSessionNotes(selectedClient.id);
    }
  }, [selectedClient]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      // This would be an actual API call in a real implementation
      // const response = await fetch('/api/counselor/clients');
      // const data = await response.json();
      
      // Mock data for demonstration
      const mockClients: Client[] = [
        {
          id: '1',
          name: 'Alex Johnson',
          email: 'alex@example.com',
          lastSession: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          sessionCount: 3,
          avgRating: 4.5,
          notes: 'Making good progress with anxiety management'
        },
        {
          id: '2',
          name: 'Sam Smith',
          email: 'sam@example.com',
          lastSession: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
          sessionCount: 2,
          avgRating: 4.0
        },
        {
          id: '3',
          name: 'Taylor Brown',
          email: 'taylor@example.com',
          lastSession: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          sessionCount: 5,
          avgRating: 5.0,
          notes: 'Responding well to CBT techniques'
        }
      ];
      
      setClients(mockClients);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionNotes = async (clientId: string) => {
    try {
      // This would be an actual API call in a real implementation
      // const response = await fetch(`/api/counselor/clients/${clientId}/notes`);
      // const data = await response.json();
      
      // Mock data for demonstration
      const mockSessionNotes: SessionNote[] = [
        {
          id: '1',
          content: 'Client showed significant improvement in managing stress. Recommended mindfulness exercises.',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          isPrivate: false
        },
        {
          id: '2',
          content: 'Client reported increased anxiety related to upcoming exams. Discussed breathing techniques.',
          createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
          isPrivate: true
        }
      ];
      
      setSessionNotes(mockSessionNotes);
    } catch (error) {
      console.error('Error fetching session notes:', error);
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 pb-4">
            <CardTitle className="text-lg md:text-xl font-bold text-gray-900">My Clients</CardTitle>
            <CardDescription className="text-gray-600">
              View and manage your client list
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 md:p-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search clients..."
                className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Loading clients...</span>
                </div>
              ) : filteredClients.length > 0 ? (
                filteredClients.map(client => (
                  <div
                    key={client.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all duration-300 ${
                      selectedClient?.id === client.id 
                        ? 'border-blue-500 bg-blue-50 shadow-sm' 
                        : 'border-gray-200 hover:bg-gray-50 hover:shadow-sm'
                    }`}
                    onClick={() => setSelectedClient(client)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={`/api/placeholder/avatar/${client.id}`} alt={client.name} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                          {client.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{client.name}</p>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{client.sessionCount} sessions</span>
                          {client.avgRating && (
                            <>
                              <Star className="h-3 w-3 ml-2 mr-1 text-yellow-400 fill-current" />
                              <span>{client.avgRating.toFixed(1)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Search className="h-8 w-8 text-gray-500" />
                  </div>
                  <p className="text-gray-700 font-medium mb-1">No clients found</p>
                  <p className="text-gray-500 text-sm">Try adjusting your search</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="lg:col-span-2">
        {selectedClient ? (
          <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center text-lg md:text-xl font-bold text-gray-900">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={`/api/placeholder/avatar/${selectedClient.id}`} alt={selectedClient.name} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                        {selectedClient.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {selectedClient.name}
                  </CardTitle>
                  <CardDescription className="text-gray-600 ml-13">
                    {selectedClient.email}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="border-gray-300">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Message
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Session
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <FileText className="h-4 w-4 mr-2" />
                      View Full History
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3 bg-white p-1 rounded-lg shadow-sm">
                  <TabsTrigger value="overview" className="text-sm font-medium data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 rounded-md transition-all">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="notes" className="text-sm font-medium data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 rounded-md transition-all">
                    Session Notes
                  </TabsTrigger>
                  <TabsTrigger value="progress" className="text-sm font-medium data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 rounded-md transition-all">
                    Progress
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 shadow-sm">
                      <CardContent className="pt-6">
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-2 rounded-lg mr-3">
                            <Calendar className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Total Sessions</p>
                            <p className="text-lg font-bold text-blue-700">{selectedClient.sessionCount}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-100 shadow-sm">
                      <CardContent className="pt-6">
                        <div className="flex items-center">
                          <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                            <Star className="h-5 w-5 text-yellow-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Average Rating</p>
                            <p className="text-lg font-bold text-yellow-700">
                              {selectedClient.avgRating ? selectedClient.avgRating.toFixed(1) : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {selectedClient.lastSession && (
                    <Card className="border border-gray-100 shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-medium text-gray-900">Last Session</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600">
                          {new Date(selectedClient.lastSession).toLocaleDateString()} at {new Date(selectedClient.lastSession).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                  
                  {selectedClient.notes && (
                    <Card className="border border-gray-100 shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-medium text-gray-900">Notes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">{selectedClient.notes}</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="notes" className="space-y-4">
                  <div className="space-y-4">
                    {sessionNotes.length > 0 ? (
                      sessionNotes.map(note => (
                        <Card key={note.id} className="border border-gray-100 shadow-sm">
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-2">
                              <div className="text-sm text-gray-500">
                                {new Date(note.createdAt).toLocaleDateString()}
                              </div>
                              {note.isPrivate && (
                                <Badge variant="outline" className="text-xs">Private</Badge>
                              )}
                            </div>
                            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{note.content}</p>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <Card className="border border-gray-100 shadow-sm">
                        <CardContent className="pt-6">
                          <div className="text-center py-4">
                            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                              <FileText className="h-8 w-8 text-gray-500" />
                            </div>
                            <p className="text-gray-700 font-medium mb-1">No session notes available</p>
                            <p className="text-gray-500 text-sm">Add notes after your sessions</p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="progress" className="space-y-4">
                  <Card className="border border-gray-100 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-medium text-gray-900">Progress Tracking</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Calendar className="h-8 w-8 text-gray-500" />
                        </div>
                        <p className="text-gray-700 font-medium mb-1">Progress tracking features</p>
                        <p className="text-gray-500 text-sm">Would be displayed here</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border-0 overflow-hidden">
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-500" />
                </div>
                <p className="text-gray-700 font-medium mb-1">Select a client to view details</p>
                <p className="text-gray-500 text-sm">Choose a client from the list to see their information</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}