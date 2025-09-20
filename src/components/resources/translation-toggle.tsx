// E:\mannsahay\src\components\resources\translation-toggle.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Languages, Loader2 } from 'lucide-react';

interface TranslationToggleProps {
  originalText: string;
  targetLanguage: string;
  onTranslated: (translatedText: string) => void;
}

export default function TranslationToggle({
  originalText,
  targetLanguage,
  onTranslated,
}: TranslationToggleProps) {
  const [isTranslating, setIsTranslating] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);
  const [translatedText, setTranslatedText] = useState('');

  const getLanguageName = (code: string) => {
    const languages: Record<string, string> = {
      en: 'English',
      hi: 'Hindi',
      ta: 'Tamil',
      bn: 'Bengali',
      te: 'Telugu',
      mr: 'Marathi',
      gu: 'Gujarati',
      kn: 'Kannada',
      ml: 'Malayalam',
      pa: 'Punjabi',
    };
    return languages[code] || code;
  };

  const handleTranslate = async () => {
    if (isTranslated) {
      setIsTranslated(false);
      onTranslated(originalText);
      return;
    }

    try {
      setIsTranslating(true);
      const response = await fetch('/api/resources/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: originalText,
          targetLanguage,
        }),
      });

      const data = await response.json();
      setTranslatedText(data.translatedText);
      setIsTranslated(true);
      onTranslated(data.translatedText);
    } catch (error) {
      console.error('Error translating text:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleTranslate}
        disabled={isTranslating}
        className="h-8 px-2"
      >
        {isTranslating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Languages className="h-4 w-4" />
        )}
        <span className="ml-1 text-xs">
          {isTranslated ? 'Show Original' : `Translate to ${getLanguageName(targetLanguage)}`}
        </span>
      </Button>
      
      {isTranslated && (
        <Badge variant="secondary" className="text-xs">
          Translated
        </Badge>
      )}
    </div>
  );
}