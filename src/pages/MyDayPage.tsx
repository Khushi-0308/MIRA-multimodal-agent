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
} from '../types/myDay';
import {
  DEFAULT_MY_DAY_TASKS,
  DEFAULT_MY_DAY_REMINDERS,
  DEFAULT_MY_DAY_EVENTS,
  DEFAULT_MY_DAY_DIARY,
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
  AlertCircle,
  Mic,
} from 'lucide-react';

const MOODS: Array<{ emoji: MoodEmoji; label: string }> = [
  { emoji: '🤩', label: 'Super Energetic' },
  { emoji: '😊', label: 'Happy & Content' },
  { emoji: '🧘', label: 'Chill & Mindful' },
  { emoji: '☕', label: 'Deep Focus' },
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
    loadSavedState('mira_my_day_diary', DEFAULT_MY_DAY_DIARY)
  );

  // Filter & Input states
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed' | TaskCategory>('all');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<TaskCategory>('work');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium');
  const [newTaskTime, setNewTaskTime] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  // New Reminder state
  const [newReminderText, setNewReminderText] = useState('');
  const [newReminderTime, setNewReminderTime] = useState('');
  const [newReminderTag, setNewReminderTag] = useState('Urgent');
  const [isAddingReminder, setIsAddingReminder] = useState(false);

  // New Event state
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('');
  const [newEventLocation, setNewEventLocation] = useState('');
  const [isAddingEvent, setIsAddingEvent] = useState(false);

  // Diary Input state
  const [selectedMood, setSelectedMood] = useState<MoodEmoji>('🤩');
  const [diaryText, setDiaryText] = useState('');

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
    saveState('mira_my_day_diary', diaryEntries);
  }, [diaryEntries]);

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
  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const totalTasksCount = tasks.length;
  const taskProgressPct = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 100;
  const activeRemindersCount = reminders.filter((r) => !r.dismissed).length;

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
      category: newTaskCategory,
      priority: newTaskPriority,
      completed: false,
      dueTime: newTaskTime.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    setTasks((prev) => [task, ...prev]);
    setNewTaskTitle('');
    setNewTaskTime('');
    setIsAddingTask(false);
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Reminder Handlers
  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminderText.trim()) return;

    const rem: MyDayReminder = {
      id: `rem-${Date.now()}`,
      text: newReminderText.trim(),
      time: newReminderTime.trim() || 'Today',
      tag: newReminderTag || 'Reminder',
      urgent: newReminderTag.toLowerCase().includes('urgent') || newReminderTag.toLowerCase().includes('milestone'),
      dismissed: false,
    };

    setReminders((prev) => [rem, ...prev]);
    setNewReminderText('');
    setNewReminderTime('');
    setIsAddingReminder(false);
  };

  const handleDismissReminder = (id: string) => {
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

  // Diary Handlers
  const handleSaveDiary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!diaryText.trim()) return;

    const moodObj = MOODS.find((m) => m.emoji === selectedMood) || MOODS[0];
    const newEntry: MyDayDiaryEntry = {
      id: `diary-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dateStr: 'Today',
      mood: selectedMood,
      moodLabel: moodObj.label,
      text: diaryText.trim(),
    };

    setDiaryEntries((prev) => [newEntry, ...prev]);
    setDiaryText('');

    if (voiceAutoSpeak) {
      speakText(`Logged your mood as ${moodObj.label}. Great job taking time to reflect! ✨`);
    }
  };

  const handleDeleteDiary = (id: string) => {
    setDiaryEntries((prev) => prev.filter((d) => d.id !== id));
  };

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

      {/* Main 2-Column Dashboard Grid: Tasks & Reminders/Schedule */}
      <div className="my-day-main-grid">
        {/* Left Column: Today's Tasks Checklist */}
        <div className="my-day-column tasks-column">
          <div className="mira-card my-day-card">
            <div className="mira-card-header">
              <div className="mira-card-title">
                <CheckCircle2 size={17} style={{ color: 'var(--brand-primary)' }} />
                <span>Today's Tasks</span>
                <span className="tasks-count-pill">{completedTasksCount}/{totalTasksCount}</span>
              </div>

              <button
                className="mira-btn mira-btn-primary add-task-btn"
                onClick={() => setIsAddingTask(!isAddingTask)}
              >
                {isAddingTask ? <X size={14} /> : <Plus size={14} />}
                <span>{isAddingTask ? 'Cancel' : 'Add Task'}</span>
              </button>
            </div>

            {/* Inline Add Task Form */}
            {isAddingTask && (
              <form className="my-day-inline-form" onSubmit={handleAddTask}>
                <input
                  type="text"
                  placeholder="Task title (e.g., Review Gemini Vision latency)..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  autoFocus
                  required
                />
                <div className="inline-form-row">
                  <select
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value as TaskCategory)}
                  >
                    <option value="work">💼 Work</option>
                    <option value="study">📚 Study</option>
                    <option value="personal">💖 Personal</option>
                    <option value="health">🥗 Health</option>
                  </select>

                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
                  >
                    <option value="high">🔴 High Priority</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="low">🟢 Low</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Time (e.g. 02:00 PM)"
                    value={newTaskTime}
                    onChange={(e) => setNewTaskTime(e.target.value)}
                    style={{ flex: 1 }}
                  />

                  <button type="submit" className="mira-btn mira-btn-primary">
                    <Check size={14} />
                    <span>Save</span>
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
                filteredTasks.map((task) => (
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
                        <span className={`task-tag category-${task.category}`}>
                          {task.category}
                        </span>
                        <span className={`task-tag priority-${task.priority}`}>
                          {task.priority}
                        </span>
                        {task.dueTime && (
                          <span className="task-tag time-tag">
                            <Clock size={10} /> {task.dueTime}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      className="task-delete-btn"
                      onClick={() => handleDeleteTask(task.id)}
                      title="Delete task"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              ) : (
                /* Empty State for Tasks */
                <div className="my-day-empty-state">
                  <CheckCircle2 size={36} style={{ color: 'var(--brand-mint)' }} />
                  <h4>No tasks here! 🎉</h4>
                  <p>
                    {taskFilter === 'all'
                      ? "You're all clear. Add a task above to plan your day."
                      : `No tasks found matching "${taskFilter}".`}
                  </p>
                  <button
                    className="mira-btn mira-btn-secondary"
                    onClick={() => setIsAddingTask(true)}
                  >
                    <Plus size={14} />
                    <span>Create a Task</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Reminders & Daily Timeline */}
        <div className="my-day-column reminders-column">
          {/* Important Reminders Card */}
          <div className="mira-card my-day-card">
            <div className="mira-card-header">
              <div className="mira-card-title">
                <Bell size={17} style={{ color: '#ea580c' }} />
                <span>Important Reminders</span>
                <span className="reminders-count-pill">{activeRemindersCount}</span>
              </div>

              <button
                className="mira-btn my-day-sub-btn"
                onClick={() => setIsAddingReminder(!isAddingReminder)}
              >
                {isAddingReminder ? <X size={13} /> : <Plus size={13} />}
                <span>{isAddingReminder ? 'Cancel' : 'Add'}</span>
              </button>
            </div>

            {/* Inline Add Reminder Form */}
            {isAddingReminder && (
              <form className="my-day-inline-form" onSubmit={handleAddReminder}>
                <input
                  type="text"
                  placeholder="Reminder note..."
                  value={newReminderText}
                  onChange={(e) => setNewReminderText(e.target.value)}
                  autoFocus
                  required
                />
                <div className="inline-form-row">
                  <input
                    type="text"
                    placeholder="Time (e.g. 05:00 PM)"
                    value={newReminderTime}
                    onChange={(e) => setNewReminderTime(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <input
                    type="text"
                    placeholder="Tag (e.g. Milestone)"
                    value={newReminderTag}
                    onChange={(e) => setNewReminderTag(e.target.value)}
                    style={{ width: '110px' }}
                  />
                  <button type="submit" className="mira-btn mira-btn-primary">
                    <Check size={14} />
                    <span>Save</span>
                  </button>
                </div>
              </form>
            )}

            {/* Reminders List */}
            <div className="reminders-list">
              {reminders.length > 0 ? (
                reminders.map((rem) => (
                  <div
                    key={rem.id}
                    className={`reminder-item-card ${rem.urgent ? 'urgent' : ''}`}
                  >
                    <div className="reminder-left">
                      <div className="reminder-icon-box">
                        <AlertCircle size={15} />
                      </div>
                      <div>
                        <div className="reminder-text">{rem.text}</div>
                        <div className="reminder-meta">
                          <span className="reminder-tag">{rem.tag}</span>
                          <span className="reminder-time">
                            <Clock size={10} /> {rem.time}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      className="reminder-dismiss-btn"
                      onClick={() => handleDismissReminder(rem.id)}
                      title="Dismiss reminder"
                    >
                      <Check size={13} />
                    </button>
                  </div>
                ))
              ) : (
                /* Empty State for Reminders */
                <div className="my-day-empty-state">
                  <Bell size={32} style={{ color: 'var(--text-muted)' }} />
                  <h4>All clear! No reminders</h4>
                  <p>You have no pending alerts or deadlines pinned for today.</p>
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

      {/* Bottom Section: Quick Diary & Mood Reflection Journal */}
      <div className="my-day-diary-section">
        <div className="mira-card my-day-card diary-card">
          <div className="mira-card-header">
            <div className="mira-card-title">
              <BookOpen size={17} style={{ color: 'var(--brand-lavender)' }} />
              <span>Quick Diary & Daily Reflection</span>
            </div>
            <span className="diary-streak-badge">
              <Sparkles size={13} />
              <span>Mood Journal Active</span>
            </span>
          </div>

          <div className="diary-grid">
            {/* Left: Input box & Mood selector */}
            <form className="diary-composer" onSubmit={handleSaveDiary}>
              <div className="mood-picker-label">How are you feeling right now?</div>
              <div className="mood-picker-row">
                {MOODS.map((m) => (
                  <button
                    key={m.emoji}
                    type="button"
                    className={`mood-picker-btn ${selectedMood === m.emoji ? 'active' : ''}`}
                    onClick={() => setSelectedMood(m.emoji)}
                    title={m.label}
                  >
                    <span className="mood-emoji">{m.emoji}</span>
                    <span className="mood-text">{m.label}</span>
                  </button>
                ))}
              </div>

              <textarea
                className="diary-textarea"
                rows={3}
                placeholder="Write a quick reflection, breakthrough, or thought for today..."
                value={diaryText}
                onChange={(e) => setDiaryText(e.target.value)}
              />

              <div className="diary-submit-row">
                <span className="diary-hint-text">
                  Entries are stored privately and can be referenced by MIRA for personalized advice.
                </span>
                <button
                  type="submit"
                  className="mira-btn mira-btn-primary"
                  disabled={!diaryText.trim()}
                >
                  <Send size={14} />
                  <span>Save Entry</span>
                </button>
              </div>
            </form>

            {/* Right: Past Entries List */}
            <div className="diary-history">
              <h4 className="diary-history-title">Recent Reflections</h4>
              <div className="diary-entries-list">
                {diaryEntries.length > 0 ? (
                  diaryEntries.map((entry) => (
                    <div key={entry.id} className="diary-entry-card">
                      <div className="diary-entry-top">
                        <div className="diary-entry-mood">
                          <span className="diary-entry-emoji">{entry.mood}</span>
                          <span className="diary-entry-label">{entry.moodLabel}</span>
                        </div>
                        <div className="diary-entry-time-group">
                          <span className="diary-entry-time">{entry.dateStr} • {entry.timestamp}</span>
                          <button
                            className="diary-entry-del"
                            onClick={() => handleDeleteDiary(entry.id)}
                            title="Delete entry"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      <p className="diary-entry-text">{entry.text}</p>
                    </div>
                  ))
                ) : (
                  /* Empty State for Diary */
                  <div className="my-day-empty-state compact">
                    <BookOpen size={28} style={{ color: 'var(--text-muted)' }} />
                    <h4>No reflections logged yet</h4>
                    <p>Select a mood above and write your first reflection!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
