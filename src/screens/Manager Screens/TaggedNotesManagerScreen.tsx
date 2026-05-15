import React, { useCallback, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import { getNotes, type Note } from "../../db/notes";
import { getTaggedContentIds, toggleContentTag } from "../../db/tags";

export default function TaggedNotesManagerScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [notes, setNotes] = useState<Note[]>([]);
  const [ids, setIds] = useState<Set<number>>(new Set());

  const refresh = useCallback(() => {
    setNotes(getNotes());
    setIds(new Set(getTaggedContentIds("note")));
  }, []);

  useFocusEffect(refresh);

  const taggedNotes = useMemo(() => notes.filter((note) => ids.has(note.id)), [ids, notes]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tagged notes</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 110 }}>
        {taggedNotes.length === 0 ? (
          <Text style={styles.emptyText}>No tagged notes yet. Tap the bookmark icon on notes to tag them.</Text>
        ) : (
          taggedNotes.map((note) => (
            <View key={note.id} style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{note.title || "Untitled note"}</Text>
                <Text style={styles.cardSubtitle} numberOfLines={2}>{note.content || "No content"}</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate("NoteScreen", { noteId: note.id })} style={styles.iconButton}>
                <MaterialIcons name="visibility" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                toggleContentTag("note", note.id);
                refresh();
              }} style={styles.iconButton}>
                <MaterialIcons name="bookmark-remove" size={20} color="#FFFFFF" />
              </TouchableOpacity>
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
  card: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#111827", borderRadius: 18, padding: 14, marginBottom: 10 },
  cardTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  cardSubtitle: { color: "#94A3B8", fontSize: 12, marginTop: 4 },
  iconButton: { width: 34, height: 34, borderRadius: 12, backgroundColor: "#1F2A43", alignItems: "center", justifyContent: "center" },
  emptyText: { color: "#94A3B8", textAlign: "center", marginTop: 80, lineHeight: 22 },
});
