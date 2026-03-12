import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '../types/task';

const TASKS_STORAGE_KEY = 'todo-app/tasks';

export const loadTasks = async (): Promise<Task[]> => {
  const raw = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as Task[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveTasks = async (tasks: Task[]) => {
  await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
};
