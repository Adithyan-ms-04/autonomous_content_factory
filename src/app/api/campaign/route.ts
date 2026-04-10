import { NextRequest, NextResponse } from 'next/server';
import { generateWithAI } from '@/app/lib/ai-client';
import {
  getWorkflow,
  setWorkflow,
  addAgentMessage,
  updateAgentStatus,
  updateWorkflowStep,
  setCampaignOutput,
  updateContentPiece,
  setWorkflowLanguage,
  setWorkflowTones,
} from '@/app/lib/store';
import { regenerateContent } from '@/app/agents/copywriter';
import { reviewCampaign, getCorrectionNotes } from '@/app/agents/editor';
import { generateId } from '@/app/lib/utils';
import { checkRateLimit, CAMPAIGN_RATE_LIMIT, MAX_REQUEST_BODY_SIZE } from '@/app/lib/rate-limit';
import type {
  SourceDocument,
  CampaignWorkflow,
} from '@/app/types';

// POST /api/campaign - Create new campaign workflow state
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateLimitResult = checkRateLimit(clientIp, CAMPAIGN_RATE_LIMIT);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait before creating another campaign.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(rateLimitResult.resetMs / 1000)),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    // Request body size validation
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_REQUEST_BODY_SIZE) {
      return NextResponse.json(
        { error: 'Request body too large. Maximum size is 500 KB.' },
        { status: 413 }
      );
    }

    const body = await request.json();
    const { content, sourceUrl, title, language, tones } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Validation to prevent gibberish using the LLM for high accuracy
    if (content.trim().length < 20) {
      return NextResponse.json(
        { error: 'Source material is too short to generate a meaningful campaign. Please provide proper text or a link.' },
        { status: 400 }
      );
    }

    try {
      // Fast check for gibberish vs valid source material
      const prompt = `Determine if the following text is meaningful source material (like an article, notes, or product details) or just random keyboard mashes/spam gibberish. If it is meaningful, output strictly "VALID". If it is random keys or gibberish (e.g. "asdfasdf", "test test test"), strictly output "GIBBERISH". Do not output anything else.

Text: ${content.substring(0, 800)}`;
      
      const validationResponse = await generateWithAI(prompt);
      if (validationResponse.toUpperCase().includes('GIBBERISH')) {
        return NextResponse.json(
          { error: 'Input was detected as gibberish. Please provide meaningful information so our agents can draft a powerful campaign.' },
          { status: 400 }
        );
      }
    } catch (e) {
      console.warn('Content validation skipped due to AI client error:', e);
    }

    // Create source document
    const sourceDocument: SourceDocument = {
      id: generateId(),
      content,
      sourceUrl: sourceUrl || undefined,
      title: title || undefined,
      uploadedAt: new Date(),
    };

    // Initialize workflow
    const workflow: CampaignWorkflow = {
      id: generateId(),
      sourceDocument,
      agentStatuses: [
        { role: 'researcher', state: 'idle' },
        { role: 'copywriter', state: 'idle' },
        { role: 'editor', state: 'idle' },
      ],
      messages: [],
      currentStep: 'upload',
      language: language || 'en',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setWorkflow(workflow);
    setWorkflowLanguage(workflow.id, language || 'en');
    if (tones) setWorkflowTones(workflow.id, tones);

    return NextResponse.json({
      workflowId: workflow.id,
      status: 'started',
      message: 'Campaign state configured. Ready to begin workflow.',
    });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}

// GET /api/campaign?id={workflowId} - Get campaign status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: 'Campaign ID is required' },
      { status: 400 }
    );
  }

  const workflow = await getWorkflow(id);

  if (!workflow) {
    return NextResponse.json(
      { error: 'Campaign not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(workflow);
}

// PUT /api/campaign - Update/regenerate content
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { workflowId, contentPieceId, correctionNotes, skipReview } = body;

    if (!workflowId || !contentPieceId) {
      return NextResponse.json(
        { error: 'Workflow ID and Content Piece ID are required' },
        { status: 400 }
      );
    }

    const workflow = await getWorkflow(workflowId);
    if (!workflow || !workflow.campaign || !workflow.factSheet) {
      return NextResponse.json(
        { error: 'Campaign not found or not ready for regeneration' },
        { status: 404 }
      );
    }

    // Find the content piece
    let contentPiece;
    if (workflow.campaign.blogPost.id === contentPieceId) {
      contentPiece = workflow.campaign.blogPost;
    } else if (workflow.campaign.socialThread.id === contentPieceId) {
      contentPiece = workflow.campaign.socialThread;
    } else if (workflow.campaign.emailTeaser.id === contentPieceId) {
      contentPiece = workflow.campaign.emailTeaser;
    }

    if (!contentPiece) {
      return NextResponse.json(
        { error: 'Content piece not found' },
        { status: 404 }
      );
    }

    // Update status
    await updateAgentStatus(workflowId, {
      role: 'copywriter',
      state: 'typing',
      currentTask: `Regenerating ${contentPiece.type} content`,
    });
    await updateWorkflowStep(workflowId, 'review');

    // Regenerate content
    const { content, messages } = await regenerateContent(
      contentPiece,
      workflow.factSheet,
      correctionNotes || 'General improvement requested',
      workflow.language
    );

    // Update messages
    for (const msg of messages) await addAgentMessage(workflowId, msg);

    // Update content piece locally before passing to review
    contentPiece.content = content;
    contentPiece.status = 'draft';

    await updateContentPiece(contentPieceId, { content, status: 'draft' });

    // Update campaign status
    const updatedCampaign = { ...workflow.campaign, status: 'reviewing' as const };
    await setCampaignOutput(workflowId, updatedCampaign);

    if (skipReview) {
      await updateAgentStatus(workflowId, { role: 'copywriter', state: 'completed' });
      const updatedWorkflow = await getWorkflow(workflowId);
      return NextResponse.json({
        success: true,
        workflow: updatedWorkflow,
      });
    }

    // Re-run editor review
    await updateAgentStatus(workflowId, {
      role: 'editor',
      state: 'reviewing',
      currentTask: 'Reviewing regenerated content',
    });

    const review = await reviewCampaign(updatedCampaign, workflow.factSheet);
    for (const msg of review.messages) await addAgentMessage(workflowId, msg);

    // Update content status based on review
    const reviewResult = review.results.get(contentPieceId);
    if (reviewResult) {
      const isApproved = reviewResult.approved ? 'approved' : 'rejected';
      await updateContentPiece(contentPieceId, {
        status: isApproved,
        rejectionReason: !reviewResult.approved ? reviewResult.correctionNotes : undefined
      });
    }

    await updateAgentStatus(workflowId, { role: 'editor', state: 'completed' });
    await updateAgentStatus(workflowId, { role: 'copywriter', state: 'completed' });
    await updateWorkflowStep(workflowId, 'complete');

    const updatedWorkflow = await getWorkflow(workflowId);

    return NextResponse.json({
      success: true,
      workflow: updatedWorkflow,
    });
  } catch (error) {
    console.error('Error regenerating content:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate content' },
      { status: 500 }
    );
  }
}
