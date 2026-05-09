import React, { useCallback, useState } from "react";
import {
  Alert,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import { getFolders } from "../../db/folders";
import { getMedia } from "../../db/media";
import { getNotes } from "../../db/notes";
import { getSetting, getSettingsSnapshot, setSetting } from "../../db/settings";
import { getTasks } from "../../db/tasks";
import useNetwork from "../../hooks/useNetwork";
import { supabase } from "../../lib/supabase";
import {
  answerStudyQuestion,
  generateQuizQuestions,
  prioritizeTask,
  suggestLearningResources,
  suggestStudySchedule,
} from "../../lib/ai";

type RowProps = {
  title: string;
  subtitle?: string;
  icon?: string;
  onPress?: () => void;
  right?: React.ReactNode;
};

function BackHeader({ title }: { title: string }) {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.headerRow}>
      <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
        <MaterialIcons name="arrow-back" size={22} color="#FFFFFF" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
}

function ScreenShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <ImageBackground source={require("../../../assets/dashboard_bg.png")} style={{ flex: 1 }} resizeMode="cover">
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <BackHeader title={title} />
        {children}
      </ScrollView>
    </ImageBackground>
  );
}

function SettingsRow({ title, subtitle, icon = "person", onPress, right }: RowProps) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={onPress ? 0.85 : 1} onPress={onPress}>
      <View style={styles.row}>
        <View style={styles.iconCircle}>
          <MaterialIcons name={icon as any} size={20} color="#58A6FF" />
        </View>
        <View style={styles.rowText}>
          <Text style={styles.cardTitle}>{title}</Text>
          {subtitle ? <Text style={styles.cardSubtitle}>{subtitle}</Text> : null}
        </View>
        {right}
      </View>
    </TouchableOpacity>
  );
}

function useStoredSetting<T>(key: string, fallback: T) {
  const [value, setValueState] = useState<T>(fallback);

  useFocusEffect(
    useCallback(() => {
      setValueState(getSetting(key, fallback));
    }, [fallback, key])
  );

  const setValue = (next: T) => {
    setValueState(next);
    setSetting(key, next);
  };

  return [value, setValue] as const;
}

export function PersonalDetailsScreen() {
  const [name, setName] = useState("StudySync user");
  const [email, setEmail] = useState("");

  useFocusEffect(
    useCallback(() => {
      supabase.auth.getUser().then(({ data }) => {
        setName(data.user?.user_metadata?.full_name || "StudySync user");
        setEmail(data.user?.email || "");
      });
    }, [])
  );

  return (
    <ScreenShell title="Personal details">
      <Text style={styles.sectionCaption}>Basic info</Text>
      <SettingsRow title="Profile picture" subtitle="Managed by your StudySync account." icon="account-circle" />
      <SettingsRow title="Name" subtitle={name} icon="badge" />
      <SettingsRow title="Email" subtitle={email || "No email loaded"} icon="email" />
      <SettingsRow title="Birthday" subtitle="Not set" icon="cake" />
      <SettingsRow title="Gender" subtitle="Not set" icon="person" />
      <Text style={styles.sectionCaption}>Contact info</Text>
      <SettingsRow title="Phone" subtitle={getSetting("recoveryPhone", "+63 912345678")} icon="phone" />
    </ScreenShell>
  );
}

export function PaymentsScreen() {
  return (
    <ScreenShell title="Payments & subscriptions">
      <SettingsRow title="Manage payment methods" subtitle="No payment method is connected." icon="credit-card" />
      <SettingsRow title="Payment info" subtitle="StudySync is running in demo mode." icon="receipt" />
      <SettingsRow title="Subscriptions" subtitle="Current plan: Local MVP." icon="workspace-premium" />
    </ScreenShell>
  );
}

