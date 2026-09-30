import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  AgentState,
  LoopStage,
  ActionProposal,
  VerificationResult,
  ReasoningStep,
  AgentMetrics,
  MiraThemeId,
  MascotAccessory,
} from '../types/agent';
import { ContextCoreState, ContextAnchor } from '../types/context';
import {
  MultimodalMessage,
  DocumentItem,
  BoundingBox,
  VisionFeedState,
  AudioStreamState,
} from '../types/multimodal';
import {
  INITIAL_METRICS,
  INITIAL_BOUNDING_BOXES,
  INITIAL_DOCUMENTS,
  SAMPLE_ACTION_PROPOSAL,
  SAMPLE_VERIFICATION,
  INITIAL_CONTEXT_CORE,
  INITIAL_MESSAGES,
  INITIAL_REASONING_STEPS,
} from '../utils/mockData';
import { AudioVisualizerController } from '../utils/audio';
import { getSavedTheme, saveTheme, getSavedAccessory, saveAccessory } from '../utils/themeConfig';

interface MiraContextType {
  // Theme & Personalization (Gen-Z Studio)
  theme: MiraThemeId;
  setTheme: (theme: MiraThemeId) => void;
  mascotAccessory: MascotAccessory;
  setMascotAccessory: (acc: MascotAccessory) => void;
  isStudioOpen: boolean;
  setIsStudioOpen: (open: boolean) => void;

  // Agent State (10 states)
  agentState: AgentState;
  setAgentState: (state: AgentState) => void;
  loopStage: LoopStage;
  setLoopStage: (stage: LoopStage) => void;
  metrics: AgentMetrics;
  updateMetrics: (partial: Partial<AgentMetrics>) => void;

  // Reasoning & Action
  reasoningSteps: ReasoningStep[];
  addReasoningStep: (step: ReasoningStep) => void;
  currentActionProposal: ActionProposal | null;
  approveAction: (actionId: string, notes?: string) => void;
  rejectAction: (actionId: string, reason: string) => void;
  verificationResult: VerificationResult | null;
  resetActionDemo: () => void;

  // ContextCore
  contextCore: ContextCoreState;
  addAnchor: (anchor: Omit<ContextAnchor, 'id' | 'timestamp'>) => void;
  removeAnchor: (id: string) => void;
  togglePinAnchor: (id: string) => void;

  // Multimodal Conversation
  messages: MultimodalMessage[];
  sendMessage: (text: string, attachments?: { images?: string[]; documents?: string[] }) => void;
  simulateSpeechInput: (transcriptText: string) => void;

  // Vision
  visionFeed: VisionFeedState;
  setVisionSource: (source: 'camera' | 'screen' | 'synthetic_test' | 'paused') => void;
  captureSnapshot: () => string;
  addBoundingBox: (box: BoundingBox) => void;
  clearBoundingBoxes: () => void;

  // Audio & Voice
  audioStream: AudioStreamState;
  toggleListening: () => Promise<void>;
  toggleMute: () => void;
  setSpeechRate: (rate: number) => void;

  // Documents
  documents: DocumentItem[];
  addDocument: (doc: File) => void;
  removeDocument: (id: string) => void;
  selectedDocForPreview: DocumentItem | null;
  setSelectedDocForPreview: (doc: DocumentItem | null) => void;

  // Developer Mode / Advanced View Toggle
  devMode: boolean;
  setDevMode: (dev: boolean) => void;

  // Active Navigation Tab (Home, Chat, Vision, Documents, Actions)
  activeNavTab: string;
  setActiveNavTab: (tab: string) => void;

  // UI Spatial View Modes
  activeWorkspaceView: 'spatial' | 'focus-vision' | 'focus-chat' | 'focus-context';
  setActiveWorkspaceView: (view: 'spatial' | 'focus-vision' | 'focus-chat' | 'focus-context') => void;
}

const MiraContext = createContext<MiraContextType | undefined>(undefined);

