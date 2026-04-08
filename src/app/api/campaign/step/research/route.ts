import { NextRequest, NextResponse } from 'next/server';
import { getWorkflow, updateWorkflowStep, setFactSheet, addAgentMessage, updateAgentStatus } from '@/app/lib/store';
import { extractFacts } from '@/app/agents/researcher';

export async function POST(request: NextRequest) {
  try {
    const { workflowId } = await request.json();
    if (!workflowId) return NextResponse.json({ error: 'Missing workflowId' }, { status: 400 });

    const workflow = await getWorkflow(workflowId);
    if (!workflow) return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });

    // Step 1: Research
    await updateWorkflowStep(workflowId, 'research');
    await updateAgentStatus(workflowId, {
      role: 'researcher',
      state: 'thinking',
      currentTask: 'Extracting facts from source',
    });

    try {
      const { factSheet, messages } = await extractFacts(workflow.sourceDocument);
      for (const msg of messages) await addAgentMessage(workflowId, msg);

      await setFactSheet(workflowId, factSheet);
      await updateAgentStatus(workflowId, { role: 'researcher', state: 'completed' });
      await updateWorkflowStep(workflowId, 'copywrite');

      return NextResponse.json({ success: true, factSheetId: factSheet.id });
    } catch (error) {
      console.error('Research error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await updateAgentStatus(workflowId, {
        role: 'researcher',
        state: 'error',
        currentTask: errorMessage,
      });
      return NextResponse.json({ error: 'Research failed', details: errorMessage }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
