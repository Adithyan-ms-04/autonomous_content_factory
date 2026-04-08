import { NextRequest, NextResponse } from 'next/server';
import { getWorkflow, updateWorkflowStep, setCampaignOutput, addAgentMessage, updateAgentStatus } from '@/app/lib/store';
import { generateContent } from '@/app/agents/copywriter';

export async function POST(request: NextRequest) {
  try {
    const { workflowId } = await request.json();
    if (!workflowId) return NextResponse.json({ error: 'Missing workflowId' }, { status: 400 });

    const workflow = await getWorkflow(workflowId);
    if (!workflow || !workflow.factSheet) {
      return NextResponse.json({ error: 'Workflow or FactSheet not found' }, { status: 404 });
    }

    // Step 2: Copywrite
    await updateWorkflowStep(workflowId, 'copywrite');
    await updateAgentStatus(workflowId, {
      role: 'copywriter',
      state: 'typing',
      currentTask: 'Generating multi-format content',
    });

    try {
      const { campaign, messages } = await generateContent(workflow.factSheet);
      for (const msg of messages) await addAgentMessage(workflowId, msg);

      await setCampaignOutput(workflowId, campaign);
      await updateAgentStatus(workflowId, { role: 'copywriter', state: 'completed' });
      await updateWorkflowStep(workflowId, 'review');

      return NextResponse.json({ success: true, campaignId: campaign.id });
    } catch (error) {
      console.error('Copywrite error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await updateAgentStatus(workflowId, {
        role: 'copywriter',
        state: 'error',
        currentTask: errorMessage,
      });
      return NextResponse.json({ error: 'Copywrite failed', details: errorMessage }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
