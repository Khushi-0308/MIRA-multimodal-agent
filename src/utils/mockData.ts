import { ActionProposal, VerificationResult, ReasoningStep, AgentMetrics } from '../types/agent';
import { ContextCoreState } from '../types/context';
import { MultimodalMessage, DocumentItem, BoundingBox } from '../types/multimodal';

export const INITIAL_METRICS: AgentMetrics = {
  fps: 30,
  audioBitrateKbps: 64,
  sttLatencyMs: 120,
  reasoningLatencyMs: 380,
  ttsLatencyMs: 140,
  totalTokensUsed: 12450,
  activeContextTokens: 8200,
  connectionState: 'connected',
};

export const INITIAL_BOUNDING_BOXES: BoundingBox[] = [
  {
    id: 'box-1',
    label: 'Design System Notes',
    confidence: 0.98,
    box: [20, 25, 55, 75],
    category: 'text_block',
    color: '#f43f5e',
  },
  {
    id: 'box-2',
    label: 'Color Palette Swatches',
    confidence: 0.95,
    box: [60, 30, 85, 70],
    category: 'ui_element',
    color: '#818cf8',
  },
];

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-1',
    name: 'project_notes.pdf',
    size: 2450000,
    type: 'application/pdf',
    uploadedAt: '10 mins ago',
    tokenCount: 2400,
    status: 'ready',
    chunksCount: 8,
    summary: 'Project guidelines and ideas for MIRA real-time multimodal companion.',
    contentSnippet: 'Project Notes: Build a real-time multimodal companion that seamlessly hears, sees, and assists.',
  },
  {
    id: 'doc-2',
    name: 'screenshot.png',
    size: 1100000,
    type: 'image/png',
    uploadedAt: '2 mins ago',
    tokenCount: 850,
    status: 'ready',
    chunksCount: 2,
    summary: 'Workspace screenshot shared with MIRA for visual analysis.',
    contentSnippet: 'Image reference: UI layout and companion screen context.',
  },
];

export const SAMPLE_ACTION_PROPOSAL: ActionProposal = {
  id: 'act-101',
  toolName: 'create_summary_document',
  summary: 'Create Summary Note & Export Extracted Items',
  description: 'MIRA will summarize your active documents and format them into an organized note in your workspace.',
  parameters: {
    sourceDocuments: ['project_notes.pdf', 'screenshot.png'],
    destination: 'MIRA_Workspace/Summary.md',
    includeVisualHighlights: true,
  },
  isSensitive: true,
  riskLevel: 'medium',
  requiredPermissions: ['workspace:write'],
  impactStatement: 'This will save a new formatted summary file to your workspace.',
  reversibility: 'reversible',
  status: 'pending_approval',
  requestedAt: 'Just now',
};

export const SAMPLE_VERIFICATION: VerificationResult = {
  id: 'ver-101',
  actionId: 'act-101',
  passed: true,
  confidenceScore: 99.2,
  method: 'visual_grounding',
  summary: 'ContextCore verified all documents and confirmed workspace readiness.',
  details: [
    'Document contents successfully read and parsed',
    'Screen visual anchors match workspace target',
    'No sensitive system files touched',
  ],
  verifiedAt: '1 min ago',
};

