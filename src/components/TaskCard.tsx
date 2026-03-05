import React from "react";
import { View, Text, Button } from "react-native";

export default function TaskCard({ task, onDelete }: any) {
  return (
    <View
      style={{
        borderWidth: 2,
        borderColor: "black",
        padding: 15,
        marginVertical: 8,
        borderRadius: 10,
        backgroundColor: "#e5e5e5"
      }}
    >
      <Text style={{ fontSize: 16 }}>{task.title}</Text>

      <Button title="Delete" onPress={() => onDelete(task.id)} />
    </View>
  );
}