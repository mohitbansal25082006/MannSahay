import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Plus } from 'lucide-react';

export default function ForumPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Peer Support Forum
        </h1>
        <p className="text-gray-600">
          Connect with fellow students in a safe, anonymous environment
        </p>
      </div>

      <div className="text-center py-12">
        <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Coming Soon in Part 3!
        </h3>
        <p className="text-gray-500 mb-4">
          The peer support forum will be available in the next part of our development.
        </p>
        <Button disabled>
          <Plus className="h-4 w-4 mr-2" />
          Create Post (Coming Soon)
        </Button>
      </div>
    </div>
  );
}