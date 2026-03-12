import React, { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { CalendarClock, CircleCheckBig, Flag, Tag } from 'lucide-react-native';
import { Task } from '../types/task';
import { formatDue } from '../utils/date';

type TaskCardProps = {
  task: Task;
  onPress: () => void;
};

const priorityStyles: Record<Task['priority'], string> = {
  low: 'text-emerald-500',
  medium: 'text-amber-500',
  high: 'text-rose-500',
};

const TaskCardComponent = ({ task, onPress }: TaskCardProps) => {
  return (
    <Pressable
      onPress={onPress}
      className="mb-3 rounded-3xl border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-base font-semibold leading-6 text-zinc-900 dark:text-zinc-50">{task.title}</Text>
          {!!task.description && (
            <Text numberOfLines={2} className="mt-1.5 text-sm leading-5 text-zinc-500 dark:text-zinc-400">
              {task.description}
            </Text>
          )}
        </View>
        {task.status === 'completed' && <CircleCheckBig size={18} color="#10b981" />}
      </View>

      <View className="mt-4 flex-row flex-wrap gap-x-3 gap-y-2">
        <View className="flex-row items-center gap-1 rounded-full bg-zinc-100 px-2 py-1 dark:bg-zinc-800">
          <CalendarClock size={14} color="#71717a" />
          <Text className="text-xs text-zinc-500 dark:text-zinc-400">{formatDue(task)}</Text>
        </View>

        <View className="flex-row items-center gap-1 rounded-full bg-zinc-100 px-2 py-1 dark:bg-zinc-800">
          <Flag size={14} color="#71717a" />
          <Text className={`text-xs font-medium uppercase ${priorityStyles[task.priority]}`}>{task.priority}</Text>
        </View>

        <View className="flex-row items-center gap-1 rounded-full bg-zinc-100 px-2 py-1 dark:bg-zinc-800">
          <Tag size={14} color="#71717a" />
          <Text className="text-xs text-zinc-500 dark:text-zinc-400">{task.category}</Text>
        </View>
      </View>
    </Pressable>
  );
};

export const TaskCard = memo(TaskCardComponent);
