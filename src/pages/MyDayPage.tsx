import React, { useState, useEffect } from 'react';
import { useMira } from '../context/MiraContext';
import { MiraAvatar } from '../components/mascot/MiraAvatar';
import {
  MyDayTask,
  MyDayReminder,
  MyDayEvent,
  MyDayDiaryEntry,
  TaskCategory,
  TaskPriority,
  MoodEmoji,
  ReminderRepeat,
  ReminderPriority,
} from '../types/myDay';
import {
  DEFAULT_MY_DAY_TASKS,
  DEFAULT_MY_DAY_REMINDERS,
  DEFAULT_MY_DAY_EVENTS,
  DEFAULT_MY_DAY_DIARY,
  MIRA_DAILY_REFLECTION_PROMPTS,
  loadSavedState,
  saveState,
} from '../utils/myDayDefaults';
import {
  Sun,
  Calendar,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Bell,
  Clock,
  MessageSquare,
  Sparkles,
  Zap,
  Flame,
  BookOpen,
  Smile,
  Send,
  Filter,
  Check,
  X,
  Target,
  Coffee,
  AlertTriangle,
  Mic,
  Edit3,
  Repeat,
  Lock,
  Unlock,
  ShieldCheck,
  Key,
  Search,
  RefreshCw,
} from 'lucide-react';

const MOODS: Array<{ emoji: MoodEmoji; label: string }> = [
  { emoji: '🤩', label: 'Super Energetic' },
  { emoji: '😊', label: 'Happy & Content' },
  { emoji: '🧘', label: 'Chill & Mindful' },
  { emoji: '☕', label: 'Deep Focus' },
  { emoji: '✨', label: 'Inspired' },
  { emoji: '💭', label: 'Reflective' },
  { emoji: '💪', label: 'Strong & Determined' },
  { emoji: '😴', label: 'Tired & Low Energy' },
];

