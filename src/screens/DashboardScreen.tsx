import React, { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import { addTask } from "../db/tasks";

export default function DashboardScreen() {
  const [title, setTitle] = useState("");

  const handleAddTask = () => {
    if (!title.trim()) return;

    addTask(title);
    setTitle("");
  };

  return (
    <View>
      <Text>Dashboard Screen</Text>

      <TextInput
        placeholder="Enter a task"
        value={title}
        onChangeText={setTitle}
        style={{
          borderWidth: 1,
          padding: 10,
          marginVertical: 10,
        }}
      />

      <Button title="Add Task" onPress={handleAddTask} />
    </View>
  );
}