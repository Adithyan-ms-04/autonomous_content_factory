'use client';

import { useState } from 'react';
import { FileText, Share2, Mail, AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { PreviewToggle } from './PreviewToggle';
import type { CampaignWorkflow, ContentPiece, CampaignOutput } from '@/app/types';

interface CampaignViewProps {
  workflow: CampaignWorkflow | null;
  onRegenerate?: (contentPieceId: string, correctionNotes: string) => void;
}

type TabType = 'blog' | 'social' | 'email';

export function CampaignView({ workflow, onRegenerate }: CampaignViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('blog');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [correctionNotes, setCorrectionNotes] = useState('');
  const [showCorrectionInput, setShowCorrectionInput] = useState(false);

  const campaign = workflow?.campaign;
  const sourceDoc = workflow?.sourceDocument;

  const getContentPiece = (type: TabType): ContentPiece | undefined => {
    if (!campaign) return undefined;
    if (type === 'blog') return campaign.blogPost;
    if (type === 'social') return campaign.socialThread;
    return campaign.emailTeaser;
  };

  const currentContent = getContentPiece(activeTab);

  const handleRegenerate = () => {
    if (currentContent && onRegenerate) {
      onRegenerate(currentContent.id, correctionNotes || 'General improvement needed');
      setCorrectionNotes('');
      setShowCorrectionInput(false);
    }
  };

  const tabs: { id: TabType; label: string; icon: typeof FileText }[] = [
    { id: 'blog', label: 'Blog Post', icon: FileText },
    { id: 'social', label: 'Social Thread', icon: Share2 },
    { id: 'email', label: 'Email', icon: Mail },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200/50 dark:border-gray-800/50 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400">
            <FileText className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            Content Studio
          </h2>
        </div>
        <PreviewToggle mode={previewMode} onChange={setPreviewMode} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Source Document Panel */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-widest pl-1">
            <FileText className="w-4 h-4" />
            Source Document
          </div>
          <div className="p-6 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 bg-gray-50/50 dark:bg-gray-950/30 h-[600px] overflow-y-auto custom-scrollbar shadow-inner">
            <div className="prose dark:prose-invert max-w-none">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                {sourceDoc?.title || 'Untitled'}
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {sourceDoc?.content || 'No source content available.'}
              </div>
            </div>
          </div>
        </div>

        {/* Generated Content Panel */}
        <div className="space-y-2">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => {
              const content = getContentPiece(tab.id);
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors relative ${
                    activeTab === tab.id
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {content && (
                    <span className="ml-1">
                      {content.status === 'approved' && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      {content.status === 'rejected' && (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </span>
                  )}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Content Display */}
          <div
            className={`p-6 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 bg-white dark:bg-gray-950/40 h-[552px] overflow-y-auto custom-scrollbar shadow-lg ${
              previewMode === 'mobile' ? 'max-w-sm mx-auto' : ''
            }`}
          >
            {currentContent ? (
              <div className="space-y-4">
                {/* Content Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={currentContent.status} />
                    <span className="text-xs text-gray-500">
                      Tone: {currentContent.tone}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {currentContent.status === 'rejected' && (
                      <button
                        onClick={() => setShowCorrectionInput(!showCorrectionInput)}
                        className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Regenerate
                      </button>
                    )}
                  </div>
                </div>

                {/* Rejection Reason */}
                {currentContent.status === 'rejected' && currentContent.rejectionReason && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-800 dark:text-red-300">
                          Correction Notes:
                        </p>
                        <p className="text-sm text-red-700 dark:text-red-400">
                          {currentContent.rejectionReason}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Correction Input */}
                {showCorrectionInput && currentContent.status === 'rejected' && (
                  <div className="space-y-2">
                    <textarea
                      value={correctionNotes}
                      onChange={(e) => setCorrectionNotes(e.target.value)}
                      placeholder="Enter specific corrections needed..."
                      rows={3}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleRegenerate}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Submit Corrections & Regenerate
                    </button>
                  </div>
                )}

                {/* Content */}
                <div
                  className={`prose dark:prose-invert max-w-none ${
                    activeTab === 'social'
                      ? 'text-sm space-y-3'
                      : activeTab === 'email'
                        ? 'text-sm'
                        : ''
                  }`}
                >
                  {activeTab === 'social' ? (
                    <div className="space-y-3">
                      {currentContent.content.split('\n').map((post, i) => (
                        post.trim() && (
                          <div
                            key={i}
                            className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 rounded-full bg-blue-500" />
                              <div>
                                <div className="font-semibold text-sm">Brand</div>
                                <div className="text-xs text-gray-500">@brand • Just now</div>
                              </div>
                            </div>
                            <p className="text-gray-800 dark:text-gray-200">{post}</p>
                          </div>
                        )
                      ))}
                    </div>
                  ) : activeTab === 'email' ? (
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <p>{currentContent.content}</p>
                    </div>
                  ) : (
                    <div
                      className="prose dark:prose-invert"
                      dangerouslySetInnerHTML={{
                        __html: currentContent.content
                          .replace(/\n\n/g, '</p><p>')
                          .replace(/^/, '<p>')
                          .replace(/$/, '</p>'),
                      }}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <FileText className="w-12 h-12 mb-2" />
                <p className="text-sm">Content will appear here...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
