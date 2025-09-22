'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Send, 
  Eye, 
  EyeOff, 
  AlertTriangle,
  Plus,
  Lightbulb,
  SpellCheck,
  Languages,
  Globe,
  Loader2
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { ModerationNotification } from '@/components/moderation/moderation-notification';

const categories = [
  { value: 'general', label: 'General' },
  { value: 'academic', label: 'Academic Stress' },
  { value: 'relationships', label: 'Relationships' },
  { value: 'mental-health', label: 'Mental Health' },
  { value: 'lifestyle', label: 'Lifestyle' },
];

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

interface CreatePostFormProps {
  onPostCreated?: () => void;
}

interface Suggestions {
  grammar?: string[];
  clarity?: string[];
  tone?: string[];
  suggestedText?: string;
}

interface ToneAnalysis {
  overallTone?: string;
  respectfulness?: string;
  emotions?: string[];
  suggestions?: string[];
}

export default function CreatePostForm({ onPostCreated }: CreatePostFormProps) {
  const { data: session, status } = useSession();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [category, setCategory] = useState('general');
  const [language, setLanguage] = useState('en');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null);
  const [toneAnalysis, setToneAnalysis] = useState<ToneAnalysis | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showToneAnalysis, setShowToneAnalysis] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isLoadingToneAnalysis, setIsLoadingToneAnalysis] = useState(false);
  const [translatedTitle, setTranslatedTitle] = useState('');
  const [translatedContent, setTranslatedContent] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [userLanguage, setUserLanguage] = useState('en');

  useEffect(() => {
    // Get user's preferred language
    if (session?.user?.id) {
      fetchUserLanguage();
    }
  }, [session?.user?.id]);

  const fetchUserLanguage = async () => {
    if (session?.user?.id) {
      try {
        const response = await fetch(`/api/user/preferences?userId=${session.user.id}`);
        if (response.ok) {
          const data = await response.json();
          setUserLanguage(data.preferredLanguage || 'en');
          // Set the language to user's preferred language if it's not English
          if (data.preferredLanguage && data.preferredLanguage !== 'en') {
            setLanguage(data.preferredLanguage);
          }
        }
      } catch (error) {
        console.error('Error fetching user language:', error);
      }
    }
  };

  const fetchSuggestions = async () => {
    if (!content.trim()) return;
    
    setIsLoadingSuggestions(true);
    try {
      const response = await fetch('/api/forum/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content, language })
      });
      
      if (response.ok) {
        const data: Suggestions = await response.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } else {
        toast.error('Failed to get writing suggestions');
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      toast.error('Failed to get writing suggestions');
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const fetchToneAnalysis = async () => {
    if (!content.trim()) return;
    
    setIsLoadingToneAnalysis(true);
    try {
      const response = await fetch('/api/forum/tone-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content, language })
      });
      
      if (response.ok) {
        const data: ToneAnalysis = await response.json();
        setToneAnalysis(data);
        setShowToneAnalysis(true);
      } else {
        toast.error('Failed to analyze tone');
      }
    } catch (error) {
      console.error('Error analyzing tone:', error);
      toast.error('Failed to analyze tone');
    } finally {
      setIsLoadingToneAnalysis(false);
    }
  };

  const translateContent = async () => {
    if (language === 'en') {
      toast.info('Content is already in English');
      return;
    }

    setIsTranslating(true);
    try {
      // Translate both title and content
      const translationPromises = [];
      
      if (title) {
        translationPromises.push(
          fetch('/api/forum/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              text: title, 
              targetLanguage: 'en',
              sourceLanguage: language 
            }),
          }).then(res => res.ok ? res.json() : Promise.resolve(null))
        );
      }
      
      translationPromises.push(
        fetch('/api/forum/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            text: content, 
            targetLanguage: 'en',
            sourceLanguage: language 
          }),
        }).then(res => res.ok ? res.json() : Promise.resolve(null))
      );

      const results = await Promise.all(translationPromises);
      
      // Process results
      if (title && results[0]?.translation) {
        setTranslatedTitle(results[0].translation);
      }
      
      if (results[title ? 1 : 0]?.translation) {
        setTranslatedContent(results[title ? 1 : 0].translation);
      }
      
      toast.success('Content translated to English for preview');
    } catch (error) {
      console.error('Error translating content:', error);
      toast.error('Failed to translate content');
    } finally {
      setIsTranslating(false);
    }
  };

  const applySuggestion = () => {
    if (suggestions?.suggestedText) {
      setContent(suggestions.suggestedText);
      setShowSuggestions(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (status !== 'authenticated' || !session?.user?.id) {
      toast.error('You must be signed in to create a post');
      return;
    }
    
    if (!content.trim()) {
      toast.error('Content is required');
      return;
    }

    setIsSubmitting(true);
    
    try {
      let finalTitle = title;
      let finalContent = content;
      
      // If the selected language is not English, translate the content
      if (language !== 'en') {
        setIsTranslating(true);
        
        try {
          // Translate both title and content to the selected language
          const translationPromises = [];
          
          if (title) {
            translationPromises.push(
              fetch('/api/forum/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  text: title, 
                  targetLanguage: language,
                  sourceLanguage: 'en' 
                }),
              }).then(res => res.ok ? res.json() : Promise.resolve(null))
            );
          }
          
          translationPromises.push(
            fetch('/api/forum/translate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                text: content, 
                targetLanguage: language,
                sourceLanguage: 'en' 
              }),
            }).then(res => res.ok ? res.json() : Promise.resolve(null))
          );

          const results = await Promise.all(translationPromises);
          
          // Update final title and content with translations
          if (title && results[0]?.translation) {
            finalTitle = results[0].translation;
          }
          
          if (results[title ? 1 : 0]?.translation) {
            finalContent = results[title ? 1 : 0].translation;
          }
          
          toast.success(`Content translated to ${languages.find(l => l.code === language)?.name || language}`);
        } catch (error) {
          console.error('Error translating content:', error);
          toast.error('Failed to translate content. Posting in original language.');
        } finally {
          setIsTranslating(false);
        }
      }
      
      const response = await fetch('/api/forum/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: finalTitle,
          content: finalContent,
          isAnonymous,
          category,
          language,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error) {
          toast.error(data.error);
          if (data.debug) {
            console.error('Debug info:', data.debug);
          }
        } else {
          toast.error('Failed to create post. Please try again.');
        }
        return;
      }

      // Check if post was auto-removed
      if (data.wasRemoved) {
        // Show specific notification for removed post
        toast.error(
          <ModerationNotification 
            title="Your post has been removed"
            message="Your post violated our community policies and has been automatically removed."
            details={data.moderationNote || "Please review our community guidelines before posting again."}
          />,
          { duration: 10000 }
        );
      } else {
        // Regular success message
        toast.success('Post created successfully!');
      }
      
      // Reset form
      setTitle('');
      setContent('');
      setIsAnonymous(true);
      setCategory('general');
      setLanguage(userLanguage === 'en' ? 'en' : userLanguage);
      setTranslatedTitle('');
      setTranslatedContent('');
      setSuggestions(null);
      setToneAnalysis(null);
      setShowSuggestions(false);
      setShowToneAnalysis(false);
      
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user is not authenticated, show a sign-in prompt
  if (status !== 'authenticated') {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6 text-center">
          <div className="py-4">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Sign In Required
            </h3>
            <p className="text-gray-500 mb-4">
              You need to be signed in to create posts in the forum.
            </p>
            <Button onClick={() => window.location.href = '/api/auth/signin'}>
              Sign In
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          Create New Post
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title (Optional)</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your post a title..."
                className="mt-1"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <Label htmlFor="content">Content *</Label>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={fetchSuggestions}
                    disabled={isLoadingSuggestions || !content.trim()}
                    className="text-xs"
                  >
                    <SpellCheck className="h-3 w-3 mr-1" />
                    {isLoadingSuggestions ? 'Checking...' : 'Check Writing'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={fetchToneAnalysis}
                    disabled={isLoadingToneAnalysis || !content.trim()}
                    className="text-xs"
                  >
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {isLoadingToneAnalysis ? 'Analyzing...' : 'Analyze Tone'}
                  </Button>
                </div>
              </div>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts, feelings, or questions..."
                className="mt-1 min-h-[120px]"
                required
              />
            </div>
            
            {/* Writing Suggestions */}
            {showSuggestions && suggestions && (
              <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-blue-800 flex items-center">
                    <Lightbulb className="h-4 w-4 mr-1" />
                    Writing Suggestions
                  </h4>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowSuggestions(false)}
                    className="h-6 w-6 p-0"
                  >
                    ×
                  </Button>
                </div>
                
                {suggestions.grammar && suggestions.grammar.length > 0 && (
                  <div className="mb-2">
                    <p className="text-sm font-medium text-blue-700">Grammar:</p>
                    <ul className="text-xs text-blue-600 list-disc pl-5">
                      {suggestions.grammar.map((item: string, index: number) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {suggestions.clarity && suggestions.clarity.length > 0 && (
                  <div className="mb-2">
                    <p className="text-sm font-medium text-blue-700">Clarity:</p>
                    <ul className="text-xs text-blue-600 list-disc pl-5">
                      {suggestions.clarity.map((item: string, index: number) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {suggestions.tone && suggestions.tone.length > 0 && (
                  <div className="mb-2">
                    <p className="text-sm font-medium text-blue-700">Tone:</p>
                    <ul className="text-xs text-blue-600 list-disc pl-5">
                      {suggestions.tone.map((item: string, index: number) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {suggestions.suggestedText && (
                  <div className="mt-2 p-2 bg-white rounded border border-blue-200">
                    <p className="text-xs font-medium text-blue-700 mb-1">Suggested Text:</p>
                    <p className="text-xs text-blue-800">{suggestions.suggestedText}</p>
                    <Button 
                      size="sm" 
                      onClick={applySuggestion}
                      className="mt-2 text-xs"
                    >
                      Apply Suggestion
                    </Button>
                  </div>
                )}
              </div>
            )}
            
            {/* Tone Analysis */}
            {showToneAnalysis && toneAnalysis && (
              <div className="p-3 bg-purple-50 rounded-md border border-purple-200">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-purple-800 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Tone Analysis
                  </h4>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowToneAnalysis(false)}
                    className="h-6 w-6 p-0"
                  >
                    ×
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm font-medium text-purple-700">Overall Tone:</p>
                    <p className="text-xs text-purple-800">{toneAnalysis.overallTone}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-purple-700">Respectfulness:</p>
                    <p className="text-xs text-purple-800">{toneAnalysis.respectfulness}</p>
                  </div>
                </div>
                
                {toneAnalysis.emotions && toneAnalysis.emotions.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-purple-700">Detected Emotions:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {toneAnalysis.emotions.map((emotion: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs border-purple-300 text-purple-700">
                          {emotion}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {toneAnalysis.suggestions && toneAnalysis.suggestions.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-purple-700">Suggestions:</p>
                    <ul className="text-xs text-purple-600 list-disc pl-5">
                      {toneAnalysis.suggestions.map((item: string, index: number) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="language">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2 pt-5 md:col-span-2">
                <Switch
                  id="anonymous"
                  checked={isAnonymous}
                  onCheckedChange={setIsAnonymous}
                />
                <Label htmlFor="anonymous" className="flex items-center">
                  {isAnonymous ? (
                    <EyeOff className="h-4 w-4 mr-1" />
                  ) : (
                    <Eye className="h-4 w-4 mr-1" />
                  )}
                  {isAnonymous ? 'Post Anonymously' : 'Show My Name'}
                </Label>
              </div>
            </div>
            
            {/* Translation Preview */}
            {language !== 'en' && (translatedTitle || translatedContent) && (
              <div className="p-3 bg-green-50 rounded-md border border-green-200">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-green-800 flex items-center">
                    <Languages className="h-4 w-4 mr-1" />
                    {languages.find(l => l.code === language)?.name || language} Translation Preview
                  </h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={translateContent}
                    disabled={isTranslating}
                    className="text-xs"
                  >
                    {isTranslating ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Translating...
                      </>
                    ) : (
                      <>
                        <Languages className="h-3 w-3 mr-1" />
                        Refresh Translation
                      </>
                    )}
                  </Button>
                </div>
                
                {translatedTitle && (
                  <div className="mb-2">
                    <p className="text-sm font-medium text-green-700">Title:</p>
                    <p className="text-sm text-green-800">{translatedTitle}</p>
                  </div>
                )}
                
                {translatedContent && (
                  <div>
                    <p className="text-sm font-medium text-green-700">Content:</p>
                    <p className="text-sm text-green-800 whitespace-pre-line">{translatedContent}</p>
                  </div>
                )}
                
                <p className="text-xs text-green-600 mt-2">
                  This is how your post will appear after translation. The original English text will be preserved.
                </p>
              </div>
            )}
            
            {/* Translation Info */}
            {language !== 'en' && (
              <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                <div className="flex items-center mb-2">
                  <Globe className="h-4 w-4 text-blue-600 mr-2" />
                  <h4 className="font-medium text-blue-800">Translation Information</h4>
                </div>
                <p className="text-sm text-blue-700 mb-2">
                  When you create this post, your English content will be automatically translated to {languages.find(l => l.code === language)?.name || language}.
                </p>
                <div className="flex items-center text-xs text-blue-600">
                  <Languages className="h-3 w-3 mr-1" />
                  The translation will be displayed to users who prefer {languages.find(l => l.code === language)?.name || language}, while the original English will be preserved.
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center text-sm text-gray-500">
                <AlertTriangle className="h-4 w-4 mr-1" />
                All posts are moderated for safety
              </div>
              
              <Button type="submit" disabled={isSubmitting || !content.trim()}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Post
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}