export const INITIAL_CONTEXT_CORE: ContextCoreState = {
  version: '2.1.0',
  sessionId: 'mira-session-companion',
  modalities: {
    audio: {
      type: 'audio',
      label: 'Voice',
      active: true,
      statusText: 'Voice Ready',
      lastUpdated: 'Live',
      health: 'optimal',
      sampleRateOrFps: '16 kHz',
      dataThroughput: 'Ready',
    },
    vision: {
      type: 'vision',
      label: 'Vision',
      active: true,
      statusText: 'Vision Ready',
      lastUpdated: 'Live',
      health: 'optimal',
      sampleRateOrFps: 'Ready',
      dataThroughput: 'Ready',
    },
    screen: {
      type: 'screen',
      label: 'Screen',
      active: true,
      statusText: 'Screen Ready',
      lastUpdated: 'Live',
      health: 'optimal',
      sampleRateOrFps: 'Ready',
      dataThroughput: 'Ready',
    },
    documents: {
      type: 'documents',
      label: 'Documents',
      active: true,
      statusText: 'Documents Ready',
      lastUpdated: 'Live',
      health: 'optimal',
      sampleRateOrFps: '2 files',
      dataThroughput: 'Ready',
    },
    session: {
      type: 'session',
      label: 'Session',
      active: true,
      statusText: 'Session Active',
      lastUpdated: 'Live',
      health: 'optimal',
      sampleRateOrFps: 'Active',
      dataThroughput: 'Active',
    },
    environment: {
      type: 'environment',
      label: 'Environment',
      active: true,
      statusText: 'System Ready',
      lastUpdated: 'Live',
      health: 'optimal',
      sampleRateOrFps: 'Ready',
      dataThroughput: 'Ready',
    },
  },
  tokenBudget: {
    totalCapacity: 128000,
    usedTokens: 12450,
    breakdown: {
      systemPrompt: 1800,
      visionFeed: 3200,
      audioStream: 1400,
      documents: 3300,
      conversationHistory: 2200,
      toolScratchpad: 550,
    },
  },
  activeAnchors: [
    {
      id: 'anc-1',
      modality: 'vision',
      title: 'Current Screen Visuals',
      source: 'Screen context',
      summary: 'Observing your active workspace and design notes.',
      tokenWeight: 420,
      isPinned: true,
      timestamp: '2 mins ago',
    },
    {
      id: 'anc-2',
      modality: 'documents',
      title: 'Project Notes Reference',
      source: 'project_notes.pdf',
      summary: 'Indexed 8 key topics from your notes.',
      tokenWeight: 350,
      isPinned: true,
      timestamp: '10 mins ago',
    },
  ],
  environment: {
    os: 'Windows 11',
    browser: 'Chrome',
    activeApplication: 'MIRA Companion Workspace',
    screenResolution: '2560 x 1440',
    timezone: 'Local',
    networkLatencyMs: 18,
  },
  workingMemorySummary: 'MIRA is actively listening and observing. Ready to help you analyze visuals, summarize notes, or answer questions.',
  lastFuseEffectTimestamp: 'Just now',
};

export const INITIAL_MESSAGES: MultimodalMessage[] = [
  {
    id: 'msg-1',
    sender: 'user',
    timestamp: '11:42 AM',
    text: 'How can you help me with this screenshot?',
  },
  {
    id: 'msg-2',
    sender: 'mira',
    timestamp: '11:42 AM',
    text: "I can analyse what's on your screen, explain it, and help you take the next steps. You can also ask me to summarise, extract text, or perform an action.",
  },
  {
    id: 'msg-3',
    sender: 'user',
    timestamp: '11:43 AM',
    text: "Great! Let's get started.",
  },
];

export const INITIAL_REASONING_STEPS: ReasoningStep[] = [
  {
    id: 'step-1',
    stage: 'HEARS',
    title: 'Voice / Prompt Ingestion',
    thought: 'User greeted and asked for assistance with workspace screen.',
    timestamp: '11:42:01',
    durationMs: 120,
  },
  {
    id: 'step-2',
    stage: 'SEES',
    title: 'Visual Perception',
    thought: 'Identified active window layout and document chips.',
    timestamp: '11:42:02',
    durationMs: 90,
  },
  {
    id: 'step-3',
    stage: 'UNDERSTANDS',
    title: 'ContextCore Fusion',
    thought: 'Fused visual inputs with active session memory.',
    timestamp: '11:42:03',
    durationMs: 110,
  },
  {
    id: 'step-4',
    stage: 'REASONS',
    title: 'Action Planning',
    thought: 'Formulated friendly multi-step guidance.',
    timestamp: '11:42:04',
    durationMs: 130,
  },
  {
    id: 'step-5',
    stage: 'ACTS',
    title: 'Action Proposed',
    thought: 'Ready to summarize notes or extract text upon command.',
    timestamp: '11:42:05',
    durationMs: 80,
  },
  {
    id: 'step-6',
    stage: 'VERIFIES',
    title: 'Safety Check',
    thought: 'All guardrails verified. System ready.',
    timestamp: '11:42:06',
    durationMs: 75,
  },
];
