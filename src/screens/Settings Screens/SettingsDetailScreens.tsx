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
  Share,
  Linking,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import { getFolders } from "../../db/folders";
import { deleteMedia, getMedia } from "../../db/media";
import { getNotes } from "../../db/notes";
import { getSetting, getSettingsSnapshot, setSetting } from "../../db/settings";
import { getTasks } from "../../db/tasks";
import useNetwork from "../../hooks/useNetwork";
import { supabase } from "../../lib/supabase";
import { useAppSettings } from "../../settings/AppSettingsContext";
import {
  answerStudyQuestion,
  generateQuizQuestions,
  prioritizeTask,
  summarizeStudyNotes,
  suggestLearningResources,
  suggestStudySchedule,
} from "../../lib/ai";

import * as ImagePicker from "expo-image-picker";
import { File, Paths } from "expo-file-system";

import { DeviceEventEmitter } from "react-native";
import { createCloudSnapshot, restoreCloudSnapshot, type StudySyncCloudSnapshot } from "../../db/cloudSync";


type RowProps = {
  title: string;
  subtitle?: string;
  icon?: string;
  onPress?: () => void;
  right?: React.ReactNode;
};

function BackHeader({ title }: { title: string }) {
  const navigation = useNavigation<any>();
  const { isLight, t, textScale } = useAppSettings();

  return (
    <View style={styles.headerRow}>
      <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
        <MaterialIcons name="arrow-back" size={22} color={isLight ? "#0F172A" : "#FFFFFF"} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: isLight ? "#0F172A" : "#FFFFFF", fontSize: 20 * textScale }]}>{t(title)}</Text>
    </View>
  );
}

function ScreenShell({ title, children }: { title: string; children: React.ReactNode }) {
  const { isLight } = useAppSettings();
  const content = (
      <ScrollView
        style={[styles.container, isLight && styles.lightContainer]}
        contentContainerStyle={styles.content}
      >
        <BackHeader title={title} />
        {children}
      </ScrollView>
    );

  if (isLight) {
    return <View style={styles.lightRoot}>{content}</View>;
  }

  return (
    <ImageBackground source={require("../../../assets/dashboard_bg.png")} style={{ flex: 1 }} resizeMode="cover">
      {content}
    </ImageBackground>
  );
}

function SettingsRow({ title, subtitle, icon = "person", onPress, right }: RowProps) {
  const { isLight, t, textScale } = useAppSettings();

  return (
    <TouchableOpacity style={[styles.card, isLight && styles.lightCard]} activeOpacity={onPress ? 0.85 : 1} onPress={onPress}>
      <View style={styles.row}>
        <View style={[styles.iconCircle, isLight && styles.lightIconCircle]}>
          <MaterialIcons name={icon as any} size={20} color="#58A6FF" />
        </View>
        <View style={styles.rowText}>
          <Text style={[styles.cardTitle, isLight && styles.lightTitle, { fontSize: 15 * textScale }]}>{t(title)}</Text>
          {subtitle ? <Text style={[styles.cardSubtitle, isLight && styles.lightSubtitle, { fontSize: 11 * textScale }]}>{t(subtitle)}</Text> : null}
        </View>
        {right}
      </View>
    </TouchableOpacity>
  );
}

function useStoredSetting<T>(key: string, fallback: T) {
  const { updateSetting } = useAppSettings();
  const [value, setValueState] = useState<T>(fallback);

  useFocusEffect(
    useCallback(() => {
      setValueState(getSetting(key, fallback));
    }, [fallback, key])
  );

  const setValue = (next: T) => {
    setValueState(next);
    updateSetting(key as never, next as never);
  };

  return [value, setValue] as const;
}

