'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ResourceType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Upload, X, Plus, File, Loader2, ArrowLeft, ShieldX } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function UploadResourcePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    type: '' as ResourceType,
    language: 'en',
    author: '',
    tags: [] as string[],
    categories: [] as string[],
    isPublished: false,
    isFeatured: false,
  });
  const [newTag, setNewTag] = useState('');
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    const checkAdmin = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch(`/api/user/check-admin?email=${session.user.email}`);
          const data = await response.json();
          setIsAdmin(data.isAdmin);
          
          if (!data.isAdmin) {
            // Redirect back to resources page if not admin
            router.push('/dashboard/resources');
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
          router.push('/dashboard/resources');
        } finally {
          setCheckingAdmin(false);
        }
      } else {
        router.push('/dashboard/resources');
        setCheckingAdmin(false);
      }
    };

    checkAdmin();
  }, [session, router]);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी (Hindi)' },
    { code: 'ta', name: 'தமிழ் (Tamil)' },
    { code: 'bn', name: 'বাংলা (Bengali)' },
    { code: 'te', name: 'తెలుగు (Telugu)' },
    { code: 'mr', name: 'मराठी (Marathi)' },
    { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
    { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
    { code: 'ml', name: 'മലയാളം (Malayalam)' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)' },
  ];

  const resourceTypes = [
    { value: ResourceType.ARTICLE, label: 'Article' },
    { value: ResourceType.VIDEO, label: 'Video' },
    { value: ResourceType.AUDIO, label: 'Audio' },
    { value: ResourceType.MUSIC, label: 'Music' },
    { value: ResourceType.MEDITATION, label: 'Meditation' },
    { value: ResourceType.PDF, label: 'PDF' },
    { value: ResourceType.EXERCISE, label: 'Exercise' },
    { value: ResourceType.INFOGRAPHIC, label: 'Infographic' },
    { value: ResourceType.WORKSHEET, label: 'Worksheet' },
    { value: ResourceType.GUIDE, label: 'Guide' },
  ];

  const suggestedCategories = [
    'Anxiety',
    'Depression',
    'Stress Management',
    'Mindfulness',
    'Sleep',
    'Self-esteem',
    'Relationships',
    'Academic Pressure',
    'Career Guidance',
    'Family Issues',
    'Grief',
    'Trauma',
    'Addiction',
    'Eating Disorders',
    'Bipolar Disorder',
    'OCD',
    'PTSD',
    'ADHD',
    'Personal Growth',
    'Wellness',
    'Yoga',
    'Meditation',
    'Exercise',
    'Nutrition',
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const addCategory = () => {
    if (newCategory.trim() && !formData.categories.includes(newCategory.trim())) {
      setFormData((prev) => ({
        ...prev,
        categories: [...prev.categories, newCategory.trim()],
      }));
      setNewCategory('');
    }
  };

  const removeCategory = (categoryToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.filter((cat) => cat !== categoryToRemove),
    }));
  };

  const addSuggestedCategory = (category: string) => {
    if (!formData.categories.includes(category)) {
      setFormData((prev) => ({
        ...prev,
        categories: [...prev.categories, category],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Title is required');
      return;
    }

    setLoading(true);

    try {
      if (file) {
        // Upload file first
        const formDataWithFile = new FormData();
        formDataWithFile.append('file', file);
        formDataWithFile.append('metadata', JSON.stringify(formData));

        const response = await fetch('/api/resources/upload', {
          method: 'POST',
          body: formDataWithFile,
        });

        if (response.ok) {
          router.push('/dashboard/resources');
        } else {
          const error = await response.json();
          alert(error.error || 'Failed to upload resource');
        }
      } else {
        // Create resource without file
        const response = await fetch('/api/resources', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          router.push('/dashboard/resources');
        } else {
          const error = await response.json();
          alert(error.error || 'Failed to create resource');
        }
      }
    } catch (error) {
      console.error('Error uploading resource:', error);
      alert('An error occurred while uploading the resource');
    } finally {
      setLoading(false);
    }
  };

  if (checkingAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <ShieldX className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6">
              You don&apos;t have permission to access this page. Only administrators can upload resources.
            </p>
            <Link href="/dashboard/resources">
              <Button>Back to Resources</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/dashboard/resources">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Resources
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Upload Resource</h1>
          <p className="text-gray-600 mt-2">
            Share valuable mental health resources with the community
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={6}
                  placeholder="For articles, worksheets, and guides. Leave empty if uploading a file."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Resource Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => handleSelectChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select resource type" />
                    </SelectTrigger>
                    <SelectContent>
                      {resourceTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select value={formData.language} onValueChange={(value) => handleSelectChange('language', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((language) => (
                        <SelectItem key={language.code} value={language.code}>
                          {language.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  placeholder="Resource author or creator"
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>File Upload</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  {file ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center">
                        <File className="h-12 w-12 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setFile(null)}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Remove File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center">
                        <Upload className="h-12 w-12 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium">Upload a file</p>
                        <p className="text-sm text-gray-500">
                          PDF, MP4, MP3, or other supported formats
                        </p>
                      </div>
                      <Label htmlFor="file-upload" className="cursor-pointer">
                        <div className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                          Select File
                        </div>
                        <Input
                          id="file-upload"
                          type="file"
                          className="hidden"
                          onChange={handleFileChange}
                          accept=".pdf,.mp4,.mp3,.wav,.jpg,.jpeg,.png"
                        />
                      </Label>
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-gray-500">
                  Note: For articles, worksheets, and guides, you can either upload a file or enter content directly in the Content field above.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Tags & Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Tags</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button type="button" onClick={addTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer">
                      {tag}
                      <X
                        className="h-3 w-3 ml-1"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <Label>Categories</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Add a category"
                    onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                  />
                  <Button type="button" onClick={addCategory}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.categories.map((category) => (
                    <Badge key={category} variant="secondary" className="cursor-pointer">
                      {category}
                      <X
                        className="h-3 w-3 ml-1"
                        onClick={() => removeCategory(category)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <Label>Suggested Categories</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {suggestedCategories.map((category) => (
                    <Badge
                      key={category}
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => addSuggestedCategory(category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Publishing Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="published">Publish Immediately</Label>
                  <p className="text-sm text-gray-500">
                    Make this resource visible to all users
                  </p>
                </div>
                <Switch
                  id="published"
                  checked={formData.isPublished}
                  onCheckedChange={(checked) => handleSwitchChange('isPublished', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="featured">Featured Resource</Label>
                  <p className="text-sm text-gray-500">
                    Show on homepage and in recommendations
                  </p>
                </div>
                <Switch
                  id="featured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => handleSwitchChange('isFeatured', checked)}
                />
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end gap-4">
            <Link href="/dashboard/resources">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload Resource'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}