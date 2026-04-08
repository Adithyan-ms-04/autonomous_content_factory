// Copywriter Agent - The "Voice"
import { generateWithAI } from '@/app/lib/ai-client';
import { buildCopywriterPrompt } from '@/app/lib/prompts';
import { generateId } from '@/app/lib/utils';
import { formatFactSheetForAgents } from './researcher';
import type {
  FactSheet,
  ContentPiece,
  CampaignOutput,
  AgentMessage,
  ToneConfig,
} from '@/app/types';

export interface CopywriterResult {
  campaign: CampaignOutput;
  messages: AgentMessage[];
}

const DEFAULT_TONES: ToneConfig = {
  blog: 'professional',
  social: 'punchy',
  email: 'formal',
};

export async function generateContent(
  factSheet: FactSheet,
  tones: Partial<ToneConfig> = {}
): Promise<CopywriterResult> {
  const mergedTones = { ...DEFAULT_TONES, ...tones };
  const messages: AgentMessage[] = [];
  const factSheetText = formatFactSheetForAgents(factSheet);

  messages.push({
    id: generateId(),
    from: 'copywriter',
    to: 'user',
    message: `Starting content generation. Received fact sheet with ${factSheet.coreFeatures.length} features.`,
    timestamp: new Date(),
    type: 'info',
  });

  try {
    // Generate all three content pieces in parallel
    messages.push({
      id: generateId(),
      from: 'copywriter',
      to: 'copywriter',
      message:
        'Generating blog post, social thread, and email sequentially to respect API limits...',
      timestamp: new Date(),
      type: 'action',
    });

    const blogResult = await generateBlogPost(factSheetText, factSheet.valueProposition, mergedTones.blog);
    const socialResult = await generateSocialThread(factSheetText, factSheet.valueProposition, mergedTones.social);
    const emailResult = await generateEmailTeaser(factSheetText, factSheet.valueProposition, mergedTones.email);

    const blogPost: ContentPiece = {
      id: generateId(),
      type: 'blog',
      content: blogResult,
      tone: mergedTones.blog,
      status: 'draft',
    };

    const socialThread: ContentPiece = {
      id: generateId(),
      type: 'social',
      content: socialResult,
      tone: mergedTones.social,
      status: 'draft',
    };

    const emailTeaser: ContentPiece = {
      id: generateId(),
      type: 'email',
      content: emailResult,
      tone: mergedTones.email,
      status: 'draft',
    };

    const campaign: CampaignOutput = {
      id: generateId(),
      factSheetId: factSheet.id,
      blogPost,
      socialThread,
      emailTeaser,
      status: 'generating',
      createdAt: new Date(),
    };

    messages.push({
      id: generateId(),
      from: 'copywriter',
      to: 'editor',
      message:
        'Campaign content generated. Blog (~500 words), social thread (5 posts), and email teaser ready for review.',
      timestamp: new Date(),
      type: 'info',
    });

    return { campaign, messages };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';

    messages.push({
      id: generateId(),
      from: 'copywriter',
      to: 'user',
      message: `Error generating content: ${errorMsg}`,
      timestamp: new Date(),
      type: 'rejection',
    });

    throw error;
  }
}

async function generateBlogPost(
  factSheetText: string,
  valueProposition: string,
  tone: string
): Promise<string> {
  const prompt = buildCopywriterPrompt(factSheetText, valueProposition, tone, 'blog');
  return generateWithAI(prompt, 2000);
}

async function generateSocialThread(
  factSheetText: string,
  valueProposition: string,
  tone: string
): Promise<string> {
  const prompt = buildCopywriterPrompt(factSheetText, valueProposition, tone, 'social');
  return generateWithAI(prompt, 1500);
}

async function generateEmailTeaser(
  factSheetText: string,
  valueProposition: string,
  tone: string
): Promise<string> {
  const prompt = buildCopywriterPrompt(factSheetText, valueProposition, tone, 'email');
  return generateWithAI(prompt, 800);
}

// Regenerate a specific content piece with corrections
export async function regenerateContent(
  contentPiece: ContentPiece,
  factSheet: FactSheet,
  correctionNotes: string
): Promise<{ content: string; messages: AgentMessage[] }> {
  const messages: AgentMessage[] = [];
  const factSheetText = formatFactSheetForAgents(factSheet);

  messages.push({
    id: generateId(),
    from: 'copywriter',
    to: 'copywriter',
    message: `Regenerating ${contentPiece.type} content with corrections: ${correctionNotes}`,
    timestamp: new Date(),
    type: 'action',
  });

  const tone = contentPiece.tone;
  const prompt = buildCopywriterPrompt(
    factSheetText + '\n\n## Correction Notes:\n' + correctionNotes,
    factSheet.valueProposition,
    tone,
    contentPiece.type
  );

  const newContent = await generateWithAI(prompt, 2000);

  messages.push({
    id: generateId(),
    from: 'copywriter',
    to: 'editor',
    message: `${contentPiece.type} content regenerated with corrections applied.`,
    timestamp: new Date(),
    type: 'info',
  });

  return { content: newContent, messages };
}
