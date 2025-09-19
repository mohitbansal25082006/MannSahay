'use client';

import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';
import { useState } from 'react';

interface TranslationToggleProps {
  onTranslate: () => void;
  isTranslated: boolean;
  isLoading?: boolean;
  className?: string;
}

export default function TranslationToggle({ 
  onTranslate, 
  isTranslated, 
  isLoading = false,
  className 
}: TranslationToggleProps) {
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={onTranslate}
      disabled={isLoading}
      className={`flex items-center space-x-1 ${className}`}
    >
      <Languages className="h-4 w-4" />
      <span>{isTranslated ? 'Show Original' : 'Translate'}</span>
      {isLoading && <span className="ml-1 animate-spin">⏳</span>}
    </Button>
  );
}