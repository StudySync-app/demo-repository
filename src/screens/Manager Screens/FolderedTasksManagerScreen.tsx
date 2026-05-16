import React, { useCallback, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import { addFolder, getFolders, type Folder } from "../../db/folders";
import { deleteTask, getTasks, updateTaskFull, type Task } from "../../db/tasks";
import { CreateFolderSheet } from "../../components/CreateFolderSheet";
import { useAppSettings } from "../../settings/AppSettingsContext";

export default function FolderedTasksManagerScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { isLight, textScale } = useAppSettings();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [expandedFolderId, setExpandedFolderId] = useState<number | null>(null);
  const [folderSheetVisible, setFolderSheetVisible] = useState(false);

  const refresh = useCallback(() => {
    setFolders(getFolders());
    setTasks(getTasks());
  }, []);

  useFocusEffect(refresh);

  const grouped = useMemo(
    () =>
      folders
        .map((folder) => ({
          folder,
          items: tasks.filter((task) => task.folderId === folder.id),
        })),
    [folders, tasks]
  );

  const removeFromFolder = (task: Task) => {
    updateTaskFull(task.id, {
      title: task.title,
      priority: task.priority || "important",
      dueDate: task.dueDate || new Date().toISOString(),
      description: task.description || null,
      status: task.status || "todo",
      folderId: null,
    });
    refresh();
  };

  const moveToFolder = (task: Task, folderId: number) => {
    updateTaskFull(task.id, {
      title: task.title,
      priority: task.priority || "important",
      dueDate: task.dueDate || new Date().toISOString(),
      description: task.description || null,
      status: task.status || "todo",
      folderId,
    });
    setExpandedFolderId(folderId);
    refresh();
  };

  const handleCreateFolder = async (name: string) => {
    try {
      const folderId = await addFolder(name.trim(), "Tasks");
      setExpandedFolderId(folderId);
      setFolderSheetVisible(false);
      refresh();
    } catch {
      Alert.alert("Folder error", "Could not create the folder.");
    }
  };

  const handleAddTask = (folder: Folder) => {
    const availableTasks = tasks.filter((task) => task.folderId !== folder.id);
    if (availableTasks.length === 0) {
      Alert.alert("No tasks available", "All tasks are already inside this folder.");
      return;
    }

    Alert.alert("Add task to folder", folder.name, [
      ...availableTasks.slice(0, 8).map((task) => ({
        text: task.title || "Untitled task",
        onPress: () => moveToFolder(task, folder.id),
      })),
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const confirmDelete = (task: Task) => {
    Alert.alert("Delete task", `Remove "${task.title}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => {
        deleteTask(task.id);
        refresh();
      }},
    ]);
  };

  return (
    <View style={[styles.container, isLight && styles.lightContainer, { paddingTop: insets.top + 12 }]}>
      <CreateFolderSheet
        isVisible={folderSheetVisible}
        onClose={() => setFolderSheetVisible(false)}
        onCreate={handleCreateFolder}
        folders={folders}
      />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
            <MaterialIcons name="arrow-back" size={24} color={isLight ? "#0F172A" : "#FFFFFF"} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isLight && styles.lightTitle, { fontSize: 24 * textScale }]}>Foldered to-dos</Text>
        </View>
        <TouchableOpacity style={styles.headerButton} onPress={() => setFolderSheetVisible(true)}>
          <MaterialIcons name="create-new-folder" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 110 }}>
        {folders.length === 0 ? (
          <Text style={[styles.emptyText, isLight && styles.lightSubtitle]}>No to-do folders yet. Create a folder from the task manager.</Text>
        ) : (
          grouped.map(({ folder, items }) => (
            <View key={folder.id} style={styles.folderBlock}>
              <TouchableOpacity
                style={[styles.folderHeader, isLight && styles.lightCard]}
                activeOpacity={0.85}
                onPress={() => setExpandedFolderId((current) => current === folder.id ? null : folder.id)}
              >
                <MaterialIcons name={expandedFolderId === folder.id ? "folder-open" : "folder"} size={26} color="#58A6FF" />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.folderName, isLight && styles.lightTitle]}>{folder.name}</Text>
                  <Text style={[styles.folderCount, isLight && styles.lightSubtitle]}>{items.length} task{items.length === 1 ? "" : "s"}</Text>
                </View>
                <TouchableOpacity style={styles.folderActionButton} onPress={() => handleAddTask(folder)}>
                  <MaterialIcons name="add" size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <MaterialIcons name={expandedFolderId === folder.id ? "expand-less" : "expand-more"} size={22} color="#94A3B8" />
              </TouchableOpacity>

              {expandedFolderId === folder.id ? (
                items.length === 0 ? (
                  <Text style={[styles.folderEmptyText, isLight && styles.lightEmptyText]}>This folder is empty and ready for tasks.</Text>
                ) : (
                  items.map((task) => (
                    <View key={task.id} style={[styles.card, isLight && styles.lightCard]}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.cardTitle, isLight && styles.lightTitle]}>{task.title}</Text>
                        <Text style={[styles.cardSubtitle, isLight && styles.lightSubtitle]}>{task.description || "No description"}</Text>
                      </View>
                      <TouchableOpacity onPress={() => navigation.navigate("TasksScreen", { task })} style={styles.iconButton}>
                        <MaterialIcons name="edit" size={20} color="#FFFFFF" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => removeFromFolder(task)} style={styles.iconButton}>
                        <MaterialIcons name="folder-off" size={20} color="#FFFFFF" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => confirmDelete(task)} style={styles.iconButton}>
                        <MaterialIcons name="delete" size={20} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  ))
                )
              ) : null}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050816" },
  lightContainer: { backgroundColor: "#F4F7FB" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 8 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  headerButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#1F2A43", alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "#FFFFFF", fontSize: 24, fontWeight: "800" },
  folderBlock: { marginBottom: 18 },
  folderHeader: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#111827", borderRadius: 18, padding: 14, marginBottom: 10 },
  lightCard: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#DBE4F0" },
  folderName: { color: "#58A6FF", fontSize: 16, fontWeight: "800" },
  folderCount: { color: "#94A3B8", fontSize: 12, marginTop: 3 },
  folderActionButton: { width: 34, height: 34, borderRadius: 12, backgroundColor: "#4B76E7", alignItems: "center", justifyContent: "center" },
  folderEmptyText: { color: "#94A3B8", backgroundColor: "#0B1220", borderRadius: 14, padding: 14, marginBottom: 10 },
  lightEmptyText: { color: "#64748B", backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#DBE4F0" },
  card: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#111827", borderRadius: 18, padding: 14, marginBottom: 10 },
  cardTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  cardSubtitle: { color: "#94A3B8", fontSize: 12, marginTop: 4 },
  iconButton: { width: 34, height: 34, borderRadius: 12, backgroundColor: "#1F2A43", alignItems: "center", justifyContent: "center" },
  emptyText: { color: "#94A3B8", textAlign: "center", marginTop: 80, lineHeight: 22 },
  lightTitle: { color: "#0F172A" },
  lightSubtitle: { color: "#64748B" },
});
