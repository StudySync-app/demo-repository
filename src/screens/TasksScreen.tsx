import React, { useCallback, useState } from "react";
import {
  Text,
  View,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import TaskCard from "../components/TaskCard";
import { deleteTask } from "../db/tasks";
import { useTaskStore } from "../store/useTaskStore";

export default function TasksScreen({ navigation }: any) {

  const { tasks, loadTasks } = useTaskStore();
  const [search, setSearch] = useState("");

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [])
  );

  const filteredTasks = tasks.filter((task: any) =>
    task.title.toLowerCase().includes(search.toLowerCase())
  );

  const activeTasks = filteredTasks.filter((t: any) => !t.completed);
  const completedTasks = filteredTasks.filter((t: any) => t.completed);

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Tasks</Text>

      <TouchableOpacity
        style={styles.newBtn}
        onPress={() => navigation.navigate("NewTask")}
      >
        <Text style={styles.newText}>+ New Task</Text>
      </TouchableOpacity>

      <TextInput
        placeholder="Search tasks..."
        placeholderTextColor="#fff"
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />

      <Text style={styles.sectionTitle}>My Tasks</Text>

      <FlatList
        data={activeTasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onDelete={(id: number) => {
              deleteTask(id);
              loadTasks();
            }}
            onEdit={() => navigation.navigate("NewTask", { task: item })}
            refresh={loadTasks}
          />
        )}
      />

      <Text style={styles.sectionTitle}>Completed Tasks</Text>

      <FlatList
        data={completedTasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onDelete={(id: number) => {
              deleteTask(id);
              loadTasks();
            }}
            onEdit={() => navigation.navigate("NewTask", { task: item })}
            refresh={loadTasks}
          />
        )}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#0F172A"
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 10
  },

  newBtn: {
    backgroundColor: "#1E2A38",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12
  },

  newText: {
    color: "#fff",
    fontWeight: "600"
  },

  search: {
    backgroundColor: "#1E2A38",
    borderRadius: 10,
    padding: 10,
    color: "#fff",
    marginBottom: 12
  },

  sectionTitle: {
    color: "#fff",
    marginVertical: 8,
    fontWeight: "600"
  }
});