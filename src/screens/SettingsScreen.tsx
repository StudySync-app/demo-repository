import React, { useMemo, useState } from "react";
import {View,Text,StyleSheet,ScrollView,TouchableOpacity,Image, ImageBackground, TextInput} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { COLORS, SPACING, RADIUS } from "../constants/theme";
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

const settingsItems: Array<{
  title: string;
  icon: string;
  route: SettingsRouteName;
}> = [
  { title: "My account", icon: "person", route: "MyAccount" },
  { title: "Personalization", icon: "palette", route: "Personalization" },
  { title: "Notifications", icon: "notifications", route: "Notifications" },
  { title: "Storage & sync", icon: "sync", route: "StorageSync" },
  { title: "Security", icon: "security", route: "Security" },
  { title: "StudySync AI", icon: "psychology", route: "StudySync" }
];

const searchableSettings: Array<{
  title: string;
  icon: string;
  route: SettingsRouteName;
  parent?: string;
}> = [
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
  { title: "Storage used space", icon: "storage", route: "StorageSync", parent: "Storage & sync" },
  { title: "Manage backups", icon: "backup", route: "StorageSync", parent: "Storage & sync" },
  { title: "Two-factor authentication", icon: "verified-user", route: "TwoFactor", parent: "Security" },
  { title: "Change password", icon: "lock", route: "ChangePassword", parent: "Security" },
  { title: "Recovery phone", icon: "phone", route: "RecoveryPhone", parent: "Security" },
  { title: "Recovery email", icon: "email", route: "RecoveryEmail", parent: "Security" },
  { title: "Generate quiz questions", icon: "quiz", route: "AIQuiz", parent: "StudySync AI" },
  { title: "Answer any questions", icon: "question-answer", route: "AIAnswer", parent: "StudySync AI" },
  { title: "AI suggest", icon: "tips-and-updates", route: "AISuggest", parent: "StudySync AI" },
  { title: "AI assist", icon: "auto-awesome", route: "AIAssist", parent: "StudySync AI" },
  { title: "Remind me AI", icon: "alarm", route: "AIRemind", parent: "StudySync AI" },
  { title: "AI note summarization", icon: "summarize", route: "AISummary", parent: "StudySync AI" },
];

export default function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<SettingsStackParamList, "SettingsMain">>();
  const { isLight, t, textScale } = useAppSettings();
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = useMemo(
    () =>
      (searchQuery.trim() ? searchableSettings : settingsItems).filter((item) => {
        const q = searchQuery.trim().toLowerCase();
        return !q || t(item.title).toLowerCase().includes(q) || item.parent?.toLowerCase().includes(q);
      }),
    [searchQuery, t]
  );

  const content = (
    <ScrollView style={[styles.container, isLight && styles.lightContainer]} contentContainerStyle={styles.content}>
          <View style={styles.headerRow}>
      <TouchableOpacity
        style={{ minWidth: 44 }}
        onPress={() => navigation.goBack()}
        hitSlop={12}
      >
        <MaterialIcons name="arrow-back" size={24} color={isLight ? "#0F172A" : "#FFFFFF"} />
      </TouchableOpacity>
    </View>

    <View style={styles.titleRow}>
      <Text style={[styles.title, isLight && styles.lightTitle, { fontSize: 34 * textScale }]}>{t("Settings")}</Text>

      <TouchableOpacity hitSlop={12} onPress={() => setIsSearching((value) => !value)}>
        <MaterialIcons name="search" size={30} color={isLight ? "#0F172A" : "#FFFFFF"} />
      </TouchableOpacity>
    </View>

      {isSearching && (
        <TextInput
          style={[styles.searchInput, isLight && styles.lightInput]}
          placeholder={t("Search settings")}
          placeholderTextColor={isLight ? "#64748B" : "#A3AED0"}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoFocus
        />
      )}
      
        <Image
          style={styles.heroGraphic}
          source={require("../../assets/settings_banner.jpg")}
         resizeMode="cover"
        />
     
      <View style={styles.settingsList}>
        {filteredItems.map((item) => (
          <TouchableOpacity
            key={item.title}
            style={[styles.settingItem, isLight && styles.lightItem]}
            activeOpacity={0.8}
            onPress={() => navigation.push(item.route)}
          >
            <View style={styles.settingIcon}>
              <Image
                source={
                  item.title === "My account"
                    ? require("../../assets/sett_account.png")
                    : item.title === "Personalization"
                    ? require("../../assets/sett_personalization.png")
                    : item.title === "Notifications"
                    ? require("../../assets/sett_notifications.png")
                    : item.title === "Security"
                    ? require("../../assets/sett_security.png")
                    : require("../../assets/sett_ai.png")
                }
                style={{
                  width: 22,
                  height: 22,
                  resizeMode: "contain",
                }}
              />
              </View>
            <Text style={[styles.settingText, isLight && styles.lightTitle, { fontSize: 15 * textScale }]}>{t(item.title)}</Text>
            {"parent" in item && item.parent ? (
              <Text style={[styles.settingParent, isLight && styles.lightSubtitle]}>{t(item.parent)}</Text>
            ) : null}
          </TouchableOpacity>
        ))}
        {filteredItems.length === 0 && (
          <Text style={styles.emptyText}>No settings found.</Text>
        )}
      </View>
    </ScrollView>
  );

  if (isLight) {
    return <View style={styles.lightRoot}>{content}</View>;
  }

  return (
  <ImageBackground
    source={require("../../assets/dashboard_bg.png")}
    style={{ flex: 1 }}
    resizeMode="cover"
  >
    {content}
  </ImageBackground>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent"
  },
  lightRoot: {
    flex: 1,
    backgroundColor: "#F4F7FB"
  },
  lightContainer: {
    backgroundColor: "#F4F7FB"
  },

  content: {
    padding: SPACING.screen,
    paddingTop: 55,
    paddingBottom: 40
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10
},

titleRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 20,
},

  arrowBack: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#0F172A"
  },

  title: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "700",
    marginTop: 4
  },
  lightTitle: {
    color: "#0F172A"
  },

  searchIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#0F172A"
  },

  searchInput: {
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: "#1A2535",
    color: "#FFFFFF",
    paddingHorizontal: 16,
    fontSize: 15,
    marginBottom: 16,
  },
  lightInput: {
    backgroundColor: "#FFFFFF",
    color: "#0F172A",
    borderWidth: 1,
    borderColor: "#DBE4F0",
  },

  heroCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 26,
    padding: 20,
    marginBottom: 24,
    minHeight: 160
  },

  heroText: {
    flex: 1,
    paddingRight: 16
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 28,
    marginBottom: 4
  },

  heroGraphic: {
  width: '100%',        // This forces it to align with the buttons below
  height: 96,           // Reduced height so it's not "too large"
  borderRadius: 20,     // Matches the rounding of your buttons
  marginBottom: 24,     // Consistent spacing
  backgroundColor: "#111827",
  },

  settingsList: {
    marginTop: 2
  },

  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A2535",
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginBottom: 8,
    minHeight: 48
  },
  lightItem: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DBE4F0"
  },

  settingIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center"
  },

  settingText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600"
  },
  settingParent: {
    color: "#A3AED0",
    fontSize: 11,
    marginLeft: 8,
  },
  lightSubtitle: {
    color: "#64748B"
  },

  emptyText: {
    color: "#A3AED0",
    fontSize: 14,
    textAlign: "center",
    marginTop: 18
  }
});
