import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { FILTERS, SmartFilter } from '../hooks/useTaskFilters';

type FilterTabsProps = {
  activeFilter: SmartFilter;
  onFilterChange: (filter: SmartFilter) => void;
};

export const FilterTabs = ({ activeFilter, onFilterChange }: FilterTabsProps) => {
  return (
    <View className="mb-4 flex-row rounded-2xl border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-800 dark:bg-zinc-900">
      {FILTERS.map((filter) => {
        const active = filter.key === activeFilter;
        return (
          <Pressable
            key={filter.key}
            onPress={() => onFilterChange(filter.key)}
            className={`flex-1 rounded-xl px-2 py-2 ${active ? 'bg-white dark:bg-zinc-800' : ''}`}
          >
            <Text
              className={`text-center text-xs font-semibold ${active ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400'}`}
            >
              {filter.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};
