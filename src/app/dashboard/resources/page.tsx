'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ResourceType } from '@/types';
import ResourceList from '@/components/resources/resource-list';
import ResourceFilters from '@/components/resources/resource-filters';
import Recommendations from '@/components/resources/recommendations';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldX } from 'lucide-react';

export default function ResourcesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<ResourceType | 'all'>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<string>('desc');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [showAdminDialog, setShowAdminDialog] = useState<boolean>(false);
  const [checkingAdmin, setCheckingAdmin] = useState<boolean>(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch(`/api/user/check-admin?email=${session.user.email}`);
          const data = await response.json();
          setIsAdmin(data.isAdmin);
        } catch (error) {
          console.error('Error checking admin status:', error);
        } finally {
          setCheckingAdmin(false);
        }
      } else {
        setCheckingAdmin(false);
      }
    };

    checkAdmin();
  }, [session]);

  const handleUploadClick = () => {
    if (isAdmin) {
      router.push('/dashboard/resources/upload');
    } else {
      setShowAdminDialog(true);
    }
  };

  if (checkingAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="mb-8 md:mb-12">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700">Resources</span>
            </h1>
            <p className="text-gray-600 max-w-2xl">
              Explore our collection of mental health resources in multiple languages
            </p>
            <div className="mt-6 h-1 w-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900">Resource Library</h2>
          </div>
          
          <Dialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-md hover:shadow-lg transition-all duration-300" onClick={handleUploadClick}>
                <Upload className="h-4 w-4" />
                Upload Resource
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <ShieldX className="h-5 w-5 text-red-500" />
                  Admin Access Required
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Alert className="border-red-100 bg-red-50">
                  <ShieldX className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-red-700">
                    This feature is only accessible to administrators. Please contact your system administrator if you need to upload resources.
                  </AlertDescription>
                </Alert>
                <div className="flex justify-end">
                  <Button onClick={() => setShowAdminDialog(false)} className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white">
                    I Understand
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 mb-6 border border-blue-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Resource Library</h2>
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full sm:w-auto border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </Button>
              </div>
              
              {showFilters && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <ResourceFilters
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    selectedType={selectedType}
                    setSelectedType={setSelectedType}
                    selectedLanguage={selectedLanguage}
                    setSelectedLanguage={setSelectedLanguage}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    sortOrder={sortOrder}
                    setSortOrder={setSortOrder}
                  />
                </div>
              )}
            </div>
            
            <ResourceList
              selectedCategory={selectedCategory}
              selectedType={selectedType}
              selectedLanguage={selectedLanguage}
              searchQuery={searchQuery}
              sortBy={sortBy}
              sortOrder={sortOrder}
              setSelectedCategory={setSelectedCategory}
              setSelectedType={setSelectedType}
              setSelectedLanguage={setSelectedLanguage}
              setSearchQuery={setSearchQuery}
            />
          </div>
          
          <div className="lg:col-span-1">
            <Recommendations />
          </div>
        </div>
      </div>
    </div>
  );
}