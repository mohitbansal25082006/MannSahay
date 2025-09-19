'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Save, 
  Plus, 
  X,
  Settings,
  Heart,
  BookOpen,
  Users,
  Globe
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import LanguageSelector from '@/components/ui/language-selector';

const interestOptions = [
  'Academic Stress', 'Relationships', 'Mental Health', 'Lifestyle', 
  'Career Guidance', 'Study Tips', 'Time Management', 'Self-Care',
  'Anxiety', 'Depression', 'Loneliness', 'Family Issues'
];

export default function UserPreferences() {
  const { data: session } = useSession();
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [interests, setInterests] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchUserPreferences();
  }, [session?.user?.id]);

  const fetchUserPreferences = async () => {
    if (!session?.user?.id) return;
    
    try {
      const response = await fetch(`/api/user/preferences?userId=${session.user.id}`);
      if (response.ok) {
        const data = await response.json();
        setPreferredLanguage(data.preferredLanguage || 'en');
        setInterests(data.interests || []);
      }
    } catch (error) {
      console.error('Error fetching user preferences:', error);
    }
  };

  const savePreferences = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferredLanguage,
          interests
        }),
      });
      
      if (response.ok) {
        toast.success('Preferences saved successfully');
      } else {
        toast.error('Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const addInterest = (interest: string) => {
    if (interest && !interests.includes(interest)) {
      setInterests([...interests, interest]);
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  const handleAddCustomInterest = () => {
    if (customInterest.trim()) {
      addInterest(customInterest.trim());
      setCustomInterest('');
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Your Preferences
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <Label className="flex items-center mb-2">
              <Globe className="h-4 w-4 mr-2" />
              Preferred Language
            </Label>
            <LanguageSelector 
              value={preferredLanguage} 
              onValueChange={setPreferredLanguage} 
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Content will be translated to this language when available
            </p>
          </div>

          <div>
            <Label className="flex items-center mb-2">
              <Heart className="h-4 w-4 mr-2" />
              Your Interests
            </Label>
            <p className="text-sm text-gray-600 mb-3">
              Select topics you're interested in to get personalized recommendations
            </p>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {interestOptions.map((interest) => (
                <Badge
                  key={interest}
                  variant={interests.includes(interest) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    if (interests.includes(interest)) {
                      removeInterest(interest);
                    } else {
                      addInterest(interest);
                    }
                  }}
                >
                  {interest}
                </Badge>
              ))}
            </div>
            
            <div className="flex items-center space-x-2">
              <Input
                value={customInterest}
                onChange={(e) => setCustomInterest(e.target.value)}
                placeholder="Add a custom interest"
                className="flex-1"
              />
              <Button 
                type="button" 
                size="sm"
                onClick={handleAddCustomInterest}
                disabled={!customInterest.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {interests.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Your Selected Interests:</p>
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest) => (
                    <Badge key={interest} variant="secondary" className="flex items-center">
                      {interest}
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer" 
                        onClick={() => removeInterest(interest)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-100">
            <Button 
              onClick={savePreferences} 
              disabled={isLoading}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}