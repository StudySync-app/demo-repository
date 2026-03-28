import * as Notifications from "expo-notifications";

export async function scheduleTaskReminder(title: string, date: Date) {

  const trigger: Notifications.DateTriggerInput = {
    type: Notifications.SchedulableTriggerInputTypes.DATE,
    date: date,
  };

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "StudySync Reminder",
      body: `Task due: ${title}`,
    },
    trigger,
  });
}