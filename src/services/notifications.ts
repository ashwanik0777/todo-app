import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { Task } from '../types/task';
import { parseTaskDueDateTime } from '../utils/date';

let configured = false;
let notificationHandlerConfigured = false;
let notificationsModule: typeof import('expo-notifications') | null = null;

const isExpoGoAndroid = Platform.OS === 'android' && Constants.appOwnership === 'expo';

export const isNotificationsSupported = () => !isExpoGoAndroid;

const getNotificationsModule = async () => {
  if (!isNotificationsSupported()) {
    return null;
  }

  if (!notificationsModule) {
    notificationsModule = await import('expo-notifications');
  }

  if (!notificationHandlerConfigured) {
    notificationsModule.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    notificationHandlerConfigured = true;
  }

  return notificationsModule;
};

const ensurePermissions = async () => {
  const Notifications = await getNotificationsModule();
  if (!Notifications) {
    return false;
  }

  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted || existing.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted || requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
};

export const hasNotificationPermission = async () => {
  const Notifications = await getNotificationsModule();
  if (!Notifications) {
    return false;
  }

  const existing = await Notifications.getPermissionsAsync();
  return existing.granted || existing.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
};

export const requestNotificationPermission = async () => ensurePermissions();

export const configureNotifications = async () => {
  if (configured) {
    return;
  }

  const Notifications = await getNotificationsModule();
  if (!Notifications) {
    configured = true;
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

  configured = true;
};

export const cancelTaskReminders = async (notificationIds?: string[]) => {
  if (!notificationIds?.length) {
    return;
  }

  const Notifications = await getNotificationsModule();
  if (!Notifications) {
    return;
  }

  await Promise.all(notificationIds.map((notificationId) => Notifications.cancelScheduledNotificationAsync(notificationId)));
};

export const scheduleTaskReminders = async (task: Task): Promise<string[]> => {
  const Notifications = await getNotificationsModule();
  if (!Notifications) {
    return [];
  }

  const hasPermission = await ensurePermissions();
  if (!hasPermission || task.status === 'completed') {
    return [];
  }

  const dueDate = parseTaskDueDateTime(task);
  if (!dueDate) {
    return [];
  }

  if (dueDate.getTime() <= Date.now()) {
    return [];
  }

  const scheduledIds: string[] = [];
  const channelId = Platform.OS === 'android' ? 'task-reminders' : undefined;
  const beforeThirtyMins = new Date(dueDate.getTime() - 30 * 60 * 1000);

  if (beforeThirtyMins.getTime() > Date.now()) {
    const preReminderId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Task due in 30 minutes',
        body: `Only 30 minutes left for "${task.title}". Please complete it soon.`,
        sound: true,
        data: { taskId: task.id, reminderType: 'pre30' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: beforeThirtyMins,
        channelId,
      },
    });

    scheduledIds.push(preReminderId);
  }

  const dueReminderId = await Notifications.scheduleNotificationAsync({
    content: {
      title: task.priority === 'high' ? 'High priority task is due now' : 'Task due now',
      body: `The due time has arrived for "${task.title}". Complete it now.`,
      sound: true,
      data: { taskId: task.id, reminderType: 'due' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: dueDate,
      channelId,
    },
  });

  scheduledIds.push(dueReminderId);
  return scheduledIds;
};
