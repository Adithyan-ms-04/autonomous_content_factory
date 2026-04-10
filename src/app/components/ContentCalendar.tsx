'use client';

import { useMemo } from 'react';
import { Calendar, FileText, Share2, Mail } from 'lucide-react';
import type { ScheduleItem } from '@/app/types';

interface ContentCalendarProps {
  campaignCreatedAt?: Date | string;
}

export function ContentCalendar({ campaignCreatedAt }: ContentCalendarProps) {
  const schedule: ScheduleItem[] = useMemo(() => {
    const baseDate = campaignCreatedAt ? new Date(campaignCreatedAt) : new Date();

    const items: Omit<ScheduleItem, 'dayName' | 'date'>[] = [
      { type: 'blog', label: 'Publish Blog Post', dayOffset: 1, color: 'blue' },
      { type: 'social', label: 'Launch Social Thread', dayOffset: 3, color: 'green' },
      { type: 'email', label: 'Send Email Teaser', dayOffset: 5, color: 'amber' },
    ];

    return items.map((item) => {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + item.dayOffset);
      return {
        ...item,
        dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      };
    });
  }, [campaignCreatedAt]);

  const iconMap = { blog: FileText, social: Share2, email: Mail };
  const colorMap: Record<string, { bg: string; border: string; text: string; dot: string }> = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800/50',
      text: 'text-blue-700 dark:text-blue-300',
      dot: 'bg-blue-500',
    },
    green: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      border: 'border-emerald-200 dark:border-emerald-800/50',
      text: 'text-emerald-700 dark:text-emerald-300',
      dot: 'bg-emerald-500',
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-200 dark:border-amber-800/50',
      text: 'text-amber-700 dark:text-amber-300',
      dot: 'bg-amber-500',
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-gray-200/50 dark:border-gray-800/50 pb-4">
        <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400">
          <Calendar className="w-5 h-5" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
          Suggested Schedule
        </h2>
      </div>

      <div className="relative">
        {/* Timeline connector */}
        <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gray-200 dark:bg-gray-700" />

        <div className="space-y-6">
          {schedule.map((item, i) => {
            const Icon = iconMap[item.type];
            const c = colorMap[item.color];
            return (
              <div key={item.type} className="flex gap-4 items-start relative">
                {/* Timeline dot */}
                <div className={`relative z-10 w-12 h-12 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${c.text}`} aria-hidden="true" />
                </div>

                <div className={`flex-1 p-4 rounded-xl ${c.bg} border ${c.border}`}>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-bold ${c.text}`}>{item.label}</h3>
                    <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                      Day +{item.dayOffset}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-semibold">{item.dayName}</span> · {item.date}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
