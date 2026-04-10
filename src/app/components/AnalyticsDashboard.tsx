'use client';

import { useMemo } from 'react';
import { BarChart3, BookOpen, Clock, Hash, Type, Zap } from 'lucide-react';
import { analyzeContent } from '@/app/lib/analytics';
import type { ContentPiece } from '@/app/types';

interface AnalyticsDashboardProps {
  blogPost?: ContentPiece;
  socialThread?: ContentPiece;
  emailTeaser?: ContentPiece;
}

export function AnalyticsDashboard({ blogPost, socialThread, emailTeaser }: AnalyticsDashboardProps) {
  const analytics = useMemo(() => {
    const pieces = [
      { label: 'Blog Post', piece: blogPost, color: 'blue' },
      { label: 'Social Thread', piece: socialThread, color: 'green' },
      { label: 'Email Teaser', piece: emailTeaser, color: 'amber' },
    ];

    return pieces.map(({ label, piece, color }) => ({
      label,
      color,
      data: piece ? analyzeContent(piece.content) : null,
    }));
  }, [blogPost, socialThread, emailTeaser]);

  const allKeywords = useMemo(() => {
    const freq: Record<string, number> = {};
    analytics.forEach(({ data }) => {
      data?.topKeywords.forEach(({ word, count }) => {
        freq[word] = (freq[word] || 0) + count;
      });
    });
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [analytics]);

  if (!blogPost && !socialThread && !emailTeaser) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-gray-200/50 dark:border-gray-800/50 pb-4">
        <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400">
          <BarChart3 className="w-5 h-5" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
          Content Analytics
        </h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {analytics.map(({ label, color, data }) => {
          if (!data) return null;
          const colorMap: Record<string, string> = {
            blue: 'from-blue-500 to-indigo-500',
            green: 'from-emerald-500 to-teal-500',
            amber: 'from-amber-500 to-orange-500',
          };
          return (
            <div key={label} className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800 shadow-sm space-y-4">
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${colorMap[color]}`}>
                {label}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                    <Type className="w-3.5 h-3.5" aria-hidden="true" />
                    <span className="text-xs font-medium">Words</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.wordCount}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                    <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                    <span className="text-xs font-medium">Read Time</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.readingTimeMinutes}m</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                    <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                    <span className="text-xs font-medium">Level</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{data.readingLevel.split('(')[0].trim()}</p>
                </div>

              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {data.sentenceCount} sentences · {data.avgWordsPerSentence} words/sentence
              </div>
            </div>
          );
        })}
      </div>

      {/* SEO Keywords */}
      {allKeywords.length > 0 && (
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Hash className="w-4 h-4 text-violet-500" aria-hidden="true" />
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Top SEO Keywords</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {allKeywords.map(([keyword, count]) => (
              <span
                key={keyword}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 text-sm font-medium border border-violet-200 dark:border-violet-800/50"
              >
                {keyword}
                <span className="text-xs text-violet-500 dark:text-violet-400">×{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
