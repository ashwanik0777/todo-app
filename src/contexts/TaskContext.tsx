import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { loadTasks, saveTasks } from '../storage/tasksStorage';
import { cancelTaskReminders, scheduleTaskReminders } from '../services/notifications';
import { Subtask, Task, TaskInput } from '../types/task';

type TaskContextValue = {
  tasks: Task[];
  hydrated: boolean;
  addTask: (input: TaskInput) => void;
  updateTask: (id: string, updates: Partial<TaskInput>) => void;
  deleteTask: (id: string) => void;
  duplicateTask: (id: string) => void;
  clearCompletedTasks: () => number;
  toggleTaskCompletion: (id: string) => Task | undefined;
  toggleSubtaskCompletion: (taskId: string, subtaskId: string) => void;
  getTaskById: (id: string) => Task | undefined;
};

const TaskContext = createContext<TaskContextValue | undefined>(undefined);

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const cloneSubtasksWithNewIds = (subtasks: Subtask[]) =>
  subtasks.map((subtask) => ({ ...subtask, id: createId() }));

export const TaskProvider = ({ children }: { children: React.ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      const storedTasks = await loadTasks();
      setTasks(storedTasks);
      setHydrated(true);
    };

    void bootstrap();
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    void saveTasks(tasks);
  }, [tasks, hydrated]);

  const addTask = (input: TaskInput) => {
    const now = new Date().toISOString();
    const task: Task = {
      id: createId(),
      title: input.title,
      description: input.description,
      dueDate: input.dueDate,
      dueTime: input.dueTime,
      priority: input.priority,
      category: input.category,
      tags: input.tags,
      subtasks: input.subtasks,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    setTasks((prev) => [task, ...prev]);

    void (async () => {
      const reminderNotificationIds = await scheduleTaskReminders(task);
      if (!reminderNotificationIds.length) {
        return;
      }

      setTasks((prev) => prev.map((prevTask) => (prevTask.id === task.id ? { ...prevTask, reminderNotificationIds } : prevTask)));
    })();
  };

  const updateTask = (id: string, updates: Partial<TaskInput>) => {
    let updatedTask: Task | undefined;
    let oldReminderIds: string[] | undefined;

    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) {
          return task;
        }

        oldReminderIds = task.reminderNotificationIds;
        updatedTask = {
          ...task,
          ...updates,
          reminderNotificationIds: undefined,
          updatedAt: new Date().toISOString(),
        };

        return updatedTask;
      }),
    );

    void (async () => {
      await cancelTaskReminders(oldReminderIds);
      if (!updatedTask || updatedTask.status === 'completed') {
        return;
      }

      const reminderNotificationIds = await scheduleTaskReminders(updatedTask);
      if (!reminderNotificationIds.length) {
        return;
      }

      setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, reminderNotificationIds } : task)));
    })();
  };

  const deleteTask = (id: string) => {
    let reminderNotificationIds: string[] | undefined;

    setTasks((prev) => {
      const task = prev.find((item) => item.id === id);
      reminderNotificationIds = task?.reminderNotificationIds;
      return prev.filter((item) => item.id !== id);
    });

    void cancelTaskReminders(reminderNotificationIds);
  };

  const duplicateTask = (id: string) => {
    const original = tasks.find((task) => task.id === id);
    if (!original) {
      return;
    }

    const now = new Date().toISOString();
    const clone: Task = {
      ...original,
      id: createId(),
      title: `${original.title} (Copy)`,
      subtasks: cloneSubtasksWithNewIds(original.subtasks),
      status: 'pending',
      reminderNotificationIds: undefined,
      completedAt: undefined,
      createdAt: now,
      updatedAt: now,
    };

    setTasks((prev) => [clone, ...prev]);

    void (async () => {
      const reminderNotificationIds = await scheduleTaskReminders(clone);
      if (!reminderNotificationIds.length) {
        return;
      }

      setTasks((current) => current.map((task) => (task.id === clone.id ? { ...task, reminderNotificationIds } : task)));
    })();
  };

  const clearCompletedTasks = () => {
    let removedCount = 0;
    let reminderIdsToCancel: string[] = [];

    setTasks((prev) => {
      const completedTasks = prev.filter((task) => task.status === 'completed');
      removedCount = completedTasks.length;
      reminderIdsToCancel = completedTasks.flatMap((task) => task.reminderNotificationIds ?? []);
      return prev.filter((task) => task.status !== 'completed');
    });

    if (reminderIdsToCancel.length) {
      void cancelTaskReminders(reminderIdsToCancel);
    }

    return removedCount;
  };

  const toggleTaskCompletion = (id: string) => {
    let nextTask: Task | undefined;
    let previousReminderIds: string[] | undefined;

    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) {
          return task;
        }

        if (task.status === 'completed') {
          nextTask = task;
          return task;
        }

        previousReminderIds = task.reminderNotificationIds;
        nextTask = {
          ...task,
          status: 'completed',
          reminderNotificationIds: undefined,
          completedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        return nextTask;
      }),
    );

    void (async () => {
      await cancelTaskReminders(previousReminderIds);
    })();

    return nextTask;
  };

  const toggleSubtaskCompletion = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) {
          return task;
        }

        return {
          ...task,
          subtasks: task.subtasks.map((subtask) =>
            subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask,
          ),
          updatedAt: new Date().toISOString(),
        };
      }),
    );
  };

  const getTaskById = (id: string) => tasks.find((task) => task.id === id);

  const value = useMemo(
    () => ({
      tasks,
      hydrated,
      addTask,
      updateTask,
      deleteTask,
      duplicateTask,
      clearCompletedTasks,
      toggleTaskCompletion,
      toggleSubtaskCompletion,
      getTaskById,
    }),
    [tasks, hydrated],
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTasks = () => {
  const context = useContext(TaskContext);

  if (!context) {
    throw new Error('useTasks must be used inside TaskProvider');
  }

  return context;
};
