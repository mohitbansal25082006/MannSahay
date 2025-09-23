'use client';

import { useState, useEffect } from 'react';
import ProgressVisualization from '@/components/dashboard/progress-visualization';

export default function ProgressPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="mb-8 md:mb-12">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700">Progress</span>
            </h1>
            <p className="text-gray-600 max-w-2xl">
              Track your mental health journey and see how you&apos;re improving over time.
            </p>
            <div className="mt-6 h-1 w-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
          </div>
        </div>
        
        <ProgressVisualization />
      </div>
    </div>
  );
}