export function ThemeModeScreen() {
  const [themeMode, setThemeMode] = useStoredSetting("themeMode", "dark");

  return (
    <ScreenShell title="Dark or light mode">
      <SettingsRow
        title="Light mode"
        subtitle="Use brighter cards and backgrounds."
        icon="light-mode"
        right={<Switch value={themeMode === "light"} onValueChange={() => setThemeMode("light")} />}
      />
      <SettingsRow
        title="Dark mode"
        subtitle="Use StudySync's default dark interface."
        icon="dark-mode"
        right={<Switch value={themeMode === "dark"} onValueChange={() => setThemeMode("dark")} />}
      />
    </ScreenShell>
  );
}

export function LanguageScreen() {
  const languages = ["English", "Chinese (simplified)", "Spanish", "Italian", "Japanese", "Korean", "French", "German", "Portuguese (Brazilian)", "Russian", "Arabic"];
  const [language, setLanguage] = useStoredSetting("language", "English");

  return (
    <ScreenShell title="Language">
      {languages.map((item) => (
        <SettingsRow
          key={item}
          title={item}
          subtitle="Keep your defaults current and accurate."
          icon="language"
          right={<Switch value={language === item} onValueChange={() => setLanguage(item)} />}
        />
      ))}
    </ScreenShell>
  );
}

export function FontSizeScreen() {
  const [fontScale, setFontScale] = useStoredSetting("fontScale", 1);
  const [useDyslexiaFont, setUseDyslexiaFont] = useStoredSetting("useDyslexiaFont", false);

  return (
    <ScreenShell title="Font size & style">
      <SettingsRow
        title="Use a Dyslexia Friendly Font"
        subtitle="Stores your preference for future app-wide typography."
        icon="format-size"
        right={<Switch value={useDyslexiaFont} onValueChange={setUseDyslexiaFont} />}
      />
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Font size</Text>
        <Text style={[styles.previewText, { fontSize: 15 * fontScale }]}>The quick brown fox jump over the lazy dog</Text>
        <View style={styles.segmentRow}>
          {[0.9, 1, 1.15].map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.segmentButton, fontScale === item && styles.segmentActive]}
              onPress={() => setFontScale(item)}
            >
              <Text style={styles.segmentText}>{item === 0.9 ? "Small" : item === 1 ? "Default" : "Large"}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScreenShell>
  );
}

export function NotificationCategoriesScreen() {
  const [todos, setTodos] = useStoredSetting("notifyTodos", true);
  const [study, setStudy] = useStoredSetting("notifyStudyNotes", true);
  const [media, setMedia] = useStoredSetting("notifyMedia", false);

  return (
    <ScreenShell title="Notifications categories">
      <SettingsRow title="To-do lists" subtitle="Task reminders and deadline nudges." icon="checklist" right={<Switch value={todos} onValueChange={setTodos} />} />
      <SettingsRow title="Study notes" subtitle="Study reminders and note updates." icon="notes" right={<Switch value={study} onValueChange={setStudy} />} />
      <SettingsRow title="Media" subtitle="Imported file reminders." icon="perm-media" right={<Switch value={media} onValueChange={setMedia} />} />
    </ScreenShell>
  );
}

export function SoundVibrationScreen() {
  const [sound, setSound] = useStoredSetting("soundEnabled", true);
  const [vibration, setVibration] = useStoredSetting("vibrationEnabled", true);

  return (
    <ScreenShell title="Sound & vibration">
      <SettingsRow title="Enable sound" subtitle="Play sound when StudySync reminders arrive." icon="volume-up" right={<Switch value={sound} onValueChange={setSound} />} />
      <SettingsRow title="Enable vibration" subtitle="Vibrate when StudySync reminders arrive." icon="vibration" right={<Switch value={vibration} onValueChange={setVibration} />} />
    </ScreenShell>
  );
}

export function DisableNotificationsScreen() {
  const [enabled, setEnabled] = useStoredSetting("notificationsEnabled", true);

  const toggle = async (next: boolean) => {
    if (next) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Notifications disabled", "Allow notifications in device settings to receive reminders.");
        return;
      }
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
    setEnabled(next);
  };

  return (
    <ScreenShell title="Disable all notifications">
      <SettingsRow title="StudySync notifications" subtitle="Master switch for local task reminders." icon="notifications" right={<Switch value={enabled} onValueChange={toggle} />} />
    </ScreenShell>
  );
}

