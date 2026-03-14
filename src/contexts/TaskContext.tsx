import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { loadTasks, saveTasks } from '../storage/tasksStorage';
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
  };

  const updateTask = (id: string, updates: Partial<TaskInput>) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : task,
      ),
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const duplicateTask = (id: string) => {
    setTasks((prev) => {
      const original = prev.find((task) => task.id === id);
      if (!original) {
        return prev;
      }

      const now = new Date().toISOString();
      const clone: Task = {
        ...original,
        id: createId(),
        title: `${original.title} (Copy)`,
        subtasks: cloneSubtasksWithNewIds(original.subtasks),
        status: 'pending',
        completedAt: undefined,
        createdAt: now,
        updatedAt: now,
      };

      return [clone, ...prev];
    });
  };

  const clearCompletedTasks = () => {
    let removedCount = 0;

    setTasks((prev) => {
      removedCount = prev.filter((task) => task.status === 'completed').length;
      return prev.filter((task) => task.status !== 'completed');
    });

    return removedCount;
  };

  const toggleTaskCompletion = (id: string) => {
    let nextTask: Task | undefined;

    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) {
          return task;
        }

        const isNowCompleted = task.status !== 'completed';
        nextTask = {
          ...task,
          status: isNowCompleted ? 'completed' : 'pending',
          completedAt: isNowCompleted ? new Date().toISOString() : undefined,
          updatedAt: new Date().toISOString(),
        };

        return nextTask;
      }),
    );

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
