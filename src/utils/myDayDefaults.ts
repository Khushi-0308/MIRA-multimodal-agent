/**
 * Default mock data and persistence helpers for My Day dashboard
 */

import { MyDayTask, MyDayReminder, MyDayEvent, MyDayDiaryEntry } from '../types/myDay';

export const DEFAULT_MY_DAY_TASKS: MyDayTask[] = [
  {
    id: 'task-1',
    title: 'Review Gemini Vision OCR anchors and frame latency',
    category: 'work',
    priority: 'high',
    completed: true,
    timeframe: 'today',
    dueTime: '10:00 AM',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: 'Upload and test project specifications in Documents RAG',
    category: 'study',
    priority: 'high',
    completed: true,
    timeframe: 'today',
    dueTime: '11:30 AM',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    title: 'Run safe sandbox telemetry test on cluster nodes',
    category: 'work',
    priority: 'medium',
    completed: false,
    timeframe: 'today',
    dueTime: '02:00 PM',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-4',
    title: 'Customize MIRA Studio theme & companion mascot accessory',
    category: 'personal',
    priority: 'low',
    completed: false,
    timeframe: 'today',
    dueTime: '04:30 PM',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-5',
    title: 'Drink 2L of water and take a 15-min mindfulness break',
    category: 'health',
    priority: 'medium',
    completed: false,
    timeframe: 'today',
    dueTime: '06:00 PM',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-6',
    title: 'Prepare presentation slides for AI Build Challenge demo',
    category: 'work',
    priority: 'high',
    completed: false,
    timeframe: 'upcoming',
    dueDate: 'Tomorrow',
    dueTime: '02:00 PM',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-7',
    title: 'Review speech synthesis latency benchmarks',
    category: 'study',
    priority: 'medium',
    completed: false,
    timeframe: 'upcoming',
    dueDate: 'Oct 4',
    dueTime: '11:00 AM',
    createdAt: new Date().toISOString(),
  },
];


export const DEFAULT_MY_DAY_REMINDERS: MyDayReminder[] = [
  {
    id: 'rem-1',
    title: 'AI Build Challenge 2026 PS-05 Submission Review',
    text: 'Ensure all tests pass and documentation walkthrough is complete.',
    date: 'Today',
    time: '05:00 PM',
    repeat: 'once',
    priority: 'urgent',
    tag: 'Milestone',
    urgent: true,
    completed: false,
    dismissed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rem-2',
    title: 'Daily Team Sync on Multimodal Agent Demo',
    text: 'Standup briefing on camera feed and RAG document grounding.',
    date: 'Today',
    time: '03:00 PM',
    repeat: 'daily',
    priority: 'high',
    tag: 'Team Sync',
    urgent: false,
    completed: false,
    dismissed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rem-3',
    title: 'Verify microphone & screen share permissions for live session',
    text: 'Run pre-flight Web Speech & canvas tests.',
    date: 'Today',
    time: '12:00 PM',
    repeat: 'once',
    priority: 'medium',
    tag: 'Pre-flight',
    urgent: false,
    completed: true,
    dismissed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rem-4',
    title: 'Weekly Repository Backup & Release Check',
    text: 'Push latest commits and sync origin/main.',
    date: 'Tomorrow',
    time: '10:00 AM',
    repeat: 'weekly',
    priority: 'medium',
    tag: 'Maintenance',
    urgent: false,
    completed: false,
    dismissed: false,
    createdAt: new Date().toISOString(),
  },
];


export const DEFAULT_MY_DAY_EVENTS: MyDayEvent[] = [
  {
    id: 'ev-1',
    title: 'Daily Standup & Multimodal Pipeline Briefing',
    time: '09:30 AM - 10:00 AM',
    location: 'Discord Stage / Google Meet',
    type: 'meeting',
  },
  {
    id: 'ev-2',
    title: 'Deep Work: Document RAG & ContextCore Indexing',
    time: '11:00 AM - 01:00 PM',
    location: 'Focus Mode (MIRA Co-Pilot)',
    type: 'focus',
  },
  {
    id: 'ev-3',
    title: 'AI Build Challenge Architecture Peer Review',
    time: '03:30 PM - 04:30 PM',
    location: 'Lab Room B / Virtual Canvas',
    type: 'review',
  },
];

export const DEFAULT_MY_DAY_DIARY: MyDayDiaryEntry[] = [
  {
    id: 'diary-1',
    timestamp: new Date(Date.now() - 3600 * 1000 * 2).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    dateStr: 'Today',
    mood: '🤩',
    moodLabel: 'Super Energetic',
    text: 'Got the multimodal vision and RAG pipeline running flawlessly with Gemini 3.5! Ready to rock the dashboard.',
  },
  {
    id: 'diary-2',
    timestamp: 'Yesterday',
    dateStr: 'Yesterday',
    mood: '☕',
    moodLabel: 'Deeply Focused',
    text: 'Connected live Web Speech recognition and audio synthesis. MIRA is sounding very lively and responsive!',
  },
];

// LocalStorage helpers
export const loadSavedState = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[MyDay] Failed to parse localStorage key ${key}:`, err);
    return defaultValue;
  }
};

export const saveState = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[MyDay] Failed to save localStorage key ${key}:`, err);
  }
};
