'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { CampaignWorkflow } from '@/app/types';
import { requestNotificationPermission, notifyCampaignComplete } from '@/app/lib/notifications';

/** Summary of a past campaign for the history list */
export interface CampaignSummary {
  id: string;
  title: string;
  currentStep: string;
  createdAt: string;
  updatedAt: string;
  contentPreview: string;
  hasCampaign: boolean;
}

export type DashboardTab = 'overview' | 'chat' | 'content' | 'analytics' | 'export';

export interface UseCampaignWorkflowReturn {
  workflow: CampaignWorkflow | null;
  pastCampaigns: CampaignSummary[];
  isLoading: boolean;
  error: string;
  resumingId: string | null;
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  handleUpload: (content: string, sourceUrl?: string, title?: string, language?: string, tones?: { blog: string; social: string; email: string }) => Promise<void>;
  handleRegenerate: (contentPieceId: string, correctionNotes: string) => Promise<void>;
  handleResume: (campaignId: string) => Promise<void>;
  handleClearHistory: () => Promise<void>;
  exitCampaign: () => void;
}

export function useCampaignWorkflow(): UseCampaignWorkflowReturn {
  const [workflow, setWorkflow] = useState<CampaignWorkflow | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [pastCampaigns, setPastCampaigns] = useState<CampaignSummary[]>([]);
  const [resumingId, setResumingId] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Fetch past campaigns on mount
  useEffect(() => {
    fetch('/api/campaign/list')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setPastCampaigns(Array.isArray(data) ? data : []))
      .catch(() => setPastCampaigns([]));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (eventSourceRef.current) eventSourceRef.current.close();
    };
  }, []);

  /** Connect to the SSE stream for real-time updates; falls back to polling */
  const startUpdates = useCallback((workflowId: string) => {
    try {
      const es = new EventSource(`/api/campaign/stream?id=${workflowId}`);
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setWorkflow((prev) => {
            // Feature 10: Send browser notification on completion
            if (data.currentStep === 'complete' && prev?.currentStep !== 'complete') {
              notifyCampaignComplete(data.sourceDocument?.title);
            }
            return data;
          });
          if (data.currentStep === 'complete') {
            es.close();
            eventSourceRef.current = null;
          }
        } catch {
          // Ignore parse errors
        }
      };

      es.onerror = () => {
        es.close();
        eventSourceRef.current = null;
        startPolling(workflowId);
      };
    } catch {
      startPolling(workflowId);
    }
  }, []);

  /** Polling fallback for updates */
  const startPolling = useCallback((workflowId: string) => {
    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/campaign?id=${workflowId}`);
        if (res.ok) {
          const updated = await res.json();
          setWorkflow((prev) => {
            if (updated.currentStep === 'complete' && prev?.currentStep !== 'complete') {
              notifyCampaignComplete(updated.sourceDocument?.title);
            }
            return updated;
          });
          if (updated.currentStep === 'complete') {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          }
        }
      } catch {
        // Silently handle polling errors
      }
    }, 2000);
  }, []);

  /** Run the sequential workflow steps (fire-and-forget) */
  const runWorkflowSteps = useCallback(async (workflowId: string) => {
    try {
      setError('');

      // Step 0: Scrape URL (if provided) — Feature 1
      const scrapeRes = await fetch('/api/campaign/step/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflowId }),
      });
      if (scrapeRes.ok) {
        const scrapeData = await scrapeRes.json();
        if (scrapeData.extractedContent) {
          // Append scraped content to the workflow source — handled server-side
        }
      }

      // Step 1: Research
      const researchRes = await fetch('/api/campaign/step/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflowId }),
      });
      if (!researchRes.ok) {
        const errData = await researchRes.json().catch(() => ({}));
        throw new Error(`Research step failed: ${errData.error || researchRes.statusText}`);
      }

      // Step 2: Copywrite
      const copywriteRes = await fetch('/api/campaign/step/copywrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflowId }),
      });
      if (!copywriteRes.ok) {
        const errData = await copywriteRes.json().catch(() => ({}));
        throw new Error(`Copywrite step failed: ${errData.error || copywriteRes.statusText}`);
      }

      // Step 3: Review and Auto-Regenerate
      let isApproved = false;
      let loops = 0;
      const maxLoops = 5;

      while (!isApproved && loops < maxLoops) {
        const reviewRes = await fetch('/api/campaign/step/review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workflowId }),
        });
        if (!reviewRes.ok) {
          const errData = await reviewRes.json().catch(() => ({}));
          throw new Error(`Review step failed: ${errData.error || reviewRes.statusText}`);
        }
        const reviewData = await reviewRes.json();

        if (reviewData.allApproved) {
          isApproved = true;
          break;
        }

        loops++;
        if (loops >= maxLoops) break;

        // Regenerate rejected content pieces
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
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    }
  }, []);

  const handleUpload = useCallback(
    async (content: string, sourceUrl?: string, title?: string, language?: string, tones?: { blog: string; social: string; email: string }) => {
      try {
        setIsLoading(true);
        setError('');

        const response = await fetch('/api/campaign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, sourceUrl, title, language, tones }),
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

        // Start real-time updates (SSE with polling fallback)
        startUpdates(data.workflowId);

        // Fire and forget the steps
        runWorkflowSteps(data.workflowId);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An error occurred';
        setError(message);
        console.error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [startUpdates, runWorkflowSteps]
  );

  const handleRegenerate = useCallback(
    async (contentPieceId: string, correctionNotes: string) => {
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
    },
    [workflow]
  );

  const handleResume = useCallback(async (campaignId: string) => {
    try {
      setResumingId(campaignId);
      const res = await fetch(`/api/campaign?id=${campaignId}`);
      if (!res.ok) throw new Error('Failed to load campaign');
      const data = await res.json();
      setWorkflow(data);
    } catch {
      alert('Could not load that campaign. It may have been corrupted.');
    } finally {
      setResumingId(null);
    }
  }, []);

  const handleClearHistory = useCallback(async () => {
    if (!confirm('Are you sure you want to delete all campaign history? This cannot be undone.'))
      return;
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
  }, []);

  const exitCampaign = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setWorkflow(null);
    setError('');
    setActiveTab('overview');
  }, []);

  return {
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
  };
}
