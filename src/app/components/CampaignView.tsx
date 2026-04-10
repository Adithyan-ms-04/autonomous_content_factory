'use client';

import { useState } from 'react';
import { FileText, Share2, Mail, AlertCircle, CheckCircle, XCircle, RefreshCw, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
  // Feature 4: Inline editing
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');

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

  // Feature 4: Start editing
  const startEditing = () => {
    if (currentContent) {
      setEditContent(currentContent.content);
      setIsEditing(true);
    }
  };

  // Feature 4: Save edit (updates the content piece in-place on client)
  const saveEdit = () => {
    if (currentContent && workflow?.campaign) {
      currentContent.content = editContent;
      setIsEditing(false);
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
          <div className="flex border-b border-gray-200 dark:border-gray-700" role="tablist" aria-label="Content type tabs">
            {tabs.map((tab) => {
              const content = getContentPiece(tab.id);
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`tabpanel-${tab.id}`}
                  id={`tab-${tab.id}`}
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
            role="tabpanel"
            id={`tabpanel-${activeTab}`}
            aria-labelledby={`tab-${activeTab}`}
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
                    {/* Feature 4: Edit Button */}
                    {!isEditing ? (
                      <button
                        onClick={startEditing}
                        aria-label="Edit content inline"
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      >
                        ✏️ Edit
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={saveEdit}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                        >
                          ✓ Save
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                          ✕ Cancel
                        </button>
                      </>
                    )}

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
                <div className="mt-6">
                  {/* Feature 4: Inline editor */}
                  {isEditing ? (
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full h-[400px] p-4 rounded-xl border border-blue-300 dark:border-blue-700 bg-blue-50/30 dark:bg-blue-950/20 text-gray-900 dark:text-white font-mono text-sm resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      aria-label="Edit content"
                    />
                  ) : activeTab === 'social' ? (
                    <div className="max-w-[400px] mx-auto bg-white dark:bg-white/5 border-[8px] border-gray-800 dark:border-gray-900 rounded-[3rem] overflow-hidden shadow-2xl relative ring-1 ring-gray-900/5">
                      {/* Mobile Header */}
                      <div className="h-14 border-b border-gray-100 dark:border-white/10 flex items-center justify-between px-5 font-semibold text-gray-800 dark:text-gray-200">
                        <span>Thread</span>
                        <a 
                          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(currentContent.content)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black px-3 py-1.5 rounded-full text-xs font-bold transition-colors shadow-sm"
                        >
                          Post on X
                        </a>
                      </div>
                      <div className="p-5 relative bg-gray-50 dark:bg-black min-h-[500px]">
                        {/* The Thread Connector Line */}
                        <div className="absolute top-8 bottom-12 left-10 w-0.5 bg-gray-200 dark:bg-gray-800 z-0" />
                        
                        <div className="space-y-0 relative z-10">
                          {currentContent.content.split('\n').filter(p => p.trim()).map((post, i) => (
                            <div key={i} className="flex gap-4 pb-6">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 shrink-0 border-4 border-gray-50 dark:border-black relative z-10 shadow-sm" />
                              <div className="flex-1 pt-0.5">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <span className="font-bold text-[15px] text-gray-900 dark:text-white">Brand</span>
                                  <span className="text-gray-500 dark:text-gray-400 text-[15px]">@brand</span>
                                </div>
                                <p className="text-gray-800 dark:text-gray-200 text-[15px] leading-snug whitespace-pre-wrap">{post}</p>
                                <div className="mt-3 flex justify-between items-center text-xs font-medium">
                                  <div className="flex gap-4 text-gray-400">
                                    <MessageSquare className="w-4 h-4" />
                                    <RefreshCw className="w-4 h-4" />
                                    <FileText className="w-4 h-4" />
                                  </div>
                                  <span className={post.length > 280 ? 'text-red-500' : 'text-gray-400'}>
                                    {post.length}/280
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : activeTab === 'email' ? (
                    <div className="max-w-3xl mx-auto rounded-xl border border-gray-200 dark:border-white/10 shadow-xl overflow-hidden bg-white dark:bg-gray-900/50 backdrop-blur-sm">
                      {/* Inbox Header Mockup */}
                      <div className="bg-gray-50 dark:bg-black/40 px-6 py-5 border-b border-gray-200 dark:border-white/10 relative">
                        {(() => {
                            const match = currentContent.content.match(/^Subject:\s*(.*)/i);
                            const subject = match ? match[1].trim() : '';
                            const body = currentContent.content.replace(/^Subject:\s*.*\n?/i, '').trim();
                            const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                            return (
                              <div className="absolute top-4 right-5 sm:top-5 sm:right-6">
                                <a 
                                  href={gmailUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm"
                                >
                                  <Mail className="w-4 h-4" />
                                  Compose
                                </a>
                              </div>
                            );
                        })()}
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-xl shadow-sm">
                            C
                          </div>
                          <div className="flex-1 text-sm">
                            <div className="font-semibold text-gray-900 dark:text-white text-base">Content Team <span className="font-normal text-gray-500 dark:text-gray-400">&lt;marketing@brand.com&gt;</span></div>
                            <div className="text-gray-500 dark:text-gray-400 mt-0.5">To: You</div>
                          </div>
                        </div>
                        <h1 className="font-bold text-2xl text-gray-900 dark:text-white leading-tight pr-28">
                          {(() => {
                            const match = currentContent.content.match(/^Subject:\s*(.*)/i);
                            return match ? match[1] : 'No Subject';
                          })()}
                        </h1>
                      </div>
                      {/* Email Body Shadow Box style */}
                      <div className="p-8 md:p-10 bg-white dark:bg-gray-900">
                        <div className="prose prose-lg dark:prose-invert max-w-none text-base whitespace-pre-wrap leading-relaxed text-gray-700 dark:text-gray-300">
                          {currentContent.content.replace(/^Subject:\s*.*\n?/i, '').trim()}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <article className="max-w-[800px] mx-auto bg-white dark:bg-gray-900 p-8 sm:p-12 rounded-2xl shadow-sm border border-gray-200/60 dark:border-white/5 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
                      <div className="flex items-center gap-3 mb-8 text-sm text-gray-500 dark:text-gray-400 font-medium">
                        <span className="px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 font-semibold flex items-center gap-1.5">
                          Reading Time: {Math.max(1, Math.ceil(currentContent.content.split(/\s+/).length / 200))} mins
                        </span>
                        <span>•</span>
                        <span>{currentContent.content.split(/\s+/).length} words</span>
                      </div>
                      <div className="prose prose-lg dark:prose-invert max-w-none hover:prose-a:text-blue-500 prose-a:text-blue-600 prose-a:no-underline prose-img:rounded-2xl leading-[1.7] text-gray-800 dark:text-gray-200">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({node, ...props}) => <h1 className="text-4xl sm:text-5xl font-black mt-10 mb-6 text-gray-900 dark:text-white leading-tight tracking-tight" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-3xl sm:text-4xl font-extrabold mt-12 mb-4 text-gray-800 dark:text-gray-100" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-2xl sm:text-3xl font-bold mt-8 mb-4 text-gray-800 dark:text-gray-100" {...props} />,
                          }}
                        >
                          {currentContent.content}
                        </ReactMarkdown>
                      </div>
                    </article>
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
