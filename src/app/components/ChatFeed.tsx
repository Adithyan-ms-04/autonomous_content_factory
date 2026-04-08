'use client';

import { useEffect, useRef } from 'react';
import { User, MessageSquare } from 'lucide-react';
import { formatTimestamp } from '@/app/lib/utils';
import type { CampaignWorkflow, AgentRole, AgentMessage } from '@/app/types';

interface ChatFeedProps {
  workflow: CampaignWorkflow | null;
}

const agentNames: Record<AgentRole | 'user', string> = {
  researcher: 'Research Agent',
  copywriter: 'Copywriter',
  editor: 'Editor-in-Chief',
  user: 'You',
};

const agentColors: Record<AgentRole | 'user', string> = {
  researcher: 'text-blue-600 dark:text-blue-400',
  copywriter: 'text-green-600 dark:text-green-400',
  editor: 'text-amber-600 dark:text-amber-400',
  user: 'text-gray-600 dark:text-gray-400',
};

const messageIcons: Record<AgentMessage['type'], { emoji: string; className: string }> = {
  info: { emoji: 'ℹ️', className: '' },
  action: { emoji: '⚡', className: '' },
  correction: { emoji: '📝', className: 'bg-yellow-50 dark:bg-yellow-900/20' },
  approval: { emoji: '✅', className: 'bg-green-50 dark:bg-green-900/20' },
  rejection: { emoji: '❌', className: 'bg-red-50 dark:bg-red-900/20' },
};

export function ChatFeed({ workflow }: ChatFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [workflow?.messages]);

  const messages = workflow?.messages || [];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-3 border-b border-gray-200/50 dark:border-gray-800/50 pb-4 mb-4 shrink-0">
        <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
          <MessageSquare className="w-5 h-5" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
          Live Agent Communications
        </h2>
      </div>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar rounded-2xl border border-gray-200/50 dark:border-gray-800/50 bg-gray-50/80 dark:bg-gray-950/50 p-6 shadow-inner"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <User className="w-8 h-8 mb-2" />
            <p className="text-sm">Waiting for agents to start...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => {
              const iconConfig = messageIcons[message.type];
              const isFromUser = (message.from as string) === 'user';
              const isToUser = message.to === 'user';

              return (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg text-sm ${
                    message.from === 'researcher'
                      ? 'message-researcher'
                      : message.from === 'copywriter'
                        ? 'message-copywriter'
                      : message.from === 'editor'
                        ? 'message-editor'
                        : 'border-l-4 border-gray-300 bg-gray-100 dark:bg-gray-800'
                  } ${iconConfig.className}`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-base">{iconConfig.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`font-semibold ${
                            agentColors[message.from]
                          }`}
                        >
                          {agentNames[message.from]}
                        </span>
                        {!isFromUser && !isToUser && (
                          <>
                            <span className="text-gray-400">→</span>
                            <span
                              className={`font-medium ${
                                agentColors[message.to]
                              }`}
                            >
                              {agentNames[message.to]}
                            </span>
                          </>
                        )}
                        {isToUser && (
                          <span className="text-xs text-gray-500">(to you)</span>
                        )}
                        <span className="text-xs text-gray-400 ml-auto">
                          {formatTimestamp(message.timestamp)}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        {message.message}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
