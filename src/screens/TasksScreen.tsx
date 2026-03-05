import React, { useState, useCallback } from "react";
import { Text, ScrollView, View, Button } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getTasks, deleteTask } from "../db/tasks";

export default function TasksScreen() {
  const [tasks, setTasks] = useState<any[]>([]);

  const loadTasks = () => {
    const data = getTasks();
    setTasks(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [])
  );

  return (
    <ScrollView>
      <Text>Tasks Screen</Text>

      {tasks.map((task) => (
        <View
          key={task.id}
          style={{ flexDirection: "row", alignItems: "center" }}
        >
          <Text style={{ flex: 1 }}>{task.title}</Text>

          <Button
            title="Delete"
            onPress={() => {
              deleteTask(task.id);
              loadTasks();
            }}
          />
        </View>
      ))}
    </ScrollView>
  );
}