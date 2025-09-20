// E:\mannsahay\src\components\counselor\client-list.tsx
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
        <Card>
          <CardHeader>
            <CardTitle>My Clients</CardTitle>
            <CardDescription>
              View and manage your client list
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search clients..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {loading ? (
                <div className="text-center py-4">Loading clients...</div>
              ) : filteredClients.length > 0 ? (
                filteredClients.map(client => (
                  <div
                    key={client.id}
                    className={`p-3 border rounded-md cursor-pointer transition-colors ${
                      selectedClient?.id === client.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedClient(client)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={`/api/placeholder/avatar/${client.id}`} alt={client.name} />
                        <AvatarFallback>{client.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{client.name}</p>
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{client.sessionCount} sessions</span>
                          {client.avgRating && (
                            <>
                              <Star className="h-3 w-3 ml-2 mr-1 text-yellow-400" />
                              <span>{client.avgRating.toFixed(1)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No clients found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="lg:col-span-2">
        {selectedClient ? (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src={`/api/placeholder/avatar/${selectedClient.id}`} alt={selectedClient.name} />
                      <AvatarFallback>{selectedClient.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    {selectedClient.name}
                  </CardTitle>
                  <CardDescription>
                    {selectedClient.email}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
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
            <CardContent>
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="notes">Session Notes</TabsTrigger>
                  <TabsTrigger value="progress">Progress</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                          <div>
                            <p className="text-sm text-gray-500">Total Sessions</p>
                            <p className="text-lg font-medium">{selectedClient.sessionCount}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center">
                          <Star className="h-5 w-5 text-yellow-400 mr-2" />
                          <div>
                            <p className="text-sm text-gray-500">Average Rating</p>
                            <p className="text-lg font-medium">
                              {selectedClient.avgRating ? selectedClient.avgRating.toFixed(1) : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {selectedClient.lastSession && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Last Session</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600">
                          {new Date(selectedClient.lastSession).toLocaleDateString()} at {new Date(selectedClient.lastSession).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                  
                  {selectedClient.notes && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Notes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600">{selectedClient.notes}</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="notes" className="space-y-4">
                  <div className="space-y-4">
                    {sessionNotes.length > 0 ? (
                      sessionNotes.map(note => (
                        <Card key={note.id}>
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-2">
                              <div className="text-sm text-gray-500">
                                {new Date(note.createdAt).toLocaleDateString()}
                              </div>
                              {note.isPrivate && (
                                <Badge variant="outline">Private</Badge>
                              )}
                            </div>
                            <p className="text-gray-700">{note.content}</p>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-center text-gray-500">No session notes available</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="progress" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Progress Tracking</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-500">Progress tracking features would be displayed here.</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">Select a client to view details</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}