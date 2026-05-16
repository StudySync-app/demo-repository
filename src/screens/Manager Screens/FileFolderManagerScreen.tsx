import React, { useCallback, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import { addFolder, deleteFolder, getFolders, type Folder } from "../../db/folders";
import { getMedia } from "../../db/media";
import { getNotes } from "../../db/notes";
import { getTasks } from "../../db/tasks";
import { useAppSettings } from "../../settings/AppSettingsContext";

export default function FileFolderManagerScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { isLight, textScale } = useAppSettings();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [name, setName] = useState("");

  const refresh = useCallback(() => setFolders(getFolders()), []);
  useFocusEffect(refresh);

  const counts = useMemo(() => {
    const tasks = getTasks();
    const notes = getNotes();
    const media = getMedia();

    return folders.map((folder) => ({
      folder,
      tasks: tasks.filter((item) => item.folderId === folder.id).length,
      notes: notes.filter((item) => item.folderId === folder.id).length,
      media: media.filter((item) => item.folderId === folder.id).length,
    }));
  }, [folders]);

  const createFolder = async () => {
    if (!name.trim()) {
      Alert.alert("Folder name required", "Enter a folder name first.");
      return;
    }

    await addFolder(name.trim(), "general");
    setName("");
    refresh();
  };

  const chooseFolder = (folder: Folder) => {
    if (route.params?.selectForTask) {
      navigation.navigate({
        name: "TasksScreen",
        params: { selectedFolderId: folder.id },
        merge: true,
      });
      return;
    }
  };

  const confirmDelete = (folder: Folder) => {
    Alert.alert("Delete folder", `Delete "${folder.name}"? Folder contents will stay in the app.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteFolder(folder.id);
          refresh();
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, isLight && styles.lightContainer, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <MaterialIcons name="arrow-back" size={24} color={isLight ? "#0F172A" : "#FFFFFF"} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isLight && styles.lightTitle, { fontSize: 24 * textScale }]}>File folders</Text>
      </View>

      <View style={styles.createRow}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="New folder"
          placeholderTextColor="#94A3B8"
          style={[styles.input, isLight && styles.lightInput]}
        />
        <TouchableOpacity onPress={createFolder} style={styles.addButton}>
          <MaterialIcons name="add" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 110 }}>
        {counts.length === 0 ? (
          <Text style={[styles.emptyText, isLight && styles.lightSubtitle]}>No folders yet. Create a folder to organize tasks, notes, media, audio, and video.</Text>
        ) : (
          counts.map(({ folder, tasks, notes, media }) => (
            <TouchableOpacity key={folder.id} style={[styles.card, isLight && styles.lightCard]} activeOpacity={0.85} onPress={() => chooseFolder(folder)}>
              <View style={styles.iconWrap}>
                <MaterialIcons name="folder" size={26} color="#58A6FF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, isLight && styles.lightTitle]}>{folder.name}</Text>
                <Text style={styles.cardSubtitle}>{tasks} tasks · {notes} notes · {media} media</Text>
              </View>
              {route.params?.selectForTask ? (
                <MaterialIcons name="check-circle" size={24} color="#FFFFFF" />
              ) : null}
              <TouchableOpacity onPress={() => confirmDelete(folder)} hitSlop={10}>
                <MaterialIcons name="delete-outline" size={24} color="#F87171" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050816" },
  lightContainer: { backgroundColor: "#F4F7FB" },
  header: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 20, paddingBottom: 14 },
  headerTitle: { color: "#FFFFFF", fontSize: 24, fontWeight: "800" },
  createRow: { flexDirection: "row", gap: 10, paddingHorizontal: 20, marginBottom: 4 },
  input: { flex: 1, backgroundColor: "#111827", color: "#FFFFFF", borderRadius: 16, minHeight: 48, paddingHorizontal: 14 },
  lightInput: { backgroundColor: "#FFFFFF", color: "#0F172A", borderWidth: 1, borderColor: "#DBE4F0" },
  addButton: { width: 48, height: 48, borderRadius: 16, backgroundColor: "#4B76E7", alignItems: "center", justifyContent: "center" },
  card: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#111827", borderRadius: 18, padding: 14, marginBottom: 10 },
  lightCard: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#DBE4F0" },
  iconWrap: { width: 44, height: 44, borderRadius: 14, backgroundColor: "#1F2A43", alignItems: "center", justifyContent: "center" },
  cardTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  cardSubtitle: { color: "#94A3B8", fontSize: 12, marginTop: 4 },
  emptyText: { color: "#94A3B8", textAlign: "center", marginTop: 80, lineHeight: 22 },
  lightTitle: { color: "#0F172A" },
  lightSubtitle: { color: "#64748B" },
});
