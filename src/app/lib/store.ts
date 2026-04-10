// Prisma store for campaign workflows
import { prisma } from './prisma';
import type { CampaignWorkflow, AgentMessage, AgentStatus, SourceDocument, FactSheet, CampaignOutput, ContentPiece } from '@/app/types';
import { generateId } from './utils';

// In-memory store for language (not in Prisma schema)
const languageMap = new Map<string, string>();
const tonesMap = new Map<string, { blog: string; social: string; email: string }>();

export function setWorkflowLanguage(workflowId: string, language: string) {
  languageMap.set(workflowId, language);
}

export function getWorkflowLanguage(workflowId: string): string {
  return languageMap.get(workflowId) || 'en';
}

export function setWorkflowTones(workflowId: string, tones: { blog: string; social: string; email: string }) {
  tonesMap.set(workflowId, tones);
}

export function getWorkflowTones(workflowId: string): { blog: string; social: string; email: string } {
  return tonesMap.get(workflowId) || { blog: 'professional', social: 'punchy', email: 'formal' };
}

// Helper to map Prisma models to our TS interfaces
function mapPrismaToWorkflow(prismaWorkflow: any): CampaignWorkflow | undefined {
  if (!prismaWorkflow) return undefined;

  // Reconstruct factSheet
  let factSheet: FactSheet | undefined;
  if (prismaWorkflow.factSheet) {
    factSheet = {
      id: prismaWorkflow.factSheet.id,
      sourceDocumentId: prismaWorkflow.sourceDocumentId,
      coreFeatures: JSON.parse(prismaWorkflow.factSheet.coreFeatures),
      technicalSpecs: JSON.parse(prismaWorkflow.factSheet.technicalSpecs),
      targetAudience: prismaWorkflow.factSheet.targetAudience,
      valueProposition: prismaWorkflow.factSheet.valueProposition,
      ambiguousStatements: JSON.parse(prismaWorkflow.factSheet.ambiguousStatements),
      createdAt: prismaWorkflow.factSheet.createdAt,
    };
  }

  // Reconstruct campaign output
  let campaign: CampaignOutput | undefined;
  if (prismaWorkflow.campaign) {
    const pieces = prismaWorkflow.campaign.contentPieces;
    campaign = {
      id: prismaWorkflow.campaign.id,
      factSheetId: prismaWorkflow.factSheet?.id || '',
      blogPost: pieces.find((p: any) => p.type === 'blog') as ContentPiece,
      socialThread: pieces.find((p: any) => p.type === 'social') as ContentPiece,
      emailTeaser: pieces.find((p: any) => p.type === 'email') as ContentPiece,
      status: prismaWorkflow.campaign.status as any,
      createdAt: prismaWorkflow.campaign.createdAt,
    };
  }

  return {
    id: prismaWorkflow.id,
    sourceDocument: {
      id: prismaWorkflow.sourceDocument.id,
      content: prismaWorkflow.sourceDocument.content,
      sourceUrl: prismaWorkflow.sourceDocument.sourceUrl || undefined,
      title: prismaWorkflow.sourceDocument.title || undefined,
      uploadedAt: prismaWorkflow.sourceDocument.uploadedAt,
    },
    factSheet,
    campaign,
    agentStatuses: prismaWorkflow.agentStatuses.map((s: any) => ({
      role: s.role,
      state: s.state,
      currentTask: s.currentTask || undefined,
    })),
    messages: prismaWorkflow.messages.map((m: any) => ({
      id: m.id,
      from: m.from,
      to: m.to,
      message: m.message,
      timestamp: m.timestamp,
      type: m.type,
    })),
    currentStep: prismaWorkflow.currentStep as any,
    language: languageMap.get(prismaWorkflow.id) || 'en',
    createdAt: prismaWorkflow.createdAt,
    updatedAt: prismaWorkflow.updatedAt,
  };
}

