import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '../types/task';

const TASKS_STORAGE_KEY = 'todo-app/tasks';

const MAX_TEXT_LENGTH = 2000;
const MAX_TAGS = 30;
const MAX_SUBTASKS = 200;

const toSafeText = (value: unknown, fallback = '') => {
  if (typeof value !== 'string') {
    return fallback;
  }

  return value.slice(0, MAX_TEXT_LENGTH);
};

const sanitizeTask = (raw: unknown): Task | null => {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const task = raw as Partial<Task>;
  if (!task.id || typeof task.id !== 'string') {
    return null;
  }

  const status = task.status === 'completed' ? 'completed' : 'pending';
  const priority = task.priority === 'high' || task.priority === 'low' ? task.priority : 'medium';

  const tags = Array.isArray(task.tags)
    ? task.tags
        .filter((tag): tag is string => typeof tag === 'string')
        .map((tag) => tag.trim().slice(0, 64))
        .filter(Boolean)
        .slice(0, MAX_TAGS)
    : [];

  const subtasks = Array.isArray(task.subtasks)
    ? task.subtasks
        .filter((subtask): subtask is Task['subtasks'][number] => Boolean(subtask && typeof subtask === 'object' && typeof subtask.id === 'string'))
        .map((subtask) => ({
          id: subtask.id,
          title: toSafeText(subtask.title).trim(),
          completed: Boolean(subtask.completed),
        }))
        .slice(0, MAX_SUBTASKS)
    : [];

  const createdAt = typeof task.createdAt === 'string' ? task.createdAt : new Date().toISOString();
  const updatedAt = typeof task.updatedAt === 'string' ? task.updatedAt : createdAt;

  return {
    id: task.id,
    title: toSafeText(task.title).trim(),
    description: toSafeText(task.description).trim(),
    dueDate: toSafeText(task.dueDate).trim(),
    dueTime: toSafeText(task.dueTime).trim(),
    priority,
    category: toSafeText(task.category, 'Personal').trim() || 'Personal',
    tags,
    subtasks,
    status,
    reminderNotificationId: typeof task.reminderNotificationId === 'string' ? task.reminderNotificationId : undefined,
    createdAt,
    updatedAt,
    completedAt: typeof task.completedAt === 'string' ? task.completedAt : undefined,
  };
};

export const loadTasks = async (): Promise<Task[]> => {
  const raw = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map(sanitizeTask).filter((task): task is Task => task !== null);
  } catch {
    return [];
  }
};

export const saveTasks = async (tasks: Task[]) => {
  await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
};
