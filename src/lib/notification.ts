import * as Notifications from "expo-notifications";
import { getSettingsSnapshot } from "../db/settings";

async function ensureNotificationsAllowed(category: "todo" | "note" | "media") {
  const settings = getSettingsSnapshot();
  if (!settings.notificationsEnabled) return null;
  if (category === "todo" && !settings.notifyTodos) return null;
  if (category === "note" && !settings.notifyStudyNotes) return null;
  if (category === "media" && !settings.notifyMedia) return null;

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

export async function scheduleTaskReminder(title: string, date: Date) {
  const settings = await ensureNotificationsAllowed("todo");
  if (!settings) return;

  const trigger: Notifications.DateTriggerInput = {
    type: Notifications.SchedulableTriggerInputTypes.DATE,
    date: date,
    channelId: "studysync-reminders",
  };

  await Notifications.scheduleNotificationAsync({
    content: content("StudySync Reminder", `Task due: ${title}`, settings.soundEnabled),
    trigger,
  });
}

export async function notifyNewTask(title: string) {
  const settings = await ensureNotificationsAllowed("todo");
  if (!settings) return;
  await Notifications.scheduleNotificationAsync({
    content: content("To-do added", title, settings.soundEnabled),
    trigger: null,
  });
}

export async function notifyNewNote(title: string) {
  const settings = await ensureNotificationsAllowed("note");
  if (!settings) return;
  await Notifications.scheduleNotificationAsync({
    content: content("Study note saved", title || "Untitled note", settings.soundEnabled),
    trigger: null,
  });
}

export async function notifyNewMedia(name: string) {
  const settings = await ensureNotificationsAllowed("media");
  if (!settings) return;
  await Notifications.scheduleNotificationAsync({
    content: content("Media imported", name || "New media file", settings.soundEnabled),
    trigger: null,
  });
}

export async function scheduleNoteReviewReminder(title: string, minutesFromNow = 60 * 24) {
  const settings = await ensureNotificationsAllowed("note");
  if (!settings) return;
  const date = new Date(Date.now() + minutesFromNow * 60 * 1000);
  await Notifications.scheduleNotificationAsync({
    content: content("Review your note", title || "Untitled note", settings.soundEnabled),
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
      channelId: "studysync-reminders",
    },
  });
}
