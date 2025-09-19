'use client';

import { AlertTriangle } from 'lucide-react';

interface ModerationNotificationProps {
  title: string;
  message: string;
  details?: string;
}

export function ModerationNotification({ title, message, details }: ModerationNotificationProps) {
  return (
    <div className="flex items-start p-4 bg-red-50 border border-red-200 rounded-lg">
      <AlertTriangle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
      <div>
        <h4 className="font-medium text-red-800">{title}</h4>
        <p className="text-sm text-red-700 mt-1">{message}</p>
        {details && (
          <p className="text-xs text-red-600 mt-2">{details}</p>
        )}
      </div>
    </div>
  );
}