import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = 'todo-app/theme';

export type StoredTheme = 'light' | 'dark';

export const loadTheme = async (): Promise<StoredTheme | null> => {
  const value = await AsyncStorage.getItem(THEME_STORAGE_KEY);
  if (value === 'light' || value === 'dark') {
    return value;
  }
  return null;
};

export const saveTheme = async (theme: StoredTheme) => {
  await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
};
