import { generateObject } from 'ai';
import { z } from 'zod';
import { getGroqModel } from '@/app/lib/ai-client';
import { buildResearcherPrompt } from '@/app/lib/prompts';
import { generateId } from '@/app/lib/utils';
import type { FactSheet, SourceDocument, AgentMessage } from '@/app/types';

// Check API key on module load
if (!process.env.GROQ_API_KEY) {
  console.error('ERROR: GROQ_API_KEY is not set!');
}

export interface ResearcherResult {
  factSheet: FactSheet;
  messages: AgentMessage[];
}

export async function extractFacts(
  sourceDocument: SourceDocument
): Promise<ResearcherResult> {
  const messages: AgentMessage[] = [];

  // Log start
  messages.push({
    id: generateId(),
    from: 'researcher',
    to: 'user',
    message: `Starting fact extraction from source document: ${sourceDocument.title || 'Untitled'}`,
    timestamp: new Date(),
    type: 'info',
  });

  try {
    // Build prompt
    const prompt = buildResearcherPrompt(sourceDocument.content);

    messages.push({
      id: generateId(),
      from: 'researcher',
      to: 'researcher',
      message: 'Analyzing source material for key facts and specifications...',
      timestamp: new Date(),
      type: 'action',
    });

    // Generate fact sheet using structured outputs
    const { object: parsed } = await generateObject({
      model: getGroqModel(),
      schema: z.object({
        coreFeatures: z.array(z.string()).describe('List of key features or capabilities'),
        technicalSpecs: z.array(
          z.object({
            key: z.string(),
            value: z.string(),
          })
        ).describe('List of technical specifications as key-value pairs'),
        targetAudience: z.string().describe('The intended primary audience'),
        valueProposition: z.string().describe('The main value proposition'),
        ambiguousStatements: z.array(z.string()).describe('Any vague, contradictory, or marketing-fluff statements found in the source text that need clarification'),
      }),
      prompt,
    });

    const specRecord: Record<string, string> = {};
    if (parsed.technicalSpecs) {
      parsed.technicalSpecs.forEach((spec) => {
        specRecord[spec.key] = spec.value;
      });
    }

    const factSheet: FactSheet = {
      id: generateId(),
      sourceDocumentId: sourceDocument.id,
      coreFeatures: parsed.coreFeatures || [],
      technicalSpecs: specRecord,
      targetAudience: parsed.targetAudience || 'NOT_SPECIFIED',
      valueProposition: parsed.valueProposition || 'NOT_SPECIFIED',
      ambiguousStatements: parsed.ambiguousStatements || [],
      createdAt: new Date(),
    };

    // Log completion
    messages.push({
      id: generateId(),
      from: 'researcher',
      to: 'user',
      message: `Fact sheet created. Found ${factSheet.coreFeatures.length} features, ${Object.keys(factSheet.technicalSpecs).length} specs. ${factSheet.ambiguousStatements.length} ambiguous statements flagged.`,
      timestamp: new Date(),
      type: 'approval',
    });

    // Warn about ambiguities
    if (factSheet.ambiguousStatements.length > 0) {
      messages.push({
        id: generateId(),
        from: 'researcher',
        to: 'copywriter',
        message: `Warning: ${factSheet.ambiguousStatements.length} statements need clarification. Proceed with caution.`,
        timestamp: new Date(),
        type: 'info',
      });
    }

    return { factSheet, messages };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';

    messages.push({
      id: generateId(),
      from: 'researcher',
      to: 'user',
      message: `Error during fact extraction: ${errorMsg}`,
      timestamp: new Date(),
      type: 'rejection',
    });

    throw error;
  }
}

// Utility to format fact sheet as markdown for other agents
export function formatFactSheetForAgents(factSheet: FactSheet): string {
  return `# Fact Sheet (Source of Truth)

## Value Proposition
${factSheet.valueProposition}

## Target Audience
${factSheet.targetAudience}

## Core Features
${factSheet.coreFeatures.map((f) => `- ${f}`).join('\n')}

## Technical Specifications
${Object.entries(factSheet.technicalSpecs)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join('\n')}

## Ambiguities to Note
${factSheet.ambiguousStatements.length > 0
  ? factSheet.ambiguousStatements.map((a) => `- ${a}`).join('\n')
  : 'None identified'}
`;
}
