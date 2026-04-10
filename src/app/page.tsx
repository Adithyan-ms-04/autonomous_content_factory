// Replace the entire src/app/page.tsx with this code:

'use client';

import { useState, useEffect, useRef } from 'react';
import { UploadZone } from '@/app/components/UploadZone';
import { CampaignHistory } from '@/app/components/CampaignHistory';
import { CampaignView } from '@/app/components/CampaignView';
import { AgentRoom } from '@/app/components/AgentRoom';
import { ChatFeed } from '@/app/components/ChatFeed';
import { ExportPanel } from '@/app/components/ExportPanel';
import { LayoutDashboard, MessageSquare, FileText, Download, Sparkles } from 'lucide-react';

import type { CampaignWorkflow } from '@/app/types';

export default function Home() {
  const [workflow, setWorkflow] = useState<CampaignWorkflow | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'chat' | 'content' | 'export'>('overview');
  const [pastCampaigns, setPastCampaigns] = useState<any[]>([]);
  const [resumingId, setResumingId] = useState<string | null>(null);

  // Fetch past campaigns on mount
  useEffect(() => {
    fetch('/api/campaign/list')
      .then(res => res.ok ? res.json() : [])
      .then(data => setPastCampaigns(Array.isArray(data) ? data : []))
      .catch(() => setPastCampaigns([]));
  }, []);

  // Resume a past campaign
  const handleResume = async (campaignId: string) => {
    try {
      setResumingId(campaignId);
      const res = await fetch(`/api/campaign?id=${campaignId}`);
      if (!res.ok) throw new Error('Failed to load campaign');
      const data = await res.json();
      setWorkflow(data);
    } catch (err) {
      alert('Could not load that campaign. It may have been corrupted.');
    } finally {
      setResumingId(null);
    }
  };

  // Clear all campaign history
  const handleClearHistory = async () => {
    if (!confirm('Are you sure you want to delete all campaign history? This cannot be undone.')) return;
    try {
      const res = await fetch('/api/campaign/clear', { method: 'DELETE' });
      if (res.ok) {
        setPastCampaigns([]);
      } else {
        alert('Failed to clear history.');
      }
    } catch {
      alert('Failed to clear history.');
    }
  };

  // Relying entirely on setInterval polling in handleUpload for updates

  const handleUpload = async (
    content: string,
    sourceUrl?: string,
    title?: string
  ) => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('/api/campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, sourceUrl, title }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errMsg = errData.error || 'Failed to create campaign';
        alert(`Validation Error: ${errMsg}`);
        throw new Error(errMsg);
      }

      const data = await response.json();

      // Fetch the initial workflow
      const workflowRes = await fetch(`/api/campaign?id=${data.workflowId}`);
      const initialWorkflow = await workflowRes.json();
      setWorkflow(initialWorkflow);

      // Start background polling for UI state
      pollIntervalRef.current = setInterval(async () => {
        const res = await fetch(`/api/campaign?id=${data.workflowId}`);
        if (res.ok) {
           const updated = await res.json();
           setWorkflow(updated);
           if (updated.currentStep === 'complete') {
             if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
           }
        }
      }, 2000);

      // Sequentially trigger workflow steps with better error visibility
      const runWorkflowSteps = async (workflowId: string) => {
        try {
          setError('');

          // Step 1: Research
          console.log('Starting research step...');
          const researchRes = await fetch('/api/campaign/step/research', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ workflowId })
          });
          if (!researchRes.ok) {
            const errData = await researchRes.json().catch(() => ({}));
            throw new Error(`Research step failed: ${errData.error || researchRes.statusText}`);
          }
          console.log('Research step completed');

          // Step 2: Copywrite
          console.log('Starting copywrite step...');
          const copywriteRes = await fetch('/api/campaign/step/copywrite', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ workflowId })
          });
          if (!copywriteRes.ok) {
            const errData = await copywriteRes.json().catch(() => ({}));
            throw new Error(`Copywrite step failed: ${errData.error || copywriteRes.statusText}`);
          }
          console.log('Copywrite step completed');

          // Step 3: Review and Auto-Regenerate
          let isApproved = false;
          let loops = 0;
          const maxLoops = 5;

          while (!isApproved && loops < maxLoops) {
            console.log(`Starting review step (loop ${loops + 1})...`);
            const reviewRes = await fetch('/api/campaign/step/review', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ workflowId })
            });
            if (!reviewRes.ok) {
              const errData = await reviewRes.json().catch(() => ({}));
              throw new Error(`Review step failed: ${errData.error || reviewRes.statusText}`);
            }
            const reviewData = await reviewRes.json();
            
            if (reviewData.allApproved) {
              isApproved = true;
              console.log('All content approved!');
              break;
            }

            loops++;
            if (loops >= maxLoops) {
              console.log('Max regeneration loops reached. Manual intervention required.');
              break;
            }

            console.log('Regenerating rejected content pieces...');
            const wfRes = await fetch(`/api/campaign?id=${workflowId}`);
            if (!wfRes.ok) throw new Error('Failed to fetch workflow state for regeneration');
            const wf = await wfRes.json();

            const campaign = wf.campaign;
            if (campaign) {
              const pieces = [campaign.blogPost, campaign.socialThread, campaign.emailTeaser].filter(Boolean);
              
              for (const piece of pieces) {
                if (piece.status === 'rejected') {
                  const regenRes = await fetch('/api/campaign', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      workflowId,
                      contentPieceId: piece.id,
                      correctionNotes: piece.rejectionReason || 'General improvement requested',
                      skipReview: true,
                    }),
                  });
                  if (!regenRes.ok) throw new Error(`Regeneration failed for piece ${piece.id}`);
                }
              }
            }
          }

        } catch (err) {
          const message = err instanceof Error ? err.message : 'Workflow failed';
          console.error('Workflow sequence error:', err);
          setError(message);
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        }
      };

      // Fire and forget the steps! The UI relies on the polling to see status
      runWorkflowSteps(data.workflowId);

      return () => {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      console.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async (
    contentPieceId: string,
    correctionNotes: string
  ) => {
    if (!workflow) return;

    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('/api/campaign', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowId: workflow.id,
          contentPieceId,
          correctionNotes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate content');
      }

      const data = await response.json();
      setWorkflow(data.workflow);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      console.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Show upload form if no workflow
  if (!workflow) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <UploadZone onSubmit={handleUpload} isLoading={isLoading} />
          {error && (
            <div className="mt-8 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300">
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
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans">
      {/* Top Navigation / Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                Content Factory
              </h1>
              <p className="text-[10px] text-gray-500 font-mono tracking-wider uppercase drop-shadow-sm">Session ID: {workflow.id.slice(0, 8)}</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
              }
              setWorkflow(null);
              setError('');
              setActiveTab('overview');
            }}
            className="px-5 py-2 text-sm rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-all shadow-sm"
          >
            Exit Campaign
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-8 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-full md:w-56 shrink-0 space-y-3">
             <button 
               onClick={() => setActiveTab('overview')} 
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                 activeTab === 'overview' 
                   ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 translate-x-1' 
                   : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 hover:translate-x-1'
               }`}
             >
               <LayoutDashboard className="w-4 h-4" /> Overview
             </button>
             <button 
               onClick={() => setActiveTab('chat')} 
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                 activeTab === 'chat' 
                   ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 translate-x-1' 
                   : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 hover:translate-x-1'
               }`}
             >
               <MessageSquare className="w-4 h-4" /> Live Logs
             </button>
             <button 
               onClick={() => setActiveTab('content')} 
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                 activeTab === 'content' 
                   ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 translate-x-1' 
                   : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 hover:translate-x-1'
               }`}
             >
               <FileText className="w-4 h-4" /> Content Studio
             </button>
             <button 
               onClick={() => setActiveTab('export')} 
               disabled={!workflow.campaign}
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                 !workflow.campaign 
                   ? 'opacity-40 cursor-not-allowed text-gray-500'
                   : activeTab === 'export'
                     ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 translate-x-1'
                     : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 hover:translate-x-1'
               }`}
             >
               <Download className="w-4 h-4" /> Export Center
             </button>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0 transition-all duration-300">
             {activeTab === 'overview' && (
               <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 {/* Workflow Status Container */}
                 <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800 shadow-sm relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-indigo-600" />
                   <div className="flex items-center gap-4">
                     <div className="flex-1">
                       <h2 className="text-lg font-bold mb-1">Campaign Status</h2>
                       <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 capitalize">
                         Phase: {workflow.currentStep}
                       </p>
                       <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                         {workflow.currentStep === 'upload' && 'Initializing campaign parameters...'}
                         {workflow.currentStep === 'research' && 'Researcher agent is extracting source facts...'}
                         {workflow.currentStep === 'copywrite' && 'Copywriter is producing multi-format content...'}
                         {workflow.currentStep === 'review' && 'Editor is conducting quality control...'}
                         {workflow.currentStep === 'complete' && 'All agents have completed their tasks. Ready for export.'}
                       </p>
                     </div>
                     {workflow.currentStep !== 'complete' && (
                       <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
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
                 <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800 shadow-sm h-[600px] flex flex-col">
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