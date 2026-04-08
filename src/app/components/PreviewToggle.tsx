'use client';

import { Monitor, Smartphone } from 'lucide-react';

interface PreviewToggleProps {
  mode: 'desktop' | 'mobile';
  onChange: (mode: 'desktop' | 'mobile') => void;
}

export function PreviewToggle({ mode, onChange }: PreviewToggleProps) {
  return (
    <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <button
        onClick={() => onChange('desktop')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
          mode === 'desktop'
            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
      >
        <Monitor className="w-4 h-4" />
        Desktop
      </button>
      <button
        onClick={() => onChange('mobile')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
          mode === 'mobile'
            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
      >
        <Smartphone className="w-4 h-4" />
        Mobile
      </button>
    </div>
  );
}
