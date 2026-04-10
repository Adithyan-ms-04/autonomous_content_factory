'use client';

import { Brain, Pencil, Shield, CheckCircle, Globe } from 'lucide-react';
import type { AgentRole, AgentState } from '@/app/types';

interface AgentCardProps {
  role: AgentRole;
  state: AgentState;
  currentTask?: string;
}

const agentConfig = {
  researcher: {
    name: 'Research Agent',
    description: 'Extracts facts & creates Source of Truth',
    icon: Brain,
    bgColor: 'bg-white/80 dark:bg-blue-950/30 backdrop-blur-xl',
    iconBgColor: 'bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-600/20 dark:to-indigo-600/20',
    textColor: 'text-blue-700 dark:text-blue-400',
    borderColor: 'border-white/50 dark:border-blue-900/30',
    shadow: 'shadow-xl shadow-blue-500/5 dark:shadow-blue-900/20',
    glowColor: 'bg-blue-500',
  },
  copywriter: {
    name: 'Copywriter',
    description: 'Generates multi-format content',
    icon: Pencil,
    bgColor: 'bg-white/80 dark:bg-emerald-950/30 backdrop-blur-xl',
    iconBgColor: 'bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-600/20 dark:to-teal-600/20',
    textColor: 'text-emerald-700 dark:text-emerald-400',
    borderColor: 'border-white/50 dark:border-emerald-900/30',
    shadow: 'shadow-xl shadow-emerald-500/5 dark:shadow-emerald-900/20',
    glowColor: 'bg-emerald-500',
  },
  editor: {
    name: 'Editor-in-Chief',
    description: 'Quality control & validation',
    icon: Shield,
    bgColor: 'bg-white/80 dark:bg-amber-950/30 backdrop-blur-xl',
    iconBgColor: 'bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-600/20 dark:to-orange-600/20',
    textColor: 'text-amber-700 dark:text-amber-400',
    borderColor: 'border-white/50 dark:border-amber-900/30',
    shadow: 'shadow-xl shadow-amber-500/5 dark:shadow-amber-900/20',
    glowColor: 'bg-amber-500',
  },
  scraper: {
    name: 'URL Scraper',
    description: 'Fetches & extracts web content',
    icon: Globe,
    bgColor: 'bg-white/80 dark:bg-cyan-950/30 backdrop-blur-xl',
    iconBgColor: 'bg-gradient-to-br from-cyan-100 to-sky-100 dark:from-cyan-600/20 dark:to-sky-600/20',
    textColor: 'text-cyan-700 dark:text-cyan-400',
    borderColor: 'border-white/50 dark:border-cyan-900/30',
    shadow: 'shadow-xl shadow-cyan-500/5 dark:shadow-cyan-900/20',
    glowColor: 'bg-cyan-500',
  },
};

const stateConfig: Record<AgentState, { label: string; animation: string }> = {
  idle: { label: 'Waiting', animation: '' },
  thinking: { label: 'Thinking...', animation: 'animate-thinking' },
  typing: { label: 'Typing...', animation: '' },
  reviewing: { label: 'Reviewing...', animation: 'animate-scanning' },
  completed: { label: 'Done', animation: '' },
  error: { label: 'Error', animation: '' },
};

export function AgentCard({ role, state, currentTask }: AgentCardProps) {
  const config = agentConfig[role];
  const Icon = config.icon;
  const stateInfo = stateConfig[state];

  // Animated background glow for active state
  const isActive = state === 'thinking' || state === 'typing' || state === 'reviewing';

  return (
    <div
      role="status"
      aria-label={`${config.name}: ${stateInfo.label}${currentTask ? ` — ${currentTask}` : ''}`}
      aria-live="polite"
      className={`relative p-5 rounded-2xl border transition-all duration-500 overflow-hidden ${
        isActive ? 'scale-[1.02] -translate-y-1' : 'hover:scale-[1.01]'
      } ${
        state === 'error' 
          ? 'border-red-500/50 bg-red-50/50 dark:bg-red-900/10' 
          : `${config.bgColor} ${config.borderColor} ${config.shadow}`
      }`}
    >
      {/* Background active glow effect */}
      {isActive && (
        <div className={`absolute -inset-4 opacity-10 blur-2xl rounded-full ${config.glowColor} animate-pulse`} />
      )}

      <div className="relative z-10 flex items-start gap-4">
        <div className={`p-3.5 rounded-xl flex items-center justify-center ${config.iconBgColor} ${config.textColor} shadow-inner`}>
          <Icon className="w-6 h-6" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            {config.name}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {config.description}
          </p>

          <div className="mt-4 flex items-center gap-2">
            {state === 'completed' ? (
              <span className="animate-in zoom-in duration-300">
                <CheckCircle className="w-5 h-5 text-emerald-500 border-2 border-transparent rounded-full" />
              </span>
            ) : state === 'typing' ? (
              <div className="flex gap-1.5 px-1">
                <span className={`w-2 h-2 rounded-full ${config.glowColor} animate-bounce [animation-delay:-0.3s]`} />
                <span className={`w-2 h-2 rounded-full ${config.glowColor} animate-bounce [animation-delay:-0.15s]`} />
                <span className={`w-2 h-2 rounded-full ${config.glowColor} animate-bounce`} />
              </div>
            ) : state === 'reviewing' ? (
              <div className="relative w-full h-1.5 bg-gray-200/50 dark:bg-gray-700/50 rounded-full overflow-hidden">
                <div className={`absolute inset-y-0 left-0 w-1/3 ${config.glowColor} animate-pulse rounded-full`} />
              </div>
            ) : null}

            <span className={`text-xs font-semibold uppercase tracking-wider ${config.textColor}`}>
              {stateInfo.label}
            </span>
          </div>

          {currentTask && state !== 'idle' && state !== 'completed' && (
            <p className="mt-3 text-xs text-gray-600 dark:text-gray-300 truncate bg-white/50 dark:bg-black/20 p-2 rounded-lg border border-white/20 dark:border-white/5">
              {currentTask}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