export function StorageSyncScreen() {
  const isOnline = useNetwork();
  const [counts, setCounts] = useState({ tasks: 0, notes: 0, media: 0, folders: 0 });

  useFocusEffect(
    useCallback(() => {
      setCounts({
        tasks: getTasks().length,
        notes: getNotes().length,
        media: getMedia().length,
        folders: getFolders().length,
      });
    }, [])
  );

  return (
    <ScreenShell title="Storage & sync">
      <SettingsRow title="Clear cache" subtitle="Local database is healthy. No temporary cache to clear." icon="cleaning-services" />
      <SettingsRow title="Manage imported files" subtitle={`${counts.media} local media file(s) imported.`} icon="folder" />
      <SettingsRow title="Sync files" subtitle={isOnline ? "Online. Cloud sync is not enabled in this pass." : "Offline. Local device storage is active."} icon="sync" />
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Local storage snapshot</Text>
        <Text style={styles.cardSubtitle}>{counts.tasks} tasks · {counts.notes} notes · {counts.media} media · {counts.folders} folders</Text>
      </View>
    </ScreenShell>
  );
}

export function ChangePasswordScreen() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const save = async () => {
    if (password.length < 6) {
      Alert.alert("Password too short", "Use at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Passwords do not match", "Confirm your new password.");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password });
    Alert.alert(error ? "Change password failed" : "Password updated", error?.message || "Your password was updated.");
  };

  return (
    <ScreenShell title="Change password">
      <TextInput secureTextEntry value={password} onChangeText={setPassword} placeholder="New password" placeholderTextColor="#A3AED0" style={styles.input} />
      <TextInput secureTextEntry value={confirm} onChangeText={setConfirm} placeholder="Confirm password" placeholderTextColor="#A3AED0" style={styles.input} />
      <TouchableOpacity style={styles.primaryButton} onPress={save}>
        <Text style={styles.primaryText}>Save password</Text>
      </TouchableOpacity>
    </ScreenShell>
  );
}

export function RecoveryPhoneScreen() {
  const [, setPhone] = useStoredSetting("recoveryPhone", "+63 912345678");
  const [draft, setDraft] = useState(getSetting("recoveryPhone", "+63 912345678"));

  useFocusEffect(useCallback(() => setDraft(getSetting("recoveryPhone", "+63 912345678")), []));

  return (
    <ScreenShell title="Recovery phone">
      <TextInput value={draft} onChangeText={setDraft} placeholder="Phone number" placeholderTextColor="#A3AED0" style={styles.input} />
      <TouchableOpacity style={styles.primaryButton} onPress={() => setPhone(draft)}>
        <Text style={styles.primaryText}>Save phone</Text>
      </TouchableOpacity>
    </ScreenShell>
  );
}

export function RecoveryEmailScreen() {
  const [email, setEmail] = useState("");

  useFocusEffect(
    useCallback(() => {
      supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email || getSetting("recoveryEmail", "")));
    }, [])
  );

  return (
    <ScreenShell title="Recovery email">
      <SettingsRow title={email || "No email loaded"} subtitle="Your Supabase account email is used for recovery." icon="email" />
    </ScreenShell>
  );
}

export function TwoFactorScreen() {
  const [enabled, setEnabled] = useStoredSetting("mfaEnabled", false);

  return (
    <ScreenShell title="Two-factor authentication">
      <Text style={styles.sectionCaption}>Second steps to log in</Text>
      <SettingsRow title="Passkeys and security keys" subtitle="Preference stored locally for demo." icon="vpn-key" right={<Switch value={enabled} onValueChange={setEnabled} />} />
      <SettingsRow title="Phone number" subtitle={getSetting("recoveryPhone", "+63 912345678")} icon="phone" />
      <SettingsRow title="Email" subtitle="Use your account email for recovery." icon="email" />
      <SettingsRow title="Backup codes" subtitle="Coming with production MFA setup." icon="password" />
    </ScreenShell>
  );
}

