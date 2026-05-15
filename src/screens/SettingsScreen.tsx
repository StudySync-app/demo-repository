import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
  TextInput,
  Switch,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import { SPACING } from "../constants/theme";
import { useAppSettings } from "../settings/AppSettingsContext";

type SettingsStackParamList = {
  SettingsMain: undefined;
  MyAccount: undefined;
  PersonalDetails: undefined;
  Address: undefined;
  Payments: undefined;
  Personalization: undefined;
  ThemeMode: undefined;
  Language: undefined;
  FontSize: undefined;
  Notifications: undefined;
  DisableNotifications: undefined;
  NotificationCategories: undefined;
  SoundVibration: undefined;
  StorageSync: undefined;
  UsedSpace: undefined;
  BackupManager: undefined;
  ImportedFilesManager: undefined;
  CloudSync: undefined;
  Security: undefined;
  TwoFactor: undefined;
  ChangePassword: undefined;
  RecoveryPhone: undefined;
  RecoveryEmail: undefined;
  StudySync: undefined;
  AIQuiz: undefined;
  AIAnswer: undefined;
  AISuggest: undefined;
  AIAssist: undefined;
  AIRemind: undefined;
  AISummary: undefined;
};

type SettingsRouteName = keyof Omit<SettingsStackParamList, "SettingsMain">;

type AISettingKey =
  | "aiQuiz"
  | "aiAnswer"
  | "aiSuggest"
  | "aiAssist"
  | "aiRemind"
  | "aiSummary";

type SettingItem = {
  title: string;
  icon: string;
  parent?: string;
  route?: SettingsRouteName;
  aiKey?: AISettingKey;
};

const settingsItems: SettingItem[] = [
  { title: "My account", icon: "person", route: "MyAccount" },
  { title: "Personalization", icon: "palette", route: "Personalization" },
  { title: "Notifications", icon: "notifications", route: "Notifications" },
  { title: "Storage & sync", icon: "sync", route: "StorageSync" },
  { title: "Security", icon: "security", route: "Security" },
  { title: "StudySync AI", icon: "psychology", route: "StudySync" },
];

const searchableSettings: SettingItem[] = [
  ...settingsItems,
  { title: "Personal details", icon: "person", route: "PersonalDetails", parent: "My account" },
  { title: "Address", icon: "home", route: "Address", parent: "My account" },
  { title: "Home address", icon: "home", route: "Address", parent: "Address" },
  { title: "Work address", icon: "business", route: "Address", parent: "Address" },
  { title: "Payments & subscriptions", icon: "credit-card", route: "Payments", parent: "My account" },
  { title: "Dark or light mode", icon: "dark-mode", route: "ThemeMode", parent: "Personalization" },
  { title: "Language", icon: "language", route: "Language", parent: "Personalization" },
  { title: "Font size & style", icon: "format-size", route: "FontSize", parent: "Personalization" },
  { title: "Dyslexia-Friendly Font", icon: "format-size", route: "FontSize", parent: "Font size & style" },
  { title: "Disable all notifications", icon: "notifications-off", route: "DisableNotifications", parent: "Notifications" },
  { title: "Notifications categories", icon: "checklist", route: "NotificationCategories", parent: "Notifications" },
  { title: "Sound & vibration", icon: "volume-up", route: "SoundVibration", parent: "Notifications" },
  { title: "Storage used space", icon: "storage", route: "UsedSpace", parent: "Storage & sync" },
  { title: "Manage backups", icon: "backup", route: "BackupManager", parent: "Storage & sync" },
  { title: "Manage imported files", icon: "folder", route: "ImportedFilesManager", parent: "Storage & sync" },
  { title: "Sync files", icon: "cloud-sync", route: "CloudSync", parent: "Storage & sync" },
  { title: "Two-factor authentication", icon: "verified-user", route: "TwoFactor", parent: "Security" },
  { title: "Change password", icon: "lock", route: "ChangePassword", parent: "Security" },
  { title: "Recovery phone", icon: "phone", route: "RecoveryPhone", parent: "Security" },
  { title: "Recovery email", icon: "email", route: "RecoveryEmail", parent: "Security" },
  { title: "Generate quiz questions", icon: "quiz", parent: "StudySync AI", aiKey: "aiQuiz" },
  { title: "Answer any questions", icon: "question-answer", parent: "StudySync AI", aiKey: "aiAnswer" },
  { title: "AI suggest", icon: "tips-and-updates", parent: "StudySync AI", aiKey: "aiSuggest" },
  { title: "AI assist", icon: "auto-awesome", parent: "StudySync AI", aiKey: "aiAssist" },
  { title: "Remind me AI", icon: "alarm", parent: "StudySync AI", aiKey: "aiRemind" },
  { title: "AI note summarization", icon: "summarize", parent: "StudySync AI", aiKey: "aiSummary" },
];

