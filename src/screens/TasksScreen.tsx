import React, { useCallback, useState } from "react";
import { Text, View, FlatList, Button, TextInput, StyleSheet } from "react-native";
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

      <Button
        title="New Task"
        onPress={() => navigation.navigate("NewTask")}
      />

      {/* Search Bar */}
      <TextInput
        placeholder="Search tasks..."
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />

      {/* My Tasks */}
      <Text style={styles.sectionTitle}>
        My Tasks
      </Text>

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
            refresh={loadTasks}
          />
        )}
      />

      {/* Completed Tasks */}
      <Text style={styles.sectionTitle}>
        Completed Tasks
      </Text>

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
    paddingTop: 10
  },

  title: {
    fontSize: 22,
    margin: 10,
    fontWeight: "bold"
  },

  search: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 10,
    marginTop: 10
  },

  sectionTitle: {
    margin: 10,
    fontSize: 16,
    fontWeight: "600"
  }

});