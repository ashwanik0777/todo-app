import { Task } from '../types/task';

const toDateTime = (task: Task): Date => {
  const datePart = task.dueDate || new Date().toISOString().split('T')[0];
  const timePart = task.dueTime || '23:59';
  return new Date(`${datePart}T${timePart}:00`);
};

export const isToday = (task: Task) => {
  const due = toDateTime(task);
  const today = new Date();
  return due.toDateString() === today.toDateString();
};

export const isUpcoming = (task: Task) => {
  const due = toDateTime(task);
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
  return due > start;
};

export const isOverdue = (task: Task) => {
  const due = toDateTime(task);
  const now = new Date();
  return task.status !== 'completed' && due < now;
};

export const formatDue = (task: Task) => `${task.dueDate} ${task.dueTime}`;

export const sortByDueDateAsc = (tasks: Task[]) =>
  [...tasks].sort((a, b) => toDateTime(a).getTime() - toDateTime(b).getTime());
