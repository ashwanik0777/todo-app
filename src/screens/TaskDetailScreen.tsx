import React from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CalendarClock, Copy, Flag, Pencil, Tag, Trash2 } from 'lucide-react-native';
import { AppFooter } from '../components';
import { useTasks } from '../contexts/TaskContext';
import { useToast } from '../contexts/ToastContext';
import { RootStackParamList } from '../navigation/types';
import { formatDue } from '../utils/date';
import { getMotivationalMessage } from '../utils/motivation';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskDetail'>;

const ActionButton = ({
  label,
  onPress,
  variant = 'primary',
  icon,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'danger' | 'neutral';
  icon?: React.ReactNode;
}) => {
  const style =
    variant === 'danger'
      ? 'bg-rose-600'
      : variant === 'neutral'
        ? 'bg-zinc-200 dark:bg-zinc-800'
        : 'bg-zinc-900';

  const textStyle = variant === 'neutral' ? 'text-zinc-900 dark:text-zinc-100' : 'text-white dark:text-zinc-900';

  return (
    <Pressable onPress={onPress} className={`h-11 flex-1 flex-row items-center justify-center gap-2 rounded-xl ${style}`}>
      {icon}
      <Text className={`text-sm font-semibold ${textStyle}`}>{label}</Text>
    </Pressable>
  );
};

export const TaskDetailScreen = ({ route, navigation }: Props) => {
  const { taskId } = route.params;
  const { getTaskById, deleteTask, duplicateTask, toggleTaskCompletion, toggleSubtaskCompletion } = useTasks();
  const { showToast } = useToast();
  const task = getTaskById(taskId);

  if (!task) {
    return (
      <View className="flex-1 items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
        <Text className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Task not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="pt-4">
        <Text className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{task.title}</Text>
        <Text className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{task.description || 'No description provided.'}</Text>

        <View className="mt-4 gap-2 rounded-3xl border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <View className="flex-row items-center gap-2">
            <CalendarClock size={16} color="#71717a" />
            <Text className="text-sm text-zinc-700 dark:text-zinc-200">{formatDue(task)}</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Flag size={16} color="#71717a" />
            <Text className="text-sm capitalize text-zinc-700 dark:text-zinc-200">{task.priority} priority</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Tag size={16} color="#71717a" />
            <Text className="text-sm text-zinc-700 dark:text-zinc-200">{task.category}</Text>
          </View>
        </View>

        {task.tags.length > 0 && (
          <View className="mt-4 flex-row flex-wrap gap-2">
            {task.tags.map((tag) => (
              <View key={tag} className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-900">
                <Text className="text-xs text-zinc-600 dark:text-zinc-300">#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {task.subtasks.length > 0 && (
          <View className="mt-4 rounded-3xl border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <Text className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Subtasks</Text>
            {task.subtasks.map((subtask) => (
              <Pressable
                key={subtask.id}
                onPress={() => toggleSubtaskCompletion(task.id, subtask.id)}
                className="mb-2 flex-row items-center justify-between rounded-2xl border border-zinc-200 px-3 py-2.5 dark:border-zinc-700"
              >
                <Text className={`text-sm ${subtask.completed ? 'text-zinc-400 line-through' : 'text-zinc-700 dark:text-zinc-200'}`}>
                  {subtask.title}
                </Text>
                <Text className="text-xs text-zinc-500">{subtask.completed ? 'Done' : 'Pending'}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <View className="mt-6 flex-row gap-2">
          <ActionButton
            label={task.status === 'completed' ? 'Reopen' : 'Complete'}
            onPress={() => {
              const updated = toggleTaskCompletion(task.id);
              if (updated?.status === 'completed') {
                showToast(getMotivationalMessage());
              }
            }}
            icon={<Flag size={14} color="#ffffff" />}
          />
          <ActionButton
            label="Edit"
            variant="neutral"
            onPress={() => navigation.navigate('AddTask', { taskId: task.id })}
            icon={<Pencil size={14} color="#52525b" />}
          />
        </View>

        <View className="mt-2 flex-row gap-2">
          <ActionButton
            label="Duplicate"
            variant="neutral"
            onPress={() => duplicateTask(task.id)}
            icon={<Copy size={14} color="#52525b" />}
          />
          <ActionButton
            label="Delete"
            variant="danger"
            onPress={() => {
              Alert.alert('Delete task', 'Are you sure you want to delete this task?', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => {
                    deleteTask(task.id);
                    navigation.goBack();
                  },
                },
              ]);
            }}
            icon={<Trash2 size={14} color="#ffffff" />}
          />
        </View>

        </View>
      </ScrollView>

      <View className="px-4 pb-4 pt-2">
        <AppFooter />
      </View>
    </View>
  );
};
