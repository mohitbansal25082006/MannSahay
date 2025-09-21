// E:\mannsahay\src\components\booking\counselor-card.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Clock, Languages, Calendar, TrendingUp, Award } from 'lucide-react';

interface CounselorCardProps {
  id: string;
  name: string;
  specialties: string[];
  languages: string[];
  experience?: number;
  bio?: string;
  onSelect: (counselor: any) => void;
  isRecommended?: boolean;
  matchScore?: number;
  matchReason?: string;
}

export default function CounselorCard({
  id,
  name,
  specialties,
  languages,
  experience,
  bio,
  onSelect,
  isRecommended = false,
  matchScore = 0,
  matchReason = ''
}: CounselorCardProps) {
  const languageNames: Record<string, string> = {
    en: 'English',
    hi: 'Hindi',
    ta: 'Tamil',
    te: 'Telugu',
    bn: 'Bengali',
    mr: 'Marathi',
    gu: 'Gujarati',
    kn: 'Kannada',
    ml: 'Malayalam',
    pa: 'Punjabi'
  };

  return (
    <Card className={`h-full flex flex-col hover:shadow-md transition-shadow ${isRecommended ? 'border-blue-500 shadow-md' : ''}`}>
      {isRecommended && (
        <div className="bg-blue-500 text-white py-1 px-3 text-sm font-medium flex items-center">
          <Award className="h-4 w-4 mr-1" />
          AI Recommended - {Math.round(matchScore)}% Match
        </div>
      )}
      <CardHeader>
        <div className="flex items-start space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={`/api/avatar/${id}`} alt={name} />
            <AvatarFallback>{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-lg">{name}</CardTitle>
            <div className="flex items-center mt-1 text-sm text-gray-500">
              {experience && (
                <>
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{experience} years experience</span>
                </>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {isRecommended && matchReason && (
          <div className="mb-3 p-2 bg-blue-50 rounded-md text-sm text-blue-700">
            <TrendingUp className="h-4 w-4 inline mr-1" />
            {matchReason}
          </div>
        )}
        
        <CardDescription className="mb-4 flex-1">
          {bio}
        </CardDescription>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Specialties</h4>
            <div className="flex flex-wrap gap-1">
              {specialties.map((specialty) => (
                <Badge key={specialty} variant="secondary" className="text-xs">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Languages</h4>
            <div className="flex items-center text-sm text-gray-600">
              <Languages className="h-4 w-4 mr-1" />
              <span>{languages.map(lang => languageNames[lang] || lang).join(', ')}</span>
            </div>
          </div>
          
          <Button 
            onClick={() => onSelect({ id, name, specialties, languages, experience, bio })}
            className="w-full mt-2"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Book Session
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}