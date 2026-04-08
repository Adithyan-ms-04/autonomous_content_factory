'use client';

import { AgentCard } from './AgentCard';
import type { CampaignWorkflow, AgentRole } from '@/app/types';

interface AgentRoomProps {
  workflow: CampaignWorkflow | null;
}

import { Server } from 'lucide-react';

export function AgentRoom({ workflow }: AgentRoomProps) {
  const getAgentStatus = (role: AgentRole) => {
    if (!workflow) {
      return { state: 'idle' as const, currentTask: undefined };
    }
    const status = workflow.agentStatuses.find((s) => s.role === role);
    return {
      state: status?.state || 'idle',
      currentTask: status?.currentTask,
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-gray-200/50 dark:border-gray-800/50 pb-4">
        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
          <Server className="w-5 h-5" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
          Active Agents
        </h2>
      </div>
      <div className="space-y-4">
        <AgentCard
          role="researcher"
          state={getAgentStatus('researcher').state}
          currentTask={getAgentStatus('researcher').currentTask}
        />
        <AgentCard
          role="copywriter"
          state={getAgentStatus('copywriter').state}
          currentTask={getAgentStatus('copywriter').currentTask}
        />
        <AgentCard
          role="editor"
          state={getAgentStatus('editor').state}
          currentTask={getAgentStatus('editor').currentTask}
        />
      </div>
    </div>
  );
}