const DEFAULT_AI_SETTINGS: Record<AISettingKey, boolean> = {
  aiQuiz: true,
  aiAnswer: true,
  aiSuggest: true,
  aiAssist: true,
  aiRemind: true,
  aiSummary: true,
};

export default function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<SettingsStackParamList, "SettingsMain">>();
  const { isLight, t, textScale } = useAppSettings();
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [aiSettings, setAiSettings] = useState<Record<AISettingKey, boolean>>(DEFAULT_AI_SETTINGS);

  useEffect(() => {
    const loadAISettings = async () => {
      try {
        const saved = await AsyncStorage.getItem("studysync_ai_settings");
        if (saved) {
          setAiSettings({
            ...DEFAULT_AI_SETTINGS,
            ...JSON.parse(saved),
          });
        }
      } catch {
        setAiSettings(DEFAULT_AI_SETTINGS);
      }
    };

    loadAISettings();
  }, []);

  const updateAISetting = async (key: AISettingKey, value: boolean) => {
    const updated = {
      ...aiSettings,
      [key]: value,
    };

    setAiSettings(updated);
    await AsyncStorage.setItem("studysync_ai_settings", JSON.stringify(updated));
  };

  const filteredItems = useMemo(
    () =>
      (searchQuery.trim() ? searchableSettings : settingsItems).filter((item) => {
        const q = searchQuery.trim().toLowerCase();
        const parentText = typeof item.parent === "string" ? item.parent.toLowerCase() : "";

        return !q || t(item.title).toLowerCase().includes(q) || parentText.includes(q);
      }),
    [searchQuery, t]
  );

  const handlePress = (item: SettingItem) => {
    if (item.aiKey) return;
    if (item.route) {
      (navigation as any).push(item.route);
    }
  };

  const getIconSource = (item: SettingItem) => {
    if (item.title === "My account") {
      return require("../../assets/sett_account.png");
    }

    if (item.title === "Personalization") {
      return require("../../assets/sett_personalization.png");
    }

    if (item.title === "Notifications") {
      return require("../../assets/sett_notifications.png");
    }

    if (item.title === "Security") {
      return require("../../assets/sett_security.png");
    }

    return require("../../assets/sett_ai.png");
  };

  const content = (
    <ScrollView style={[styles.container, isLight && styles.lightContainer]} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={{ minWidth: 44 }} onPress={() => navigation.goBack()} hitSlop={12}>
          <MaterialIcons name="arrow-back" size={24} color={isLight ? "#0F172A" : "#FFFFFF"} />
        </TouchableOpacity>
      </View>

      <View style={styles.titleRow}>
        <Text style={[styles.title, isLight && styles.lightTitle, { fontSize: 34 * textScale }]}>
          {t("Settings")}
        </Text>

        <TouchableOpacity hitSlop={12} onPress={() => setIsSearching((value) => !value)}>
          <MaterialIcons name="search" size={30} color={isLight ? "#0F172A" : "#FFFFFF"} />
        </TouchableOpacity>
      </View>

      {isSearching && (
        <TextInput
          style={[styles.searchInput, isLight && styles.lightInput, { fontSize: 15 * textScale }]}
          placeholder={t("Search settings")}
          placeholderTextColor={isLight ? "#64748B" : "#A3AED0"}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoFocus
        />
      )}

      <Image style={styles.heroGraphic} source={require("../../assets/settings_banner.jpg")} resizeMode="cover" />

      <View style={styles.settingsList}>
        {filteredItems.map((item) => (
          <TouchableOpacity
            key={`${item.title}-${item.parent ?? "main"}`}
            style={[styles.settingItem, isLight && styles.lightItem]}
            activeOpacity={0.8}
            onPress={() => handlePress(item)}
            disabled={!!item.aiKey}
          >
            <View style={styles.settingIcon}>
              {item.aiKey ? (
                <MaterialIcons name={item.icon as any} size={22} color={isLight ? "#0F172A" : "#FFFFFF"} />
              ) : (
                <Image source={getIconSource(item)} style={styles.iconImage} />
              )}
            </View>

            <View style={styles.settingTextWrap}>
              <Text style={[styles.settingText, isLight && styles.lightTitle, { fontSize: 15 * textScale }]}>
                {t(item.title)}
              </Text>

              {typeof item.parent === "string" ? (
                <Text style={[styles.settingParent, isLight && styles.lightSubtitle]}>{t(item.parent)}</Text>
              ) : null}
            </View>

            {item.aiKey ? (
              <Switch
                value={aiSettings[item.aiKey]}
                onValueChange={(value) => updateAISetting(item.aiKey!, value)}
                trackColor={{ false: "#475569", true: "#4B76E7" }}
                thumbColor="#FFFFFF"
              />
            ) : (
              <MaterialIcons name="chevron-right" size={22} color={isLight ? "#64748B" : "#A3AED0"} />
            )}
          </TouchableOpacity>
        ))}

        {filteredItems.length === 0 && <Text style={styles.emptyText}>No settings found.</Text>}
      </View>
    </ScrollView>
  );

  if (isLight) {
    return <View style={styles.lightRoot}>{content}</View>;
  }

  return (
    <ImageBackground source={require("../../assets/dashboard_bg.png")} style={{ flex: 1 }} resizeMode="cover">
      {content}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  lightRoot: {
    flex: 1,
    backgroundColor: "#F4F7FB",
  },
  lightContainer: {
    backgroundColor: "#F4F7FB",
  },
  content: {
    padding: SPACING.screen,
    paddingTop: 55,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "700",
    marginTop: 4,
  },
  lightTitle: {
    color: "#0F172A",
  },
  searchInput: {
    backgroundColor: "#1A2535",
    color: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 18,
    fontSize: 15,
  },
  lightInput: {
    backgroundColor: "#FFFFFF",
    color: "#0F172A",
    borderWidth: 1,
    borderColor: "#DBE4F0",
  },
  heroGraphic: {
    width: "100%",
    height: 96,
    borderRadius: 20,
    marginBottom: 24,
    backgroundColor: "#111827",
  },
  settingsList: {
    marginTop: 2,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A2535",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginBottom: 8,
    minHeight: 54,
  },
  lightItem: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DBE4F0",
  },
  settingIcon: {
    width: 28,
    height: 28,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  iconImage: {
    width: 22,
    height: 22,
    resizeMode: "contain",
  },
  settingTextWrap: {
    flex: 1,
  },
  settingText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  settingParent: {
    color: "#A3AED0",
    fontSize: 11,
    marginTop: 2,
  },
  lightSubtitle: {
    color: "#64748B",
  },
  emptyText: {
    color: "#A3AED0",
    fontSize: 14,
    textAlign: "center",
    marginTop: 18,
  },
});
