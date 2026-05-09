import React, { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";

import { addFolder, deleteFolder, getFolders } from "../db/folders";

export default function FoldersScreen() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("General");
  const [folders, setFolders] = useState<any[]>([]);

  const loadFolders = useCallback(() => {
    setFolders(getFolders());
  }, []);

  const handleAddFolder = async () => {
    if (!name.trim()) return;
    await addFolder(name.trim(), category.trim() || "General");
    setName("");
    setCategory("General");
    loadFolders();
  };

  const handleDelete = (id: number) => {
    Alert.alert("Delete Folder", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteFolder(id);
          loadFolders();
        },
      },
    ]);
  };

  useFocusEffect(
    useCallback(() => {
      loadFolders();
    }, [loadFolders])
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Your Folders</Text>

      <View style={styles.card}>
        <TextInput placeholder="Folder name" placeholderTextColor="#94A3B8" value={name} onChangeText={setName} style={styles.input} />
        <TextInput placeholder="Category" placeholderTextColor="#94A3B8" value={category} onChangeText={setCategory} style={styles.input} />
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
            <MaterialIcons name="delete-outline" size={24} color="#ef4444" />
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050816", padding: 24, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: "bold", color: "#ffffff", marginBottom: 24 },
  card: { backgroundColor: "#1A2535", padding: 16, borderRadius: 16, marginBottom: 24 },
  input: { backgroundColor: "#0F172A", borderWidth: 1, borderColor: "#334155", color: "#fff", padding: 12, borderRadius: 12, marginBottom: 12, fontSize: 16 },
  createBtn: { backgroundColor: "#3b82f6", height: 48, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  createBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  folderCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#1A2535", padding: 18, borderRadius: 16, marginBottom: 12 },
  folderName: { fontSize: 17, fontWeight: "600", color: "#ffffff" },
  folderCategory: { fontSize: 12, color: "#A3AED0", marginTop: 2 },
});
