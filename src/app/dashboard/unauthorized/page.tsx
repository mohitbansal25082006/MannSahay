// E:\mannsahay\src\app\dashboard\unauthorized\page.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="max-w-md mx-auto mt-16">
      <Card className="border-red-200">
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-red-700">Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to access the counselor dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="mb-4 p-3 bg-yellow-50 rounded-md border border-yellow-200">
            <div className="flex items-center text-yellow-800">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <span className="font-medium">Counselor Dashboard Access</span>
            </div>
            <p className="text-yellow-700 text-sm mt-2">
              Only authorized counselors can access this dashboard. If you believe this is an error, please contact the administrator.
            </p>
          </div>
          <Button asChild className="w-full">
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}