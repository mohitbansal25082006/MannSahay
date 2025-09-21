// E:\mannsahay\src\components\ui\high-contrast-toggle.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Accessibility, Sun, Moon } from 'lucide-react';

interface HighContrastToggleProps {
  className?: string;
}

export default function HighContrastToggle({ className }: HighContrastToggleProps) {
  const [highContrastMode, setHighContrastMode] = useState(false);

  useEffect(() => {
    // Check if high contrast mode is saved in localStorage
    const savedMode = localStorage.getItem('highContrastMode');
    if (savedMode) {
      setHighContrastMode(savedMode === 'true');
    }
  }, []);

  useEffect(() => {
    // Apply high contrast mode to the document
    if (highContrastMode) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    
    // Save preference to localStorage
    localStorage.setItem('highContrastMode', highContrastMode.toString());
  }, [highContrastMode]);

  const toggleHighContrast = () => {
    setHighContrastMode(!highContrastMode);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleHighContrast}
      className={className}
      title={highContrastMode ? 'Disable High Contrast' : 'Enable High Contrast'}
    >
      {highContrastMode ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
      <span className="sr-only">
        {highContrastMode ? 'Disable High Contrast' : 'Enable High Contrast'}
      </span>
    </Button>
  );
}