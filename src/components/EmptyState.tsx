import React from 'react';
import { Text, View } from 'react-native';
import { ClipboardList } from 'lucide-react-native';

type EmptyStateProps = {
  title: string;
  subtitle: string;
};

export const EmptyState = ({ title, subtitle }: EmptyStateProps) => {
  return (
    <View className="mt-16 items-center px-8">
      <View className="mb-4 rounded-full border border-zinc-200 bg-zinc-100 p-4 dark:border-zinc-700 dark:bg-zinc-800">
        <ClipboardList size={22} color="#71717a" />
      </View>
      <Text className="text-base font-semibold text-zinc-800 dark:text-zinc-100">{title}</Text>
      <Text className="mt-1 text-center text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</Text>
    </View>
  );
};
