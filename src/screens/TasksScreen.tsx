import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Text,
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Platform,
  KeyboardAvoidingView,
  useWindowDimensions
} from "react-native";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import DateTimePicker from "@react-native-community/datetimepicker";

import {
  addTask,
  deleteTask,
  updateTaskFull,
  toggleTaskCompleted,
  type Task
} from "../db/tasks";
import { getFolders } from "../db/folders";
import { scheduleTaskReminder } from "../lib/notification";
import { useTaskStore } from "../store/useTaskStore";

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
  const { tasks, loadTasks } = useTaskStore();

  const isCompact = windowWidth < 380;
  const scrollPad = isCompact ? 12 : 16;
  const dateCardPad = isCompact ? 12 : 16;
  /** Calendar cell size so 7 columns fit without horizontal overflow */
  const calendarInnerW = windowWidth - scrollPad * 2 - dateCardPad * 2;
  const cellSize = Math.max(
    26,
    Math.min(42, Math.floor((calendarInnerW - 6) / 7))
  );
  const headerSide = Math.min(88, Math.max(56, Math.floor(windowWidth * 0.2)));

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<(typeof PRIORITIES)[number]["key"]>("important");
  const [progress, setProgress] = useState<(typeof PROGRESS)[number]["key"]>("todo");
  const [dueDate, setDueDate] = useState(new Date());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [folderId, setFolderId] = useState<number | null>(null);
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState("");

  const clearForm = useCallback(() => {
    setTitle("");
    setDescription("");
    setPriority("important");
    setProgress("todo");
    setDueDate(new Date());
    setEditingId(null);
    setFolderId(null);
    const d = new Date();
    setViewMonth(new Date(d.getFullYear(), d.getMonth(), 1));
  }, []);

  const applyTask = useCallback((task: Task) => {
    setTitle(task.title ?? "");
    setDescription(task.description ?? "");
    const p = task.priority as string | null;
    setPriority(
      p === "urgent" || p === "important" || p === "minor" ? p : "important"
    );
    const st = task.status as string | null;
    setProgress(
      st === "ongoing" || st === "paused" ? st : "todo"
    );
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

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [loadTasks])
  );

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
    } catch {
      /* optional */
    }

    await loadTasks();
    clearForm();
  };

  const openFolderPicker = () => {
    const folders = getFolders();
    const buttons: {
      text: string;
      style?: "cancel";
      onPress?: () => void;
    }[] = [
      { text: "No folder", onPress: () => setFolderId(null) },
      ...folders.map((f) => ({
        text: f.name,
        onPress: () => setFolderId(f.id)
      })),
      { text: "Cancel", style: "cancel" }
    ];
    Alert.alert("Folder", "Choose a folder for this to-do", buttons);
  };

  const selectCalendarDay = (day: number) => {
    const y = viewMonth.getFullYear();
    const m = viewMonth.getMonth();
    setDueDate(new Date(y, m, day));
  };

  const monthGrid = useMemo(
    () => buildMonthGrid(viewMonth.getFullYear(), viewMonth.getMonth()),
    [viewMonth]
  );

  const isSelectedDay = (day: number | null) => {
    if (day == null) return false;
    return (
      dueDate.getFullYear() === viewMonth.getFullYear() &&
      dueDate.getMonth() === viewMonth.getMonth() &&
      dueDate.getDate() === day
    );
  };

  const filteredTasks = tasks.filter((task: Task) =>
    (task.title ?? "").toLowerCase().includes(search.toLowerCase())
  );
  const activeTasks = filteredTasks.filter((t: Task) => !t.completed);
  const completedTasks = filteredTasks.filter((t: Task) => t.completed);

  return (
    <KeyboardAvoidingView
      style={styles.keyboardRoot}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 44 : 0}
    >
      <View
        style={[
          styles.root,
          {
            backgroundColor: BG,
            paddingBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right
          }
        ]}
      >
        <View
          style={[
            styles.header,
            { marginTop: insets.top, paddingHorizontal: Math.max(8, scrollPad - 4) }
          ]}
        >
          <TouchableOpacity
            style={{ width: headerSide, minWidth: 44 }}
            onPress={() => navigation.navigate("Home")}
            hitSlop={12}
          >
            <MaterialIcons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text
            style={[styles.headerTitle, isCompact && styles.headerTitleCompact]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
          >
            Set your to-do
          </Text>
          <View style={[styles.headerRight, { width: headerSide, minWidth: 72 }]}>
            <TouchableOpacity onPress={openFolderPicker} hitSlop={10} style={styles.headerIconBtn}>
              <MaterialIcons name="folder" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={saveTask} hitSlop={10} style={styles.headerIconBtn}>
              <MaterialIcons name="check" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingHorizontal: scrollPad, paddingBottom: Math.max(24, insets.bottom + 8) }
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
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
            textAlignVertical="top"
          />
        </View>

        <Text style={styles.sectionLabel}>Priority status</Text>
        <View style={styles.priorityRow}>
          {PRIORITIES.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={styles.priorityOption}
              onPress={() => setPriority(item.key)}
              activeOpacity={0.85}
            >
              <View
                style={[
                  styles.radioCircle,
                  priority === item.key && styles.radioCircleSelected
                ]}
              />
              <Text
                style={[styles.priorityLabel, isCompact && styles.priorityLabelCompact]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Progress status</Text>
        <View style={styles.segmentRow}>
          {PROGRESS.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.segmentButton,
                isCompact && styles.segmentButtonCompact,
                progress === item.key && styles.segmentButtonSelected
              ]}
              onPress={() => setProgress(item.key)}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.segmentText,
                  isCompact && styles.segmentTextCompact,
                  progress === item.key && styles.segmentTextSelected
                ]}
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Select Due Date</Text>
        <View style={[styles.dateCard, { padding: dateCardPad }]}>
          <View style={styles.dateHeader}>
            <Text style={[styles.dateMonth, isCompact && styles.dateMonthCompact]} numberOfLines={1}>
              {viewMonth
                .toLocaleString("default", { month: "long" })
                .toUpperCase()}{" "}
              {viewMonth.getFullYear()}
            </Text>
            <View style={styles.dateNav}>
              <TouchableOpacity onPress={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))} hitSlop={8}>
                <MaterialIcons name="chevron-left" size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))} hitSlop={8}>
                <MaterialIcons name="chevron-right" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={[styles.weekDays, { marginBottom: 8 }]}>
            {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
              <Text
                key={day}
                style={[styles.weekDayText, { width: cellSize, maxWidth: cellSize }]}
              >
                {day}
              </Text>
            ))}
          </View>
          {monthGrid.map((row, ri) => (
            <View key={`row-${ri}`} style={styles.dateRow}>
              {row.map((cell, ci) =>
                cell == null ? (
                  <View
                    key={`e-${ri}-${ci}`}
                    style={[styles.dateCell, { width: cellSize, height: cellSize }]}
                  />
                ) : (
                  <TouchableOpacity
                    key={`d-${ri}-${ci}`}
                    style={[
                      styles.dateCell,
                      { width: cellSize, height: cellSize },
                      isSelectedDay(cell) && styles.dateCellSelected
                    ]}
                    onPress={() => selectCalendarDay(cell)}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[
                        styles.dateNumber,
                        cellSize < 32 && styles.dateNumberSmall,
                        isSelectedDay(cell) && styles.dateNumberSelected
                      ]}
                    >
                      {cell}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          ))}
        </View>

        <TextInput
          style={styles.search}
          placeholder="Search your to-dos..."
          placeholderTextColor="#7B88A2"
          value={search}
          onChangeText={setSearch}
        />

        <Text style={styles.listHeading}>Your to-dos</Text>
        {activeTasks.map((task: Task) => (
          <View key={task.id} style={styles.taskRow}>
            <TouchableOpacity
              style={styles.taskRowMain}
              onPress={() => applyTask(task)}
              activeOpacity={0.88}
            >
              <Text style={styles.taskTitle} numberOfLines={2}>
                {task.title}
              </Text>
              <Text style={styles.taskMeta}>
                {task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString()
                  : "No date"}
              </Text>
            </TouchableOpacity>
            <Switch
              value={!!task.completed}
              onValueChange={(v) => {
                toggleTaskCompleted(task.id, v);
                loadTasks();
              }}
              trackColor={{ false: "#334155", true: ACCENT }}
              thumbColor="#f8fafc"
            />
            <TouchableOpacity
              onPress={() => {
                Alert.alert("Delete to-do", `Remove "${task.title}"?`, [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                      deleteTask(task.id);
                      loadTasks();
                      if (editingId === task.id) clearForm();
                    }
                  }
                ]);
              }}
              hitSlop={10}
              style={styles.deleteBtn}
            >
              <MaterialIcons name="delete-outline" size={22} color="#f87171" />
            </TouchableOpacity>
          </View>
        ))}

        {completedTasks.length > 0 ? (
          <Text style={[styles.listHeading, { marginTop: 8 }]}>Completed</Text>
        ) : null}
        {completedTasks.map((task: Task) => (
          <View key={task.id} style={[styles.taskRow, styles.taskRowDone]}>
            <TouchableOpacity
              style={styles.taskRowMain}
              onPress={() => applyTask(task)}
              activeOpacity={0.88}
            >
              <Text style={[styles.taskTitle, styles.taskTitleDone]} numberOfLines={2}>
                {task.title}
              </Text>
              <Text style={styles.taskMeta}>
                {task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString()
                  : "No date"}
              </Text>
            </TouchableOpacity>
            <Switch
              value={!!task.completed}
              onValueChange={(v) => {
                toggleTaskCompleted(task.id, v);
                loadTasks();
              }}
              trackColor={{ false: "#334155", true: ACCENT }}
              thumbColor="#f8fafc"
            />
            <TouchableOpacity
              onPress={() => {
                deleteTask(task.id);
                loadTasks();
                if (editingId === task.id) clearForm();
              }}
              hitSlop={10}
              style={styles.deleteBtn}
            >
              <MaterialIcons name="delete-outline" size={22} color="#f87171" />
            </TouchableOpacity>
          </View>
        ))}

        <View style={{ height: 16 }} />
      </ScrollView>

      {showPicker && (
        <DateTimePicker
          value={dueDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, d) => {
            if (Platform.OS === "android") {
              setShowPicker(false);
            }
            if (d) {
              setDueDate(d);
              setViewMonth(new Date(d.getFullYear(), d.getMonth(), 1));
            }
            if (Platform.OS === "ios") {
              setShowPicker(false);
            }
          }}
        />
      )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardRoot: {
    flex: 1
  },

  root: {
    flex: 1
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  // Increase minHeight to ensure text isn't cramped
    minHeight: 56,
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    paddingHorizontal: 4
  },

  headerTitleCompact: {
    fontSize: 15
  },

  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4
  },

  headerIconBtn: {
    padding: 4,
    marginLeft: 4
  },

  scroll: {
    flex: 1
  },

  scrollContent: {
    flexGrow: 1
  },

  inputStack: {
    marginBottom: 20
  },

  inputPill: {
    backgroundColor: "#111827",
    color: "#FFFFFF",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: INPUT_BORDER,
    marginBottom: 12,
    fontSize: 16,
    maxWidth: "100%"
  },

  inputMultiline: {
    minHeight: 88,
    maxHeight: 160,
    borderRadius: 22,
    paddingTop: 14
  },

  sectionLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    marginBottom: 12,
    fontWeight: "600"
  },

  priorityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 22
  },

  priorityOption: {
    alignItems: "center",
    flex: 1
  },

  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: ACCENT,
    marginBottom: 8
  },

  radioCircleSelected: {
    backgroundColor: ACCENT
  },

  priorityLabel: {
    color: "#FFFFFF",
    fontSize: 12,
    textAlign: "center"
  },

  priorityLabelCompact: {
    fontSize: 10
  },

  segmentRow: {
    flexDirection: "row",
    backgroundColor: "#1E293B",
    borderRadius: 18,
    padding: 6,
    marginBottom: 22
  },

  segmentButton: {
    flex: 1,
    paddingVertical: 11,
    paddingHorizontal: 2,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 0
  },

  segmentButtonCompact: {
    paddingVertical: 8
  },

  segmentButtonSelected: {
    backgroundColor: "#0f172a"
  },

  segmentText: {
    color: "#94A3B8",
    fontSize: 12,
    textAlign: "center"
  },

  segmentTextCompact: {
    fontSize: 10
  },

  segmentTextSelected: {
    color: ACCENT,
    fontWeight: "700"
  },

  dateCard: {
    backgroundColor: "#111827",
    borderRadius: 22,
    marginBottom: 22,
    maxWidth: "100%"
  },

  dateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14
  },

  dateMonth: {
    color: ACCENT,
    fontSize: 14,
    fontWeight: "700",
    flex: 1,
    marginRight: 8,
    minWidth: 0
  },

  dateMonthCompact: {
    fontSize: 12
  },

  dateNav: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },

  weekDays: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "nowrap"
  },

  weekDayText: {
    color: "#94B8FF",
    fontSize: 10,
    textAlign: "center"
  },

  dateRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "nowrap",
    marginBottom: 4
  },

  dateCell: {
    justifyContent: "center",
    alignItems: "center"
  },

  dateCellSelected: {
    backgroundColor: ACCENT,
    borderRadius: 10
  },

  dateNumber: {
    color: "#E2E8F0",
    fontSize: 14,
    fontWeight: "600"
  },

  dateNumberSmall: {
    fontSize: 11
  },

  dateNumberSelected: {
    color: "#FFFFFF"
  },

  openPickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
    paddingVertical: 8
  },

  openPickerText: {
    color: ACCENT,
    fontSize: 13,
    fontWeight: "600"
  },

  search: {
    backgroundColor: "#111827",
    borderRadius: 14,
    padding: 12,
    color: "#FFFFFF",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#263147"
  },

  listHeading: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10
  },

  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#1e293b",
    maxWidth: "100%"
  },

  taskRowDone: {
    opacity: 0.75
  },

  taskRowMain: {
    flex: 1,
    marginRight: 8,
    minWidth: 0
  },

  taskTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600"
  },

  taskTitleDone: {
    textDecorationLine: "line-through",
    color: "#94a3b8"
  },

  taskMeta: {
    color: "#7B88A2",
    fontSize: 12,
    marginTop: 4
  },

  deleteBtn: {
    marginLeft: 4,
    padding: 4
  }
});
