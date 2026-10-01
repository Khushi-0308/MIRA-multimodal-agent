/**
 * Personal Command Center / My Day Types
 */

export type TaskCategory = 'work' | 'study' | 'personal' | 'health';
export type TaskPriority = 'high' | 'medium' | 'low';
export type MoodEmoji = '🤩' | '😊' | '🧘' | '☕' | '😴';

export type TaskTimeframe = 'today' | 'upcoming';

export interface MyDayTask {
  id: string;
  title: string;
  category?: TaskCategory;
  priority: TaskPriority;
  completed: boolean;
  timeframe: TaskTimeframe;
  dueTime?: string;
  dueDate?: string;
  createdAt: string;
}


export interface MyDayReminder {
  id: string;
  text: string;
  time: string;
  tag: string;
  urgent: boolean;
  dismissed?: boolean;
}

export interface MyDayEvent {
  id: string;
  title: string;
  time: string;
  location: string;
  type: 'meeting' | 'session' | 'review' | 'focus';
}

export interface MyDayDiaryEntry {
  id: string;
  timestamp: string;
  dateStr: string;
  mood: MoodEmoji;
  moodLabel: string;
  text: string;
}
