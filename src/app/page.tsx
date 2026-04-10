'use client';

import { useCampaignWorkflow } from '@/app/lib/useCampaignWorkflow';
import { UploadZone } from '@/app/components/UploadZone';
import { CampaignHistory } from '@/app/components/CampaignHistory';
import { CampaignView } from '@/app/components/CampaignView';
import { AgentRoom } from '@/app/components/AgentRoom';
import { ChatFeed } from '@/app/components/ChatFeed';
import { ExportPanel } from '@/app/components/ExportPanel';
import { AnalyticsDashboard } from '@/app/components/AnalyticsDashboard';
import { LayoutDashboard, MessageSquare, FileText, Download, Sparkles, BarChart3 } from 'lucide-react';

export default function Home() {
  const {
    workflow,
    pastCampaigns,
    isLoading,
    error,
    resumingId,
    activeTab,
    setActiveTab,
    handleUpload,
    handleRegenerate,
    handleResume,
    handleClearHistory,
    exitCampaign,
  } = useCampaignWorkflow();

  // Show upload form if no workflow
  if (!workflow) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <UploadZone onSubmit={handleUpload} isLoading={isLoading} />
          {error && (
            <div
              className="mt-8 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
              role="alert"
            >
              {error}
            </div>
          )}
          <CampaignHistory
            campaigns={pastCampaigns}
            onResume={handleResume}
            onClear={handleClearHistory}
            isLoadingId={resumingId}
          />
        </div>
      </main>
    );
  }

  // Show campaign dashboard
  const navItems = [
    { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
    { id: 'chat' as const, label: 'Live Logs', icon: MessageSquare },
    { id: 'content' as const, label: 'Content Studio', icon: FileText },
    { id: 'analytics' as const, label: 'Analytics', icon: BarChart3, disabled: !workflow.campaign },
    { id: 'export' as const, label: 'Export Center', icon: Download, disabled: !workflow.campaign },
  ];

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans">
      {/* Top Navigation / Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <Sparkles className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                Content Factory
              </h1>
              <p className="text-[10px] text-gray-500 font-mono tracking-wider uppercase drop-shadow-sm">
                Session ID: {workflow.id.slice(0, 8)}
              </p>
            </div>
          </div>

          <button
            onClick={exitCampaign}
            className="px-5 py-2 text-sm rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-all shadow-sm"
            aria-label="Exit current campaign and return to upload screen"
          >
            Exit Campaign
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div
            className="mb-8 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-full md:w-56 shrink-0 space-y-3" role="navigation" aria-label="Campaign sections">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isCurrent = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  disabled={item.disabled}
                  aria-current={isCurrent ? 'page' : undefined}
                  aria-label={`Navigate to ${item.label}`}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    item.disabled
                      ? 'opacity-40 cursor-not-allowed text-gray-500'
                      : isCurrent
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 translate-x-1'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 hover:translate-x-1'
                  }`}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  {item.label}
                </button>
              );
            })}
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0 transition-all duration-300">
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Workflow Status */}
                <div
                  className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800 shadow-sm relative overflow-hidden"
                  role="status"
                  aria-live="polite"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-indigo-600" />
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <h2 className="text-lg font-bold mb-1">Campaign Status</h2>
                      <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 capitalize">
                        Phase: {workflow.currentStep}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {workflow.currentStep === 'upload' && 'Initializing campaign parameters...'}
                        {workflow.currentStep === 'scrape' && 'Scraper agent is extracting content from provided URL...'}
                        {workflow.currentStep === 'research' && 'Researcher agent is extracting source facts...'}
                        {workflow.currentStep === 'copywrite' && 'Copywriter is producing multi-format content...'}
                        {workflow.currentStep === 'review' && 'Editor is conducting quality control...'}
                        {workflow.currentStep === 'complete' && 'All agents have completed their tasks. Ready for export.'}
                      </p>
                      {workflow.language && workflow.language !== 'en' && (
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 font-medium">
                          🌍 Generating in: {workflow.language.toUpperCase()}
                        </p>
                      )}
                    </div>
                    {workflow.currentStep !== 'complete' && (
                      <div
                        className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"
                        role="progressbar"
                        aria-label="Campaign in progress"
                      />
                    )}
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800 shadow-sm">
                  <AgentRoom workflow={workflow} />
                </div>
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800 shadow-sm h-[800px] flex flex-col">
                  <ChatFeed workflow={workflow} />
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800 shadow-sm">
                  <CampaignView workflow={workflow} onRegenerate={handleRegenerate} />
                </div>
              </div>
            )}

            {activeTab === 'analytics' && workflow.campaign && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800 shadow-sm">
                  <AnalyticsDashboard
                    blogPost={workflow.campaign.blogPost}
                    socialThread={workflow.campaign.socialThread}
                    emailTeaser={workflow.campaign.emailTeaser}
                  />
                </div>
              </div>
            )}

            {activeTab === 'export' && workflow.campaign && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800 shadow-sm">
                  <ExportPanel workflow={workflow} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}