import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity
} from "react-native";

import {
  toggleTaskCompleted,
  updateTaskPriority
} from "../db/tasks";

import { COLORS, RADIUS } from "../constants/theme";
import { shareContent } from "../lib/share";

export default function TaskCard({ task, onDelete, onEdit, refresh }: any) {

  const handleToggle = (value: boolean) => {
    toggleTaskCompleted(task.id, value);
    refresh();
  };

  const changePriority = (priority: string) => {
    updateTaskPriority(task.id, priority);
    refresh();
  };

  return (
    <View style={styles.card}>

      {/* LEFT CONTENT */}
      <View style={{ flex: 1 }}>

        {/* TITLE */}
        <Text
          style={[
            styles.title,
            task.completed && styles.completed
          ]}
        >
          {task.title}
        </Text>

        {/* PRIORITY BADGE */}
        <View
          style={[
            styles.badge,
            task.priority === "high" && styles.high,
            task.priority === "normal" && styles.normal,
            task.priority === "low" && styles.low
          ]}
        >
          <Text style={styles.badgeText}>
            {task.priority?.toUpperCase()}
          </Text>
        </View>

        {/* META */}
        <Text style={styles.meta}>
          Due: {task.dueDate
            ? new Date(task.dueDate).toDateString()
            : "No date"}
        </Text>

        <Text style={styles.meta}>
          Folder: {task.folderId ?? "None"}
        </Text>

        {/* PRIORITY SELECT */}
        <View style={styles.row}>
          {["low", "normal", "high"].map((p) => (
            <TouchableOpacity
              key={p}
              style={[
                styles.smallBtn,
                task.priority === p && styles.selectedBtn
              ]}
              onPress={() => changePriority(p)}
            >
              <Text
                style={[
                  styles.smallBtnText,
                  task.priority === p && styles.selectedText
                ]}
              >
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

      </View>

      {/* RIGHT SIDE */}
      <View style={styles.actions}>

        <Switch
          value={!!task.completed}
          onValueChange={handleToggle}
        />

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => {
            onDelete(task.id);
            refresh();
          }}
        >
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onEdit}>
  <Text style={{ color: "#4A90E2", fontSize: 16 }}>✏️</Text>
</TouchableOpacity>

        <TouchableOpacity
          style={styles.shareBtn}
          onPress={() =>
            shareContent(
              task.title,
              `Priority: ${task.priority}`
            )
          }
        >
          <Text style={styles.shareText}>Share</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({

  /* CARD */
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 14,
    backgroundColor: "#fff",
    elevation: 3
  },

  /* TITLE */
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
    marginBottom: 6
  },

  completed: {
    textDecorationLine: "line-through",
    color: "#999"
  },

  /* META */
  meta: {
    fontSize: 12,
    color: "#777",
    marginBottom: 6
  },

  /* BADGE */
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 6
  },

  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600"
  },

  high: {
    backgroundColor: "#FF3B30" // red
  },

  normal: {
    backgroundColor: "#FF9500" // orange
  },

  low: {
    backgroundColor: "#34C759" // green
  },

  /* ROW */
  row: {
    flexDirection: "row",
    marginTop: 6
  },

  /* SMALL BUTTONS */
  smallBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    marginRight: 8
  },

  smallBtnText: {
    fontSize: 12,
    color: "#333"
  },

  selectedBtn: {
    backgroundColor: COLORS.primary
  },

  selectedText: {
    color: "#fff"
  },

  /* ACTIONS */
  actions: {
    alignItems: "center",
    justifyContent: "space-between"
  },

  deleteBtn: {
    backgroundColor: "#007AFF",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginTop: 8
  },

  deleteText: {
    color: "#fff",
    fontSize: 12
  },

  shareBtn: {
    backgroundColor: "#5856D6",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginTop: 6
  },

  shareText: {
    color: "#fff",
    fontSize: 12
  }

});