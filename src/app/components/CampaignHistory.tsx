'use client';

import { Clock, CheckCircle2, Loader2, AlertCircle, ChevronRight, Trash2 } from 'lucide-react';

interface CampaignSummary {
  id: string;
  title: string;
  currentStep: string;
  createdAt: string;
  updatedAt: string;
  contentPreview: string;
  hasCampaign: boolean;
}

interface CampaignHistoryProps {
  campaigns: CampaignSummary[];
  onResume: (id: string) => void;
  onClear: () => void;
  isLoadingId: string | null;
}

const stepConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  complete: {
    label: 'Completed',
    color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  review: {
    label: 'In Review',
    color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    icon: <Loader2 className="w-3.5 h-3.5" />,
  },
  copywrite: {
    label: 'Writing',
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
  },
  research: {
    label: 'Researching',
    color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
  },
  upload: {
    label: 'Pending',
    color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700',
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  },
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function CampaignHistory({ campaigns, onResume, onClear, isLoadingId }: CampaignHistoryProps) {
  if (campaigns.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mx-auto mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800">
            <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Campaign History</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{campaigns.length} past campaign{campaigns.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <button
          onClick={onClear}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all"
        >
          <Trash2 className="w-4 h-4" />
          Clear History
        </button>
      </div>

      <div className="space-y-3">
        {campaigns.map((campaign) => {
          const step = stepConfig[campaign.currentStep] || stepConfig.upload;
          const isLoading = isLoadingId === campaign.id;

          return (
            <button
              key={campaign.id}
              onClick={() => onResume(campaign.id)}
              disabled={isLoading}
              className="w-full group text-left p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-md relative overflow-hidden"
            >
              {/* Left accent bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${campaign.currentStep === 'complete' ? 'bg-emerald-500' : 'bg-blue-500'}`} />

              <div className="flex items-center gap-4">
                <div className="flex-1 min-w-0 pl-2">
                  <div className="flex items-center gap-3 mb-1.5">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {campaign.title}
                    </h3>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${step.color}`}>
                      {step.icon}
                      {step.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                    {campaign.contentPreview}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                    {formatDate(campaign.createdAt)}
                  </p>
                </div>

                <div className="flex-shrink-0">
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors" />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
