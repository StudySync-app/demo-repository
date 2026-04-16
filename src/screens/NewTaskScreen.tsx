import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

import { addTask, updateTask } from "../db/tasks";
import { getFolders } from "../db/folders";
import { getTags, attachTag } from "../db/tags";
import { scheduleTaskReminder } from "../lib/notification";

export default function NewTaskScreen({ navigation, route }: any) {

  const editingTask = route?.params?.task;

  const [title, setTitle] = useState(editingTask?.title || "");
  const [priority, setPriority] = useState(editingTask?.priority || "normal");
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
    <View style={styles.container}>

      <Text style={styles.label}>Task Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Enter task title"
      />

      <Text style={styles.label}>Priority</Text>
      <View style={styles.row}>
        {["low", "normal", "high"].map((p) => (
          <TouchableOpacity
            key={p}
            style={[
              styles.option,
              priority === p && styles.selected
            ]}
            onPress={() => setPriority(p)}
          >
            <Text style={styles.optionText}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Due Date</Text>
      <TouchableOpacity onPress={() => setShowPicker(true)}>
        <Text style={{ color: "#007AFF" }}>
          {dueDate.toDateString()}
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
        />
      )}

      <TouchableOpacity style={styles.saveBtn} onPress={saveTask}>
        <Text style={{ color: "#fff" }}>
          {editingTask ? "Update Task" : "Save Task"}
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#0F172A"
  },

  label: {
    color: "#fff",
    marginBottom: 6
  },

  input: {
    backgroundColor: "#1E2A38",
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    color: "#fff"
  },

  row: {
    flexDirection: "row",
    marginBottom: 16
  },

  option: {
    padding: 10,
    backgroundColor: "#1E2A38",
    borderRadius: 8,
    marginRight: 8
  },

  selected: {
    backgroundColor: "#007AFF"
  },

  optionText: {
    color: "#fff"
  },

  saveBtn: {
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20
  }
});