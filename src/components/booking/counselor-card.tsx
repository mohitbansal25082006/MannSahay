'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, Languages, Calendar, TrendingUp, Award, Mail, CheckCircle, XCircle } from 'lucide-react';
import { Counselor } from '@/types';

interface CounselorCardProps {
  id: string;
  name: string;
  email: string;
  specialties: string[];
  languages: string[];
  experience?: number | null;
  bio?: string | null;
  isActive: boolean;
  profileImage?: string | null;
  onSelect: (counselor: Counselor) => void;
  isRecommended?: boolean;
  matchScore?: number;
  matchReason?: string;
}

export default function CounselorCard({
  id,
  name,
  email,
  specialties,
  languages,
  experience,
  bio,
  isActive,
  profileImage,
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

  const handleSelect = () => {
    const counselor: Counselor = {
      id,
      name,
      email,
      bio,
      specialties,
      languages,
      isActive,
      profileImage,
      experience,
      education: null,
      approach: null,
      consultationFee: null,
      maxDailySessions: null,
      bufferTimeMinutes: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    onSelect(counselor);
  };

  return (
    <Card className={`h-full flex flex-col hover:shadow-md transition-shadow ${
      isRecommended ? 'border-blue-500 shadow-md' : ''
    } ${!isActive ? 'opacity-60' : ''}`}>
      {isRecommended && (
        <div className="bg-blue-500 text-white py-1 px-3 text-sm font-medium flex items-center">
          <Award className="h-4 w-4 mr-1" />
          AI Recommended - {Math.round(matchScore)}% Match
        </div>
      )}
      <CardHeader>
        <div className="flex items-start space-x-4">
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarImage src={profileImage || `/api/avatar/${id}`} alt={name} />
              <AvatarFallback>{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className={`absolute -bottom-1 -right-1 rounded-full p-1 ${
              isActive ? 'bg-green-500' : 'bg-gray-400'
            }`}>
              {isActive ? (
                <CheckCircle className="h-3 w-3 text-white" />
              ) : (
                <XCircle className="h-3 w-3 text-white" />
              )}
            </div>
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center">
              {name}
              {!isActive && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  Unavailable
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center mt-1 text-sm text-gray-500">
              <Mail className="h-3 w-3 mr-1" />
              <span className="truncate">{email}</span>
            </div>
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
          {bio || 'No bio available'}
        </CardDescription>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Specialties</h4>
            <div className="flex flex-wrap gap-1">
              {specialties.length > 0 ? (
                specialties.map((specialty) => (
                  <Badge key={specialty} variant="secondary" className="text-xs">
                    {specialty}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-gray-500">No specialties listed</span>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Languages</h4>
            <div className="flex items-center text-sm text-gray-600">
              <Languages className="h-4 w-4 mr-1" />
              <span>
                {languages.length > 0 
                  ? languages.map(lang => languageNames[lang] || lang).join(', ')
                  : 'No languages listed'
                }
              </span>
            </div>
          </div>
          
          <Button 
            onClick={handleSelect}
            className="w-full mt-2"
            disabled={!isActive}
          >
            <Calendar className="h-4 w-4 mr-2" />
            {isActive ? 'Book Session' : 'Unavailable'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}