import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Task } from '../types/task';
import { parseTaskDueDateTime } from '../utils/date';

let configured = false;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const ensurePermissions = async () => {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted || existing.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted || requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
};

export const configureNotifications = async () => {
  if (configured) {
    return;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('task-reminders', {
      name: 'Task Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 150, 100, 150],
      lightColor: '#22c55e',
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }

  await ensurePermissions();
  configured = true;
};

export const cancelTaskReminder = async (notificationId?: string) => {
  if (!notificationId) {
    return;
  }

  await Notifications.cancelScheduledNotificationAsync(notificationId);
};

export const scheduleTaskReminder = async (task: Task): Promise<string | undefined> => {
  const hasPermission = await ensurePermissions();
  if (!hasPermission || task.status === 'completed') {
    return undefined;
  }

  const dueDate = parseTaskDueDateTime(task);
  if (!dueDate) {
    return undefined;
  }

  const triggerDate = new Date(dueDate.getTime());
  if (triggerDate.getTime() <= Date.now()) {
    return undefined;
  }

  const title = task.priority === 'high' ? 'High priority task due soon' : 'Task reminder';
  const body = `${task.title} • Due ${task.dueDate} ${task.dueTime}`;

  return Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
      data: { taskId: task.id },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
      channelId: Platform.OS === 'android' ? 'task-reminders' : undefined,
    },
  });
};
