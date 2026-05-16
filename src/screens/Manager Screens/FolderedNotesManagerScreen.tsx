import React, { useCallback, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import { addFolder, getFolders, type Folder } from "../../db/folders";
import { deleteNote, getNotes, updateNoteFolder, type Note } from "../../db/notes";
import { CreateFolderSheet } from "../../components/CreateFolderSheet";

export default function FolderedNotesManagerScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [expandedFolderId, setExpandedFolderId] = useState<number | null>(null);
  const [folderSheetVisible, setFolderSheetVisible] = useState(false);

  const refresh = useCallback(() => {
    setFolders(getFolders());
    setNotes(getNotes());
  }, []);

  useFocusEffect(refresh);

  const grouped = useMemo(
    () =>
      folders
        .map((folder) => ({
          folder,
          items: notes.filter((note) => note.folderId === folder.id),
        })),
    [folders, notes]
  );

  const confirmDelete = (note: Note) => {
    Alert.alert("Delete note", `Remove "${note.title || "Untitled note"}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteNote(note.id);
          refresh();
        },
      },
    ]);
  };

  const handleCreateFolder = async (name: string) => {
    try {
      const folderId = await addFolder(name.trim(), "Notes");
      setExpandedFolderId(folderId);
      setFolderSheetVisible(false);
      refresh();
    } catch {
      Alert.alert("Folder error", "Could not create the folder.");
    }
  };

  const handleAddNote = (folder: Folder) => {
    const availableNotes = notes.filter((note) => note.folderId !== folder.id);
    if (availableNotes.length === 0) {
      Alert.alert("No notes available", "All notes are already inside this folder.");
      return;
    }

    Alert.alert("Add note to folder", folder.name, [
      ...availableNotes.slice(0, 8).map((note) => ({
        text: note.title || "Untitled note",
        onPress: () => {
          updateNoteFolder(note.id, folder.id);
          setExpandedFolderId(folder.id);
          refresh();
        },
      })),
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <CreateFolderSheet
        isVisible={folderSheetVisible}
        onClose={() => setFolderSheetVisible(false)}
        onCreate={handleCreateFolder}
        folders={folders}
      />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Foldered notes</Text>
        </View>
        <TouchableOpacity style={styles.headerButton} onPress={() => setFolderSheetVisible(true)}>
          <MaterialIcons name="create-new-folder" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 110 }}>
        {folders.length === 0 ? (
          <Text style={styles.emptyText}>No note folders yet. Create a folder from the notes manager.</Text>
        ) : (
          grouped.map(({ folder, items }) => (
            <View key={folder.id} style={styles.folderBlock}>
              <TouchableOpacity
                style={styles.folderHeader}
                activeOpacity={0.85}
                onPress={() => setExpandedFolderId((current) => current === folder.id ? null : folder.id)}
              >
                <MaterialIcons name={expandedFolderId === folder.id ? "folder-open" : "folder"} size={26} color="#58A6FF" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.folderName}>{folder.name}</Text>
                  <Text style={styles.folderCount}>{items.length} note{items.length === 1 ? "" : "s"}</Text>
                </View>
                <TouchableOpacity style={styles.folderActionButton} onPress={() => handleAddNote(folder)}>
                  <MaterialIcons name="add" size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <MaterialIcons name={expandedFolderId === folder.id ? "expand-less" : "expand-more"} size={22} color="#94A3B8" />
              </TouchableOpacity>

              {expandedFolderId === folder.id ? (
                items.length === 0 ? (
                  <Text style={styles.folderEmptyText}>This folder is empty and ready for notes.</Text>
                ) : (
                  items.map((note) => (
                    <View key={note.id} style={styles.card}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle}>{note.title || "Untitled note"}</Text>
                        <Text style={styles.cardSubtitle} numberOfLines={2}>{note.content || "No content"}</Text>
                      </View>
                      <TouchableOpacity onPress={() => navigation.navigate("NoteScreen", { noteId: note.id })} style={styles.iconButton}>
                        <MaterialIcons name="visibility" size={20} color="#FFFFFF" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => {
                        updateNoteFolder(note.id, null);
                        refresh();
                      }} style={styles.iconButton}>
                        <MaterialIcons name="folder-off" size={20} color="#FFFFFF" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => confirmDelete(note)} style={styles.iconButton}>
                        <MaterialIcons name="delete" size={20} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  ))
                )
              ) : null}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050816" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 8 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  headerButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#1F2A43", alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "#FFFFFF", fontSize: 24, fontWeight: "800" },
  folderBlock: { marginBottom: 18 },
  folderHeader: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#111827", borderRadius: 18, padding: 14, marginBottom: 10 },
  folderName: { color: "#58A6FF", fontSize: 16, fontWeight: "800" },
  folderCount: { color: "#94A3B8", fontSize: 12, marginTop: 3 },
  folderActionButton: { width: 34, height: 34, borderRadius: 12, backgroundColor: "#4B76E7", alignItems: "center", justifyContent: "center" },
  folderEmptyText: { color: "#94A3B8", backgroundColor: "#0B1220", borderRadius: 14, padding: 14, marginBottom: 10 },
  card: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#111827", borderRadius: 18, padding: 14, marginBottom: 10 },
  cardTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  cardSubtitle: { color: "#94A3B8", fontSize: 12, marginTop: 4 },
  iconButton: { width: 34, height: 34, borderRadius: 12, backgroundColor: "#1F2A43", alignItems: "center", justifyContent: "center" },
  emptyText: { color: "#94A3B8", textAlign: "center", marginTop: 80, lineHeight: 22 },
});
