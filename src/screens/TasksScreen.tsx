import React, { useCallback } from "react";
import { Text, View, FlatList, Button } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import TaskCard from "../components/TaskCard";
import { deleteTask } from "../db/tasks";
import { useTaskStore } from "../store/useTaskStore";

export default function TasksScreen({ navigation }: any) {

  const { tasks, loadTasks } = useTaskStore();

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [])
  );

  const activeTasks = tasks.filter((t: any) => !t.completed);
  const completedTasks = tasks.filter((t: any) => t.completed);

  return (
    <View style={{ flex: 1 }}>

      <Text style={{ fontSize: 22, margin: 10 }}>Tasks</Text>

      <Button
        title="New Task"
        onPress={() => navigation.navigate("NewTask")}
      />

      {/* My Tasks */}
      <Text style={{ margin: 10, fontSize: 16, fontWeight: "600" }}>
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
      <Text style={{ margin: 10, fontSize: 16, fontWeight: "600" }}>
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