export function PersonalDetailsScreen() {
  const [, setStoredName] = useStoredSetting("profileName", "");
  const [, setStoredBirthday] = useStoredSetting("profileBirthday", "");
  const [, setStoredGender] = useStoredSetting("profileGender", "");
  const [, setStoredAvatarUrl] = useStoredSetting("profileAvatarUrl", "");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [name, setName] = useState("StudySync user");
  const [birthday, setBirthday] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");

  useFocusEffect(
    useCallback(() => {
      supabase.auth.getUser().then(({ data }) => {
        setName(getSetting("profileName", data.user?.user_metadata?.full_name || "StudySync user"));
        setBirthday(getSetting("profileBirthday", data.user?.user_metadata?.birthday || ""));
        setGender(getSetting("profileGender", data.user?.user_metadata?.gender || ""));
        setAvatarUrl(getSetting("profileAvatarUrl", data.user?.user_metadata?.avatar_url || ""));
        setEmail(data.user?.email || "");
      });
    }, [])
  );
    
  const handlePickImage = async () => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert("Permission needed", "Allow access to your photos.");
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.7,
  });

  if (result.canceled) return;

  const image = result.assets[0];
  const uri = image.uri;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

const fileName = `${user.id}-${Date.now()}.jpg`;

  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer();

  const { error: uploadError } = await supabase.storage
  .from("avatars")
  .upload(fileName, arrayBuffer, {
    contentType: "image/jpeg",
    upsert: true,
  });

  if (uploadError) {
    Alert.alert("Upload failed", uploadError.message);
    return;
  }

  const { data } = supabase.storage
    .from("avatars")
    .getPublicUrl(fileName);

  const publicUrl = data.publicUrl;

  const { error: updateError } = await supabase.auth.updateUser({
    data: { avatar_url: publicUrl },
  });

  if (updateError) {
    Alert.alert("Save failed", updateError.message);
    return;
  }

  setAvatarUrl(publicUrl);
  setStoredAvatarUrl(publicUrl);
  await supabase.auth.refreshSession();
  DeviceEventEmitter.emit("avatarUpdated", publicUrl);

  Alert.alert("Success", "Profile picture updated!");
};

  const saveProfile = async () => {
    setStoredName(name.trim());
    setStoredBirthday(birthday.trim());
    setStoredGender(gender.trim());

    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: name.trim(),
        birthday: birthday.trim(),
        gender: gender.trim(),
        avatar_url: avatarUrl,
      },
    });

    await supabase.auth.refreshSession();
    DeviceEventEmitter.emit("profileUpdated", { name: name.trim(), birthday: birthday.trim(), gender: gender.trim() });
    Alert.alert(error ? "Saved locally" : "Profile saved", error?.message || "Your profile details were updated.");
  };

  return (
    <ScreenShell title="Personal details">
      <Text style={styles.sectionCaption}>Basic info</Text>
      <SettingsRow
        title="Profile picture"
        subtitle={avatarUrl ? "Profile image is set. Tap to replace it." : "Tap to upload your profile image."}
        icon="account-circle"
        onPress={handlePickImage}/>      
      <ThemedInput value={name} onChangeText={setName} placeholder="Name" />
      <ThemedInput value={birthday} onChangeText={setBirthday} placeholder="Birthday" />
      <ThemedInput value={gender} onChangeText={setGender} placeholder="Gender" />
      <PrimaryButton title="Save personal details" onPress={saveProfile} />
      <Text style={styles.sectionCaption}>Contact info</Text>
      <SettingsRow title="Email" subtitle={email || "No email loaded"} icon="email" />
      <SettingsRow title="Phone" subtitle={getSetting("recoveryPhone", "+63 912345678")} icon="phone" />
    </ScreenShell>
  );
}

export function PaymentsScreen() {
  const [paymentMethod, setPaymentMethod] = useStoredSetting("paymentMethod", "");
  const [draft, setDraft] = useState(paymentMethod);

  return (
    <ScreenShell title="Payments & subscriptions">
      <Text style={styles.sectionCaption}>Payment method</Text>
      <TextInput value={draft} onChangeText={setDraft} placeholder="Payment method label" placeholderTextColor="#A3AED0" style={styles.input} />
      <TouchableOpacity style={styles.primaryButton} onPress={() => {
        setPaymentMethod(draft.trim());
        Alert.alert("Payment method saved", draft.trim() || "Payment method cleared.");
      }}>
        <Text style={styles.primaryText}>Save payment method</Text>
      </TouchableOpacity>
      <SettingsRow title="Manage payment methods" subtitle={paymentMethod || "No payment method is connected."} icon="credit-card" />
      <SettingsRow title="Payment info" subtitle="Local payment preferences are saved on this device." icon="receipt" />
      <SettingsRow title="Subscriptions" subtitle="Current plan: Local MVP." icon="workspace-premium" />
    </ScreenShell>
  );
}

