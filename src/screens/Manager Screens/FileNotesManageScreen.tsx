import React, { useCallback, useState, useMemo } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  TextInput,
  Alert
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

// Assuming these are your DB/Store helpers for notes
import { deleteNote, getNotes, searchNotes, updateNoteFolder } from "../../db/notes"; 
import { addFolder, getFolders } from "../../db/folders";
import { isContentTagged, toggleContentTag } from "../../db/tags";
import NoteCard from "../../components/NoteCard"; 
import { CreateFolderSheet } from "../../components/CreateFolderSheet";

export default function FileNotesManagerScreen() {
  const navigation = useNavigation<any>();
const insets = useSafeAreaInsets();
  
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [query, setQuery] = useState("");
  const [folderSheetVisible, setFolderSheetVisible] = useState(false);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const data = query.trim() ? await searchNotes(query) : await getNotes();
      setNotes(data || []);
    } catch (error) {
      console.error("Failed to fetch notes:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [query])
  );

  // Filter notes based on archived status
  const displayedNotes = useMemo(() => {
    return notes.filter((note) => 
      showArchived ? note.isArchived : !note.isArchived
    );
  }, [notes, showArchived]);

  const handleDelete = (note: any) => {
    Alert.alert("Delete Note", `Remove "${note.title || "Untitled note"}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteNote(note.id);
          loadNotes();
        },
      },
    ]);
  };

  const handleToggleTag = (note: any) => {
    toggleContentTag("note", note.id);
    loadNotes();
  };

  const handleMoveToFolder = (note: any) => {
    const folders = getFolders();
    if (folders.length === 0) {
      Alert.alert("No folders yet", "Create a folder first, then move notes into it.");
      return;
    }

    Alert.alert("Move note to folder", note.title || "Untitled note", [
      ...folders.slice(0, 6).map((folder) => ({
        text: folder.name,
        onPress: () => {
          updateNoteFolder(note.id, folder.id);
          loadNotes();
        },
      })),
      {
        text: "Remove from folder",
        style: "destructive",
        onPress: () => {
          updateNoteFolder(note.id, null);
          loadNotes();
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleCreateFolder = async (name: string) => {
    try {
      await addFolder(name.trim(), "Notes");
      setFolderSheetVisible(false);
      navigation.navigate("FolderedNotesManager");
    } catch {
      Alert.alert("Folder error", "Could not create the folder.");
    }
  };

return (
    <View style={styles.container}>
      <CreateFolderSheet
        isVisible={folderSheetVisible}
        onClose={() => setFolderSheetVisible(false)}
        onCreate={handleCreateFolder}
        folders={getFolders()}
      />
      {/* Header matching Task Manager layout */}
      <View style={[styles.header, { paddingTop: insets.top + 15 }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {showArchived ? "Archived Notes" : "My Notes"}
          </Text>
        </View>
        
        <View style={styles.headerActions}>
          {/* Archive Toggle Button */}
          <TouchableOpacity 
            style={[styles.actionBtn, showArchived && styles.activeActionBtn]} 
            onPress={() => setShowArchived(!showArchived)}
          >
            <MaterialIcons 
              name={showArchived ? "book" : "archive"} 
              size={24} 
              color="#FFF" 
            />
          </TouchableOpacity>

          {/* Add Note Button */}
          {!showArchived && (
            <>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => setFolderSheetVisible(true)}
              >
                <MaterialIcons name="create-new-folder" size={24} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => navigation.navigate("NoteScreen")}
              >
                <MaterialIcons name="add" size={24} color="#FFF" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <View style={styles.searchWrap}>
        <MaterialIcons name="search" size={20} color="#94A3B8" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search notes by keyword"
          placeholderTextColor="#94A3B8"
          style={styles.searchInput}
        />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + 100 
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator color="#3b82f6" style={{ marginTop: 50 }} />
          ) : displayedNotes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons 
                name={showArchived ? "archive" : "description"} 
                size={48} 
                color="#1F2A43" 
              />
              <Text style={styles.emptyText}>
                {showArchived ? "No archived notes yet." : "No notes found in this folder."}
              </Text>
            </View>
          ) : (
            <>
              {displayedNotes.map((note) => (
                <NoteCard 
                  key={note.id}
                  title={note.title}
                  // NoteCard handles formatting of createdAt strings internally
                  date={note.createdAt || "November 25 Tue 12:00 AM"} 
                  onPress={() => navigation.navigate("NoteScreen", { noteId: note.id })}
                  onDelete={() => handleDelete(note)}
                  onTagPress={() => handleToggleTag(note)}
                  onFolderPress={() => handleMoveToFolder(note)}
                  tagged={isContentTagged("note", note.id)}
                />
              ))}

              <TouchableOpacity 
                style={styles.addNoteLabelBtn} 
                onPress={() => navigation.navigate("NoteScreen")}
              >
                <Text style={styles.addNoteText}>Add another note</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
</View>
);
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050816" }, // Preserving your deep navy background
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  headerTitle: { color: "#FFF", fontSize: 24, fontWeight: "700", marginLeft: 15 },
  headerActions: { flexDirection: "row", gap: 10 },
  actionBtn: { backgroundColor: "#1F2A43", padding: 8, borderRadius: 8 },
  activeActionBtn: { backgroundColor: "#4B76E7" },
  searchWrap: {
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: "#111827",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1F2A43",
    paddingHorizontal: 14,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: { flex: 1, color: "#FFFFFF", marginLeft: 10, fontSize: 15 },
  content: { paddingHorizontal: 20, paddingTop: 10 },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: "#94A3B8", textAlign: "center", marginTop: 12, fontSize: 16 },
  addNoteLabelBtn: {
    marginTop: 20,
    paddingVertical: 15,
    width: "100%",
    alignItems: "center",
  },
  addNoteText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
    opacity: 0.8,
},
});
