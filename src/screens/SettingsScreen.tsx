import React from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MoonStar, Sun } from 'lucide-react-native';
import { AppFooter } from '../components';
import { useTasks } from '../contexts/TaskContext';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export const SettingsScreen = ({}: Props) => {
  const { isDark, theme, toggleTheme } = useTheme();
  const { tasks, clearCompletedTasks } = useTasks();
  const { showToast } = useToast();
  const completedCount = tasks.filter((task) => task.status === 'completed').length;

  return (
    <View className="flex-1 bg-zinc-50 px-4 pt-4 dark:bg-zinc-950">
      <View className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <Text className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Appearance</Text>
        <Text className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Switch between light and dark mode.</Text>

        <Pressable
          onPress={toggleTheme}
          className="mt-4 flex-row items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800"
        >
          <View className="flex-row items-center gap-2">
            {isDark ? <MoonStar size={18} color="#e4e4e7" /> : <Sun size={18} color="#27272a" />}
            <Text className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Current theme</Text>
          </View>
          <Text className="text-sm text-zinc-500 dark:text-zinc-300">{theme === 'dark' ? 'Dark' : 'Light'}</Text>
        </Pressable>
      </View>

      <View className="mt-4 rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <Text className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Task Cleanup</Text>
        <Text className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Remove all completed tasks in one tap.</Text>

        <View className="mt-4 flex-row items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800">
          <Text className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Completed tasks</Text>
          <Text className="text-sm text-zinc-500 dark:text-zinc-300">{completedCount}</Text>
        </View>

        <Pressable
          disabled={completedCount === 0}
          onPress={() => {
            Alert.alert('Clear completed tasks', 'This will permanently remove all completed tasks.', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Clear',
                style: 'destructive',
                onPress: () => {
                  const removed = clearCompletedTasks();
                  showToast(removed > 0 ? `${removed} completed task${removed === 1 ? '' : 's'} removed` : 'No completed tasks to clear');
                },
              },
            ]);
          }}
          className={`mt-4 items-center rounded-2xl py-3 ${completedCount === 0 ? 'bg-zinc-300 dark:bg-zinc-700' : 'bg-rose-600'}`}
        >
          <Text className={`text-sm font-semibold ${completedCount === 0 ? 'text-zinc-500 dark:text-zinc-300' : 'text-white'}`}>
            Clear Completed
          </Text>
        </Pressable>
      </View>

      <View className="mt-auto pb-4">
        <AppFooter />
      </View>
    </View>
  );
};
