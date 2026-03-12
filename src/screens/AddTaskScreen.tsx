import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TaskForm } from '../components/TaskForm';
import { useTasks } from '../contexts/TaskContext';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'AddTask'>;

export const AddTaskScreen = ({ route, navigation }: Props) => {
  const taskId = route.params?.taskId;
  const { addTask, updateTask, getTaskById } = useTasks();
  const existingTask = taskId ? getTaskById(taskId) : undefined;

  return (
    <TaskForm
      initialTask={existingTask}
      submitLabel={existingTask ? 'Save Changes' : 'Create Task'}
      onSubmit={(payload) => {
        if (existingTask) {
          updateTask(existingTask.id, payload);
          navigation.replace('TaskDetail', { taskId: existingTask.id });
          return;
        }

        addTask(payload);
        navigation.goBack();
      }}
    />
  );
};
