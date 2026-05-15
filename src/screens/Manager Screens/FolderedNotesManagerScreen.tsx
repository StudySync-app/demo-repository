import React, { useCallback, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import { getFolders, type Folder } from "../../db/folders";
import { deleteNote, getNotes, updateNoteFolder, type Note } from "../../db/notes";

export default function FolderedNotesManagerScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

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
        }))
        .filter((group) => group.items.length > 0),
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

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Foldered notes</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 110 }}>
        {grouped.length === 0 ? (
          <Text style={styles.emptyText}>No notes are inside folders yet. Use the folder button on a note to move it here.</Text>
        ) : (
          grouped.map(({ folder, items }) => (
            <View key={folder.id} style={styles.folderBlock}>
              <Text style={styles.folderName}>{folder.name}</Text>
              {items.map((note) => (
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
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050816" },
  header: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 20, paddingBottom: 8 },
  headerTitle: { color: "#FFFFFF", fontSize: 24, fontWeight: "800" },
  folderBlock: { marginBottom: 18 },
  folderName: { color: "#58A6FF", fontSize: 16, fontWeight: "800", marginBottom: 10 },
  card: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#111827", borderRadius: 18, padding: 14, marginBottom: 10 },
  cardTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  cardSubtitle: { color: "#94A3B8", fontSize: 12, marginTop: 4 },
  iconButton: { width: 34, height: 34, borderRadius: 12, backgroundColor: "#1F2A43", alignItems: "center", justifyContent: "center" },
  emptyText: { color: "#94A3B8", textAlign: "center", marginTop: 80, lineHeight: 22 },
});
