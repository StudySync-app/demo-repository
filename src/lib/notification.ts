import * as Notifications from "expo-notifications";

export async function scheduleTaskReminder(title: string, date: Date) {

  const reminderDate = new Date(date.getTime() - 30 * 60000);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "StudySync Reminder",
      body: `Task due: ${title}`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: reminderDate
    }
  });

}