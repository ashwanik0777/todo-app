import React from 'react';
import { Pressable } from 'react-native';
import { Moon, Sun } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggleButton = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <Pressable
      onPress={toggleTheme}
      className="mr-2 rounded-xl border border-zinc-200 bg-zinc-100 p-2 dark:border-zinc-700 dark:bg-zinc-800"
    >
      {isDark ? <Sun size={16} color="#f4f4f5" /> : <Moon size={16} color="#27272a" />}
    </Pressable>
  );
};
