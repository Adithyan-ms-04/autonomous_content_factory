import { NextRequest } from 'next/server';
import { getWorkflow } from '@/app/lib/store';

/**
 * GET /api/campaign/stream?id={workflowId}
 * Server-Sent Events (SSE) endpoint for real-time workflow updates.
 * Pushes the current workflow state whenever it changes, or every 2 seconds.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Campaign ID is required', { status: 400 });
  }

  const encoder = new TextEncoder();
  let lastJson = '';
  let isClosed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: string) => {
        if (isClosed) return;
        try {
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        } catch {
          isClosed = true;
        }
      };

      const poll = async () => {
        if (isClosed) return;

        try {
          const workflow = await getWorkflow(id);
          if (!workflow) {
            sendEvent(JSON.stringify({ error: 'Campaign not found' }));
            controller.close();
            isClosed = true;
            return;
          }

          const json = JSON.stringify(workflow);

          // Only send if data actually changed
          if (json !== lastJson) {
            lastJson = json;
            sendEvent(json);
          }

          // Stop streaming when campaign is complete
          if (workflow.currentStep === 'complete') {
            // Send one final update and close
            setTimeout(() => {
              if (!isClosed) {
                controller.close();
                isClosed = true;
              }
            }, 1000);
            return;
          }
        } catch {
          // Continue polling even on transient errors
        }

        // Poll every 2 seconds
        if (!isClosed) {
          setTimeout(poll, 2000);
        }
      };

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        isClosed = true;
        try {
          controller.close();
        } catch {
          // Already closed
        }
      });

      // Start polling
      poll();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
