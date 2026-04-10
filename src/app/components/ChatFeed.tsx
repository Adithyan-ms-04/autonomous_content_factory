'use client';

import { useEffect, useRef } from 'react';
import { User, MessageSquare } from 'lucide-react';
import { formatTimestamp } from '@/app/lib/utils';
import type { CampaignWorkflow, AgentRole, AgentMessage } from '@/app/types';

interface ChatFeedProps {
  workflow: CampaignWorkflow | null;
}

const agentLabels: Record<AgentRole | 'user', string> = {
  researcher: 'Researcher',
  copywriter: 'Copywriter',
  editor: 'Editor',
  scraper: 'Scraper',
  user: 'You',
};

// Status-based colors
const typeStyles: Record<AgentMessage['type'], string> = {
  approval: 'border-green-500 bg-green-50/60 dark:bg-green-900/15',
  rejection: 'border-red-500 bg-red-50/60 dark:bg-red-900/15',
  action: 'border-yellow-400 bg-yellow-50/60 dark:bg-yellow-900/15',
  correction: 'border-orange-400 bg-orange-50/60 dark:bg-orange-900/15',
  info: 'border-gray-300 bg-gray-50/60 dark:bg-gray-800/30',
};

const typeEmoji: Record<AgentMessage['type'], string> = {
  approval: '✅',
  rejection: '❌',
  action: '🔨',
  correction: '🔍',
  info: 'ℹ️',
};

export function ChatFeed({ workflow }: ChatFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [workflow?.messages]);

  const messages = workflow?.messages || [];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-2 border-b border-gray-200/50 dark:border-gray-800/50 pb-3 mb-3 shrink-0">
        <div className="p-1.5 rounded-md bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500">
          <MessageSquare className="w-4 h-4" />
        </div>
        <h2 className="text-sm font-bold text-gray-900 dark:text-white">
          Live Logs
        </h2>
        <span className="text-xs text-gray-400 ml-auto">{messages.length} messages</span>
      </div>
      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        aria-label="Agent communication messages"
        className="flex-1 overflow-y-auto custom-scrollbar rounded-xl border border-gray-200/50 dark:border-gray-800/50 bg-gray-50/80 dark:bg-gray-950/50 p-3 shadow-inner"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <User className="w-5 h-5 mb-1" />
            <p className="text-xs">Waiting for agents…</p>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`px-2.5 py-1.5 rounded-md text-xs border-l-2 ${typeStyles[message.type]}`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="leading-none">{typeEmoji[message.type]}</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {agentLabels[message.from]}
                  </span>
                  <span className="text-[10px] text-gray-400 ml-auto whitespace-nowrap">
                    {formatTimestamp(message.timestamp)}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mt-0.5 leading-snug pl-5">
                  {message.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
