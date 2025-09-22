'use client';

import { useState, useEffect } from 'react';
import ProgressVisualization from '@/components/dashboard/progress-visualization';

export default function ProgressPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Progress</h1>
        <p className="mt-2 text-gray-600">
          Track your mental health journey and see how you&apos;re improving over time.
        </p>
      </div>
      
      <ProgressVisualization />
    </div>
  );
}