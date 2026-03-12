import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Plus, X } from 'lucide-react-native';
import { AppFooter } from './AppFooter';
import { PRIORITY_OPTIONS, Task } from '../types/task';

type TaskFormValues = {
  title: string;
  description: string;
  dueDate: string;
  dueTime: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  tagsText: string;
  subtasks: { id: string; title: string; completed: boolean }[];
};

type TaskFormSubmitPayload = {
  title: string;
  description: string;
  dueDate: string;
  dueTime: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  tags: string[];
  subtasks: { id: string; title: string; completed: boolean }[];
};

type TaskFormProps = {
  initialTask?: Task;
  submitLabel: string;
  onSubmit: (payload: TaskFormSubmitPayload) => void;
};

const inputClassName =
  'rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100';

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const TaskForm = ({ initialTask, submitLabel, onSubmit }: TaskFormProps) => {
  const [form, setForm] = useState<TaskFormValues>(() => {
    const today = new Date().toISOString().split('T')[0];

    return {
      title: initialTask?.title ?? '',
      description: initialTask?.description ?? '',
      dueDate: initialTask?.dueDate ?? today,
      dueTime: initialTask?.dueTime ?? '18:00',
      priority: initialTask?.priority ?? 'medium',
      category: initialTask?.category ?? 'Personal',
      tagsText: initialTask?.tags?.join(', ') ?? '',
      subtasks: initialTask?.subtasks ?? [],
    };
  });
  const [subtaskDraft, setSubtaskDraft] = useState('');

  const isValid = useMemo(() => form.title.trim().length > 0, [form.title]);

  const updateField = <T extends keyof TaskFormValues>(key: T, value: TaskFormValues[T]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addSubtask = () => {
    if (!subtaskDraft.trim()) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      subtasks: [...prev.subtasks, { id: createId(), title: subtaskDraft.trim(), completed: false }],
    }));
    setSubtaskDraft('');
  };

  const removeSubtask = (subtaskId: string) => {
    setForm((prev) => ({
      ...prev,
      subtasks: prev.subtasks.filter((subtask) => subtask.id !== subtaskId),
    }));
  };

  const handleSubmit = () => {
    if (!isValid) {
      return;
    }

    const tags = form.tagsText
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      dueDate: form.dueDate.trim(),
      dueTime: form.dueTime.trim(),
      priority: form.priority,
      category: form.category.trim() || 'Personal',
      tags,
      subtasks: form.subtasks,
    });
  };

  return (
    <View className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <ScrollView className="flex-1 px-4" keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="pt-4">
        <View className="mb-4 rounded-3xl border border-zinc-200/80 bg-white px-4 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <Text className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Task Information</Text>
          <Text className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Fill details clearly for better planning.</Text>
        </View>

        <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Title</Text>
        <TextInput value={form.title} onChangeText={(value) => updateField('title', value)} className={inputClassName} placeholder="Task title" placeholderTextColor="#a1a1aa" />

        <Text className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Description</Text>
        <TextInput
          value={form.description}
          onChangeText={(value) => updateField('description', value)}
          className={`${inputClassName} min-h-24`}
          multiline
          textAlignVertical="top"
          placeholder="Task description"
          placeholderTextColor="#a1a1aa"
        />

        <View className="mt-4 flex-row gap-3">
          <View className="flex-1">
            <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Due date</Text>
            <TextInput
              value={form.dueDate}
              onChangeText={(value) => updateField('dueDate', value)}
              className={inputClassName}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#a1a1aa"
            />
          </View>
          <View className="flex-1">
            <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Due time</Text>
            <TextInput
              value={form.dueTime}
              onChangeText={(value) => updateField('dueTime', value)}
              className={inputClassName}
              placeholder="HH:mm"
              placeholderTextColor="#a1a1aa"
            />
          </View>
        </View>

        <Text className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Priority</Text>
        <View className="flex-row gap-2 rounded-xl border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-700 dark:bg-zinc-900">
          {PRIORITY_OPTIONS.map((priority) => {
            const active = form.priority === priority;
            return (
              <Pressable
                key={priority}
                onPress={() => updateField('priority', priority)}
                className={`flex-1 rounded-lg py-2 ${active ? 'bg-white dark:bg-zinc-800' : ''}`}
              >
                <Text className={`text-center text-sm font-medium capitalize ${active ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400'}`}>
                  {priority}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Category</Text>
        <TextInput value={form.category} onChangeText={(value) => updateField('category', value)} className={inputClassName} placeholder="Personal" placeholderTextColor="#a1a1aa" />

        <Text className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Tags</Text>
        <TextInput
          value={form.tagsText}
          onChangeText={(value) => updateField('tagsText', value)}
          className={inputClassName}
          placeholder="work, urgent, planning"
          placeholderTextColor="#a1a1aa"
        />

        <Text className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Subtasks</Text>
        <View className="flex-row items-center gap-2">
          <TextInput
            value={subtaskDraft}
            onChangeText={setSubtaskDraft}
            className={`${inputClassName} flex-1`}
            placeholder="Add a subtask"
            placeholderTextColor="#a1a1aa"
          />
          <Pressable onPress={addSubtask} className="h-12 w-12 items-center justify-center rounded-xl bg-zinc-900">
            <Plus size={18} color="#ffffff" />
          </Pressable>
        </View>

        {form.subtasks.length > 0 && (
          <View className="mt-2 gap-2">
            {form.subtasks.map((subtask) => (
              <View
                key={subtask.id}
                className="flex-row items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
              >
                <Text className="flex-1 text-sm text-zinc-700 dark:text-zinc-200">{subtask.title}</Text>
                <Pressable onPress={() => removeSubtask(subtask.id)} className="rounded-lg p-1">
                  <X size={14} color="#a1a1aa" />
                </Pressable>
              </View>
            ))}
          </View>
        )}

        <Pressable
          onPress={handleSubmit}
          disabled={!isValid}
          className={`mt-6 rounded-2xl py-3.5 ${isValid ? 'bg-zinc-900' : 'bg-zinc-300 dark:bg-zinc-700'}`}
        >
          <Text className={`text-center text-sm font-semibold ${isValid ? 'text-white' : 'text-zinc-500 dark:text-zinc-300'}`}>
            {submitLabel}
          </Text>
        </Pressable>

        </View>
      </ScrollView>

      <View className="px-4 pb-4 pt-2">
        <AppFooter />
      </View>
    </View>
  );
};
