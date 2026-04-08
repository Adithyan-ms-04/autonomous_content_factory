'use client';

import { Download, Copy, FileText, Share2, Mail, Check } from 'lucide-react';
import type { CampaignOutput, CampaignWorkflow } from '@/app/types';

interface ExportPanelProps {
  workflow: CampaignWorkflow | null;
}

export function ExportPanel({ workflow }: ExportPanelProps) {
  const campaign = workflow?.campaign;

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(`${label} copied to clipboard!`);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadCampaign = () => {
    if (!campaign) return;

    const content = `# Campaign Kit
Generated: ${new Date().toLocaleString()}

## Source Document
${workflow?.sourceDocument.title || 'Untitled'}

---

## Blog Post
${campaign.blogPost.content}

---

## Social Media Thread
${campaign.socialThread.content}

---

## Email Teaser
${campaign.emailTeaser.content}
`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaign-${workflow?.id.slice(0, 8)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const allApproved = campaign?.blogPost.status === 'approved' &&
                       campaign?.socialThread.status === 'approved' &&
                       campaign?.emailTeaser.status === 'approved';

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 border-b border-gray-200/50 dark:border-gray-800/50 pb-4">
        <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
          <Download className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
          Export Center
        </h2>
      </div>

      <div className="space-y-6">
        {/* Full Campaign Download */}
        <button
          onClick={downloadCampaign}
          disabled={!campaign}
          className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg ${
            campaign
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white hover:-translate-y-1 shadow-blue-500/25'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
          }`}
        >
          <Download className="w-6 h-6" />
          Download Campaign Kit
        </button>

        {/* Individual Copy Buttons */}
        {campaign && (
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => copyToClipboard(campaign.blogPost.content, 'Blog post')}
              className="flex flex-col items-center gap-1 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-medium">Blog</span>
            </button>
            <button
              onClick={() => copyToClipboard(campaign.socialThread.content, 'Social thread')}
              className="flex flex-col items-center gap-1 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Share2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-xs font-medium">Social</span>
            </button>
            <button
              onClick={() => copyToClipboard(campaign.emailTeaser.content, 'Email teaser')}
              className="flex flex-col items-center gap-1 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Mail className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-medium">Email</span>
            </button>
          </div>
        )}

        {/* Status Summary */}
        {campaign && (
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Check className={`w-4 h-4 ${allApproved ? 'text-green-500' : 'text-gray-400'}`} />
              <span className="text-sm font-medium">
                {allApproved ? 'All content approved' : 'Content in review'}
              </span>
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <p>Blog: {campaign.blogPost.status}</p>
              <p>Social: {campaign.socialThread.status}</p>
              <p>Email: {campaign.emailTeaser.status}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