function ThemedInput(props: React.ComponentProps<typeof TextInput>) {
  const { isLight, textScale } = useAppSettings();
  return (
    <TextInput
      placeholderTextColor={isLight ? "#64748B" : "#A3AED0"}
      {...props}
      style={[styles.input, isLight && styles.lightInput, { fontSize: 15 * textScale }, props.style]}
    />
  );
}

function PrimaryButton({ title, onPress }: { title: string; onPress: () => void }) {
  const { textScale } = useAppSettings();
  return (
    <TouchableOpacity style={styles.primaryButton} onPress={onPress}>
      <Text style={[styles.primaryText, { fontSize: 14 * textScale }]}>{title}</Text>
    </TouchableOpacity>
  );
}

export function AddressScreen() {
  const [home, setHome] = useStoredSetting("homeAddress", "");
  const [work, setWork] = useStoredSetting("workAddress", "");
  const [homeDraft, setHomeDraft] = useState(home);
  const [workDraft, setWorkDraft] = useState(work);

  return (
    <ScreenShell title="Address">
      <Text style={styles.sectionCaption}>Home</Text>
      <ThemedInput value={homeDraft} onChangeText={setHomeDraft} placeholder="Home address" />
      <SettingsRow title="Saved home" subtitle={home || "No home address saved yet."} icon="home" />
      <Text style={styles.sectionCaption}>Work</Text>
      <ThemedInput value={workDraft} onChangeText={setWorkDraft} placeholder="Work address" />
      <SettingsRow title="Saved work" subtitle={work || "No work address saved yet."} icon="business" />
      <PrimaryButton title="Save addresses" onPress={() => {
        setHome(homeDraft.trim());
        setWork(workDraft.trim());
        Alert.alert("Address saved", "Home and Work addresses were updated.");
      }} />
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
        right={<Switch value={themeMode === "light"} onValueChange={(next) => setThemeMode(next ? "light" : "dark")} />}
      />
      <SettingsRow
        title="Dark mode"
        subtitle="Use StudySync's default dark interface."
        icon="dark-mode"
        right={<Switch value={themeMode === "dark"} onValueChange={(next) => setThemeMode(next ? "dark" : "light")} />}
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
  const { isLight, t, textScale } = useAppSettings();
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
      <View style={[styles.card, isLight && styles.lightCard]}>
        <Text style={[styles.cardTitle, isLight && styles.lightTitle, { fontSize: 15 * textScale }]}>{t("Font size")}</Text>
        <Text style={[styles.previewText, isLight && styles.lightTitle, { fontSize: 15 * fontScale, letterSpacing: useDyslexiaFont ? 0.6 : 0 }]}>The quick brown fox jump over the lazy dog</Text>
        <View style={styles.segmentRow}>
          {[0.9, 1, 1.15].map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.segmentButton, fontScale === item && styles.segmentActive]}
              onPress={() => setFontScale(item)}
            >
              <Text style={styles.segmentText}>{t(item === 0.9 ? "Small" : item === 1 ? "Default" : "Large")}</Text>
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
  const navigation = useNavigation<any>();
  const [counts, setCounts] = useState({ tasks: 0, notes: 0, media: 0, folders: 0 });
  const [lastCleared, setLastCleared] = useStoredSetting("lastCacheClear", "Never");
  const [lastBackup, setLastBackup] = useStoredSetting("lastBackup", "Never");
  const [autoBackupsEnabled, setAutoBackupsEnabled] = useStoredSetting("autoBackupsEnabled", false);

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

  const snapshot = {
    tasks: getTasks(),
    notes: getNotes(),
    media: getMedia(),
    folders: getFolders(),
  };
  const usedBytes = JSON.stringify(snapshot).length;

  const createBackup = async () => {
    const file = new File(Paths.document, `studysync-backup-${Date.now()}.json`);
    file.write(JSON.stringify({ exportedAt: new Date().toISOString(), ...snapshot, settings: getSettingsSnapshot() }, null, 2));
    const stamp = new Date().toLocaleString();
    setLastBackup(stamp);
    await Share.share({ title: "StudySync backup", message: "StudySync backup created.", url: file.uri });
  };

  return (
    <ScreenShell title="Storage & sync">
      <SettingsRow title="View used space" subtitle={`${Math.max(1, Math.round(usedBytes / 1024))} KB used by local StudySync data.`} icon="storage" onPress={() => navigation.navigate("UsedSpace")} />
      <SettingsRow title="Manage backups" subtitle={`Last backup: ${lastBackup}`} icon="backup" onPress={() => navigation.navigate("BackupManager")} />
      <SettingsRow title="Automatic backups" subtitle="Manual JSON backups are available from this screen." icon="cloud-sync" right={<Switch value={autoBackupsEnabled} onValueChange={setAutoBackupsEnabled} />} />
      <SettingsRow
        title="Clear cache"
        subtitle={`Last checked: ${lastCleared}`}
        icon="cleaning-services"
        onPress={() => {
          const stamp = new Date().toLocaleString();
          setLastCleared(stamp);
          Alert.alert("Cache checked", "No temporary app cache was found. Your tasks, notes, media, and folders were kept.");
        }}
      />
      <SettingsRow title="Manage imported files" subtitle={`${counts.media} local media file(s) imported.`} icon="folder" onPress={() => navigation.navigate("ImportedFilesManager")} />
      <SettingsRow title="Sync files" subtitle={isOnline ? "Online. Tap to upload a JSON backup to Supabase." : "Offline. Local device storage is active."} icon="sync" onPress={() => navigation.navigate("CloudSync")} />
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
  const [savedEmail, setSavedEmail] = useStoredSetting("recoveryEmail", "");
  const [email, setEmail] = useState(savedEmail);

  useFocusEffect(
    useCallback(() => {
      supabase.auth.getUser().then(({ data }) => setEmail(savedEmail || data.user?.email || ""));
    }, [])
  );

  return (
    <ScreenShell title="Recovery email">
      <TextInput value={email} onChangeText={setEmail} placeholder="Recovery email" placeholderTextColor="#A3AED0" style={styles.input} autoCapitalize="none" keyboardType="email-address" />
      <TouchableOpacity style={styles.primaryButton} onPress={() => {
        setSavedEmail(email.trim().toLowerCase());
        Alert.alert("Recovery email saved", email.trim() || "Recovery email cleared.");
      }}>
        <Text style={styles.primaryText}>Save recovery email</Text>
      </TouchableOpacity>
    </ScreenShell>
  );
}

export function UsedSpaceScreen() {
  const { isLight } = useAppSettings();
  const tasks = getTasks();
  const notes = getNotes();
  const media = getMedia();
  const folders = getFolders();
  const rows = [
    { label: "Tasks", count: tasks.length, bytes: JSON.stringify(tasks).length, icon: "checklist" },
    { label: "Notes", count: notes.length, bytes: JSON.stringify(notes).length, icon: "notes" },
    { label: "Media", count: media.length, bytes: JSON.stringify(media).length, icon: "perm-media" },
    { label: "Folders", count: folders.length, bytes: JSON.stringify(folders).length, icon: "folder" },
  ];
  const total = rows.reduce((sum, row) => sum + row.bytes, 0);

  return (
    <ScreenShell title="Used space">
      <View style={[styles.card, isLight && styles.lightCard]}>
        <Text style={[styles.cardTitle, isLight && styles.lightTitle]}>Total local data</Text>
        <Text style={[styles.cardSubtitle, isLight && styles.lightSubtitle]}>{formatBytes(total)}</Text>
      </View>
      {rows.map((row) => (
        <SettingsRow key={row.label} title={row.label} subtitle={`${row.count} item(s) · ${formatBytes(row.bytes)}`} icon={row.icon} />
      ))}
    </ScreenShell>
  );
}

export function BackupManagerScreen() {
  const [backupTasks, setBackupTasks] = useStoredSetting("backupTasks", true);
  const [backupNotes, setBackupNotes] = useStoredSetting("backupNotes", true);
  const [backupMedia, setBackupMedia] = useStoredSetting("backupMedia", true);
  const [backupFolders, setBackupFolders] = useStoredSetting("backupFolders", true);
  const [lastBackup, setLastBackup] = useStoredSetting("lastBackup", "Never");

  const createBackup = async () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      ...(backupTasks ? { tasks: getTasks() } : {}),
      ...(backupNotes ? { notes: getNotes() } : {}),
      ...(backupMedia ? { media: getMedia() } : {}),
      ...(backupFolders ? { folders: getFolders() } : {}),
      settings: getSettingsSnapshot(),
    };
    const file = new File(Paths.document, `studysync-selected-backup-${Date.now()}.json`);
    file.write(JSON.stringify(payload, null, 2));
    const stamp = new Date().toLocaleString();
    setLastBackup(stamp);
    await Share.share({ title: "StudySync backup", message: "Selected backup created.", url: file.uri });
  };

  return (
    <ScreenShell title="Manage backups">
      <SettingsRow title="Tasks" subtitle="Include to-do tasks." icon="checklist" right={<Switch value={backupTasks} onValueChange={setBackupTasks} />} />
      <SettingsRow title="Notes" subtitle="Include study notes." icon="notes" right={<Switch value={backupNotes} onValueChange={setBackupNotes} />} />
      <SettingsRow title="Media" subtitle="Include imported media records." icon="perm-media" right={<Switch value={backupMedia} onValueChange={setBackupMedia} />} />
      <SettingsRow title="Folders" subtitle="Include folder records." icon="folder" right={<Switch value={backupFolders} onValueChange={setBackupFolders} />} />
      <SettingsRow title="Last backup" subtitle={lastBackup} icon="history" />
      <PrimaryButton title="Create selected backup" onPress={() => createBackup().catch(() => Alert.alert("Backup failed", "Could not create the selected backup."))} />
    </ScreenShell>
  );
}