export async function getWorkflow(id: string): Promise<CampaignWorkflow | undefined> {
  const workflow = await prisma.campaignWorkflow.findUnique({
    where: { id },
    include: {
      sourceDocument: true,
      factSheet: true,
      campaign: { include: { contentPieces: true } },
      agentStatuses: true,
      messages: { orderBy: { timestamp: 'asc' } },
    },
  });
  return mapPrismaToWorkflow(workflow);
}

export async function setWorkflow(workflow: CampaignWorkflow): Promise<void> {
  await prisma.campaignWorkflow.create({
    data: {
      id: workflow.id,
      currentStep: workflow.currentStep,
      sourceDocument: {
        create: {
          id: workflow.sourceDocument.id,
          content: workflow.sourceDocument.content,
          sourceUrl: workflow.sourceDocument.sourceUrl,
          title: workflow.sourceDocument.title,
        },
      },
      agentStatuses: {
        create: workflow.agentStatuses.map(s => ({
          role: s.role,
          state: s.state,
          currentTask: s.currentTask,
        }))
      }
    },
  });
}

export async function updateWorkflowStep(id: string, step: string): Promise<void> {
  await prisma.campaignWorkflow.update({
    where: { id },
    data: { currentStep: step },
  });
}

export async function setFactSheet(workflowId: string, factSheet: FactSheet): Promise<void> {
  await prisma.factSheet.create({
    data: {
      id: factSheet.id,
      workflowId,
      coreFeatures: JSON.stringify(factSheet.coreFeatures),
      technicalSpecs: JSON.stringify(factSheet.technicalSpecs),
      targetAudience: factSheet.targetAudience,
      valueProposition: factSheet.valueProposition,
      ambiguousStatements: JSON.stringify(factSheet.ambiguousStatements),
    },
  });
}

export async function setCampaignOutput(workflowId: string, campaign: CampaignOutput): Promise<void> {
  await prisma.campaignOutput.upsert({
    where: { workflowId },
    create: {
      id: campaign.id,
      workflowId,
      status: campaign.status,
      contentPieces: {
        create: [campaign.blogPost, campaign.socialThread, campaign.emailTeaser].map(p => ({
          id: p.id,
          type: p.type,
          content: p.content,
          tone: p.tone,
          status: p.status,
          rejectionReason: p.rejectionReason,
        })),
      },
    },
    update: {
      status: campaign.status,
    }
  });
}

export async function updateContentPiece(pieceId: string, data: Partial<ContentPiece>): Promise<void> {
  await prisma.contentPiece.update({
    where: { id: pieceId },
    data: {
      status: data.status,
      content: data.content,
      rejectionReason: data.rejectionReason,
    },
  });
}

export async function addAgentMessage(workflowId: string, message: AgentMessage): Promise<void> {
  await prisma.agentMessage.create({
    data: {
      id: message.id,
      workflowId,
      from: message.from,
      to: message.to,
      message: message.message,
      type: message.type,
      timestamp: message.timestamp,
    },
  });
}

export async function updateAgentStatus(workflowId: string, status: AgentStatus): Promise<void> {
  await prisma.agentStatus.upsert({
    where: {
      workflowId_role: {
        workflowId,
        role: status.role,
      },
    },
    update: {
      state: status.state,
      currentTask: status.currentTask || null,
    },
    create: {
      workflowId,
      role: status.role,
      state: status.state,
      currentTask: status.currentTask,
    },
  });
}

export async function getAllWorkflows(): Promise<CampaignWorkflow[]> {
  const workflows = await prisma.campaignWorkflow.findMany({
    include: {
      sourceDocument: true,
      factSheet: true,
      campaign: { include: { contentPieces: true } },
      agentStatuses: true,
      messages: { orderBy: { timestamp: 'asc' } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return workflows.map(mapPrismaToWorkflow).filter((w): w is CampaignWorkflow => w !== undefined);
}
