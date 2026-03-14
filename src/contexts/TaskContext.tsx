import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { loadTasks, saveTasks } from '../storage/tasksStorage';
import { cancelTaskReminder, scheduleTaskReminder } from '../services/notifications';
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
      const reminderNotificationId = await scheduleTaskReminder(task);
      if (!reminderNotificationId) {
        return;
      }

      setTasks((prev) => prev.map((prevTask) => (prevTask.id === task.id ? { ...prevTask, reminderNotificationId } : prevTask)));
    })();
  };

  const updateTask = (id: string, updates: Partial<TaskInput>) => {
    let updatedTask: Task | undefined;
    let oldReminderId: string | undefined;

    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) {
          return task;
        }

        oldReminderId = task.reminderNotificationId;
        updatedTask = {
          ...task,
          ...updates,
          reminderNotificationId: undefined,
          updatedAt: new Date().toISOString(),
        };

        return updatedTask;
      }),
    );

    void (async () => {
      await cancelTaskReminder(oldReminderId);
      if (!updatedTask || updatedTask.status === 'completed') {
        return;
      }

      const reminderNotificationId = await scheduleTaskReminder(updatedTask);
      if (!reminderNotificationId) {
        return;
      }

      setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, reminderNotificationId } : task)));
    })();
  };

  const deleteTask = (id: string) => {
    let reminderNotificationId: string | undefined;

    setTasks((prev) => {
      const task = prev.find((item) => item.id === id);
      reminderNotificationId = task?.reminderNotificationId;
      return prev.filter((item) => item.id !== id);
    });

    void cancelTaskReminder(reminderNotificationId);
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
      reminderNotificationId: undefined,
      completedAt: undefined,
      createdAt: now,
      updatedAt: now,
    };

    setTasks((prev) => [clone, ...prev]);

    void (async () => {
      const reminderNotificationId = await scheduleTaskReminder(clone);
      if (!reminderNotificationId) {
        return;
      }

      setTasks((current) => current.map((task) => (task.id === clone.id ? { ...task, reminderNotificationId } : task)));
    })();
  };

  const clearCompletedTasks = () => {
    let removedCount = 0;
    let reminderIdsToCancel: string[] = [];

    setTasks((prev) => {
      const completedTasks = prev.filter((task) => task.status === 'completed');
      removedCount = completedTasks.length;
      reminderIdsToCancel = completedTasks.map((task) => task.reminderNotificationId).filter((id): id is string => Boolean(id));
      return prev.filter((task) => task.status !== 'completed');
    });

    if (reminderIdsToCancel.length) {
      void Promise.all(reminderIdsToCancel.map((id) => cancelTaskReminder(id)));
    }

    return removedCount;
  };

  const toggleTaskCompletion = (id: string) => {
    let nextTask: Task | undefined;
    let previousReminderId: string | undefined;

    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) {
          return task;
        }

        const isNowCompleted = task.status !== 'completed';
        previousReminderId = task.reminderNotificationId;
        nextTask = {
          ...task,
          status: isNowCompleted ? 'completed' : 'pending',
          reminderNotificationId: isNowCompleted ? undefined : task.reminderNotificationId,
          completedAt: isNowCompleted ? new Date().toISOString() : undefined,
          updatedAt: new Date().toISOString(),
        };

        return nextTask;
      }),
    );

    void (async () => {
      await cancelTaskReminder(previousReminderId);

      if (!nextTask || nextTask.status === 'completed') {
        return;
      }

      const reminderNotificationId = await scheduleTaskReminder(nextTask);
      if (!reminderNotificationId) {
        return;
      }

      setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, reminderNotificationId } : task)));
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
