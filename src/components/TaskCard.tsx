import React from "react";
import { View, Text, Button, StyleSheet, Switch } from "react-native";
import {
  toggleTaskCompleted,
  updateTaskPriority,
  updateTaskStatus
} from "../db/tasks";
import { COLORS, RADIUS } from "../constants/theme";

export default function TaskCard({ task, onDelete, refresh }: any) {

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

      <View style={{ flex: 1 }}>

        {/* Task Title */}
        <Text
          style={[
            styles.title,
            task.completed && styles.completed
          ]}
        >
          {task.title}
        </Text>

        {/* Priority Badge */}
        <Text
          style={[
            styles.priorityBadge,
            task.priority === "high" && styles.urgent,
            task.priority === "normal" && styles.important,
            task.priority === "low" && styles.minor
          ]}
        >
          {task.priority === "high"
            ? "URGENT"
            : task.priority === "normal"
            ? "IMPORTANT"
            : "MINOR"}
        </Text>

        {/* Status */}
        <Text style={styles.meta}>
          Status: {task.status || "todo"}
        </Text>

        {/* Due Date */}
        <Text style={styles.meta}>
          Due: {task.dueDate ? new Date(task.dueDate).toDateString() : "No date"}
        </Text>

        {/* Priority buttons */}
        <View style={styles.priorityRow}>

          <Text
            style={styles.priorityBtn}
            onPress={() => changePriority("low")}
          >
            Low
          </Text>

          <Text
            style={styles.priorityBtn}
            onPress={() => changePriority("normal")}
          >
            Normal
          </Text>

          <Text
            style={styles.priorityBtn}
            onPress={() => changePriority("high")}
          >
            High
          </Text>

        </View>

        {/* Status buttons */}
        <View style={styles.statusRow}>

          <Text
            style={styles.statusBtn}
            onPress={() => {
              updateTaskStatus(task.id, "todo");
              refresh();
            }}
          >
            Todo
          </Text>

          <Text
            style={styles.statusBtn}
            onPress={() => {
              updateTaskStatus(task.id, "progress");
              refresh();
            }}
          >
            Progress
          </Text>

          <Text
            style={styles.statusBtn}
            onPress={() => {
              updateTaskStatus(task.id, "done");
              refresh();
            }}
          >
            Done
          </Text>

        </View>

      </View>

      {/* Toggle Complete */}
      <Switch
        value={!!task.completed}
        onValueChange={handleToggle}
      />

      {/* Delete Button */}
      <Button
        title="Delete"
        onPress={() => {
          onDelete(task.id);
          refresh();
        }}
      />

    </View>
  );
}

const styles = StyleSheet.create({

  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.card,
    elevation: 3
  },

  title: {
    fontSize: 17,
    fontWeight: "600",
    color: COLORS.text
  },

  completed: {
    textDecorationLine: "line-through",
    color: "#888"
  },

  meta: {
    fontSize: 12,
    color: COLORS.subtext,
    marginTop: 4
  },

  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    fontSize: 12,
    color: "#fff",
    alignSelf: "flex-start",
    marginTop: 6
  },

  urgent: {
    backgroundColor: COLORS.urgent
  },

  important: {
    backgroundColor: COLORS.important
  },

  minor: {
    backgroundColor: COLORS.minor
  },

  priorityRow: {
    flexDirection: "row",
    marginTop: 8
  },

  priorityBtn: {
    marginRight: 10,
    color: COLORS.primary,
    fontWeight: "500"
  },

  statusRow: {
    flexDirection: "row",
    marginTop: 6
  },

  statusBtn: {
    marginRight: 10,
    color: "#FF9500",
    fontWeight: "500"
  }

});