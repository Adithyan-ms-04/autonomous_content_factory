// Types for the Autonomous Content Factory

export interface SourceDocument {
  id: string;
  content: string;
  sourceUrl?: string;
  title?: string;
  uploadedAt: Date;
}

export interface FactSheet {
  id: string;
  sourceDocumentId: string;
  coreFeatures: string[];
  technicalSpecs: Record<string, string>;
  targetAudience: string;
  valueProposition: string;
  ambiguousStatements: string[];
  createdAt: Date;
}

export interface ContentPiece {
  id: string;
  type: 'blog' | 'social' | 'email';
  content: string;
  tone: string;
  status: 'draft' | 'approved' | 'rejected';
  rejectionReason?: string;
}

export interface CampaignOutput {
  id: string;
  factSheetId: string;
  blogPost: ContentPiece;
  socialThread: ContentPiece;
  emailTeaser: ContentPiece;
  status: 'generating' | 'reviewing' | 'completed';
  createdAt: Date;
}

export type AgentRole = 'researcher' | 'copywriter' | 'editor';

export type AgentState = 'idle' | 'thinking' | 'typing' | 'reviewing' | 'completed' | 'error';

export interface AgentMessage {
  id: string;
  from: AgentRole;
  to: AgentRole | 'user';
  message: string;
  timestamp: Date;
  type: 'info' | 'action' | 'correction' | 'approval' | 'rejection';
}

export interface AgentStatus {
  role: AgentRole;
  state: AgentState;
  currentTask?: string;
}

export interface CampaignWorkflow {
  id: string;
  sourceDocument: SourceDocument;
  factSheet?: FactSheet;
  campaign?: CampaignOutput;
  agentStatuses: AgentStatus[];
  messages: AgentMessage[];
  currentStep: 'upload' | 'research' | 'copywrite' | 'review' | 'complete';
  createdAt: Date;
  updatedAt: Date;
}

export interface ToneConfig {
  blog: 'professional' | 'casual' | 'technical';
  social: 'punchy' | 'engaging' | 'professional';
  email: 'formal' | 'friendly' | 'urgent';
}
