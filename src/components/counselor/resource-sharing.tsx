'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileText, Video, Music, BookOpen, Plus, Search } from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  description?: string;
  type: 'ARTICLE' | 'VIDEO' | 'AUDIO' | 'PDF' | 'EXERCISE';
  language: string;
  tags: string[];
  isPublished: boolean;
  createdAt: string;
}

interface NewResource {
  title: string;
  description: string;
  type: 'ARTICLE' | 'VIDEO' | 'AUDIO' | 'PDF' | 'EXERCISE';
  language: string;
  tags: string;
  content: string;
}

export default function ResourceSharing() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newResource, setNewResource] = useState<NewResource>({
    title: '',
    description: '',
    type: 'ARTICLE',
    language: 'en',
    tags: '',
    content: ''
  });
  const [loading, setLoading] = useState(true);

  const resourceTypes = [
    { value: 'ARTICLE', label: 'Article', icon: FileText },
    { value: 'VIDEO', label: 'Video', icon: Video },
    { value: 'AUDIO', label: 'Audio', icon: Music },
    { value: 'PDF', label: 'PDF', icon: FileText },
    { value: 'EXERCISE', label: 'Exercise', icon: BookOpen }
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'hi', label: 'Hindi' },
    { value: 'ta', label: 'Tamil' },
    { value: 'te', label: 'Telugu' },
    { value: 'bn', label: 'Bengali' },
    { value: 'mr', label: 'Marathi' },
    { value: 'gu', label: 'Gujarati' },
    { value: 'kn', label: 'Kannada' },
    { value: 'ml', label: 'Malayalam' },
    { value: 'pa', label: 'Punjabi' }
  ];

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    filterResources();
  }, [resources, searchQuery, typeFilter, languageFilter]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      // This would be an actual API call in a real implementation
      // const response = await fetch('/api/resources');
      // const data = await response.json();
      
      // Mock data for demonstration
      const mockResources: Resource[] = [
        {
          id: '1',
          title: 'Managing Academic Stress',
          description: 'A comprehensive guide to managing stress related to academic pressures',
          type: 'ARTICLE',
          language: 'en',
          tags: ['stress', 'academic', 'students'],
          isPublished: true,
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          title: 'Breathing Exercises for Anxiety',
          description: 'Step-by-step guide to breathing techniques that help reduce anxiety',
          type: 'VIDEO',
          language: 'en',
          tags: ['anxiety', 'breathing', 'exercises'],
          isPublished: true,
          createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          title: 'Mindfulness Meditation',
          description: 'Introduction to mindfulness meditation for beginners',
          type: 'AUDIO',
          language: 'hi',
          tags: ['mindfulness', 'meditation', 'beginners'],
          isPublished: true,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      setResources(mockResources);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterResources = () => {
    let filtered = resources;
    
    if (searchQuery) {
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (resource.description && resource.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    if (typeFilter) {
      filtered = filtered.filter(resource => resource.type === typeFilter);
    }
    
    if (languageFilter) {
      filtered = filtered.filter(resource => resource.language === languageFilter);
    }
    
    setFilteredResources(filtered);
  };

  const handleAddResource = async () => {
    if (!newResource.title) return;
    
    try {
      // This would be an actual API call in a real implementation
      // await fetch('/api/resources', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     ...newResource,
      //     tags: newResource.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      //   })
      // });
      
      // Add to local state
      const resource: Resource = {
        id: Date.now().toString(),
        title: newResource.title,
        description: newResource.description,
        type: newResource.type,
        language: newResource.language,
        tags: newResource.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        isPublished: true,
        createdAt: new Date().toISOString()
      };
      
      setResources([resource, ...resources]);
      
      // Reset form
      setNewResource({
        title: '',
        description: '',
        type: 'ARTICLE',
        language: 'en',
        tags: '',
        content: ''
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding resource:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    const resourceType = resourceTypes.find(rt => rt.value === type);
    return resourceType ? resourceType.icon : FileText;
  };

  const getTypeName = (type: string) => {
    const resourceType = resourceTypes.find(rt => rt.value === type);
    return resourceType ? resourceType.label : type;
  };

  const getLanguageName = (code: string) => {
    const language = languages.find(lang => lang.value === code);
    return language ? language.label : code;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Resource Library</CardTitle>
              <CardDescription>
                Share educational resources with your clients
              </CardDescription>
            </div>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Resource
            </Button>
          </div>
        </CardHeader>
      </Card>
      
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Resource</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <Input
                value={newResource.title}
                onChange={(e) => setNewResource({...newResource, title: e.target.value})}
                placeholder="Resource title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <Textarea
                value={newResource.description}
                onChange={(e) => setNewResource({...newResource, description: e.target.value})}
                placeholder="Brief description of the resource"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <Select value={newResource.type} onValueChange={(value: 'ARTICLE' | 'VIDEO' | 'AUDIO' | 'PDF' | 'EXERCISE') => setNewResource({...newResource, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {resourceTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language
                </label>
                <Select value={newResource.language} onValueChange={(value) => setNewResource({...newResource, language: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map(lang => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (comma separated)
              </label>
              <Input
                value={newResource.tags}
                onChange={(e) => setNewResource({...newResource, tags: e.target.value})}
                placeholder="e.g., stress, anxiety, mindfulness"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <Textarea
                value={newResource.content}
                onChange={(e) => setNewResource({...newResource, content: e.target.value})}
                placeholder="Resource content or URL"
                rows={5}
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddResource}>
                Add Resource
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search resources..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  {resourceTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={languageFilter} onValueChange={setLanguageFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Languages</SelectItem>
                  {languages.map(lang => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-8">Loading resources...</div>
          ) : filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map(resource => {
                const Icon = getTypeIcon(resource.type);
                return (
                  <Card key={resource.id} className="h-full flex flex-col">
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <Icon className="h-5 w-5 mr-2" />
                        {resource.title}
                      </CardTitle>
                      <CardDescription>
                        {resource.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1 mb-2">
                          {resource.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="mr-3">{getTypeName(resource.type)}</span>
                          <span>{getLanguageName(resource.language)}</span>
                        </div>
                      </div>
                      
                      <div className="mt-auto pt-4 border-t border-gray-200">
                        <Button variant="outline" size="sm" className="w-full">
                          View Resource
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No resources found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}