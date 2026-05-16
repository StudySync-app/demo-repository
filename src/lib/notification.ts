import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { getSettingsSnapshot } from "../db/settings";

const CHANNEL_ID = "studysync-reminders";
const TASK_REMINDER_PREFIX = "studysync.taskReminder.";

export function configureNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "StudySync reminders",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#4B76E7",
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    }).catch(() => undefined);
  }
}

async function ensureNotificationsAllowed(category: "todo" | "note" | "media") {
  const settings = getSettingsSnapshot();
  if (!settings.notificationsEnabled) return null;
  if (category === "todo" && !settings.notifyTodos) return null;
  if (category === "note" && !settings.notifyStudyNotes) return null;
  if (category === "media" && !settings.notifyMedia) return null;

  configureNotifications();

  const { status } = await Notifications.getPermissionsAsync();
  const permission = status === "granted" ? status : (await Notifications.requestPermissionsAsync()).status;
  return permission === "granted" ? settings : null;
}

function content(title: string, body: string, soundEnabled = true): Notifications.NotificationContentInput {
  return {
    title,
    body,
    sound: soundEnabled ? "default" : undefined,
  };
}

function dateTrigger(date: Date): Notifications.DateTriggerInput {
  return {
    type: Notifications.SchedulableTriggerInputTypes.DATE,
    date,
    channelId: CHANNEL_ID,
  };
}

async function cancelStoredNotification(key: string) {
  const existing = await AsyncStorage.getItem(key);
  if (existing) {
    await Notifications.cancelScheduledNotificationAsync(existing).catch(() => undefined);
    await AsyncStorage.removeItem(key);
  }
}

export async function scheduleTaskReminder(title: string, date: Date, taskId?: number | null) {
  const settings = await ensureNotificationsAllowed("todo");
  if (!settings) return null;

  if (taskId != null) {
    await cancelStoredNotification(`${TASK_REMINDER_PREFIX}${taskId}`);
  }

  if (date.getTime() <= Date.now()) {
    return null;
  }

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: content("StudySync Reminder", `Task due: ${title}`, settings.soundEnabled),
    trigger: dateTrigger(date),
  });

  if (taskId != null) {
    await AsyncStorage.setItem(`${TASK_REMINDER_PREFIX}${taskId}`, notificationId);
  }

  return notificationId;
}

export async function cancelTaskReminder(taskId: number) {
  await cancelStoredNotification(`${TASK_REMINDER_PREFIX}${taskId}`);
}

export async function notifyNewTask(title: string) {
  const settings = await ensureNotificationsAllowed("todo");
  if (!settings) return null;
  return Notifications.scheduleNotificationAsync({
    content: content("To-do added", title, settings.soundEnabled),
    trigger: null,
  });
}

export async function notifyNewNote(title: string) {
  const settings = await ensureNotificationsAllowed("note");
  if (!settings) return null;
  return Notifications.scheduleNotificationAsync({
    content: content("Study note saved", title || "Untitled note", settings.soundEnabled),
    trigger: null,
  });
}

export async function notifyNewMedia(name: string) {
  const settings = await ensureNotificationsAllowed("media");
  if (!settings) return null;
  return Notifications.scheduleNotificationAsync({
    content: content("Media imported", name || "New media file", settings.soundEnabled),
    trigger: null,
  });
}

export async function scheduleNoteReviewReminder(title: string, minutesFromNow = 60 * 24) {
  const settings = await ensureNotificationsAllowed("note");
  if (!settings) return null;

  const date = new Date(Date.now() + minutesFromNow * 60 * 1000);
  if (date.getTime() <= Date.now()) return null;

  return Notifications.scheduleNotificationAsync({
    content: content("Review your note", title || "Untitled note", settings.soundEnabled),
    trigger: dateTrigger(date),
  });
}
