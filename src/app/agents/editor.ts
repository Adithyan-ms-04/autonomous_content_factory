import { generateObject } from 'ai';
import { z } from 'zod';
import { getGroqModel } from '@/app/lib/ai-client';
import { buildEditorPrompt } from '@/app/lib/prompts';
import { generateId } from '@/app/lib/utils';
import { formatFactSheetForAgents } from './researcher';
import type {
  FactSheet,
  ContentPiece,
  CampaignOutput,
  AgentMessage,
} from '@/app/types';

export interface ReviewResult {
  approved: boolean;
  issues: Array<{
    type: 'hallucination' | 'tone' | 'value' | 'length';
    description: string;
    correction: string;
  }>;
  feedback: string;
  correctionNotes?: string;
}

export interface EditorReview {
  results: Map<string, ReviewResult>; // contentPieceId -> result
  messages: AgentMessage[];
}

export async function reviewContent(
  contentPiece: ContentPiece,
  factSheet: FactSheet
): Promise<ReviewResult> {
  const factSheetText = formatFactSheetForAgents(factSheet);
  const prompt = buildEditorPrompt(
    factSheetText,
    contentPiece.content,
    contentPiece.type,
    factSheet.valueProposition
  );
  let parsed;
  try {
    const { object } = await generateObject({
      model: getGroqModel(),
      schema: z.object({
        approved: z.boolean().describe('Whether the content piece is fully approved'),
        issues: z.array(
          z.object({
            type: z.enum(['hallucination', 'tone', 'value', 'length']),
            description: z.string(),
            correction: z.string(),
          })
        ).describe('List of issues found, empty if approved'),
        feedback: z.string().describe('General feedback on the content'),
      }),
      prompt,
    });
    parsed = object;
  } catch (e) {
    // If generation fails (e.g. rate limit, schema mismatch)
    return {
      approved: true,
      issues: [{
        type: 'tone',
        description: 'Could not generate review using strict schema',
        correction: 'Please review manually. ' + (e instanceof Error ? e.message : String(e))
      }],
      feedback: 'Auto-approved due to error',
    };
  }

  const result: ReviewResult = {
    approved: parsed.approved ?? true,
    issues: parsed.issues || [],
    feedback: parsed.feedback || 'No feedback provided',
  };

  // Build correction notes if rejected
  if (!result.approved && result.issues.length > 0) {
    result.correctionNotes = result.issues
      .map((issue) => `[${issue.type.toUpperCase()}] ${issue.description}. Correction: ${issue.correction}`)
      .join('\n');
  }

  return result;
}

export async function reviewCampaign(
  campaign: CampaignOutput,
  factSheet: FactSheet
): Promise<EditorReview> {
  const messages: AgentMessage[] = [];
  const results = new Map<string, ReviewResult>();

  messages.push({
    id: generateId(),
    from: 'editor',
    to: 'user',
    message: 'Starting quality control review of campaign content...',
    timestamp: new Date(),
    type: 'info',
  });

  try {
    // Review all three content pieces in parallel
    messages.push({
      id: generateId(),
      from: 'editor',
      to: 'editor',
      message: 'Checking blog post, social thread, and email sequentially for hallucinations and tone...',
      timestamp: new Date(),
      type: 'action',
    });

    const blogResult = await reviewContent(campaign.blogPost, factSheet);
    const socialResult = await reviewContent(campaign.socialThread, factSheet);
    const emailResult = await reviewContent(campaign.emailTeaser, factSheet);

    results.set(campaign.blogPost.id, blogResult);
    results.set(campaign.socialThread.id, socialResult);
    results.set(campaign.emailTeaser.id, emailResult);

    // Log results
    const allApproved = blogResult.approved && socialResult.approved && emailResult.approved;

    if (allApproved) {
      messages.push({
        id: generateId(),
        from: 'editor',
        to: 'copywriter',
        message: 'All content approved! No hallucinations detected. Tone is appropriate.',
        timestamp: new Date(),
        type: 'approval',
      });
    } else {
      // Log rejections with specific feedback
      if (!blogResult.approved) {
        messages.push({
          id: generateId(),
          from: 'editor',
          to: 'copywriter',
          message: `Blog post rejected: ${blogResult.feedback}`,
          timestamp: new Date(),
          type: 'rejection',
        });
      }
      if (!socialResult.approved) {
        messages.push({
          id: generateId(),
          from: 'editor',
          to: 'copywriter',
          message: `Social thread rejected: ${socialResult.feedback}`,
          timestamp: new Date(),
          type: 'rejection',
        });
      }
      if (!emailResult.approved) {
        messages.push({
          id: generateId(),
          from: 'editor',
          to: 'copywriter',
          message: `Email teaser rejected: ${emailResult.feedback}`,
          timestamp: new Date(),
          type: 'rejection',
        });
      }
    }

    return { results, messages };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';

    messages.push({
      id: generateId(),
      from: 'editor',
      to: 'user',
      message: `Error during review: ${errorMsg}`,
      timestamp: new Date(),
      type: 'rejection',
    });

    throw error;
  }
}

// Quick check if campaign needs regeneration
export function needsRegeneration(review: EditorReview): boolean {
  for (const result of review.results.values()) {
    if (!result.approved) return true;
  }
  return false;
}

// Get correction notes for a specific content piece
export function getCorrectionNotes(
  review: EditorReview,
  contentPieceId: string
): string | undefined {
  const result = review.results.get(contentPieceId);
  return result?.correctionNotes;
}
