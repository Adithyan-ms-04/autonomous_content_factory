import { NextRequest, NextResponse } from 'next/server';
import { getWorkflow, updateWorkflowStep, updateContentPiece, setCampaignOutput, addAgentMessage, updateAgentStatus } from '@/app/lib/store';
import { reviewCampaign, needsRegeneration, getCorrectionNotes } from '@/app/agents/editor';

export async function POST(request: NextRequest) {
  try {
    const { workflowId } = await request.json();
    if (!workflowId) return NextResponse.json({ error: 'Missing workflowId' }, { status: 400 });

    const workflow = await getWorkflow(workflowId);
    if (!workflow || !workflow.campaign || !workflow.factSheet) {
      return NextResponse.json({ error: 'Workflow data incomplete' }, { status: 404 });
    }

    // Step 3: Review
    await updateWorkflowStep(workflowId, 'review');
    await updateAgentStatus(workflowId, {
      role: 'editor',
      state: 'reviewing',
      currentTask: 'Validating content against facts',
    });

    try {
      const review = await reviewCampaign(workflow.campaign, workflow.factSheet);
      for (const msg of review.messages) await addAgentMessage(workflowId, msg);

      const allApproved = !needsRegeneration(review);

      // Update individual content piece statuses in DB
      const blogStatus = review.results.get(workflow.campaign.blogPost.id)?.approved ? 'approved' : 'rejected';
      const socialStatus = review.results.get(workflow.campaign.socialThread.id)?.approved ? 'approved' : 'rejected';
      const emailStatus = review.results.get(workflow.campaign.emailTeaser.id)?.approved ? 'approved' : 'rejected';

      await updateContentPiece(workflow.campaign.blogPost.id, {
        status: blogStatus,
        rejectionReason: getCorrectionNotes(review, workflow.campaign.blogPost.id)
      });
      await updateContentPiece(workflow.campaign.socialThread.id, {
        status: socialStatus,
        rejectionReason: getCorrectionNotes(review, workflow.campaign.socialThread.id)
      });
      await updateContentPiece(workflow.campaign.emailTeaser.id, {
        status: emailStatus,
        rejectionReason: getCorrectionNotes(review, workflow.campaign.emailTeaser.id)
      });

      // Update Campaign overall status
      const campaignOutput = workflow.campaign;
      campaignOutput.status = allApproved ? 'completed' : 'reviewing';
      await setCampaignOutput(workflowId, campaignOutput);

      await updateAgentStatus(workflowId, { role: 'editor', state: 'completed' });
      await updateWorkflowStep(workflowId, allApproved ? 'complete' : 'review');

      return NextResponse.json({ success: true, allApproved });
    } catch (error) {
      console.error('Review error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await updateAgentStatus(workflowId, {
        role: 'editor',
        state: 'error',
        currentTask: errorMessage,
      });
      return NextResponse.json({ error: 'Review failed', details: errorMessage }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
