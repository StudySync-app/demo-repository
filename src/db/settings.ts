import { eq } from "drizzle-orm";
import { db } from "./client";
import { appSettings } from "./schema";

export const defaultSettings = {
  themeMode: "dark",
  language: "English",
  fontScale: 1,
  useDyslexiaFont: false,
  notificationsEnabled: true,
  notifyTodos: true,
  notifyStudyNotes: true,
  notifyMedia: false,
  soundEnabled: true,
  vibrationEnabled: true,
  aiQuizEnabled: false,
  aiAnswerEnabled: false,
  aiSuggestEnabled: false,
  aiAssistEnabled: false,
  aiRemindEnabled: false,
  aiSummarizeEnabled: false,
  mfaEnabled: false,
  recoveryPhone: "+63 912345678",
  recoveryEmail: "",
  homeAddress: "",
  workAddress: "",
  paymentMethod: "",
  autoBackupsEnabled: false,
  lastBackup: "Never",
};

export type AppSettings = typeof defaultSettings;
export type SettingKey = keyof AppSettings;

function parseValue<T>(raw: string | undefined, defaultValue: T): T {
  if (raw == null) return defaultValue;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return raw as T;
  }
}

export function getSetting<T>(key: string, defaultValue: T): T {
  const row = db
    .select()
    .from(appSettings)
    .where(eq(appSettings.key, key))
    .get();

  return parseValue(row?.value, defaultValue);
}

export function setSetting<T>(key: string, value: T) {
  db
    .insert(appSettings)
    .values({
      key,
      value: JSON.stringify(value),
      updatedAt: new Date().toISOString(),
    })
    .onConflictDoUpdate({
      target: appSettings.key,
      set: {
        value: JSON.stringify(value),
        updatedAt: new Date().toISOString(),
      },
    })
    .run();
}

export function getSettingsSnapshot(): AppSettings {
  const rows = db.select().from(appSettings).all();
  const snapshot: AppSettings = { ...defaultSettings };

  for (const row of rows) {
    if (row.key in snapshot) {
      const key = row.key as SettingKey;
      snapshot[key] = parseValue(row.value, snapshot[key]) as never;
    }
  }

  return snapshot;
}