function AIToggleScreen({
  title,
  settingKey,
  placeholder,
  action,
}: {
  title: string;
  settingKey: string;
  placeholder: string;
  action: (input: string) => Promise<string>;
}) {
  const [enabled, setEnabled] = useStoredSetting(settingKey, false);
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!input.trim()) {
      Alert.alert("Add input", "Type a topic, note, task, or question first.");
      return;
    }
    setLoading(true);
    setResult("");
    try {
      setResult(await action(input.trim()));
    } catch (error: any) {
      setResult(error.message || "AI request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenShell title={title}>
      <SettingsRow title={`Enable ${title}?`} subtitle="Controls this StudySync AI feature." icon="auto-awesome" right={<Switch value={enabled} onValueChange={setEnabled} />} />
      <TextInput value={input} onChangeText={setInput} placeholder={placeholder} placeholderTextColor="#A3AED0" style={[styles.input, styles.multiline]} multiline />
      <TouchableOpacity style={[styles.primaryButton, !enabled && styles.disabledButton]} onPress={run} disabled={!enabled || loading}>
        <Text style={styles.primaryText}>{loading ? "Thinking..." : "Run AI"}</Text>
      </TouchableOpacity>
      {result ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>AI result</Text>
          <Text style={styles.cardSubtitle}>{result}</Text>
        </View>
      ) : null}
    </ScreenShell>
  );
}

export const AIQuizScreen = () => <AIToggleScreen title="Generate quiz questions" settingKey="aiQuizEnabled" placeholder="Paste notes or a topic..." action={generateQuizQuestions} />;
export const AIAnswerScreen = () => <AIToggleScreen title="Answer any questions" settingKey="aiAnswerEnabled" placeholder="Ask a study question..." action={answerStudyQuestion} />;
export const AISuggestScreen = () => <AIToggleScreen title="AI suggest" settingKey="aiSuggestEnabled" placeholder="Enter a topic for learning resources..." action={suggestLearningResources} />;
export const AIAssistScreen = () => <AIToggleScreen title="AI assist" settingKey="aiAssistEnabled" placeholder="Describe a task to prioritize..." action={prioritizeTask} />;
export const AIRemindScreen = () => <AIToggleScreen title="Remind me AI" settingKey="aiRemindEnabled" placeholder="List your tasks and deadlines..." action={suggestStudySchedule} />;

export function SettingsSummaryCard() {
  const settings = getSettingsSnapshot();
  return (
    <Text style={styles.cardSubtitle}>
      {settings.themeMode} mode · {settings.language} · {settings.notificationsEnabled ? "notifications on" : "notifications off"}
    </Text>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  content: { padding: 20, paddingTop: 55, paddingBottom: 110 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 22 },
  headerTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "700" },
  sectionCaption: { color: "#A3AED0", fontSize: 12, marginBottom: 10 },
  card: { backgroundColor: "#1A2535", borderRadius: 14, paddingVertical: 13, paddingHorizontal: 14, marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#10223A", alignItems: "center", justifyContent: "center" },
  rowText: { flex: 1 },
  cardTitle: { color: "#FFFFFF", fontSize: 15, fontWeight: "700", marginBottom: 3 },
  cardSubtitle: { color: "#A3AED0", fontSize: 11, lineHeight: 16 },
  previewText: { color: "#FFFFFF", marginVertical: 18, textAlign: "center" },
  segmentRow: { flexDirection: "row", backgroundColor: "#0F172A", borderRadius: 12, padding: 4, marginTop: 10 },
  segmentButton: { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: "center" },
  segmentActive: { backgroundColor: "#58A6FF" },
  segmentText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  input: { backgroundColor: "#1A2535", borderRadius: 14, color: "#FFFFFF", paddingHorizontal: 14, minHeight: 48, marginBottom: 12 },
  multiline: { minHeight: 120, paddingTop: 14, textAlignVertical: "top" },
  primaryButton: { minHeight: 48, borderRadius: 14, backgroundColor: "#007AFF", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  disabledButton: { opacity: 0.45 },
  primaryText: { color: "#FFFFFF", fontWeight: "800", fontSize: 14 },
});
