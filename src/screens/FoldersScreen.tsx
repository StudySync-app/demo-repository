import React, { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";

import { addFolder, deleteFolder, getFolders } from "../db/folders";
import { useAppSettings } from "../settings/AppSettingsContext";

export default function FoldersScreen() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("General");
  const [folders, setFolders] = useState<any[]>([]);
  const { isLight, textScale } = useAppSettings();

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
    <ScrollView style={[styles.container, isLight && styles.lightContainer]} showsVerticalScrollIndicator={false}>
      <Text style={[styles.title, isLight && styles.lightText, { fontSize: 28 * textScale }]}>Your Folders</Text>

      <View style={[styles.card, isLight && styles.lightCard]}>
        <TextInput placeholder="Folder name" placeholderTextColor="#94A3B8" value={name} onChangeText={setName} style={[styles.input, isLight && styles.lightInput]} />
        <TextInput placeholder="Category" placeholderTextColor="#94A3B8" value={category} onChangeText={setCategory} style={[styles.input, isLight && styles.lightInput]} />
        <TouchableOpacity style={styles.createBtn} onPress={handleAddFolder}>
          <Text style={styles.createBtnText}>Create Folder</Text>
        </TouchableOpacity>
      </View>

      {folders.map((folder) => (
        <View key={folder.id} style={[styles.folderCard, isLight && styles.lightCard]}>
          <View>
            <Text style={[styles.folderName, isLight && styles.lightText]}>{folder.name}</Text>
            <Text style={[styles.folderCategory, isLight && styles.lightMuted]}>{folder.category || "General"}</Text>
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
  lightContainer: { backgroundColor: "#F4F7FB" },
  title: { fontSize: 28, fontWeight: "bold", color: "#ffffff", marginBottom: 24 },
  lightText: { color: "#0F172A" },
  lightMuted: { color: "#64748B" },
  card: { backgroundColor: "#1A2535", padding: 16, borderRadius: 16, marginBottom: 24 },
  lightCard: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#DBE4F0" },
  input: { backgroundColor: "#0F172A", borderWidth: 1, borderColor: "#334155", color: "#fff", padding: 12, borderRadius: 12, marginBottom: 12, fontSize: 16 },
  lightInput: { backgroundColor: "#FFFFFF", borderColor: "#DBE4F0", color: "#0F172A" },
  createBtn: { backgroundColor: "#3b82f6", height: 48, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  createBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  folderCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#1A2535", padding: 18, borderRadius: 16, marginBottom: 12 },
  folderName: { fontSize: 17, fontWeight: "600", color: "#ffffff" },
  folderCategory: { fontSize: 12, color: "#A3AED0", marginTop: 2 },
});
