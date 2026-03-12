import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { addTask } from "../db/tasks";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function NewTaskScreen({ navigation }: any) {

  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("normal");
  const [dueDate, setDueDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const saveTask = () => {
  if (!title.trim()) return;

  addTask(title, priority, dueDate.toISOString());

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
        <Text style={styles.option} onPress={() => setPriority("low")}>Low</Text>
        <Text style={styles.option} onPress={() => setPriority("normal")}>Normal</Text>
        <Text style={styles.option} onPress={() => setPriority("high")}>High</Text>
      </View>
    
    <Text style={styles.label}>Due Date</Text>

        <Button
        title={dueDate.toDateString()}
        onPress={() => setShowPicker(true)}
        />

        {showPicker && (
        <DateTimePicker
            value={dueDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
            setShowPicker(false);
            if (selectedDate) setDueDate(selectedDate);
            }}
        />
        )}
        
      <Button title="Save Task" onPress={saveTask} />

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 20
  },

  label: {
    fontSize: 16,
    marginBottom: 6
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 20
  },

  row: {
    flexDirection: "row",
    marginBottom: 20
  },

  option: {
    marginRight: 15,
    color: "#007AFF",
    fontWeight: "600"
  }

});