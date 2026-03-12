import { useMemo, useState } from 'react';
import { Task } from '../types/task';
import { isOverdue, isToday, sortByDueDateAsc } from '../utils/date';

export type SmartFilter = 'today' | 'upcoming' | 'completed' | 'overdue';

export const FILTERS: { key: SmartFilter; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
  { key: 'overdue', label: 'Overdue' },
];

export const useTaskFilters = (tasks: Task[]) => {
  const [activeFilter, setActiveFilter] = useState<SmartFilter>('today');

  const filteredTasks = useMemo(() => {
    const sorted = sortByDueDateAsc(tasks);

    switch (activeFilter) {
      case 'today':
        return sorted.filter((task) => task.status !== 'completed' && isToday(task));
      case 'upcoming':
        return sorted.filter((task) => task.status !== 'completed' && !isOverdue(task));
      case 'completed':
        return sorted.filter((task) => task.status === 'completed');
      case 'overdue':
        return sorted.filter((task) => isOverdue(task));
      default:
        return sorted;
    }
  }, [tasks, activeFilter]);

  return {
    activeFilter,
    setActiveFilter,
    filteredTasks,
  };
};
