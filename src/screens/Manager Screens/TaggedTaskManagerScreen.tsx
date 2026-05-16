import React, { useCallback, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import { getTasks, type Task } from "../../db/tasks";
import { getTaggedContentIds, toggleContentTag } from "../../db/tags";
import { useAppSettings } from "../../settings/AppSettingsContext";

export default function TaggedTasksManagerScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { isLight, textScale } = useAppSettings();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [ids, setIds] = useState<Set<number>>(new Set());

  const refresh = useCallback(() => {
    setTasks(getTasks());
    setIds(new Set(getTaggedContentIds("task")));
  }, []);

  useFocusEffect(refresh);

  const taggedTasks = useMemo(() => tasks.filter((task) => ids.has(task.id)), [ids, tasks]);

  return (
    <View style={[styles.container, isLight && styles.lightContainer, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <MaterialIcons name="arrow-back" size={24} color={isLight ? "#0F172A" : "#FFFFFF"} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isLight && styles.lightTitle, { fontSize: 24 * textScale }]}>Tagged to-dos</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 110 }}>
        {taggedTasks.length === 0 ? (
          <Text style={[styles.emptyText, isLight && styles.lightSubtitle]}>No tagged to-dos yet.</Text>
        ) : (
          taggedTasks.map((task) => (
            <View key={task.id} style={[styles.card, isLight && styles.lightCard]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, isLight && styles.lightTitle, { fontSize: 16 * textScale }]}>{task.title}</Text>
                <Text style={[styles.cardSubtitle, isLight && styles.lightSubtitle]}>
                  {task.priority || "minor"} · {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No date"}
                </Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate("TasksScreen", { task })} style={styles.iconButton}>
                <MaterialIcons name="edit" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                toggleContentTag("task", task.id);
                refresh();
              }} style={styles.iconButton}>
                <MaterialIcons name="bookmark-remove" size={20} color="#FFFFFF" />
              </TouchableOpacity>
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
  header: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 20, paddingBottom: 8 },
  headerTitle: { color: "#FFFFFF", fontSize: 24, fontWeight: "800" },
  card: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#111827", borderRadius: 18, padding: 14, marginBottom: 10 },
  lightCard: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#DBE4F0" },
  cardTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  cardSubtitle: { color: "#94A3B8", fontSize: 12, marginTop: 4 },
  iconButton: { width: 34, height: 34, borderRadius: 12, backgroundColor: "#1F2A43", alignItems: "center", justifyContent: "center" },
  emptyText: { color: "#94A3B8", textAlign: "center", marginTop: 80, lineHeight: 22 },
  lightTitle: { color: "#0F172A" },
  lightSubtitle: { color: "#64748B" },
});
