import {
  DEFAULT_MY_DAY_TASKS,
  DEFAULT_MY_DAY_REMINDERS,
  DEFAULT_MY_DAY_EVENTS,
  DEFAULT_MY_DAY_DIARY,
  loadSavedState,
} from './myDayDefaults';
import { MyDayTask, MyDayReminder, MyDayEvent, MyDayDiaryEntry } from '../types/myDay';

export interface MyDayContextPayload {
  date_str: string;
  stats: {
    total: number;
    completed: number;
    pending: number;
    percentage: number;
  };
  today_tasks: Array<{
    id: string;
    title: string;
    category?: string;
    priority: string;
    completed: boolean;
    dueTime?: string;
  }>;
  upcoming_tasks: Array<{
    id: string;
    title: string;
    category?: string;
    priority: string;
    completed: boolean;
    dueDate?: string;
  }>;
  events: Array<{
    id: string;
    title: string;
    time: string;
    location: string;
    type: string;
  }>;
  reminders: Array<{
    id: string;
    title: string;
    time: string;
    priority: string;
    repeat: string;
    urgent: boolean;
    completed: boolean;
    dismissed: boolean;
  }>;
  reflections: Array<{
    id: string;
    dateStr: string;
    mood?: string;
    moodLabel?: string;
    text: string;
  }>;
}

export function getMyDayContext(): MyDayContextPayload {
  const tasks = loadSavedState<MyDayTask[]>('mira_my_day_tasks', DEFAULT_MY_DAY_TASKS);
  const reminders = loadSavedState<MyDayReminder[]>('mira_my_day_reminders', DEFAULT_MY_DAY_REMINDERS);
  const events = loadSavedState<MyDayEvent[]>('mira_my_day_events', DEFAULT_MY_DAY_EVENTS);
  const diaryEntries = loadSavedState<MyDayDiaryEntry[]>('mira_secret_diary_vault_v1', DEFAULT_MY_DAY_DIARY);

  const todayTasks = tasks.filter((t) => t.timeframe === 'today');
  const upcomingTasks = tasks.filter((t) => t.timeframe === 'upcoming');
  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const now = new Date();
  const dateStr = now.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return {
    date_str: dateStr,
    stats: {
      total: totalCount,
      completed: completedCount,
      pending: totalCount - completedCount,
      percentage,
    },
    today_tasks: todayTasks.map((t) => ({
      id: t.id,
      title: t.title,
      category: t.category,
      priority: t.priority,
      completed: t.completed,
      dueTime: t.dueTime,
    })),
    upcoming_tasks: upcomingTasks.map((t) => ({
      id: t.id,
      title: t.title,
      category: t.category,
      priority: t.priority,
      completed: t.completed,
      dueDate: t.dueDate,
    })),
    events: events.map((e) => ({
      id: e.id,
      title: e.title,
      time: e.time,
      location: e.location,
      type: e.type,
    })),
    reminders: reminders.map((r) => ({
      id: r.id,
      title: r.title,
      time: r.time,
      priority: r.priority,
      repeat: r.repeat,
      urgent: Boolean(r.urgent || r.priority === 'urgent'),
      completed: Boolean(r.completed),
      dismissed: Boolean(r.dismissed),
    })),
    reflections: diaryEntries.slice(0, 5).map((d) => ({
      id: d.id,
      dateStr: d.dateStr,
      mood: d.mood,
      moodLabel: d.moodLabel,
      text: d.text,
    })),
  };
}
