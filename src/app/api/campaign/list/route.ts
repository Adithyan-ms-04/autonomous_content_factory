import { NextResponse } from 'next/server';
import { getAllWorkflows } from '@/app/lib/store';

// GET /api/campaign/list - Return summary of all past campaigns
export async function GET() {
  try {
    const workflows = await getAllWorkflows();

    const summaries = workflows.map((wf) => ({
      id: wf.id,
      title: wf.sourceDocument.title || 'Untitled Campaign',
      currentStep: wf.currentStep,
      createdAt: wf.createdAt,
      updatedAt: wf.updatedAt,
      contentPreview: wf.sourceDocument.content.substring(0, 120) + (wf.sourceDocument.content.length > 120 ? '...' : ''),
      hasCampaign: !!wf.campaign,
    }));

    return NextResponse.json(summaries);
  } catch (error) {
    console.error('Error fetching campaign list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}
