/**
 * Personal Command Center / My Day Types
 */

export type TaskCategory = 'work' | 'study' | 'personal' | 'health';
export type TaskPriority = 'high' | 'medium' | 'low';
export type MoodEmoji = '🤩' | '😊' | '🧘' | '☕' | '😴' | '✨' | '💭' | '💪' | '🌱';

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

export type ReminderRepeat = 'once' | 'daily' | 'weekly';
export type ReminderPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface MyDayReminder {
  id: string;
  title: string;
  text?: string;
  date?: string;
  time: string;
  repeat: ReminderRepeat;
  priority: ReminderPriority;
  tag?: string;
  urgent?: boolean;
  completed: boolean;
  dismissed?: boolean;
  createdAt: string;
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
  title?: string;
  timestamp: string;
  dateStr: string;
  mood?: MoodEmoji;
  moodLabel?: string;
  text: string;
  promptUsed?: string;
  createdAt: string;
  updatedAt?: string;
}
