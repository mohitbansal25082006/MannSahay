import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Download } from 'lucide-react';

export default function ResourcesPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Mental Health Resources
        </h1>
        <p className="text-gray-600">
          Educational materials and tools to support your mental wellness
        </p>
      </div>

      <div className="text-center py-12">
        <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Resource Library Coming Soon!
        </h3>
        <p className="text-gray-500 mb-4">
          We're preparing a comprehensive library of mental health resources.
        </p>
        <Button disabled>
          <Download className="h-4 w-4 mr-2" />
          Browse Resources (Coming Soon)
        </Button>
      </div>
    </div>
  );
}