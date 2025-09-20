// E:\mannsahay\src\components\resources\resource-filters.tsx
'use client';

import { useState, useEffect } from 'react';
import { ResourceType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Search } from 'lucide-react';

interface ResourceFiltersProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedType: ResourceType | 'all';
  setSelectedType: (type: ResourceType | 'all') => void;
  selectedLanguage: string;
  setSelectedLanguage: (language: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  sortOrder: string;
  setSortOrder: (order: string) => void;
}

export default function ResourceFilters({
  selectedCategory,
  setSelectedCategory,
  selectedType,
  setSelectedType,
  selectedLanguage,
  setSelectedLanguage,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
}: ResourceFiltersProps) {
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/resources/categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const languages = [
    { code: 'all', name: 'All Languages' },
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

  const sortOptions = [
    { value: 'createdAt', label: 'Date Added' },
    { value: 'title', label: 'Title' },
    { value: 'viewCount', label: 'Most Viewed' },
    { value: 'downloadCount', label: 'Most Downloaded' },
    { value: 'averageRating', label: 'Highest Rated' },
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
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

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedType('all');
    setSelectedLanguage('all');
    setSearchQuery('');
    setSortBy('createdAt');
    setSortOrder('desc');
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedType !== 'all' ||
    selectedLanguage !== 'all' ||
    searchQuery !== '';

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-full sm:w-[120px]">
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-4">
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Resource Type" />
          </SelectTrigger>
          <SelectContent>
            {typeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            {languages.map((language) => (
              <SelectItem key={language.code} value={language.code}>
                {language.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {hasActiveFilters && (
          <Button variant="outline" onClick={clearFilters}>
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        <span className="text-sm font-medium text-gray-700">Categories:</span>
        <Badge
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setSelectedCategory('all')}
        >
          All ({categories.reduce((sum, cat) => sum + cat.count, 0)})
        </Badge>
        {loading ? (
          <Badge variant="outline">Loading...</Badge>
        ) : (
          categories.map((category) => (
            <Badge
              key={category.name}
              variant={selectedCategory === category.name ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(category.name)}
            >
              {category.name} ({category.count})
            </Badge>
          ))
        )}
      </div>
    </div>
  );
}