import React, { useCallback, useState, useMemo } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

// Assuming these are your DB/Store helpers for notes
import { getNotes } from "../../db/notes"; 
import NoteCard from "../../components/NoteCard"; 

export default function FileNotesManagerScreen() {
  const navigation = useNavigation<any>();
const insets = useSafeAreaInsets();
  
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const data = await getNotes();
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
    }, [])
  );

  // Filter notes based on archived status
  const displayedNotes = useMemo(() => {
    return notes.filter((note) => 
      showArchived ? note.isArchived : !note.isArchived
    );
  }, [notes, showArchived]);

return (
    <View style={styles.container}>
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
            <TouchableOpacity 
              style={styles.actionBtn} 
              onPress={() => navigation.navigate("NoteScreen")}
            >
              <MaterialIcons name="add" size={24} color="#FFF" />
            </TouchableOpacity>
          )}
        </View>
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