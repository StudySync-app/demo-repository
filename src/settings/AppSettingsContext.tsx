import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Platform, Text, TextInput } from "react-native";

import { AppSettings, defaultSettings, getSettingsSnapshot, setSetting as saveSetting } from "../db/settings";

type AppSettingsContextValue = {
  settings: AppSettings;
  isLight: boolean;
  textScale: number;
  refreshSettings: () => void;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  t: (key: string) => string;
};

const translations: Record<string, Record<string, string>> = {
  Spanish: {
    "Dark or light mode": "Modo oscuro o claro",
    "Light mode": "Modo claro",
    "Dark mode": "Modo oscuro",
    Language: "Idioma",
    "Font size & style": "Tamano y estilo de fuente",
    "Use a Dyslexia Friendly Font": "Usar fuente amigable para dislexia",
    "Font size": "Tamano de fuente",
    Small: "Pequeno",
    Default: "Normal",
    Large: "Grande",
    Settings: "Configuracion",
    "My account": "Mi cuenta",
    Personalization: "Personalizacion",
    Notifications: "Notificaciones",
    Security: "Seguridad",
    "Storage & sync": "Almacenamiento y sincronizacion",
    "StudySync AI": "StudySync IA",
  },
  French: {
    "Dark or light mode": "Mode sombre ou clair",
    "Light mode": "Mode clair",
    "Dark mode": "Mode sombre",
    Language: "Langue",
    "Font size & style": "Taille et style de police",
    "Use a Dyslexia Friendly Font": "Utiliser une police adaptee a la dyslexie",
    "Font size": "Taille de police",
    Small: "Petit",
    Default: "Defaut",
    Large: "Grand",
    Settings: "Parametres",
    "My account": "Mon compte",
    Personalization: "Personnalisation",
    Notifications: "Notifications",
    Security: "Securite",
    "Storage & sync": "Stockage et synchro",
    "StudySync AI": "StudySync IA",
  },
  German: {
    "Dark or light mode": "Dunkler oder heller Modus",
    "Light mode": "Heller Modus",
    "Dark mode": "Dunkler Modus",
    Language: "Sprache",
    "Font size & style": "Schriftgroesse und Stil",
    "Use a Dyslexia Friendly Font": "Legastheniefreundliche Schrift verwenden",
    "Font size": "Schriftgroesse",
    Small: "Klein",
    Default: "Standard",
    Large: "Gross",
    Settings: "Einstellungen",
    "My account": "Mein Konto",
    Personalization: "Personalisierung",
    Notifications: "Benachrichtigungen",
    Security: "Sicherheit",
    "Storage & sync": "Speicher und Sync",
    "StudySync AI": "StudySync KI",
  },
  Japanese: {
    "Dark or light mode": "ダーク/ライトモード",
    "Light mode": "ライトモード",
    "Dark mode": "ダークモード",
    Language: "言語",
    "Font size & style": "文字サイズとスタイル",
    "Use a Dyslexia Friendly Font": "読みやすいフォントを使う",
    "Font size": "文字サイズ",
    Small: "小",
    Default: "標準",
    Large: "大",
    Settings: "設定",
    "My account": "アカウント",
    Personalization: "表示設定",
    Notifications: "通知",
    Security: "セキュリティ",
    "Storage & sync": "保存と同期",
    "StudySync AI": "StudySync AI",
  },
};

const AppSettingsContext = createContext<AppSettingsContextValue>({
  settings: defaultSettings,
  isLight: false,
  textScale: 1,
  refreshSettings: () => undefined,
  updateSetting: () => undefined,
  t: (key) => key,
});

function applyGlobalTextSettings(settings: AppSettings) {
  const fontScale = settings.fontScale || 1;
  const dyslexiaStyle = settings.useDyslexiaFont
    ? {
        fontFamily: Platform.select({ android: "sans-serif", ios: "Avenir", default: undefined }),
        letterSpacing: 0.35,
        lineHeight: 22 * fontScale,
      }
    : {};

  const AppText = Text as any;
  AppText.defaultProps = AppText.defaultProps || {};
  AppText.defaultProps.style = [{ fontSize: 14 * fontScale }, dyslexiaStyle, AppText.defaultProps.style];

  const AppTextInput = TextInput as any;
  AppTextInput.defaultProps = AppTextInput.defaultProps || {};
  AppTextInput.defaultProps.style = [{ fontSize: 16 * fontScale }, dyslexiaStyle, AppTextInput.defaultProps.style];
}

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  const refreshSettings = useCallback(() => {
    const next = getSettingsSnapshot();
    setSettings(next);
    applyGlobalTextSettings(next);
  }, []);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  const updateSetting = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    saveSetting(key, value);
    setSettings((current) => {
      const next = { ...current, [key]: value };
      applyGlobalTextSettings(next);
      return next;
    });
  }, []);

  const value = useMemo<AppSettingsContextValue>(() => {
    const dictionary = translations[settings.language] || {};
    return {
      settings,
      isLight: settings.themeMode === "light",
      textScale: settings.fontScale || 1,
      refreshSettings,
      updateSetting,
      t: (key: string) => dictionary[key] || key,
    };
  }, [refreshSettings, settings, updateSetting]);

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
}

export function useAppSettings() {
  return useContext(AppSettingsContext);
}
