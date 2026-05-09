import React, { useCallback, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import { getFolders, type Folder } from "../../db/folders";
import { deleteTask, getTasks, updateTaskFull, type Task } from "../../db/tasks";

export default function FolderedTasksManagerScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

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
        }))
        .filter((group) => group.items.length > 0),
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
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Foldered to-dos</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 110 }}>
        {grouped.length === 0 ? (
          <Text style={styles.emptyText}>No to-dos are inside folders yet. Create or select a folder from the to-do screen.</Text>
        ) : (
          grouped.map(({ folder, items }) => (
            <View key={folder.id} style={styles.folderBlock}>
              <Text style={styles.folderName}>{folder.name}</Text>
              {items.map((task) => (
                <View key={task.id} style={styles.card}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{task.title}</Text>
                    <Text style={styles.cardSubtitle}>{task.description || "No description"}</Text>
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
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050816" },
  header: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 20, paddingBottom: 8 },
  headerTitle: { color: "#FFFFFF", fontSize: 24, fontWeight: "800" },
  folderBlock: { marginBottom: 18 },
  folderName: { color: "#58A6FF", fontSize: 16, fontWeight: "800", marginBottom: 10 },
  card: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#111827", borderRadius: 18, padding: 14, marginBottom: 10 },
  cardTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  cardSubtitle: { color: "#94A3B8", fontSize: 12, marginTop: 4 },
  iconButton: { width: 34, height: 34, borderRadius: 12, backgroundColor: "#1F2A43", alignItems: "center", justifyContent: "center" },
  emptyText: { color: "#94A3B8", textAlign: "center", marginTop: 80, lineHeight: 22 },
});
