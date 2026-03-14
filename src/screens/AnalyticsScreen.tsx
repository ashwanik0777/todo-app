import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppFooter } from '../components';
import { useTasks } from '../contexts/TaskContext';
import { RootStackParamList } from '../navigation/types';
import { isOverdue, isToday } from '../utils/date';

type Props = NativeStackScreenProps<RootStackParamList, 'Analytics'>;

const MetricCard = ({ label, value }: { label: string; value: number }) => (
  <View className="flex-1 rounded-3xl border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
    <Text className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</Text>
    <Text className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">{value}</Text>
  </View>
);

export const AnalyticsScreen = ({}: Props) => {
  const { tasks } = useTasks();

  const metrics = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.status === 'completed').length;
    const pending = tasks.filter((task) => task.status === 'pending').length;
    const overdue = tasks.filter((task) => isOverdue(task)).length;
    const today = tasks.filter((task) => isToday(task)).length;
    const highPriorityPending = tasks.filter((task) => task.status === 'pending' && task.priority === 'high').length;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const completedLast7Days = tasks.filter((task) => {
      if (!task.completedAt) {
        return false;
      }

      return new Date(task.completedAt).getTime() >= sevenDaysAgo.getTime();
    }).length;

    return { total, completed, pending, overdue, today, highPriorityPending, completedLast7Days };
  }, [tasks]);

  const completionRate = metrics.total ? Math.round((metrics.completed / metrics.total) * 100) : 0;

  return (
    <View className="flex-1 bg-zinc-50 px-4 pt-4 dark:bg-zinc-950">
      <View className="mb-4 rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <Text className="text-sm text-zinc-500 dark:text-zinc-400">Completion Rate</Text>
        <Text className="mt-1 text-3xl font-bold text-zinc-900 dark:text-zinc-100">{completionRate}%</Text>
      </View>

      <View className="mb-3 flex-row gap-3">
        <MetricCard label="Total" value={metrics.total} />
        <MetricCard label="Completed" value={metrics.completed} />
      </View>
      <View className="mb-3 flex-row gap-3">
        <MetricCard label="Pending" value={metrics.pending} />
        <MetricCard label="Today" value={metrics.today} />
      </View>
      <View className="mb-3 flex-row gap-3">
        <MetricCard label="Overdue" value={metrics.overdue} />
        <MetricCard label="Done (7d)" value={metrics.completedLast7Days} />
      </View>
      <View className="flex-row gap-3">
        <MetricCard label="High Priority Open" value={metrics.highPriorityPending} />
      </View>

      <View className="mt-auto pb-4">
        <AppFooter />
      </View>
    </View>
  );
};
