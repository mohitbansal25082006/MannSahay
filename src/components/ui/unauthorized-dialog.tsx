// E:\mannsahay\src\components\ui\unauthorized-dialog.tsx
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useSearchParams, useRouter } from 'next/navigation';

export default function UnauthorizedDialog() {
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get('error');

  useEffect(() => {
    if (error === 'notcounselor') {
      setOpen(true);
    }
  }, [error]);

  const handleClose = () => {
    setOpen(false);
    // Remove the error parameter from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('error');
    window.history.pushState({}, '', url.toString());
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Access Denied
          </DialogTitle>
          <DialogDescription>
            Only authorized counselors can access the counselor dashboard. If you believe this is an error, please contact the administrator.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={handleClose}>
            I Understand
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}