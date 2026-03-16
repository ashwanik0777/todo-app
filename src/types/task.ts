export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'completed';

export type Subtask = {
  id: string;
  title: string;
  completed: boolean;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  dueTime: string;
  priority: TaskPriority;
  category: string;
  tags: string[];
  subtasks: Subtask[];
  status: TaskStatus;
  reminderNotificationIds?: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
};

export type TaskInput = {
  title: string;
  description: string;
  dueDate: string;
  dueTime: string;
  priority: TaskPriority;
  category: string;
  tags: string[];
  subtasks: Subtask[];
};

export const PRIORITY_OPTIONS: TaskPriority[] = ['low', 'medium', 'high'];
export const DEFAULT_CATEGORIES = ['Work', 'Personal', 'Health', 'Learning'];
