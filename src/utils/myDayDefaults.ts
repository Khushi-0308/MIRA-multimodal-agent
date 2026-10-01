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
    dueTime: '10:00 AM',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: 'Upload and test project specifications in Documents RAG',
    category: 'study',
    priority: 'high',
    completed: true,
    dueTime: '11:30 AM',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    title: 'Run safe sandbox telemetry test on cluster nodes',
    category: 'work',
    priority: 'medium',
    completed: false,
    dueTime: '02:00 PM',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-4',
    title: 'Customize MIRA Studio theme & companion mascot accessory',
    category: 'personal',
    priority: 'low',
    completed: false,
    dueTime: '04:30 PM',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-5',
    title: 'Drink 2L of water and take a 15-min mindfulness break',
    category: 'health',
    priority: 'medium',
    completed: false,
    dueTime: '06:00 PM',
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_MY_DAY_REMINDERS: MyDayReminder[] = [
  {
    id: 'rem-1',
    text: 'AI Build Challenge 2026 PS-05 Submission Review',
    time: 'Today • 05:00 PM',
    tag: 'Milestone',
    urgent: true,
    dismissed: false,
  },
  {
    id: 'rem-2',
    text: 'Sync with team on Multimodal Real-Time Agent Demo',
    time: 'Today • 03:00 PM',
    tag: 'Team Sync',
    urgent: false,
    dismissed: false,
  },
  {
    id: 'rem-3',
    text: 'Verify microphone & screen share permissions for live session',
    time: 'Before 12:00 PM',
    tag: 'Pre-flight',
    urgent: false,
    dismissed: false,
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
