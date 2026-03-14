import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CircleCheckBig, ListTodo, Plus } from 'lucide-react-native';
import { AppFooter } from '../components';
import { FilterTabs } from '../components/FilterTabs';
import { EmptyState } from '../components/EmptyState';
import { SwipeableTaskItem } from '../components/SwipeableTaskItem';
import { useToast } from '../contexts/ToastContext';
import { useTaskFilters } from '../hooks/useTaskFilters';
import { RootStackParamList } from '../navigation/types';
import { useTasks } from '../contexts/TaskContext';
import { getMotivationalMessage } from '../utils/motivation';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export const HomeScreen = ({ navigation }: Props) => {
  const { tasks, deleteTask, toggleTaskCompletion } = useTasks();
  const { activeFilter, setActiveFilter, filteredTasks } = useTaskFilters(tasks);
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const completedCount = useMemo(() => tasks.filter((task) => task.status === 'completed').length, [tasks]);

  const normalizedSearchQuery = useMemo(() => searchQuery.trim().toLowerCase(), [searchQuery]);

  const searchedTasks = useMemo(() => {
    if (!normalizedSearchQuery) {
      return filteredTasks;
    }

    return filteredTasks.filter((task) => {
      const fields = [task.title, task.description, task.category, task.tags.join(' ')].join(' ').toLowerCase();
      return fields.includes(normalizedSearchQuery);
    });
  }, [filteredTasks, normalizedSearchQuery]);

  const subtitle = useMemo(() => {
    if (!searchedTasks.length) {
      return 'No tasks in this filter yet.';
    }

    return `${searchedTasks.length} task${searchedTasks.length === 1 ? '' : 's'}`;
  }, [searchedTasks.length]);

  return (
    <View className="flex-1 bg-zinc-50 px-4 dark:bg-zinc-950">
      <View className="pb-3 pt-4">
        <Text className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">My Tasks</Text>
        <Text className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</Text>
      </View>

      <View className="mb-4 flex-row gap-3">
        <View className="flex-1 rounded-3xl border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <View className="flex-row items-center gap-2">
            <ListTodo size={16} color="#52525b" />
            <Text className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Active</Text>
          </View>
          <Text className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">{tasks.length - completedCount}</Text>
        </View>
        <View className="flex-1 rounded-3xl border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <View className="flex-row items-center gap-2">
            <CircleCheckBig size={16} color="#10b981" />
            <Text className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Completed</Text>
          </View>
          <Text className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">{completedCount}</Text>
        </View>
      </View>

      <FilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />

      <View className="mb-3 flex-row items-center rounded-2xl border border-zinc-200 bg-white px-3 dark:border-zinc-800 dark:bg-zinc-900">
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by title, category, tags..."
          placeholderTextColor="#a1a1aa"
          className="h-11 flex-1 text-sm text-zinc-900 dark:text-zinc-100"
        />
        {!!searchQuery.trim().length && (
          <Pressable onPress={() => setSearchQuery('')} className="rounded-lg px-2 py-1">
            <Text className="text-xs font-semibold text-zinc-500 dark:text-zinc-300">Clear</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        data={searchedTasks}
        keyExtractor={(item) => item.id}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <SwipeableTaskItem
            task={item}
            onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
            onDelete={() => deleteTask(item.id)}
            onComplete={() => {
              const updated = toggleTaskCompletion(item.id);
              if (updated?.status === 'completed') {
                showToast(getMotivationalMessage());
              }
            }}
          />
        )}
        contentContainerStyle={{ paddingBottom: 96 }}
        ListEmptyComponent={
          <EmptyState
            title="Nothing here yet"
            subtitle={normalizedSearchQuery ? 'Try another keyword or clear search.' : 'Create a task to get started.'}
          />
        }
      />

      <View className="pb-4">
        <AppFooter />
      </View>

      <Pressable
        onPress={() => navigation.navigate('AddTask')}
        className="absolute bottom-28 right-6 h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 shadow-sm"
      >
        <Plus size={22} color="#ffffff" />
      </Pressable>
    </View>
  );
};
