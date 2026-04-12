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

export type AgentRole = 'researcher' | 'copywriter' | 'editor' | 'scraper';

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
  currentStep: 'upload' | 'scrape' | 'research' | 'copywrite' | 'review' | 'complete';
  createdAt: Date;
  updatedAt: Date;
  // Feature 7: Campaign Tags
  tags?: string[];
  // Feature 8: Multi-language
  language?: string;
  // Feature 9: Content Tones
  tones?: ToneConfig;
}

export interface ToneConfig {
  blog: string;
  social: string;
  email: string;
}

/** Feature 2: Content analytics */
export interface ContentAnalytics {
  wordCount: number;
  charCount: number;
  readingTimeMinutes: number;
  readingLevel: string;
  fleschScore: number;
  sentenceCount: number;
  avgWordsPerSentence: number;
  topKeywords: { word: string; count: number }[];
}

/** Feature 6: Calendar schedule item */
export interface ScheduleItem {
  type: 'blog' | 'social' | 'email';
  label: string;
  dayOffset: number;
  dayName: string;
  date: string;
  color: string;
}

/** Feature 3: A/B variant */
export interface ContentVariant {
  tone: string;
  content: string;
}

/** Supported output languages */
export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'hi', label: 'Hindi' },
  { code: 'ja', label: 'Japanese' },
  { code: 'zh', label: 'Chinese' },
  { code: 'ar', label: 'Arabic' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'ko', label: 'Korean' },
] as const;
