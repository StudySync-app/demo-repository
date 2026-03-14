import React, { useState, useCallback } from "react";
import { View, Text, TextInput, Button, ScrollView, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { addFolder, getFolders, deleteFolder } from "../db/folders";

export default function FoldersScreen() {

  const [name, setName] = useState("");
  const [folders, setFolders] = useState<any[]>([]);

  const loadFolders = () => {
    const data = getFolders();
    setFolders(data);
  };

  const handleAddFolder = () => {
    if (!name.trim()) return;

    addFolder(name);
    setName("");

    loadFolders();
  };

  useFocusEffect(
    useCallback(() => {
      loadFolders();
    }, [])
  );

  return (
    <ScrollView style={styles.container}>

      <Text style={styles.title}>Folders</Text>

      <View style={styles.card}>

        <TextInput
          placeholder="Folder name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        <Button
          title="Create Folder"
          onPress={handleAddFolder}
        />

      </View>

      {folders.map((folder) => (

        <View key={folder.id} style={styles.folderCard}>

          <Text style={styles.folderName}>
            {folder.name}
          </Text>

          <Button
            title="Delete"
            onPress={() => {
              deleteFolder(folder.id);
              loadFolders();
            }}
          />

        </View>

      ))}

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f6f8"
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20
  },

  card: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8
  },

  folderCard: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2
  },

  folderName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6
  }

});