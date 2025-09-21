// E:\mannsahay\src\components\resources\translation-toggle.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Languages, Loader2, Globe, Check, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TranslationToggleProps {
  resource: {
    id: string;
    title: string;
    description?: string;
    content?: string;
    summary?: string;
    language: string;
  };
  onTranslated: (translations: {
    title?: string;
    description?: string;
    content?: string;
    summary?: string;
  }) => void;
}

export default function TranslationToggle({ resource, onTranslated }: TranslationToggleProps) {
  const [isTranslating, setIsTranslating] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('hi');
  const [translationStatus, setTranslationStatus] = useState<'idle' | 'translating' | 'success' | 'error'>('idle');
  const [translatedFields, setTranslatedFields] = useState<{
    title?: string;
    description?: string;
    content?: string;
    summary?: string;
  }>({});

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ta', name: 'Tamil' },
    { code: 'bn', name: 'Bengali' },
    { code: 'te', name: 'Telugu' },
    { code: 'mr', name: 'Marathi' },
    { code: 'gu', name: 'Gujarati' },
    { code: 'kn', name: 'Kannada' },
    { code: 'ml', name: 'Malayalam' },
    { code: 'pa', name: 'Punjabi' },
  ];

  const handleTranslate = async () => {
    if (isTranslated) {
      setIsTranslated(false);
      return;
    }

    try {
      setIsTranslating(true);
      setTranslationStatus('translating');
      
      const response = await fetch('/api/resources/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: resource.title,
          description: resource.description || '',
          content: resource.content || '',
          summary: resource.summary || '',
          targetLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const data = await response.json();
      setTranslatedFields(data);
      setIsTranslated(true);
      setTranslationStatus('success');
      onTranslated(data);
    } catch (error) {
      console.error('Error translating text:', error);
      setTranslationStatus('error');
    } finally {
      setIsTranslating(false);
    }
  };

  const getStatusIcon = () => {
    switch (translationStatus) {
      case 'translating':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  return (
    <Card className="mb-4 border-blue-100 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Languages className="h-5 w-5 text-blue-600" />
          Advanced Translation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">
              Translate this resource to your preferred language
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                Original: {languages.find(l => l.code === resource.language)?.name}
              </span>
              <span className="text-gray-400">→</span>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger className="w-32 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages
                    .filter(l => l.code !== resource.language)
                    .map((language) => (
                      <SelectItem key={language.code} value={language.code}>
                        {language.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            onClick={handleTranslate}
            disabled={isTranslating}
            className="flex items-center gap-2"
          >
            {getStatusIcon()}
            {isTranslated ? 'Show Original' : 'Translate Now'}
          </Button>
        </div>
        
        {translationStatus === 'success' && (
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-800">
              Successfully translated to {languages.find(l => l.code === targetLanguage)?.name}
            </span>
          </div>
        )}
        
        {translationStatus === 'error' && (
          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-800">
              Translation failed. Please try again.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}