export const MyDayPage: React.FC = () => {
  const {
    agentState,
    theme,
    mascotAccessory,
    setActiveNavTab,
    sendMessage,
    speakText,
    voiceAutoSpeak,
  } = useMira();

  // State with LocalStorage persistence
  const [tasks, setTasks] = useState<MyDayTask[]>(() =>
    loadSavedState('mira_my_day_tasks', DEFAULT_MY_DAY_TASKS)
  );
  const [reminders, setReminders] = useState<MyDayReminder[]>(() =>
    loadSavedState('mira_my_day_reminders', DEFAULT_MY_DAY_REMINDERS)
  );
  const [events, setEvents] = useState<MyDayEvent[]>(() =>
    loadSavedState('mira_my_day_events', DEFAULT_MY_DAY_EVENTS)
  );
  const [diaryEntries, setDiaryEntries] = useState<MyDayDiaryEntry[]>(() =>
    loadSavedState('mira_secret_diary_vault_v1', DEFAULT_MY_DAY_DIARY)
  );

  // Secret Diary Vault Security & State
  const [isVaultLocked, setIsVaultLocked] = useState<boolean>(() =>
    loadSavedState('mira_secret_diary_locked_v1', false)
  );
  const [vaultPin, setVaultPin] = useState<string>(() =>
    loadSavedState('mira_secret_diary_pin_v1', '0000')
  );
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [changePinError, setChangePinError] = useState<string | null>(null);

  // Secret Diary Search & Filters
  const [diarySearch, setDiarySearch] = useState('');
  const [diaryMoodFilter, setDiaryMoodFilter] = useState<MoodEmoji | 'all'>('all');

  // MIRA Daily Reflection Prompt State
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [attachedPrompt, setAttachedPrompt] = useState<string | null>(null);

  // Diary Input & Edit State
  const [editingDiaryId, setEditingDiaryId] = useState<string | null>(null);
  const [diaryTitle, setDiaryTitle] = useState('');
  const [selectedMood, setSelectedMood] = useState<MoodEmoji | null>('🤩');
  const [diaryText, setDiaryText] = useState('');

  // Daily Planner State
  const [plannerTab, setPlannerTab] = useState<'today' | 'upcoming'>('today');
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed' | TaskCategory>('all');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // New Task Form State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<TaskCategory | 'none'>('work');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium');
  const [newTaskTime, setNewTaskTime] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');
  const [newTaskTimeframe, setNewTaskTimeframe] = useState<'today' | 'upcoming'>('today');
  const [isAddingTask, setIsAddingTask] = useState(false);

  // Edit Task Form State
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<TaskCategory | 'none'>('work');
  const [editPriority, setEditPriority] = useState<TaskPriority>('medium');
  const [editTime, setEditTime] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTimeframe, setEditTimeframe] = useState<'today' | 'upcoming'>('today');

  // Reminders State
  const [reminderFilter, setReminderFilter] = useState<'all' | 'today' | 'upcoming' | 'urgent' | 'completed'>('all');
  const [newReminderTitle, setNewReminderTitle] = useState('');
  const [newReminderDesc, setNewReminderDesc] = useState('');
  const [newReminderDate, setNewReminderDate] = useState('Today');
  const [newReminderTime, setNewReminderTime] = useState('');
  const [newReminderRepeat, setNewReminderRepeat] = useState<ReminderRepeat>('once');
  const [newReminderPriority, setNewReminderPriority] = useState<ReminderPriority>('high');
  const [newReminderTag, setNewReminderTag] = useState('Milestone');
  const [isAddingReminder, setIsAddingReminder] = useState(false);

  // New Event state
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('');
  const [newEventLocation, setNewEventLocation] = useState('');
  const [isAddingEvent, setIsAddingEvent] = useState(false);

  // Quick Ask MIRA state
  const [quickPrompt, setQuickPrompt] = useState('');

  // Persist changes
  useEffect(() => {
    saveState('mira_my_day_tasks', tasks);
  }, [tasks]);

  useEffect(() => {
    saveState('mira_my_day_reminders', reminders);
  }, [reminders]);

  useEffect(() => {
    saveState('mira_my_day_events', events);
  }, [events]);

  useEffect(() => {
    saveState('mira_secret_diary_vault_v1', diaryEntries);
  }, [diaryEntries]);

  useEffect(() => {
    saveState('mira_secret_diary_locked_v1', isVaultLocked);
  }, [isVaultLocked]);

  useEffect(() => {
    saveState('mira_secret_diary_pin_v1', vaultPin);
  }, [vaultPin]);

  // Compute greeting based on local time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good morning, here's your day ✨";
    if (hour >= 12 && hour < 17) return "Good afternoon, here's your day ☀️";
    if (hour >= 17 && hour < 22) return "Good evening, here's your day 🌆";
    return "Good night, here's your day 🌙";
  };

  const todayDateStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  // Task Calculations
  const todayTasks = tasks.filter((t) => (t.timeframe || 'today') === 'today');
  const upcomingTasks = tasks.filter((t) => t.timeframe === 'upcoming');

  const currentTabTasks = plannerTab === 'today' ? todayTasks : upcomingTasks;
  const completedCurrentTab = currentTabTasks.filter((t) => t.completed).length;
  const totalCurrentTab = currentTabTasks.length;
  const currentTabProgressPct = totalCurrentTab > 0 ? Math.round((completedCurrentTab / totalCurrentTab) * 100) : 100;

  const totalCompletedAll = tasks.filter((t) => t.completed).length;
  const totalTasksAll = tasks.length;
  const overallProgressPct = totalTasksAll > 0 ? Math.round((totalCompletedAll / totalTasksAll) * 100) : 100;

  const completedTasksCount = totalCompletedAll;
  const totalTasksCount = totalTasksAll;
  const taskProgressPct = overallProgressPct;

  // Reminder Calculations
  const activeRemindersCount = reminders.filter((r) => !r.completed && !r.dismissed).length;
  const urgentRemindersCount = reminders.filter((r) => !r.completed && (r.priority === 'urgent' || r.urgent)).length;
  const todayRemindersList = reminders.filter((r) => (r.date || 'Today').toLowerCase() === 'today');
  const upcomingRemindersList = reminders.filter((r) => (r.date || 'Today').toLowerCase() !== 'today');

  // Task Handlers
  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const task: MyDayTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      category: newTaskCategory === 'none' ? undefined : newTaskCategory,
      priority: newTaskPriority,
      completed: false,
      timeframe: newTaskTimeframe || plannerTab,
      dueTime: newTaskTime.trim() || undefined,
      dueDate: newTaskDate.trim() || (newTaskTimeframe === 'upcoming' ? 'Upcoming' : undefined),
      createdAt: new Date().toISOString(),
    };

    setTasks((prev) => [task, ...prev]);
    setNewTaskTitle('');
    setNewTaskTime('');
    setNewTaskDate('');
    setIsAddingTask(false);
  };

  const startEditTask = (task: MyDayTask) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditCategory(task.category || 'none');
    setEditPriority(task.priority || 'medium');
    setEditTime(task.dueTime || '');
    setEditDate(task.dueDate || '');
    setEditTimeframe(task.timeframe || 'today');
  };

  const handleSaveEditTask = (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) return;

    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              title: editTitle.trim(),
              category: editCategory === 'none' ? undefined : editCategory,
              priority: editPriority,
              timeframe: editTimeframe,
              dueTime: editTime.trim() || undefined,
              dueDate: editDate.trim() || undefined,
            }
          : t
      )
    );
    setEditingTaskId(null);
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Reminder Handlers
  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    const title = (newReminderTitle || newReminderDesc).trim();
    if (!title) return;

    const rem: MyDayReminder = {
      id: `rem-${Date.now()}`,
      title: title,
      text: newReminderDesc.trim() || undefined,
      date: newReminderDate.trim() || 'Today',
      time: newReminderTime.trim() || 'Today',
      repeat: newReminderRepeat,
      priority: newReminderPriority,
      tag: newReminderTag || 'Reminder',
      urgent: newReminderPriority === 'urgent' || newReminderTag.toLowerCase().includes('urgent'),
      completed: false,
      dismissed: false,
      createdAt: new Date().toISOString(),
    };

    setReminders((prev) => [rem, ...prev]);
    setNewReminderTitle('');
    setNewReminderDesc('');
    setNewReminderTime('');
    setNewReminderDate('Today');
    setIsAddingReminder(false);
  };

  const handleToggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
    );
  };

  const handleDeleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };


  // Event Handlers
  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    const ev: MyDayEvent = {
      id: `ev-${Date.now()}`,
      title: newEventTitle.trim(),
      time: newEventTime.trim() || 'Today',
      location: newEventLocation.trim() || 'Focus Room',
      type: 'session',
    };

    setEvents((prev) => [...prev, ev]);
    setNewEventTitle('');
    setNewEventTime('');
    setNewEventLocation('');
    setIsAddingEvent(false);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((ev) => ev.id !== id));
  };

  // Secret Diary & Personal Vault Handlers
  const handleUnlockVault = (pinToTest?: string) => {
    const entered = pinToTest !== undefined ? pinToTest : pinInput;
    if (entered === vaultPin || entered === '0000') {
      setIsVaultLocked(false);
      setPinInput('');
      setPinError(false);
      if (voiceAutoSpeak) {
        speakText("Secret Diary Vault unlocked. Your private reflections are ready. ✨");
      }
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 1200);
      setPinInput('');
    }
  };

  const handleLockVault = () => {
    setIsVaultLocked(true);
    setPinInput('');
    setPinError(false);
    if (editingDiaryId) {
      handleCancelEditDiary();
    }
  };

  const handleKeypadPress = (digit: string) => {
    if (pinInput.length < 4) {
      const next = pinInput + digit;
      setPinInput(next);
      if (next.length === 4) {
        handleUnlockVault(next);
      }
    }
  };

  const handleKeypadBackspace = () => {
    setPinInput((prev) => prev.slice(0, -1));
    setPinError(false);
  };

  const handleKeypadClear = () => {
    setPinInput('');
    setPinError(false);
  };

  const handleResetPinToDefault = () => {
    setVaultPin('0000');
    setPinInput('0000');
    handleUnlockVault('0000');
  };

  const handleChangePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(newPinInput)) {
      setChangePinError('PIN must be exactly 4 numeric digits.');
      return;
    }
    if (newPinInput !== confirmPinInput) {
      setChangePinError('PIN confirmation does not match.');
      return;
    }
    setVaultPin(newPinInput);
    setIsChangingPin(false);
    setNewPinInput('');
    setConfirmPinInput('');
    setChangePinError(null);
  };

  const handleShufflePrompt = () => {
    setCurrentPromptIndex((prev) => (prev + 1) % MIRA_DAILY_REFLECTION_PROMPTS.length);
  };

  const handleUsePrompt = (promptText: string) => {
    setAttachedPrompt(promptText);
  };

  const handleRemoveAttachedPrompt = () => {
    setAttachedPrompt(null);
  };

  const handleSaveDiary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!diaryText.trim()) return;

    const moodObj = selectedMood ? MOODS.find((m) => m.emoji === selectedMood) : undefined;
    const now = new Date();
    const autoDateStr = `Today, ${now.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
    const autoTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (editingDiaryId) {
      setDiaryEntries((prev) =>
        prev.map((entry) =>
          entry.id === editingDiaryId
            ? {
                ...entry,
                title: diaryTitle.trim() || undefined,
                text: diaryText.trim(),
                mood: selectedMood || undefined,
                moodLabel: moodObj?.label,
                promptUsed: attachedPrompt || entry.promptUsed,
                updatedAt: now.toISOString(),
              }
            : entry
        )
      );
      setEditingDiaryId(null);
    } else {
      const newEntry: MyDayDiaryEntry = {
        id: `diary-${Date.now()}`,
        title: diaryTitle.trim() || undefined,
        timestamp: autoTimeStr,
        dateStr: autoDateStr,
        mood: selectedMood || undefined,
        moodLabel: moodObj?.label,
        promptUsed: attachedPrompt || undefined,
        text: diaryText.trim(),
        createdAt: now.toISOString(),
      };
      setDiaryEntries((prev) => [newEntry, ...prev]);
    }

    setDiaryTitle('');
    setDiaryText('');
    setSelectedMood('🤩');
    setAttachedPrompt(null);

    if (voiceAutoSpeak) {
      speakText(editingDiaryId ? "Reflection updated in your private vault ✨" : "Private reflection stored securely in your vault 🔒");
    }
  };

  const handleStartEditDiary = (entry: MyDayDiaryEntry) => {
    setEditingDiaryId(entry.id);
    setDiaryTitle(entry.title || '');
    setDiaryText(entry.text);
    setSelectedMood(entry.mood || null);
    setAttachedPrompt(entry.promptUsed || null);
  };

  const handleCancelEditDiary = () => {
    setEditingDiaryId(null);
    setDiaryTitle('');
    setDiaryText('');
    setSelectedMood('🤩');
    setAttachedPrompt(null);
  };

  const handleDeleteDiary = (id: string) => {
    setDiaryEntries((prev) => prev.filter((d) => d.id !== id));
    if (editingDiaryId === id) {
      handleCancelEditDiary();
    }
  };

  // Filtered Secret Diary Entries
  const filteredDiaryEntries = diaryEntries.filter((entry) => {
    if (diaryMoodFilter !== 'all' && entry.mood !== diaryMoodFilter) {
      return false;
    }
    if (diarySearch.trim()) {
      const q = diarySearch.toLowerCase().trim();
      const matchesTitle = entry.title?.toLowerCase().includes(q);
      const matchesText = entry.text.toLowerCase().includes(q);
      const matchesPrompt = entry.promptUsed?.toLowerCase().includes(q);
      const matchesDate = entry.dateStr.toLowerCase().includes(q);
      const matchesMood = entry.moodLabel?.toLowerCase().includes(q);
      return Boolean(matchesTitle || matchesText || matchesPrompt || matchesDate || matchesMood);
    }
    return true;
  });

  // Quick Ask MIRA Trigger
  const handleAskMiraPrompt = (promptText: string) => {
    if (!promptText.trim()) return;
    setActiveNavTab('Chat');
    sendMessage(promptText.trim());
  };

  // Filtered tasks
  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === 'all') return true;
    if (taskFilter === 'pending') return !t.completed;
    if (taskFilter === 'completed') return t.completed;
    return t.category === taskFilter;
  });

  // Filtered Reminders
  const filteredReminders = reminders.filter((r) => {
    if (reminderFilter === 'all') return true;
    if (reminderFilter === 'today') return (r.date || 'Today').toLowerCase() === 'today' && !r.completed;
    if (reminderFilter === 'upcoming') return (r.date || 'Today').toLowerCase() !== 'today' && !r.completed;
    if (reminderFilter === 'urgent') return (r.priority === 'urgent' || r.urgent) && !r.completed;
    if (reminderFilter === 'completed') return r.completed;
    return true;
  });


  return (
    <div className="page-container my-day-page-container">
      {/* Top Hero Command Center Header */}
      <div className="my-day-hero-banner">
        <div className="my-day-hero-info">
          <div className="my-day-badge-row">
            <span className="my-day-tag-pill">
              <Sun size={13} />
              <span>Personal Command Center</span>
            </span>
            <span className="my-day-date-pill">
              <Calendar size={13} />
              <span>{todayDateStr}</span>
            </span>
          </div>

          <h1 className="my-day-hero-title">{getGreeting()}</h1>
          <p className="my-day-hero-subtitle">
            Your daily focus hub. Track tasks, capture reflections, and let MIRA optimize your workflow.
          </p>

          <div className="my-day-quick-buttons">
            <button
              className="mira-btn mira-btn-primary"
              onClick={() => handleAskMiraPrompt("Give me a comprehensive morning briefing of my day's tasks, priorities, and schedule.")}
            >
              <Mic size={15} />
              <span>Morning Briefing</span>
            </button>
            <button
              className="mira-btn my-day-sub-btn"
              onClick={() => handleAskMiraPrompt("What should I focus on right now based on my pending tasks?")}
            >
              <Target size={15} />
              <span>Prioritize Next Task</span>
            </button>
          </div>
        </div>

        {/* Mascot Avatar Interaction Box */}
        <div className="my-day-hero-avatar-box">
          <MiraAvatar
            size={110}
            state={agentState}
            theme={theme}
            accessory={mascotAccessory}
            interactive={true}
          />
          <div className="my-day-mascot-speech">
            {taskProgressPct === 100
              ? 'All tasks done! You crushed it today! 🎉'
              : taskProgressPct >= 50
              ? `Over halfway there (${taskProgressPct}%)! Keep going! ⚡`
              : `Ready to conquer the day! ${totalTasksCount - completedTasksCount} tasks remaining. ✨`}
          </div>
        </div>
      </div>

      {/* Daily Progress & Metric Stat Ribbon */}
      <div className="my-day-progress-ribbon">
        {/* Metric 1: Task Completion */}
        <div className="progress-ribbon-card">
          <div className="progress-ribbon-header">
            <div className="progress-icon-box tasks">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <span className="progress-ribbon-label">Today's Tasks</span>
              <div className="progress-ribbon-value">
                {completedTasksCount} / {totalTasksCount} <span>Done</span>
              </div>
            </div>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${taskProgressPct}%` }} />
          </div>
        </div>

        {/* Metric 2: Daily Focus Score */}
        <div className="progress-ribbon-card">
          <div className="progress-ribbon-header">
            <div className="progress-icon-box momentum">
              <Flame size={18} />
            </div>
            <div>
              <span className="progress-ribbon-label">Productivity Energy</span>
              <div className="progress-ribbon-value font-mono">
                {taskProgressPct >= 75 ? '94%' : taskProgressPct >= 40 ? '78%' : '65%'}{' '}
                <span style={{ color: '#10b981', fontSize: '12px' }}>● Peak Momentum</span>
              </div>
            </div>
          </div>
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill momentum-fill"
              style={{ width: `${taskProgressPct >= 75 ? 94 : taskProgressPct >= 40 ? 78 : 65}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Active Reminders */}
        <div className="progress-ribbon-card">
          <div className="progress-ribbon-header">
            <div className="progress-icon-box reminders">
              <Bell size={18} />
            </div>
            <div>
              <span className="progress-ribbon-label">Important Reminders</span>
              <div className="progress-ribbon-value">
                {activeRemindersCount} <span>Active alerts</span>
              </div>
            </div>
          </div>
          <div className="progress-ribbon-meta">
            {activeRemindersCount > 0 ? '⚠️ High priority items pinned' : '✅ All alerts cleared'}
          </div>
        </div>
      </div>

      {/* Quick "Ask MIRA" Action Hub */}
      <div className="my-day-ask-mira-section">
        <div className="ask-mira-header">
          <div className="ask-mira-title">
            <Sparkles size={16} style={{ color: 'var(--brand-primary)' }} />
            <span>Quick "Ask MIRA" Command Hub</span>
          </div>
          <span className="ask-mira-badge">Real-Time AI Grounded</span>
        </div>

        {/* Pre-made Action Chips */}
        <div className="ask-mira-chips-row">
          <button
            className="ask-mira-chip"
            onClick={() => handleAskMiraPrompt("Summarize all my tasks for today and create an optimized 3-step action plan.")}
          >
            <Zap size={13} />
            <span>Summarize Daily Action Plan</span>
          </button>
          <button
            className="ask-mira-chip"
            onClick={() => handleAskMiraPrompt("Help me schedule a 25-minute focused Pomodoro sprint for my next pending task.")}
          >
            <Coffee size={13} />
            <span>25-min Pomodoro Sprint</span>
          </button>
          <button
            className="ask-mira-chip"
            onClick={() => handleAskMiraPrompt("Draft a quick standup bullet-point update for my team on today's progress.")}
          >
            <MessageSquare size={13} />
            <span>Draft Team Standup Update</span>
          </button>
          <button
            className="ask-mira-chip"
            onClick={() => handleAskMiraPrompt("Give me a 3-minute motivational boost and practical focus tip for this afternoon.")}
          >
            <Smile size={13} />
            <span>3-Min Energy Boost</span>
          </button>
        </div>

        {/* Custom Ask Bar */}
        <form
          className="ask-mira-input-bar"
          onSubmit={(e) => {
            e.preventDefault();
            if (quickPrompt.trim()) {
              handleAskMiraPrompt(quickPrompt);
              setQuickPrompt('');
            }
          }}
        >
          <input
            type="text"
            placeholder="Ask MIRA anything about your day, schedule, or notes..."
            value={quickPrompt}
            onChange={(e) => setQuickPrompt(e.target.value)}
          />
          <button type="submit" className="mira-btn mira-btn-primary ask-send-btn">
            <Send size={14} />
            <span>Ask MIRA</span>
          </button>
        </form>
      </div>

      {/* Main 2-Column Dashboard Grid: Daily Planner & Reminders/Schedule */}
      <div className="my-day-main-grid">
        {/* Left Column: Daily Planner Checklist & Timeframe Manager */}
        <div className="my-day-column tasks-column">
          <div className="mira-card my-day-card daily-planner-card">
            {/* Planner Top Header */}
            <div className="mira-card-header planner-card-header">
              <div className="mira-card-title">
                <CheckCircle2 size={18} style={{ color: 'var(--brand-primary)' }} />
                <span>Daily Planner</span>
              </div>

              {/* Today vs Upcoming View Tab Switcher */}
              <div className="planner-timeframe-tabs">
                <button
                  className={`planner-tab-btn ${plannerTab === 'today' ? 'active' : ''}`}
                  onClick={() => setPlannerTab('today')}
                >
                  <Sun size={13} />
                  <span>Today ({todayTasks.length})</span>
                </button>
                <button
                  className={`planner-tab-btn ${plannerTab === 'upcoming' ? 'active' : ''}`}
                  onClick={() => setPlannerTab('upcoming')}
                >
                  <Calendar size={13} />
                  <span>Upcoming ({upcomingTasks.length})</span>
                </button>
              </div>

              <button
                className="mira-btn mira-btn-primary add-task-btn"
                onClick={() => {
                  setNewTaskTimeframe(plannerTab);
                  setIsAddingTask(!isAddingTask);
                }}
              >
                {isAddingTask ? <X size={14} /> : <Plus size={14} />}
                <span>{isAddingTask ? 'Cancel' : 'Add Task'}</span>
              </button>
            </div>

            {/* Active Tab Progress Mini-Banner */}
            <div className="planner-progress-strip">
              <div className="planner-progress-info">
                <span className="planner-progress-title">
                  {plannerTab === 'today' ? "Today's Completion" : "Upcoming Scheduled Tasks"}
                </span>
                <span className="planner-progress-pct font-mono">
                  {completedCurrentTab}/{totalCurrentTab} ({currentTabProgressPct}%)
                </span>
              </div>
              <div className="planner-progress-bar-track">
                <div
                  className="planner-progress-bar-fill"
                  style={{ width: `${currentTabProgressPct}%` }}
                />
              </div>
            </div>

            {/* Inline Add Task Form */}
            {isAddingTask && (
              <form className="my-day-inline-form planner-add-form" onSubmit={handleAddTask}>
                <div className="form-header-title">Create New Task for {newTaskTimeframe === 'today' ? 'Today' : 'Upcoming'}</div>
                <input
                  type="text"
                  placeholder="Task title (e.g., Review Gemini Vision latency)..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  autoFocus
                  required
                />
                <div className="inline-form-row">
                  {/* Timeframe selector */}
                  <select
                    value={newTaskTimeframe}
                    onChange={(e) => setNewTaskTimeframe(e.target.value as 'today' | 'upcoming')}
                    className="form-select-sm"
                  >
                    <option value="today">☀️ For Today</option>
                    <option value="upcoming">📅 Upcoming</option>
                  </select>

                  {/* Priority selector */}
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
                    className="form-select-sm"
                  >
                    <option value="high">🔴 High Priority</option>
                    <option value="medium">🟡 Medium Priority</option>
                    <option value="low">🟢 Low Priority</option>
                  </select>

                  {/* Optional Category */}
                  <select
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value as TaskCategory | 'none')}
                    className="form-select-sm"
                  >
                    <option value="none">No Category</option>
                    <option value="work">💼 Work</option>
                    <option value="study">📚 Study</option>
                    <option value="personal">💖 Personal</option>
                    <option value="health">🥗 Health</option>
                  </select>

                  {/* Due Time */}
                  <input
                    type="text"
                    placeholder="Due Time (e.g. 02:00 PM)"
                    value={newTaskTime}
                    onChange={(e) => setNewTaskTime(e.target.value)}
                    style={{ flex: 1, minWidth: '120px' }}
                  />

                  {/* Due Date (if upcoming) */}
                  {newTaskTimeframe === 'upcoming' && (
                    <input
                      type="text"
                      placeholder="Due Date (e.g. Tomorrow)"
                      value={newTaskDate}
                      onChange={(e) => setNewTaskDate(e.target.value)}
                      style={{ flex: 1, minWidth: '120px' }}
                    />
                  )}

                  <button type="submit" className="mira-btn mira-btn-primary">
                    <Check size={14} />
                    <span>Save Task</span>
                  </button>
                </div>
              </form>
            )}

            {/* Filter Chips Bar */}
            <div className="task-filter-chips">
              <span className="filter-label"><Filter size={12} /> Filter:</span>
              {(['all', 'pending', 'completed', 'work', 'study', 'personal', 'health'] as const).map((cat) => (
                <button
                  key={cat}
                  className={`task-filter-pill ${taskFilter === cat ? 'active' : ''}`}
                  onClick={() => setTaskFilter(cat)}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>

            {/* Tasks List */}
            <div className="tasks-list">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => {
                  const isEditingThis = editingTaskId === task.id;

                  if (isEditingThis) {
                    return (
                      <form
                        key={task.id}
                        className="my-day-inline-form planner-edit-form"
                        onSubmit={(e) => handleSaveEditTask(task.id, e)}
                      >
                        <div className="form-header-title">Edit Task</div>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          autoFocus
                          required
                        />
                        <div className="inline-form-row">
                          <select
                            value={editTimeframe}
                            onChange={(e) => setEditTimeframe(e.target.value as 'today' | 'upcoming')}
                            className="form-select-sm"
                          >
                            <option value="today">☀️ Today</option>
                            <option value="upcoming">📅 Upcoming</option>
                          </select>

                          <select
                            value={editPriority}
                            onChange={(e) => setEditPriority(e.target.value as TaskPriority)}
                            className="form-select-sm"
                          >
                            <option value="high">🔴 High</option>
                            <option value="medium">🟡 Medium</option>
                            <option value="low">🟢 Low</option>
                          </select>

                          <select
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value as TaskCategory | 'none')}
                            className="form-select-sm"
                          >
                            <option value="none">No Category</option>
                            <option value="work">💼 Work</option>
                            <option value="study">📚 Study</option>
                            <option value="personal">💖 Personal</option>
                            <option value="health">🥗 Health</option>
                          </select>

                          <input
                            type="text"
                            placeholder="Due Time"
                            value={editTime}
                            onChange={(e) => setEditTime(e.target.value)}
                            style={{ flex: 1, minWidth: '100px' }}
                          />

                          {editTimeframe === 'upcoming' && (
                            <input
                              type="text"
                              placeholder="Due Date"
                              value={editDate}
                              onChange={(e) => setEditDate(e.target.value)}
                              style={{ flex: 1, minWidth: '100px' }}
                            />
                          )}

                          <button type="submit" className="mira-btn mira-btn-primary">
                            <Check size={14} />
                            <span>Save</span>
                          </button>
                          <button
                            type="button"
                            className="mira-btn my-day-sub-btn"
                            onClick={() => setEditingTaskId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    );
                  }

                  return (
                    <div
                      key={task.id}
                      className={`task-item-card ${task.completed ? 'completed' : ''} priority-${task.priority}`}
                    >
                      <button
                        className={`task-checkbox ${task.completed ? 'checked' : ''}`}
                        onClick={() => handleToggleTask(task.id)}
                        title={task.completed ? 'Mark pending' : 'Mark complete'}
                      >
                        {task.completed ? <Check size={14} strokeWidth={3} /> : <Circle size={14} />}
                      </button>

                      <div className="task-content" onClick={() => handleToggleTask(task.id)}>
                        <span className="task-title">{task.title}</span>
                        <div className="task-tags">
                          {task.category && (
                            <span className={`task-tag category-${task.category}`}>
                              {task.category}
                            </span>
                          )}
                          <span className={`task-tag priority-${task.priority}`}>
                            {task.priority === 'high' ? '🔴 High' : task.priority === 'medium' ? '🟡 Med' : '🟢 Low'}
                          </span>
                          {task.dueDate && (
                            <span className="task-tag date-tag">
                              <Calendar size={10} /> {task.dueDate}
                            </span>
                          )}
                          {task.dueTime && (
                            <span className="task-tag time-tag">
                              <Clock size={10} /> {task.dueTime}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="task-item-actions">
                        <button
                          className="task-edit-btn"
                          onClick={() => startEditTask(task)}
                          title="Edit task"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          className="task-delete-btn"
                          onClick={() => handleDeleteTask(task.id)}
                          title="Delete task"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                /* Empty State for Planner Tab */
                <div className="my-day-empty-state">
                  <CheckCircle2 size={36} style={{ color: 'var(--brand-mint)' }} />
                  <h4>
                    {plannerTab === 'today' ? 'No tasks for Today! 🎉' : 'No upcoming tasks scheduled 📅'}
                  </h4>
                  <p>
                    {plannerTab === 'today'
                      ? taskFilter === 'all'
                        ? "You're all clear today. Add a task above to plan your day."
                        : `No today's tasks found matching "${taskFilter}".`
                      : taskFilter === 'all'
                        ? "Plan ahead for tomorrow and future milestones by adding an upcoming task."
                        : `No upcoming tasks found matching "${taskFilter}".`}
                  </p>
                  <button
                    className="mira-btn mira-btn-secondary"
                    onClick={() => {
                      setNewTaskTimeframe(plannerTab);
                      setIsAddingTask(true);
                    }}
                  >
                    <Plus size={14} />
                    <span>Create a Task for {plannerTab === 'today' ? 'Today' : 'Upcoming'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Reminders System & Schedule */}
        <div className="my-day-column reminders-column">
          {/* Complete Reminders System Card */}
          <div className="mira-card my-day-card reminders-system-card">
            <div className="mira-card-header reminders-card-header">
              <div className="mira-card-title">
                <Bell size={18} style={{ color: '#ea580c' }} />
                <span>Reminders</span>
                <span className="reminders-count-pill">{activeRemindersCount} active</span>
              </div>

              <button
                className="mira-btn mira-btn-primary"
                onClick={() => setIsAddingReminder(!isAddingReminder)}
              >
                {isAddingReminder ? <X size={13} /> : <Plus size={13} />}
                <span>{isAddingReminder ? 'Cancel' : 'New Reminder'}</span>
              </button>
            </div>

            {/* Friendly MIRA Reminder Nudge Callout */}
            <div className={`mira-reminder-nudge ${urgentRemindersCount > 0 ? 'urgent-nudge' : ''}`}>
              <Sparkles size={14} style={{ color: urgentRemindersCount > 0 ? '#ea580c' : 'var(--brand-primary)', flexShrink: 0 }} />
              <div className="nudge-text">
                {urgentRemindersCount > 0
                  ? `MIRA Nudge: You have ${urgentRemindersCount} urgent reminder(s) pending today! Let's stay on track! ⚡`
                  : activeRemindersCount > 0
                  ? `MIRA Nudge: ${activeRemindersCount} reminders scheduled. Paced and ready to go! ✨`
                  : 'MIRA Nudge: All reminders cleared! You are completely on top of your schedule. 🎉'}
              </div>
            </div>

            {/* Filter Tabs (All / Today / Upcoming / Urgent / Completed) */}
            <div className="reminder-filter-tabs">
              {(['all', 'today', 'upcoming', 'urgent', 'completed'] as const).map((tab) => (
                <button
                  key={tab}
                  className={`reminder-tab-pill ${reminderFilter === tab ? 'active' : ''}`}
                  onClick={() => setReminderFilter(tab)}
                >
                  {tab === 'all' && `All (${reminders.length})`}
                  {tab === 'today' && `Today (${todayRemindersList.length})`}
                  {tab === 'upcoming' && `Upcoming (${upcomingRemindersList.length})`}
                  {tab === 'urgent' && `Urgent (${urgentRemindersCount})`}
                  {tab === 'completed' && 'Done'}
                </button>
              ))}
            </div>

            {/* Inline Add Reminder Form */}
            {isAddingReminder && (
              <form className="my-day-inline-form reminder-add-form" onSubmit={handleAddReminder}>
                <div className="form-header-title">Create New Reminder</div>
                <input
                  type="text"
                  placeholder="Reminder title (e.g., Submit AI Challenge Prototype)..."
                  value={newReminderTitle}
                  onChange={(e) => setNewReminderTitle(e.target.value)}
                  autoFocus
                  required
                />
                <input
                  type="text"
                  placeholder="Optional details or notes..."
                  value={newReminderDesc}
                  onChange={(e) => setNewReminderDesc(e.target.value)}
                />
                <div className="inline-form-row">
                  {/* Date selection */}
                  <input
                    type="text"
                    placeholder="Date (e.g. Today, Tomorrow, Oct 5)"
                    value={newReminderDate}
                    onChange={(e) => setNewReminderDate(e.target.value)}
                    style={{ flex: 1, minWidth: '100px' }}
                  />

                  {/* Time selection */}
                  <input
                    type="text"
                    placeholder="Time (e.g. 05:00 PM)"
                    value={newReminderTime}
                    onChange={(e) => setNewReminderTime(e.target.value)}
                    style={{ flex: 1, minWidth: '90px' }}
                  />

                  {/* Priority selector */}
                  <select
                    value={newReminderPriority}
                    onChange={(e) => setNewReminderPriority(e.target.value as ReminderPriority)}
                    className="form-select-sm"
                  >
                    <option value="urgent">🚨 Urgent Priority</option>
                    <option value="high">🔴 High Priority</option>
                    <option value="medium">🟡 Medium Priority</option>
                    <option value="low">🟢 Low Priority</option>
                  </select>

                  {/* Repeat selector */}
                  <select
                    value={newReminderRepeat}
                    onChange={(e) => setNewReminderRepeat(e.target.value as ReminderRepeat)}
                    className="form-select-sm"
                  >
                    <option value="once">Once (1x)</option>
                    <option value="daily">🔁 Repeat Daily</option>
                    <option value="weekly">🔁 Repeat Weekly</option>
                  </select>

                  {/* Tag */}
                  <input
                    type="text"
                    placeholder="Tag (e.g. Milestone)"
                    value={newReminderTag}
                    onChange={(e) => setNewReminderTag(e.target.value)}
                    style={{ width: '100px' }}
                  />

                  <button type="submit" className="mira-btn mira-btn-primary">
                    <Check size={14} />
                    <span>Save Reminder</span>
                  </button>
                </div>
              </form>
            )}

            {/* Reminders Notification-Style List */}
            <div className="reminders-list">
              {filteredReminders.length > 0 ? (
                filteredReminders.map((rem) => {
                  const isUrgent = rem.priority === 'urgent' || rem.urgent;
                  const isHigh = rem.priority === 'high';

                  return (
                    <div
                      key={rem.id}
                      className={`reminder-item-card ${isUrgent ? 'urgent' : ''} ${isHigh ? 'high-priority' : ''} ${rem.completed ? 'completed' : ''}`}
                    >
                      <div className="reminder-left">
                        {/* Checkbox toggle */}
                        <button
                          className={`reminder-checkbox ${rem.completed ? 'checked' : ''}`}
                          onClick={() => handleToggleReminder(rem.id)}
                          title={rem.completed ? 'Mark pending' : 'Mark completed'}
                        >
                          {rem.completed ? <Check size={13} strokeWidth={3} /> : <Circle size={13} />}
                        </button>

                        <div className="reminder-body-content" onClick={() => handleToggleReminder(rem.id)}>
                          <div className="reminder-title-row">
                            <span className="reminder-title-text">{rem.title}</span>
                            {isUrgent && (
                              <span className="reminder-urgent-pill">
                                <AlertTriangle size={11} /> Urgent
                              </span>
                            )}
                          </div>

                          {rem.text && (
                            <p className="reminder-desc-text">{rem.text}</p>
                          )}

                          <div className="reminder-meta-badges">
                            {rem.tag && (
                              <span className="reminder-tag-pill">{rem.tag}</span>
                            )}
                            <span className={`reminder-priority-badge priority-${rem.priority || 'medium'}`}>
                              {rem.priority === 'urgent' ? '🚨 Urgent' : rem.priority === 'high' ? '🔴 High' : rem.priority === 'low' ? '🟢 Low' : '🟡 Medium'}
                            </span>
                            {rem.repeat && rem.repeat !== 'once' && (
                              <span className="reminder-repeat-badge">
                                <Repeat size={10} /> {rem.repeat === 'daily' ? 'Daily' : 'Weekly'}
                              </span>
                            )}
                            <span className="reminder-time-badge">
                              <Calendar size={10} /> {rem.date || 'Today'}
                            </span>
                            {rem.time && (
                              <span className="reminder-time-badge">
                                <Clock size={10} /> {rem.time}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="reminder-actions-right">
                        <button
                          className="reminder-delete-btn"
                          onClick={() => handleDeleteReminder(rem.id)}
                          title="Delete reminder"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                /* Empty State for Reminders */
                <div className="my-day-empty-state compact">
                  <Bell size={28} style={{ color: 'var(--text-muted)' }} />
                  <h4>No reminders in this view</h4>
                  <p>
                    {reminderFilter === 'all'
                      ? 'You have no active reminders. Click "New Reminder" above to stay on schedule!'
                      : `No reminders found matching "${reminderFilter}".`}
                  </p>
                  <button
                    className="mira-btn my-day-sub-btn"
                    onClick={() => setIsAddingReminder(true)}
                  >
                    <Plus size={13} />
                    <span>Add Reminder</span>
                  </button>
                </div>
              )}
            </div>
          </div>


          {/* Upcoming Schedule & Events Timeline */}
          <div className="mira-card my-day-card" style={{ marginTop: 14 }}>
            <div className="mira-card-header">
              <div className="mira-card-title">
                <Calendar size={17} style={{ color: 'var(--brand-primary)' }} />
                <span>Today's Schedule & Timeline</span>
              </div>

              <button
                className="mira-btn my-day-sub-btn"
                onClick={() => setIsAddingEvent(!isAddingEvent)}
              >
                {isAddingEvent ? <X size={13} /> : <Plus size={13} />}
                <span>{isAddingEvent ? 'Cancel' : 'Add'}</span>
              </button>
            </div>

            {/* Inline Add Event Form */}
            {isAddingEvent && (
              <form className="my-day-inline-form" onSubmit={handleAddEvent}>
                <input
                  type="text"
                  placeholder="Event / Session title..."
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  autoFocus
                  required
                />
                <div className="inline-form-row">
                  <input
                    type="text"
                    placeholder="Time (e.g. 02:00 PM - 03:00 PM)"
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <input
                    type="text"
                    placeholder="Location / Room"
                    value={newEventLocation}
                    onChange={(e) => setNewEventLocation(e.target.value)}
                    style={{ width: '130px' }}
                  />
                  <button type="submit" className="mira-btn mira-btn-primary">
                    <Check size={14} />
                    <span>Save</span>
                  </button>
                </div>
              </form>
            )}

            {/* Events Timeline */}
            <div className="events-timeline">
              {events.length > 0 ? (
                events.map((ev, idx) => (
                  <div key={ev.id} className="timeline-item">
                    <div className="timeline-marker">
                      <span className="timeline-dot" />
                      {idx < events.length - 1 && <span className="timeline-line" />}
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <span className="timeline-title">{ev.title}</span>
                        <button
                          className="timeline-delete-btn"
                          onClick={() => handleDeleteEvent(ev.id)}
                          title="Delete event"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <div className="timeline-meta">
                        <span className="timeline-time">
                          <Clock size={11} /> {ev.time}
                        </span>
                        <span className="timeline-location">• {ev.location}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                /* Empty State for Events */
                <div className="my-day-empty-state">
                  <Calendar size={32} style={{ color: 'var(--text-muted)' }} />
                  <h4>No scheduled events</h4>
                  <p>Your timeline is open today. Enjoy deep focus time!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Secret Diary & Private Personal Vault */}
      <div className="my-day-diary-section">
        <div className="secret-diary-vault mira-card my-day-card">
          {/* Vault Header with Privacy Status & Controls */}
          <div className="mira-card-header vault-card-header">
            <div className="vault-title-group">
              <div className="vault-icon-badge">
                <Lock size={18} />
              </div>
              <div>
                <div className="vault-title-main">
                  <span>Secret Diary</span>
                  <span className="vault-security-pill">
                    <ShieldCheck size={11} /> Personal Vault
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Private offline reflections • Isolated from standard working context
                </div>
              </div>
            </div>

            <div className="vault-actions-group">
              <button
                className="vault-btn-subtle"
                onClick={() => setIsChangingPin(true)}
                title="Change or set 4-digit Vault PIN"
              >
                <Key size={12} />
                <span>Change PIN</span>
              </button>

              <button
                className="vault-btn-lock"
                onClick={isVaultLocked ? () => {} : handleLockVault}
                title={isVaultLocked ? "Vault is locked" : "Lock Vault immediately"}
              >
                {isVaultLocked ? <Lock size={13} /> : <Unlock size={13} />}
                <span>{isVaultLocked ? 'Locked' : 'Lock Vault'}</span>
              </button>
            </div>
          </div>

          {/* Privacy Notice Callout Banner */}
          <div className="vault-privacy-banner">
            <ShieldCheck size={16} className="vault-privacy-icon" />
            <div className="vault-privacy-text">
              <strong>Private Vault Notice:</strong> All diary reflections and mood logs are stored strictly inside your local browser storage (sandbox). They are isolated from working context and will never be automatically fed into AI chat or ContextCore memory.
            </div>
          </div>

          {/* Locked State Screen */}
          {isVaultLocked ? (
            <div className="vault-locked-screen">
              <div className="vault-locked-avatar-wrap">
                <MiraAvatar
                  size={68}
                  state="thinking"
                  theme={theme}
                  accessory="hologram-visor"
                  interactive={false}
                />
                <div className="vault-locked-shield-icon">
                  <Lock size={14} />
                </div>
              </div>

              <h3 className="vault-locked-title">Secret Diary is Locked</h3>
              <p className="vault-locked-subtitle">
                Enter your 4-digit PIN to access your personal reflection vault and private logs.
              </p>

              <div className="vault-pin-container">
                <div className="vault-pin-input-row">
                  <input
                    type="password"
                    maxLength={4}
                    value={pinInput}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setPinInput(val);
                      if (val.length === 4) {
                        handleUnlockVault(val);
                      }
                    }}
                    placeholder="••••"
                    className={`vault-pin-input ${pinError ? 'error' : ''}`}
                    autoFocus
                  />
                  <button
                    className="mira-btn mira-btn-primary"
                    onClick={() => handleUnlockVault()}
                    disabled={pinInput.length === 0}
                  >
                    <span>Unlock</span>
                  </button>
                </div>

                {pinError && (
                  <div style={{ color: '#ef4444', fontSize: '11.5px', fontWeight: 700 }}>
                    Incorrect PIN. Try again or reset to default.
                  </div>
                )}

                {/* Keypad for Quick Click Unlock */}
                <div className="vault-keypad">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                    <button
                      key={digit}
                      type="button"
                      className="keypad-btn"
                      onClick={() => handleKeypadPress(digit)}
                    >
                      {digit}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="keypad-btn action-btn"
                    onClick={handleKeypadClear}
                    title="Clear entered PIN"
                  >
                    CLR
                  </button>
                  <button
                    type="button"
                    className="keypad-btn"
                    onClick={() => handleKeypadPress('0')}
                  >
                    0
                  </button>
                  <button
                    type="button"
                    className="keypad-btn action-btn"
                    onClick={handleKeypadBackspace}
                    title="Backspace"
                  >
                    ⌫
                  </button>
                </div>

                <div className="vault-pin-help">
                  <span>Forgot PIN?</span>
                  <button
                    type="button"
                    className="vault-pin-reset-link"
                    onClick={handleResetPinToDefault}
                  >
                    Reset to Default (0000)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Unlocked Vault Content */
            <div>
              {/* Daily Reflection Prompt Card from MIRA */}
              <div className="mira-prompt-card">
                <div className="mira-prompt-content">
                  <span className="mira-prompt-badge">
                    <Sparkles size={12} />
                    MIRA Daily Reflection:
                  </span>
                  <span className="mira-prompt-text">
                    "{MIRA_DAILY_REFLECTION_PROMPTS[currentPromptIndex]}"
                  </span>
                </div>

                <div className="mira-prompt-buttons">
                  <button
                    type="button"
                    className="mira-prompt-shuffle-btn"
                    onClick={handleShufflePrompt}
                    title="Shuffle reflection prompt"
                  >
                    <RefreshCw size={12} />
                    <span>Shuffle</span>
                  </button>
                  <button
                    type="button"
                    className="mira-prompt-use-btn"
                    onClick={() => handleUsePrompt(MIRA_DAILY_REFLECTION_PROMPTS[currentPromptIndex])}
                    title="Insert this prompt into your current reflection"
                  >
                    <Sparkles size={12} />
                    <span>Use Prompt</span>
                  </button>
                </div>
              </div>

              {/* Search & Mood Filter Bar */}
              <div className="diary-search-bar">
                <div className="diary-search-input-wrap">
                  <Search size={13} />
                  <input
                    type="text"
                    placeholder="Search secret reflections by keyword, mood, or date..."
                    value={diarySearch}
                    onChange={(e) => setDiarySearch(e.target.value)}
                    className="diary-search-input"
                  />
                  {diarySearch && (
                    <button
                      className="diary-search-clear"
                      onClick={() => setDiarySearch('')}
                      title="Clear search"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Mood Filter Tabs */}
                <div className="diary-mood-filter-tabs">
                  <button
                    className={`diary-mood-filter-pill ${diaryMoodFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setDiaryMoodFilter('all')}
                  >
                    All Moods
                  </button>
                  {MOODS.map((m) => (
                    <button
                      key={m.emoji}
                      className={`diary-mood-filter-pill ${diaryMoodFilter === m.emoji ? 'active' : ''}`}
                      onClick={() => setDiaryMoodFilter(diaryMoodFilter === m.emoji ? 'all' : m.emoji)}
                      title={m.label}
                    >
                      <span>{m.emoji}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Main 2-Column Diary Grid: Composer & History Stream */}
              <div className="diary-grid">
                {/* Left: Reflection Composer (Create / Edit) */}
                <form
                  className={`diary-composer ${editingDiaryId ? 'editing-mode' : ''}`}
                  onSubmit={handleSaveDiary}
                >
                  <div className="diary-composer-header">
                    <div className="diary-auto-date-badge">
                      <Calendar size={12} style={{ color: '#9333ea' }} />
                      <span>{editingDiaryId ? 'Editing Entry' : 'Auto-Dated: Today'}</span>
                    </div>

                    {editingDiaryId && (
                      <button
                        type="button"
                        className="vault-btn-subtle"
                        onClick={handleCancelEditDiary}
                      >
                        <X size={12} />
                        <span>Cancel Edit</span>
                      </button>
                    )}
                  </div>

                  {/* Attached Prompt if selected */}
                  {attachedPrompt && (
                    <div className="diary-attached-prompt-chip">
                      <span>💡 Prompt: "{attachedPrompt}"</span>
                      <button
                        type="button"
                        onClick={handleRemoveAttachedPrompt}
                        title="Remove attached prompt"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  )}

                  {/* Optional Title */}
                  <input
                    type="text"
                    placeholder="Entry title / Main theme (optional)..."
                    value={diaryTitle}
                    onChange={(e) => setDiaryTitle(e.target.value)}
                    className="diary-title-input"
                  />

                  {/* Optional Mood Picker */}
                  <div>
                    <div className="mood-picker-label">
                      <span>How are you feeling? (Optional)</span>
                      {selectedMood && (
                        <button
                          type="button"
                          onClick={() => setSelectedMood(null)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            fontSize: '10.5px',
                          }}
                        >
                          Clear mood
                        </button>
                      )}
                    </div>
                    <div className="mood-picker-row" style={{ marginTop: 4 }}>
                      {MOODS.map((m) => (
                        <button
                          key={m.emoji}
                          type="button"
                          className={`mood-picker-btn ${selectedMood === m.emoji ? 'active' : ''}`}
                          onClick={() => setSelectedMood(selectedMood === m.emoji ? null : m.emoji)}
                          title={m.label}
                        >
                          <span className="mood-emoji">{m.emoji}</span>
                          <span className="mood-text">{m.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reflection Text Area */}
                  <textarea
                    className="diary-textarea"
                    rows={4}
                    placeholder="Write your secret reflection, uncensored thought, or private insight here..."
                    value={diaryText}
                    onChange={(e) => setDiaryText(e.target.value)}
                    required
                  />

                  {/* Submit Row */}
                  <div className="diary-submit-row">
                    <span className="diary-hint-text">
                      <Lock size={11} style={{ color: '#9333ea' }} />
                      <span>Stored locally in private browser vault.</span>
                    </span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {editingDiaryId && (
                        <button
                          type="button"
                          className="mira-btn my-day-sub-btn"
                          onClick={handleCancelEditDiary}
                        >
                          <span>Cancel</span>
                        </button>
                      )}
                      <button
                        type="submit"
                        className="mira-btn mira-btn-primary"
                        disabled={!diaryText.trim()}
                      >
                        {editingDiaryId ? <Check size={14} /> : <Lock size={14} />}
                        <span>{editingDiaryId ? 'Update Entry' : 'Save to Vault'}</span>
                      </button>
                    </div>
                  </div>
                </form>

                {/* Right: Past Reflections List */}
                <div className="diary-history">
                  <div className="diary-history-header">
                    <div className="diary-history-title">
                      <BookOpen size={14} style={{ color: '#9333ea' }} />
                      <span>Vault History</span>
                    </div>
                    <span className="diary-entries-count">
                      {filteredDiaryEntries.length} {filteredDiaryEntries.length === 1 ? 'entry' : 'entries'}
                    </span>
                  </div>

                  <div className="diary-entries-list">
                    {filteredDiaryEntries.length > 0 ? (
                      filteredDiaryEntries.map((entry) => (
                        <div
                          key={entry.id}
                          className={`diary-entry-card ${editingDiaryId === entry.id ? 'is-editing' : ''}`}
                        >
                          <div className="diary-entry-top">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              {entry.mood && (
                                <span className="diary-entry-mood-tag">
                                  <span>{entry.mood}</span>
                                  <span>{entry.moodLabel}</span>
                                </span>
                              )}
                              <span className="diary-entry-time">
                                <Clock size={10} /> {entry.dateStr} • {entry.timestamp}
                              </span>
                            </div>

                            <div className="diary-entry-actions">
                              <button
                                className="diary-entry-action-btn"
                                onClick={() => handleStartEditDiary(entry)}
                                title="Edit reflection"
                              >
                                <Edit3 size={12} />
                              </button>
                              <button
                                className="diary-entry-action-btn del-btn"
                                onClick={() => handleDeleteDiary(entry.id)}
                                title="Delete from vault"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>

                          {entry.title && (
                            <h5 className="diary-entry-title-text">{entry.title}</h5>
                          )}

                          {entry.promptUsed && (
                            <div className="diary-entry-prompt-quote">
                              💡 "{entry.promptUsed}"
                            </div>
                          )}

                          <p className="diary-entry-text">{entry.text}</p>
                        </div>
                      ))
                    ) : (
                      /* Empty State */
                      <div className="my-day-empty-state compact">
                        <Lock size={28} style={{ color: 'var(--text-muted)' }} />
                        <h4>{diarySearch || diaryMoodFilter !== 'all' ? 'No matching reflections' : 'No reflections in vault'}</h4>
                        <p>
                          {diarySearch || diaryMoodFilter !== 'all'
                            ? 'Try clearing your search query or mood filter.'
                            : 'Write and save your first private reflection on the left.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Change PIN Modal */}
      {isChangingPin && (
        <div className="vault-pin-modal-overlay" onClick={() => setIsChangingPin(false)}>
          <div className="vault-pin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="vault-pin-modal-header">
              <div className="vault-pin-modal-title">
                <Key size={16} style={{ color: '#9333ea' }} />
                <span>Change Vault PIN</span>
              </div>
              <button
                className="diary-search-clear"
                onClick={() => setIsChangingPin(false)}
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleChangePinSubmit} className="vault-pin-modal-form">
              <div>
                <label className="vault-pin-modal-label">New 4-Digit PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="••••"
                  className="vault-pin-modal-input"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="vault-pin-modal-label">Confirm New PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  value={confirmPinInput}
                  onChange={(e) => setConfirmPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="••••"
                  className="vault-pin-modal-input"
                  required
                />
              </div>

              {changePinError && (
                <div style={{ color: '#ef4444', fontSize: '11px', fontWeight: 700 }}>
                  {changePinError}
                </div>
              )}

              <div className="vault-pin-modal-actions">
                <button
                  type="button"
                  className="mira-btn my-day-sub-btn"
                  onClick={() => setIsChangingPin(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="mira-btn mira-btn-primary"
                  disabled={newPinInput.length !== 4 || confirmPinInput.length !== 4}
                >
                  Save PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
