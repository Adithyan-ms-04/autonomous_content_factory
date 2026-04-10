import { NextRequest, NextResponse } from 'next/server';
import { getWorkflow, addAgentMessage, updateAgentStatus, updateWorkflowStep } from '@/app/lib/store';
import { scrapeUrl } from '@/app/agents/scraper';

export async function POST(request: NextRequest) {
  try {
    const { workflowId } = await request.json();
    if (!workflowId) return NextResponse.json({ error: 'Missing workflowId' }, { status: 400 });

    const workflow = await getWorkflow(workflowId);
    if (!workflow) return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });

    const sourceUrl = workflow.sourceDocument.sourceUrl;
    if (!sourceUrl) {
      // No URL to scrape — skip this step
      return NextResponse.json({ success: true, skipped: true });
    }

    await updateWorkflowStep(workflowId, 'scrape');
    await updateAgentStatus(workflowId, {
      role: 'scraper',
      state: 'thinking',
      currentTask: `Scraping ${sourceUrl}`,
    });

    try {
      const { extractedContent, messages } = await scrapeUrl(sourceUrl);
      for (const msg of messages) await addAgentMessage(workflowId, msg);

      await updateAgentStatus(workflowId, { role: 'scraper', state: 'completed' });

      // Return the scraped content to be appended to the source
      return NextResponse.json({ success: true, extractedContent });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await updateAgentStatus(workflowId, {
        role: 'scraper',
        state: 'error',
        currentTask: errorMessage,
      });
      // Non-fatal: return success with error flag so the pipeline continues
      return NextResponse.json({ success: true, skipped: true, reason: errorMessage });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
