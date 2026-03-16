import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import Animated from 'react-native-reanimated';
import { Check, Trash2 } from 'lucide-react-native';
import { Task } from '../types/task';
import { TaskCard } from './TaskCard';

type SwipeableTaskItemProps = {
  task: Task;
  onPress: () => void;
  onComplete: () => void;
  onDelete: () => void;
};

const ActionButton = ({
  label,
  icon,
  backgroundClass,
  onPress,
}: {
  label: string;
  icon: React.ReactNode;
  backgroundClass: string;
  onPress: () => void;
}) => (
  <Pressable onPress={onPress} className={`my-1 w-24 items-center justify-center rounded-2xl ${backgroundClass}`}>
    {icon}
    <Text className="mt-1 text-xs font-semibold text-white">{label}</Text>
  </Pressable>
);

export const SwipeableTaskItem = ({ task, onPress, onComplete, onDelete }: SwipeableTaskItemProps) => {
  const renderLeftActions =
    task.status === 'completed'
      ? undefined
      : () => (
          <Animated.View className="mr-2">
            <ActionButton
              label="Complete"
              onPress={onComplete}
              backgroundClass="bg-emerald-600"
              icon={<Check size={16} color="#ffffff" />}
            />
          </Animated.View>
        );

  const renderRightActions = () => (
    <Animated.View className="ml-2">
      <ActionButton
        label="Delete"
        onPress={onDelete}
        backgroundClass="bg-rose-600"
        icon={<Trash2 size={16} color="#ffffff" />}
      />
    </Animated.View>
  );

  return (
    <Swipeable renderLeftActions={renderLeftActions} renderRightActions={renderRightActions} overshootLeft={false} overshootRight={false}>
      <TaskCard task={task} onPress={onPress} />
    </Swipeable>
  );
};