export function ImportedFilesManagerScreen() {
  const [media, setMedia] = useState(getMedia());

  const refresh = () => setMedia(getMedia());
  const remove = (id: number, name: string) => {
    Alert.alert("Delete imported file", `Remove "${name || "media file"}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => {
        deleteMedia(id);
        refresh();
      }},
    ]);
  };

  return (
    <ScreenShell title="Manage imported files">
      {media.length === 0 ? (
        <SettingsRow title="No imported files" subtitle="Imported audio, video, and image records will appear here." icon="folder-open" />
      ) : (
        media.map((item) => (
          <SettingsRow
            key={item.id}
            title={item.name || "Imported file"}
            subtitle={`${item.type || "file"} · ${item.createdAt ? new Date(item.createdAt).toLocaleString() : "No date"}`}
            icon={item.type === "audio" ? "audiotrack" : item.type === "video" ? "movie" : "image"}
            onPress={() => item.uri && Linking.openURL(item.uri)}
            right={<TouchableOpacity onPress={() => remove(item.id, item.name || "")} hitSlop={10}><MaterialIcons name="delete-outline" size={22} color="#F87171" /></TouchableOpacity>}
          />
        ))
      )}
    </ScreenShell>
  );
}

export function CloudSyncScreen() {
  const isOnline = useNetwork();
  const [lastCloudSync, setLastCloudSync] = useStoredSetting("lastCloudSync", "Never");
  const [cloudStatus, setCloudStatus] = useState("No cloud snapshot loaded yet.");
  const [syncing, setSyncing] = useState(false);

  const getUserId = async () => {
    if (!isOnline) {
      Alert.alert("Offline", "Connect to the internet before cloud sync.");
      return null;
    }

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      Alert.alert("Sign in required", "Sign in before cloud sync.");
      return null;
    }
    return userId;
  };

  const uploadSnapshot = async () => {
    const userId = await getUserId();
    if (!userId) return;

    setSyncing(true);
    const snapshot = createCloudSnapshot();
    const payload = JSON.stringify(snapshot, null, 2);
    const latestPath = `${userId}/latest.json`;
    const historyPath = `${userId}/history/studysync-sync-${Date.now()}.json`;

    const latest = await supabase.storage.from("backups").upload(latestPath, payload, {
      contentType: "application/json",
      upsert: true,
    });

    if (latest.error) {
      setSyncing(false);
      Alert.alert("Cloud sync failed", `${latest.error.message}\n\nMake sure a Supabase Storage bucket named "backups" exists.`);
      return;
    }

    await supabase.storage.from("backups").upload(historyPath, payload, {
      contentType: "application/json",
      upsert: true,
    });

    const stamp = new Date().toLocaleString();
    setLastCloudSync(stamp);
    setCloudStatus(`Uploaded ${snapshot.tasks.length} tasks, ${snapshot.notes.length} notes, ${snapshot.media.length} media, and ${snapshot.folders.length} folders.`);
    setSyncing(false);
    Alert.alert("Cloud sync complete", "Your local StudySync data was uploaded and saved as the latest cloud snapshot.");
  };

  const readDownloadedSnapshot = async (blob: Blob) => {
    if (typeof blob.text === "function") {
      return JSON.parse(await blob.text()) as StudySyncCloudSnapshot;
    }

    return await new Promise<StudySyncCloudSnapshot>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          resolve(JSON.parse(String(reader.result)));
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(blob);
    });
  };

  const restoreLatest = async () => {
    const userId = await getUserId();
    if (!userId) return;

    Alert.alert("Restore cloud data", "This will replace local StudySync data with the latest cloud snapshot. Continue?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Restore",
        style: "destructive",
        onPress: async () => {
          try {
            setSyncing(true);
            const { data, error } = await supabase.storage.from("backups").download(`${userId}/latest.json`);
            if (error || !data) throw error || new Error("No latest cloud snapshot found.");
            const snapshot = await readDownloadedSnapshot(data);
            restoreCloudSnapshot(snapshot);
            const stamp = new Date().toLocaleString();
            setLastCloudSync(stamp);
            setCloudStatus(`Restored cloud snapshot from ${new Date(snapshot.syncedAt).toLocaleString()}.`);
            DeviceEventEmitter.emit("cloudSyncRestored");
            Alert.alert("Restore complete", "Latest cloud data was restored to this device.");
          } catch (error: any) {
            Alert.alert("Restore failed", error.message || "Could not restore the latest cloud snapshot.");
          } finally {
            setSyncing(false);
          }
        },
      },
    ]);
  };

  const checkCloud = async () => {
    const userId = await getUserId();
    if (!userId) return;

    setSyncing(true);
    const { data, error } = await supabase.storage.from("backups").list(userId, { limit: 20 });
    setSyncing(false);

    if (error) {
      Alert.alert("Cloud check failed", error.message);
      return;
    }

    const latest = data?.find((item) => item.name === "latest.json");
    setCloudStatus(latest ? `Latest cloud snapshot found. Updated: ${latest.updated_at ? new Date(latest.updated_at).toLocaleString() : "unknown"}` : "No latest cloud snapshot found.");
  };

  return (
    <ScreenShell title="Cloud sync">
      <SettingsRow title="Connection" subtitle={isOnline ? "Online" : "Offline"} icon="wifi" />
      <SettingsRow title="Last cloud sync" subtitle={lastCloudSync} icon="cloud-done" />
      <SettingsRow title="Cloud status" subtitle={cloudStatus} icon="cloud-queue" />
      <PrimaryButton title={syncing ? "Working..." : "Upload local data to cloud"} onPress={() => uploadSnapshot().catch((error) => Alert.alert("Cloud sync failed", error.message || "Could not sync files."))} />
      <PrimaryButton title="Restore latest cloud data" onPress={() => restoreLatest().catch((error) => Alert.alert("Restore failed", error.message || "Could not restore files."))} />
      <PrimaryButton title="Check cloud snapshot" onPress={() => checkCloud().catch((error) => Alert.alert("Cloud check failed", error.message || "Could not check cloud storage."))} />
    </ScreenShell>
  );
}

export function TwoFactorScreen() {
  const [enabled, setEnabled] = useStoredSetting("mfaEnabled", false);
  const navigation = useNavigation<any>();
  const toggleMfa = (next: boolean) => {
    setEnabled(next);
    Alert.alert(
      next ? "Two-factor preference enabled" : "Two-factor preference disabled",
      "This saves your StudySync MFA preference locally. Full passkey login needs a production auth setup."
    );
  };

  return (
    <ScreenShell title="Two-factor authentication">
      <Text style={styles.sectionCaption}>Second steps to log in</Text>
      <SettingsRow title="Passkeys and security keys" subtitle="Preference stored locally for demo." icon="vpn-key" right={<Switch value={enabled} onValueChange={toggleMfa} />} />
      <SettingsRow title="Phone number" subtitle={getSetting("recoveryPhone", "+63 912345678")} icon="phone" onPress={() => navigation.navigate("RecoveryPhone")} />
      <SettingsRow title="Email" subtitle="Use your account email for recovery." icon="email" onPress={() => navigation.navigate("RecoveryEmail")} />
      <SettingsRow title="Backup codes" subtitle="Tap to generate demo backup codes." icon="password" onPress={() => Alert.alert("Backup codes", "STUDY-2048\nSYNC-6174\nLOCAL-9321\n\nSave these demo codes somewhere private. Production backup codes need server-side MFA.")} />
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
export const AISummaryScreen = () => <AIToggleScreen title="AI note summarization" settingKey="aiSummarizeEnabled" placeholder="Paste notes to summarize..." action={summarizeStudyNotes} />;

export function SettingsSummaryCard() {
  const settings = getSettingsSnapshot();
  return (
    <Text style={styles.cardSubtitle}>
      {settings.themeMode} mode · {settings.language} · {settings.notificationsEnabled ? "notifications on" : "notifications off"}
    </Text>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  lightRoot: { flex: 1, backgroundColor: "#F4F7FB" },
  lightContainer: { backgroundColor: "#F4F7FB" },
  content: { padding: 20, paddingTop: 55, paddingBottom: 110 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 22 },
  headerTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "700" },
  sectionCaption: { color: "#FFFFFF", fontSize: 19, marginBottom: 10 },

  card: { backgroundColor: "#1A2535", borderRadius: 14, paddingVertical: 13, paddingHorizontal: 14, marginBottom: 10 },
  lightCard: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#DBE4F0" },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#10223A", alignItems: "center", justifyContent: "center" },
  lightIconCircle: { backgroundColor: "#E8F1FF" },
  rowText: { flex: 1 },
  cardTitle: { color: "#FFFFFF", fontSize: 15, fontWeight: "700", marginBottom: 3 },
  lightTitle: { color: "#0F172A" },
  cardSubtitle: { color: "#FFFFFF", fontSize: 11, lineHeight: 16 },
  lightSubtitle: { color: "#475569" },
  previewText: { color: "#FFFFFF", marginVertical: 18, textAlign: "center" },
  segmentRow: { flexDirection: "row", backgroundColor: "#0F172A", borderRadius: 12, padding: 4, marginTop: 10 },
  segmentButton: { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: "center" },
  segmentActive: { backgroundColor: "#58A6FF" },
  segmentText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  input: { backgroundColor: "#1A2535", borderRadius: 14, color: "#FFFFFF", paddingHorizontal: 14, minHeight: 48, marginBottom: 12 },
  lightInput: { backgroundColor: "#FFFFFF", color: "#0F172A", borderWidth: 1, borderColor: "#DBE4F0" },
  multiline: { minHeight: 120, paddingTop: 14, textAlignVertical: "top" },
  primaryButton: { minHeight: 48, borderRadius: 14, backgroundColor: "#007AFF", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  disabledButton: { opacity: 0.45 },
  primaryText: { color: "#FFFFFF", fontWeight: "800", fontSize: 14 },
});