export const MiraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme & Studio Personalization
  const [theme, setThemeState] = useState<MiraThemeId>(getSavedTheme);
  const [mascotAccessory, setMascotAccessoryState] = useState<MascotAccessory>(() => getSavedAccessory() as MascotAccessory);
  const [isStudioOpen, setIsStudioOpen] = useState<boolean>(false);
  const [devMode, setDevMode] = useState<boolean>(false);
  const [activeNavTab, setActiveNavTab] = useState<string>('Home');

  // Agent state initialized to 'idle' with friendly companion readiness
  const [agentState, setAgentState] = useState<AgentState>('idle');
  const [loopStage, setLoopStage] = useState<LoopStage>('HEARS');
  const [metrics, setMetrics] = useState<AgentMetrics>(INITIAL_METRICS);

  // Reasoning & Action
  const [reasoningSteps, setReasoningSteps] = useState<ReasoningStep[]>(INITIAL_REASONING_STEPS);
  const [currentActionProposal, setCurrentActionProposal] = useState<ActionProposal | null>(SAMPLE_ACTION_PROPOSAL);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(SAMPLE_VERIFICATION);

  // ContextCore
  const [contextCore, setContextCore] = useState<ContextCoreState>(INITIAL_CONTEXT_CORE);

  // Multimodal Conversation
  const [messages, setMessages] = useState<MultimodalMessage[]>(INITIAL_MESSAGES);

  // Vision
  const [visionFeed, setVisionFeed] = useState<VisionFeedState>({
    sourceType: 'synthetic_test',
    isActive: true,
    resolution: '1920x1080',
    currentFps: 30,
    detectedBoxes: INITIAL_BOUNDING_BOXES,
    ocrSnippets: [
      { id: 'ocr-1', text: 'Document: Project Notes & Guidelines', location: 'Active Tab' },
      { id: 'ocr-2', text: 'Screenshot: Workspace UI Design', location: 'Canvas' },
    ],
    sceneDescription: 'User workspace with project notes and design canvas.',
  });

  // Audio visualizer controller
  const audioCtrlRef = useRef<AudioVisualizerController>(new AudioVisualizerController());
  const [audioStream, setAudioStream] = useState<AudioStreamState>({
    isListening: false,
    isMuted: false,
    isSpeakingTTS: false,
    audioInputDevice: 'Default Microphone (Realtek HD Audio)',
    inputVolume: 0,
    vadActive: false,
    speechRate: 140,
    audioFrequencies: new Array(32).fill(0.05),
  });

  // Documents
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<DocumentItem | null>(null);

  // Workspace spatial layout view
  const [activeWorkspaceView, setActiveWorkspaceView] = useState<'spatial' | 'focus-vision' | 'focus-chat' | 'focus-context'>('spatial');

  // Change theme and persist
  const setTheme = (newTheme: MiraThemeId) => {
    setThemeState(newTheme);
    saveTheme(newTheme);
  };

  const setMascotAccessory = (acc: MascotAccessory) => {
    setMascotAccessoryState(acc);
    saveAccessory(acc);
  };

  // Ensure DOM attribute matches on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const updateMetrics = (partial: Partial<AgentMetrics>) => {
    setMetrics((prev) => ({ ...prev, ...partial }));
  };

  const addReasoningStep = (step: ReasoningStep) => {
    setReasoningSteps((prev) => [...prev, step]);
  };

  const approveAction = (actionId: string, notes?: string) => {
    if (!currentActionProposal || currentActionProposal.id !== actionId) return;

    // Transition state
    setAgentState('executing');
    setLoopStage('ACTS');
    setCurrentActionProposal((prev) =>
      prev
        ? {
            ...prev,
            status: 'approved',
            approvedAt: new Date().toLocaleTimeString(),
          }
        : null
    );

    // Add notification to conversation
    const approvalNotice: MultimodalMessage = {
      id: `msg-approval-${Date.now()}`,
      sender: 'system',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `Action "${currentActionProposal.summary}" was APPROVED by the user. ${notes ? `Note: "${notes}"` : ''} Executing safely...`,
    };
    setMessages((prev) => [...prev, approvalNotice]);

    // Simulate safe execution & verification transition
    setTimeout(() => {
      setAgentState('verifying');
      setLoopStage('VERIFIES');

      setTimeout(() => {
        setAgentState('speaking');
        setCurrentActionProposal((prev) =>
          prev ? { ...prev, status: 'completed' } : null
        );

        const completionNotice: MultimodalMessage = {
          id: `msg-complete-${Date.now()}`,
          sender: 'mira',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: 'Execution succeeded and pre-flight verification confirmed 3 pods are back online in healthy state. Verification Score: 98.4%.',
          agentTrace: {
            stage: 'VERIFIES',
            thought: 'Pod restart completed without dropped packets. Audio pipeline ingress confirmed 0 errors.',
            verification: SAMPLE_VERIFICATION,
          },
        };
        setMessages((prev) => [...prev, completionNotice]);

        setTimeout(() => {
          setAgentState('completed');
        }, 1500);
      }, 1400);
    }, 1200);
  };

  const rejectAction = (actionId: string, reason: string) => {
    if (!currentActionProposal || currentActionProposal.id !== actionId) return;

    setAgentState('completed');
    setCurrentActionProposal((prev) =>
      prev
        ? {
            ...prev,
            status: 'rejected',
            rejectedReason: reason,
          }
        : null
    );

    const rejectionNotice: MultimodalMessage = {
      id: `msg-reject-${Date.now()}`,
      sender: 'system',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `Action REJECTED by user: "${reason}". Execution cancelled without altering cluster state.`,
    };
    setMessages((prev) => [...prev, rejectionNotice]);
  };

  const resetActionDemo = () => {
    setAgentState('waiting for approval');
    setLoopStage('ACTS');
    setCurrentActionProposal(SAMPLE_ACTION_PROPOSAL);
    setVerificationResult(SAMPLE_VERIFICATION);
  };

  const addAnchor = (anchorData: Omit<ContextAnchor, 'id' | 'timestamp'>) => {
    const newAnchor: ContextAnchor = {
      ...anchorData,
      id: `anc-${Date.now()}`,
      timestamp: 'Just now',
    };
    setContextCore((prev) => ({
      ...prev,
      activeAnchors: [newAnchor, ...prev.activeAnchors],
      tokenBudget: {
        ...prev.tokenBudget,
        usedTokens: prev.tokenBudget.usedTokens + anchorData.tokenWeight,
      },
    }));
  };

  const removeAnchor = (id: string) => {
    setContextCore((prev) => ({
      ...prev,
      activeAnchors: prev.activeAnchors.filter((a) => a.id !== id),
    }));
  };

  const togglePinAnchor = (id: string) => {
    setContextCore((prev) => ({
      ...prev,
      activeAnchors: prev.activeAnchors.map((a) =>
        a.id === id ? { ...a, isPinned: !a.isPinned } : a
      ),
    }));
  };

  const sendMessage = (text: string, attachments?: { images?: string[]; documents?: string[] }) => {
    if (!text.trim() && (!attachments || (attachments.images?.length === 0 && attachments.documents?.length === 0))) {
      return;
    }

    const userMsg: MultimodalMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text,
      attachments,
    };

    setMessages((prev) => [...prev, userMsg]);
    setAgentState('thinking');
    setLoopStage('UNDERSTANDS');

    // Simulate Agent processing step
    setTimeout(() => {
      setAgentState('speaking');
      setLoopStage('REASONS');

      const miraReply: MultimodalMessage = {
        id: `msg-mira-${Date.now()}`,
        sender: 'mira',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `I received your command: "${text}". ContextCore updated with session tokens. Ready for next prompt or action! ✨`,
        agentTrace: {
          stage: 'UNDERSTANDS',
          thought: 'Synthesized query with active screen context and document anchors. System responsive.',
        },
      };
      setMessages((prev) => [...prev, miraReply]);

      setTimeout(() => {
        setAgentState('idle');
      }, 1600);
    }, 1100);
  };

  const simulateSpeechInput = (transcriptText: string) => {
    setAgentState('listening');
    setLoopStage('HEARS');
    setAudioStream((prev) => ({ ...prev, vadActive: true }));

    setTimeout(() => {
      sendMessage(transcriptText);
      setAudioStream((prev) => ({ ...prev, vadActive: false }));
    }, 1200);
  };

  const setVisionSource = (source: 'camera' | 'screen' | 'synthetic_test' | 'paused') => {
    setVisionFeed((prev) => ({
      ...prev,
      sourceType: source,
      isActive: source !== 'paused',
    }));
    if (source !== 'paused') {
      setAgentState('observing');
      setLoopStage('SEES');
    }
  };

  const captureSnapshot = (): string => {
    const snapshotUrl = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180"><rect width="320" height="180" fill="%23f43f5e"/><text x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="sans-serif" font-size="14">Frame Snapshot: ${new Date().toLocaleTimeString()}</text></svg>`;
    setVisionFeed((prev) => ({
      ...prev,
      lastFrameSnapshotUrl: snapshotUrl,
    }));
    return snapshotUrl;
  };

  const addBoundingBox = (box: BoundingBox) => {
    setVisionFeed((prev) => ({
      ...prev,
      detectedBoxes: [...prev.detectedBoxes, box],
    }));
  };

  const clearBoundingBoxes = () => {
    setVisionFeed((prev) => ({
      ...prev,
      detectedBoxes: [],
    }));
  };

  const toggleListening = async () => {
    if (audioStream.isListening) {
      audioCtrlRef.current.stopListening();
      setAudioStream((prev) => ({
        ...prev,
        isListening: false,
        inputVolume: 0,
        vadActive: false,
        audioFrequencies: new Array(32).fill(0.05),
      }));
      setAgentState('idle');
    } else {
      setAudioStream((prev) => ({ ...prev, isListening: true }));
      setAgentState('listening');
      setLoopStage('HEARS');

      await audioCtrlRef.current.startListening((spectrum, volume, vad) => {
        setAudioStream((prev) => ({
          ...prev,
          audioFrequencies: spectrum,
          inputVolume: volume,
          vadActive: vad,
        }));
      });
    }
  };

  const toggleMute = () => {
    setAudioStream((prev) => ({ ...prev, isMuted: !prev.isMuted }));
  };

  const setSpeechRate = (rate: number) => {
    setAudioStream((prev) => ({ ...prev, speechRate: rate }));
  };

  const addDocument = (file: File) => {
    const estTokens = Math.max(120, Math.round(file.size / 40));
    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      name: file.name,
      size: file.size,
      type: file.type || 'text/plain',
      uploadedAt: 'Just now',
      tokenCount: estTokens,
      status: 'ready',
      chunksCount: Math.ceil(estTokens / 400),
      summary: `Uploaded document "${file.name}" indexed for semantic retrieval and ContextCore fusion.`,
      contentSnippet: `File: ${file.name} (${Math.round(file.size / 1024)} KB) - Ready for agent tool ingestion.`,
    };

    setDocuments((prev) => [newDoc, ...prev]);

    addAnchor({
      modality: 'documents',
      title: `Doc: ${file.name}`,
      source: `Uploaded: ${file.name}`,
      summary: `Indexed ${estTokens} tokens from uploaded file.`,
      tokenWeight: estTokens,
      isPinned: false,
    });
  };

  const removeDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  useEffect(() => {
    return () => {
      audioCtrlRef.current.stopListening();
    };
  }, []);

  return (
    <MiraContext.Provider
      value={{
        theme,
        setTheme,
        mascotAccessory,
        setMascotAccessory,
        isStudioOpen,
        setIsStudioOpen,
        devMode,
        setDevMode,
        activeNavTab,
        setActiveNavTab,
        agentState,
        setAgentState,
        loopStage,
        setLoopStage,
        metrics,
        updateMetrics,
        reasoningSteps,
        addReasoningStep,
        currentActionProposal,
        approveAction,
        rejectAction,
        verificationResult,
        resetActionDemo,
        contextCore,
        addAnchor,
        removeAnchor,
        togglePinAnchor,
        messages,
        sendMessage,
        simulateSpeechInput,
        visionFeed,
        setVisionSource,
        captureSnapshot,
        addBoundingBox,
        clearBoundingBoxes,
        audioStream,
        toggleListening,
        toggleMute,
        setSpeechRate,
        documents,
        addDocument,
        removeDocument,
        selectedDocForPreview,
        setSelectedDocForPreview,
        activeWorkspaceView,
        setActiveWorkspaceView,
      }}
    >
      {children}
    </MiraContext.Provider>
  );
};

export const useMira = (): MiraContextType => {
  const context = useContext(MiraContext);
  if (!context) {
    throw new Error('useMira must be used within a MiraProvider');
  }
  return context;
};
