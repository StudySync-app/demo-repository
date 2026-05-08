import React, { useState, useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialIcons as IconMat } from '@expo/vector-icons';

// Assuming your db functions are now async-friendly
import { addFolder, getFolders, deleteFolder } from "../db/folders";
export default function FoldersScreen() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("General"); // Default category
  const [folders, setFolders] = useState<any[]>([]);

  const loadFolders = async () => {
    try {
      const data = await getFolders();
      setFolders(data || []);
    } catch (error) {
      console.error("Failed to load folders:", error);
    }
  };

  const handleAddFolder = async () => {
    if (!name.trim()) return;

// @ts-ignore - TEMP FIX: classmate will fix properly
addFolder(name, "temporary");     setName("");

  const handleDelete = async (id: number) => {
    Alert.alert("Delete Folder", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive", 
        onPress: async () => {
          await deleteFolder(id);
          loadFolders();
        } 
      }
    ]);
  };

  useFocusEffect(
    useCallback(() => {
      loadFolders();
    }, [])
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Your Folders</Text>

      <View style={styles.card}>
        <TextInput
          placeholder="Folder name"
          placeholderTextColor="#52525b"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        
        <TouchableOpacity style={styles.createBtn} onPress={handleAddFolder}>
          <Text style={styles.createBtnText}>Create Folder</Text>
        </TouchableOpacity>
      </View>

      {folders.map((folder) => (
        <View key={folder.id} style={styles.folderCard}>
          <View>
            <Text style={styles.folderName}>{folder.name}</Text>
            <Text style={styles.folderCategory}>{folder.category || "General"}</Text>
          </View>

          <TouchableOpacity onPress={() => handleDelete(folder.id)}>
            <IconMat name="delete-outline" size={24} color="#ef4444" />
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000", // Dark mode
    padding: 24,
    paddingTop: 60
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 24
  },
  card: {
    backgroundColor: "#0a0a0a",
    borderWidth: 1,
    borderColor: "#27272a",
    padding: 16,
    borderRadius: 16,
    marginBottom: 24
  },
  input: {
    backgroundColor: "#000000",
    borderWidth: 1,
    borderColor: "#27272a",
    color: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    fontSize: 16
  },
  createBtn: {
    backgroundColor: "#3b82f6",
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center"
  },
  createBtnText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 16
  },
  folderCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0a0a0a",
    borderWidth: 1,
    borderColor: "#27272a",
    padding: 18,
    borderRadius: 16,
    marginBottom: 12
  },
  folderName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#ffffff"
  },
  folderCategory: {
    fontSize: 12,
    color: "#71717a",
    marginTop: 2
  }
});
}