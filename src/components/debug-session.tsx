'use client';

import { useSession } from 'next-auth/react';

export default function DebugSession() {
  const { data: session, status } = useSession();

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg text-xs max-w-xs z-50">
      <div className="font-bold mb-2">Session Debug</div>
      <div>Status: {status}</div>
      <div>User ID: {session?.user?.id || 'Not available'}</div>
      <div>Email: {session?.user?.email || 'Not available'}</div>
      <div>Name: {session?.user?.name || 'Not available'}</div>
      <div>Session Object:</div>
      <pre className="bg-gray-900 p-2 rounded mt-1 overflow-x-auto">
        {JSON.stringify(session, null, 2)}
      </pre>
    </div>
  );
}