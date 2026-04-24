import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

import { addTask, updateTask } from "../db/tasks";
import { getFolders } from "../db/folders";
import { getTags, attachTag } from "../db/tags";
import { scheduleTaskReminder } from "../lib/notification";

export default function NewTaskScreen({ navigation, route }: any) {

  const editingTask = route?.params?.task;

  const [title, setTitle] = useState(editingTask?.title || "");
  const [description, setDescription] = useState(editingTask?.description || "");
  const [priority, setPriority] = useState(editingTask?.priority || "normal");
  const [progress, setProgress] = useState(editingTask?.progress || "todo");
  const [dueDate, setDueDate] = useState(
    editingTask?.dueDate ? new Date(editingTask.dueDate) : new Date()
  );

  const [showPicker, setShowPicker] = useState(false);

  const [folders, setFolders] = useState<any[]>([]);
  const [folderId, setFolderId] = useState<number | null>(
    editingTask?.folderId || null
  );

  const [tags, setTags] = useState<any[]>([]);
  const [selectedTag, setSelectedTag] = useState<number | null>(null);

  useEffect(() => {
    setFolders(getFolders());
    setTags(getTags());
  }, []);

  const saveTask = async () => {
    if (!title.trim()) return;

    let taskId;

    if (editingTask) {
      updateTask(
        editingTask.id,
        title,
        priority,
        dueDate.toISOString()
      );
      taskId = editingTask.id;
    } else {
      taskId = addTask(
        title,
        priority,
        dueDate.toISOString(),
        folderId
      );
    }

    if (selectedTag) {
      attachTag("task", taskId, selectedTag);
    }

    // SAFE reminder
    try {
      await scheduleTaskReminder(title, dueDate);
    } catch {
      console.log("Reminder not supported in Expo Go");
    }

    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <View style={styles.topIcon} />
        <View style={styles.topIconActive} />
      </View>

      <Text style={styles.screenTitle}>Set your to-do</Text>

      <View style={styles.inputCard}>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Title"
          placeholderTextColor="#7B88A2"
        />
        <TextInput
          style={[styles.input, styles.descriptionInput]}
          value={description}
          onChangeText={setDescription}
          placeholder="Description"
          placeholderTextColor="#7B88A2"
          multiline
          numberOfLines={4}
        />
      </View>

      <Text style={styles.sectionLabel}>Priority status</Text>
      <View style={styles.priorityRow}>
        {[
          { key: "urgent", label: "Urgent" },
          { key: "important", label: "Important" },
          { key: "minor", label: "Minor" }
        ].map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.priorityOption}
            onPress={() => setPriority(item.key)}
          >
            <View
              style={[
                styles.radioCircle,
                priority === item.key && styles.radioCircleSelected
              ]}
            />
            <Text style={styles.priorityLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Progress status</Text>
      <View style={styles.segmentRow}>
        {[
          { key: "todo", label: "To get done" },
          { key: "ongoing", label: "Ongoing" },
          { key: "paused", label: "Paused" }
        ].map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[
              styles.segmentButton,
              progress === item.key && styles.segmentButtonSelected
            ]}
            onPress={() => setProgress(item.key)}
          >
            <Text
              style={[
                styles.segmentText,
                progress === item.key && styles.segmentTextSelected
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Select Due Date</Text>
      <TouchableOpacity
        style={styles.dateCard}
        onPress={() => setShowPicker(true)}
        activeOpacity={0.9}
      >
        <View style={styles.dateHeader}>
          <Text style={styles.dateMonth}>
            {dueDate.toLocaleString("default", { month: "long" }).toUpperCase()} {dueDate.getFullYear()}
          </Text>
          <View style={styles.dateNav}>
            <View style={styles.navDot} />
            <View style={styles.navDot} />
          </View>
        </View>
        <View style={styles.weekDays}>
          {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day) => (
            <Text key={day} style={styles.weekDayText}>{day}</Text>
          ))}
        </View>
        <View style={styles.dateRow}>
          {Array.from({ length: 7 }).map((_, index) => {
            const dateNumber = 15 + index;
            const selected = dateNumber === 18;
            return (
              <View
                key={dateNumber}
                style={[styles.dateCircle, selected && styles.dateCircleSelected]}
              >
                <Text style={[styles.dateNumber, selected && styles.dateNumberSelected]}>
                  {dateNumber}
                </Text>
              </View>
            );
          })}
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.saveBtn} onPress={saveTask}>
        <Text style={styles.saveText}>
          {editingTask ? "Update Task" : "Save Task"}
        </Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={dueDate}
          mode="date"
          onChange={(e, d) => {
            setShowPicker(false);
            if (d) setDueDate(d);
          }}
          display="calendar"
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A"
  },

  content: {
    padding: 20,
    paddingBottom: 40
  },

  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24
  },

  topIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#1E2A38"
  },

  topIconActive: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#3C61A4"
  },

  screenTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24
  },

  inputCard: {
    backgroundColor: "#111827",
    borderRadius: 24,
    padding: 18,
    marginBottom: 24
  },

  input: {
    backgroundColor: "#0F172A",
    color: "#FFFFFF",
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#263147",
    marginBottom: 16
  },

  descriptionInput: {
    minHeight: 100,
    textAlignVertical: "top"
  },

  sectionLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    marginBottom: 14,
    fontWeight: "600"
  },

  priorityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24
  },

  priorityOption: {
    alignItems: "center",
    flex: 1
  },

  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#4B76E7",
    marginBottom: 8
  },

  radioCircleSelected: {
    backgroundColor: "#4B76E7"
  },

  priorityLabel: {
    color: "#FFFFFF",
    fontSize: 12
  },

  segmentRow: {
    flexDirection: "row",
    backgroundColor: "#1E2A38",
    borderRadius: 18,
    padding: 6,
    marginBottom: 24
  },

  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center"
  },

  segmentButtonSelected: {
    backgroundColor: "#111827"
  },

  segmentText: {
    color: "#FFFFFF",
    fontSize: 13
  },

  segmentTextSelected: {
    color: "#4B76E7",
    fontWeight: "700"
  },

  dateCard: {
    backgroundColor: "#111827",
    borderRadius: 24,
    padding: 18,
    marginBottom: 32
  },

  dateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18
  },

  dateMonth: {
    color: "#4B76E7",
    fontSize: 14,
    fontWeight: "700"
  },

  dateNav: {
    flexDirection: "row",
    gap: 6
  },

  navDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1E2A38"
  },

  weekDays: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14
  },

  weekDayText: {
    color: "#7B88A2",
    fontSize: 11,
    width: 30,
    textAlign: "center"
  },

  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },

  dateCircle: {
    width: 38,
    height: 38,
    borderRadius: 20,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center"
  },

  dateCircleSelected: {
    backgroundColor: "#4B76E7"
  },

  dateNumber: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600"
  },

  dateNumberSelected: {
    color: "#0F172A"
  },

  saveBtn: {
    backgroundColor: "#4B76E7",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center"
  },

  saveText: {
    color: "#FFFFFF",
    fontWeight: "700"
  }
});