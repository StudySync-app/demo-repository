import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Text,
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
  useWindowDimensions
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import {
  addTask,
  updateTaskFull,
  type Task
} from "../db/tasks";
import { addFolder, getFolders, type Folder } from "../db/folders";
import { notifyNewTask, scheduleTaskReminder } from "../lib/notification";
import { useTaskStore } from "../store/useTaskStore";
import { CreateFolderSheet } from "../components/CreateFolderSheet";

const ACCENT = "#4B76E7";
const BG = "#0A0E1A";
const INPUT_BORDER = "rgba(255,255,255,0.28)";

const PRIORITIES = [
  { key: "urgent" as const, label: "Urgent" },
  { key: "important" as const, label: "Important" },
  { key: "minor" as const, label: "Minor" }
];

const PROGRESS = [
  { key: "todo" as const, label: "To get done" },
  { key: "ongoing" as const, label: "Ongoing" },
  { key: "paused" as const, label: "Paused" }
];

function mondayFirst(d: Date) {
  const day = d.getDay();
  return day === 0 ? 6 : day - 1;
}

function buildMonthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const pad = mondayFirst(first);
  const dim = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < pad; i++) cells.push(null);
  for (let d = 1; d <= dim; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }
  return rows;
}

export default function TasksScreen() {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { loadTasks } = useTaskStore();

  const isCompact = windowWidth < 380;
  const scrollPad = isCompact ? 12 : 16;
  const dateCardPad = isCompact ? 12 : 16;
  const calendarInnerW = windowWidth - scrollPad * 2 - dateCardPad * 2;
  const cellSize = Math.max(26, Math.min(42, Math.floor((calendarInnerW - 6) / 7)));
  const headerSide = Math.min(88, Math.max(56, Math.floor(windowWidth * 0.2)));

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<(typeof PRIORITIES)[number]["key"]>("important");
  const [progress, setProgress] = useState<(typeof PROGRESS)[number]["key"]>("todo");
  const [dueDate, setDueDate] = useState(new Date());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [folderId, setFolderId] = useState<number | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  
  // Modal visibility state
  const [isModalVisible, setIsModalVisible] = useState(false);

  const refreshFolders = useCallback(() => {
    setFolders(getFolders());
  }, []);

  useEffect(() => {
    refreshFolders();
  }, [refreshFolders]);

  const applyTask = useCallback((task: Task) => {
    setTitle(task.title ?? "");
    setDescription(task.description ?? "");
    const p = task.priority as string | null;
    setPriority(p === "urgent" || p === "important" || p === "minor" ? p : "important");
    const st = task.status as string | null;
    setProgress(st === "ongoing" || st === "paused" ? st : "todo");
    setDueDate(task.dueDate ? new Date(task.dueDate) : new Date());
    setEditingId(task.id);
    setFolderId(task.folderId ?? null);
    if (task.dueDate) {
      const dd = new Date(task.dueDate);
      setViewMonth(new Date(dd.getFullYear(), dd.getMonth(), 1));
    }
  }, []);

  useEffect(() => {
    const t = route.params?.task as Task | undefined;
    if (t?.id) {
      applyTask(t);
      navigation.setParams({ task: undefined });
    }
  }, [route.params?.task, applyTask, navigation]);

  const saveTask = async () => {
    if (!title.trim()) {
      Alert.alert("Missing title", "Please enter a title for your to-do.");
      return;
    }

    const iso = dueDate.toISOString();

    if (editingId != null) {
      updateTaskFull(editingId, {
        title: title.trim(),
        priority,
        dueDate: iso,
        description: description.trim() || null,
        status: progress,
        folderId
      });
    } else {
      addTask(title.trim(), priority, iso, folderId, {
        description: description.trim() || null,
        status: progress
      });
    }

    try {
      await scheduleTaskReminder(title.trim(), dueDate);
      if (editingId == null) await notifyNewTask(title.trim());
    } catch { /* ignored */ }

    await loadTasks();
    navigation.goBack();
  };

  // src/screens/TasksScreen.tsx
const handleCreateFolder = async (name: string, category: string) => {
  try {
    // This captures the number returned by the updated addFolder function
    const newFolderId = await addFolder(name, category);
    
    // Now this is assigning a number to a number state
    setFolderId(newFolderId); 
    refreshFolders();
    
    setIsModalVisible(false);
  } catch (e) {
    Alert.alert("Error", "Failed to create folder");
  }
};
  const monthGrid = useMemo(() => buildMonthGrid(viewMonth.getFullYear(), viewMonth.getMonth()), [viewMonth]);

  const isSelectedDay = (day: number | null) => {
    if (day == null) return false;
    return (
      dueDate.getFullYear() === viewMonth.getFullYear() &&
      dueDate.getMonth() === viewMonth.getMonth() &&
      dueDate.getDate() === day
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardRoot}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 44 : 0}
    >
      <View style={[styles.root, { backgroundColor: BG, paddingLeft: insets.left, paddingRight: insets.right }]}>
        
        {/* The Modal */}
        <CreateFolderSheet
          isVisible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          onCreate={handleCreateFolder}
          folders={folders}
          selectedFolderId={folderId}
          onSelectFolder={(id) => {
            setFolderId(id);
            setIsModalVisible(false);
          }}
        />

        {/* Header */}
        <View style={[styles.header, { marginTop: insets.top, paddingHorizontal: Math.max(8, scrollPad - 4) }]}>
          <TouchableOpacity
            style={{ width: headerSide, minWidth: 44 }}
            onPress={() => navigation.goBack()}
            hitSlop={12}
          >
            <MaterialIcons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, isCompact && styles.headerTitleCompact]} numberOfLines={1}>
            {editingId ? "Edit to-do" : "Set your to-do"}
          </Text>

          <View style={[styles.headerRight, { width: headerSide, minWidth: 72 }]}>
            <TouchableOpacity onPress={() => setIsModalVisible(true)} style={styles.headerIconBtn}>
              <MaterialIcons name="folder" size={20} color={folderId ? ACCENT : "#FFFFFF"} />
            </TouchableOpacity>
            <TouchableOpacity onPress={saveTask} style={styles.headerIconBtn}>
              <MaterialIcons name="check" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingHorizontal: scrollPad, paddingBottom: 40 }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.inputStack}>
            <TextInput
              style={styles.inputPill}
              value={title}
              onChangeText={setTitle}
              placeholder="Title"
              placeholderTextColor="#7B88A2"
            />
            <TextInput
              style={[styles.inputPill, styles.inputMultiline]}
              value={description}
              onChangeText={setDescription}
              placeholder="Description"
              placeholderTextColor="#7B88A2"
              multiline
            />
          </View>

          <Text style={styles.sectionLabel}>Priority status</Text>
          <View style={styles.priorityRow}>
            {PRIORITIES.map((item) => (
              <TouchableOpacity key={item.key} style={styles.priorityOption} onPress={() => setPriority(item.key)}>
                <View style={[styles.radioCircle, priority === item.key && styles.radioCircleSelected]} />
                <Text style={styles.priorityLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Progress status</Text>
          <View style={styles.segmentRow}>
            {PROGRESS.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[styles.segmentButton, progress === item.key && styles.segmentButtonSelected]}
                onPress={() => setProgress(item.key)}
              >
                <Text style={[styles.segmentText, progress === item.key && styles.segmentTextSelected]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Select Due Date</Text>
          <View style={[styles.dateCard, { padding: dateCardPad }]}>
            <View style={styles.dateHeader}>
              <Text style={styles.dateMonth}>
                {viewMonth.toLocaleString("default", { month: "long" }).toUpperCase()} {viewMonth.getFullYear()}
              </Text>
              <View style={styles.dateNav}>
                <TouchableOpacity onPress={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}>
                  <MaterialIcons name="chevron-left" size={22} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}>
                  <MaterialIcons name="chevron-right" size={22} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.weekDays}>
              {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
                <Text key={day} style={[styles.weekDayText, { width: cellSize }]}>{day}</Text>
              ))}
            </View>
            {monthGrid.map((row, ri) => (
              <View key={`row-${ri}`} style={styles.dateRow}>
                {row.map((cell, ci) => (
                  <TouchableOpacity
                    key={`${ri}-${ci}`}
                    disabled={cell === null}
                    style={[styles.dateCell, { width: cellSize, height: cellSize }, isSelectedDay(cell) && styles.dateCellSelected]}
                    onPress={() => cell && setDueDate(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), cell))}
                  >
                    <Text style={[styles.dateNumber, isSelectedDay(cell) && styles.dateNumberSelected]}>
                      {cell}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardRoot: { flex: 1 },
  root: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 56 },
  headerTitle: { flex: 1, textAlign: "center", color: "#FFFFFF", fontSize: 17, fontWeight: "700" },
  headerTitleCompact: { fontSize: 15 },
  headerRight: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 4 },
  headerIconBtn: { padding: 4, marginLeft: 4 },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 150 },
  inputStack: { marginBottom: 20 },
  inputPill: { backgroundColor: "#111827", color: "#FFFFFF", paddingHorizontal: 18, paddingVertical: 14, borderRadius: 999, borderWidth: 1, borderColor: INPUT_BORDER, marginBottom: 12, fontSize: 16 },
  inputMultiline: { minHeight: 88, maxHeight: 160, borderRadius: 22, paddingTop: 14 },
  sectionLabel: { color: "#FFFFFF", fontSize: 14, marginBottom: 12, fontWeight: "600" },
  priorityRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 22 },
  priorityOption: { alignItems: "center", flex: 1 },
  radioCircle: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: ACCENT, marginBottom: 8 },
  radioCircleSelected: { backgroundColor: ACCENT },
  priorityLabel: { color: "#FFFFFF", fontSize: 12, textAlign: "center" },
  segmentRow: { flexDirection: "row", backgroundColor: "#1E293B", borderRadius: 18, padding: 6, marginBottom: 22 },
  segmentButton: { flex: 1, paddingVertical: 11, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  segmentButtonSelected: { backgroundColor: "#0f172a" },
  segmentText: { color: "#94A3B8", fontSize: 12 },
  segmentTextSelected: { color: ACCENT, fontWeight: "700" },
  dateCard: { backgroundColor: "#111827", borderRadius: 22, marginBottom: 22 },
  dateHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  dateMonth: { color: ACCENT, fontSize: 14, fontWeight: "700" },
  dateNav: { flexDirection: "row", gap: 4 },
  weekDays: { flexDirection: "row", justifyContent: "center", marginBottom: 8 },
  weekDayText: { color: "#94B8FF", fontSize: 10, textAlign: "center" },
  dateRow: { flexDirection: "row", justifyContent: "center", marginBottom: 4 },
  dateCell: { justifyContent: "center", alignItems: "center" },
  dateCellSelected: { backgroundColor: ACCENT, borderRadius: 10 },
  dateNumber: { color: "#E2E8F0", fontSize: 14, fontWeight: "600" },
  dateNumberSelected: { color: "#FFFFFF" }
});
